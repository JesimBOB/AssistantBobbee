"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useRef, useState, type FormEvent } from "react";
import { CLAUDE_ASSISTANT_URL, MangaPage, bangers } from "./manga";

type BobbeeState = "idle" | "found";

const BOBBEE_IMAGE_BY_STATE: Record<BobbeeState, string> = {
  idle: "/bobbee/bobbee-idle.png",
  found: "/bobbee/bobbee-found.png",
};
const FOUND_DURATION_MS = 1500;
// Nouvelle conversation Claude rattachée au projet ; la question y est préremplie via « q ».
const CLAUDE_NEW_CHAT_URL = CLAUDE_ASSISTANT_URL.replace("/project/", "/new?project=");
// Exemples de questions à poser dans Claude (elles remplissent le champ de saisie au clic).
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
// Visite guidée lancée par Bobbee : zone visée (0 = question, 1 à 3 = cartes du parcours).
const TOUR_STEPS = [
  {
    label: "Ici, pose ta question à Bobbee",
    bubble: "Ici, pose ta question à Bobbee. Je te réponds dans Claude.",
  },
  { label: "Bobbee, c'est nous", bubble: "Bobbee, c'est nous." },
  {
    label: "Là, pour bien démarrer",
    bubble: "Là, pour bien démarrer.",
  },
  { label: "Enfin, tous les liens utiles", bubble: "Enfin, tous les liens utiles." },
];
const TOUR_INTRO = "Clique, je te fais visiter.";
const TOUR_ACTIVE = "ring-[5px] ring-[#ffd60a]";
const TOUR_ROUND_BUTTON =
  "flex h-10 w-10 cursor-pointer items-center justify-center rounded-full border-[3px] border-zinc-950 bg-white text-xl font-extrabold leading-none text-zinc-950";

