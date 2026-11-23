import Anthropic from "@anthropic-ai/sdk";
import { NextResponse } from "next/server";
import { BOBBEE_TOOLS, runBobbeeTool } from "@/app/bobbee/tools";

// POC « Bobbee en chat » : Claude répond en s'appuyant sur les recherches de tools.ts.
// Modèle modifiable sans toucher au code via BOBBEE_MODEL (ex. claude-haiku-5-5).
const MODEL = process.env.BOBBEE_MODEL || "claude-opus-5-5";
const MAX_TOOL_ROUNDS = 5;
const MAX_HISTORY_MESSAGES = 20;
const MAX_MESSAGE_LENGTH = 2000;

const NOT_CONNECTED_REPLY =
  "Je ne suis pas encore branché à mon cerveau 🐝 Il me manque la clé API Claude. Dès qu'elle sera ajoutée, je pourrai te répondre !";
const ERROR_REPLY = "Oups, j'ai eu un souci pour te répondre. Réessaie dans un instant.";
const TOO_LONG_REPLY =
  "Je me suis un peu perdu dans mes recherches. Peux-tu reformuler ta question plus simplement ?";
const REFUSAL_REPLY = "Je ne peux pas répondre à cette question. Essaie de la formuler autrement.";

const SYSTEM_PROMPT = `Tu es Bobbee, la petite abeille qui guide les collaborateurs de l'équipe produit Bobbee (nouveaux arrivants et anciens).

Ton rôle : répondre aux questions du quotidien — qui maîtrise quoi, qui a travaillé sur quel sujet, qui est dans quelle équipe, où trouver un lien ou une documentation.

Règles :
- Tutoie, sois chaleureux et dynamique, réponds en français, en quelques phrases courtes ou une petite liste.
- Utilise toujours tes outils de recherche avant de répondre sur une personne, une compétence, un sujet, une équipe ou un lien. Tu peux en appeler plusieurs et combiner les résultats.
- Réponds uniquement à partir des résultats des outils. N'invente jamais une personne, un rôle, un chiffre ou un lien.
- Si les outils ne trouvent rien, dis-le simplement et propose une reformulation ou un mot-clé plus court.
- Donne les liens tels quels, au format Markdown [texte](url).
- Pour une question sans rapport avec le travail dans l'équipe, réponds poliment que ce n'est pas ton rayon.`;

type ChatMessage = { role: "user" | "assistant"; content: string };

function isChatMessage(value: unknown): value is ChatMessage {
  return (
    typeof value === "object" &&
    value !== null &&
    "role" in value &&
    "content" in value &&
    (value.role === "user" || value.role === "assistant") &&
    typeof value.content === "string" &&
    value.content.trim().length > 0
  );
}

function reply(text: string, status = 200) {
  return NextResponse.json({ reply: text }, { status });
}

export async function POST(request: Request) {
  if (!process.env.ANTHROPIC_API_KEY) {
    return reply(NOT_CONNECTED_REPLY);
  }

  const body: unknown = await request.json().catch(() => null);
  const history =
    typeof body === "object" && body !== null && "messages" in body && Array.isArray(body.messages)
      ? body.messages.filter(isChatMessage)
      : [];

  const messages: Anthropic.Beta.BetaMessageParam[] = history
    .slice(-MAX_HISTORY_MESSAGES)
    .map((message) => ({ role: message.role, content: message.content.slice(0, MAX_MESSAGE_LENGTH) }));

  // La conversation envoyée à Claude doit commencer et finir par un message de l'utilisateur.
  while (messages.length > 0 && messages[0].role !== "user") {
    messages.shift();
  }

  if (messages.length === 0 || messages[messages.length - 1].role !== "user") {
    return reply("Pose-moi une question !", 400);
  }

  const client = new Anthropic();
  // Les refus de sécurité sont repris par un autre modèle (pas disponible sur Haiku).
  const fallbackOptions = MODEL.includes("haiku")
    ? {}
    : { betas: ["server-side-fallback-2026-07-01"], fallbacks: "default" as const };

  try {
    for (let round = 0; round <= MAX_TOOL_ROUNDS; round += 1) {
      const response = await client.beta.messages.create({
        model: MODEL,
        max_tokens: 4000,
        system: SYSTEM_PROMPT,
        tools: BOBBEE_TOOLS,
        output_config: { effort: "low" },
        messages,
        ...fallbackOptions,
      });

      if (response.stop_reason === "refusal") {
        return reply(REFUSAL_REPLY);
      }

      if (response.stop_reason === "tool_use") {
        const toolResults: Anthropic.Beta.BetaToolResultBlockParam[] = response.content
          .filter((block): block is Anthropic.Beta.BetaToolUseBlock => block.type === "tool_use")
          .map((block) => ({
            type: "tool_result",
            tool_use_id: block.id,
            content: JSON.stringify(runBobbeeTool(block.name, block.input)),
          }));

        messages.push({ role: "assistant", content: response.content });
        messages.push({ role: "user", content: toolResults });
        continue;
      }

      const text = response.content
        .filter((block): block is Anthropic.Beta.BetaTextBlock => block.type === "text")
        .map((block) => block.text)
        .join("\n")
        .trim();

      return reply(text || TOO_LONG_REPLY);
    }

    return reply(TOO_LONG_REPLY);
  } catch (error) {
    if (error instanceof Anthropic.AuthenticationError) {
      console.error("Bobbee : clé API refusée.");
    } else if (error instanceof Anthropic.RateLimitError) {
      console.error("Bobbee : limite de requêtes atteinte.");
    } else if (error instanceof Anthropic.APIError) {
      console.error(`Bobbee : erreur API ${error.status}`, error.message);
    } else {
      console.error("Bobbee : erreur inattendue", error);
    }

    return reply(ERROR_REPLY, 502);
  }
}
