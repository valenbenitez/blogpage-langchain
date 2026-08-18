import "server-only";

import { embedQuery } from "@/lib/ai/embeddings";
import { searchSimilarChunks, type SimilarChunk } from "@/lib/db/chunks";

export type { SimilarChunk };

const DEFAULT_RETRIEVE_LIMIT = 5;

export async function retrieveSimilarChunks(
  query: string,
  limit = DEFAULT_RETRIEVE_LIMIT,
): Promise<SimilarChunk[]> {
  const trimmed = query.trim();

  if (!trimmed) {
    return [];
  }

  const embedding = await embedQuery(trimmed);
  return searchSimilarChunks(embedding, limit);
}
