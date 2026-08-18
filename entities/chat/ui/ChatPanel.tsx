"use client";

import Link from "next/link";
import { useRef, useState, type FormEvent } from "react";

type ChatMessage = {
  role: "user" | "assistant";
  content: string;
  slugs?: string[];
};

async function readErrorMessage(response: Response): Promise<string> {
  const contentType = response.headers.get("content-type") ?? "";

  if (contentType.includes("application/json")) {
    const body: unknown = await response.json();
    if (
      body &&
      typeof body === "object" &&
      "error" in body &&
      typeof body.error === "string"
    ) {
      return body.error;
    }
  }

  return "No se pudo obtener una respuesta.";
}

export function ChatPanel() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isPending, setIsPending] = useState(false);
  const listRef = useRef<HTMLDivElement>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const content = input.trim();
    if (!content || isPending) {
      return;
    }

    const nextMessages: ChatMessage[] = [
      ...messages,
      { role: "user", content },
    ];

    setInput("");
    setError(null);
    setIsPending(true);
    setMessages([...nextMessages, { role: "assistant", content: "" }]);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: nextMessages.map(({ role, content: text }) => ({
            role,
            content: text,
          })),
        }),
      });

      if (!response.ok || !response.body) {
        throw new Error(await readErrorMessage(response));
      }

      const slugs = (response.headers.get("X-Retrieved-Slugs") ?? "")
        .split(",")
        .map((slug) => slug.trim())
        .filter(Boolean);

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let assistantText = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) {
          break;
        }

        assistantText += decoder.decode(value, { stream: true });
        const snapshot = assistantText;

        setMessages((current) => {
          const updated = [...current];
          updated[updated.length - 1] = {
            role: "assistant",
            content: snapshot,
            slugs,
          };
          return updated;
        });
      }

      assistantText += decoder.decode();
      setMessages((current) => {
        const updated = [...current];
        updated[updated.length - 1] = {
          role: "assistant",
          content: assistantText,
          slugs,
        };
        return updated;
      });

      listRef.current?.lastElementChild?.scrollIntoView({
        block: "end",
        behavior: "smooth",
      });
    } catch (caught) {
      const message =
        caught instanceof Error
          ? caught.message
          : "No se pudo obtener una respuesta.";
      setError(message);
      setMessages(nextMessages);
    } finally {
      setIsPending(false);
    }
  }

  return (
    <section className="mx-auto flex w-full max-w-2xl flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
          Chat
        </h1>
        <p className="mt-2 text-sm leading-6 text-muted sm:text-base">
          Preguntá sobre los artículos publicados. Las respuestas se basan en
          ese contenido y citan el slug.
        </p>
      </div>

      <div className="flex min-h-[28rem] flex-col rounded-xl border border-border bg-surface shadow-sm">
        <div
          ref={listRef}
          className="flex flex-1 flex-col gap-4 overflow-y-auto p-4 sm:p-6"
        >
          {messages.length === 0 ? (
            <p className="m-auto max-w-sm text-center text-sm leading-6 text-muted">
              Todavía no hay mensajes. Probá con una pregunta sobre un artículo
              publicado.
            </p>
          ) : (
            messages.map((message, index) => (
              <article
                key={`${message.role}-${index}`}
                className={
                  message.role === "user"
                    ? "ml-auto max-w-[85%] rounded-xl bg-foreground px-3 py-2.5 text-sm text-background"
                    : "mr-auto max-w-[85%] rounded-xl bg-subtle px-3 py-2.5 text-sm text-foreground"
                }
              >
                <p className="whitespace-pre-wrap leading-6">
                  {message.content || (isPending ? "Pensando…" : "")}
                </p>
                {message.role === "assistant" &&
                message.slugs &&
                message.slugs.length > 0 ? (
                  <ul
                    aria-label="Artículos citados"
                    className="mt-3 flex flex-wrap gap-2"
                  >
                    {message.slugs.map((slug) => (
                      <li key={slug}>
                        <Link
                          href={`/${slug}`}
                          className="rounded-md bg-surface px-2 py-0.5 text-xs text-muted underline-offset-2 hover:text-foreground hover:underline"
                        >
                          {slug}
                        </Link>
                      </li>
                    ))}
                  </ul>
                ) : null}
              </article>
            ))
          )}
        </div>

        <form
          onSubmit={handleSubmit}
          className="border-t border-border p-4 sm:p-5"
        >
          {error ? (
            <p
              className="mb-3 rounded-lg border border-red-300 bg-red-50 px-3 py-2 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/40 dark:text-red-300"
              role="alert"
            >
              {error}
            </p>
          ) : null}

          <label className="sr-only" htmlFor="chat-input">
            Pregunta
          </label>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
            <textarea
              className="min-h-20 w-full resize-y rounded-lg border border-border bg-background px-3 py-2.5 text-sm text-foreground outline-none transition placeholder:text-muted focus-visible:border-foreground focus-visible:ring-2 focus-visible:ring-foreground/20"
              disabled={isPending}
              id="chat-input"
              onChange={(event) => setInput(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter" && !event.shiftKey) {
                  event.preventDefault();
                  event.currentTarget.form?.requestSubmit();
                }
              }}
              placeholder="¿De qué tratan los artículos?"
              rows={3}
              value={input}
            />
            <button
              className="inline-flex shrink-0 items-center justify-center rounded-lg bg-foreground px-4 py-2.5 text-sm font-semibold text-background transition hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-foreground disabled:cursor-not-allowed disabled:opacity-60"
              disabled={isPending || input.trim() === ""}
              type="submit"
            >
              {isPending ? "Enviando…" : "Enviar"}
            </button>
          </div>
        </form>
      </div>
    </section>
  );
}
