"use client";

import Image from "next/image";
import { Bangers, Nunito } from "next/font/google";
import { type FormEvent, type ReactNode, useEffect, useRef, useState } from "react";

// POC « Bobbee en chat » : page séparée, accessible en tapant /bobbee.
// Direction visuelle « Manga » : encre noire, trame de points, bulles de BD.
const bangers = Bangers({ weight: "400", subsets: ["latin"] });
const nunito = Nunito({ weight: ["500", "700", "800"], subsets: ["latin"] });

type ChatMessage = { role: "user" | "assistant"; content: string };
type BobbeeState = "idle" | "thinking" | "found";

const BOBBEE_IMAGE_BY_STATE: Record<BobbeeState, string> = {
  idle: "/bobbee/bobbee-idle.png",
  thinking: "/bobbee/bobbee-thinking.png",
  found: "/bobbee/bobbee-found.png",
};
const BOBBEE_SHOUT_BY_STATE: Record<BobbeeState, string> = {
  idle: "POSE-MOI TA QUESTION !",
  thinking: "HMMM… JE BUTINE !",
  found: "TROUVÉ !",
};
const WELCOME_MESSAGE: ChatMessage = {
  role: "assistant",
  content:
    "Salut ! Moi c'est Bobbee. Demande-moi qui maîtrise un sujet, qui a bossé sur quoi, qui est dans quelle équipe ou où trouver un lien utile.",
};
const EXAMPLE_QUESTIONS = [
  "Qui a bossé sur la TVA récemment ?",
  "Qui est dans le pôle lavande ?",
  "Qui s'y connaît en Docker ?",
  "Où trouver la DOR et la DOD ?",
];
const ERROR_REPLY = "Oups, je n'arrive pas à joindre le serveur. Réessaie dans un instant.";

// Trame de points façon manga, en fond de page.
const HALFTONE_BACKGROUND =
  "bg-[#fffdf5] bg-[radial-gradient(#e9e2c8_1.2px,transparent_1.2px)] bg-[length:14px_14px]";
