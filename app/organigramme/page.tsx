const teams = [
  {
    name: "Pôle propolis",
    people: [
      { name: "Hugues AMALRIC", role: "PO" },
      { name: "Christophe TRICOT", role: "PO" },
      { name: "Najia BOUHA", role: "Squad Lead" },
      { name: "Amandine GOBBER", role: "PO" },
      { name: "Florian TANAY", role: "Dev" },
      { name: "Julio CHI", role: "Dev", note: "Presta" },
      { name: "Mahé FAURE", role: "Dev" },
      { name: "Malika CHOUBRI", role: "Dev" },
      { name: "Roberto SANCHEZ", role: "Dev" },
      { name: "Sébastien PINGAL", role: "Dev" },
      { name: "Mourad IMERZOUKENE", role: "QA" },
      { name: "Geoffrey FLEUR", role: "QA" },
      { name: "Adam EMMANUEL", role: "Dev", note: "Arrive le 04/05" },
      { name: "Thierry Dargent", role: "Consultant" },
    ],
    tags: [
      "BA",
      "Reprise histo comptable",
      "Gestion produits",
      "Stocks",
      "Analytique / Tag / étiquettes",
      "Import export fichiers",
    ],
  },
  {
    name: "Pôle essaim",
    people: [
      { name: "Jérôme SIMONI", role: "Squad Lead" },
      { name: "Nicolas DELFOUR", role: "PO" },
      { name: "Rafael COPPE", role: "Dev" },
      { name: "Gabriel HARDY", role: "Dev" },
      { name: "Thibault MARIE", role: "Dev" },
      { name: "Florian DEPATIN", role: "Dev" },
      { name: "Jimmy WIMS", role: "QA" },
      { name: "William PASSET", role: "Dev", note: "ALT" },
      { name: "Ramiz HALITI", role: "Consultant" },
    ],
    tags: [
      "Ergonomie générale",
      "GI (temps, LM...)",
      "Facturation dont FE",
      "Gestion des clients et utilisateurs",
    ],
  },
  {
    name: "Pôle nectar",
    people: [
      { name: "Nicolas POU", role: "Squad Lead" },
      { name: "Cherazed KERAR", role: "PO" },
      { name: "Monica TARABUSI", role: "Dev" },
      { name: "Maxime DUMAS", role: "Dev" },
      { name: "Julien DESPREZ", role: "Dev" },
      { name: "Faid HASSANI", role: "Dev" },
      { name: "Duncan ROZE", role: "Dev" },
      { name: "Stéphane ACHARI", role: "Dev" },
      { name: "Dominik KILIAN", role: "QA" },
      { name: "Nancy BRUNEAU", role: "Consultante" },
    ],
    tags: [
      "Banques",
      "Documents",
      "Ventes, Charges, paiements",
      "Découpe des factures",
    ],
  },
  {
    name: "Pôle hydromel",
    people: [
      { name: "Najia BOUHA", role: "Squad Lead" },
      { name: "Noelle MONTAGNER", role: "PO" },
      { name: "Mamadou VINCE", role: "PO" },
      { name: "Benjamin WALLETH", role: "Dev" },
      { name: "Moctar SAWADOGO", role: "Dev" },
      { name: "William DENOYER", role: "Dev" },
      { name: "Emmanuel GUESSAS", role: "Dev" },
      { name: "Mathieu RAPIENNE", role: "Dev", note: "Arrive le 04/05" },
      { name: "Djamal HASSANI", role: "QA", note: "Alternant QA" },
      { name: "Adrien ALLORANT", role: "QA" },
      { name: "Henri LE CLERC DE BUSSY", role: "Consultant" },
    ],
    tags: [
      "Intégrations externes",
      "Budget, prévisionnel, reporting",
      "États financiers",
      "Éditions comptables",
    ],
  },
  {
    name: "Pôle miel",
    people: [
      { name: "Nicolas POU", role: "Squad Lead" },
      { name: "Pierre Alexandre HERPERS", role: "PO" },
      { name: "Sarah LECOEUCHE", role: "PO" },
      { name: "Julie CHOPIN", role: "QA" },
      { name: "Clarence POTEL", role: "Dev", note: "Arrive le 06/07" },
      { name: "Vincent DEFAUX", role: "PO" },
      { name: "Karl MARTIN", role: "Dev" },
      { name: "Cécile LE ROUZIC", role: "Dev" },
      { name: "Laurent BOUYET", role: "Dev" },
      { name: "Maxime AUBRY", role: "Dev" },
      { name: "Mickaël HUBERT", role: "Dev" },
      { name: "Anthony LENGLET", role: "Dev" },
      { name: "Henri LE CLERC DE BUSSY", role: "Consultant" },
      { name: "Monique HARDIER", role: "Consultante" },
    ],
    tags: [
      "Immos",
      "Fisca courante",
      "Fisca annuelle",
      "Crédit bail",
      "Plan de comptes",
      "Création écritures, lettrage dans GL",
      "Emprunts",
    ],
  },
  {
    name: "Pôle lavande",
    people: [
      { name: "Jérôme SIMONI", role: "Squad Lead" },
      { name: "Sebastian ZITOUNI", role: "PO" },
      { name: "Romain VALLET", role: "Dev" },
      { name: "Adrien LEFRANCOIS", role: "Dev" },
      { name: "Simon LEROY", role: "QA" },
      { name: "Alex MIVELAS", role: "Dev", note: "Alternant" },
      { name: "Julien GALLET", role: "Consultant" },
    ],
    tags: [
      "Mobile",
      "API",
      "Tutoriel",
      "Chatbot",
      "SAML",
      "Product fruit",
      "Onboarding, e-learning",
      "Hubspot & co",
      "App mobiles natives",
      "Activation licences/ADV",
      "Gestion des offres et profils",
      "UX tablette",
      "Intégration internes (ISAGI, GC etc)",
      "Relations avec Chift",
    ],
  },
  {
    name: "Pôle maya",
    people: [
      { name: "Vincent PAYEN", role: "Squad Lead" },
      { name: "Damien LEFRANC", role: "PO" },
      { name: "Thomas DERUCHE", role: "Dev" },
      { name: "Vivien VANDERSCHOOTEN", role: "Dev" },
      { name: "Yann PASCOET", role: "Dev" },
      { name: "Rémy DUCLOS", role: "Dev" },
      { name: "Florian LAMPAERT", role: "Dev", note: "Arrive le 04/05" },
      { name: "Sonia HAMID", role: "QA" },
      { name: "Coralie BROCHET", role: "Consultante" },
    ],
    tags: [
      "Dossier de révision",
      "Supervision et visa",
      "Paramétrage journaux et exercices",
      "Clôture et validation",
    ],
  },
  {
    name: "Pôle éclaireuses",
    people: [
      { name: "Ophélie Le Bras", role: "Resp UXUI" },
      { name: "Nicolas VANINE", role: "UXUI" },
      { name: "Nour KHUJA", role: "UXUI" },
      { name: "Marc CLERGER", role: "UXUI" },
    ],
    tags: ["UX/UI"],
  },
  {
    name: "Pôle pollen",
    people: [
      { name: "Irina MASLOWSKI", role: "Squad Lead" },
      { name: "Amina BOUTELDJA", role: "Dev" },
      { name: "Clément BOURTGUIZAMEL", role: "Dev" },
      { name: "Adrien GUITTARD", role: "Dev", note: "presta" },
      { name: "Bryan OBROU", role: "Dev", note: "Alt" },
      { name: "Jourdan WILSON", role: "Stagiaire Pollen", note: "stagiaire" },
    ],
    tags: ["OCR", "LLM", "IA"],
  },
  {
    name: "Pôle Apiculture",
    people: [
      { name: "Gildas LE BOURNAULT", role: "Archi" },
      { name: "Mael GELEBART", role: "Dev" },
      { name: "Erwann LE BOULC'H", role: "Dev" },
    ],
    tags: ["Modularité", "Scalabilité Performance", "Sécurité", "Infra de test"],
  },
  {
    name: "Pôle ruche",
    people: [
      { name: "Céline VIEIRA", role: "Dir Marketing Produit" },
      { name: "Lazar KRIVOKAPIC", role: "PM" },
      { name: "Arnaud LEBON", role: "PM" },
      { name: "Eric SELLEM", role: "CTO" },
      { name: "Romain MAGISTER", role: "Manager R&D" },
      { name: "TBH", role: "Manager Technique" },
      { name: "Jérémy ROYER", role: "QA Manager" },
    ],
    tags: [],
  },
  {
    name: "Pôle butineuses",
    people: [
      { name: "Jérémy ROYER", role: "QA Manager" },
      { name: "Nicolas BOUTOUBA", role: "QA" },
      { name: "Laura LIEBERKNECHT", role: "QA" },
      { name: "Ihsane SOUMIR", role: "QA", note: "Alternante" },
      { name: "Jérémy BERNARD", role: "QA", note: "Presta" },
      { name: "Abdessamad SAYHI", role: "QA", note: "Presta" },
      { name: "Sokayna EL HASSANI", role: "QA", note: "Presta" },
    ],
    tags: ["QA transverse"],
  },
  {
    name: "Pôle alvéoles",
    people: [
      { name: "Romain BEAUSSART", role: "Dev" },
      { name: "Nicolas Contreras Tibocha", role: "Stagiaire Alvéoles" },
      { name: "Thomas CAVELIER", role: "Devops" },
      { name: "Juan VILAR SANCHIS", role: "Dev" },
      { name: "Mohammed BCHAÏKER", role: "Devops" },
      { name: "Jessy WATSON", role: "Dev" },
      { name: "Mathieu LETESSIER", role: "Archi", note: "Presta" },
      { name: "Audric GUIGON", role: "Archi", note: "Presta" },
    ],
    tags: ["Infra AWS", "CI/CD", "Infra UI", "Infra API"],
  },
];

