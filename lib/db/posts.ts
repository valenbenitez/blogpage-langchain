import "server-only";

import { sql } from "@/lib/db/client";
import type {
  CreatePostInput,
  Post,
  PostStatus,
  UpdatePostInput,
} from "@/lib/posts/types";

type PostRow = {
  id: string;
  title: string;
  slug: string;
  content: string;
  status: PostStatus;
  summary: string | null;
  tags: string[] | null;
  created_at: Date | string;
  updated_at: Date | string;
};

function toIso(value: Date | string): string {
  return value instanceof Date ? value.toISOString() : String(value);
}

function mapPost(row: PostRow): Post {
  return {
    id: row.id,
    title: row.title,
    slug: row.slug,
    content: row.content,
    status: row.status,
    summary: row.summary,
    tags: row.tags ?? [],
    created_at: toIso(row.created_at),
    updated_at: toIso(row.updated_at),
  };
}

export async function listPosts(status?: PostStatus): Promise<Post[]> {
  const rows = status
    ? await sql<PostRow[]>`
        select *
        from posts
        where status = ${status}
        order by created_at desc
      `
    : await sql<PostRow[]>`
        select *
        from posts
        order by created_at desc
      `;

  return rows.map(mapPost);
}

export async function getPostById(id: string): Promise<Post | null> {
  const rows = await sql<PostRow[]>`
    select *
    from posts
    where id = ${id}::uuid
    limit 1
  `;

  return rows[0] ? mapPost(rows[0]) : null;
}

export async function getPostBySlug(slug: string): Promise<Post | null> {
  const rows = await sql<PostRow[]>`
    select *
    from posts
    where slug = ${slug}
    limit 1
  `;

  return rows[0] ? mapPost(rows[0]) : null;
}

export async function createPost(input: CreatePostInput): Promise<Post> {
  const summary = input.summary.trim() === "" ? null : input.summary;

  const rows = await sql<PostRow[]>`
    insert into posts (title, slug, content, status, summary, tags)
    values (
      ${input.title},
      ${input.slug},
      ${input.content},
      ${input.status},
      ${summary},
      ${input.tags}
    )
    returning *
  `;

  const row = rows[0];
  if (!row) {
    throw new Error("Failed to create post");
  }

  return mapPost(row);
}

export async function updatePost(
  id: string,
  input: UpdatePostInput,
): Promise<Post | null> {
  const rows = await sql<PostRow[]>`
    update posts
    set
      title = coalesce(${input.title ?? null}, title),
      slug = coalesce(${input.slug ?? null}, slug),
      content = coalesce(${input.content ?? null}, content),
      status = coalesce(${input.status ?? null}, status),
      summary = case
        when ${input.summary !== undefined} then ${input.summary ?? null}
        else summary
      end,
      tags = coalesce(${input.tags ?? null}, tags)
    where id = ${id}::uuid
    returning *
  `;

  return rows[0] ? mapPost(rows[0]) : null;
}

export async function deletePost(id: string): Promise<boolean> {
  const rows = await sql<{ id: string }[]>`
    delete from posts
    where id = ${id}::uuid
    returning id
  `;

  return rows.length > 0;
}
