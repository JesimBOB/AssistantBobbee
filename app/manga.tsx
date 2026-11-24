import Image from "next/image";
import Link from "next/link";
import { Bangers } from "next/font/google";
import type { ReactNode } from "react";

// Direction visuelle « Manga » commune à toutes les pages :
// encre noire, jaune vif, police BD, ombres pleines, trame de points.
export const bangers = Bangers({ weight: "400", subsets: ["latin"] });

// Projet Claude partagé : Bobbee répond aux questions (Outlook, Teams, Confluence, SharePoint, Jira).
export const CLAUDE_ASSISTANT_URL =
  "https://claude.ai/project/01a1d5a2-f43a-733c-838f-6ad6eede2d06";

// Classes réutilisées par les pages.
export const PANEL =
  "rounded-[10px] border-4 border-zinc-950 bg-white shadow-[6px_6px_0_#09090b]";
export const PAGE_TITLE = `${bangers.className} -rotate-[1.5deg] self-start rounded-lg border-4 border-zinc-950 bg-[#ffd60a] px-6 pb-1.5 pt-2.5 text-[44px] font-normal leading-none tracking-[2px] shadow-[7px_7px_0_#09090b] sm:text-[64px]`;
export const SECTION_TITLE = `${bangers.className} -rotate-1 self-start rounded-md bg-zinc-950 px-4 pb-1 pt-1.5 text-[34px] font-normal tracking-[2px] text-white`;

type NavKey = "accueil" | "equipe" | "histoire" | "essentiels";

const NAV_LINKS: { key: NavKey; label: string; href: string }[] = [
  { key: "accueil", label: "Accueil", href: "/" },
  { key: "equipe", label: "L'équipe", href: "/organigramme" },
  { key: "histoire", label: "L'histoire", href: "/presentation" },
  { key: "essentiels", label: "Les essentiels", href: "/essentiels" },
];

function SiteNav({ current }: { current: NavKey }) {
  return (
    <header className="flex flex-wrap items-center justify-between gap-4 rounded-[10px] border-[3px] border-zinc-950 bg-white px-4 py-2.5 shadow-[4px_4px_0_#09090b]">
      <Link href="/" className="flex items-center gap-2.5 text-zinc-950 no-underline">
        <Image
          src="/bobbee/bobbee-idle.png"
          alt=""
          width={40}
          height={40}
          className="h-10 w-10 object-contain"
        />
        <span className={`${bangers.className} text-[30px] leading-none tracking-[1.5px]`}>
          BOBBEE
        </span>
      </Link>
      <nav aria-label="Navigation principale" className="flex flex-wrap items-center gap-1.5">
        {NAV_LINKS.map((link) =>
          link.key === current ? (
            <Link
              key={link.key}
              href={link.href}
              aria-current="page"
              className="rounded-full border-2 border-zinc-950 bg-[#ffd60a] px-3.5 py-2 text-[15px] font-extrabold text-zinc-950 no-underline"
            >
              {link.label}
            </Link>
          ) : (
            <Link
              key={link.key}
              href={link.href}
              className="rounded-full border-2 border-transparent px-3.5 py-2 text-[15px] font-bold text-zinc-950 no-underline hover:border-zinc-950"
            >
              {link.label}
            </Link>
          ),
        )}
      </nav>
      <a
        href={CLAUDE_ASSISTANT_URL}
        target="_blank"
        rel="noreferrer"
        className="rounded-full bg-zinc-950 px-4 py-2.5 text-[15px] font-extrabold text-[#ffd60a] no-underline hover:bg-zinc-800"
      >
        Poser une question ↗
      </a>
    </header>
  );
}

// Cadre commun : fond crème à trame de points, conteneur centré, barre de navigation.
export function MangaPage({
  current,
  children,
}: {
  current: NavKey;
  children: ReactNode;
}) {
  return (
    <main className="min-h-screen bg-[#fffdf5] bg-[radial-gradient(#e9e2c8_1.2px,transparent_1.2px)] bg-[length:14px_14px] text-zinc-950">
      <div className="mx-auto flex max-w-[1280px] flex-col gap-9 px-4 pb-14 pt-6 sm:px-10">
        <SiteNav current={current} />
        {children}
      </div>
    </main>
  );
}
