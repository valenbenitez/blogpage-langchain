"use client";

import { useActionState } from "react";
import { createPostAction } from "@/app/actions/posts";
import type { PostStatus } from "@/lib/posts/types";

type FormState = {
  success: boolean;
  message: string;
} | null;

export default function CreateBlogPostPage() {
  const [state, submitAction, isPending] = useActionState(
    async (_previousState: FormState, formData: FormData): Promise<FormState> => {
      const title = formData.get("title") as string;
      const slug = formData.get("slug") as string;
      const content = formData.get("content") as string;
      const status = formData.get("status") as PostStatus;
      const summary = formData.get("summary") as string;
      const tags = ((formData.get("tags") as string) ?? "")
        .split(",")
        .map((tag) => tag.trim())
        .filter(Boolean);

      const result = await createPostAction({
        title,
        slug,
        content,
        status,
        summary,
        tags,
      });

      if (result.success) {
        return { success: true, message: "Artículo creado correctamente." };
      }

      return { success: false, message: result.error };
    },
    null,
  );

  const fieldClassName =
    "w-full rounded-lg border border-border bg-surface px-3 py-2.5 text-sm text-foreground outline-none transition placeholder:text-muted focus-visible:border-foreground focus-visible:ring-2 focus-visible:ring-foreground/20";
  const labelClassName = "text-sm font-medium text-foreground";

  return (
    <section className="mx-auto w-full max-w-2xl">
      <div className="mb-6 sm:mb-8">
        <h1 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
          Crear artículo
        </h1>
        <p className="mt-2 text-sm leading-6 text-muted sm:text-base">
          Completá los datos para guardar un borrador o publicar un artículo.
        </p>
      </div>

      <form
        action={submitAction}
        className="space-y-5 rounded-xl border border-border bg-surface p-4 shadow-sm sm:space-y-6 sm:p-6"
      >
        <div className="space-y-2">
          <label className={labelClassName} htmlFor="title">
            Título
          </label>
          <input
            className={fieldClassName}
            id="title"
            name="title"
            placeholder="Título del artículo"
            required
            type="text"
          />
        </div>

        <div className="space-y-2">
          <label className={labelClassName} htmlFor="slug">
            Slug
          </label>
          <input
            className={fieldClassName}
            id="slug"
            name="slug"
            pattern="[a-z0-9]+(?:-[a-z0-9]+)*"
            placeholder="mi-primer-articulo"
            required
            type="text"
          />
          <p className="text-xs leading-5 text-muted">
            Usá minúsculas, números y guiones.
          </p>
        </div>

        <div className="space-y-2">
          <label className={labelClassName} htmlFor="content">
            Contenido
          </label>
          <textarea
            className={`${fieldClassName} min-h-64 resize-y font-mono leading-6`}
            id="content"
            name="content"
            placeholder="Escribí el contenido en Markdown..."
            required
            rows={12}
          />
        </div>

        <div className="grid gap-5 sm:grid-cols-2 sm:gap-6">
          <div className="space-y-2">
            <label className={labelClassName} htmlFor="status">
              Estado
            </label>
            <select
              className={fieldClassName}
              defaultValue="draft"
              id="status"
              name="status"
            >
              <option value="draft">Borrador</option>
              <option value="published">Publicado</option>
            </select>
          </div>

          <div className="space-y-2">
            <label className={labelClassName} htmlFor="tags">
              Etiquetas
            </label>
            <input
              className={fieldClassName}
              id="tags"
              name="tags"
              placeholder="nextjs, rag, postgres"
              type="text"
            />
            <p className="text-xs leading-5 text-muted">
              Separalas con comas.
            </p>
          </div>
        </div>

        <div className="space-y-2">
          <label className={labelClassName} htmlFor="summary">
            Resumen
          </label>
          <textarea
            className={`${fieldClassName} min-h-24 resize-y`}
            id="summary"
            name="summary"
            placeholder="Una descripción breve del artículo"
            rows={3}
          />
        </div>

        {state && (
          <p
            aria-live="polite"
            className={`rounded-lg border px-3 py-2.5 text-sm ${
              state.success
                ? "border-border bg-subtle text-foreground"
                : "border-red-300 bg-red-50 text-red-700 dark:border-red-900 dark:bg-red-950/40 dark:text-red-300"
            }`}
            role={state.success ? "status" : "alert"}
          >
            {state.message}
          </p>
        )}

        <button
          className="inline-flex w-full items-center justify-center rounded-lg bg-foreground px-4 py-2.5 text-sm font-semibold text-background transition hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-foreground disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
          disabled={isPending}
          type="submit"
        >
          {isPending ? "Guardando..." : "Crear artículo"}
        </button>
      </form>
    </section>
  );
}