"use client";

import Image from "next/image";
import { type FormEvent, useState } from "react";

type Message = {
  role: "assistant" | "user";
  content: string;
};

const INITIAL_MESSAGES: Message[] = [
  {
    role: "assistant",
    content:
      "Bonjour, je suis Bobbee. Pose-moi bientot tes questions d'onboarding.",
  },
];

const BOBBEE_REPLY =
  "Je pourrai bient\u00f4t chercher dans les ressources d\u2019onboarding.";

export default function Home() {
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<Message[]>(INITIAL_MESSAGES);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const trimmedMessage = message.trim();

    if (!trimmedMessage) {
      return;
    }

    setMessages((currentMessages) => [
      ...currentMessages,
      { role: "user", content: trimmedMessage },
      { role: "assistant", content: BOBBEE_REPLY },
    ]);
    setMessage("");
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
          style={{ animation: "bobbeeIdleFloat 6s ease-in-out infinite" }}
        >
          <Image
            src="/bobbee/bobbee-idle.png"
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
                  "max-w-md rounded-2xl px-4 py-3 text-sm leading-6",
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
