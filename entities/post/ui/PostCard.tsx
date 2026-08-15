import Link from "next/link";

import type { Post, PostStatus } from "@/lib/posts/types";

type PostCardProps = {
  post: Post;
};

function statusLabel(status: PostStatus): string {
  return status === "published" ? "Publicado" : "Borrador";
}

function formatPostDate(isoDate: string): string {
  const date = new Date(isoDate);
  if (Number.isNaN(date.getTime())) {
    return "";
  }

  const now = Date.now();
  const diffMs = now - date.getTime();
  const diffSeconds = Math.round(diffMs / 1000);
  const absSeconds = Math.abs(diffSeconds);

  const rtf = new Intl.RelativeTimeFormat("es", { numeric: "auto" });

  if (absSeconds < 60) {
    return rtf.format(-diffSeconds, "second");
  }

  const diffMinutes = Math.round(diffSeconds / 60);
  if (Math.abs(diffMinutes) < 60) {
    return rtf.format(-diffMinutes, "minute");
  }

  const diffHours = Math.round(diffMinutes / 60);
  if (Math.abs(diffHours) < 24) {
    return rtf.format(-diffHours, "hour");
  }

  const diffDays = Math.round(diffHours / 24);
  if (Math.abs(diffDays) < 30) {
    return rtf.format(-diffDays, "day");
  }

  return new Intl.DateTimeFormat("es-AR", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(date);
}

export function PostCard({ post }: PostCardProps) {
  const href = `/${post.slug}`;
  const dateLabel = formatPostDate(post.created_at);
  const isPublished = post.status === "published";

  return (
    <article className="rounded-xl border border-border bg-surface p-4 shadow-sm transition-colors hover:border-foreground/20 sm:p-5">
      <Link
        href={href}
        className="rounded-sm outline-none transition-colors hover:text-foreground/80 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-foreground"
      >
        <div className="flex flex-wrap items-center gap-2 text-xs sm:text-sm">
          <span
            className={
              isPublished
                ? "rounded-md bg-subtle px-2 py-0.5 font-medium text-foreground"
                : "rounded-md border border-border px-2 py-0.5 font-medium text-muted"
            }
          >
            {statusLabel(post.status)}
          </span>
          {dateLabel ? (
            <time dateTime={post.created_at} className="text-muted">
              {dateLabel}
            </time>
          ) : null}
        </div>

        <h2 className="mt-3 text-lg font-semibold tracking-tight text-foreground sm:text-xl">

          {post.title}

        </h2>

        {post.summary ? (
          <p className="mt-2 text-sm leading-6 text-muted sm:text-base">
            {post.summary}
          </p>
        ) : null}

        {post.tags.length > 0 ? (
          <ul className="mt-3 flex flex-wrap gap-2" aria-label="Etiquetas">
            {post.tags.map((tag) => (
              <li
                key={tag}
                className="rounded-md bg-subtle px-2 py-0.5 text-xs text-muted"
              >
                {tag}
              </li>
            ))}
          </ul>
        ) : null}
      </Link>
    </article>
  );
}
