import Image from "next/image";

export default function OrganigrammePage() {
  return (
    <main className="min-h-screen bg-zinc-50 px-6 py-12 text-zinc-950 sm:px-10">
      <section className="mx-auto flex w-full max-w-6xl flex-col items-center gap-6">
        <h1 className="text-3xl font-semibold tracking-tight">Organigramme</h1>

        <div className="w-full overflow-hidden rounded-2xl border border-zinc-200 bg-white p-3 shadow-sm sm:p-4">
          <Image
            src="/organigramme/organigramme-ruche-concept.png"
            alt="Organigramme de la Ruche Concept"
            width={1448}
            height={1086}
            priority
            className="h-auto w-full"
          />
        </div>
      </section>
    </main>
  );
}
