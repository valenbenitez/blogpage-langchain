import "server-only";

import { EMBEDDING_DIMENSIONS } from "@/lib/ai/constants";
import { sql } from "@/lib/db/client";

export type ReplacePostChunkInput = {
  chunk_index: number;
  content: string;
  embedding: number[];
  metadata: {
    title: string;
    slug: string;
  };
};

function toVectorLiteral(embedding: number[]): string {
  if (embedding.length !== EMBEDDING_DIMENSIONS) {
    throw new Error(
      `Embedding must have ${EMBEDDING_DIMENSIONS} dimensions, got ${embedding.length}`,
    );
  }

  return `[${embedding.join(",")}]`;
}

export async function deletePostChunks(postId: string): Promise<void> {
  await sql`
    delete from post_chunks
    where post_id = ${postId}::uuid
  `;
}

export async function replacePostChunks(
  postId: string,
  chunks: ReplacePostChunkInput[],
): Promise<void> {
  await sql.begin(async (tx) => {
    await tx`
      delete from post_chunks
      where post_id = ${postId}::uuid
    `;

    for (const chunk of chunks) {
      const embedding = toVectorLiteral(chunk.embedding);

      await tx`
        insert into post_chunks (
          post_id,
          chunk_index,
          content,
          embedding,
          metadata
        )
        values (
          ${postId}::uuid,
          ${chunk.chunk_index},
          ${chunk.content},
          ${embedding}::vector,
          ${tx.json(chunk.metadata)}
        )
      `;
    }
  });
}
