// Calcule, pour chaque sujet métier, qui a traité des tickets Jira et quand.
//
// Usage : node scripts/build-jira-sujets.mjs "<export des tickets .ndjson>"
//
// L'export contient une ligne JSON par ticket : {"key","summary","assignee","resolved"}
// (tickets MP terminés sur 12 mois, récupérés via Jira). Il n'est pas versionné.
// Les rôles et pôles viennent de data/organigramme.json : une personne absente de
// l'organigramme a quitté l'entreprise et n'est pas affichée. Jira fait foi pour
// l'orthographe des noms.
// Produit data/jira-sujets.json, lu par le chat de Bobbee.

import fs from "node:fs";
import path from "node:path";

const ROOT = path.resolve(import.meta.dirname, "..");
const ORGANIGRAMME_PATH = path.join(ROOT, "data", "organigramme.json");
const OUTPUT_PATH = path.join(ROOT, "data", "jira-sujets.json");
const PEOPLE_PER_TOPIC = 6;

const exportPath = process.argv[2];
if (!exportPath) {
  console.error('Usage : node scripts/build-jira-sujets.mjs "<export des tickets .ndjson>"');
  process.exit(1);
}

const normalize = (text) =>
  text.normalize("NFD").replace(/\p{Diacritic}/gu, "").toLowerCase().replace(/\s+/g, " ").trim();

