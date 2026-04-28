"use client";

import { useState } from "react";

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

function getRoleClassName(role: string) {
  const normalizedRole = role.toLowerCase();

  if (
    normalizedRole.includes("po") ||
    normalizedRole.includes("squad lead") ||
    normalizedRole === "pm" ||
    normalizedRole.includes("dir")
  ) {
    return "border-emerald-200 bg-emerald-50 text-emerald-800";
  }

  if (normalizedRole.includes("dev") || normalizedRole.includes("archi")) {
    return "border-rose-200 bg-rose-50 text-rose-800";
  }

  if (
    normalizedRole.includes("consult") ||
    normalizedRole.includes("manager") ||
    normalizedRole.includes("cto")
  ) {
    return "border-amber-200 bg-amber-50 text-amber-800";
  }

  if (normalizedRole.includes("qa")) {
    return "border-sky-200 bg-sky-50 text-sky-800";
  }

  return "border-zinc-200 bg-zinc-50 text-zinc-700";
}

export default function OrganigrammePage() {
  const [search, setSearch] = useState("");
  const trimmedSearch = search.trim();
  const query = trimmedSearch.toLowerCase();
  const filteredTeams = query
    ? teams.filter((team) =>
        [
          team.name,
          ...team.people.flatMap((person) => [person.name, person.role, person.note ?? ""]),
          ...team.tags,
        ].some((value) => value.toLowerCase().includes(query)),
      )
    : teams;
  const resultSummary = query
    ? filteredTeams.length === 1
      ? `1 pôle trouvé pour “${trimmedSearch}”`
      : filteredTeams.length > 1
        ? `${filteredTeams.length} pôles trouvés pour “${trimmedSearch}”`
        : `Aucun pôle trouvé pour “${trimmedSearch}”`
    : `${teams.length} pôles affichés`;

  return (
    <main className="min-h-screen bg-amber-50/40 px-4 py-10 text-zinc-950 sm:px-6 lg:px-10">
      <section className="mx-auto flex w-full max-w-7xl flex-col gap-6">
        <h1 className="text-3xl font-semibold tracking-tight">Organigramme</h1>

        <div className="w-full max-w-xl">
          <label htmlFor="organigramme-search" className="text-sm font-medium text-zinc-700">
            Recherche
          </label>
          <input
            id="organigramme-search"
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Nom, pôle, rôle ou tag"
            className="mt-2 w-full rounded-2xl border border-amber-200 bg-white px-4 py-3 text-sm shadow-sm shadow-amber-100/60 outline-none focus:border-amber-400"
          />
          <p className="mt-2 text-sm text-zinc-500">{resultSummary}</p>
          {query ? (
            <button
              type="button"
              onClick={() => setSearch("")}
              className="mt-2 hidden text-sm font-medium text-amber-800 underline-offset-4 hover:underline sm:inline-flex"
            >
              Effacer la recherche
            </button>
          ) : null}
        </div>

        {filteredTeams.length > 0 ? (
          <section className="grid w-full items-start gap-4 md:grid-cols-2 xl:grid-cols-3">
            {filteredTeams.map((team) => (
              <article key={team.name} className="flex h-full flex-col rounded-3xl border border-amber-200 bg-white p-5 shadow-sm shadow-amber-100/70">
                <h2 className="border-b border-amber-100 pb-3 text-lg font-semibold tracking-tight text-zinc-950">{team.name}</h2>

                <ul className="mt-3 divide-y divide-amber-100/70 text-sm">
                  {team.people.map((person) => (
                    <li key={`${team.name}-${person.name}`} className="py-2 first:pt-0 last:pb-0">
                      <div className="flex flex-wrap items-start justify-between gap-2">
                        <span className="font-medium text-zinc-950">{person.name}</span>
                        <span className={`rounded-full border px-2.5 py-1 text-xs font-medium ${getRoleClassName(person.role)}`}>
                          {person.role}
                        </span>
                      </div>
                      {person.note ? <span className="mt-0.5 block text-xs text-zinc-500">{person.note}</span> : null}
                    </li>
                  ))}
                </ul>

                {team.tags.length > 0 ? (
                  <ul className="mt-4 flex flex-wrap gap-2 border-t border-amber-100 pt-4">
                    {team.tags.map((tag) => (
                      <li key={`${team.name}-${tag}`} className="rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-xs text-amber-900">
                        {tag}
                      </li>
                    ))}
                  </ul>
                ) : null}
              </article>
            ))}
          </section>
        ) : (
          <p className="rounded-xl border border-zinc-200 bg-white p-5 text-sm text-zinc-600 shadow-sm">
            Aucun résultat trouvé.
          </p>
        )}
      </section>
    </main>
  );
}
