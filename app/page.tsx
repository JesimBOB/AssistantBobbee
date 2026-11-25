"use client";

import Link from "next/link";
import Image from "next/image";
import { useRef, useState, type FormEvent } from "react";
import { MangaPage, bangers, claudeChatUrl } from "./manga";

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
    <span className="absolute -top-5 right-4 z-10 max-w-[90%] rounded-2xl border-[3px] border-zinc-950 bg-zinc-950 px-4 py-1 text-lg font-extrabold leading-snug text-white shadow-[3px_3px_0_#09090b]">
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
const STEP_TEXT = "text-base italic leading-normal text-zinc-600";
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
  const [question, setQuestion] = useState("");
  const [tourStep, setTourStep] = useState<number | null>(null);
  const zoneRefs = useRef<(HTMLElement | null)[]>([]);

  function goToTourStep(step: number | null) {
    setTourStep(step);
    const zone = step !== null ? zoneRefs.current[step] : null;
    if (zone) {
      // On ne défile que si la zone n'est pas entièrement visible, pour que Bobbee reste sous la souris.
      const rect = zone.getBoundingClientRect();
      const fullyVisible = rect.top >= 0 && rect.bottom <= window.innerHeight;
      if (!fullyVisible) {
        zone.scrollIntoView({ behavior: "smooth", block: "nearest" });
      }
    }
  }

  function handleAsk(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmed = question.trim();
    // Champ vide : le chat s'ouvre avec le rappel de consignes, la personne écrit sa question à la suite.
    window.open(claudeChatUrl(trimmed), "_blank", "noopener,noreferrer");
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
              Pose ta question
            </h2>
            <form onSubmit={handleAsk} className="contents">
              <input
                type="text"
                value={question}
                onChange={(event) => setQuestion(event.target.value)}
                maxLength={500}
                aria-label="Ta question pour Bobbee"
                placeholder="Ex. : Qui maîtrise la TVA dans l'équipe ?"
                className="min-h-[52px] w-full rounded-xl border-[3px] border-zinc-950 bg-white px-4 text-base font-semibold text-zinc-950 placeholder:text-zinc-500 focus:outline-none focus:ring-4 focus:ring-[#ffd60a]"
              />
              <button
                type="submit"
                className={`${bangers.className} flex min-h-[60px] cursor-pointer items-center justify-center gap-3 rounded-full border-[3px] border-zinc-950 bg-[#ffd60a] px-4 py-2.5 text-center text-[19px] tracking-[1px] text-zinc-950 no-underline shadow-[4px_4px_0_#09090b] transition-transform hover:-translate-y-0.5 sm:px-6 sm:text-[28px] sm:tracking-[1.5px]`}
              >
                ENVOYER À L&apos;ASSISTANT BOBBEE
              </button>
            </form>
            <p className="-mt-1.5 text-center text-sm font-semibold text-zinc-950">
              <Link
                href="/assistant"
                className="underline decoration-[#ffd60a] decoration-[3px] underline-offset-4 hover:text-[#5b4300]"
              >
                Comment paramétrer l&apos;assistant (dans Claude) ?
              </Link>
            </p>
            <p className="-mt-1.5 text-center text-sm italic leading-snug text-zinc-700">
              Ta question s&apos;ouvre dans Claude, dans un nouvel onglet, et Bobbee te répond
              là-bas. Si Claude affiche un avertissement, c&apos;est normal : continue.
            </p>
            <p className="-mt-1.5 text-center text-sm italic leading-snug text-zinc-700">
              Pas encore d&apos;accès à Claude ? Ça peut prendre 24 à 48 heures : en attendant,
              découvre la ruche avec ton parcours ci-dessous.
            </p>
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
            className="relative flex min-h-[84px] max-w-[300px] items-center justify-center rounded-[22px] border-[3px] border-zinc-950 bg-white px-[18px] py-3.5 text-center text-lg font-extrabold leading-snug"
          >
            {tourStep === null ? TOUR_INTRO : TOUR_STEPS[tourStep].bubble}
            <span
              aria-hidden="true"
              className="absolute -bottom-4 left-1/2 -ml-3 h-6 w-6 rotate-45 border-b-[3px] border-r-[3px] border-zinc-950 bg-white"
            />
          </div>
          <button
            type="button"
            onClick={() =>
              goToTourStep(
                tourStep === null ? 0 : tourStep === TOUR_STEPS.length - 1 ? null : tourStep + 1,
              )
            }
            aria-label={
              tourStep === null
                ? "Lancer la visite guidée avec Bobbee"
                : tourStep === TOUR_STEPS.length - 1
                  ? "Terminer la visite guidée"
                  : "Étape suivante de la visite guidée"
            }
            className="mt-6 w-[min(300px,75%)] cursor-pointer transition-transform hover:scale-105"
          >
            <Image
              src="/bobbee/bobbee-idle.png"
              alt="Bobbee, la mascotte"
              width={480}
              height={480}
              priority
              className="h-auto w-full drop-shadow-[0_10px_14px_rgba(120,72,0,0.25)]"
            />
          </button>
          {/* Barre toujours présente (invisible hors visite) pour ne pas décaler Bobbee. */}
          <div className={`mt-4 flex items-center gap-3 ${tourStep === null ? "invisible" : ""}`}>
              <button
                type="button"
                onClick={() => goToTourStep(tourStep === null ? 0 : tourStep - 1)}
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
                onClick={() =>
                  goToTourStep(
                    tourStep === null ? 0 : tourStep === TOUR_STEPS.length - 1 ? null : tourStep + 1,
                  )
                }
                aria-label={tourStep === TOUR_STEPS.length - 1 ? "Terminer la visite" : "Étape suivante"}
                className={TOUR_ROUND_BUTTON}
              >
                {tourStep === TOUR_STEPS.length - 1 ? "✓" : "›"}
              </button>
            </div>
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