// Sujets : libellé affiché, mots-clés reconnus dans la question, règle sur le titre du ticket.
const TOPICS = [
  { id: "tva", label: "TVA", keywords: ["tva"], match: /\btva\b/ },
  { id: "immobilisations", label: "Immobilisations", keywords: ["immobilisation", "immo"], match: /\bimmo(bilisation|s)?\b|\bimmobilis/ },
  { id: "facturation", label: "Facturation / facture électronique", keywords: ["facturation", "facture electronique", "efacture", "facture"], match: /\bfacturation\b|\bfactures? electroniques?\b|\be-?factur/ },
  { id: "banque", label: "Banque", keywords: ["banque", "bancaire", "rapprochement"], match: /\bbanques?\b|\bbancaires?\b|\brapprochement/ },
  { id: "cloture-revision", label: "Clôture / révision", keywords: ["cloture", "revision"], match: /\bclotur|\brevision\b/ },
  { id: "liasse", label: "Liasse / états financiers", keywords: ["liasse", "etats financiers", "etat financier"], match: /\bliasses?\b|\betats? financiers?\b/ },
  { id: "fec", label: "FEC", keywords: ["fec"], match: /\bfec\b/ },
  { id: "stocks", label: "Stocks", keywords: ["stock"], match: /\bstocks?\b/ },
  { id: "licences", label: "Licences / offres / profils", keywords: ["licence", "offre", "profil", "souscription"], match: /\blicences?\b|\boffres?\b|\bprofils?\b/ },
  { id: "emprunts", label: "Emprunts", keywords: ["emprunt"], match: /\bemprunts?\b/ },
  { id: "lettrage", label: "Lettrage", keywords: ["lettrage"], match: /\blettrage/ },
  { id: "ocr-ia", label: "OCR / IA", keywords: ["ocr", "ia", "intelligence artificielle", "llm"], match: /\bocr\b|\bia\b|\bllm\b/ },
  { id: "integrations", label: "Intégrations / Chift", keywords: ["chift", "integration"], match: /\bchift\b|\bintegrations?\b/ },
  { id: "grand-livre", label: "Grand livre", keywords: ["grand livre", "grand-livre"], match: /\bgrand[- ]livre\b/ },
  { id: "mobile", label: "Mobile / tablette", keywords: ["mobile", "tablette"], match: /\bmobile|\btablette/ },
  { id: "credit-bail", label: "Crédit-bail", keywords: ["credit bail", "credit-bail"], match: /\bcredits?[- ]bails?\b/ },
  { id: "budget", label: "Budget / prévisionnel", keywords: ["budget", "previsionnel"], match: /\bbudget|\bprevisionnel/ },
  { id: "analytique", label: "Analytique", keywords: ["analytique"], match: /\banalytique/ },
  { id: "plan-comptable", label: "Plan comptable", keywords: ["plan comptable", "plan de comptes"], match: /\bplan (comptable|de comptes?)\b/ },
  { id: "fiscalite", label: "Fiscalité", keywords: ["fiscalite", "fiscal"], match: /\bfiscal/ },
  { id: "reprise", label: "Reprise de données", keywords: ["reprise"], match: /\breprises?\b/ },
  {
    // Version ciblée : le dossier doit être le sujet du ticket, pas un simple contexte.
    id: "dossiers",
    label: "Dossiers (gestion des dossiers)",
    keywords: ["dossier"],
    match: (title) =>
      /\bdossiers?\b/.test(title) &&
      !/\bdossiers? de revision\b/.test(title) &&
      /mon dossier|^\[?dossiers?\b|\bcreat|\bcree|\bdupli|\bmigr|\bparametr|\bconfigur|\bfiche (client )?dossier|\bacces|\barchiv|\bsuppr|liste des dossiers|(selection|changement|changer) de dossier/.test(title),
  },
  { id: "paiements", label: "Paiements", keywords: ["paiement"], match: /\bpaiements?\b/ },
  { id: "documents", label: "Documents / GED", keywords: ["document", "ged"], match: /\bdocuments?\b|\bged\b/ },
  { id: "utilisateurs", label: "Utilisateurs / droits / SAML", keywords: ["utilisateur", "droits", "saml", "sso"], match: /\butilisateurs?\b|\bdroits?\b|\bsaml\b|\bsso\b/ },
];

// ---------- Organigramme : rôle et pôle de chaque personne ----------

const nameKey = (name) => normalize(name).replace(/[^a-z]/g, "");
const organigramme = JSON.parse(fs.readFileSync(ORGANIGRAMME_PATH, "utf8"));
const directory = new Map();
for (const team of organigramme.teams) {
  for (const person of team.people) {
    const entry = directory.get(nameKey(person.name)) ?? { name: person.name, roles: new Set(), poles: new Set() };
    entry.roles.add(person.role);
    entry.poles.add(team.name.replace(/^Pôle /, ""));
    directory.set(nameKey(person.name), entry);
  }
}

// Les noms Jira et Klaxoon diffèrent parfois (VANDERSCHOOTEN / VANDERSCHOOT, MIVELAZ / MIVELAS) :
// à défaut de correspondance exacte, même prénom et mêmes 6 premières lettres du nom.
const looseKey = (name) => {
  const [firstName, ...lastName] = normalize(name).replace(/\(.*?\)/g, "").split(" ");
  return `${firstName.replace(/[^a-z]/g, "")}|${lastName.join("").replace(/[^a-z]/g, "").slice(0, 6)}`;
};
const looseDirectory = new Map();
for (const entry of directory.values()) {
  const key = looseKey(entry.name);
  looseDirectory.set(key, looseDirectory.has(key) ? null : entry);
}
const findPerson = (name) => directory.get(nameKey(name)) ?? looseDirectory.get(looseKey(name)) ?? null;

// ---------- Tickets ----------

const tickets = fs
  .readFileSync(exportPath, "utf8")
  .split("\n")
  .filter((line) => line.trim())
  .map((line) => JSON.parse(line));

const unmatched = new Map();
const topics = TOPICS.map((topic) => {
  const test = typeof topic.match === "function" ? topic.match : (title) => topic.match.test(title);
  const byPerson = new Map();
  let ticketCount = 0;

  for (const ticket of tickets) {
    if (!ticket.assignee || !test(normalize(ticket.summary ?? ""))) continue;
    ticketCount += 1;
    const person = findPerson(ticket.assignee);
    if (!person) {
      unmatched.set(ticket.assignee, (unmatched.get(ticket.assignee) ?? 0) + 1);
      continue;
    }
    // Le nom affiché est celui de Jira, qui a toujours la bonne orthographe.
    const jiraName = ticket.assignee.replace(/\s*\(.*?\)\s*/g, " ").trim();
    const stats = byPerson.get(person.name) ?? { person, jiraName, count: 0, last: "" };
    stats.count += 1;
    const resolved = (ticket.resolved ?? "").slice(0, 10);
    if (resolved > stats.last) stats.last = resolved;
    byPerson.set(person.name, stats);
  }

  const people = [...byPerson.values()]
    .sort((a, b) => b.count - a.count || b.last.localeCompare(a.last))
    .slice(0, PEOPLE_PER_TOPIC)
    .map(({ person, jiraName, count, last }) => ({
      name: jiraName,
      role: [...person.roles].join(" / "),
      pole: [...person.poles].join(" / "),
      count,
      lastResolved: last,
    }));

  return { id: topic.id, label: topic.label, keywords: topic.keywords, ticketCount, people };
});

const result = {
  source: "Jira MP - tickets terminés sur 12 mois, classés par mot-clé du titre",
  generatedAt: new Date().toISOString().slice(0, 10),
  topics,
};
fs.writeFileSync(OUTPUT_PATH, `${JSON.stringify(result, null, 2)}\n`, "utf8");

console.log(`${tickets.length} tickets lus, ${topics.length} sujets écrits dans data/jira-sujets.json\n`);
for (const topic of topics) {
  const names = topic.people.map((person) => `${person.name} (${person.role}, ${person.count})`).join(", ");
  console.log(`${topic.label} — ${topic.ticketCount} tickets : ${names}`);
}
const unmatchedList = [...unmatched.entries()].sort((a, b) => b[1] - a[1]);
console.log(`\nAbsents de l'organigramme (${unmatchedList.length}) : ${unmatchedList.map(([name, count]) => `${name} (${count})`).join(", ")}`);
