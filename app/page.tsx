"use client";

import competencesData from "@/data/competences.json";
import usefulLinksData from "@/data/useful-links.raw.json";
import Image from "next/image";
import { type FormEvent, useEffect, useRef, useState } from "react";

type SearchResults = {
  competenceResults: CompetenceEntry[];
  usefulLinkResults: UsefulLinkEntry[];
};

type Message = {
  role: "assistant" | "user";
  content: string;
  searchResults?: SearchResults;
};

type BobbeeState = "idle" | "thinking" | "found";
type CompetenceEntry = {
  competence: string;
  personne: string;
  domaine: string;
  tag: string;
  niveau: string;
};
type UsefulLinkEntry = {
  Rubrique?: string | null;
  Qui?: string | null;
  Quoi?: string | null;
  Lien?: string | null;
};

const INITIAL_MESSAGES: Message[] = [
  {
    role: "assistant",
    content:
      "Bonjour, je suis Bobbee. Pose-moi bientot tes questions d'onboarding.",
  },
];

const COMPETENCES = competencesData as CompetenceEntry[];
const USEFUL_LINKS = usefulLinksData as UsefulLinkEntry[];
const MAX_SEARCH_RESULTS = 5;
const SEARCH_RESULTS_INTRO =
  "J\u2019ai trouv\u00e9 quelques personnes li\u00e9es \u00e0 ta recherche :";
const USEFUL_LINKS_INTRO = "J\u2019ai aussi trouv\u00e9 quelques liens utiles :";
const NO_SEARCH_RESULTS_REPLY =
  "Je n\u2019ai pas encore trouv\u00e9 de r\u00e9sultat correspondant dans les donn\u00e9es disponibles.";
const BOBBEE_IMAGE_BY_STATE: Record<BobbeeState, string> = {
  idle: "/bobbee/bobbee-idle.png",
  thinking: "/bobbee/bobbee-thinking.png",
  found: "/bobbee/bobbee-found.png",
};
const THINKING_DURATION_MS = 700;
const FOUND_DURATION_MS = 700;

