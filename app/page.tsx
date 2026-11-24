"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { CLAUDE_ASSISTANT_URL, MangaPage, PANEL, SECTION_TITLE, bangers } from "./manga";

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
    label: "Guide d'onboarding Développeur",
    href: "https://isagri.atlassian.net/wiki/x/AYCLbwE",
  },
  {
    label: "Guide d'onboarding QA",
    href: "https://isagri.atlassian.net/wiki/x/AoDDcQE",
  },
];
const ESSENTIALS_PREVIEW = ["JIRA", "Confluence", "Git", "VS Code", "Tests avant push"];

const STEP_NUMBER = `${bangers.className} inline-flex h-[46px] w-[46px] shrink-0 items-center justify-center rounded-full border-[3px] border-zinc-950 bg-[#ffd60a] text-[28px]`;
const STEP_TITLE = `${bangers.className} text-[30px] font-normal leading-none tracking-[1.2px]`;
const YELLOW_LINK =
  "flex min-h-12 items-center justify-between rounded-lg border-[3px] border-zinc-950 bg-[#ffd60a] px-4 text-base font-extrabold text-zinc-950 no-underline shadow-[3px_3px_0_#09090b] transition-transform hover:-translate-y-0.5";

function StepHeader({
  number,
  title,
  image,
  imageWidth,
  imageHeight,
}: {
  number: number;
  title: string;
  image: string;
  imageWidth: number;
  imageHeight: number;
}) {
  return (
    <div className="flex items-center justify-between gap-3">
      <div className="flex items-center gap-3">
        <span className={STEP_NUMBER}>{number}</span>
        <h3 className={STEP_TITLE}>{title}</h3>
      </div>
      <Image
        src={image}
        alt=""
        width={imageWidth}
        height={imageHeight}
        unoptimized
        className="h-20 w-auto max-w-[76px] object-contain"
      />
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
      <section className="flex flex-wrap items-stretch gap-10">
        <div className="flex min-w-0 flex-[1_1_520px] flex-col gap-5">
          <h1
            className={`${bangers.className} -rotate-[1.5deg] self-start rounded-lg border-4 border-zinc-950 bg-[#ffd60a] px-6 pb-2.5 pt-3.5 font-normal leading-[0.95] tracking-[2px] shadow-[7px_7px_0_#09090b]`}
          >
            <span className="block text-[34px] sm:text-[48px]">BIENVENUE</span>
            <span className="block text-[48px] text-white [-webkit-text-stroke:2.5px_#09090b] [paint-order:stroke_fill] sm:text-[76px]">
              DANS LA RUCHE.
            </span>
          </h1>
          <p className="mt-1.5 self-start rounded-md border-2 border-zinc-950 bg-white px-3.5 py-2 text-lg font-bold leading-snug">
            Ici, tu découvres l&apos;équipe et tes premiers pas.
          </p>

          <div className={`${PANEL} mt-2 flex flex-col gap-3.5 p-[22px] shadow-[7px_7px_0_#09090b]`}>
            <p
              className={`${bangers.className} -rotate-1 self-start rounded bg-zinc-950 px-3 py-1 text-[22px] tracking-[1.5px] text-[#ffd60a]`}
            >
              UNE QUESTION ?
            </p>
            <a
              href={CLAUDE_ASSISTANT_URL}
              target="_blank"
              rel="noreferrer"
              className={`${bangers.className} flex min-h-[60px] items-center justify-center gap-3 rounded-full border-[3px] border-zinc-950 bg-[#ffd60a] px-5 py-2.5 text-center text-[22px] tracking-[1.5px] text-zinc-950 no-underline shadow-[5px_5px_0_#09090b] transition-transform hover:-translate-y-0.5 sm:text-[30px]`}
            >
              POSE TA QUESTION À BOBBEE →
            </a>
            <p className="-mt-1 text-center text-[13px] text-zinc-600">
              S&apos;ouvre dans Claude, dans un nouvel onglet.
            </p>
            <p className="mt-1 text-[15px] font-semibold">
              Par exemple (clique pour copier, puis colle dans Claude) :
            </p>
            <div className="flex flex-wrap gap-2.5">
              {EXAMPLE_QUESTIONS.map((question, index) => (
                <button
                  key={question}
                  type="button"
                  onClick={() => handleCopyQuestion(question, index)}
                  className="min-h-11 rounded-full border-2 border-zinc-950 bg-white px-4 py-2 text-left text-[15px] font-semibold text-zinc-950 shadow-[3px_3px_0_#09090b] transition-colors hover:bg-[#fff7cc]"
                >
                  {copiedIndex === index ? "Copié ! Colle-la dans Claude" : question}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="relative flex min-w-0 flex-[1_1_360px] flex-col items-center justify-center rounded-[10px] border-4 border-zinc-950 bg-[#fff7cc] bg-[radial-gradient(#f2d75e_2px,transparent_2px)] bg-[length:12px_12px] px-5 py-7 shadow-[7px_7px_0_#09090b]">
          <div className="relative max-w-[330px] rounded-[22px] border-[3px] border-zinc-950 bg-white px-5 py-4 text-center text-[19px] font-extrabold leading-snug">
            Pour toute question, Bobbee te répond dans Claude.
            <span
              aria-hidden="true"
              className="absolute -bottom-[17px] left-1/2 -ml-[13px] h-[26px] w-[26px] rotate-45 border-b-[3px] border-r-[3px] border-zinc-950 bg-white"
            />
          </div>
          <Image
            src={BOBBEE_IMAGE_BY_STATE[bobbeeState]}
            alt="Bobbee, la mascotte"
            width={480}
            height={480}
            priority
            className="mt-6 h-auto w-[min(320px,80%)]"
          />
        </div>
      </section>

      <section aria-labelledby="parcours" className="flex flex-col gap-6">
        <h2 id="parcours" className={SECTION_TITLE}>
          TON PARCOURS
        </h2>
        <div className="grid grid-cols-[repeat(auto-fit,minmax(280px,1fr))] gap-7">
          <article className={`${PANEL} flex flex-col gap-3.5 p-[22px]`}>
            <StepHeader
              number={1}
              title="DÉCOUVRE L'ÉQUIPE"
              image="/home/card-organigramme.png"
              imageWidth={132}
              imageHeight={172}
            />
            <p className="text-base leading-normal text-zinc-700">
              Explore la ruche MAIDO et retrouve les équipes. Découvre Bobbee et son histoire.
            </p>
            <div className="mt-auto flex flex-col gap-2.5">
              <Link href="/organigramme" className={YELLOW_LINK}>
                L&apos;organigramme <span aria-hidden="true">→</span>
              </Link>
              <Link href="/presentation" className={YELLOW_LINK}>
                Bobbee et son histoire <span aria-hidden="true">→</span>
              </Link>
            </div>
          </article>

          <article className={`${PANEL} flex flex-col gap-3.5 p-[22px]`}>
            <StepHeader
              number={2}
              title="DÉMARRE"
              image="/home/card-checklist.png"
              imageWidth={138}
              imageHeight={168}
            />
            <p className="text-base leading-normal text-zinc-700">
              Les étapes clés pour bien démarrer.
            </p>
            <ul className="mt-auto flex flex-col">
              {START_LINKS.map((link, index) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    target="_blank"
                    rel="noreferrer"
                    className={[
                      "flex min-h-11 items-center justify-between px-1 text-base font-bold text-zinc-950 no-underline hover:text-[#5b4300]",
                      index < START_LINKS.length - 1 ? "border-b-2 border-dashed border-zinc-300" : "",
                    ].join(" ")}
                  >
                    {link.label} <span aria-hidden="true">↗</span>
                  </a>
                </li>
              ))}
            </ul>
          </article>

          <article className={`${PANEL} flex flex-col gap-3.5 p-[22px]`}>
            <StepHeader
              number={3}
              title="TOUS TES LIENS"
              image="/home/card-bobbee.png"
              imageWidth={152}
              imageHeight={118}
            />
            <p className="text-base leading-normal text-zinc-700">
              Les premiers repères à garder sous la main pour avancer simplement.
            </p>
            <div className="flex flex-wrap gap-2">
              {ESSENTIALS_PREVIEW.map((label) => (
                <span
                  key={label}
                  className="rounded-full border-2 border-zinc-950 bg-[#fff7cc] px-2.5 py-1 text-sm font-bold"
                >
                  {label}
                </span>
              ))}
            </div>
            <Link
              href="/essentiels"
              className={`${bangers.className} mt-auto flex min-h-[52px] items-center justify-center gap-2.5 rounded-full border-[3px] border-zinc-950 bg-zinc-950 px-4 text-2xl tracking-[1.2px] text-[#ffd60a] no-underline shadow-[3px_3px_0_#ffd60a] transition-transform hover:-translate-y-0.5`}
            >
              OUVRIR LES ESSENTIELS →
            </Link>
          </article>
        </div>
      </section>
    </MangaPage>
  );
}
