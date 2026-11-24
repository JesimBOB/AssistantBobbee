import Image from "next/image";
import { MangaPage, PAGE_TITLE, PANEL, SECTION_TITLE, bangers } from "../manga";

const CASE_NUMBER = `${bangers.className} absolute -top-4 left-4 inline-flex h-9 w-9 items-center justify-center rounded-full border-[3px] border-zinc-950 text-[22px]`;

export default function PresentationPage() {
  return (
    <MangaPage current="histoire">
      <section className="flex flex-col gap-3.5">
        <h1 className={PAGE_TITLE}>BOBBEE ET SON HISTOIRE</h1>
        <p className="mt-2.5 text-lg font-semibold">
          Découvrez l’histoire, l’esprit et le produit Bobbee.
        </p>
      </section>

      <section className="flex flex-wrap items-stretch gap-7">
        <div className="min-w-0 flex-[3_1_560px] overflow-hidden rounded-[10px] border-4 border-zinc-950 bg-zinc-950 shadow-[7px_7px_0_#09090b]">
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
        <div className="flex min-w-0 flex-[1_1_280px] flex-col justify-center gap-3 rounded-[10px] border-4 border-zinc-950 bg-[#fff7cc] p-6 shadow-[7px_7px_0_#09090b]">
          <p
            className={`${bangers.className} self-start rounded bg-zinc-950 px-3 py-1 text-xl tracking-[1.5px] text-[#ffd60a]`}
          >
            LA VIDÉO
          </p>
          <h2 className={`${bangers.className} text-[34px] font-normal leading-tight tracking-[1.3px]`}>
            PRÉSENTATION DU PRODUIT
          </h2>
          <p className="text-[17px] leading-normal">
            Découvrez l’ergonomie et l’esprit de Bobbee par cette courte vidéo
          </p>
        </div>
      </section>

      <section aria-labelledby="fondateurs" className="flex flex-col gap-6">
        <h2 id="fondateurs" className={SECTION_TITLE}>
          LES FONDATEURS
        </h2>
        <div className="grid gap-6 md:grid-cols-2">
          <figure className={`${PANEL} relative min-h-[300px] overflow-hidden md:row-span-2`}>
            <Image
              src="/presentation/fondateurs-2.jpg"
              alt="Les fondateurs de BOBBEE"
              fill
              sizes="(min-width: 768px) 50vw, 100vw"
              className="object-cover object-[58%_center]"
            />
          </figure>
          <div className={`${PANEL} relative p-[22px]`}>
            <span className={`${CASE_NUMBER} bg-[#ffd60a]`}>1</span>
            <p className="mt-1.5 text-lg leading-relaxed">
              Après des années de frustrations terrain, une experte-comptable et un chef
              d’entreprise ont décidé de créer l’outil qu’ils aimeraient avoir au quotidien.
            </p>
          </div>
          <div className={`${PANEL} relative p-[22px]`}>
            <span className={`${CASE_NUMBER} bg-[#ffd60a]`}>2</span>
            <p className="mt-1.5 text-lg leading-relaxed">
              BOBBEE est né pour simplifier la vie des cabinets et des entreprises, en
              répondant concrètement aux besoins terrain.
            </p>
          </div>
          <div className="relative rounded-[10px] border-4 border-zinc-950 bg-[#ffd60a] p-[22px] shadow-[6px_6px_0_#09090b] md:col-span-2">
            <span className={`${CASE_NUMBER} bg-white`}>3</span>
            <p className={`${bangers.className} mt-1.5 text-[30px] leading-tight tracking-[1.2px]`}>
              EN 2024, BOBBEE REJOINT LE GROUPE ISAGRI POUR ACCÉLÉRER CETTE AMBITION.
            </p>
          </div>
        </div>
      </section>
    </MangaPage>
  );
}
