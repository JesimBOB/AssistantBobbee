"use client";

import Link from "next/link";
import Image from "next/image";
import { type FormEvent, useEffect, useRef, useState } from "react";
import {
  searchChatResults,
  type CompetenceEntry,
  type JiraTopic,
  type UsefulLinkEntry,
} from "./page.search";

type Message = {
  role: "assistant" | "user";
  content: string;
  results?: SearchResults;
};

type BobbeeState = "idle" | "thinking" | "found";
type PersonMatch = {
  competence: string;
  domaine: string;
  niveau: string;
};

type PersonResult = {
  personId: string;
  nomAffiche: string;
  matches: PersonMatch[];
};

type SearchResults = {
  people: PersonResult[];
  links: UsefulLinkEntry[];
  jiraTopics: JiraTopic[];
};

const INITIAL_MESSAGES: Message[] = [];

const RESULTS_BOBBEE_REPLY =
  "J'ai trouvé quelques éléments qui peuvent t'aider.";
const EMPTY_BOBBEE_REPLY =
  "Je n'ai pas trouvé de résultat clair pour l'instant. Essaie avec un autre mot-clé, un nom d'équipe ou une formulation plus précise.";
const BOBBEE_IMAGE_BY_STATE: Record<BobbeeState, string> = {
  idle: "/bobbee/bobbee-idle.png",
  thinking: "/bobbee/bobbee-thinking.png",
  found: "/bobbee/bobbee-found.png",
};
const THINKING_DURATION_MS = 700;
const FOUND_DURATION_MS = 700;
// Nombre maximum de résultats affichés par rubrique (les plus pertinents d'abord).
const MAX_RESULTS_PER_SECTION = 6;
// Cartes de raccourcis de la home (ordinateur : colonne de gauche ; mobile : sous le chat).
const HOME_CARDS = [
  {
    title: "Organigramme",
    description: "Explore la ruche MAIDO et retrouve les équipes.",
    cta: "Voir l'organigramme",
    href: "/organigramme",
    external: false,
    image: "/home/card-organigramme.png",
    imageWidth: 132,
    imageHeight: 172,
  },
  {
    title: "Bobbee",
    description: "Bobbee et son histoire.",
    cta: "Découvrir Bobbee",
    href: "/presentation",
    external: false,
    image: "/home/card-bobbee.png",
    imageWidth: 152,
    imageHeight: 118,
  },
  {
    title: "Checklist onboarding",
    description: "Les étapes clés pour bien démarrer.",
    cta: "Voir la checklist",
    href: "https://isagri.atlassian.net/wiki/spaces/BO/pages/6166380545/Guide+d+Onboarding+D+veloppeur+Ma+do",
    external: true,
    image: "/home/card-checklist.png",
    imageWidth: 138,
    imageHeight: 168,
  },
];
// Projet Claude partagé : recherche dans Confluence, Teams et Outlook.
const CLAUDE_ASSISTANT_URL =
  "https://claude.ai/project/01a1d5a2-f43a-733c-838f-6ad6eede2d06";
const LEVEL_LABELS: Record<string, string> = {
  a: "Expert / référent",
  b: "Bon niveau",
  r: "Ressource / relais",
};
const ALLOWED_PERSON_RESULT_LEVELS = new Set(["a", "r"]);
const ROUNDED_FONT_STACK =
  '"Arial Rounded MT Bold", "Trebuchet MS", Arial, sans-serif';

function getLevelLabel(level: string) {
  return LEVEL_LABELS[level.toLowerCase()] ?? null;
}

// "2026-11-05" -> "11/2026"
function formatMonth(isoDate: string) {
  const [year, month] = isoDate.split("-");
  return year && month ? `${month}/${year}` : "";
}

function isAllowedPersonResultLevel(level: string) {
  return ALLOWED_PERSON_RESULT_LEVELS.has(level.toLowerCase());
}

