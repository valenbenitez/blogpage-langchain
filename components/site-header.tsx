import Link from "next/link";

export function SiteHeader() {
  return (
    <header className="border-b border-border bg-surface">
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-3 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6 sm:py-5">
        <Link
          href="/"
          className="w-fit text-lg font-semibold tracking-tight text-foreground"
        >
          Blogpage RAG
        </Link>

        <nav aria-label="Navegación principal">
          <ul className="flex items-center gap-1 text-sm font-medium">
            <li>
              <Link
                href="/"
                className="inline-flex rounded-md px-3 py-2 text-muted transition-colors hover:bg-subtle hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-foreground"
              >
                Inicio
              </Link>
            </li>
            <li>
              <Link
                href="/chat"
                className="inline-flex rounded-md px-3 py-2 text-muted transition-colors hover:bg-subtle hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-foreground"
              >
                Chat
              </Link>
            </li>
            <li>
              <Link
                href="/create"
                className="inline-flex rounded-md px-3 py-2 text-muted transition-colors hover:bg-subtle hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-foreground"
              >
                Crear artículo
              </Link>
            </li>
          </ul>
        </nav>
      </div>
    </header>
  );
}
