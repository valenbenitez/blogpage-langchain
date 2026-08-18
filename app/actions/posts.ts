"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { indexPost, unindexPost } from "@/lib/ai/index-post";
import { createPost, getPostById, updatePost } from "@/lib/db/posts";
import type { CreatePostInput, Post, PostStatus } from "@/lib/posts/types";

type ActionResult<T> =
  | { success: true; data: T }
  | { success: false; error: string };

const postStatusSchema = z.enum(["draft", "published"]);

const slugSchema = z
  .string()
  .trim()
  .min(1, "Slug is required")
  .regex(
    /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
    "Slug must be lowercase kebab-case",
  );

const createPostSchema = z.object({
  title: z.string().trim().min(1, "Title is required"),
  slug: slugSchema,
  content: z.string().min(1, "Content is required"),
  summary: z.string().default(""),
  tags: z.array(z.string().trim().min(1)).default([]),
  status: postStatusSchema.default("draft"),
});

const updatePostSchema = z
  .object({
    title: z.string().trim().min(1, "Title is required").optional(),
    slug: slugSchema.optional(),
    content: z.string().min(1, "Content is required").optional(),
    summary: z.string().optional(),
    tags: z.array(z.string().trim().min(1)).optional(),
    status: postStatusSchema.optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: "No fields to update",
  });

async function syncPostIndex(
  post: Post,
  previousStatus?: PostStatus,
): Promise<void> {
  if (post.status === "published") {
    await indexPost(post);
    return;
  }

  if (previousStatus === "published") {
    await unindexPost(post.id);
  }
}

function toErrorMessage(error: unknown): string {
  if (
    error &&
    typeof error === "object" &&
    "code" in error &&
    (error as { code?: string }).code === "23505"
  ) {
    return "A post with this slug already exists";
  }

  if (error instanceof Error) {
    return error.message;
  }

  return "Unexpected error";
}

export async function createPostAction(
  input: CreatePostInput,
): Promise<ActionResult<Post>> {
  const parsed = createPostSchema.safeParse(input);

  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message ?? "Invalid input",
    };
  }

  try {
    const post = await createPost(parsed.data);
    await syncPostIndex(post);
    revalidatePath("/");
    revalidatePath("/admin/posts");
    return { success: true, data: post };
  } catch (error) {
    return { success: false, error: toErrorMessage(error) };
  }
}

export async function updatePostAction(
  id: string,
  input: unknown,
): Promise<ActionResult<Post>> {
  const idParsed = z.string().uuid().safeParse(id);

  if (!idParsed.success) {
    return { success: false, error: "Invalid post id" };
  }

  const parsed = updatePostSchema.safeParse(input);

  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message ?? "Invalid input",
    };
  }

  try {
    const previousPost = await getPostById(idParsed.data);
    const post = await updatePost(idParsed.data, parsed.data);

    if (!post) {
      return { success: false, error: "Post not found" };
    }

    await syncPostIndex(post, previousPost?.status);

    revalidatePath("/");
    revalidatePath("/admin/posts");
    revalidatePath(`/${post.slug}`);

    if (previousPost && previousPost.slug !== post.slug) {
      revalidatePath(`/${previousPost.slug}`);
    }

    return { success: true, data: post };
  } catch (error) {
    return { success: false, error: toErrorMessage(error) };
  }
}
