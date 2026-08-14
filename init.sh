#!/usr/bin/env bash
set -u

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
NC='\033[0m'

ok()   { printf "${GREEN}[OK]${NC}    %s\n" "$1"; }
warn() { printf "${YELLOW}[WARN]${NC}  %s\n" "$1"; }
fail() { printf "${RED}[FAIL]${NC}  %s\n" "$1"; }

EXIT_CODE=0
ROOT="$(cd "$(dirname "$0")" && pwd)"
cd "$ROOT"

echo "── Verificando entorno ─────────────────────────────"
command -v node >/dev/null 2>&1 || { fail "node no está instalado"; exit 1; }
ok "node -> $(node --version)"
command -v npm >/dev/null 2>&1 || { fail "npm no está instalado"; exit 1; }
ok "npm -> $(npm --version)"

echo ""
echo "── Archivos del harness ────────────────────────────"
for f in AGENTS.md CHECKPOINTS.md docs/architecture.md docs/conventions.md docs/verification.md docs/tasks.md; do
  if [ ! -f "$f" ]; then
    fail "Falta archivo: $f"
    EXIT_CODE=1
  else
    ok "Existe $f"
  fi
done

echo ""
echo "── Dependencias ───────────────────────────────────"
if [ ! -d "node_modules" ]; then
  warn "node_modules no existe. Ejecutando npm install..."
  if npm install; then
    ok "npm install completado"
  else
    fail "npm install falló"
    EXIT_CODE=1
  fi
fi
ok "node_modules presente"

echo ""
echo "── Lint ───────────────────────────────────────────"
if npm run lint 2>&1; then
  ok "Lint pasa"
else
  fail "Lint tiene errores"
  EXIT_CODE=1
fi

echo ""
echo "── Tests ───────────────────────────────────────────"
if node -e "const p=require('./package.json'); process.exit(p.scripts && p.scripts.test ? 0 : 1)"; then
  if npm test 2>&1; then
    ok "Tests pasan"
  else
    fail "Tests rotos"
    EXIT_CODE=1
  fi
else
  warn "No hay script test en package.json — skip"
fi

echo ""
echo "── Build ───────────────────────────────────────────"
if npm run build 2>&1; then
  ok "Build pasa"
else
  fail "Build falló"
  EXIT_CODE=1
fi

echo ""
echo "── Resultado ──────────────────────────────────────"
if [ $EXIT_CODE -eq 0 ]; then
  ok "Entorno listo"
else
  fail "Entorno no listo"
fi
exit $EXIT_CODE
