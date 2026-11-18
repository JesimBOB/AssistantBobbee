// Import de l'organigramme depuis le board Klaxoon : export PDF, ou export
// navigateur produit par scripts/klaxoon-export.js (fichier .json).
//
// Usage : node scripts/import-organigramme.mjs "<chemin du PDF ou du .json>"
//
// Produit data/organigramme.json (lu par le site) et data/organigramme.csv
// (version lisible), puis affiche les changements par rapport à la version
// précédente. Aucune dépendance : seulement les modules natifs de Node.

import fs from "node:fs";
import path from "node:path";
import zlib from "node:zlib";

const ROOT = path.resolve(import.meta.dirname, "..");
const JSON_PATH = path.join(ROOT, "data", "organigramme.json");
const CSV_PATH = path.join(ROOT, "data", "organigramme.csv");

const pdfPath = process.argv[2];
if (!pdfPath) {
  console.error('Usage : node scripts/import-organigramme.mjs "<chemin du PDF ou du .json>"');
  process.exit(1);
}

const clean = (text) => text.replace(/[​ ]/g, " ").replace(/\s+/g, " ").trim();

// ---------- Lecture d'un export navigateur (scripts/klaxoon-export.js) ----------

// Les coordonnées écran ont l'axe vertical vers le bas : on l'inverse pour
// retrouver la convention du PDF (un titre de pôle est « au-dessus » de ses cartes).
function readBrowserBoard(filePath) {
  const exported = JSON.parse(fs.readFileSync(filePath, "utf8"));
  if (!Array.isArray(exported.headers) || !Array.isArray(exported.cards) || !Array.isArray(exported.labels)) {
    throw new Error("Export navigateur invalide : headers, cards et labels sont attendus.");
  }
  return {
    exportDate: exported.exportedAt,
    headers: exported.headers.map((header) => ({ name: clean(header.name), x: header.x, y: -header.y })),
    cards: exported.cards.map((card) => ({ name: clean(card.name), role: clean(card.role), x: card.x, y: -card.y })),
    labels: exported.labels.map((label) => ({ texts: label.texts.map(clean), x: label.x, y: -label.y })),
  };
}

