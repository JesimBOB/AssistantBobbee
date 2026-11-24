import { MangaPage, PAGE_TITLE, PANEL, bangers } from "../manga";

const essentials = [
  {
    title: "Démarrage",
    items: [
      {
        label: "Mise en place environnement",
        href: "https://isagri.atlassian.net/wiki/x/BIB8WQE",
      },
      {
        label: "Guide d’Onboarding Développeur Maïdo",
        href: "https://isagri.atlassian.net/wiki/x/AYCLbwE",
      },
      {
        label: "Guide d’Onboarding QA -Maïdo",
        href: "https://isagri.atlassian.net/wiki/x/AoDDcQE",
      },
      {
        label: "Organigramme MAIDO public",
        href: "https://app.klaxoon.com/participate/board/WF2N6AF",
      },
      {
        label: "Assistant de recherche Claude (Confluence, Teams, Outlook)",
        href: "https://claude.ai/project/01a1d5a2-f43a-733c-838f-6ad6eede2d06",
      },
    ],
  },
  {
    title: "Outils & workflow",
    items: [
      {
        label: "JIRA pour les débutants",
        href: "https://isagri.atlassian.net/wiki/x/LIC5VQE",
      },
      {
        label: "Confluence pour les débutants",
        href: "https://isagri.atlassian.net/wiki/x/FAC7VQE",
      },
      {
        label: "Tableau Maïdo-Planification + Workflow",
        href: "https://isagri.atlassian.net/wiki/x/BwBzYgE",
      },
      {
        label: "Tableau MAIDO- BUGS + workflow bugs",
        href: "https://isagri.atlassian.net/wiki/x/NwAtZQE",
      },
    ],
  },
  {
    title: "Dev / QA quotidien",
    items: [
      {
        label: "Git",
        href: "https://isagri.atlassian.net/wiki/x/DQC9VQE",
      },
      {
        label: "Commandes utiles",
        href: "https://isagri.atlassian.net/wiki/x/HwC3VQE",
      },
      {
        label: "VS Code",
        href: "https://isagri.atlassian.net/wiki/x/AYDCVQE",
      },
      {
        label: "Processus de tests avant push (TU & E2E) local",
        href: "https://isagri.atlassian.net/wiki/x/QIB9aQE",
      },
    ],
  },
];

export default function EssentielsPage() {
  return (
    <MangaPage current="essentiels">
      <section className="flex flex-col gap-3.5">
        <h1 className={PAGE_TITLE}>LES ESSENTIELS</h1>
        <p className="mt-2.5 text-lg font-semibold">
          Les premiers repères à garder sous la main pour avancer simplement.
        </p>
      </section>

      <div className="grid grid-cols-[repeat(auto-fit,minmax(300px,1fr))] items-start gap-7">
        {essentials.map((section) => (
          <article key={section.title} className={`${PANEL} overflow-hidden`}>
            <h2
              className={`${bangers.className} border-b-4 border-zinc-950 bg-[#ffd60a] px-[18px] pb-2 pt-3 text-[28px] font-normal uppercase leading-none tracking-[1.5px]`}
            >
              {section.title}
            </h2>
            <ul className="px-[18px] pb-3 pt-1.5">
              {section.items.map((item) => (
                <li key={item.label} className="border-b-2 border-dashed border-zinc-200 last:border-b-0">
                  <a
                    href={item.href}
                    target="_blank"
                    rel="noreferrer"
                    className="flex min-h-12 items-center justify-between gap-3 py-2 text-base font-bold text-zinc-950 no-underline hover:text-[#5b4300]"
                  >
                    {item.label}
                    <span
                      aria-hidden="true"
                      className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full border-2 border-zinc-950 bg-[#fff7cc] text-sm"
                    >
                      ↗
                    </span>
                  </a>
                </li>
              ))}
            </ul>
          </article>
        ))}
      </div>
    </MangaPage>
  );
}
