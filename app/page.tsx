"use client";

import Link from "next/link";
import Image from "next/image";
import { type FormEvent, useEffect, useRef, useState } from "react";
import {
  searchChatResults,
  type CompetenceEntry,
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
};

const INITIAL_MESSAGES: Message[] = [];

const RESULTS_BOBBEE_REPLY =
  "J'ai trouve quelques elements qui peuvent t'aider.";
const EMPTY_BOBBEE_REPLY =
  "Je n'ai pas trouve de resultat clair pour l'instant. Essaie avec un autre mot-cle, un nom d'equipe ou une formulation plus precise.";
const BOBBEE_IMAGE_BY_STATE: Record<BobbeeState, string> = {
  idle: "/bobbee/bobbee-idle.png",
  thinking: "/bobbee/bobbee-thinking.png",
  found: "/bobbee/bobbee-found.png",
};
const THINKING_DURATION_MS = 700;
const FOUND_DURATION_MS = 700;
const LEVEL_LABELS: Record<string, string> = {
  a: "Expert / referent",
  b: "Bon niveau",
  r: "Ressource / relais",
};
const ALLOWED_PERSON_RESULT_LEVELS = new Set(["a", "r"]);
const ROUNDED_FONT_STACK =
  '"Arial Rounded MT Bold", "Trebuchet MS", Arial, sans-serif';

function getLevelLabel(level: string) {
  return LEVEL_LABELS[level.toLowerCase()] ?? null;
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

    const { competences, usefulLinks } = searchChatResults(trimmedMessage);
    const people = buildPeopleResults(competences);
    const links = usefulLinks;
    const hasResults = people.length > 0 || links.length > 0;

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
          results: hasResults ? { people, links } : undefined,
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
    <main className="relative min-h-screen overflow-hidden bg-zinc-50 px-6 py-12 text-zinc-950 sm:px-10 lg:flex lg:items-center lg:justify-center lg:p-0">
      <div className="home-desktop-stage relative z-10 mx-auto w-full lg:mx-0 lg:shrink-0">
      <Link
        href="/organigramme"
        target="_blank"
        rel="noreferrer"
        aria-label="Ouvrir l'organigramme"
        className="absolute left-[2.5%] top-[15%] z-20 hidden h-[28%] w-[22%] rounded-[28px] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-500 lg:block"
      >
        <span className="sr-only">Ouvrir l&apos;organigramme</span>
      </Link>

      <a
        href="https://isagri.atlassian.net/wiki/spaces/BO/pages/6166380545/Guide+d+Onboarding+D+veloppeur+Ma+do"
        target="_blank"
        rel="noreferrer"
        aria-label="Ouvrir la checklist onboarding"
        className="absolute left-[2.5%] top-[72%] z-20 hidden h-[24%] w-[22%] rounded-[28px] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-500 lg:block"
      >
        <span className="sr-only">Ouvrir la checklist onboarding</span>
      </a>

      <Link
        href="/presentation"
        aria-label="Decouvrir Bobbee"
        className="absolute left-[2.5%] top-[46%] z-20 hidden h-[25%] w-[22%] rounded-[28px] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-500 lg:block"
      >
        <span className="sr-only">Decouvrir Bobbee</span>
      </Link>

      {latestResults ? (
        <aside
          className="home-results-panel absolute right-[2.9%] top-[33%] z-20 hidden h-[48%] w-[17.6%] overflow-y-auto px-1.5 py-1 text-left lg:block"
          aria-label="Resultats de recherche"
        >
          <DesktopSearchResultsContent results={latestResults} />
        </aside>
      ) : (
        <aside
          className="absolute right-[2.9%] top-[33%] z-20 hidden h-[48%] w-[17.6%] items-center justify-center px-3 text-center lg:flex"
          aria-label="Resultats de recherche"
        >
          <p className="text-[13px] leading-5 text-zinc-500">
            Les résultats apparaîtront ici après votre recherche.
          </p>
        </aside>
      )}

      <section className="relative z-10 mx-auto flex min-h-[70vh] w-full max-w-3xl flex-col items-center justify-center gap-5 text-center lg:contents">
        <div
          className="w-full max-w-xs sm:max-w-sm lg:absolute lg:left-[50%] lg:top-[30%] lg:w-[20%] lg:max-w-none lg:-translate-x-1/2"
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
          className="w-full max-w-xl rounded-[30px] border border-white/70 bg-gradient-to-b from-amber-100/88 via-amber-50/78 to-white/96 p-3.5 text-left shadow-[0_28px_70px_-32px_rgba(24,24,27,0.55)] ring-1 ring-amber-300/45 sm:p-4 lg:absolute lg:left-[33%] lg:top-[65.5%] lg:flex lg:max-h-[34%] lg:w-[34%] lg:max-w-none lg:flex-col lg:overflow-hidden"
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
                  ) : null}
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
              placeholder="Pose ta question a Bobbee..."
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
      </div>

      <style>{`
        @media (min-width: 1024px) {
          .home-desktop-stage {
            aspect-ratio: 7 / 4;
            background-image: url("/home/home-background-map-desktop.png");
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
