import { MangaPage, PAGE_TITLE, PANEL, SECTION_TITLE, bangers, claudeChatUrl } from "../manga";
import CopyInstructionsButton from "./CopyInstructionsButton";

type Step = { title: string; text: string; copy?: boolean };

const STEPS: Step[] = [
  {
    title: "Avoir accès à Claude",
    text: "Ton compte Claude est créé automatiquement. Compte 24 à 48 heures après ton arrivée : pas d'inquiétude, découvre la ruche en attendant.",
  },
  {
    title: "Connecter tes outils",
    text: "Indispensable : sans ça, Bobbee ne trouve rien. Dans Claude, ouvre Paramètres, puis Personnalisation, puis l'onglet Connecteurs. Clique sur Connecter à côté d'Atlassian MCP (Confluence, Jira) et de Microsoft 365 (Outlook, Teams, SharePoint), puis connecte-toi avec ton compte pro. Chacun connecte ses propres comptes.",
  },
  {
    title: "Poser ta première question",
    text: "Écris ta question à Bobbee. Il cherche dans tes outils connectés et te répond.",
  },
];

// Facultatif : un projet Claude personnel avec les instructions complètes.
const OPTIONAL_STEPS: Step[] = [
  {
    title: "Créer ton projet",
    text: "Dans Claude, clique sur Projets dans le menu de gauche, puis sur le petit + (Créer un projet). Nomme-le « Bobbee · Assistant de recherche », laisse la visibilité sur Privé, puis clique sur Créer un projet.",
  },
  {
    title: "Coller les instructions",
    text: "Dans ton projet, à droite, clique sur le crayon à côté d'Instructions. Colle le texte copié avec le bouton ci-dessous, puis enregistre.",
    copy: true,
  },
];

function StepCard({ step, index }: { step: Step; index: number }) {
  return (
    <li className={`${PANEL} flex flex-col gap-3 p-[22px]`}>
      <div className="flex items-center gap-3">
        <span
          className={`${bangers.className} inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-[3px] border-zinc-950 bg-[#ffd60a] text-2xl`}
        >
          {index + 1}
        </span>
        <h2 className={`${bangers.className} text-[27px] font-normal leading-none tracking-[1.2px]`}>
          {step.title}
        </h2>
      </div>
      <p className="text-base italic leading-normal text-zinc-600">{step.text}</p>
      {step.copy ? <CopyInstructionsButton /> : null}
    </li>
  );
}

export default function AssistantPage() {
  return (
    <MangaPage current="assistant">
      <section className="flex flex-col gap-3.5">
        <h1 className={PAGE_TITLE}>L&apos;ASSISTANT BOBBEE</h1>
        <p className="mt-2.5 text-lg font-semibold">
          Comment paramétrer l&apos;assistant de recherche dans Claude.
        </p>
      </section>

      <ol className="grid grid-cols-[repeat(auto-fit,minmax(280px,1fr))] gap-6">
        {STEPS.map((step, index) => (
          <StepCard key={step.title} step={step} index={index} />
        ))}
      </ol>

      <a
        href={claudeChatUrl()}
        target="_blank"
        rel="noreferrer"
        className={`${bangers.className} flex min-h-[60px] items-center justify-center self-start rounded-full border-[3px] border-zinc-950 bg-[#ffd60a] px-8 py-2.5 text-[24px] tracking-[1.5px] text-zinc-950 no-underline shadow-[4px_4px_0_#09090b] transition-transform hover:-translate-y-0.5`}
      >
        OUVRIR L&apos;ASSISTANT DANS CLAUDE ↗
      </a>

      <section className="mt-6 flex flex-col gap-3.5">
        <h2 className={SECTION_TITLE}>POUR ALLER PLUS LOIN</h2>
        <p className="text-lg font-semibold">
          Facultatif : crée ton propre projet Claude avec les instructions complètes de Bobbee
          (liens, vocabulaire maison). Tu peux le faire plus tard.
        </p>
      </section>

      <ol className="grid grid-cols-[repeat(auto-fit,minmax(280px,1fr))] gap-6">
        {OPTIONAL_STEPS.map((step, index) => (
          <StepCard key={step.title} step={step} index={index} />
        ))}
      </ol>
    </MangaPage>
  );
}
