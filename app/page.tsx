"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { CLAUDE_ASSISTANT_URL, MangaPage, bangers } from "./manga";

type BobbeeState = "idle" | "found";

const BOBBEE_IMAGE_BY_STATE: Record<BobbeeState, string> = {
  idle: "/bobbee/bobbee-idle.png",
  found: "/bobbee/bobbee-found.png",
};
const FOUND_DURATION_MS = 1500;
// Exemples de questions à poser dans Claude (copiées dans le presse-papiers au clic).
const EXAMPLE_QUESTIONS = [
  "Qui maîtrise la TVA dans l'équipe ?",
  "Qu'est-ce qui a été décidé sur la facture électronique ?",
  "Qui est le PO du pôle Lavande ?",
];
// Liens de la case « Démarre » (repris de « Les essentiels » et de l'ancienne carte Checklist).
const START_LINKS = [
  {
    label: "Checklist onboarding",
    href: "https://isagri.atlassian.net/wiki/spaces/BO/pages/6166380545/Guide+d+Onboarding+D+veloppeur+Ma+do",
  },
  {
    label: "Mise en place environnement",
    href: "https://isagri.atlassian.net/wiki/x/BIB8WQE",
  },
  {
    label: "Guide d'onboarding Dev",
    href: "https://isagri.atlassian.net/wiki/x/AYCLbwE",
  },
  {
    label: "Guide d'onboarding QA",
    href: "https://isagri.atlassian.net/wiki/x/AoDDcQE",
  },
];
// Éclat de rayons manga derrière Bobbee (lignes de concentration).
const RAYS_BACKGROUND = {
  backgroundColor: "#ffd60a",
  backgroundImage:
    "radial-gradient(circle at 50% 62%, #fff7cc 0, #fff7cc 18%, transparent 46%), repeating-conic-gradient(from 0deg at 50% 62%, #ffd60a 0deg 7deg, #ffb703 7deg 14deg)",
};

const STEP_CARD = "flex flex-col gap-3 rounded-xl border-[3px] border-zinc-950 bg-white p-[22px]";
const STEP_NUMBER = `${bangers.className} inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-[3px] border-zinc-950 bg-[#ffd60a] text-2xl`;
const STEP_TITLE = `${bangers.className} text-[27px] font-normal leading-none tracking-[1.2px]`;
const STEP_TEXT = "text-base leading-normal text-zinc-600";
const STEP_LINK =
  "flex min-h-11 items-center justify-between text-base font-bold text-zinc-950 no-underline hover:text-[#5b4300]";

function StepHeader({ number, title }: { number: number; title: string }) {
  return (
    <div className="flex items-center gap-3">
      <span className={STEP_NUMBER}>{number}</span>
      <h3 className={STEP_TITLE}>{title}</h3>
    </div>
  );
}