export default function OrganigrammePage() {
  return (
    <main className="min-h-screen bg-zinc-50 px-6 py-12 text-zinc-950 sm:px-10">
      <section className="mx-auto flex w-full max-w-6xl flex-col items-center gap-6">
        <h1 className="text-3xl font-semibold tracking-tight">Organigramme</h1>

        <section className="grid w-full gap-4 lg:grid-cols-3">
          {teams.map((team) => (
            <article key={team.name} className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm">
              <h2 className="text-xl font-semibold">{team.name}</h2>

              <ul className="mt-4 space-y-2 text-sm">
                {team.people.map((person) => (
                  <li key={`${team.name}-${person.name}`}>
                    <span className="font-medium">{person.name}</span>
                    <span className="block text-zinc-600">{person.role}</span>
                    {person.note ? <span className="block text-zinc-500">{person.note}</span> : null}
                  </li>
                ))}
              </ul>

              {team.tags.length > 0 ? (
                <ul className="mt-4 flex flex-wrap gap-2">
                  {team.tags.map((tag) => (
                    <li key={`${team.name}-${tag}`} className="rounded-full bg-zinc-100 px-3 py-1 text-xs text-zinc-700">
                      {tag}
                    </li>
                  ))}
                </ul>
              ) : null}
            </article>
          ))}
        </section>
      </section>
    </main>
  );
}
