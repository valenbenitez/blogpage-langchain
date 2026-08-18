import "server-only";

import { chunkText } from "@/lib/ai/chunk";
import { embedDocuments } from "@/lib/ai/embeddings";
import { deletePostChunks, replacePostChunks } from "@/lib/db/chunks";
import type { Post } from "@/lib/posts/types";

export async function indexPost(post: Post): Promise<void> {
  const textChunks = chunkText(post.content);

  if (textChunks.length === 0) {
    await deletePostChunks(post.id);
    return;
  }

  const embeddings = await embedDocuments(
    textChunks.map((chunk) => chunk.content),
  );

  if (embeddings.length !== textChunks.length) {
    throw new Error("Embedding count does not match chunk count");
  }

  await replacePostChunks(
    post.id,
    textChunks.map((chunk, i) => ({
      chunk_index: chunk.index,
      content: chunk.content,
      embedding: embeddings[i] ?? [],
      metadata: {
        title: post.title,
        slug: post.slug,
      },
    })),
  );
}

export async function unindexPost(postId: string): Promise<void> {
  await deletePostChunks(postId);
}