export default function Home() {
  const [bobbeeState, setBobbeeState] = useState<BobbeeState>("idle");
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const timeoutIdRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (timeoutIdRef.current !== null) {
        window.clearTimeout(timeoutIdRef.current);
      }
    };
  }, []);

  async function handleCopyQuestion(question: string, index: number) {
    try {
      await navigator.clipboard.writeText(question);
    } catch {
      // Repli si le presse-papiers moderne est refusé par le navigateur.
      const textarea = document.createElement("textarea");
      textarea.value = question;
      document.body.appendChild(textarea);
      textarea.select();
      const copied = document.execCommand("copy");
      textarea.remove();

      if (!copied) {
        return;
      }
    }

    if (timeoutIdRef.current !== null) {
      window.clearTimeout(timeoutIdRef.current);
    }

    setCopiedIndex(index);
    setBobbeeState("found");
    timeoutIdRef.current = window.setTimeout(() => {
      timeoutIdRef.current = null;
      setCopiedIndex(null);
      setBobbeeState("idle");
    }, FOUND_DURATION_MS);
  }

  return (
    <MangaPage current="accueil">
      <section className="flex flex-wrap items-center gap-12">
        <div className="flex min-w-0 flex-[1_1_460px] flex-col gap-5">
          <h1
            className={`${bangers.className} -rotate-[1.5deg] self-start rounded-lg border-4 border-zinc-950 bg-[#ffd60a] px-6 pb-2.5 pt-3.5 font-normal leading-[0.95] tracking-[2px] shadow-[6px_6px_0_#09090b]`}
          >
            <span className="block text-[34px] sm:text-[46px]">BIENVENUE</span>
            <span className="block text-[46px] text-white [-webkit-text-stroke:2.5px_#09090b] [paint-order:stroke_fill] sm:text-[72px]">
              DANS LA RUCHE.
            </span>
          </h1>
          <p className="mt-2 text-xl font-semibold leading-snug text-zinc-800">
            Ici, tu découvres l&apos;équipe et tes premiers pas.
          </p>

          <div className="mt-1 flex flex-col gap-3.5 rounded-xl border-4 border-zinc-950 bg-white p-[22px] shadow-[6px_6px_0_#09090b]">
            <a
              href={CLAUDE_ASSISTANT_URL}
              target="_blank"
              rel="noreferrer"
              className={`${bangers.className} flex min-h-[60px] items-center justify-center gap-3 rounded-full border-[3px] border-zinc-950 bg-[#ffd60a] px-4 py-2.5 text-center text-[19px] tracking-[1px] text-zinc-950 no-underline shadow-[4px_4px_0_#09090b] transition-transform hover:-translate-y-0.5 sm:px-6 sm:text-[28px] sm:tracking-[1.5px]`}
            >
              POSE TA QUESTION À BOBBEE →
            </a>
            <p className="-mt-1.5 text-center text-[13px] text-zinc-600">
              S&apos;ouvre dans Claude, dans un nouvel onglet.
            </p>
            <div className="flex flex-col gap-0.5 border-t-2 border-dashed border-zinc-200 pt-3">
              <p className="mb-0.5 text-sm font-semibold text-zinc-600">
                Idées de questions (clique pour copier) :
              </p>
              {EXAMPLE_QUESTIONS.map((question, index) => (
                <button
                  key={question}
                  type="button"
                  onClick={() => handleCopyQuestion(question, index)}
                  className="flex min-h-9 items-center gap-2 self-start py-1 text-left text-base font-semibold text-zinc-950 underline decoration-[#ffd60a] decoration-[3px] underline-offset-4 hover:text-[#5b4300]"
                >
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="#71717a"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                    className="shrink-0"
                  >
                    <rect x="9" y="9" width="12" height="12" rx="2" />
                    <path d="M5 15V5a2 2 0 0 1 2-2h10" />
                  </svg>
                  {copiedIndex === index ? "Copié ! Colle-la dans Claude" : question}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div
          className="relative flex min-h-[460px] min-w-0 flex-[1_1_400px] flex-col items-center justify-center overflow-hidden rounded-xl border-4 border-zinc-950 px-5 pb-8 pt-20 shadow-[6px_6px_0_#09090b] sm:pt-8"
          style={RAYS_BACKGROUND}
        >
          <p
            aria-hidden="true"
            className={`${bangers.className} absolute right-5 top-5 rotate-[8deg] rounded-md border-[3px] border-zinc-950 bg-white px-3.5 pb-0.5 pt-1 text-[30px] leading-none tracking-[2px] shadow-[3px_3px_0_#09090b]`}
          >
            BZZZ !
          </p>
          <div className="relative max-w-[300px] rounded-[22px] border-[3px] border-zinc-950 bg-white px-[18px] py-3.5 text-center text-lg font-extrabold leading-snug">
            Pour toute question, Bobbee te répond dans Claude.
            <span
              aria-hidden="true"
              className="absolute -bottom-4 left-1/2 -ml-3 h-6 w-6 rotate-45 border-b-[3px] border-r-[3px] border-zinc-950 bg-white"
            />
          </div>
          <Image
            src={BOBBEE_IMAGE_BY_STATE[bobbeeState]}
            alt="Bobbee, la mascotte"
            width={480}
            height={480}
            priority
            className="mt-6 h-auto w-[min(300px,75%)] drop-shadow-[0_10px_14px_rgba(120,72,0,0.25)]"
          />
        </div>
      </section>

      <section aria-labelledby="parcours" className="flex flex-col gap-5">
        <h2
          id="parcours"
          className={`${bangers.className} text-4xl font-normal tracking-[2px]`}
        >
          TON PARCOURS
        </h2>
        <div className="grid grid-cols-[repeat(auto-fit,minmax(260px,1fr))] gap-6">
          <article className={STEP_CARD}>
            <StepHeader number={1} title="DÉCOUVRE L'ÉQUIPE" />
            <p className={STEP_TEXT}>Qui fait quoi dans la ruche, et d&apos;où vient Bobbee.</p>
            <div className="mt-auto flex flex-col">
              <Link href="/organigramme" className={`${STEP_LINK} border-b-2 border-zinc-100`}>
                L&apos;organigramme <span aria-hidden="true">→</span>
              </Link>
              <Link href="/presentation" className={STEP_LINK}>
                Bobbee et son histoire <span aria-hidden="true">→</span>
              </Link>
            </div>
          </article>

          <article className={STEP_CARD}>
            <StepHeader number={2} title="DÉMARRE" />
            <p className={STEP_TEXT}>Les étapes clés pour bien démarrer.</p>
            <div className="mt-auto flex flex-col">
              {START_LINKS.map((link, index) => (
                <a
                  key={link.label}
                  href={link.href}
                  target="_blank"
                  rel="noreferrer"
                  className={`${STEP_LINK} ${index < START_LINKS.length - 1 ? "border-b-2 border-zinc-100" : ""}`}
                >
                  {link.label} <span aria-hidden="true">↗</span>
                </a>
              ))}
            </div>
          </article>

          <article className={STEP_CARD}>
            <StepHeader number={3} title="TOUS TES LIENS" />
            <p className={STEP_TEXT}>
              Les premiers repères à garder sous la main pour avancer simplement.
            </p>
            <Link
              href="/essentiels"
              className="mt-auto flex min-h-12 items-center justify-between rounded-[10px] border-[3px] border-zinc-950 bg-[#ffd60a] px-4 text-base font-extrabold text-zinc-950 no-underline transition-transform hover:-translate-y-0.5"
            >
              Ouvrir Les essentiels <span aria-hidden="true">→</span>
            </Link>
          </article>
        </div>
      </section>
    </MangaPage>
  );
}
