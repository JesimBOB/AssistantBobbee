"use client";

import Image from "next/image";
import { type FormEvent, type ReactNode, useEffect, useRef, useState } from "react";

// POC « Bobbee en chat » : page séparée, accessible en tapant /bobbee.
type ChatMessage = { role: "user" | "assistant"; content: string };
type BobbeeState = "idle" | "thinking" | "found";

const BOBBEE_IMAGE_BY_STATE: Record<BobbeeState, string> = {
  idle: "/bobbee/bobbee-idle.png",
  thinking: "/bobbee/bobbee-thinking.png",
  found: "/bobbee/bobbee-found.png",
};
const WELCOME_MESSAGE: ChatMessage = {
  role: "assistant",
  content:
    "Salut, moi c'est Bobbee 🐝 Demande-moi qui maîtrise un sujet, qui a bossé sur quoi, qui est dans quelle équipe ou où trouver un lien utile.",
};
const EXAMPLE_QUESTIONS = [
  "Qui a bossé sur la TVA récemment ?",
  "Qui est dans le pôle lavande ?",
  "Qui s'y connaît en Docker ?",
  "Où trouver la DOR et la DOD ?",
];
const ERROR_REPLY = "Oups, je n'arrive pas à joindre le serveur. Réessaie dans un instant.";

// Affiche les liens [texte](url) et le **gras** des réponses de Bobbee.
function renderReply(text: string) {
  const parts: ReactNode[] = [];
  const pattern = /\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)|\*\*([^*]+)\*\*/g;
  let lastIndex = 0;

  for (const match of text.matchAll(pattern)) {
    parts.push(text.slice(lastIndex, match.index));
    if (match[2]) {
      parts.push(
        <a
          key={match.index}
          href={match[2]}
          target="_blank"
          rel="noreferrer"
          className="font-semibold text-orange-600 underline"
        >
          {match[1]}
        </a>,
      );
    } else {
      parts.push(<strong key={match.index}>{match[3]}</strong>);
    }
    lastIndex = match.index + match[0].length;
  }

  parts.push(text.slice(lastIndex));
  return parts;
}

export default function BobbeeChatPage() {
  const [messages, setMessages] = useState<ChatMessage[]>([WELCOME_MESSAGE]);
  const [input, setInput] = useState("");
  const [bobbeeState, setBobbeeState] = useState<BobbeeState>("idle");
  const endOfMessagesRef = useRef<HTMLDivElement>(null);
  const isThinking = bobbeeState === "thinking";

  useEffect(() => {
    endOfMessagesRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, bobbeeState]);

  async function ask(question: string) {
    const trimmedQuestion = question.trim();

    if (!trimmedQuestion || isThinking) {
      return;
    }

    const nextMessages: ChatMessage[] = [...messages, { role: "user", content: trimmedQuestion }];
    setMessages(nextMessages);
    setInput("");
    setBobbeeState("thinking");

    let replyText = ERROR_REPLY;
    try {
      const response = await fetch("/api/bobbee", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        // Le message d'accueil n'est pas envoyé : il ne vient pas de Claude.
        body: JSON.stringify({ messages: nextMessages.slice(1) }),
      });
      const data: unknown = await response.json();
      if (typeof data === "object" && data !== null && "reply" in data && typeof data.reply === "string") {
        replyText = data.reply;
      }
    } catch {
      // replyText garde le message d'erreur.
    }

    setMessages([...nextMessages, { role: "assistant", content: replyText }]);
    setBobbeeState("found");
    window.setTimeout(() => setBobbeeState((state) => (state === "found" ? "idle" : state)), 1500);
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    void ask(input);
  }

  return (
    <main className="flex min-h-screen flex-col items-center bg-gradient-to-b from-amber-100 via-amber-50 to-white px-4 py-6 text-zinc-950 sm:px-6">
      <div className="flex w-full max-w-2xl flex-1 flex-col gap-4">
        <header className="flex items-center gap-3">
          <Image
            src={BOBBEE_IMAGE_BY_STATE[bobbeeState]}
            alt="Bobbee"
            width={96}
            height={96}
            className="h-20 w-20 object-contain sm:h-24 sm:w-24"
            priority
            unoptimized
          />
          <div>
            <h1 className="text-2xl font-bold">Bobbee</h1>
            <p className="text-sm text-zinc-600">
              {isThinking ? "Bobbee butine dans ses données…" : "Ton assistant du quotidien"}
            </p>
            <p className="mt-1 inline-flex rounded-full bg-amber-200/70 px-2 py-0.5 text-[11px] font-medium text-amber-900">
              Démo — données fictives
            </p>
          </div>
        </header>

        <section className="flex min-h-[50vh] flex-1 flex-col gap-3 overflow-y-auto rounded-[26px] border border-white/70 bg-white/60 p-3 shadow-[0_28px_70px_-32px_rgba(24,24,27,0.45)] ring-1 ring-amber-300/45 sm:p-4">
          {messages.map((message, index) =>
            message.role === "user" ? (
              <p
                key={index}
                className="max-w-[85%] self-end whitespace-pre-line rounded-[22px] rounded-br-lg bg-zinc-900 px-4 py-3 text-[15px] leading-6 break-words text-white"
              >
                {message.content}
              </p>
            ) : (
              <p
                key={index}
                className="max-w-[90%] self-start whitespace-pre-line rounded-[22px] rounded-bl-lg bg-amber-50 px-4 py-3 text-[15px] leading-6 break-words text-zinc-900 ring-1 ring-amber-200"
              >
                {renderReply(message.content)}
              </p>
            ),
          )}
          {isThinking ? (
            <p className="self-start rounded-[22px] rounded-bl-lg bg-amber-50 px-4 py-3 text-[15px] text-zinc-500 ring-1 ring-amber-200">
              …
            </p>
          ) : null}
          <div ref={endOfMessagesRef} />
        </section>

        {messages.length === 1 ? (
          <div className="flex flex-wrap gap-2">
            {EXAMPLE_QUESTIONS.map((question) => (
              <button
                key={question}
                type="button"
                onClick={() => void ask(question)}
                className="rounded-full border border-amber-300 bg-white/80 px-3 py-1.5 text-sm text-zinc-700 transition-colors hover:bg-amber-100"
              >
                {question}
              </button>
            ))}
          </div>
        ) : null}

        <form onSubmit={handleSubmit} className="flex gap-2">
          <input
            value={input}
            onChange={(event) => setInput(event.target.value)}
            placeholder="Pose ta question à Bobbee…"
            className="min-w-0 flex-1 rounded-full border border-amber-200 bg-white px-4 py-3 text-[15px] outline-none focus:ring-2 focus:ring-amber-300"
          />
          <button
            type="submit"
            disabled={isThinking || !input.trim()}
            className="rounded-full bg-zinc-900 px-5 py-3 text-sm font-medium text-amber-50 transition-colors hover:bg-zinc-800 disabled:opacity-40"
          >
            Envoyer
          </button>
        </form>
      </div>
    </main>
  );
}
