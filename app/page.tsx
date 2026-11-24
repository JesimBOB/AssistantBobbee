"use client";

import Link from "next/link";
import Image from "next/image";
import { Bangers } from "next/font/google";
import { useEffect, useRef, useState } from "react";

// Direction visuelle « Manga » : encre noire, ombres pleines, trame de points.
const bangers = Bangers({ weight: "400", subsets: ["latin"] });
const HALFTONE_BACKGROUND =
  "bg-[#fffdf5] bg-[radial-gradient(#e9e2c8_1.2px,transparent_1.2px)] bg-[length:14px_14px]";

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

function FirstStepsContent() {
  return (
    <ol className="flex flex-col gap-3 lg:gap-[0.9cqw]">
      {FIRST_STEPS.map((step, stepIndex) => (
        <li
          key={step.title}
          className="rounded-md border-[3px] border-zinc-950 bg-white px-3 py-2.5 shadow-[3px_3px_0_#09090b] lg:px-[0.8cqw] lg:py-[0.7cqw]"
        >
          <p
            className={`${bangers.className} flex items-center gap-2 text-[19px] tracking-wide text-zinc-950 lg:text-[clamp(14px,1.35cqw,19px)]`}
          >
            <span className="inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 border-zinc-950 bg-[#ffd60a] text-[14px] text-zinc-950 lg:h-[1.7cqw] lg:w-[1.7cqw] lg:text-[clamp(11px,1cqw,14px)]">
              {stepIndex + 1}
            </span>
            {step.title}
          </p>
          <ul className="mt-2 flex flex-col gap-1 pl-8 lg:mt-[0.5cqw] lg:pl-[2.1cqw]">
            {step.links.map((link) => {
              const className =
                "text-[13px] font-bold leading-5 text-zinc-900 underline decoration-[#ffd60a] decoration-[3px] underline-offset-2 transition-colors hover:text-[#5b4300] lg:text-[clamp(11px,0.9cqw,13px)] lg:leading-snug";

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
    <main className={`relative min-h-screen overflow-hidden ${HALFTONE_BACKGROUND} px-6 py-12 text-zinc-950 sm:px-10 lg:flex lg:items-center lg:justify-center lg:p-0`}>
      <div className="home-desktop-stage @container relative z-10 mx-auto w-full lg:mx-0 lg:shrink-0">
      <Link
        href="/essentiels"
        className={`${bangers.className} mb-4 inline-flex w-fit min-w-[150px] items-center gap-2.5 rounded-full border-[3px] border-zinc-950 bg-[#ffd60a] px-4 py-2 text-xl tracking-wider text-zinc-950 shadow-[4px_4px_0_#09090b] transition-transform hover:-translate-y-0.5 lg:absolute lg:left-[2.5%] lg:top-[6.5%] lg:z-20 lg:mb-0`}
      >
        <span className="text-2xl leading-none text-zinc-950" aria-hidden="true">
          ★
        </span>
        <span>Les essentiels</span>
      </Link>

      <header className="mx-auto mt-6 max-w-md text-center lg:absolute lg:left-[35.5%] lg:top-[5%] lg:z-20 lg:mt-0 lg:w-[34%] lg:max-w-none">
        <h1
          className={`${bangers.className} -rotate-[1.5deg] rounded-md border-4 border-zinc-950 bg-[#ffd60a] px-5 py-3 tracking-wider shadow-[6px_6px_0_#09090b] lg:border-[0.3cqw] lg:px-[2cqw] lg:py-[0.9cqw] lg:shadow-[0.5cqw_0.5cqw_0_#09090b]`}
        >
          <span className="block text-[30px] leading-[0.95] text-zinc-950 lg:text-[2.8cqw]">
            Bienvenue
          </span>
          <span className="block text-[44px] leading-[0.95] text-white [-webkit-text-stroke:2px_#09090b] [paint-order:stroke_fill] lg:text-[4cqw] lg:[-webkit-text-stroke:0.2cqw_#09090b]">
            dans la ruche.
          </span>
        </h1>
        <p className="mt-4 rounded border-2 border-zinc-950 bg-white px-3 py-1.5 text-sm font-bold leading-6 text-zinc-900 lg:mt-[1.1cqw] lg:px-[0.9cqw] lg:py-[0.4cqw] lg:text-[1.05cqw] lg:leading-normal">
          Ici, tu découvres l&apos;équipe et tes premiers pas. Pour toute
          question,{" "}
          <span className="bg-[#ffd60a] px-1">Bobbee</span>{" "}
          te répond dans Claude.
        </p>
      </header>

      <div
        aria-hidden="true"
        className="pointer-events-none absolute bottom-[3.8%] left-[78.3%] right-[1.6%] top-[17.5%] z-10 hidden rounded-md border-[0.3cqw] border-zinc-950 bg-[#fff7cc] shadow-[0.5cqw_0.5cqw_0_#09090b] lg:block"
      >
        <p
          className={`${bangers.className} absolute left-[8%] top-[3%] flex items-center gap-[0.5cqw] text-[2cqw] tracking-wider text-zinc-950`}
        >
          Tes premiers pas <span>✦</span>
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
          className="w-full max-w-xl rounded-md border-4 border-zinc-950 bg-white p-3.5 text-left shadow-[6px_6px_0_#09090b] sm:p-4 lg:absolute lg:border-[0.3cqw] lg:shadow-[0.5cqw_0.5cqw_0_#09090b] lg:left-[35%] lg:top-[65.5%] lg:flex lg:max-h-[34%] lg:w-[34%] lg:max-w-none lg:flex-col lg:overflow-hidden lg:p-[1.1cqw]"
          aria-label="Poser une question à Bobbee"
        >
          <a
            href={CLAUDE_ASSISTANT_URL}
            target="_blank"
            rel="noreferrer"
            className={`${bangers.className} flex items-center justify-center gap-2 rounded-full border-[3px] border-zinc-950 bg-[#ffd60a] px-4 py-3 text-center text-[19px] tracking-wide sm:text-[22px] sm:tracking-wider text-zinc-950 no-underline shadow-[4px_4px_0_#09090b] transition-transform hover:-translate-y-0.5 lg:py-[0.6cqw] lg:text-[clamp(16px,1.6cqw,24px)]`}
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
                className="rounded-full border-2 border-zinc-950 bg-white px-3 py-1.5 text-left text-[13px] font-semibold text-zinc-900 shadow-[2px_2px_0_#09090b] transition-colors hover:bg-[#fff7cc] lg:px-[0.8cqw] lg:py-[0.35cqw] lg:text-[clamp(11px,0.9cqw,13px)]"
              >
                {copiedIndex === index ? "Copié ! Colle-la dans Claude" : question}
              </button>
            ))}
          </div>
        </section>
      </section>

      <section
        className="relative z-10 mx-auto mt-8 w-full max-w-3xl rounded-md border-4 border-zinc-950 bg-[#fff7cc] p-4 text-left shadow-[6px_6px_0_#09090b] lg:hidden"
        aria-label="Tes premiers pas"
      >
        <h2
          className={`${bangers.className} mb-3 text-[26px] tracking-wider text-zinc-950`}
        >
          Tes premiers pas <span>✦</span>
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
                  className={`${bangers.className} w-[60%] text-[22px] leading-tight tracking-wide text-zinc-950 sm:w-full lg:w-[60%] lg:text-[1.8cqw]`}
                >
                  {card.title}
                </span>
                <span className="mb-3 mt-1.5 w-[60%] text-[13px] leading-5 text-zinc-700 sm:w-full lg:mb-[0.6cqw] lg:mt-[0.5cqw] lg:w-[60%] lg:text-[clamp(11px,0.95cqw,14px)] lg:leading-snug">
                  {card.description}
                </span>
                <span className="mt-auto inline-flex w-fit items-center gap-1.5 whitespace-nowrap rounded-full border-2 border-zinc-950 bg-[#ffd60a] px-3 py-1.5 text-[13px] font-bold text-zinc-950 shadow-[2px_2px_0_#09090b] transition-colors group-hover:bg-[#ffe347] lg:mt-auto lg:px-[0.9cqw] lg:py-[0.45cqw] lg:text-[clamp(11px,0.95cqw,14px)]">
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
            "group relative flex min-h-[9.5rem] overflow-hidden rounded-md border-4 border-zinc-950 bg-white p-4 no-underline shadow-[5px_5px_0_#09090b] transition-transform hover:-translate-y-0.5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zinc-950 lg:min-h-0 lg:flex-1 lg:border-[0.3cqw] lg:p-[1.3cqw] lg:shadow-[0.45cqw_0.45cqw_0_#09090b]";

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
