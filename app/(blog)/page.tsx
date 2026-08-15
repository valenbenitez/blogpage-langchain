import Link from "next/link";

import { PostCard } from "@/entities/post/ui/PostCard";
import { listPosts } from "@/lib/db/posts";
import type { Post } from "@/lib/posts/types";

export default async function BlogPage() {
  const posts: Post[] = await listPosts();

  return (
    <section>
      <div className="mb-6 sm:mb-8">
        <h1 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
          Artículos
        </h1>
        <p className="mt-2 text-sm leading-6 text-muted sm:text-base">
          Lecturas sobre desarrollo, datos e inteligencia artificial.
        </p>
      </div>

      {posts.length === 0 ? (
        <p className="rounded-xl border border-border bg-surface px-4 py-8 text-center text-sm text-muted sm:px-6">
          Todavía no hay artículos. Creá el primero desde{" "}
          <Link
            href="/create"
            className="font-medium text-foreground underline-offset-2 hover:underline"
          >
            Crear artículo
          </Link>
          .
        </p>
      ) : (
        <ul className="flex flex-col gap-4">
          {posts.map((post) => (
            <li key={post.id}>
              <PostCard post={post} />
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
