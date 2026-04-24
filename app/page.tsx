"use client";

import competencesData from "@/data/competences.json";
import Image from "next/image";
import { type FormEvent, useEffect, useRef, useState } from "react";

type Message = {
  role: "assistant" | "user";
  content: string;
};

type BobbeeState = "idle" | "thinking" | "found";
type CompetenceEntry = {
  competence: string;
  personne: string;
  domaine: string;
  tag: string;
  niveau: string;
};

const INITIAL_MESSAGES: Message[] = [
  {
    role: "assistant",
    content:
      "Bonjour, je suis Bobbee. Pose-moi bientot tes questions d'onboarding.",
  },
];

const COMPETENCES = competencesData as CompetenceEntry[];
const MAX_SEARCH_RESULTS = 5;
const SEARCH_RESULTS_INTRO =
  "J\u2019ai trouv\u00e9 quelques personnes li\u00e9es \u00e0 ta recherche :";
const NO_SEARCH_RESULTS_REPLY =
  "Je n\u2019ai pas encore trouv\u00e9 de comp\u00e9tence correspondante dans les donn\u00e9es disponibles.";
const BOBBEE_IMAGE_BY_STATE: Record<BobbeeState, string> = {
  idle: "/bobbee/bobbee-idle.png",
  thinking: "/bobbee/bobbee-thinking.png",
  found: "/bobbee/bobbee-found.png",
};
const THINKING_DURATION_MS = 700;
const FOUND_DURATION_MS = 700;

function searchCompetences(query: string) {
  const normalizedQuery = query.toLowerCase();

  return COMPETENCES.filter(({ competence, personne, domaine, tag }) =>
    [competence, personne, domaine, tag].some((value) =>
      value.toLowerCase().includes(normalizedQuery),
    ),
  ).slice(0, MAX_SEARCH_RESULTS);
}

function formatBobbeeReply(results: CompetenceEntry[]) {
  if (results.length === 0) {
    return NO_SEARCH_RESULTS_REPLY;
  }

  return [
    SEARCH_RESULTS_INTRO,
    ...results.map(
      ({ personne, competence, domaine, niveau }) =>
        `- ${personne} | ${competence} | ${domaine} | ${niveau}`,
    ),
  ].join("\n");
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

    const searchResults = searchCompetences(trimmedMessage);

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
        { role: "assistant", content: formatBobbeeReply(searchResults) },
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
              <p
                key={`${entry.role}-${index}`}
                className={[
                  "max-w-md whitespace-pre-line rounded-2xl px-4 py-3 text-sm leading-6",
                  entry.role === "assistant"
                    ? "bg-zinc-100 text-zinc-700"
                    : "self-end bg-zinc-900 text-white",
                ].join(" ")}
              >
                {entry.content}
              </p>
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
