import Image from "next/image";

export default function Home() {
  return (
    <main className="min-h-screen bg-zinc-50 px-6 py-16 text-zinc-950 sm:px-10">
      <section className="mx-auto flex min-h-[70vh] w-full max-w-3xl flex-col items-center justify-center gap-6 text-center">
        <span className="inline-flex rounded-full border border-zinc-200 bg-white px-3 py-1 text-sm text-zinc-600">
          AssistantBobbee
        </span>

        <div className="space-y-3">
          <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
            Bonjour, je suis Bobbee.
          </h1>
          <p className="text-base leading-7 text-zinc-600 sm:text-lg">
            Je t'aide a trouver les bonnes informations d'onboarding.
          </p>
        </div>

        <div className="w-full max-w-xs sm:max-w-sm">
          <Image
            src="/bobbee/bobbee-idle.png"
            alt="Bobbee"
            width={480}
            height={480}
            priority
            className="mx-auto h-auto w-full"
          />
        </div>

        <p className="max-w-xl text-sm leading-6 text-zinc-500">
          Le chat arrivera progressivement pour t'accompagner pas a pas.
        </p>
      </section>
    </main>
  );
}
