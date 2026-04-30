import competencesData from "@/data/competences.json";
import usefulLinksData from "@/data/useful-links.raw.json";

export type CompetenceEntry = {
  competence: string;
  personne: string;
  domaine: string;
  tag: string;
  niveau: string;
  nom_affiche?: string;
  person_id?: string;
};

export type UsefulLinkEntry = {
  Rubrique?: string | null;
  Qui?: string | null;
  Quoi?: string | null;
  Lien?: string | null;
};

const COMPETENCES = competencesData as CompetenceEntry[];
const USEFUL_LINKS = usefulLinksData as UsefulLinkEntry[];
const FALLBACK_STOP_WORDS = new Set([
  "a",
  "au",
  "aux",
  "ce",
  "cherche",
  "dans",
  "de",
  "des",
  "du",
  "et",
  "est",
  "est-ce",
  "info",
  "infos",
  "je",
  "la",
  "le",
  "les",
  "peux",
  "peux-tu",
  "que",
  "sais",
  "sinon",
  "sur",
  "trouver",
  "tu",
  "un",
  "une",
]);

function normalizeSearchValue(value: string) {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .trim();
}

export function getMatchPriority(
  query: string,
  mainValue: string | null | undefined,
  otherValues: Array<string | null | undefined>,
) {
  const normalizedQuery = normalizeSearchValue(query);
  const normalizedMainValue = normalizeSearchValue(mainValue ?? "");
  const normalizedOtherValues = otherValues
    .filter((value): value is string => typeof value === "string")
    .map(normalizeSearchValue);

  if (normalizedMainValue === normalizedQuery) {
    return 0;
  }

  if (normalizedMainValue.startsWith(normalizedQuery)) {
    return 1;
  }

  if (normalizedMainValue.includes(normalizedQuery)) {
    return 2;
  }

  if (normalizedOtherValues.some((value) => value === normalizedQuery)) {
    return 3;
  }

  if (normalizedOtherValues.some((value) => value.startsWith(normalizedQuery))) {
    return 4;
  }

  if (normalizedOtherValues.some((value) => value.includes(normalizedQuery))) {
    return 5;
  }

  return null;
}

function extractFallbackKeywords(query: string) {
  const tokens = normalizeSearchValue(query).match(/[\p{L}\p{N}-]+/gu) ?? [];
  const seen = new Set<string>();

  return tokens.filter((token) => {
    if (token.length <= 2 || FALLBACK_STOP_WORDS.has(token) || seen.has(token)) {
      return false;
    }

    seen.add(token);
    return true;
  });
}

function mergeUniqueResults<T>(resultGroups: T[][]) {
  const results: T[] = [];
  const seen = new Set<T>();

  resultGroups.forEach((group) => {
    group.forEach((entry) => {
      if (seen.has(entry)) {
        return;
      }

      seen.add(entry);
      results.push(entry);
    });
  });

  return results;
}

function searchCompetencesByQuery(query: string) {
  const normalizedQuery = normalizeSearchValue(query);

  return COMPETENCES.map((entry, index) => ({
    entry,
    index,
    priority: getMatchPriority(normalizedQuery, entry.competence, [
      entry.nom_affiche,
      entry.personne,
      entry.domaine,
      entry.tag,
    ]),
  }))
    .filter(
      (
        result,
      ): result is {
        entry: CompetenceEntry;
        index: number;
        priority: number;
      } => result.priority !== null,
    )
    .sort((left, right) => left.priority - right.priority || left.index - right.index)
    .map(({ entry }) => entry);
}

function searchUsefulLinksByQuery(query: string) {
  const normalizedQuery = normalizeSearchValue(query);

  return USEFUL_LINKS.map((entry, index) => ({
    entry,
    index,
    priority: getMatchPriority(normalizedQuery, entry.Quoi ?? entry.Lien, [
      entry.Rubrique,
      entry.Qui,
      entry.Lien,
    ]),
  }))
    .filter(
      (
        result,
      ): result is {
        entry: UsefulLinkEntry;
        index: number;
        priority: number;
      } => result.priority !== null,
    )
    .sort((left, right) => left.priority - right.priority || left.index - right.index)
    .map(({ entry }) => entry);
}

export function searchCompetences(query: string) {
  return searchCompetencesByQuery(query);
}

export function searchUsefulLinks(query: string) {
  return searchUsefulLinksByQuery(query);
}

export function searchChatResults(query: string) {
  const competences = searchCompetencesByQuery(query);
  const usefulLinks = searchUsefulLinksByQuery(query);

  if (competences.length > 0 || usefulLinks.length > 0) {
    return { competences, usefulLinks };
  }

  const keywords = extractFallbackKeywords(query);

  if (keywords.length === 0) {
    return { competences, usefulLinks };
  }

  return {
    competences: mergeUniqueResults(keywords.map(searchCompetencesByQuery)),
    usefulLinks: mergeUniqueResults(keywords.map(searchUsefulLinksByQuery)),
  };
}