// ---------- Lecture du PDF ----------
function readPdfBoard() {

const data = fs.readFileSync(pdfPath).toString("latin1");
const objects = new Map();
for (const match of data.matchAll(/(\d+) 0 obj([\s\S]*?)endobj/g)) {
  objects.set(Number(match[1]), match[2]);
}

function dictPart(id) {
  return objects.get(id).split("stream")[0];
}

function streamOf(id) {
  const body = objects.get(id);
  const match = /stream\r?\n([\s\S]*)endstream/.exec(body);
  if (!match) return "";
  const raw = Buffer.from(match[1], "latin1");
  try {
    return zlib.inflateSync(raw, { finishFlush: zlib.constants.Z_SYNC_FLUSH }).toString("latin1");
  } catch {
    return match[1];
  }
}

function subDict(dict, key) {
  const start = dict.indexOf(`/${key}`);
  if (start < 0) return "";
  const open = dict.indexOf("<<", start);
  let depth = 0;
  for (let i = open; i < dict.length; i += 1) {
    if (dict.startsWith("<<", i)) {
      depth += 1;
      i += 1;
    } else if (dict.startsWith(">>", i)) {
      depth -= 1;
      i += 1;
      if (depth === 0) return dict.slice(open, i + 1);
    }
  }
  return "";
}

function refs(dict) {
  const result = {};
  for (const match of dict.matchAll(/\/(\w+)\s+(\d+) 0 R/g)) {
    result[match[1]] = Number(match[2]);
  }
  return result;
}

const cmapCache = new Map();
function cmapOf(fontId) {
  if (cmapCache.has(fontId)) return cmapCache.get(fontId);
  const map = new Map();
  const toUnicode = /\/ToUnicode (\d+) 0 R/.exec(dictPart(fontId));
  if (toUnicode) {
    const text = streamOf(Number(toUnicode[1]));
    const hex = (value) => Buffer.from(value, "hex").swap16().toString("utf16le");
    for (const block of text.matchAll(/beginbfchar([\s\S]*?)endbfchar/g)) {
      for (const pair of block[1].matchAll(/<([0-9A-Fa-f]+)>\s*<([0-9A-Fa-f]+)>/g)) {
        map.set(parseInt(pair[1], 16), hex(pair[2]));
      }
    }
    for (const block of text.matchAll(/beginbfrange([\s\S]*?)endbfrange/g)) {
      for (const range of block[1].matchAll(/<([0-9A-Fa-f]+)>\s*<([0-9A-Fa-f]+)>\s*<([0-9A-Fa-f]+)>/g)) {
        const base = parseInt(range[3], 16);
        for (let code = parseInt(range[1], 16); code <= parseInt(range[2], 16); code += 1) {
          map.set(code, String.fromCharCode(base + code - parseInt(range[1], 16)));
        }
      }
    }
  }
  cmapCache.set(fontId, map);
  return map;
}

function multiply(a, b) {
  return [
    a[0] * b[0] + a[1] * b[2],
    a[0] * b[1] + a[1] * b[3],
    a[2] * b[0] + a[3] * b[2],
    a[2] * b[1] + a[3] * b[3],
    a[4] * b[0] + a[5] * b[2] + b[4],
    a[4] * b[1] + a[5] * b[3] + b[5],
  ];
}

const TOKEN = /<[0-9A-Fa-f\s]*>|\[[^\]]*\]|\/[^\s/<>[\]()]+|[-+]?\d*\.?\d+(?:[eE][-+]?\d+)?|[A-Za-z*']+/g;

// Toutes les lignes de texte du board, dans l'ordre du PDF, avec leur position.
const lines = [];
function run(content, resources, ctm) {
  const xobjects = refs(subDict(resources, "XObject"));
  const fonts = refs(subDict(resources, "Font"));
  const stack = [];
  let operands = [];
  let font = null;
  let tm = [1, 0, 0, 1, 0, 0];

  for (const token of content.match(TOKEN) ?? []) {
    if (!/^[A-Za-z*']+$/.test(token) || token === "true" || token === "false") {
      operands.push(token);
      continue;
    }
    if (token === "q") stack.push(ctm);
    else if (token === "Q") ctm = stack.pop() ?? ctm;
    else if (token === "cm") ctm = multiply(operands.slice(-6).map(Number), ctm);
    else if (token === "Tf") font = fonts[operands.at(-2).slice(1)] ?? null;
    else if (token === "Tm") tm = operands.slice(-6).map(Number);
    else if (token === "Tj" || token === "TJ") {
      const map = font ? cmapOf(font) : new Map();
      const hex = operands.join(" ").match(/<([0-9A-Fa-f\s]*)>/g)?.join("").replace(/[<>\s]/g, "") ?? "";
      let text = "";
      for (let i = 0; i < hex.length; i += 4) text += map.get(parseInt(hex.slice(i, i + 4), 16)) ?? "";
      const matrix = multiply(tm, ctm);
      const x = Math.round(matrix[4]);
      const y = Math.round(matrix[5]);
      const last = lines.at(-1);
      if (last && last.x === x && last.y === y) last.text += text;
      else lines.push({ x, y, text });
    } else if (token === "Do") {
      const id = xobjects[operands.at(-1).slice(1)];
      if (id) run(streamOf(id), dictPart(id), ctm);
    }
    operands = [];
  }
}

const pageId = [...objects.keys()].find((id) => /\/Type\s*\/Page\b/.test(objects.get(id)));
const pageDict = objects.get(pageId);
const contentsId = Number(/\/Contents (\d+) 0 R/.exec(pageDict)[1]);
const resourcesRef = /\/Resources (\d+) 0 R/.exec(pageDict);
const pageResources = resourcesRef ? objects.get(Number(resourcesRef[1])) : pageDict;
run(streamOf(contentsId), pageResources, [1, 0, 0, 1, 0, 0]);

// ---------- Interprétation du board ----------


// Une carte = des lignes consécutives très proches les unes des autres sur le board.
const items = [];
for (const line of lines.map((entry) => ({ ...entry, text: clean(entry.text) })).filter((entry) => entry.text)) {
  const current = items.at(-1);
  const previous = current?.lines.at(-1);
  if (previous && Math.abs(previous.x - line.x) <= 12 && Math.abs(previous.y - line.y) <= 12) {
    current.lines.push(line);
  } else {
    items.push({ x: line.x, y: line.y, lines: [line] });
  }
}

const headers = [];
const cards = [];
const labels = [];
for (let index = 0; index < items.length; index += 1) {
  const item = items[index];
  const texts = item.lines.map((line) => line.text);
  if (texts[0].startsWith("Pôle")) {
    // Un titre peut être coupé en deux ("Pôle" puis "ruche").
    const name = texts.length === 1 && texts[0] === "Pôle" ? `Pôle ${items[(index += 1)].lines[0].text}` : texts.join(" ");
    headers.push({ name, x: item.x, y: item.y });
  } else if (texts.includes("Fonction")) {
    // Deux cartes voisines peuvent se retrouver dans le même groupe : on coupe après chaque rôle.
    let nameLines = [];
    for (let i = 0; i < item.lines.length; i += 1) {
      if (item.lines[i].text === "Fonction") {
        const first = nameLines[0] ?? item.lines[i];
        cards.push({ name: nameLines.map((line) => line.text).join(" "), role: item.lines[i + 1]?.text ?? "", x: first.x, y: first.y });
        nameLines = [];
        i += 1;
      } else {
        nameLines.push(item.lines[i]);
      }
    }
  } else {
    labels.push({ texts, x: item.x, y: item.y });
  }
}

  return { headers, cards, labels };
}

const board = pdfPath.toLowerCase().endsWith(".json") ? readBrowserBoard(pdfPath) : readPdfBoard();
const { headers, cards, labels } = board;

// Colonnes du board : regroupement des titres de pôles par position horizontale.
const columns = [];
for (const header of [...headers].sort((a, b) => a.x - b.x)) {
  const column = columns.find((entry) => Math.abs(entry.x - header.x) < 60);
  if (column) column.headers.push(header);
  else columns.push({ x: header.x, headers: [header] });
}

// Un élément appartient au pôle dont le titre est le plus proche au-dessus, dans sa colonne.
function poleOf(x, y) {
  const column = columns.reduce((best, entry) => (Math.abs(entry.x - x) < Math.abs(best.x - x) ? entry : best));
  const above = column.headers.filter((header) => header.y >= y);
  if (above.length === 0) return null;
  return above.reduce((best, header) => (header.y - y < best.y - y ? header : best)).name;
}

const NOTE_PATTERNS = [
  /\((?:Presta|presta|prest)\)|\bPresta\b/,
  /\((?:ALT|Alt|ATL|Alternante?)\)/,
  /\(stage\)/,
  /\(remp\)/,
  /\(?Arrive le[^)]*\)?/,
];

