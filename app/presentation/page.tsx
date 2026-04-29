import Image from "next/image";
import Link from "next/link";

export default function PresentationPage() {
  return (
    <main className="min-h-screen bg-zinc-50 px-6 py-12 text-zinc-950 sm:px-10">
      <div className="mx-auto mb-3 flex w-full max-w-4xl">
        <Link
          href="/"
          aria-label="Retour à l'accueil"
          className="inline-flex items-center gap-2 rounded-full border border-amber-200 bg-white px-3 py-1.5 text-sm font-medium text-zinc-700 shadow-sm transition-colors hover:bg-amber-50 hover:text-zinc-950"
        >
          <span aria-hidden="true">⌂</span>
          <span>Home</span>
        </Link>
      </div>
      <section className="mx-auto flex w-full max-w-4xl flex-col gap-8">
        <header className="rounded-[32px] border border-amber-200/80 bg-gradient-to-b from-amber-100/85 via-amber-50/70 to-white p-6 shadow-[0_24px_55px_-36px_rgba(24,24,27,0.45)] ring-1 ring-zinc-900/5 sm:p-8">
          <h1 className="mt-3 text-3xl font-semibold tracking-tight text-zinc-950 sm:text-4xl">
            Bobbee
          </h1>
          <p className="mt-4 max-w-2xl text-base leading-7 text-zinc-700 sm:text-lg">
            Présentation de Bobbee
          </p>
        </header>

        <div className="grid gap-4 lg:grid-cols-2">
          <section className="overflow-hidden rounded-[24px] border border-amber-100 bg-white shadow-[0_18px_36px_-30px_rgba(24,24,27,0.45)]">
            <div className="relative aspect-[4/3] bg-amber-50">
              <Image
                src="/presentation/fondateurs-2.jpg"
                alt="Les fondateurs de BOBBEE"
                fill
                sizes="(min-width: 1024px) 50vw, 100vw"
                className="object-cover"
              />
            </div>
            <div className="p-5">
              <h2 className="text-lg font-semibold tracking-tight text-zinc-950">
                Les fondateurs
              </h2>
              <p className="mt-3 text-sm leading-6 text-zinc-600">
                Après des années de frustrations terrain, une experte-comptable
                et un chef d’entreprise ont décidé de créer l’outil qu’ils
                aimeraient avoir au quotidien.
                <br />
                <br />
                BOBBEE est né pour simplifier la vie des cabinets et des
                entreprises, en répondant concrètement aux besoins terrain.
                <br />
                <br />
                En 2024, BOBBEE rejoint le groupe ISAGRI pour accélérer cette
                ambition.
              </p>
            </div>
          </section>

          <section className="overflow-hidden rounded-[24px] border border-amber-100 bg-white shadow-[0_18px_36px_-30px_rgba(24,24,27,0.45)]">
            <div className="bg-zinc-950">
              <video
                controls
                preload="metadata"
                poster="/presentation/bobby-video-poster.jpg"
                className="aspect-video w-full bg-zinc-950"
                aria-label="Vidéo de présentation BOBBEE"
              >
                <source
                  src="/presentation/Pr%C3%A9sentation%20et%20philosophie.mp4"
                  type="video/mp4"
                />
                Votre navigateur ne peut pas lire cette vidéo.
              </video>
            </div>
            <div className="p-5">
              <h2 className="text-lg font-semibold tracking-tight text-zinc-950">
                Présentation du produit
              </h2>
              <p className="mt-3 text-sm leading-6 text-zinc-600">
                Découvrez l’ergonomie et l’esprit de Bobbee par cette courte vidéo
              </p>
            </div>
          </section>
        </div>
      </section>
    </main>
  );
}
