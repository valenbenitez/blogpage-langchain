import "server-only";

import { OpenAIEmbeddings } from "@langchain/openai";

import {
  AI_GATEWAY_BASE_URL,
  EMBEDDING_DIMENSIONS,
  EMBEDDING_MODEL,
} from "@/lib/ai/constants";
import { getGatewayApiKey } from "@/lib/ai/gateway";

export { EMBEDDING_DIMENSIONS, EMBEDDING_MODEL };

function getEmbeddingsClient(): OpenAIEmbeddings {
  return new OpenAIEmbeddings({
    apiKey: getGatewayApiKey(),
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
