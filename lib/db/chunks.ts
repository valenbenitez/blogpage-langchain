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

export type SimilarChunk = {
  id: string;
  post_id: string;
  chunk_index: number;
  content: string;
  metadata: {
    title: string;
    slug: string;
  };
  similarity: number;
};

type SimilarChunkRow = {
  id: string;
  post_id: string;
  chunk_index: number;
  content: string;
  metadata: {
    title: string;
    slug: string;
  } | null;
  similarity: number;
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

export async function searchSimilarChunks(
  embedding: number[],
  limit = 5,
): Promise<SimilarChunk[]> {
  const vector = toVectorLiteral(embedding);
  const rows = await sql<SimilarChunkRow[]>`
    select
      c.id,
      c.post_id,
      c.chunk_index,
      c.content,
      c.metadata,
      1 - (c.embedding <=> ${vector}::vector) as similarity
    from post_chunks c
    inner join posts p on p.id = c.post_id
    where p.status = 'published'
    order by c.embedding <=> ${vector}::vector
    limit ${limit}
  `;

  return rows.map((row) => ({
    id: row.id,
    post_id: row.post_id,
    chunk_index: row.chunk_index,
    content: row.content,
    metadata: row.metadata ?? { title: "", slug: "" },
    similarity: Number(row.similarity),
  }));
}

