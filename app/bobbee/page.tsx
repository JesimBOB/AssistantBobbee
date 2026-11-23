"use client";

import Image from "next/image";
import { Bangers, Nunito } from "next/font/google";
import {
  type FormEvent,
  type ReactNode,
  useEffect,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";
import arrivee from "./demo-data/arrivee.json";
import demoUsefulLinks from "./demo-data/useful-links.json";

// POC « Bobbee en chat » : page séparée, accessible en tapant /bobbee.
// Direction visuelle « Manga » : encre noire, trame de points, bulles de BD.
const bangers = Bangers({ weight: "400", subsets: ["latin"] });
const nunito = Nunito({ weight: ["500", "700", "800"], subsets: ["latin"] });

type ChatMessage = { role: "user" | "assistant"; content: string };
type BobbeeState = "idle" | "thinking" | "found";

const BOBBEE_IMAGE_BY_STATE: Record<BobbeeState, string> = {
  idle: "/bobbee/bobbee-idle.png",
  thinking: "/bobbee/bobbee-thinking.png",
  found: "/bobbee/bobbee-found.png",
};
const BOBBEE_SHOUT_BY_STATE: Record<BobbeeState, string> = {
  idle: "POSE-MOI TA QUESTION !",
  thinking: "HMMM… JE BUTINE !",
  found: "TROUVÉ !",
};
const WELCOME_MESSAGE: ChatMessage = {
  role: "assistant",
  content:
    "Salut ! Moi c'est Bobbee. Demande-moi qui maîtrise un sujet, qui a bossé sur quoi, qui est dans quelle équipe ou où trouver un lien utile.",
};
// Projet Claude partagé : recherche dans Confluence, Teams et Outlook (même lien que l'accueil).
const CLAUDE_ASSISTANT_URL = "https://claude.ai/project/01a1d5a2-f43a-733c-838f-6ad6eede2d06";
const ERROR_REPLY ="Oups, je n'arrive pas à joindre le serveur. Réessaie dans un instant.";
const MIC_ERROR_HINT = "Je n'arrive pas à t'entendre : vérifie que le micro est autorisé pour ce site.";

// Dictée vocale du navigateur (Chrome, Edge) : la voix est transformée en texte par le navigateur.
type SpeechRecognitionResultLike = { isFinal: boolean; 0: { transcript: string } };
type SpeechRecognitionLike = {
  lang: string;
  interimResults: boolean;
  continuous: boolean;
  start(): void;
  stop(): void;
  onresult: ((event: { results: ArrayLike<SpeechRecognitionResultLike> }) => void) | null;
  onerror: ((event: { error: string }) => void) | null;
  onend: (() => void) | null;
};
type SpeechRecognitionConstructor = new () => SpeechRecognitionLike;

function getSpeechRecognition(): SpeechRecognitionConstructor | null {
  if (typeof window === "undefined") {
    return null;
  }
  const speechWindow = window as unknown as {
    SpeechRecognition?: SpeechRecognitionConstructor;
    webkitSpeechRecognition?: SpeechRecognitionConstructor;
  };
  return speechWindow.SpeechRecognition ?? speechWindow.webkitSpeechRecognition ?? null;
}

function subscribeToNothing() {
  return () => {};
}

function hasSpeechSynthesis() {
  return typeof window !== "undefined" && "speechSynthesis" in window;
}

// Bobbee lit ses réponses avec la synthèse vocale du navigateur (liens lus par leur nom).
function speak(text: string) {
  if (!hasSpeechSynthesis()) {
    return;
  }
  const spokenText = text
    .replace(/\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/g, "$1")
    .replace(/\*\*/g, "")
    .replace(/https?:\/\/\S+/g, "");
  const utterance = new SpeechSynthesisUtterance(spokenText);
  utterance.lang = "fr-FR";
  // Voix française la plus naturelle disponible : « Google français » dans Chrome, sinon une voix « Natural ».
  const frenchVoices = window.speechSynthesis
    .getVoices()
    .filter((voice) => voice.lang.toLowerCase().startsWith("fr"));
  const frenchVoice =
    frenchVoices.find((voice) => voice.name.includes("Google")) ??
    frenchVoices.find((voice) => voice.name.includes("Natural")) ??
    frenchVoices[0];
  if (frenchVoice) {
    utterance.voice = frenchVoice;
  }
  window.speechSynthesis.cancel();
  window.speechSynthesis.speak(utterance);
}

function stopSpeaking() {
  if (hasSpeechSynthesis()) {
    window.speechSynthesis.cancel();
  }
}

// Parcours de première visite pour les nouveaux arrivants.
type Metier = "Dev" | "QA" | "PO" | "SL";
type ArrivalChoice = { nouveau: boolean; metier: Metier | null };

const METIERS: { code: Metier; label: string }[] = [
  { code: "Dev", label: "Développeur·se" },
  { code: "QA", label: "QA / testeur·se" },
  { code: "PO", label: "Product Owner" },
  { code: "SL", label: "Squad Lead" },
];
const CHECKLIST_STATUS: Record<string, { icon: string; label: string }> = {
  ok: { icon: "✅", label: "Fait" },
  en_cours: { icon: "⏳", label: "En cours" },
  a_faire: { icon: "⬜", label: "À faire" },
};
const NEWCOMER_QUESTIONS = [
  "Où en sont mes accès et licences ?",
  "Où trouver mon guide d'onboarding ?",
  "Qui est dans le pôle lavande ?",
  "Comment installer le VPN ?",
];
const TOUR_STEP_COUNT = 4;
const CHECKLIST_DONE_COUNT = arrivee.checklist.filter((item) => item.statut === "ok").length;
const CHECKLIST_UPDATED_ON = arrivee.miseAJour.split("-").reverse().join("/");

// Le navigateur retient que le parcours a été vu (en mémoire si le stockage est bloqué).
const ARRIVAL_STORAGE_KEY = "bobbee-arrivee";
const ARRIVAL_NOT_LOADED = "non-charge";
let arrivalMemory: string | null = null;
const arrivalListeners = new Set<() => void>();

function readArrival() {
  try {
    return window.localStorage.getItem(ARRIVAL_STORAGE_KEY) ?? arrivalMemory;
  } catch {
    return arrivalMemory;
  }
}

function writeArrival(value: string | null) {
  arrivalMemory = value;
  try {
    if (value === null) {
      window.localStorage.removeItem(ARRIVAL_STORAGE_KEY);
    } else {
      window.localStorage.setItem(ARRIVAL_STORAGE_KEY, value);
    }
  } catch {
    // Stockage bloqué : la mémoire suffit pour la visite en cours.
  }
  arrivalListeners.forEach((listener) => listener());
}

function subscribeToArrival(listener: () => void) {
  arrivalListeners.add(listener);
  return () => {
    arrivalListeners.delete(listener);
  };
}

function parseArrival(raw: string | null): ArrivalChoice | null {
  if (raw === null || raw === ARRIVAL_NOT_LOADED) {
    return null;
  }
  try {
    const value: unknown = JSON.parse(raw);
    if (typeof value === "object" && value !== null && "nouveau" in value && typeof value.nouveau === "boolean") {
      const metier = "metier" in value ? METIERS.find((item) => item.code === value.metier)?.code : undefined;
      return { nouveau: value.nouveau, metier: metier ?? null };
    }
  } catch {
    // Valeur illisible : on refait le parcours.
  }
  return null;
}

function renderChecklist() {
  return (
    <ul className="flex flex-col gap-1.5">
      {arrivee.checklist.map((item) => {
        const status = CHECKLIST_STATUS[item.statut] ?? CHECKLIST_STATUS.a_faire;
        return (
          <li key={item.etape} className="flex gap-2 text-sm leading-5">
            <span aria-label={status.label} role="img">
              {status.icon}
            </span>
            <span>
              <span className="font-bold">{item.etape}</span>
              {"detail" in item && item.detail ? <span className="block text-zinc-600">{item.detail}</span> : null}
            </span>
          </li>
        );
      })}
    </ul>
  );
}

const TOUR_PRIMARY_BUTTON = `${bangers.className} min-h-11 rounded-full border-[3px] border-zinc-950 bg-[#ffd60a] px-5 text-xl tracking-wider shadow-[4px_4px_0_#09090b] transition-transform hover:-translate-y-0.5`;
const TOUR_SECONDARY_BUTTON =
  "min-h-11 rounded-full border-[3px] border-zinc-950 bg-white px-3.5 py-1.5 text-sm font-extrabold shadow-[3px_3px_0_#09090b] transition-transform hover:-translate-y-0.5 hover:bg-[#fff7cc]";

// Trame de points façon manga, en fond de page.
const HALFTONE_BACKGROUND =
  "bg-[#fffdf5] bg-[radial-gradient(#e9e2c8_1.2px,transparent_1.2px)] bg-[length:14px_14px]";
// Rayons qui partent derrière Bobbee.
const SPEED_LINES_BACKGROUND =
  "bg-[repeating-conic-gradient(from_0deg_at_50%_60%,#fff_0deg_6deg,#f3f0e4_6deg_12deg)]";

// Affiche les liens [texte](url) et le **gras** des réponses de Bobbee.
function renderReply(text: string) {
  const parts: ReactNode[] = [];
  const pattern = /\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)|\*\*([^*]+)\*\*/g;
  let lastIndex = 0;

  for (const match of text.matchAll(pattern)) {
    parts.push(text.slice(lastIndex, match.index));
    if (match[2]) {
      parts.push(
        <a
          key={match.index}
          href={match[2]}
          target="_blank"
          rel="noreferrer"
          className="font-extrabold text-zinc-950 underline decoration-[#ffd60a] decoration-[3px] underline-offset-2 hover:text-[#5b4300]"
        >
          {match[1]}
        </a>,
      );
    } else {
      parts.push(<strong key={match.index}>{match[3]}</strong>);
    }
    lastIndex = match.index + match[0].length;
  }

  parts.push(text.slice(lastIndex));
  return parts;
}

