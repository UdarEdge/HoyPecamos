#!/bin/bash

# 🚀 SCRIPT DE VERIFICACIÓN PRE-DEPLOY VERCEL
# Este script verifica que todo esté listo para el deploy

echo "🚀 ============================================"
echo "   VERIFICACIÓN PRE-DEPLOY - UDAR EDGE"
echo "============================================"
echo ""

# Colores
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Contador de checks
TOTAL_CHECKS=0
PASSED_CHECKS=0

check() {
    TOTAL_CHECKS=$((TOTAL_CHECKS + 1))
    if [ $1 -eq 0 ]; then
        echo -e "${GREEN}✅${NC} $2"
        PASSED_CHECKS=$((PASSED_CHECKS + 1))
    else
        echo -e "${RED}❌${NC} $2"
    fi
}

echo "📂 Verificando archivos esenciales..."
echo ""

# Verificar archivos principales
[ -f "App.tsx" ] && check 0 "App.tsx existe" || check 1 "App.tsx NO encontrado"
[ -f "index.html" ] && check 0 "index.html existe" || check 1 "index.html NO encontrado"
[ -f "vercel.json" ] && check 0 "vercel.json existe" || check 1 "vercel.json NO encontrado"

echo ""
echo "📡 Verificando configuración de Supabase..."
echo ""

# Verificar archivos de Supabase
[ -f "supabase/functions/server/index.tsx" ] && check 0 "Backend Supabase existe" || check 1 "Backend NO encontrado"
[ -f "utils/supabase/client.tsx" ] && check 0 "Cliente Supabase existe" || check 1 "Cliente NO encontrado"
[ -f "utils/supabase/info.tsx" ] && check 0 "Info Supabase existe" || check 1 "Info NO encontrado"

echo ""
echo "🔧 Verificando contextos..."
echo ""

# Verificar contextos
[ -f "contexts/ProductosContext.tsx" ] && check 0 "ProductosContext existe" || check 1 "ProductosContext NO encontrado"
[ -f "contexts/PedidosContext.tsx" ] && check 0 "PedidosContext existe" || check 1 "PedidosContext NO encontrado"

echo ""
echo "🎨 Verificando componentes clave..."
echo ""

# Verificar componentes
[ -f "components/SupabaseTest.tsx" ] && check 0 "SupabaseTest existe" || check 1 "SupabaseTest NO encontrado"
[ -f "components/SupabaseBadge.tsx" ] && check 0 "SupabaseBadge existe" || check 1 "SupabaseBadge NO encontrado"

echo ""
echo "📚 Verificando documentación..."
echo ""

# Verificar documentación
[ -f "VERCEL_DEPLOY_GUIDE.md" ] && check 0 "Guía de Deploy existe" || check 1 "Guía NO encontrada"
[ -f "INTEGRACION_SUPABASE.md" ] && check 0 "Doc. Integración existe" || check 1 "Doc. NO encontrada"
[ -f "CHECKLIST_DEPLOY_VERCEL.md" ] && check 0 "Checklist existe" || check 1 "Checklist NO encontrado"

echo ""
echo "📊 ============================================"
echo "   RESUMEN"
echo "============================================"
echo ""

# Calcular porcentaje
PERCENTAGE=$((PASSED_CHECKS * 100 / TOTAL_CHECKS))

echo "Total de checks: $TOTAL_CHECKS"
echo "Checks pasados: $PASSED_CHECKS"
echo "Porcentaje: $PERCENTAGE%"
echo ""

if [ $PERCENTAGE -eq 100 ]; then
    echo -e "${GREEN}🎉 ¡TODO LISTO PARA DEPLOY EN VERCEL!${NC}"
    echo ""
    echo "Próximos pasos:"
    echo "1. git add ."
    echo "2. git commit -m '🚀 Ready for Vercel deploy'"
    echo "3. git push origin main"
    echo "4. Conectar repositorio en vercel.com"
    echo "5. Configurar variables de entorno"
    echo "6. Deploy!"
elif [ $PERCENTAGE -ge 80 ]; then
    echo -e "${YELLOW}⚠️  Casi listo, revisa los checks que fallaron${NC}"
else
    echo -e "${RED}❌ Hay problemas que deben resolverse antes del deploy${NC}"
fi

echo ""
echo "📖 Para más información: cat VERCEL_DEPLOY_GUIDE.md"
echo ""