function buildPeopleResults(entries: CompetenceEntry[]) {
  const peopleById = new Map<
    string,
    {
      personId: string;
      nomAffiche: string;
      matches: PersonMatch[];
      matchKeys: Set<string>;
    }
  >();

  entries.forEach((entry) => {
    if (!isAllowedPersonResultLevel(entry.niveau)) {
      return;
    }

    const personId = entry.person_id?.trim() || entry.personne;
    const currentPerson =
      peopleById.get(personId) ??
      {
        personId,
        nomAffiche: entry.nom_affiche?.trim() || entry.personne,
        matches: [],
        matchKeys: new Set<string>(),
      };
    const matchKey = [entry.competence, entry.domaine, entry.niveau].join("::");

    if (!currentPerson.matchKeys.has(matchKey)) {
      currentPerson.matches.push({
        competence: entry.competence,
        domaine: entry.domaine,
        niveau: entry.niveau,
      });
      currentPerson.matchKeys.add(matchKey);
    }

    peopleById.set(personId, currentPerson);
  });

  return Array.from(peopleById.values()).map((person) => ({
    personId: person.personId,
    nomAffiche: person.nomAffiche,
    matches: person.matches,
  }));
}

function SearchResultsContent({ results }: { results: SearchResults }) {
  return (
    <>
      {results.jiraTopics.length > 0 ? (
        <div className="space-y-3.5">
          <p className="inline-flex rounded-full bg-zinc-900 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-amber-100 shadow-[0_10px_18px_-16px_rgba(24,24,27,0.8)]">
            Ont travaillé dessus
          </p>
          <div className="space-y-3.5">
            {results.jiraTopics.map((topic) => (
              <article
                key={topic.id}
                className="rounded-[24px] bg-gradient-to-br from-amber-100/90 via-amber-50/85 to-white p-4 shadow-[0_18px_30px_-24px_rgba(161,98,7,0.55)] ring-1 ring-amber-300/80"
              >
                <p className="text-base font-semibold text-zinc-900">
                  {topic.label}
                </p>
                <p className="mt-0.5 text-[12px] text-zinc-500">
                  Tickets Jira terminés sur 12 mois
                </p>
                <div className="mt-3 flex flex-col gap-2.5">
                  {topic.people.map((person) => (
                    <div
                      key={`${topic.id}::${person.name}`}
                      className="rounded-[18px] bg-white/95 px-3.5 py-3 shadow-[0_12px_24px_-22px_rgba(24,24,27,0.45)] ring-1 ring-amber-100"
                    >
                      <div className="flex flex-wrap items-start justify-between gap-2">
                        <p className="min-w-0 flex-1 text-[15px] font-medium text-zinc-900">
                          {person.name}
                        </p>
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="rounded-full bg-amber-300/90 px-2.5 py-1 text-[11px] font-semibold text-amber-950 ring-1 ring-amber-400/70">
                            {person.role}
                          </span>
                          <span className="rounded-full bg-zinc-100 px-2.5 py-1 text-[11px] font-medium text-zinc-600 ring-1 ring-zinc-200">
                            {person.pole}
                          </span>
                        </div>
                      </div>
                      <p className="mt-1.5 text-[12px] text-zinc-500">
                        {person.count} ticket{person.count > 1 ? "s" : ""}, dernier en {formatMonth(person.lastResolved)}
                      </p>
                    </div>
                  ))}
                </div>
              </article>
            ))}
          </div>
        </div>
      ) : null}

      {results.people.length > 0 ? (
        <div className="space-y-3.5">
          <p className="inline-flex rounded-full bg-zinc-900 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-amber-100 shadow-[0_10px_18px_-16px_rgba(24,24,27,0.8)]">
            Personnes
          </p>
          <div className="space-y-3.5">
            {results.people.map((person) => (
              <article
                key={person.personId}
                className="rounded-[24px] bg-gradient-to-br from-amber-100/90 via-amber-50/85 to-white p-4 shadow-[0_18px_30px_-24px_rgba(161,98,7,0.55)] ring-1 ring-amber-300/80"
              >
                <p className="text-base font-semibold text-zinc-900">
                  {person.nomAffiche}
                </p>
                <div className="mt-3 flex flex-col gap-2.5">
                  {person.matches.map((match) => {
                    const levelLabel = getLevelLabel(match.niveau);

                    return (
                      <div
                        key={[
                          person.personId,
                          match.competence,
                          match.domaine,
                          match.niveau,
                        ].join("::")}
                        className="rounded-[18px] bg-white/95 px-3.5 py-3 shadow-[0_12px_24px_-22px_rgba(24,24,27,0.45)] ring-1 ring-amber-100"
                      >
                        <div className="flex flex-wrap items-start justify-between gap-2">
                          <p className="min-w-0 flex-1 text-[15px] font-medium text-zinc-900">
                            {match.competence}
                          </p>
                          <div className="flex flex-wrap items-center gap-2">
                            {levelLabel ? (
                              <span className="rounded-full bg-amber-300/90 px-2.5 py-1 text-[11px] font-semibold text-amber-950 ring-1 ring-amber-400/70">
                                {levelLabel}
                              </span>
                            ) : null}
                            {match.domaine ? (
                              <span className="rounded-full bg-zinc-100 px-2.5 py-1 text-[11px] font-medium text-zinc-600 ring-1 ring-zinc-200">
                                {match.domaine}
                              </span>
                            ) : null}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </article>
            ))}
          </div>
        </div>
      ) : null}

      {results.links.length > 0 ? (
        <div className="space-y-3.5">
          <p className="inline-flex rounded-full bg-amber-200/80 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-zinc-900 ring-1 ring-amber-300/80">
            Liens utiles
          </p>
          <div className="space-y-3">
            {results.links.map((link, linkIndex) => (
              <article
                key={[
                  link.Rubrique,
                  link.Qui,
                  link.Quoi,
                  link.Lien,
                  linkIndex,
                ].join("::")}
                className="rounded-[22px] bg-white/92 p-3.5 shadow-[0_16px_28px_-24px_rgba(24,24,27,0.35)] ring-1 ring-amber-100"
              >
                {link.Rubrique ? (
                  <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-zinc-500">
                    {link.Rubrique}
                  </p>
                ) : null}
                {link.Quoi ? (
                  <p className="mt-1.5 text-[15px] font-semibold text-zinc-900">
                    {link.Quoi}
                  </p>
                ) : null}
                {link.Qui ? (
                  <p className="mt-1.5 text-[15px] text-zinc-600">
                    {link.Qui}
                  </p>
                ) : null}
                {link.Lien ? (
                  <a
                    href={link.Lien}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-3 inline-flex rounded-full bg-zinc-900 px-3.5 py-1.5 text-sm font-medium text-amber-50 no-underline shadow-[0_12px_20px_-16px_rgba(24,24,27,0.8)] transition-colors hover:bg-zinc-800"
                  >
                    Ouvrir le lien
                  </a>
                ) : null}
              </article>
            ))}
          </div>
        </div>
      ) : null}
    </>
  );
}

function DesktopSearchResultsContent({ results }: { results: SearchResults }) {
  return (
    <div className="flex w-full min-w-0 flex-col gap-3.5 pr-1">
      {results.jiraTopics.length > 0 ? (
        <section className="min-w-0 space-y-2.5">
          <p className="inline-flex max-w-full rounded-full bg-zinc-900/88 px-2.5 py-1 text-[10px] font-semibold uppercase leading-4 tracking-[0.12em] text-amber-100 shadow-[0_8px_14px_-12px_rgba(24,24,27,0.75)]">
            ONT TRAVAILLÉ DESSUS
          </p>

          <div className="flex w-full min-w-0 flex-col gap-2.5">
            {results.jiraTopics.map((topic) => (
              <article
                key={topic.id}
                className="w-full min-w-0 rounded-[14px] bg-amber-50/72 px-3 py-2.5 text-zinc-900 shadow-[0_10px_18px_-18px_rgba(120,53,15,0.28)] ring-1 ring-amber-200/45"
              >
                <p className="break-words text-[14px] font-semibold leading-5">
                  {topic.label}
                </p>
                <p className="text-[10px] leading-4 text-zinc-500">
                  Tickets Jira terminés sur 12 mois
                </p>

                <div className="mt-2.5 flex flex-col gap-2">
                  {topic.people.map((person) => (
                    <div
                      key={`${topic.id}::${person.name}`}
                      className="border-l-2 border-amber-300/55 pl-2"
                    >
                      <p className="break-words text-[12px] font-medium leading-4 text-zinc-900">
                        {person.name}
                      </p>

                      <div className="mt-1.5 flex max-w-full flex-wrap gap-1.5">
                        <span className="rounded-full bg-amber-300/80 px-1.5 py-0.5 text-[10px] font-semibold leading-3 text-amber-950 ring-1 ring-amber-400/50">
                          {person.role}
                        </span>
                        <span className="rounded-full bg-white/70 px-1.5 py-0.5 text-[10px] font-medium leading-3 text-zinc-600 ring-1 ring-amber-100">
                          {person.pole}
                        </span>
                      </div>
                      <p className="mt-1 text-[10px] leading-3 text-zinc-500">
                        {person.count} ticket{person.count > 1 ? "s" : ""}, dernier en {formatMonth(person.lastResolved)}
                      </p>
                    </div>
                  ))}
                </div>
              </article>
            ))}
          </div>
        </section>
      ) : null}

      {results.people.length > 0 ? (
        <section className="min-w-0 space-y-2.5">
          <p className="inline-flex max-w-full rounded-full bg-zinc-900/88 px-2.5 py-1 text-[10px] font-semibold uppercase leading-4 tracking-[0.12em] text-amber-100 shadow-[0_8px_14px_-12px_rgba(24,24,27,0.75)]">
            PERSONNES
          </p>

          <div className="flex w-full min-w-0 flex-col gap-2.5">
            {results.people.map((person) => (
              <article
                key={person.personId}
                className="w-full min-w-0 rounded-[14px] bg-amber-50/72 px-3 py-2.5 text-zinc-900 shadow-[0_10px_18px_-18px_rgba(120,53,15,0.28)] ring-1 ring-amber-200/45"
              >
                <p className="break-words text-[14px] font-semibold leading-5">
                  {person.nomAffiche}
                </p>

                <div className="mt-2.5 flex flex-col gap-2">
                  {person.matches.map((match) => {
                    const levelLabel = getLevelLabel(match.niveau);

                    return (
                      <div
                        key={[
                          person.personId,
                          match.competence,
                          match.domaine,
                          match.niveau,
                        ].join("::")}
                        className="border-l-2 border-amber-300/55 pl-2"
                      >
                        <p className="break-words text-[12px] font-medium leading-4 text-zinc-900">
                          {match.competence}
                        </p>

                        <div className="mt-1.5 flex max-w-full flex-wrap gap-1.5">
                          {levelLabel ? (
                            <span className="rounded-full bg-amber-300/80 px-1.5 py-0.5 text-[10px] font-semibold leading-3 text-amber-950 ring-1 ring-amber-400/50">
                              {levelLabel}
                            </span>
                          ) : null}
                          {match.domaine ? (
                            <span className="rounded-full bg-white/70 px-1.5 py-0.5 text-[10px] font-medium leading-3 text-zinc-600 ring-1 ring-amber-100">
                              {match.domaine}
                            </span>
                          ) : null}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </article>
            ))}
          </div>
        </section>
      ) : null}

      {results.links.length > 0 ? (
        <section className="min-w-0 space-y-2.5">
          <p className="inline-flex max-w-full rounded-full bg-amber-200/85 px-2.5 py-1 text-[10px] font-semibold uppercase leading-4 tracking-[0.12em] text-zinc-900 shadow-[0_8px_14px_-12px_rgba(120,53,15,0.35)] ring-1 ring-amber-300/60">
            LIENS UTILES
          </p>

          <div className="flex w-full min-w-0 flex-col gap-2.5">
            {results.links.map((link, linkIndex) => (
              <article
                key={[
                  link.Rubrique,
                  link.Qui,
                  link.Quoi,
                  link.Lien,
                  linkIndex,
                ].join("::")}
                className="w-full min-w-0 rounded-[14px] bg-amber-50/72 px-3 py-2.5 text-zinc-900 shadow-[0_10px_18px_-18px_rgba(120,53,15,0.28)] ring-1 ring-amber-200/45"
              >
                {link.Quoi ? (
                  <p className="break-words text-[13px] font-semibold leading-5">
                    {link.Quoi}
                  </p>
                ) : null}
                {link.Rubrique ? (
                  <p className="mt-1.5 break-words text-[10px] font-semibold uppercase leading-3 tracking-[0.1em] text-zinc-500">
                    {link.Rubrique}
                  </p>
                ) : null}
                {link.Qui ? (
                  <p className="mt-1.5 break-words text-[12px] leading-4 text-zinc-600">
                    {link.Qui}
                  </p>
                ) : null}
                {link.Lien ? (
                  <a
                    href={link.Lien}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-2 inline-flex rounded-full bg-zinc-900 px-2.5 py-1 text-[11px] font-medium leading-4 text-amber-50 no-underline shadow-[0_8px_14px_-12px_rgba(24,24,27,0.75)] transition-colors hover:bg-zinc-800"
                  >
                    Ouvrir le lien
                  </a>
                ) : null}
              </article>
            ))}
          </div>
        </section>
      ) : null}
    </div>
  );
}

export default function Home() {
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<Message[]>(INITIAL_MESSAGES);
  const [bobbeeState, setBobbeeState] = useState<BobbeeState>("idle");
  const timeoutIdsRef = useRef<number[]>([]);
  const searchRequestIdRef = useRef(0);
  const activeUserMessage =
    messages.findLast((entry) => entry.role === "user") ?? null;
  const activeAssistantMessage =
    messages.findLast((entry) => entry.role === "assistant") ?? null;
  const latestResults = activeAssistantMessage?.results ?? null;
  const hasChatMessages =
    activeUserMessage !== null || activeAssistantMessage !== null;

  function clearPendingTimeouts() {
    timeoutIdsRef.current.forEach((timeoutId) => {
      window.clearTimeout(timeoutId);
    });
    timeoutIdsRef.current = [];
  }

  useEffect(() => {
    return () => {
      clearPendingTimeouts();
    };
  }, []);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const trimmedMessage = message.trim();

    if (!trimmedMessage) {
      return;
    }

    clearPendingTimeouts();
    const requestId = searchRequestIdRef.current + 1;
    searchRequestIdRef.current = requestId;

    const { competences, usefulLinks, jiraTopics } =
      searchChatResults(trimmedMessage);
    const people = buildPeopleResults(competences).slice(
      0,
      MAX_RESULTS_PER_SECTION,
    );
    const links = usefulLinks.slice(0, MAX_RESULTS_PER_SECTION);
    const hasResults =
      people.length > 0 || links.length > 0 || jiraTopics.length > 0;

    setMessages([{ role: "user", content: trimmedMessage }]);
    setMessage("");
    setBobbeeState("thinking");

    const thinkingTimeoutId = window.setTimeout(() => {
      timeoutIdsRef.current = timeoutIdsRef.current.filter(
        (timeoutId) => timeoutId !== thinkingTimeoutId,
      );

      if (searchRequestIdRef.current !== requestId) {
        return;
      }

      setMessages([
        { role: "user", content: trimmedMessage },
        {
          role: "assistant",
          content: hasResults ? RESULTS_BOBBEE_REPLY : EMPTY_BOBBEE_REPLY,
          results: hasResults ? { people, links, jiraTopics } : undefined,
        },
      ]);

      if (!hasResults) {
        setBobbeeState("idle");
        return;
      }

      setBobbeeState("found");

      const foundTimeoutId = window.setTimeout(() => {
        timeoutIdsRef.current = timeoutIdsRef.current.filter(
          (timeoutId) => timeoutId !== foundTimeoutId,
        );
        if (searchRequestIdRef.current !== requestId) {
          return;
        }
        setBobbeeState("idle");
      }, FOUND_DURATION_MS);

      timeoutIdsRef.current.push(foundTimeoutId);
    }, THINKING_DURATION_MS);

    timeoutIdsRef.current.push(thinkingTimeoutId);
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-zinc-50 bg-[url('/backgrounds/internal-page-background.png')] bg-cover bg-top px-6 py-12 text-zinc-950 sm:px-10 lg:flex lg:items-center lg:justify-center lg:bg-none lg:p-0">
      <div className="home-desktop-stage @container relative z-10 mx-auto w-full lg:mx-0 lg:shrink-0">
      <Link
        href="/essentiels"
        className="mb-4 inline-flex w-fit min-w-[150px] items-center gap-2.5 rounded-full border-2 border-amber-400 bg-[linear-gradient(135deg,#fff7d6_0%,#fde68a_52%,#fef3c7_100%)] px-4 py-2 text-sm font-semibold text-amber-950 shadow-[0_14px_26px_-18px_rgba(146,64,14,0.85),0_3px_0_rgba(180,83,9,0.18)] ring-1 ring-white/80 transition-colors hover:border-amber-500 hover:bg-amber-100 lg:absolute lg:left-[2.5%] lg:top-[6.5%] lg:z-20 lg:mb-0"
      >
        <span
          className="text-3xl leading-none text-orange-500 drop-shadow-[0_2px_0_rgba(120,53,15,0.18)]"
          aria-hidden="true"
        >
          ★
        </span>
        <span>Les essentiels</span>
      </Link>

      <header className="mx-auto mt-6 max-w-md text-center lg:absolute lg:left-[35.5%] lg:top-[5%] lg:z-20 lg:mt-0 lg:w-[34%] lg:max-w-none">
        <h1
          className="rounded-[22px] border-[3px] border-amber-700/80 bg-[linear-gradient(180deg,#fff6e0_0%,#fbe3b5_100%)] px-5 py-3 shadow-[0_5px_0_rgba(146,64,14,0.35),0_18px_30px_-20px_rgba(120,53,15,0.7)] lg:rounded-[1.6cqw] lg:border-[0.25cqw] lg:px-[2cqw] lg:py-[1cqw]"
          style={{ fontFamily: ROUNDED_FONT_STACK }}
        >
          <span className="block text-[26px] leading-tight text-zinc-900 lg:text-[2.5cqw]">
            Une question ?
          </span>
          <span className="block text-[34px] leading-tight text-amber-400 [-webkit-text-stroke:2px_#3f2a14] [paint-order:stroke_fill] lg:text-[3.3cqw] lg:[-webkit-text-stroke:0.22cqw_#3f2a14]">
            Suivez le guide.
          </span>
        </h1>
        <p className="mt-3 text-sm leading-6 text-zinc-700 lg:mt-[0.9cqw] lg:text-[1.05cqw] lg:leading-normal">
          Info, personne, équipe, sujet :{" "}
          <span className="font-semibold text-orange-500">Bobbee</span>{" "}
          t&apos;aide à retrouver le bon chemin.
        </p>
      </header>

      <div
        aria-hidden="true"
        className="pointer-events-none absolute bottom-[3.8%] left-[78.3%] right-[1.6%] top-[17.5%] z-10 hidden rounded-[2cqw] border border-amber-200/80 bg-[#fdf3e1]/85 shadow-[0_18px_40px_-30px_rgba(120,53,15,0.55)] lg:block"
      >
        <p
          className="absolute left-[8%] top-[3%] flex items-center gap-[0.5cqw] text-[1.45cqw] font-bold text-zinc-900"
          style={{ fontFamily: ROUNDED_FONT_STACK }}
        >
          Résultats <span className="text-amber-400">✦</span>
        </p>
      </div>

      {latestResults ? (
        <aside
          className="home-results-panel absolute right-[2.9%] top-[25%] z-20 hidden h-[68%] w-[17.6%] overflow-y-auto px-1.5 py-1 text-left lg:block"
          aria-label="Résultats de recherche"
        >
          <DesktopSearchResultsContent results={latestResults} />
        </aside>
      ) : (
        <aside
          className="absolute right-[2.9%] top-[25%] z-20 hidden h-[68%] w-[17.6%] items-center justify-center px-3 text-center lg:flex"
          aria-label="Résultats de recherche"
        >
          {activeAssistantMessage ? (
            <div className="flex flex-col items-center gap-3">
              <p className="text-[13px] leading-5 text-zinc-500">
                L&apos;assistant Claude peut chercher pour toi dans Confluence,
                Teams et Outlook.
              </p>
              <a
                href={CLAUDE_ASSISTANT_URL}
                target="_blank"
                rel="noreferrer"
                className="inline-flex rounded-full bg-zinc-900 px-3 py-1.5 text-[12px] font-medium text-amber-50 no-underline shadow-[0_8px_14px_-12px_rgba(24,24,27,0.75)] transition-colors hover:bg-zinc-800"
              >
                Demander à l&apos;assistant Claude
              </a>
            </div>
          ) : (
            <p className="text-[13px] leading-5 text-zinc-500">
              Les résultats apparaîtront ici après votre recherche.
            </p>
          )}
        </aside>
      )}

      <section className="relative z-10 mx-auto mt-4 flex w-full max-w-3xl flex-col items-center gap-5 text-center lg:contents">
        <div
          className="w-full max-w-[11rem] sm:max-w-[13rem] lg:absolute lg:left-[52%] lg:top-[30%] lg:w-[20%] lg:max-w-none lg:-translate-x-1/2"
          style={
            bobbeeState === "idle"
              ? { animation: "bobbeeIdleFloat 6s ease-in-out infinite" }
              : undefined
          }
        >
          <Image
            src={BOBBEE_IMAGE_BY_STATE[bobbeeState]}
            alt="Bobbee"
            width={480}
            height={480}
            priority
            className="mx-auto h-auto w-full"
          />
        </div>

        <section
          className="w-full max-w-xl rounded-[30px] border border-white/70 bg-gradient-to-b from-amber-100/88 via-amber-50/78 to-white/96 p-3.5 text-left shadow-[0_28px_70px_-32px_rgba(24,24,27,0.55)] ring-1 ring-amber-300/45 sm:p-4 lg:absolute lg:left-[35%] lg:top-[65.5%] lg:flex lg:max-h-[34%] lg:w-[34%] lg:max-w-none lg:flex-col lg:overflow-hidden"
          aria-label="Chat Bobbee"
        >
          {hasChatMessages ? (
            <div className="flex max-h-[35rem] flex-col gap-3 overflow-y-auto rounded-[24px] bg-white/35 px-1.5 py-1.5 pr-1.5 lg:min-h-0 lg:flex-1 lg:overflow-visible">
              {activeUserMessage ? (
                <div
                  className="rounded-[26px] rounded-br-lg bg-zinc-900 px-4 py-3.5 text-[15px] leading-7 break-words text-white shadow-[0_20px_30px_-24px_rgba(24,24,27,0.85)] sm:max-w-md sm:self-end sm:text-base"
                >
                  <p className="whitespace-pre-line">
                    {activeUserMessage.content}
                  </p>
                </div>
              ) : null}

              {activeAssistantMessage ? (
                <div
                  className={[
                    "rounded-[26px] rounded-bl-lg bg-white/96 px-4 py-3.5 text-[15px] leading-7 break-words text-zinc-800 shadow-[0_18px_30px_-24px_rgba(24,24,27,0.45)] ring-1 ring-amber-200/80 sm:text-base",
                    activeAssistantMessage.results ? "max-w-full" : "max-w-md",
                  ].join(" ")}
                >
                  <p className="whitespace-pre-line">
                    {activeAssistantMessage.content}
                  </p>

                  {activeAssistantMessage.results ? (
                    <div className="mt-4 space-y-5 border-t border-amber-200/80 pt-4 lg:hidden">
                      <SearchResultsContent
                        results={activeAssistantMessage.results}
                      />
                    </div>
                  ) : (
                    <a
                      href={CLAUDE_ASSISTANT_URL}
                      target="_blank"
                      rel="noreferrer"
                      className="mt-3 inline-flex rounded-full bg-zinc-900 px-3.5 py-1.5 text-sm font-medium text-amber-50 no-underline shadow-[0_12px_20px_-16px_rgba(24,24,27,0.8)] transition-colors hover:bg-zinc-800 lg:hidden"
                    >
                      Demander à l&apos;assistant Claude
                    </a>
                  )}
                </div>
              ) : null}
            </div>
          ) : null}

          <form
            onSubmit={handleSubmit}
            className={[
              "flex flex-col gap-2 rounded-[24px] border border-white/80 bg-white/95 p-1.5 shadow-[0_18px_36px_-24px_rgba(24,24,27,0.55)] ring-1 ring-amber-200/55 sm:flex-row sm:items-center",
              hasChatMessages ? "mt-4" : "",
            ].join(" ")}
          >
            <input
              type="text"
              value={message}
              onChange={(event) => setMessage(event.target.value)}
              placeholder="Pose ta question à Bobbee..."
              aria-label="Champ de chat Bobbee"
              className="min-w-0 flex-1 rounded-[18px] bg-transparent px-4 py-3.5 text-[15px] text-zinc-800 outline-none placeholder:text-zinc-400 focus:bg-white/75 sm:text-base"
            />
            <button
              type="submit"
              className="rounded-[18px] bg-zinc-900 px-4 py-3.5 text-[15px] font-semibold text-amber-50 shadow-[0_16px_28px_-18px_rgba(24,24,27,0.85)] ring-1 ring-zinc-700/60 transition-colors hover:bg-zinc-800 sm:px-5"
              style={{ fontFamily: ROUNDED_FONT_STACK }}
            >
              Envoyer
            </button>
          </form>
        </section>
      </section>

      <nav
        aria-label="Raccourcis"
        className="relative z-10 mx-auto mt-8 grid w-full max-w-3xl gap-4 sm:grid-cols-3 lg:absolute lg:bottom-[4%] lg:left-[2.5%] lg:top-[15%] lg:z-20 lg:mt-0 lg:flex lg:w-[22%] lg:max-w-none lg:flex-col lg:gap-[1.2cqw]"
      >
        {HOME_CARDS.map((card) => {
          const content = (
            <>
              <span className="relative z-10 flex min-h-full w-full flex-col text-left">
                <span
                  className="w-[60%] text-[19px] leading-tight text-zinc-900 sm:w-full lg:w-[60%] lg:text-[1.75cqw]"
                  style={{ fontFamily: ROUNDED_FONT_STACK }}
                >
                  {card.title}
                </span>
                <span className="mb-3 mt-1.5 w-[60%] text-[13px] leading-5 text-zinc-700 sm:w-full lg:mb-[0.6cqw] lg:mt-[0.5cqw] lg:w-[60%] lg:text-[clamp(11px,0.95cqw,14px)] lg:leading-snug">
                  {card.description}
                </span>
                <span className="mt-auto inline-flex w-fit items-center gap-1.5 whitespace-nowrap rounded-full bg-amber-300 px-3 py-1.5 text-[13px] font-semibold text-amber-950 shadow-[0_6px_14px_-10px_rgba(146,64,14,0.9)] transition-colors group-hover:bg-amber-400 lg:mt-auto lg:px-[0.9cqw] lg:py-[0.45cqw] lg:text-[clamp(11px,0.95cqw,14px)]">
                  {card.cta}
                  <span aria-hidden="true">→</span>
                </span>
              </span>
              <Image
                src={card.image}
                alt=""
                width={card.imageWidth}
                height={card.imageHeight}
                unoptimized
                className="absolute right-[5%] top-[10%] h-[58%] w-auto max-w-[35%] object-contain object-top sm:hidden lg:block"
              />
            </>
          );
          const className =
            "group relative flex min-h-[9.5rem] overflow-hidden rounded-[24px] border border-amber-200/90 bg-[#fdeed7] p-4 no-underline shadow-[0_16px_30px_-24px_rgba(120,53,15,0.7)] transition-shadow hover:shadow-[0_18px_34px_-20px_rgba(120,53,15,0.75)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-500 lg:min-h-0 lg:flex-1 lg:rounded-[1.6cqw] lg:p-[1.3cqw]";

          return card.external ? (
            <a
              key={card.title}
              href={card.href}
              target="_blank"
              rel="noreferrer"
              className={className}
            >
              {content}
            </a>
          ) : (
            <Link key={card.title} href={card.href} className={className}>
              {content}
            </Link>
          );
        })}
      </nav>
      </div>

      <style>{`
        @media (min-width: 1024px) {
          .home-desktop-stage {
            aspect-ratio: 7 / 4;
            background-image: url("/backgrounds/internal-page-background.png");
            background-position: center center;
            background-repeat: no-repeat;
            background-size: contain;
            max-width: 1400px;
            width: calc(100% - 2rem);
          }

          .home-results-panel {
            overscroll-behavior: contain;
            scrollbar-color: rgba(146, 64, 14, 0.28) transparent;
            scrollbar-width: thin;
          }

          .home-results-panel::-webkit-scrollbar {
            width: 6px;
          }

          .home-results-panel::-webkit-scrollbar-track {
            background: transparent;
          }

          .home-results-panel::-webkit-scrollbar-thumb {
            background-color: rgba(146, 64, 14, 0.24);
            border-radius: 999px;
          }

        }

        @keyframes bobbeeIdleFloat {
          0%,
          100% {
            transform: translateY(0);
          }

          50% {
            transform: translateY(-8px);
          }
        }
      `}</style>
    </main>
  );
}
