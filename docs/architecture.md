# Arquitectura — Qué significa "hacer un buen trabajo"

> Este documento define el estándar de calidad. Los agentes revisores evalúan
> el código contra este archivo. Si no está aquí, no es un requisito.
> Diseño de producto: [langchain-blogs (Notion)](https://app.notion.com/p/langchain-blogs-3bc8f690ec128040b9d2d29ba5bbad32).

## Principios

1. **Capas claras.** Rutas en `app/` → UI en `components/` → dominio/integraciones en `lib/`.
   Sin LangChain, Neon ni secrets en Client Components.
2. **Sin dependencias de más.** Cada dependencia externa está justificada.
   Si una tarea requiere una nueva, se discute antes.
3. **Errores explícitos.** Las funciones que pueden fallar lanzan excepciones
   nombradas. No valores `null`/`undefined` silenciosos.
4. **Tipado estricto.** `strict: true` en `tsconfig.json`. Evitar `any` y `as`
   casts innecesarios.
5. **Dos fuentes, un rol cada una.** `posts` = contenido editable.
   `post_chunks` = índice semántico derivado (regenerable).

## Stack

| Capa | Tecnología |
|------|------------|
| App | Next.js (App Router) + TypeScript |
| Host app | Vercel |
| DB | Neon (Postgres) + pgvector |
| AI | LangChain.js + Vercel AI Gateway |
| Contenido | Markdown en columna `posts.content` |

## Flujo de datos

```
Usuario → UI (lista / detalle / admin posts / chat)
              ↓
       Server Components / Server Actions / Route Handlers
         ├─ Neon Postgres (posts CRUD)
         ├─ Indexer: chunk → embed → post_chunks
         └─ RAG chat: embed query → retrieve chunks → LLM (AI Gateway)
```

### Acceso a la DB

**Nunca desde el client.** `DATABASE_URL` solo en server (`lib/db/`).

| Caso | Mecanismo |
|------|-----------|
| Lecturas (lista/detalle) | Server Components → `lib/db` |
| Mutaciones CRUD | Server Actions → `lib/db` (+ reindex si publish) |
| Chat RAG (streaming) | Route Handler `app/api/chat` → retrieve + LLM |

No envolver todo el CRUD en API routes: en App Router alcanza con server components/actions. Las route handlers quedan para HTTP explícito (stream, webhooks, clients externos).

## Modelo de datos (MVP)

### `posts`

Fuente de verdad del artículo: `id`, `title`, `slug`, `content` (Markdown),
`status` (`draft` | `published`), `summary?`, `tags?`, `created_at`, `updated_at`.

Una sola columna de cuerpo (`content`). No duplicar `markdown`.

### `post_chunks`

Índice RAG: `id`, `post_id`, `chunk_index`, `content`, `embedding`, `metadata` (jsonb).
Se regenera al publicar o al actualizar un post `published`.

## Límites del MVP

- Sin LangGraph / agentes multi-tool
- Sin CMS headless
- Auth admin simple o diferida
- Editor: Markdown (textarea) salvo que una tarea diga lo contrario

## Estructura de carpetas (objetivo)

```
app/                 # rutas App Router
components/          # UI compartida
lib/
  db/                # cliente Neon, queries, schema/migrations helpers
  ai/                # LangChain, embeddings, RAG chain, AI Gateway client
docs/                # harness + estándares
```

## Secrets

- `DATABASE_URL` — Postgres local en desarrollo; Neon en Vercel (prod/preview)
- `AI_GATEWAY_API_KEY` — Vercel AI Gateway
- Nunca `NEXT_PUBLIC_*` para estas keys
