# CHECKPOINTS — Evaluación del estado final

> En sistemas multi-agente no se evalúa el camino, se evalúa el destino.
> Estos son los checkpoints objetivos que un juez (humano o IA) puede usar
> para decidir si el proyecto / la sesión está sana.

## C1 — El harness está completo

- [ ] Existen: `AGENTS.md`, `init.sh`, `CHECKPOINTS.md`, `docs/tasks.md`
- [ ] Existen los 3 docs: `docs/architecture.md`, `docs/conventions.md`, `docs/verification.md`
- [ ] `./init.sh` termina con exit code 0

## C2 — El estado es coherente

- [ ] Como mucho una tarea en `In progress` en la base de Notion
- [ ] Toda tarea `Done` tiene verificación asociada que pasa (`./init.sh` + tests cuando existan)
- [ ] El progreso de la sesión está documentado en la tarea de Notion

## C3 — El código respeta la arquitectura

- [ ] Estructura alineada a `docs/architecture.md` (app, lib/db, lib/ai, components)
- [ ] `posts` es la fuente de verdad; `post_chunks` solo índice RAG derivado
- [ ] Secrets (`DATABASE_URL`, `AI_GATEWAY_API_KEY`) solo en server / `.env.local`
- [ ] No hay `console.log()` de debug (excepto en tests)
- [ ] No hay TODOs sin contexto ni comentarios de código muerto

## C4 — La verificación es real

- [ ] `npm run lint` pasa
- [ ] Si existe `npm test`, pasa y muestra > 0 tests
- [ ] `npm run build` pasa

## C5 — La sesión se cerró bien

- [ ] No hay archivos temporales sin trackear (`*.tmp`, etc.)
- [ ] La tarea trabajada está en `Done` o blocked con resumen en Notion
- [ ] `./init.sh` verde al cierre

---

**Cómo usar este archivo:** un agente revisor recorre cada checkbox, marca `[x]` o `[ ]`, y rechaza el cierre de sesión si quedan boxes vacíos críticos en C1–C5.