function splitNote(rawName) {
  let name = rawName;
  const notes = [];
  for (const pattern of NOTE_PATTERNS) {
    const match = pattern.exec(name);
    if (match) {
      notes.push(match[0].replace(/[()]/g, "").trim());
      name = name.slice(0, match.index) + name.slice(match.index + match[0].length);
    }
  }
  return { name: clean(name), note: notes.join(", ") };
}

const teamsByName = new Map();
const orderedHeaders = columns
  .sort((a, b) => a.x - b.x)
  .flatMap((column) => column.headers.sort((a, b) => b.y - a.y));
for (const header of orderedHeaders) {
  teamsByName.set(header.name, { name: header.name, people: [], tags: [] });
}

for (const card of [...cards].sort((a, b) => b.y - a.y || a.x - b.x)) {
  const pole = poleOf(card.x, card.y);
  if (!pole) continue;
  const { name, note } = splitNote(card.name);
  const role = card.role === "DEV" ? "Dev" : card.role;
  teamsByName.get(pole).people.push({ name, role, note });
}

for (const label of labels) {
  const pole = poleOf(label.x, label.y);
  if (!pole) continue;
  const team = teamsByName.get(pole);
  for (const text of label.texts) {
    const [, kind, value] = /^(Modules|Consultants?)\s*:\s*(.*)$/.exec(text) ?? [null, null, text];
    const values = value.split(",").map(clean).filter(Boolean);
    if (kind && kind.startsWith("Consultant")) {
      values.forEach((consultant) => team.people.push({ name: consultant, role: "Consultant", note: "" }));
    } else {
      team.tags.push(...values);
    }
  }
}

