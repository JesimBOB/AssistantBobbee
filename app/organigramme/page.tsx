"use client";

import { useState } from "react";
import organigramme from "@/data/organigramme.json";
import { MangaPage, PAGE_TITLE, PANEL, bangers } from "../manga";

const teams = organigramme.teams;

function getRoleClassName(role: string) {
  const normalizedRole = role.toLowerCase();

  if (normalizedRole.includes("squad lead") || normalizedRole.includes("dir")) {
    return "bg-zinc-950 text-[#ffd60a]";
  }

  if (normalizedRole.includes("po") || normalizedRole === "pm") {
    return "bg-[#ffd60a] text-zinc-950";
  }

  if (normalizedRole.includes("dev") || normalizedRole.includes("archi")) {
    return "bg-white text-zinc-950";
  }

  if (normalizedRole.includes("qa")) {
    return "bg-sky-100 text-zinc-950";
  }

  if (
    normalizedRole.includes("consult") ||
    normalizedRole.includes("manager") ||
    normalizedRole.includes("cto")
  ) {
    return "bg-zinc-200 text-zinc-950";
  }

  return "bg-zinc-100 text-zinc-950";
}

export default function OrganigrammePage() {
  const [search, setSearch] = useState("");
  const trimmedSearch = search.trim();
  const query = trimmedSearch.toLowerCase();
  const filteredTeams = query
    ? teams.filter((team) =>
        [
          team.name,
          ...team.people.flatMap((person) => [person.name, person.role, person.note ?? ""]),
          ...team.tags,
        ].some((value) => value.toLowerCase().includes(query)),
      )
    : teams;
  const resultSummary = query
    ? filteredTeams.length === 1
      ? `1 pôle trouvé pour “${trimmedSearch}”`
      : filteredTeams.length > 1
        ? `${filteredTeams.length} pôles trouvés pour “${trimmedSearch}”`
        : `Aucun pôle trouvé pour “${trimmedSearch}”`
    : `${teams.length} pôles affichés`;

  return (
    <MangaPage current="equipe">
      <section className="flex flex-wrap items-end justify-between gap-7">
        <div className="flex min-w-0 flex-[1_1_420px] flex-col gap-3.5">
          <h1 className={PAGE_TITLE}>ORGANIGRAMME</h1>
          <p className="mt-2.5 text-lg font-semibold leading-snug">
            Retrouvez rapidement les pôles, rôles et expertises de l’équipe.
          </p>
          <p className="self-start rounded border-2 border-zinc-950 bg-white px-2.5 py-0.5 text-[13px] font-semibold text-zinc-700">
            Source : Klaxoon, mis à jour le {organigramme.exportDateLabel}.
          </p>
        </div>
        <div className={`${PANEL} flex min-w-0 flex-[1_1_420px] flex-col gap-2 p-[18px]`}>
          <label
            htmlFor="organigramme-search"
            className={`${bangers.className} text-[22px] tracking-[1.2px]`}
          >
            RECHERCHE
          </label>
          <input
            id="organigramme-search"
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Nom, pôle, rôle ou tag"
            className="min-h-12 w-full rounded-lg border-[3px] border-zinc-950 bg-[#fffdf5] px-3.5 py-2.5 text-base text-zinc-950 outline-none focus:bg-white focus:shadow-[3px_3px_0_#ffd60a]"
          />
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="text-sm font-bold text-zinc-700">{resultSummary}</p>
            {query ? (
              <button
                type="button"
                onClick={() => setSearch("")}
                className="text-sm font-bold underline decoration-[#ffd60a] decoration-[3px] underline-offset-2 hover:text-[#5b4300]"
              >
                Effacer la recherche
              </button>
            ) : null}
          </div>
        </div>
      </section>

      {filteredTeams.length > 0 ? (
        <section className="grid grid-cols-[repeat(auto-fill,minmax(300px,1fr))] items-start gap-7">
          {filteredTeams.map((team) => (
            <article key={team.name} className={`${PANEL} overflow-hidden`}>
              <div className="flex items-center justify-between gap-2.5 border-b-4 border-zinc-950 bg-[#ffd60a] px-4 py-3">
                <h2
                  className={`${bangers.className} text-[28px] font-normal uppercase leading-none tracking-[1.5px]`}
                >
                  {team.name}
                </h2>
                <span className="rounded-full bg-zinc-950 px-2.5 py-0.5 text-[13px] font-extrabold text-white">
                  {team.people.length} pers.
                </span>
              </div>
              <ul className="px-4 py-2">
                {team.people.map((person) => (
                  <li
                    key={`${team.name}-${person.name}`}
                    className="flex items-center justify-between gap-2.5 border-b-2 border-dashed border-zinc-200 py-2 last:border-b-0"
                  >
                    <span className="flex min-w-0 flex-col">
                      <span className="text-[15px] font-bold">{person.name}</span>
                      {person.note ? (
                        <span className="text-xs text-zinc-600">{person.note}</span>
                      ) : null}
                    </span>
                    <span
                      className={`shrink-0 whitespace-nowrap rounded-full border-2 border-zinc-950 px-2.5 py-0.5 text-xs font-extrabold ${getRoleClassName(person.role)}`}
                    >
                      {person.role}
                    </span>
                  </li>
                ))}
              </ul>
              {team.tags.length > 0 ? (
                <ul className="flex flex-wrap gap-1.5 px-4 pb-4 pt-1">
                  {team.tags.map((tag) => (
                    <li
                      key={`${team.name}-${tag}`}
                      className="rounded-full border-2 border-zinc-950 bg-[#fff7cc] px-2.5 py-0.5 text-[13px] font-semibold"
                    >
                      {tag}
                    </li>
                  ))}
                </ul>
              ) : null}
            </article>
          ))}
        </section>
      ) : (
        <p className="rounded-lg border-[3px] border-zinc-950 bg-white p-[18px] text-base font-bold">
          Aucun résultat trouvé.
        </p>
      )}
    </MangaPage>
  );
}
