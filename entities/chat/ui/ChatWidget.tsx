"use client";

import { usePathname } from "next/navigation";
import { useState } from "react";

import { ChatPanel } from "@/entities/chat/ui/ChatPanel";

export function ChatWidget() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  if (pathname === "/login") {
    return null;
  }

  return (
    <div className="pointer-events-none fixed right-4 bottom-4 z-50 flex flex-col items-end gap-3 sm:right-6 sm:bottom-6">
      {open ? (
        <section
          aria-label="Chat del blog"
          className="pointer-events-auto flex h-[min(32rem,calc(100vh-7rem))] w-[min(24rem,calc(100vw-2rem))] flex-col overflow-hidden rounded-xl border border-border bg-surface shadow-lg"
        >
          <header className="flex items-center justify-between border-b border-border px-3 py-2.5">
            <p className="text-sm font-semibold text-foreground">Chat</p>
            <button
              className="rounded-md px-2 py-1 text-xs font-medium text-muted transition hover:bg-subtle hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-foreground"
              onClick={() => setOpen(false)}
              type="button"
            >
              Cerrar
            </button>
          </header>
          <div className="min-h-0 flex-1">
            <ChatPanel variant="widget" />
          </div>
        </section>
      ) : null}

      <button
        aria-expanded={open}
        aria-label={open ? "Cerrar chat" : "Abrir chat"}
        className="pointer-events-auto inline-flex h-12 items-center justify-center rounded-full bg-foreground px-5 text-sm font-semibold text-background shadow-md transition hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-foreground"
        onClick={() => setOpen((current) => !current)}
        type="button"
      >
        {open ? "Cerrar" : "Chat"}
      </button>
    </div>
  );
}
