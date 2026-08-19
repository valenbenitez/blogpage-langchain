# blogpage-rag

Blog con artículos en Postgres y un chat RAG sobre los posts publicados.

Podés crear y editar posts en Markdown (con un PIN), publicarlos, y preguntar por el contenido desde un chat flotante. Las respuestas salen solo del índice de artículos y citan el slug.

Live: [blogpage-langchain.vercel.app](https://blogpage-langchain.vercel.app)

## Cómo está hecho

**Stack**

- **Next.js 16** (App Router) + TypeScript + Tailwind
- **Postgres** local en desarrollo; **Neon** + **pgvector** en producción
- **LangChain.js** + **Vercel AI Gateway** para embeddings y el modelo de chat
- Driver **postgres.js** (`lib/db`)

**Datos**

- `posts` es la fuente de verdad (título, slug, Markdown, `draft` | `published`)
- `post_chunks` es un índice derivado: fragmentos + embeddings. Se regenera al publicar o al editar un post published

**Capas**

- Lecturas: Server Components → `lib/db/posts.ts`
- Altas/edits: Server Actions (`app/actions/posts.ts`) con validación Zod
- Chat: `POST /api/chat` con streaming (no API REST para el CRUD)

**Pipeline RAG**

1. Al publicar: `chunkText` → `embedDocuments` (`text-embedding-3-small`) → `post_chunks`
2. En cada pregunta: `embedQuery` → búsqueda cosine en pgvector (solo published) → prompt con contexto → `gpt-4o-mini` vía AI Gateway
3. LangChain entra en embeddings y en el chat model. El chunker y el SQL de retrieve son propios

**Extras**

- PIN (`ADMIN_PIN`) para `/create` y `/:slug/edit`
- Tope de mensajes del chat por visitante (`CHAT_MESSAGE_LIMIT`, default 2)

Detalle de arquitectura: [`docs/architecture.md`](./docs/architecture.md).

## Correr en local

### Requisitos

- Node.js 20+
- Postgres con la extensión **pgvector** (pgAdmin está bien)

### 1. Instalar

```bash
npm install
```

### 2. Base de datos

Creá una database (por ejemplo `blogpage_rag`) y corré, en ese orden:

1. `lib/posts/schema.sql`
2. `lib/posts/schema-post-chunks.sql`

Si pgvector no está habilitado:

```sql
CREATE EXTENSION IF NOT EXISTS vector;
```

### 3. Variables de entorno

En la raíz del repo, `.env` o `.env.local`:

```env
DATABASE_URL=postgresql://USER:PASSWORD@localhost:5432/blogpage_rag
AI_GATEWAY_API_KEY=tu_key_de_ai_gateway
ADMIN_PIN=1234
# opcional; default 2. 0 = sin límite
# CHAT_MESSAGE_LIMIT=2
```


### 4. Dev server

```bash
npm run dev
```

Abrí [http://localhost:3000](http://localhost:3000).

- Inicio: lista de artículos
- Crear artículo: `/create` (pide PIN)
- Chat: botón flotante abajo a la derecha

Para indexar y chatear hace falta publicar al menos un post (status **Publicado**) y tener `AI_GATEWAY_API_KEY`.

### Scripts

```bash
npm run lint
npm run build
```

## Deploy

App en **Vercel**, DB en **Neon** (mismas tablas). En Vercel seteá `DATABASE_URL` (connection string con pooling), `AI_GATEWAY_API_KEY` y `ADMIN_PIN`.
