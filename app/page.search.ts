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

export function getMatchPriority(
  query: string,
  mainValue: string | null | undefined,
  otherValues: Array<string | null | undefined>,
) {
  const normalizedMainValue = (mainValue ?? "").toLowerCase();
  const normalizedOtherValues = otherValues
    .filter((value): value is string => typeof value === "string")
    .map((value) => value.toLowerCase());

  if (normalizedMainValue === query) {
    return 0;
  }

  if (normalizedMainValue.startsWith(query)) {
    return 1;
  }

  if (normalizedMainValue.includes(query)) {
    return 2;
  }

  if (normalizedOtherValues.some((value) => value === query)) {
    return 3;
  }

  if (normalizedOtherValues.some((value) => value.startsWith(query))) {
    return 4;
  }

  if (normalizedOtherValues.some((value) => value.includes(query))) {
    return 5;
  }

  return null;
}

export function searchCompetences(query: string) {
  const normalizedQuery = query.toLowerCase();

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

export function searchUsefulLinks(query: string) {
  const normalizedQuery = query.toLowerCase();

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
