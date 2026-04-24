export default function Home() {
  return (
    <main className="min-h-screen bg-zinc-50 px-6 py-16 text-zinc-950 sm:px-10">
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-16">
        <section className="max-w-3xl space-y-6">
          <span className="inline-flex rounded-full border border-zinc-200 bg-white px-3 py-1 text-sm text-zinc-600">
            AssistantBobbee
          </span>
          <div className="space-y-4">
            <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">
              Un point d&apos;entrée simple pour l&apos;onboarding et
              l&apos;assistant interne.
            </h1>
            <p className="max-w-2xl text-base leading-7 text-zinc-600 sm:text-lg">
              Cette première version pose une base locale, claire et réversible
              pour accueillir les futurs parcours d&apos;onboarding, les
              ressources utiles et un accompagnement progressif.
            </p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row">
            <a
              href="#a-venir"
              className="inline-flex items-center justify-center rounded-md bg-zinc-900 px-5 py-3 text-sm font-medium text-white transition-colors hover:bg-zinc-800"
            >
              Voir ce qui arrive
            </a>
            <a
              href="#a-venir"
              className="inline-flex items-center justify-center rounded-md border border-zinc-300 bg-white px-5 py-3 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-100"
            >
              Préparer la suite
            </a>
          </div>
          <p className="text-sm leading-6 text-zinc-500">
            Bobby pourra prendre sa place ici plus tard, de manière simple et
            utile, sans alourdir cette base.
          </p>
        </section>

        <section
          id="a-venir"
          className="grid gap-4 sm:grid-cols-3"
          aria-label="Contenu à venir"
        >
          <article className="rounded-xl border border-zinc-200 bg-white p-6">
            <h2 className="text-lg font-semibold">Onboarding</h2>
            <p className="mt-2 text-sm leading-6 text-zinc-600">
              Les premiers repères pour comprendre l&apos;environnement, les
              étapes clés et le démarrage.
            </p>
          </article>
          <article className="rounded-xl border border-zinc-200 bg-white p-6">
            <h2 className="text-lg font-semibold">Ressources utiles</h2>
            <p className="mt-2 text-sm leading-6 text-zinc-600">
              Un espace simple pour retrouver les liens, documents et points de
              contact utiles.
            </p>
          </article>
          <article className="rounded-xl border border-zinc-200 bg-white p-6">
            <h2 className="text-lg font-semibold">Accompagnement</h2>
            <p className="mt-2 text-sm leading-6 text-zinc-600">
              Une base pour guider les utilisateurs au bon moment, sans
              complexité inutile.
            </p>
          </article>
        </section>
      </div>
    </main>
  );
}
