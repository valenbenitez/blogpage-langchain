import { z } from "zod";

import { streamRagAnswer } from "@/lib/ai/rag";

const chatBodySchema = z.object({
  messages: z
    .array(
      z.object({
        role: z.enum(["user", "assistant"]),
        content: z.string().min(1),
      }),
    )
    .min(1),
});

export async function POST(request: Request) {
  const json: unknown = await request.json();
  const parsed = chatBodySchema.safeParse(json);

  if (!parsed.success) {
    return Response.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid request" },
      { status: 400 },
    );
  }

  try {
    const { chunks, textStream } = await streamRagAnswer(parsed.data.messages);
    const slugs = [
      ...new Set(chunks.map((chunk) => chunk.metadata.slug).filter(Boolean)),
    ];

    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        try {
          for await (const text of textStream) {
            controller.enqueue(encoder.encode(text));
          }
          controller.close();
        } catch (error) {
          controller.error(error);
        }
      },
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "X-Retrieved-Slugs": slugs.join(","),
        "Cache-Control": "no-store",
      },
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to generate answer";
    return Response.json({ error: message }, { status: 500 });
  }
}