function TourTag({ active, text }: { active: boolean; text: string }) {
  if (!active) return null;
  return (
    <span className="absolute -top-5 right-4 z-10 max-w-[90%] rounded-2xl border-[3px] border-zinc-950 bg-white px-4 py-1 text-lg font-extrabold leading-snug text-zinc-950 shadow-[3px_3px_0_#09090b]">
      <span aria-hidden="true">↓ </span>
      {text}
    </span>
  );
}

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
  const [question, setQuestion] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const timeoutIdRef = useRef<number | null>(null);
  const [tourStep, setTourStep] = useState<number | null>(null);
  const zoneRefs = useRef<(HTMLElement | null)[]>([]);

  function goToTourStep(step: number | null) {
    setTourStep(step);
    if (step !== null) {
      zoneRefs.current[step]?.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }

  useEffect(() => {
    return () => {
      if (timeoutIdRef.current !== null) {
        window.clearTimeout(timeoutIdRef.current);
      }
    };
  }, []);

  function handleSelectExample(example: string) {
    setQuestion(example);
    inputRef.current?.focus();

    if (timeoutIdRef.current !== null) {
      window.clearTimeout(timeoutIdRef.current);
    }

    setBobbeeState("found");
    timeoutIdRef.current = window.setTimeout(() => {
      timeoutIdRef.current = null;
      setBobbeeState("idle");
    }, FOUND_DURATION_MS);
  }

  function handleAsk(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmed = question.trim();
    // Champ vide : on ouvre simplement le projet, comme avant.
    const url = trimmed
      ? `${CLAUDE_NEW_CHAT_URL}&q=${encodeURIComponent(trimmed)}`
      : CLAUDE_ASSISTANT_URL;
    window.open(url, "_blank", "noopener,noreferrer");
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

          <div
            ref={(el) => {
              zoneRefs.current[0] = el;
            }}
            className={`relative mt-1 flex flex-col gap-3.5 rounded-xl border-4 border-zinc-950 bg-white p-[22px] shadow-[6px_6px_0_#09090b] ${tourStep === 0 ? TOUR_ACTIVE : ""}`}
          >
            <TourTag active={tourStep === 0} text={TOUR_STEPS[0].label} />
            <h2 className="text-xl font-extrabold leading-snug text-zinc-950">
              Pose ta question à Bobbee
            </h2>
            <form onSubmit={handleAsk} className="contents">
              <input
                ref={inputRef}
                type="text"
                value={question}
                onChange={(event) => setQuestion(event.target.value)}
                maxLength={500}
                aria-label="Ta question pour Bobbee"
                placeholder="Écris ta question pour Bobbee…"
                className="min-h-[52px] w-full rounded-xl border-[3px] border-zinc-950 bg-white px-4 text-base font-semibold text-zinc-950 placeholder:text-zinc-500 focus:outline-none focus:ring-4 focus:ring-[#ffd60a]"
              />
              <button
                type="submit"
                className={`${bangers.className} flex min-h-[60px] cursor-pointer items-center justify-center gap-3 rounded-full border-[3px] border-zinc-950 bg-[#ffd60a] px-4 py-2.5 text-center text-[19px] tracking-[1px] text-zinc-950 no-underline shadow-[4px_4px_0_#09090b] transition-transform hover:-translate-y-0.5 sm:px-6 sm:text-[28px] sm:tracking-[1.5px]`}
              >
                ENVOYER À BOBBEE
              </button>
            </form>
            <p className="-mt-1.5 text-center text-sm leading-snug text-zinc-700">
              Ta question s&apos;ouvre dans Claude, dans un nouvel onglet, et Bobbee te répond
              là-bas. Si Claude affiche un avertissement, c&apos;est normal : continue.
            </p>
            <p className="-mt-1.5 text-center text-sm leading-snug text-zinc-700">
              Pas encore d&apos;accès à Claude ? Ça peut prendre quelques jours : en attendant,
              découvre la ruche avec ton parcours ci-dessous.
            </p>
            <div className="flex flex-col gap-0.5 border-t-2 border-dashed border-zinc-200 pt-3">
              <p className="mb-0.5 text-sm font-semibold text-zinc-600">
                Pas d&apos;idée ? Clique sur une question pour la mettre dans le champ.
              </p>
              {EXAMPLE_QUESTIONS.map((example) => (
                <button
                  key={example}
                  type="button"
                  onClick={() => handleSelectExample(example)}
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
                  {example}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div
          className="relative flex min-h-[460px] min-w-0 flex-[1_1_400px] flex-col items-center justify-center overflow-hidden rounded-xl border-4 border-zinc-950 px-5 pb-8 pt-20 text-zinc-950 shadow-[6px_6px_0_#09090b]"
          style={RAYS_BACKGROUND}
        >
          <p
            aria-hidden="true"
            className={`${bangers.className} absolute right-5 top-5 rotate-[8deg] rounded-md border-[3px] border-zinc-950 bg-white px-3.5 pb-0.5 pt-1 text-[30px] leading-none tracking-[2px] shadow-[3px_3px_0_#09090b]`}
          >
            BZZZ !
          </p>
          <div
            aria-live="polite"
            className="relative max-w-[300px] rounded-[22px] border-[3px] border-zinc-950 bg-white px-[18px] py-3.5 text-center text-lg font-extrabold leading-snug"
          >
            {tourStep === null ? TOUR_INTRO : TOUR_STEPS[tourStep].bubble}
            <span
              aria-hidden="true"
              className="absolute -bottom-4 left-1/2 -ml-3 h-6 w-6 rotate-45 border-b-[3px] border-r-[3px] border-zinc-950 bg-white"
            />
          </div>
          <button
            type="button"
            onClick={() => goToTourStep(tourStep === null ? 0 : null)}
            aria-label={
              tourStep === null
                ? "Lancer la visite guidée avec Bobbee"
                : "Arrêter la visite guidée"
            }
            className="mt-6 w-[min(300px,75%)] cursor-pointer transition-transform hover:scale-105"
          >
            <Image
              src={BOBBEE_IMAGE_BY_STATE[bobbeeState]}
              alt="Bobbee, la mascotte"
              width={480}
              height={480}
              priority
              className="h-auto w-full drop-shadow-[0_10px_14px_rgba(120,72,0,0.25)]"
            />
          </button>
          {tourStep !== null && (
            <div className="mt-4 flex items-center gap-3">
              <button
                type="button"
                onClick={() => goToTourStep(tourStep - 1)}
                aria-label="Étape précédente"
                className={`${TOUR_ROUND_BUTTON} ${tourStep === 0 ? "invisible" : ""}`}
              >
                ‹
              </button>
              <div className="flex items-center gap-1">
                {TOUR_STEPS.map((step, index) => (
                  <button
                    key={step.label}
                    type="button"
                    onClick={() => goToTourStep(index)}
                    aria-label={`Étape ${index + 1} sur ${TOUR_STEPS.length}`}
                    className="flex h-7 w-7 cursor-pointer items-center justify-center"
                  >
                    <span
                      className={`h-3 w-3 rounded-full border-2 border-zinc-950 ${index === tourStep ? "bg-zinc-950" : "bg-white"}`}
                    />
                  </button>
                ))}
              </div>
              <button
                type="button"
                onClick={() => goToTourStep(tourStep === TOUR_STEPS.length - 1 ? null : tourStep + 1)}
                aria-label={tourStep === TOUR_STEPS.length - 1 ? "Terminer la visite" : "Étape suivante"}
                className={TOUR_ROUND_BUTTON}
              >
                {tourStep === TOUR_STEPS.length - 1 ? "✓" : "›"}
              </button>
            </div>
          )}
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
          <article
            ref={(el) => {
              zoneRefs.current[1] = el;
            }}
            className={`relative ${STEP_CARD} ${tourStep === 1 ? TOUR_ACTIVE : ""}`}
          >
            <TourTag active={tourStep === 1} text={TOUR_STEPS[1].label} />
            <StepHeader number={1} title="DÉCOUVRE L'ÉQUIPE" />
            <p className={STEP_TEXT}>Qui fait quoi dans la ruche, et d&apos;où vient Bobbee.</p>
            <div className="flex flex-col">
              <Link href="/organigramme" className={`${STEP_LINK} border-b-2 border-zinc-100`}>
                L&apos;organigramme <span aria-hidden="true">→</span>
              </Link>
              <Link href="/presentation" className={STEP_LINK}>
                Bobbee et son histoire <span aria-hidden="true">→</span>
              </Link>
            </div>
          </article>

          <article
            ref={(el) => {
              zoneRefs.current[2] = el;
            }}
            className={`relative ${STEP_CARD} ${tourStep === 2 ? TOUR_ACTIVE : ""}`}
          >
            <TourTag active={tourStep === 2} text={TOUR_STEPS[2].label} />
            <StepHeader number={2} title="DÉMARRE" />
            <p className={STEP_TEXT}>Les étapes clés pour bien démarrer.</p>
            <div className="flex flex-col">
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

          <article
            ref={(el) => {
              zoneRefs.current[3] = el;
            }}
            className={`relative ${STEP_CARD} ${tourStep === 3 ? TOUR_ACTIVE : ""}`}
          >
            <TourTag active={tourStep === 3} text={TOUR_STEPS[3].label} />
            <StepHeader number={3} title="TOUS TES LIENS" />
            <p className={STEP_TEXT}>
              Les premiers repères à garder sous la main pour avancer simplement.
            </p>
            <Link
              href="/essentiels"
              className="mt-1 flex min-h-12 items-center justify-between rounded-[10px] border-[3px] border-zinc-950 bg-[#ffd60a] px-4 text-base font-extrabold text-zinc-950 no-underline transition-transform hover:-translate-y-0.5"
            >
              Ouvrir Les essentiels <span aria-hidden="true">→</span>
            </Link>
          </article>
        </div>
      </section>
    </MangaPage>
  );
}
