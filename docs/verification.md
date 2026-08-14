# Verificación — Cómo demostrar que el trabajo funciona

> Regla de oro: **el agente no dice "funciona", lo demuestra**.

## Niveles de verificación

### Nivel 1 — Tests (obligatorio cuando exista script)

Toda función pública tiene al menos un test que:

1. Cubre el camino feliz
2. Cubre al menos un camino de error (si puede fallar)

```bash
npm test
```

### Nivel 2 — Smoke test (recomendado)

Antes de cerrar, verificá con un flujo real:

```bash
npm run build    # que compile sin errores
npm run lint     # que no haya errores de lint
```

### Nivel 3 — Integración (si aplica)

- Neon: CRUD de un post draft → publish
- Indexado: al publicar, existen `post_chunks` para ese `post_id`
- Chat RAG: pregunta sobre un post conocido → respuesta con cita (`slug`)
- AI Gateway: generación de texto vía `AI_GATEWAY_API_KEY` (skip seguro si falta env)

## Anti-patrones

- ❌ "Debería funcionar" → falta test o smoke ejecutable
- ❌ Test que solo verifica que no lanza excepción → tiene que verificar el resultado
- ❌ Marcar tarea como Done sin pasar `./init.sh`
- ❌ Mock innecesario del LLM cuando un test unitario del chunker/mapper alcanza

## Verificación final

```bash
./init.sh
```

Si `./init.sh` está rojo, no marques nada como Done. Anotá el bloqueo
en la tarea de Notion.
