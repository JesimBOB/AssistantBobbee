import Link from "next/link";

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
    <main
      className="min-h-screen bg-zinc-50 bg-cover bg-[center_top] bg-no-repeat px-6 py-12 text-zinc-950 sm:px-10"
      style={{
        backgroundImage:
          "linear-gradient(rgba(250, 250, 250, 0.72), rgba(250, 250, 250, 0.72)), url('/backgrounds/internal-page-background.png')",
      }}
    >
      <div className="mx-auto mb-4 flex w-full max-w-4xl">
        <Link
          href="/"
          aria-label="Retour a l'accueil"
          className="inline-flex items-center gap-2 rounded-full border border-amber-200 bg-white px-3 py-1.5 text-sm font-medium text-zinc-700 shadow-sm transition-colors hover:bg-amber-50 hover:text-zinc-950"
        >
          <span>Home</span>
        </Link>
      </div>

      <section className="mx-auto flex w-full max-w-4xl flex-col gap-6">
        <header className="rounded-[28px] border border-amber-200/70 bg-white p-5 shadow-[0_18px_42px_-34px_rgba(24,24,27,0.42)] sm:p-6">
          <p className="text-sm font-semibold uppercase tracking-[0.16em] text-amber-700">
            Onboarding
          </p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-zinc-950 sm:text-4xl">
            Essentiels
          </h1>
          <p className="mt-3 max-w-2xl text-base leading-7 text-zinc-600">
            Les premiers reperes a garder sous la main pour avancer simplement.
          </p>
        </header>

        <div className="grid gap-4 md:grid-cols-3">
          {essentials.map((section) => (
            <article
              key={section.title}
              className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm shadow-zinc-200/60"
            >
              <h2 className="text-lg font-semibold tracking-tight text-zinc-950">
                {section.title}
              </h2>
              <ul className="mt-4 space-y-3 text-sm leading-6 text-zinc-600">
                {section.items.map((item) => (
                  <li key={item.label}>
                    <a
                      href={item.href}
                      target="_blank"
                      rel="noreferrer"
                      className="text-zinc-600 underline-offset-4 hover:text-zinc-950 hover:underline"
                    >
                      {item.label}
                    </a>
                  </li>
                ))}
              </ul>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