export default function BobbeeChatPage() {
  const [messages, setMessages] = useState<ChatMessage[]>([WELCOME_MESSAGE]);
  const [input, setInput] = useState("");
  const [bobbeeState, setBobbeeState] = useState<BobbeeState>("idle");
  const [isListening, setIsListening] = useState(false);
  const [micError, setMicError] = useState(false);
  const recognitionRef = useRef<SpeechRecognitionLike | null>(null);
  const speechSupported = useSyncExternalStore(
    subscribeToNothing,
    () => getSpeechRecognition() !== null,
    () => false,
  );
  const [voiceOn, setVoiceOn] = useState(false);
  const voiceOnRef = useRef(false);
  const voiceSupported = useSyncExternalStore(subscribeToNothing, hasSpeechSynthesis, () => false);
  const endOfMessagesRef = useRef<HTMLDivElement>(null);
  const isThinking = bobbeeState === "thinking";
  const bobbeeShout = isListening ? "JE T'ÉCOUTE !" : BOBBEE_SHOUT_BY_STATE[bobbeeState];
  const arrivalRaw = useSyncExternalStore(subscribeToArrival, readArrival, () => ARRIVAL_NOT_LOADED);
  const arrivalChoice = parseArrival(arrivalRaw);
  const showTour = arrivalRaw !== ARRIVAL_NOT_LOADED && arrivalChoice === null;
  const [tourStep, setTourStep] = useState(0);
  const [tourMetier, setTourMetier] = useState<Metier | null>(null);
  const tourGuides = demoUsefulLinks.filter(
    (link) => link.Rubrique === "Onboarding & organisation" && link.Qui === tourMetier && link.Lien,
  );

  useEffect(() => {
    endOfMessagesRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, bobbeeState]);

  // Charge la liste des voix dès l'ouverture (Chrome la remplit en différé),
  // et Bobbee se tait quand on quitte la page.
  useEffect(() => {
    if (hasSpeechSynthesis()) {
      window.speechSynthesis.getVoices();
    }
    return stopSpeaking;
  }, []);

  async function ask(question: string) {
    const trimmedQuestion = question.trim();

    if (!trimmedQuestion || isThinking) {
      return;
    }

    const nextMessages: ChatMessage[] = [...messages, { role: "user", content: trimmedQuestion }];
    setMessages(nextMessages);
    setInput("");
    setBobbeeState("thinking");

    let replyText = ERROR_REPLY;
    try {
      const response = await fetch("/api/bobbee", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        // Le message d'accueil n'est pas envoyé : il ne vient pas de Claude.
        body: JSON.stringify({ messages: nextMessages.slice(1) }),
      });
      const data: unknown = await response.json();
      if (typeof data === "object" && data !== null && "reply" in data && typeof data.reply === "string") {
        replyText = data.reply;
      }
    } catch {
      // replyText garde le message d'erreur.
    }

    setMessages([...nextMessages, { role: "assistant", content: replyText }]);
    setBobbeeState("found");
    if (voiceOnRef.current) {
      speak(replyText);
    }
    window.setTimeout(() => setBobbeeState((state) => (state === "found" ? "idle" : state)), 1500);
  }

  function toggleVoice() {
    const nextVoiceOn = !voiceOn;
    setVoiceOn(nextVoiceOn);
    voiceOnRef.current = nextVoiceOn;

    if (nextVoiceOn) {
      const lastReply = [...messages].reverse().find((message) => message.role === "assistant");
      if (lastReply) {
        speak(lastReply.content);
      }
    } else {
      stopSpeaking();
    }
  }

  function toggleListening() {
    if (isListening) {
      recognitionRef.current?.stop();
      return;
    }

    // Bobbee se tait pour ne pas s'entendre lui-même.
    stopSpeaking();

    const SpeechRecognition = getSpeechRecognition();
    if (!SpeechRecognition || isThinking) {
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = "fr-FR";
    recognition.interimResults = true;
    recognition.continuous = false;
    let finalTranscript = "";

    recognition.onresult = (event) => {
      const transcript = Array.from(event.results)
        .map((result) => result[0].transcript)
        .join("");
      setInput(transcript);
      if (event.results[event.results.length - 1]?.isFinal) {
        finalTranscript = transcript;
      }
    };
    recognition.onerror = (event) => {
      if (event.error === "not-allowed" || event.error === "service-not-allowed") {
        setMicError(true);
      }
    };
    // Dès que tu t'arrêtes de parler, la question part toute seule.
    recognition.onend = () => {
      setIsListening(false);
      recognitionRef.current = null;
      if (finalTranscript.trim()) {
        void ask(finalTranscript);
      }
    };

    recognitionRef.current = recognition;
    setMicError(false);
    setIsListening(true);
    recognition.start();
  }

  function finishTour(nouveau: boolean, question?: string) {
    writeArrival(JSON.stringify({ nouveau, metier: nouveau ? tourMetier : null }));
    if (question) {
      void ask(question);
    }
  }

  function restartTour() {
    setTourStep(0);
    setTourMetier(null);
    writeArrival(null);
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    void ask(input);
  }

  return (
    <main
      className={`${nunito.className} ${HALFTONE_BACKGROUND} flex min-h-screen flex-col gap-5 px-4 py-5 text-zinc-950 sm:p-8 lg:flex-row lg:items-stretch lg:gap-7`}
    >
      <aside className="flex flex-col gap-4 lg:w-[360px] lg:shrink-0">
        <div className="flex items-center justify-between gap-3 lg:flex-col lg:items-stretch">
          <div className="-rotate-[1.5deg] rounded-md border-4 border-zinc-950 bg-[#ffd60a] px-4 py-2 shadow-[6px_6px_0_#09090b] lg:px-5 lg:py-4 lg:shadow-[8px_8px_0_#09090b]">
            <h1 className={`${bangers.className} text-4xl leading-[0.9] tracking-wider lg:text-6xl`}>
              BOBBEE!
            </h1>
            <p className="mt-1 hidden text-base font-extrabold lg:block">Ton assistant du quotidien</p>
          </div>
          <p className="self-center rounded border-2 border-zinc-950 bg-white px-2.5 py-1 text-xs font-extrabold lg:self-start lg:text-[13px]">
            POC — données réelles
          </p>
        </div>

        <div className="relative flex h-44 items-end justify-center overflow-hidden rounded-md border-4 border-zinc-950 bg-white shadow-[6px_6px_0_#09090b] lg:h-auto lg:min-h-[360px] lg:flex-1 lg:shadow-[8px_8px_0_#09090b]">
          <div aria-hidden="true" className={`absolute inset-0 ${SPEED_LINES_BACKGROUND}`} />
          <p
            className={`${bangers.className} absolute left-3 top-3 z-10 rounded-full border-[3px] border-zinc-950 bg-white px-3 py-1 text-base tracking-wide lg:left-4 lg:top-4 lg:text-[22px]`}
            aria-live="polite"
          >
            {bobbeeShout}
          </p>
          <Image
            src={BOBBEE_IMAGE_BY_STATE[bobbeeState]}
            alt="Bobbee"
            width={300}
            height={300}
            className="relative h-40 w-40 object-contain lg:h-[300px] lg:w-[300px]"
            priority
            unoptimized
          />
          {voiceSupported ? (
            <button
              type="button"
              onClick={toggleVoice}
              aria-label={voiceOn ? "Couper la voix de Bobbee" : "Activer la voix de Bobbee"}
              aria-pressed={voiceOn}
              title={voiceOn ? "Couper la voix de Bobbee" : "Bobbee lit ses réponses à voix haute"}
              className={`absolute bottom-3 right-3 z-10 flex h-12 w-12 items-center justify-center rounded-full border-[3px] border-zinc-950 shadow-[3px_3px_0_#09090b] transition-transform hover:-translate-y-0.5 ${
                voiceOn ? "bg-[#ffd60a]" : "bg-white"
              }`}
            >
              <svg
                aria-hidden="true"
                width="22"
                height="22"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#09090b"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M4 9v6h4l5 4V5L8 9H4z" />
                {voiceOn ? (
                  <path d="M16.5 8.5a5 5 0 0 1 0 7M19 6a8.5 8.5 0 0 1 0 12" />
                ) : (
                  <path d="M17 9l5 6M22 9l-5 6" />
                )}
              </svg>
            </button>
          ) : null}
        </div>

        {arrivalChoice?.nouveau ? (
          <details className="rounded-md border-4 border-zinc-950 bg-white px-4 py-3 shadow-[6px_6px_0_#09090b] lg:shadow-[8px_8px_0_#09090b]">
            <summary className={`${bangers.className} cursor-pointer text-xl tracking-wide`}>
              TON ARRIVÉE : {CHECKLIST_DONE_COUNT}/{arrivee.checklist.length} OK
            </summary>
            <div className="mt-3 flex flex-col gap-3">
              {renderChecklist()}
              <p className="text-xs font-bold text-zinc-600">
                Checklist tenue par {arrivee.manager}, mise à jour le {CHECKLIST_UPDATED_ON}.
              </p>
            </div>
          </details>
        ) : null}
        {arrivalChoice ? (
          <button
            type="button"
            onClick={restartTour}
            className="self-start text-sm font-extrabold underline decoration-[#ffd60a] decoration-[3px] underline-offset-2 hover:text-[#5b4300]"
          >
            Revoir le parcours d&apos;arrivée
          </button>
        ) : null}
      </aside>

      <section className="flex min-h-[60vh] min-w-0 flex-1 flex-col gap-4 rounded-md border-4 border-zinc-950 bg-white p-4 shadow-[6px_6px_0_#09090b] sm:p-6 lg:shadow-[8px_8px_0_#09090b]">
        {showTour ? (
          <div className="flex flex-1 flex-col gap-4 rounded-[18px] border-[3px] border-zinc-950 bg-[#fff7cc] p-4 sm:p-6">
            {tourStep > 0 ? (
              <p className="text-xs font-extrabold tracking-wide text-zinc-600">
                ÉTAPE {tourStep}/{TOUR_STEP_COUNT}
              </p>
            ) : null}

            {tourStep === 0 ? (
              <>
                <h2 className={`${bangers.className} text-3xl tracking-wider`}>BIENVENUE !</h2>
                <p className="text-base leading-relaxed">
                  Tu viens d&apos;arriver dans l&apos;équipe ? Je te fais faire le tour en une minute : tes guides,
                  l&apos;état de ton arrivée et ce que tu peux me demander.
                </p>
                <div className="flex flex-wrap gap-2">
                  <button type="button" onClick={() => setTourStep(1)} className={TOUR_PRIMARY_BUTTON}>
                    Oui, je suis nouveau
                  </button>
                  <button type="button" onClick={() => finishTour(false)} className={TOUR_SECONDARY_BUTTON}>
                    Non, je connais déjà
                  </button>
                </div>
              </>
            ) : null}

            {tourStep === 1 ? (
              <>
                <h2 className={`${bangers.className} text-3xl tracking-wider`}>TON MÉTIER</h2>
                <p className="text-base leading-relaxed">Dis-moi ce que tu fais, je te montre les bons guides.</p>
                <div className="flex flex-wrap gap-2">
                  {METIERS.map((metier) => (
                    <button
                      key={metier.code}
                      type="button"
                      onClick={() => {
                        setTourMetier(metier.code);
                        setTourStep(2);
                      }}
                      className={TOUR_SECONDARY_BUTTON}
                    >
                      {metier.label}
                    </button>
                  ))}
                </div>
              </>
            ) : null}

            {tourStep === 2 ? (
              <>
                <h2 className={`${bangers.className} text-3xl tracking-wider`}>TES GUIDES</h2>
                {tourGuides.length > 0 ? (
                  <>
                    <p className="text-base leading-relaxed">Commence par lire les guides d&apos;onboarding de ton métier :</p>
                    <ul className="flex flex-col gap-2">
                      {tourGuides.map((guide) => (
                        <li key={guide.Quoi}>
                          <a
                            href={guide.Lien ?? undefined}
                            target="_blank"
                            rel="noreferrer"
                            className="font-extrabold underline decoration-[#ffd60a] decoration-[3px] underline-offset-2 hover:text-[#5b4300]"
                          >
                            {guide.Quoi}
                          </a>
                        </li>
                      ))}
                    </ul>
                  </>
                ) : (
                  <p className="text-base leading-relaxed">
                    Je n&apos;ai pas de guide dédié à ton métier. Demande-moi « guide d&apos;onboarding » pour voir
                    tous ceux qui existent.
                  </p>
                )}
                <button type="button" onClick={() => setTourStep(3)} className={`${TOUR_PRIMARY_BUTTON} self-start`}>
                  Suivant
                </button>
              </>
            ) : null}

            {tourStep === 3 ? (
              <>
                <h2 className={`${bangers.className} text-3xl tracking-wider`}>TON ARRIVÉE</h2>
                <p className="text-base leading-relaxed">
                  Voici où en est ta checklist d&apos;arrivée, tenue par ton manager {arrivee.manager} (
                  {CHECKLIST_DONE_COUNT}/{arrivee.checklist.length} étapes faites) :
                </p>
                {renderChecklist()}
                <p className="text-sm font-bold text-zinc-600">Tu la retrouves à tout moment dans « Ton arrivée ».</p>
                <button type="button" onClick={() => setTourStep(4)} className={`${TOUR_PRIMARY_BUTTON} self-start`}>
                  Suivant
                </button>
              </>
            ) : null}

            {tourStep === 4 ? (
              <>
                <h2 className={`${bangers.className} text-3xl tracking-wider`}>À TOI DE JOUER !</h2>
                <p className="text-base leading-relaxed">Pose-moi tes questions quand tu veux. Par exemple :</p>
                <div className="flex flex-wrap gap-2">
                  {NEWCOMER_QUESTIONS.map((question) => (
                    <button
                      key={question}
                      type="button"
                      onClick={() => finishTour(true, question)}
                      className={TOUR_SECONDARY_BUTTON}
                    >
                      {question}
                    </button>
                  ))}
                </div>
                <button type="button" onClick={() => finishTour(true)} className={`${TOUR_PRIMARY_BUTTON} self-start`}>
                  C&apos;est parti !
                </button>
              </>
            ) : null}

            {tourStep > 0 && tourStep < TOUR_STEP_COUNT ? (
              <button
                type="button"
                onClick={() => finishTour(true)}
                className="mt-auto self-end text-sm font-extrabold underline underline-offset-2"
              >
                Passer le parcours
              </button>
            ) : null}
          </div>
        ) : null}

        <div className={`flex flex-1 flex-col gap-5 overflow-y-auto ${showTour ? "hidden" : ""}`}>
          {messages.map((message, index) =>
            message.role === "user" ? (
              <p
                key={index}
                className="relative mr-4 max-w-[80%] self-end whitespace-pre-line rounded-[18px] border-[3px] border-zinc-950 bg-zinc-950 px-4 py-3 text-[15px] font-bold leading-6 break-words text-white sm:text-base"
              >
                {message.content}
                <span
                  aria-hidden="true"
                  className="absolute -right-[18px] top-4 border-y-[10px] border-l-[18px] border-y-transparent border-l-zinc-950"
                />
              </p>
            ) : (
              <p
                key={index}
                className="relative ml-4 max-w-[88%] self-start whitespace-pre-line rounded-[18px] border-[3px] border-zinc-950 bg-white px-4 py-3 text-[15px] leading-relaxed break-words sm:px-5 sm:text-base"
              >
                {renderReply(message.content)}
                <span
                  aria-hidden="true"
                  className="absolute -left-[18px] top-5 border-y-[10px] border-r-[18px] border-y-transparent border-r-zinc-950"
                />
                <span
                  aria-hidden="true"
                  className="absolute -left-[12px] top-[23px] border-y-[7px] border-r-[13px] border-y-transparent border-r-white"
                />
              </p>
            ),
          )}
          {isThinking ? (
            <p
              className={`${bangers.className} ml-4 self-start rounded-[18px] border-[3px] border-dashed border-zinc-950 bg-[#fff7cc] px-5 py-3 text-xl tracking-wider`}
            >
              BZZZ… JE CHERCHE
            </p>
          ) : null}
          <div ref={endOfMessagesRef} />
        </div>


        <form onSubmit={handleSubmit} className={`flex items-center gap-2 sm:gap-3 ${showTour ? "hidden" : ""}`}>
          <label htmlFor="bobbee-question" className="sr-only">
            Ta question
          </label>
          <input
            id="bobbee-question"
            value={input}
            onChange={(event) => setInput(event.target.value)}
            placeholder={isListening ? "Parle, je t'écoute…" : "Pose ta question à Bobbee…"}
            className="h-[52px] min-w-0 flex-1 rounded-full border-[3px] border-zinc-950 bg-white px-5 text-base outline-none focus:ring-4 focus:ring-[#ffd60a]"
          />
          {speechSupported ? (
            <button
              type="button"
              onClick={toggleListening}
              disabled={isThinking}
              aria-label={isListening ? "Arrêter l'écoute" : "Parler à Bobbee"}
              aria-pressed={isListening}
              className={`flex h-[52px] w-[52px] shrink-0 items-center justify-center rounded-full border-[3px] border-zinc-950 shadow-[4px_4px_0_#09090b] transition-transform hover:-translate-y-0.5 disabled:translate-y-0 disabled:opacity-50 ${
                isListening ? "animate-pulse bg-[#ff6b6b]" : "bg-white"
              }`}
            >
              <svg
                aria-hidden="true"
                width="22"
                height="22"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#09090b"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <rect x="9" y="3" width="6" height="11" rx="3" />
                <path d="M5 11a7 7 0 0 0 14 0M12 18v3" />
              </svg>
            </button>
          ) : null}
          <button
            type="submit"
            disabled={isThinking || !input.trim()}
            className={`${bangers.className} h-[52px] rounded-full border-[3px] border-zinc-950 bg-[#ffd60a] px-5 text-2xl tracking-wider shadow-[4px_4px_0_#09090b] transition-transform hover:-translate-y-0.5 disabled:translate-y-0 disabled:opacity-50 sm:px-6`}
          >
            ENVOYER !
          </button>
        </form>
        {micError ? <p className="text-sm font-bold text-[#9a1b1b]">{MIC_ERROR_HINT}</p> : null}
        <p className={`flex flex-wrap items-center gap-2 text-sm font-bold ${showTour ? "hidden" : ""}`}>
          Tu cherches un document Mails, Teams, Confluence ?
          <a
            href={CLAUDE_ASSISTANT_URL}
            target="_blank"
            rel="noreferrer"
            className="inline-flex min-h-9 items-center rounded-full border-[3px] border-zinc-950 bg-white px-3.5 py-1 font-extrabold text-zinc-950 no-underline shadow-[3px_3px_0_#09090b] transition-transform hover:-translate-y-0.5 hover:bg-[#fff7cc]"
          >
            Demander à l&apos;assistant documentation Claude
          </a>
        </p>
      </section>
    </main>
  );
}
