<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# AGENTS.md — Mapa de navegación para agentes de IA

> Este archivo es el **punto de entrada**. No es una biblia de reglas: es un
> **mapa**. Lee solo lo que necesites (divulgación progresiva).

---

## 1. Producto (qué es este repo)

blogpage-rag — Blog con posts en Postgres (Neon) y chat RAG sobre los artículos
publicados, usando LangChain.js + Vercel AI Gateway. MVP: CRUD de posts
(Markdown), indexado en `post_chunks` (pgvector), y chat con citas al slug.

Notas de diseño: [langchain-blogs en Notion](https://app.notion.com/p/langchain-blogs-3bc8f690ec128040b9d2d29ba5bbad32).

## 2. Cómo desarrollar

- **Instalar:** `npm install`
- **Desarrollo local:** `npm run dev`
- **Tests:** `npm test` (cuando exista el script)
- **Build:** `npm run build`
- **Lint:** `npm run lint`

## 3. Cómo trabaja el agente aquí

### Al arrancar una sesión

1. Ejecutá `./init.sh` y verificá que termina sin errores. Si falla, pará.
2. Leé `docs/tasks.md` para ver las tareas (link a Notion).
3. Conectate a Notion vía MCP, tomá una tarea `Not started`, cambiala a `In progress`.
4. Documentá el plan y el progreso **en esa misma tarea** en Notion.

### Durante la sesión

- Una sola tarea a la vez.
- Documentá el progreso en Notion mientras trabajás, no al final.
- Antes de implementar, leé `docs/architecture.md` y `docs/conventions.md`.
- Secrets (`DATABASE_URL`, `AI_GATEWAY_API_KEY`) solo en server / `.env.local`.

### Al cerrar la sesión

1. Ejecutá `./init.sh` — todo verde.
2. Marcá la tarea como `Done` en Notion (o documentá bloqueo y pará).
3. No dejes archivos temporales ni `console.log()` de debug.

## 4. Arquitectura del proyecto

Next.js (App Router) + TypeScript:

- `app/` — rutas y layouts
- `lib/` — db (Neon/Postgres), ai (LangChain / AI Gateway), utilidades server-only
- `components/` — UI compartida
- `docs/` — arquitectura, convenciones, tareas, verificación, roles del harness

Detalle: `docs/architecture.md`.

## 5. Reglas duras

- **Una tarea a la vez.** No mezcles cambios.
- **No declares una tarea `Done` sin `./init.sh` verde.**
- **Documentá el progreso en Notion mientras trabajás.**
- **Si no sabés algo, buscá en `docs/` y en la nota de Notion antes de inventarlo.**
- **No edités código fuera del scope de la tarea actual.**
- **API keys y `DATABASE_URL` solo en server.** Nunca en el client.
- **`posts` = fuente de verdad; `post_chunks` = índice RAG derivado.**
