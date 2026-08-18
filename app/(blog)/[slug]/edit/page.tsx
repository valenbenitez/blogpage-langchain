import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { cache } from "react";

import { EditPostForm } from "@/entities/post/ui/EditPostForm";
import { getPostBySlug } from "@/lib/db/posts";

export const dynamic = "force-dynamic";

type EditPostPageProps = {
  params: Promise<{ slug: string }>;
};

const getPost = cache(getPostBySlug);

export async function generateMetadata({
  params,
}: EditPostPageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPost(slug);

  return {
    title: post ? `Editar ${post.title}` : "Artículo no encontrado",
  };
}

export default async function EditPostPage({ params }: EditPostPageProps) {
  const { slug } = await params;
  const post = await getPost(slug);

  if (!post) {
    notFound();
  }

  return <EditPostForm post={post} />;
}