// Rayons qui partent derrière Bobbee.
const SPEED_LINES_BACKGROUND =
  "bg-[repeating-conic-gradient(from_0deg_at_50%_60%,#fff_0deg_6deg,#f3f0e4_6deg_12deg)]";

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
          className="font-extrabold text-zinc-950 underline decoration-[#ffd60a] decoration-[3px] underline-offset-2 hover:text-[#5b4300]"
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
    <main
      className={`${nunito.className} ${HALFTONE_BACKGROUND} flex min-h-screen flex-col gap-5 px-4 py-5 text-zinc-950 sm:p-8 lg:flex-row lg:items-stretch lg:gap-7`}
    >
      <aside className="flex flex-col gap-4 lg:w-[360px] lg:shrink-0">
        <div className="flex items-center justify-between gap-3 lg:flex-col lg:items-stretch">
          <div className="-rotate-[1.5deg] rounded-md border-4 border-zinc-950 bg-[#ffd60a] px-4 py-2 shadow-[6px_6px_0_#09090b] lg:px-5 lg:py-4 lg:shadow-[8px_8px_0_#09090b]">
            <h1 className={`${bangers.className} text-4xl leading-[0.9] tracking-wider lg:text-6xl`}>
              BOBBEE!
            </h1>
            <p className="mt-1 hidden text-base font-extrabold lg:block">Ton assistant du quotidien</p>
          </div>
          <p className="self-center rounded border-2 border-zinc-950 bg-white px-2.5 py-1 text-xs font-extrabold lg:self-start lg:text-[13px]">
            Démo — données fictives
          </p>
        </div>

        <div className="relative flex h-44 items-end justify-center overflow-hidden rounded-md border-4 border-zinc-950 bg-white shadow-[6px_6px_0_#09090b] lg:h-auto lg:min-h-[360px] lg:flex-1 lg:shadow-[8px_8px_0_#09090b]">
          <div aria-hidden="true" className={`absolute inset-0 ${SPEED_LINES_BACKGROUND}`} />
          <p
            className={`${bangers.className} absolute left-3 top-3 z-10 rounded-full border-[3px] border-zinc-950 bg-white px-3 py-1 text-base tracking-wide lg:left-4 lg:top-4 lg:text-[22px]`}
            aria-live="polite"
          >
            {BOBBEE_SHOUT_BY_STATE[bobbeeState]}
          </p>
          <Image
            src={BOBBEE_IMAGE_BY_STATE[bobbeeState]}
            alt="Bobbee"
            width={300}
            height={300}
            className="relative h-40 w-40 object-contain lg:h-[300px] lg:w-[300px]"
            priority
            unoptimized
          />
        </div>
      </aside>

      <section className="flex min-h-[60vh] min-w-0 flex-1 flex-col gap-4 rounded-md border-4 border-zinc-950 bg-white p-4 shadow-[6px_6px_0_#09090b] sm:p-6 lg:shadow-[8px_8px_0_#09090b]">
        <div className="flex flex-1 flex-col gap-5 overflow-y-auto">
          {messages.map((message, index) =>
            message.role === "user" ? (
              <p
                key={index}
                className="relative mr-4 max-w-[80%] self-end whitespace-pre-line rounded-[18px] border-[3px] border-zinc-950 bg-zinc-950 px-4 py-3 text-[15px] font-bold leading-6 break-words text-white sm:text-base"
              >
                {message.content}
                <span
                  aria-hidden="true"
                  className="absolute -right-[18px] top-4 border-y-[10px] border-l-[18px] border-y-transparent border-l-zinc-950"
                />
              </p>
            ) : (
              <p
                key={index}
                className="relative ml-4 max-w-[88%] self-start whitespace-pre-line rounded-[18px] border-[3px] border-zinc-950 bg-white px-4 py-3 text-[15px] leading-relaxed break-words sm:px-5 sm:text-base"
              >
                {renderReply(message.content)}
                <span
                  aria-hidden="true"
                  className="absolute -left-[18px] top-5 border-y-[10px] border-r-[18px] border-y-transparent border-r-zinc-950"
                />
                <span
                  aria-hidden="true"
                  className="absolute -left-[12px] top-[23px] border-y-[7px] border-r-[13px] border-y-transparent border-r-white"
                />
              </p>
            ),
          )}
          {isThinking ? (
            <p
              className={`${bangers.className} ml-4 self-start rounded-[18px] border-[3px] border-dashed border-zinc-950 bg-[#fff7cc] px-5 py-3 text-xl tracking-wider`}
            >
              BZZZ… JE CHERCHE
            </p>
          ) : null}
          <div ref={endOfMessagesRef} />
        </div>

        {messages.length === 1 ? (
          <div className="flex flex-wrap gap-2">
            {EXAMPLE_QUESTIONS.map((question) => (
              <button
                key={question}
                type="button"
                onClick={() => void ask(question)}
                className="min-h-11 rounded-full border-[3px] border-zinc-950 bg-white px-3.5 py-1.5 text-sm font-extrabold shadow-[3px_3px_0_#09090b] transition-transform hover:-translate-y-0.5 hover:bg-[#fff7cc]"
              >
                {question}
              </button>
            ))}
          </div>
        ) : null}

        <form onSubmit={handleSubmit} className="flex items-center gap-2 sm:gap-3">
          <label htmlFor="bobbee-question" className="sr-only">
            Ta question
          </label>
          <input
            id="bobbee-question"
            value={input}
            onChange={(event) => setInput(event.target.value)}
            placeholder="Pose ta question à Bobbee…"
            className="h-[52px] min-w-0 flex-1 rounded-full border-[3px] border-zinc-950 bg-white px-5 text-base outline-none focus:ring-4 focus:ring-[#ffd60a]"
          />
          <button
            type="submit"
            disabled={isThinking || !input.trim()}
            className={`${bangers.className} h-[52px] rounded-full border-[3px] border-zinc-950 bg-[#ffd60a] px-5 text-2xl tracking-wider shadow-[4px_4px_0_#09090b] transition-transform hover:-translate-y-0.5 disabled:translate-y-0 disabled:opacity-50 sm:px-6`}
          >
            ENVOYER !
          </button>
        </form>
      </section>
    </main>
  );
}
