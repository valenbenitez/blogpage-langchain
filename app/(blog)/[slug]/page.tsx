import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { cache } from "react";
import ReactMarkdown from "react-markdown";

import { getPostBySlug } from "@/lib/db/posts";
import type { PostStatus } from "@/lib/posts/types";

export const dynamic = "force-dynamic";

type BlogDetailPageProps = {
  params: Promise<{ slug: string }>;
};

const getPost = cache(getPostBySlug);

function statusLabel(status: PostStatus): string {
  return status === "published" ? "Publicado" : "Borrador";
}

function formatPostDate(isoDate: string): string {
  const date = new Date(isoDate);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  return new Intl.DateTimeFormat("es-AR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(date);
}

export async function generateMetadata({
  params,
}: BlogDetailPageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPost(slug);

  if (!post) {
    return {
      title: "Artículo no encontrado",
      description: "El artículo solicitado no está disponible.",
    };
  }

  return {
    title: post.title,
    description: post.summary ?? "Artículo de Blogpage RAG.",
  };
}

export default async function BlogDetailPage({
  params,
}: BlogDetailPageProps) {
  const { slug } = await params;
  const post = await getPost(slug);

  if (!post) {
    notFound();
  }

  const dateLabel = formatPostDate(post.created_at);
  const isPublished = post.status === "published";

  return (
    <article className="mx-auto max-w-3xl">
      <header className="mt-8 border-b border-border pb-8 sm:mt-10 sm:pb-10">
        <div className="flex flex-wrap items-center gap-2 text-sm">
          <span
            className={
              isPublished
                ? "rounded-md bg-subtle px-2.5 py-1 font-medium text-foreground"
                : "rounded-md border border-border px-2.5 py-1 font-medium text-muted"
            }
          >
            {statusLabel(post.status)}
          </span>
          {dateLabel ? (
            <time dateTime={post.created_at} className="text-muted">
              {dateLabel}
            </time>
          ) : null}
          <Link
            className="ml-auto rounded-md px-2 py-1 text-xs font-medium text-muted transition hover:bg-subtle hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-foreground"
            href={`/${post.slug}/edit`}
          >
            Editar
          </Link>
        </div>

        <h1 className="mt-5 text-3xl font-bold tracking-tight text-foreground sm:text-5xl sm:leading-tight">
          {post.title}
        </h1>

        {post.summary ? (
          <p className="mt-5 text-lg leading-8 text-muted">{post.summary}</p>
        ) : null}

        {post.tags.length > 0 ? (
          <ul className="mt-5 flex flex-wrap gap-2" aria-label="Etiquetas">
            {post.tags.map((tag) => (
              <li
                key={tag}
                className="rounded-md bg-subtle px-2.5 py-1 text-xs font-medium text-muted"
              >
                {tag}
              </li>
            ))}
          </ul>
        ) : null}
      </header>

      <div className="mt-8 text-base leading-8 text-foreground sm:mt-10 sm:text-lg [&_a]:font-medium [&_a]:underline [&_a]:underline-offset-4 [&_blockquote]:my-6 [&_blockquote]:border-l-4 [&_blockquote]:border-border [&_blockquote]:pl-4 [&_blockquote]:text-muted [&_code]:rounded [&_code]:bg-subtle [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:font-mono [&_code]:text-sm [&_h2]:mb-4 [&_h2]:mt-10 [&_h2]:text-2xl [&_h2]:font-bold [&_h2]:tracking-tight [&_h3]:mb-3 [&_h3]:mt-8 [&_h3]:text-xl [&_h3]:font-semibold [&_hr]:my-10 [&_hr]:border-border [&_li]:my-1 [&_ol]:my-5 [&_ol]:list-decimal [&_ol]:pl-6 [&_p]:my-5 [&_pre]:my-6 [&_pre]:overflow-x-auto [&_pre]:rounded-lg [&_pre]:bg-subtle [&_pre]:p-4 [&_pre_code]:bg-transparent [&_pre_code]:p-0 [&_ul]:my-5 [&_ul]:list-disc [&_ul]:pl-6">
        <ReactMarkdown>{post.content}</ReactMarkdown>
      </div>
    </article>
  );
}