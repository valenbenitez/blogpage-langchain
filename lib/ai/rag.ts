import "server-only";

import {
  AIMessage,
  HumanMessage,
  SystemMessage,
  type BaseMessage,
} from "@langchain/core/messages";

import { getChatModel } from "@/lib/ai/chat-model";
import { retrieveSimilarChunks, type SimilarChunk } from "@/lib/ai/retrieve";

export type ChatTurn = {
  role: "user" | "assistant";
  content: string;
};

function formatContext(chunks: SimilarChunk[]): string {
  if (chunks.length === 0) {
    return "(No hay fragmentos relevantes en los artículos publicados.)";
  }

  return chunks
    .map((chunk, index) => {
      const slug = chunk.metadata.slug || "sin-slug";
      const title = chunk.metadata.title || "Sin título";
      return `[${index + 1}] ${title} (slug: ${slug})\n${chunk.content}`;
    })
    .join("\n\n");
}

function buildSystemPrompt(chunks: SimilarChunk[]): string {
  return [
    "Sos un asistente del blog. Respondé en español.",
    "Usá SOLO el contexto de artículos publicado abajo. No inventes datos.",
    "Si el contexto no alcanza para responder, decilo claramente.",
    "Cuando cites un artículo, incluí su slug entre paréntesis, por ejemplo: (mi-articulo).",
    "",
    "Contexto:",
    formatContext(chunks),
  ].join("\n");
}

function toLangChainMessages(systemPrompt: string, history: ChatTurn[]) {
  const messages: BaseMessage[] = [new SystemMessage(systemPrompt)];

  for (const turn of history) {
    if (turn.role === "user") {
      messages.push(new HumanMessage(turn.content));
    } else {
      messages.push(new AIMessage(turn.content));
    }
  }

  return messages;
}

function textFromContent(content: unknown): string {
  if (typeof content === "string") {
    return content;
  }

  if (!Array.isArray(content)) {
    return "";
  }

  return content
    .map((part) => {
      if (typeof part === "string") {
        return part;
      }

      if (
        part &&
        typeof part === "object" &&
        "type" in part &&
        part.type === "text" &&
        "text" in part &&
        typeof part.text === "string"
      ) {
        return part.text;
      }

      return "";
    })
    .join("");
}

export async function streamRagAnswer(history: ChatTurn[]): Promise<{
  chunks: SimilarChunk[];
  textStream: AsyncIterable<string>;
}> {
  const lastUser = [...history].reverse().find((turn) => turn.role === "user");

  if (!lastUser || lastUser.content.trim() === "") {
    throw new Error("A user message is required");
  }

  const chunks = await retrieveSimilarChunks(lastUser.content);
  const messages = toLangChainMessages(buildSystemPrompt(chunks), history);
  const stream = await getChatModel().stream(messages);

  async function* textStream(): AsyncIterable<string> {
    for await (const chunk of stream) {
      const text = textFromContent(chunk.content);
      if (text) {
        yield text;
      }
    }
  }

  return { chunks, textStream: textStream() };
}
