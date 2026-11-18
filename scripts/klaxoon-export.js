// Extraction du board Klaxoon « Organigramme MAIDO public » depuis le navigateur.
//
// À exécuter dans l'onglet du board ouvert (Claude in Chrome : outil javascript),
// board chargé. Télécharge « klaxoon-organigramme-AAAA-MM-JJ.json » (pôles, cartes et
// libellés, avec leur position à l'écran) dans le dossier Téléchargements, et renvoie
// le nombre d'éléments trouvés. Ensuite :
//   node scripts/import-organigramme.mjs "<Téléchargements>/klaxoon-organigramme-AAAA-MM-JJ.json"
(() => {
  const clean = (text) => text.replace(/[​ ]/g, " ").replace(/\s+/g, " ").trim();
  const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
  const nodes = [];
  for (let node = walker.nextNode(); node; node = walker.nextNode()) {
    const text = clean(node.textContent);
    if (!text) continue;
    const range = document.createRange();
    range.selectNodeContents(node);
    const box = range.getBoundingClientRect();
    if (box.width === 0) continue;
    nodes.push({ node, text, x: Math.round(box.left), y: Math.round(box.top) });
  }

  // Carte = plus petit ancêtre d'un « Fonction » qui contient aussi le nom et le rôle.
  const cards = [];
  const seen = new Set();
  for (const entry of nodes.filter((item) => item.text === "Fonction")) {
    let element = entry.node.parentElement;
    while (element && element !== document.body) {
      const lines = element.innerText.split("\n").map(clean).filter(Boolean);
      const index = lines.indexOf("Fonction");
      if (index > 0 && index < lines.length - 1 && lines.filter((line) => line === "Fonction").length === 1) {
        if (!seen.has(element)) {
          seen.add(element);
          const box = element.getBoundingClientRect();
          cards.push({ name: lines.slice(0, index).join(" "), role: lines[index + 1], x: Math.round(box.left), y: Math.round(box.top) });
        }
        break;
      }
      element = element.parentElement;
    }
  }

  // Titres de pôles (parfois coupés en deux : « Pôle » puis « ruche »).
  const headers = [];
  nodes.forEach((entry, index) => {
    if (!entry.text.startsWith("Pôle")) return;
    const name = entry.text === "Pôle" ? `Pôle ${nodes[index + 1]?.text ?? ""}` : entry.text;
    headers.push({ name: clean(name), x: entry.x, y: entry.y });
  });

  // Libellés : modules, consultants, et autres mentions (ex. « Gouvernance Bobbee »).
  const labels = nodes
    .filter((entry) => /^(Modules|Consultants?)\s*:|^Gouvernance/.test(entry.text))
    .map((entry) => ({ texts: [entry.text], x: entry.x, y: entry.y }));

  const exportedAt = new Date().toISOString().slice(0, 10);
  const json = JSON.stringify({ source: "klaxoon-browser", exportedAt, headers, cards, labels });

  // Téléchargement du fichier dans le dossier Téléchargements du navigateur.
  const link = document.createElement("a");
  link.href = URL.createObjectURL(new Blob([json], { type: "application/json" }));
  link.download = `klaxoon-organigramme-${exportedAt}.json`;
  document.body.appendChild(link);
  link.click();
  link.remove();

  return { fichier: link.download, poles: headers.length, cartes: cards.length, libelles: labels.length };
})();
