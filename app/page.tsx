"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";

type BobbeeState = "idle" | "found";

const BOBBEE_IMAGE_BY_STATE: Record<BobbeeState, string> = {
  idle: "/bobbee/bobbee-idle.png",
  found: "/bobbee/bobbee-found.png",
};
const FOUND_DURATION_MS = 1500;
// Cartes de raccourcis de la home (ordinateur : colonne de gauche ; mobile : sous le chat).
const HOME_CARDS = [
  {
    title: "Organigramme",
    description: "Explore la ruche MAIDO et retrouve les équipes.",
    cta: "Voir l'organigramme",
    href: "/organigramme",
    external: false,
    image: "/home/card-organigramme.png",
    imageWidth: 132,
    imageHeight: 172,
  },
  {
    title: "Bobbee",
    description: "Bobbee et son histoire.",
    cta: "Découvrir Bobbee",
    href: "/presentation",
    external: false,
    image: "/home/card-bobbee.png",
    imageWidth: 152,
    imageHeight: 118,
  },
  {
    title: "Checklist onboarding",
    description: "Les étapes clés pour bien démarrer.",
    cta: "Voir la checklist",
    href: "https://isagri.atlassian.net/wiki/spaces/BO/pages/6166380545/Guide+d+Onboarding+D+veloppeur+Ma+do",
    external: true,
    image: "/home/card-checklist.png",
    imageWidth: 138,
    imageHeight: 168,
  },
];
// Projet Claude partagé : recherche dans Confluence, Teams et Outlook.
const CLAUDE_ASSISTANT_URL =
  "https://claude.ai/project/01a1d5a2-f43a-733c-838f-6ad6eede2d06";
// Exemples de questions à poser dans Claude (copiées dans le presse-papiers au clic).
const EXAMPLE_QUESTIONS = [
  "Qui maîtrise la TVA dans l'équipe ?",
  "Qu'est-ce qui a été décidé sur la facture électronique ?",
  "Qui est le PO du pôle Lavande ?",
];
// Premiers pas du nouvel arrivant (liens repris de la page « Les essentiels »).
const FIRST_STEPS = [
  {
    title: "Découvre l'équipe",
    links: [
      { label: "La vidéo Bobbee", href: "/presentation", external: false },
      { label: "L'organigramme", href: "/organigramme", external: false },
    ],
  },
  {
    title: "Installe ton poste",
    links: [
      {
        label: "Mise en place environnement",
        href: "https://isagri.atlassian.net/wiki/x/BIB8WQE",
        external: true,
      },
      {
        label: "Guide d'onboarding Développeur",
        href: "https://isagri.atlassian.net/wiki/x/AYCLbwE",
        external: true,
      },
      {
        label: "Guide d'onboarding QA",
        href: "https://isagri.atlassian.net/wiki/x/AoDDcQE",
        external: true,
      },
    ],
  },
  {
    title: "Prends tes repères",
    links: [
      {
        label: "JIRA pour les débutants",
        href: "https://isagri.atlassian.net/wiki/x/LIC5VQE",
        external: true,
      },
      {
        label: "Confluence pour les débutants",
        href: "https://isagri.atlassian.net/wiki/x/FAC7VQE",
        external: true,
      },
      { label: "Tous les essentiels", href: "/essentiels", external: false },
    ],
  },
];
const ROUNDED_FONT_STACK =
  '"Arial Rounded MT Bold", "Trebuchet MS", Arial, sans-serif';

