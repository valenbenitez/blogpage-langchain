# Convenciones de código

## Idioma del código

- **Código en inglés:** comentarios, JSDoc, mensajes de error de dominio, nombres de tests y strings internas.
- **UI de producto en español:** labels, copy del blog y textos orientados al usuario.
- **Identificadores de dominio en inglés:** `postId`, `slug`, `chunkIndex`, etc.

## Estilo general

| Aspecto | Convención |
|---------|-----------|
| TypeScript | `strict: true` |
| Package manager | `npm` |
| Lint | ESLint (`npm run lint`) |
| Imports | Orden: externos → internos (`@/` si existe) → relativos |
| Strings | Comillas dobles `"..."` siempre |
| Nombres de archivo | `kebab-case.ts` / `kebab-case.tsx` |
| Nombres de componentes | `PascalCase.tsx` |
| Nombres de funciones/vars | `camelCase` |
| Constantes | `UPPER_SNAKE_CASE` |
| Tipos/interfaces | `PascalCase` |

## Archivos

- Un componente por archivo
- Un test por módulo; tests cerca del source o en `__tests__/`
- Cada archivo empieza con imports, sin comentarios de boilerplate

## UI

- Preferir componentes simples y claros
- Mobile-first
- Tokens/CSS variables para colores; evitar purple-default AI look

## Tests

- Framework: a definir en una tarea dedicada (Vitest preferido cuando se agregue)
- Tests descriptivos en inglés: `test("returns an error when the slug already exists")`
- Usar `describe` para agrupar casos relacionados
- Preferir datos reales a mocks; si se necesita mock, restaurar después

## Manejo de errores

- Excepciones del dominio con clases nombradas
- Mensajes de error de dominio en inglés
- Capturar en el borde del sistema (route handler / server action)
- Loggear de forma controlada; no `console.log` de debug en producción

## Base de datos / RAG

- Queries parametrizadas; nunca concatenar SQL con input de usuario
- Al cambiar un post `published`, regenerar sus chunks (delete + insert)
- El chat RAG solo retrievea chunks de posts `published`
