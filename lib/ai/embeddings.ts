import "server-only";

import { OpenAIEmbeddings } from "@langchain/openai";

export const EMBEDDING_MODEL = "openai/text-embedding-3-small";
export const EMBEDDING_DIMENSIONS = 1536;

const AI_GATEWAY_BASE_URL = "https://ai-gateway.vercel.sh/v1";

function getApiKey(): string {
  const apiKey = process.env.AI_GATEWAY_API_KEY;

  if (!apiKey) {
    throw new Error("AI_GATEWAY_API_KEY is not set");
  }

  return apiKey;
}

function getEmbeddingsClient(): OpenAIEmbeddings {
  return new OpenAIEmbeddings({
    apiKey: getApiKey(),
    model: EMBEDDING_MODEL,
    dimensions: EMBEDDING_DIMENSIONS,
    configuration: {
      baseURL: AI_GATEWAY_BASE_URL,
    },
  });
}

export async function embedQuery(text: string): Promise<number[]> {
  return getEmbeddingsClient().embedQuery(text);
}

export async function embedDocuments(texts: string[]): Promise<number[][]> {
  if (texts.length === 0) {
    return [];
  }

  return getEmbeddingsClient().embedDocuments(texts);
}
