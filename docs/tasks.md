# Tareas y progreso

Este repo usa **Notion** para gestionar tareas y registrar el progreso de sesión.

## Base de tareas

Cada tarea está en la base de Notion con su estado (`Not started` / `In progress` / `Done`),
criterios de aceptación y descripción.

🔗 **[Abrir base de tareas en Notion](https://app.notion.com/p/3bc8f690ec128075bb33fe9b26ad01de?v=3bc8f690ec1280c2a9d1000c7428d23b)**

> Si estás en Cursor con MCP de Notion configurado, podés consultar esta base
> usando el MCP tool. Pedí "mostrame las tareas pendientes" o "cambiá la tarea
> BLOG — … a In progress".

Filtrá por prefijo `BLOG —`.

## Orden sugerido (MVP) — aún no creadas en Notion

Usá esto como guía al planificar; el estado canónico vive en Notion.

| Order | Tarea (sugerida) | Status |
|------:|------------------|--------|
| 1 | Harness de desarrollo (docs + init.sh) | En curso / local |
| 2 | Schema Neon: `posts` + `post_chunks` + pgvector | Not started |
| 3 | CRUD posts (draft/publish) + UI mínima | Not started |
| 4 | Indexer: chunk → embed → `post_chunks` al publicar | Not started |
| 5 | Chat RAG con citas (AI Gateway + LangChain) | Not started |
| 6 | Bonus: auto-summary + tags al publicar | Not started |

## Producto / diseño

- [Notas langchain-blogs](https://app.notion.com/p/langchain-blogs-3bc8f690ec128040b9d2d29ba5bbad32)
- [`docs/architecture.md`](./architecture.md)

## Sesión activa

El progreso se documenta **dentro de la misma tarea en la base de Notion**. NO se crean tareas nuevas para bitácora.

## Instrucciones para el agente

1. Al arrancar: abrí la base de tareas, encontrá una tarea `Not started` ejecutable, cambiala a `In progress`
2. Documentá el plan, la fecha de inicio y la bitácora en esa misma tarea (body / Description)
3. Durante la implementación: actualizá el progreso en esa misma tarea
4. Al cerrar: marcá la tarea como `Done` (tras review) o documentá bloqueo y pará
5. Una sola tarea `In progress` a la vez
