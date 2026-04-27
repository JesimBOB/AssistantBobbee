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
const ROUNDED_FONT_STACK =
  '"Arial Rounded MT Bold", "Trebuchet MS", Arial, sans-serif';

function getLevelLabel(level: string) {
  return LEVEL_LABELS[level.toLowerCase()] ?? null;
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

export default function Home() {
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<Message[]>(INITIAL_MESSAGES);
  const [bobbeeState, setBobbeeState] = useState<BobbeeState>("idle");
  const timeoutIdsRef = useRef<number[]>([]);
  const latestMessage = messages[messages.length - 1];
  const latestResults =
    latestMessage?.role === "assistant" ? latestMessage.results : null;

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

    const { competences, usefulLinks } = searchChatResults(trimmedMessage);
    const people = buildPeopleResults(competences);
    const links = usefulLinks;
    const hasResults = people.length > 0 || links.length > 0;

    setMessages((currentMessages) => [
      ...currentMessages,
      { role: "user", content: trimmedMessage },
    ]);
    setMessage("");
    setBobbeeState("thinking");

    const thinkingTimeoutId = window.setTimeout(() => {
      timeoutIdsRef.current = timeoutIdsRef.current.filter(
        (timeoutId) => timeoutId !== thinkingTimeoutId,
      );

      setMessages((currentMessages) => [
        ...currentMessages,
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
        setBobbeeState("idle");
      }, FOUND_DURATION_MS);

      timeoutIdsRef.current.push(foundTimeoutId);
    }, THINKING_DURATION_MS);

    timeoutIdsRef.current.push(thinkingTimeoutId);
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-zinc-50 px-6 py-12 text-zinc-950 sm:px-10 lg:py-4">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 hidden bg-[url('/home/home-background-map-desktop.png')] bg-contain bg-top bg-no-repeat lg:block"
      />

      <Link
        href="/organigramme"
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

      {latestResults ? (
        <aside
          className="absolute right-[4.5%] top-[25%] z-20 hidden h-[62vh] w-[20%] overflow-y-auto rounded-[28px] bg-white/45 p-3 text-left shadow-[0_18px_40px_-32px_rgba(24,24,27,0.45)] backdrop-blur-[1px] lg:block"
          aria-label="Résultats de recherche"
        >
          <div className="space-y-5">
            <SearchResultsContent results={latestResults} />
          </div>
        </aside>
      ) : null}

      <section className="relative z-10 mx-auto flex min-h-[70vh] w-full max-w-3xl flex-col items-center justify-center gap-5 text-center lg:min-h-[calc(100vh-2rem)] lg:max-w-2xl lg:justify-start lg:gap-3 lg:pt-[clamp(13rem,30vh,20rem)]">
        <div
          className="w-full max-w-xs sm:max-w-sm lg:max-w-[17rem]"
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
          className="w-full max-w-xl rounded-[32px] border border-amber-200/80 bg-gradient-to-b from-amber-100/85 via-amber-50/70 to-white p-3 text-left shadow-[0_24px_55px_-30px_rgba(24,24,27,0.45)] ring-1 ring-zinc-900/5 sm:p-4 lg:max-w-md"
          aria-label="Chat Bobbee"
        >
          <div className="flex max-h-[35rem] flex-col gap-3 overflow-y-auto rounded-[26px] bg-white/30 px-1 py-1 pr-1">
            {messages.map((entry, index) => (
              <div
                key={`${entry.role}-${index}`}
                className={[
                  "rounded-[26px] px-4 py-3.5 text-[15px] leading-7 break-words shadow-[0_18px_30px_-24px_rgba(24,24,27,0.45)] sm:text-base",
                  entry.role === "assistant"
                    ? entry.results
                      ? "max-w-full rounded-bl-lg bg-white/96 text-zinc-800 ring-1 ring-amber-200/80"
                      : "max-w-md rounded-bl-lg bg-white/96 text-zinc-800 ring-1 ring-amber-200/80"
                    : "rounded-br-lg bg-zinc-900 text-white shadow-[0_20px_30px_-24px_rgba(24,24,27,0.85)] sm:max-w-md sm:self-end",
                ].join(" ")}
              >
                <p className="whitespace-pre-line">{entry.content}</p>

                {entry.results ? (
                  <div className="mt-4 space-y-5 border-t border-amber-200/80 pt-4 lg:hidden">
                    <SearchResultsContent results={entry.results} />
                  </div>
                ) : null}
              </div>
            ))}
          </div>

          <form
            onSubmit={handleSubmit}
            className="mt-4 flex flex-col gap-2 rounded-[26px] bg-white/92 p-1.5 shadow-[0_18px_32px_-24px_rgba(24,24,27,0.45)] ring-1 ring-zinc-900/8 sm:flex-row sm:items-center"
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
              className="rounded-[18px] bg-amber-300 px-4 py-3.5 text-[15px] font-semibold text-zinc-950 shadow-[0_14px_24px_-18px_rgba(180,83,9,0.65)] ring-1 ring-amber-400/60 transition-colors hover:bg-amber-200 sm:px-5"
              style={{ fontFamily: ROUNDED_FONT_STACK }}
            >
              Envoyer
            </button>
          </form>

          <p className="mt-3 text-xs leading-5 text-zinc-600">
            Le chat sera active progressivement si necessaire.
          </p>
        </section>
      </section>

      <style>{`
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