function FirstStepsContent() {
  return (
    <ol className="flex flex-col gap-3 lg:gap-[0.9cqw]">
      {FIRST_STEPS.map((step, stepIndex) => (
        <li
          key={step.title}
          className="rounded-[18px] bg-amber-50/72 px-3 py-2.5 ring-1 ring-amber-200/45 lg:rounded-[1cqw] lg:px-[0.8cqw] lg:py-[0.7cqw]"
        >
          <p
            className="flex items-center gap-2 text-[15px] font-semibold text-zinc-900 lg:text-[clamp(12px,1.05cqw,15px)]"
            style={{ fontFamily: ROUNDED_FONT_STACK }}
          >
            <span className="inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-amber-300 text-[12px] text-amber-950 lg:h-[1.6cqw] lg:w-[1.6cqw] lg:text-[clamp(10px,0.85cqw,12px)]">
              {stepIndex + 1}
            </span>
            {step.title}
          </p>
          <ul className="mt-2 flex flex-col gap-1 pl-8 lg:mt-[0.5cqw] lg:pl-[2.1cqw]">
            {step.links.map((link) => {
              const className =
                "text-[13px] leading-5 text-zinc-700 underline decoration-amber-300 underline-offset-2 transition-colors hover:text-zinc-950 lg:text-[clamp(11px,0.9cqw,13px)] lg:leading-snug";

              return (
                <li key={link.label}>
                  {link.external ? (
                    <a
                      href={link.href}
                      target="_blank"
                      rel="noreferrer"
                      className={className}
                    >
                      {link.label}
                    </a>
                  ) : (
                    <Link href={link.href} className={className}>
                      {link.label}
                    </Link>
                  )}
                </li>
              );
            })}
          </ul>
        </li>
      ))}
    </ol>
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
    <main className="relative min-h-screen overflow-hidden bg-zinc-50 bg-[url('/backgrounds/internal-page-background.webp')] bg-cover bg-top px-6 py-12 text-zinc-950 sm:px-10 lg:flex lg:items-center lg:justify-center lg:bg-none lg:p-0">
      <div className="home-desktop-stage @container relative z-10 mx-auto w-full lg:mx-0 lg:shrink-0">
      <Link
        href="/essentiels"
        className="mb-4 inline-flex w-fit min-w-[150px] items-center gap-2.5 rounded-full border-2 border-amber-400 bg-[linear-gradient(135deg,#fff7d6_0%,#fde68a_52%,#fef3c7_100%)] px-4 py-2 text-sm font-semibold text-amber-950 shadow-[0_14px_26px_-18px_rgba(146,64,14,0.85),0_3px_0_rgba(180,83,9,0.18)] ring-1 ring-white/80 transition-colors hover:border-amber-500 hover:bg-amber-100 lg:absolute lg:left-[2.5%] lg:top-[6.5%] lg:z-20 lg:mb-0"
      >
        <span
          className="text-3xl leading-none text-orange-500 drop-shadow-[0_2px_0_rgba(120,53,15,0.18)]"
          aria-hidden="true"
        >
          ★
        </span>
        <span>Les essentiels</span>
      </Link>

      <header className="mx-auto mt-6 max-w-md text-center lg:absolute lg:left-[35.5%] lg:top-[5%] lg:z-20 lg:mt-0 lg:w-[34%] lg:max-w-none">
        <h1
          className="rounded-[22px] border-[3px] border-amber-700/80 bg-[linear-gradient(180deg,#fff6e0_0%,#fbe3b5_100%)] px-5 py-3 shadow-[0_5px_0_rgba(146,64,14,0.35),0_18px_30px_-20px_rgba(120,53,15,0.7)] lg:rounded-[1.6cqw] lg:border-[0.25cqw] lg:px-[2cqw] lg:py-[1cqw]"
          style={{ fontFamily: ROUNDED_FONT_STACK }}
        >
          <span className="block text-[26px] leading-tight text-zinc-900 lg:text-[2.5cqw]">
            Bienvenue
          </span>
          <span className="block text-[34px] leading-tight text-amber-400 [-webkit-text-stroke:2px_#3f2a14] [paint-order:stroke_fill] lg:text-[3.3cqw] lg:[-webkit-text-stroke:0.22cqw_#3f2a14]">
            dans la ruche.
          </span>
        </h1>
        <p className="mt-3 text-sm leading-6 text-zinc-700 lg:mt-[0.9cqw] lg:text-[1.05cqw] lg:leading-normal">
          Ici, tu découvres l&apos;équipe et tes premiers pas. Pour toute
          question,{" "}
          <span className="font-semibold text-orange-500">Bobbee</span>{" "}
          te répond dans Claude.
        </p>
      </header>

      <div
        aria-hidden="true"
        className="pointer-events-none absolute bottom-[3.8%] left-[78.3%] right-[1.6%] top-[17.5%] z-10 hidden rounded-[2cqw] border border-amber-200/80 bg-[#fdf3e1]/85 shadow-[0_18px_40px_-30px_rgba(120,53,15,0.55)] lg:block"
      >
        <p
          className="absolute left-[8%] top-[3%] flex items-center gap-[0.5cqw] text-[1.45cqw] font-bold text-zinc-900"
          style={{ fontFamily: ROUNDED_FONT_STACK }}
        >
          Tes premiers pas <span className="text-amber-400">✦</span>
        </p>
      </div>

      <aside
        className="absolute right-[2.9%] top-[25%] z-20 hidden h-[68%] w-[17.6%] overflow-y-auto px-1.5 py-1 text-left lg:block"
        aria-label="Tes premiers pas"
      >
        <FirstStepsContent />
      </aside>

      <section className="relative z-10 mx-auto mt-4 flex w-full max-w-3xl flex-col items-center gap-5 text-center lg:contents">
        <div
          className="w-full max-w-[11rem] sm:max-w-[13rem] lg:absolute lg:left-[52%] lg:top-[30%] lg:w-[20%] lg:max-w-none lg:-translate-x-1/2"
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
          className="w-full max-w-xl rounded-[30px] border border-white/70 bg-gradient-to-b from-amber-100/88 via-amber-50/78 to-white/96 p-3.5 text-left shadow-[0_28px_70px_-32px_rgba(24,24,27,0.55)] ring-1 ring-amber-300/45 sm:p-4 lg:absolute lg:left-[35%] lg:top-[65.5%] lg:flex lg:max-h-[34%] lg:w-[34%] lg:max-w-none lg:flex-col lg:overflow-hidden lg:p-[1.1cqw]"
          aria-label="Poser une question à Bobbee"
        >
          <a
            href={CLAUDE_ASSISTANT_URL}
            target="_blank"
            rel="noreferrer"
            className="flex items-center justify-center gap-2 rounded-[18px] bg-zinc-900 px-4 py-3.5 text-center text-[16px] font-semibold text-amber-50 no-underline shadow-[0_16px_28px_-18px_rgba(24,24,27,0.85)] ring-1 ring-zinc-700/60 transition-colors hover:bg-zinc-800 lg:py-[0.8cqw] lg:text-[clamp(13px,1.2cqw,17px)]"
            style={{ fontFamily: ROUNDED_FONT_STACK }}
          >
            Pose ta question à Bobbee
            <span aria-hidden="true">→</span>
          </a>
          <p className="mt-1.5 text-center text-[12px] text-zinc-500 lg:text-[clamp(10px,0.8cqw,12px)]">
            S&apos;ouvre dans Claude, dans un nouvel onglet.
          </p>

          <p className="mt-3 text-[13px] font-medium text-zinc-700 lg:mt-[0.7cqw] lg:text-[clamp(11px,0.9cqw,13px)]">
            Par exemple (clique pour copier, puis colle dans Claude) :
          </p>
          <div className="mt-2 flex flex-wrap gap-2 lg:mt-[0.5cqw] lg:gap-[0.5cqw]">
            {EXAMPLE_QUESTIONS.map((question, index) => (
              <button
                key={question}
                type="button"
                onClick={() => handleCopyQuestion(question, index)}
                className="rounded-full bg-white/95 px-3 py-1.5 text-left text-[13px] text-zinc-800 shadow-[0_8px_14px_-12px_rgba(24,24,27,0.45)] ring-1 ring-amber-200/80 transition-colors hover:bg-amber-50 lg:px-[0.8cqw] lg:py-[0.35cqw] lg:text-[clamp(11px,0.9cqw,13px)]"
              >
                {copiedIndex === index ? "Copié ! Colle-la dans Claude" : question}
              </button>
            ))}
          </div>
        </section>
      </section>

      <section
        className="relative z-10 mx-auto mt-8 w-full max-w-3xl rounded-[24px] border border-amber-200/90 bg-[#fdf3e1]/90 p-4 text-left shadow-[0_16px_30px_-24px_rgba(120,53,15,0.7)] lg:hidden"
        aria-label="Tes premiers pas"
      >
        <h2
          className="mb-3 text-[19px] font-bold text-zinc-900"
          style={{ fontFamily: ROUNDED_FONT_STACK }}
        >
          Tes premiers pas <span className="text-amber-400">✦</span>
        </h2>
        <FirstStepsContent />
      </section>

      <nav
        aria-label="Raccourcis"
        className="relative z-10 mx-auto mt-8 grid w-full max-w-3xl gap-4 sm:grid-cols-3 lg:absolute lg:bottom-[4%] lg:left-[2.5%] lg:top-[15%] lg:z-20 lg:mt-0 lg:flex lg:w-[22%] lg:max-w-none lg:flex-col lg:gap-[1.2cqw]"
      >
        {HOME_CARDS.map((card) => {
          const content = (
            <>
              <span className="relative z-10 flex min-h-full w-full flex-col text-left">
                <span
                  className="w-[60%] text-[19px] leading-tight text-zinc-900 sm:w-full lg:w-[60%] lg:text-[1.75cqw]"
                  style={{ fontFamily: ROUNDED_FONT_STACK }}
                >
                  {card.title}
                </span>
                <span className="mb-3 mt-1.5 w-[60%] text-[13px] leading-5 text-zinc-700 sm:w-full lg:mb-[0.6cqw] lg:mt-[0.5cqw] lg:w-[60%] lg:text-[clamp(11px,0.95cqw,14px)] lg:leading-snug">
                  {card.description}
                </span>
                <span className="mt-auto inline-flex w-fit items-center gap-1.5 whitespace-nowrap rounded-full bg-amber-300 px-3 py-1.5 text-[13px] font-semibold text-amber-950 shadow-[0_6px_14px_-10px_rgba(146,64,14,0.9)] transition-colors group-hover:bg-amber-400 lg:mt-auto lg:px-[0.9cqw] lg:py-[0.45cqw] lg:text-[clamp(11px,0.95cqw,14px)]">
                  {card.cta}
                  <span aria-hidden="true">→</span>
                </span>
              </span>
              <Image
                src={card.image}
                alt=""
                width={card.imageWidth}
                height={card.imageHeight}
                unoptimized
                className="absolute right-[5%] top-[10%] h-[58%] w-auto max-w-[35%] object-contain object-top sm:hidden lg:block"
              />
            </>
          );
          const className =
            "group relative flex min-h-[9.5rem] overflow-hidden rounded-[24px] border border-amber-200/90 bg-[#fdeed7] p-4 no-underline shadow-[0_16px_30px_-24px_rgba(120,53,15,0.7)] transition-shadow hover:shadow-[0_18px_34px_-20px_rgba(120,53,15,0.75)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-500 lg:min-h-0 lg:flex-1 lg:rounded-[1.6cqw] lg:p-[1.3cqw]";

          return card.external ? (
            <a
              key={card.title}
              href={card.href}
              target="_blank"
              rel="noreferrer"
              className={className}
            >
              {content}
            </a>
          ) : (
            <Link key={card.title} href={card.href} className={className}>
              {content}
            </Link>
          );
        })}
      </nav>
      </div>

      <style>{`
        @media (min-width: 1024px) {
          .home-desktop-stage {
            aspect-ratio: 7 / 4;
            background-image: url("/backgrounds/internal-page-background.webp");
            background-position: center center;
            background-repeat: no-repeat;
            background-size: contain;
            max-width: 1400px;
            width: calc(100% - 2rem);
          }
        }

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
