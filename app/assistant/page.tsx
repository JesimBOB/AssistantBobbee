import { CLAUDE_ASSISTANT_URL, MangaPage, PAGE_TITLE, PANEL, bangers } from "../manga";

// BROUILLON : les étapes ci-dessous sont à confirmer (marquées « à confirmer » sur la page).
const STEPS = [
  {
    title: "Avoir accès à Claude",
    text: "Il te faut un compte Claude. L'accès peut prendre quelques jours : pas d'inquiétude, découvre la ruche en attendant.",
    confirm: "Qui demander pour obtenir l'accès ?",
  },
  {
    title: "Ouvrir le projet de Bobbee",
    text: "Le bouton en bas de page ouvre le projet partagé dans Claude. C'est là que Bobbee répond.",
    confirm: null,
  },
  {
    title: "Connecter tes outils",
    text: "Dans Claude, ouvre les paramètres puis les connecteurs, et connecte tes comptes Atlassian (Confluence, Jira) et Microsoft 365 (Outlook, Teams, SharePoint).",
    confirm: "Noms exacts des écrans et des connecteurs à vérifier.",
  },
  {
    title: "Poser ta première question",
    text: "Écris ta question à Bobbee. Il cherche dans tes outils connectés et te répond.",
    confirm: null,
  },
];

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
          <li key={step.title} className={`${PANEL} flex flex-col gap-3 p-[22px]`}>
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
            {step.confirm && (
              <p className="rounded-md border-2 border-dashed border-zinc-950 bg-[#fff7cc] px-3 py-1.5 text-sm font-bold text-zinc-950">
                À confirmer : {step.confirm}
              </p>
            )}
          </li>
        ))}
      </ol>

      <a
        href={CLAUDE_ASSISTANT_URL}
        target="_blank"
        rel="noreferrer"
        className={`${bangers.className} flex min-h-[60px] items-center justify-center self-start rounded-full border-[3px] border-zinc-950 bg-[#ffd60a] px-8 py-2.5 text-[24px] tracking-[1.5px] text-zinc-950 no-underline shadow-[4px_4px_0_#09090b] transition-transform hover:-translate-y-0.5`}
      >
        OUVRIR L&apos;ASSISTANT DANS CLAUDE ↗
      </a>
    </MangaPage>
  );
}