function getMatchPriority(
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

function searchCompetences(query: string) {
  const normalizedQuery = query.toLowerCase();

  return COMPETENCES.map((entry, index) => ({
    entry,
    index,
    priority: getMatchPriority(normalizedQuery, entry.competence, [
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
    .slice(0, MAX_SEARCH_RESULTS)
    .map(({ entry }) => entry);
}

function searchUsefulLinks(query: string) {
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
    .slice(0, MAX_SEARCH_RESULTS)
    .map(({ entry }) => entry);
}

function getUsefulLinkHref(link?: string | null) {
  if (!link) {
    return null;
  }

  if (link.startsWith("http://") || link.startsWith("https://")) {
    return link;
  }

  if (link.includes("@")) {
    return `mailto:${link}`;
  }

  return null;
}

function getUsefulLinkSecondaryText(result: UsefulLinkEntry) {
  return [result.Rubrique, result.Qui]
    .filter((value): value is string => typeof value === "string" && value.length > 0)
    .join(" | ");
}

export default function Home() {
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<Message[]>(INITIAL_MESSAGES);
  const [bobbeeState, setBobbeeState] = useState<BobbeeState>("idle");
  const timeoutIdsRef = useRef<number[]>([]);

  useEffect(() => {
    return () => {
      timeoutIdsRef.current.forEach((timeoutId) => {
        window.clearTimeout(timeoutId);
      });
    };
  }, []);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const trimmedMessage = message.trim();

    if (!trimmedMessage) {
      return;
    }

    const competenceResults = searchCompetences(trimmedMessage);
    const usefulLinkResults = searchUsefulLinks(trimmedMessage);
    const hasSearchResults =
      competenceResults.length > 0 || usefulLinkResults.length > 0;

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
        hasSearchResults
          ? {
              role: "assistant",
              content: "",
              searchResults: { competenceResults, usefulLinkResults },
            }
          : {
              role: "assistant",
              content: NO_SEARCH_RESULTS_REPLY,
            },
      ]);
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
    <main className="min-h-screen bg-zinc-50 px-6 py-16 text-zinc-950 sm:px-10">
      <section className="mx-auto flex min-h-[70vh] w-full max-w-3xl flex-col items-center justify-center gap-6 text-center">
        <span className="inline-flex rounded-full border border-zinc-200 bg-white px-3 py-1 text-sm text-zinc-600">
          AssistantBobbee
        </span>

        <div className="space-y-3">
          <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
            Bonjour, je suis Bobbee.
          </h1>
          <p className="text-base leading-7 text-zinc-600 sm:text-lg">
            Je t&apos;aide a trouver les bonnes informations d&apos;onboarding.
          </p>
        </div>

        <div
          className="w-full max-w-xs sm:max-w-sm"
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
          className="w-full max-w-xl rounded-2xl border border-zinc-200 bg-white p-4 text-left shadow-sm"
          aria-label="Chat Bobbee"
        >
          <div className="flex flex-col gap-3">
            {messages.map((entry, index) => (
              <div
                key={`${entry.role}-${index}`}
                className={[
                  "max-w-md rounded-2xl px-4 py-3 text-sm leading-6",
                  entry.role === "assistant"
                    ? "bg-zinc-100 text-zinc-700"
                    : "self-end bg-zinc-900 text-white",
                ].join(" ")}
              >
                {entry.role === "assistant" && entry.searchResults ? (
                  <div className="space-y-4">
                    {entry.searchResults.competenceResults.length > 0 ? (
                      <div className="space-y-2">
                        <p className="text-sm font-medium text-zinc-800">
                          {SEARCH_RESULTS_INTRO}
                        </p>
                        <ul className="space-y-2">
                          {entry.searchResults.competenceResults.map(
                            ({ personne, competence, domaine, niveau }, resultIndex) => (
                              <li
                                key={`${personne}-${competence}-${domaine}-${niveau}-${resultIndex}`}
                                className="rounded-xl border border-zinc-200 bg-white/70 px-3 py-2"
                              >
                                <p className="font-medium text-zinc-900">{personne}</p>
                                <p className="text-zinc-800">{competence}</p>
                                <p className="text-xs text-zinc-500">
                                  {domaine} | Niveau {niveau}
                                </p>
                              </li>
                            ),
                          )}
                        </ul>
                      </div>
                    ) : null}

                    {entry.searchResults.usefulLinkResults.length > 0 ? (
                      <div className="space-y-2">
                        <p className="text-sm font-medium text-zinc-800">
                          {USEFUL_LINKS_INTRO}
                        </p>
                        <ul className="space-y-2">
                          {entry.searchResults.usefulLinkResults.map((result, resultIndex) => {
                            const title =
                              result.Quoi ?? result.Lien ?? "Lien utile";
                            const href = getUsefulLinkHref(result.Lien);
                            const secondaryText = getUsefulLinkSecondaryText(result);

                            return (
                              <li
                                key={`${title}-${result.Lien ?? "no-link"}-${resultIndex}`}
                                className="rounded-xl border border-zinc-200 bg-white/70 px-3 py-2"
                              >
                                {href ? (
                                  <a
                                    href={href}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="font-medium text-zinc-900 underline decoration-zinc-300 underline-offset-2 hover:text-zinc-700"
                                  >
                                    {title}
                                  </a>
                                ) : (
                                  <p className="font-medium text-zinc-900">{title}</p>
                                )}
                                {secondaryText ? (
                                  <p className="text-xs text-zinc-500">{secondaryText}</p>
                                ) : null}
                              </li>
                            );
                          })}
                        </ul>
                      </div>
                    ) : null}
                  </div>
                ) : (
                  <p className="whitespace-pre-line">{entry.content}</p>
                )}
              </div>
            ))}
          </div>

          <form
            onSubmit={handleSubmit}
            className="mt-4 flex flex-col gap-3 sm:flex-row"
          >
            <input
              type="text"
              value={message}
              onChange={(event) => setMessage(event.target.value)}
              placeholder="Pose ta question a Bobbee..."
              aria-label="Champ de chat Bobbee"
              className="min-w-0 flex-1 rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-sm text-zinc-700 placeholder:text-zinc-400"
            />
            <button
              type="submit"
              className="rounded-xl bg-zinc-900 px-4 py-3 text-sm font-medium text-white"
            >
              Envoyer
            </button>
          </form>

          <p className="mt-3 text-xs leading-5 text-zinc-500">
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