const isoDate = board.exportDate ?? /\d{4}-\d{2}-\d{2}/.exec(path.basename(pdfPath))?.[0] ?? new Date().toISOString().slice(0, 10);
const [year, month, day] = isoDate.split("-");
const result = {
  source: "Klaxoon - Organigramme MAIDO public",
  exportDate: isoDate,
  exportDateLabel: `${day}/${month}/${year}`,
  teams: [...teamsByName.values()],
};

// ---------- Changements par rapport à la version précédente ----------

const key = (text) => text.normalize("NFD").replace(/\p{Diacritic}/gu, "").toLowerCase().replace(/[^a-z]/g, "");
function index(organigramme) {
  const people = new Map();
  for (const team of organigramme?.teams ?? []) {
    for (const person of team.people) {
      const entry = people.get(key(person.name)) ?? { name: person.name, places: [] };
      entry.places.push(`${team.name} (${person.role})`);
      people.set(key(person.name), entry);
    }
  }
  return people;
}

const previous = fs.existsSync(JSON_PATH) ? JSON.parse(fs.readFileSync(JSON_PATH, "utf8")) : null;
const before = index(previous);
const after = index(result);
const arrivals = [...after.entries()].filter(([id]) => !before.has(id));
const departures = [...before.entries()].filter(([id]) => !after.has(id));
const changes = [...after.entries()].filter(
  ([id, entry]) => before.has(id) && before.get(id).places.sort().join() !== entry.places.sort().join(),
);

// ---------- Écriture ----------

fs.writeFileSync(JSON_PATH, `${JSON.stringify(result, null, 2)}\n`, "utf8");
const csvCell = (value) => (/[",;\n]/.test(value) ? `"${value.replace(/"/g, '""')}"` : value);
const csvLines = ["pole,nom,role,note"];
for (const team of result.teams) {
  for (const person of team.people) {
    csvLines.push([team.name, person.name, person.role, person.note].map(csvCell).join(","));
  }
}
fs.writeFileSync(CSV_PATH, `﻿${csvLines.join("\n")}\n`, "utf8");

const peopleCount = result.teams.reduce((total, team) => total + team.people.length, 0);
console.log(`Export du ${result.exportDateLabel} : ${result.teams.length} pôles, ${peopleCount} lignes (personnes + consultants).`);
if (previous) {
  console.log(`\nArrivées (${arrivals.length}) :`);
  arrivals.forEach(([, entry]) => console.log(`  + ${entry.name} — ${entry.places.join(" / ")}`));
  console.log(`\nDéparts (${departures.length}) :`);
  departures.forEach(([, entry]) => console.log(`  - ${entry.name} — ${entry.places.join(" / ")}`));
  console.log(`\nChangements de pôle ou de rôle (${changes.length}) :`);
  changes.forEach(([id, entry]) =>
    console.log(`  ~ ${entry.name} : ${before.get(id).places.join(" / ")} -> ${entry.places.join(" / ")}`),
  );
}
