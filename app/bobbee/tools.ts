import type Anthropic from "@anthropic-ai/sdk";
import {
  getMatchPriority,
  searchCompetences,
  searchJiraTopics,
  searchUsefulLinks,
  type CompetenceEntry,
  type JiraTopic,
  type UsefulLinkEntry,
} from "@/app/page.search";
import demoCompetences from "./demo-data/competences.json";
import demoJiraSujets from "./demo-data/jira-sujets.json";
import demoOrganigramme from "./demo-data/organigramme.json";
import demoUsefulLinks from "./demo-data/useful-links.json";
import realOrganigramme from "@/data/organigramme.json";

// POC : données fictives par défaut. BOBBEE_DATA=reelles branche les vraies données
// (à n'activer qu'après validation DSI / RGPD).
const USE_REAL_DATA = process.env.BOBBEE_DATA === "reelles";

// Nombre maximum de résultats renvoyés à Claude par recherche.
const MAX_RESULTS = 10;

const LEVEL_LABELS: Record<string, string> = {
  a: "Expert / référent",
  b: "Bon niveau",
  r: "Ressource / relais",
};

type OrganigrammeData = {
  teams: { name: string; people: { name: string; role: string }[] }[];
};

const ORGANIGRAMME = (USE_REAL_DATA ? realOrganigramme : demoOrganigramme) as OrganigrammeData;

function normalize(value: string) {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .trim();
}

// Trie les entrées par pertinence avec la même règle que la recherche de l'accueil.
function rank<T>(entries: T[], getPriority: (entry: T) => number | null) {
  return entries
    .map((entry, index) => ({ entry, index, priority: getPriority(entry) }))
    .filter((result): result is { entry: T; index: number; priority: number } => result.priority !== null)
    .sort((left, right) => left.priority - right.priority || left.index - right.index)
    .map(({ entry }) => entry);
}

function findCompetences(query: string): CompetenceEntry[] {
  if (USE_REAL_DATA) {
    return searchCompetences(query);
  }

  return rank(demoCompetences as CompetenceEntry[], (entry) =>
    getMatchPriority(query, entry.competence, [entry.nom_affiche, entry.personne, entry.domaine, entry.tag]),
  );
}

function findUsefulLinks(query: string): UsefulLinkEntry[] {
  if (USE_REAL_DATA) {
    return searchUsefulLinks(query);
  }

  return rank(demoUsefulLinks as UsefulLinkEntry[], (entry) =>
    getMatchPriority(query, entry.Quoi ?? entry.Lien, [entry.Rubrique, entry.Qui, entry.Lien]),
  );
}

function findJiraTopics(query: string): JiraTopic[] {
  if (USE_REAL_DATA) {
    return searchJiraTopics(query);
  }

  const normalizedQuery = normalize(query);
  return (demoJiraSujets.topics as JiraTopic[]).filter(
    (topic) =>
      normalize(topic.label).includes(normalizedQuery) ||
      topic.keywords.some((keyword) => normalizedQuery.includes(normalize(keyword))),
  );
}

function findInOrganigramme(query: string) {
  const normalizedQuery = normalize(query);
  const teams = ORGANIGRAMME.teams.filter((team) => normalize(team.name).includes(normalizedQuery));

  if (teams.length > 0) {
    return { equipes: teams.map((team) => ({ equipe: team.name, membres: team.people })) };
  }

  const people = ORGANIGRAMME.teams.flatMap((team) =>
    team.people
      .filter((person) => normalize(`${person.name} ${person.role}`).includes(normalizedQuery))
      .map((person) => ({ ...person, equipe: team.name })),
  );

  return {
    personnes: people.slice(0, MAX_RESULTS),
    equipesExistantes: ORGANIGRAMME.teams.map((team) => team.name),
  };
}

function searchInput(description: string): Anthropic.Beta.BetaTool["input_schema"] {
  return {
    type: "object",
    properties: { recherche: { type: "string", description } },
    required: ["recherche"],
    additionalProperties: false,
  };
}

export const BOBBEE_TOOLS: Anthropic.Beta.BetaTool[] = [
  {
    name: "chercher_competences",
    description:
      "Cherche qui maîtrise une compétence (métier, techno ou fonctionnalité Bobbee). Renvoie personne, compétence, domaine et niveau. Utiliser un mot-clé court (ex. « TVA », « Angular », « Docker »), ou un nom de personne pour lister ses compétences.",
    input_schema: searchInput("Mot-clé court : compétence, domaine ou nom de personne."),
    strict: true,
  },
  {
    name: "chercher_sujets_jira",
    description:
      "Cherche qui a travaillé récemment sur un sujet d'après les tickets Jira terminés sur 12 mois. Renvoie, par sujet, les personnes avec leur nombre de tickets et la date du dernier.",
    input_schema: searchInput("Sujet en un ou deux mots (ex. « TVA », « immobilisation », « banque »)."),
    strict: true,
  },
  {
    name: "chercher_organigramme",
    description:
      "Cherche dans l'organigramme : une équipe (pôle) et ses membres, ou une personne (ou un rôle) et son équipe. Renvoie aussi la liste des équipes existantes.",
    input_schema: searchInput("Nom d'équipe (ex. « lavande »), nom de personne ou rôle (ex. « Squad Lead »)."),
    strict: true,
  },
  {
    name: "chercher_liens_utiles",
    description:
      "Cherche un lien utile (documentation Confluence, outils internes, démarches RH…). Renvoie rubrique, public, description et lien.",
    input_schema: searchInput("Mot-clé court (ex. « congés », « DOR », « planification »)."),
    strict: true,
  },
];

export function runBobbeeTool(name: string, input: unknown) {
  const query =
    typeof input === "object" && input !== null && "recherche" in input && typeof input.recherche === "string"
      ? input.recherche
      : "";

  switch (name) {
    case "chercher_competences": {
      const results = findCompetences(query);
      return {
        total: results.length,
        resultats: results.slice(0, MAX_RESULTS).map((entry) => ({
          personne: entry.nom_affiche ?? entry.personne,
          competence: entry.competence,
          domaine: entry.domaine,
          niveau: LEVEL_LABELS[entry.niveau.toLowerCase()] ?? "Non précisé",
        })),
      };
    }
    case "chercher_sujets_jira":
      return { resultats: findJiraTopics(query).slice(0, MAX_RESULTS) };
    case "chercher_organigramme":
      return findInOrganigramme(query);
    case "chercher_liens_utiles": {
      const results = findUsefulLinks(query);
      return { total: results.length, resultats: results.slice(0, MAX_RESULTS) };
    }
    default:
      return { erreur: `Outil inconnu : ${name}` };
  }
}
