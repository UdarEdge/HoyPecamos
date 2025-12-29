# 🎯 DOCUMENTACIÓN: INTEGRACIÓN DE SUBMARCAS EN FILTROS

## 📋 RESUMEN DE CAMBIOS

Se ha implementado completamente el nivel de **SUBMARCAS** en toda la arquitectura de filtros de Udar Edge, corrigiendo la jerarquía de datos para que coincida con la estructura real del negocio.

---

## 🏗️ ARQUITECTURA ACTUALIZADA

### **Jerarquía Completa (4 niveles)**

```
GERENTE
  └── EMPRESA (Disarmink S.L.)
      └── MARCA (Hoy Pecamos)
          ├── SUBMARCA (Modomio 🍕)
          │   ├── PDV Tiana
          │   └── PDV Badalona
          └── SUBMARCA (BlackBurger 🍔)
              ├── PDV Tiana
              └── PDV Badalona
```

### **Estructura SelectedContext**

```typescript
export interface SelectedContext {
  empresa_id: string;           // Nivel 1: Empresa
  marca_id: string | null;      // Nivel 2: Marca
  submarca_id: string | null;   // Nivel 3: SUBMARCA ⭐ NUEVO
  punto_venta_id: string | null; // Nivel 4: Punto de Venta
}
```

---

## 📦 ARCHIVOS MODIFICADOS

### ✅ **1. `/components/gerente/FiltroContextoJerarquico.tsx`**

**Cambios principales:**
- ✅ Agregado nivel de **SUBMARCAS** en la jerarquía visual
- ✅ Nuevo campo `submarca_id` en `SelectedContext`
- ✅ Funciones de selección actualizadas:
  - `isSubmarcaFullySelected()`
  - `isSubmarcaPartiallySelected()`
  - `handleToggleSubmarca()`
- ✅ Estado de expansión para submarcas: `expandedSubmarcas`
- ✅ Interfaz actualizada con iconos 🍕 y 🍔

**Visualización mejorada:**
```
☑️ Disarmink S.L. - Hoy Pecamos [DISARMINK]
  └─ ☑️ Hoy Pecamos [HOYPECAMOS]
      ├─ 🍕 Modomio [MODOMIO]
      │   ├─ ☐ Tiana [PDV-TIANA]
      │   └─ ☐ Badalona [PDV-BADALONA]
      └─ 🍔 BlackBurger [BLACKBURGER]
          ├─ ☐ Tiana [PDV-TIANA]
          └─ ☐ Badalona [PDV-BADALONA]
```

---

### ✅ **2. `/components/filtros/FiltroUniversalUDAR.tsx`**

**Cambios principales:**
- ✅ Campo `submarca_id` agregado a `SelectedContext`
- ✅ Interfaz `Submarca` creada
- ✅ Interfaz `Marca` actualizada con array `submarcas`
- ✅ Todas las funciones de selección actualizadas para incluir submarcas

**Importante:** Este filtro es más genérico pero también soporta submarcas ahora.

---

### ✅ **3. `/contexts/FiltroUniversalContext.tsx`**

**Cambios principales:**
- ✅ Nueva función helper: `getSubmarcasSeleccionadas()`
- ✅ Función `generarWhereClause()` actualizada para incluir filtrado por submarcas
- ✅ Lógica de SQL queries preparada para el nuevo nivel jerárquico

**Ejemplo de uso:**

```typescript
const { 
  getEmpresasSeleccionadas, 
  getMarcasSeleccionadas,
  getSubmarcasSeleccionadas,  // ⭐ NUEVO
  getPDVsSeleccionados 
} = useFiltroUniversal();

// Obtener submarcas seleccionadas
const submarcas = getSubmarcasSeleccionadas();
// Retorna: ['SUB-MODOMIO', 'SUB-BLACKBURGER']
```

---

### ✅ **4. `/styles/globals.css`**

**Cambios principales:**
- ✅ Scrollbar horizontal oculta en elementos con `overflow-x-auto`
- ✅ Solución aplicada para Chrome, Firefox, Safari, Edge

```css
/* Ocultar scrollbar en overflow-x-auto */
.overflow-x-auto {
  -ms-overflow-style: none;  /* IE y Edge */
  scrollbar-width: none;      /* Firefox */
}
.overflow-x-auto::-webkit-scrollbar {
  display: none;              /* Chrome, Safari, Opera */
}
```

---

## 🔧 CÓMO USAR LAS SUBMARCAS

### **1. Usar el Filtro Jerárquico**

```typescript
import { FiltroContextoJerarquico, SelectedContext } from './FiltroContextoJerarquico';

function MiComponente() {
  const [selectedContext, setSelectedContext] = useState<SelectedContext[]>([]);

  return (
    <FiltroContextoJerarquico
      selectedContext={selectedContext}
      onChange={setSelectedContext}
    />
  );
}
```

### **2. Interpretar la Selección**

```typescript
// Ejemplo de selectedContext con submarca seleccionada:
[
  {
    empresa_id: "EMP-001",
    marca_id: "MRC-HOYPECAMOS",
    submarca_id: "SUB-MODOMIO",     // ⭐ Pizza seleccionada
    punto_venta_id: null             // Todos los PDVs
  }
]

// Ejemplo con PDV específico:
[
  {
    empresa_id: "EMP-001",
    marca_id: "MRC-HOYPECAMOS",
    submarca_id: "SUB-BLACKBURGER",  // ⭐ Hamburguesas
    punto_venta_id: "PDV-TIANA"      // Solo Tiana
  }
]
```

### **3. Filtrar Datos en el Frontend**

```typescript
// Obtener productos de una submarca específica
import { obtenerProductosPorSubmarca } from '../contexts/ProductosContext';

const productosModomio = obtenerProductosPorSubmarca('SUB-MODOMIO');
const productosBlackBurger = obtenerProductosPorSubmarca('SUB-BLACKBURGER');
```

### **4. Generar Consultas SQL con Submarcas**

```typescript
import { generarWhereClause } from '../contexts/FiltroUniversalContext';

const filtroData = {
  selectedContext: [
    {
      empresa_id: "EMP-001",
      marca_id: "MRC-HOYPECAMOS",
      submarca_id: "SUB-MODOMIO",
      punto_venta_id: null
    }
  ],
  filtrosAdicionales: {
    periodo: { tipo: 'este_mes', fecha_inicio: '2025-01-01', fecha_fin: '2025-01-26' },
    canales: ['app', 'mostrador'],
    estados: [],
    tipo: null
  }
};

const { whereClause, params } = generarWhereClause(filtroData);

// Resultado:
// whereClause: "WHERE empresa_id IN (:empresaIds) AND marca_id IN (:marcaIds) AND submarca_id IN (:submarcaIds) AND fecha >= :fechaInicio AND fecha <= :fechaFin AND canal IN (:canales)"
// params: {
//   empresaIds: ['EMP-001'],
//   marcaIds: ['MRC-HOYPECAMOS'],
//   submarcaIds: ['SUB-MODOMIO'],  // ⭐ NUEVO
//   fechaInicio: '2025-01-01',
//   fechaFin: '2025-01-26',
//   canales: ['app', 'mostrador']
// }
```

---

## 🗄️ CONSULTAS SQL RECOMENDADAS

### **Consulta de Ventas por Submarca**

```sql
SELECT 
  s.nombre AS submarca,
  COUNT(*) AS num_pedidos,
  SUM(p.total) AS ventas_totales
FROM pedidos p
JOIN submarcas s ON p.submarca_id = s.id
WHERE 
  p.empresa_id = :empresaId
  AND p.submarca_id IN (:submarcaIds)
  AND p.fecha >= :fechaInicio
  AND p.fecha <= :fechaFin
GROUP BY s.nombre
ORDER BY ventas_totales DESC;
```

### **Consulta de Productos por Submarca y PDV**

```sql
SELECT 
  p.nombre AS producto,
  s.nombre AS submarca,
  pdv.nombre AS punto_venta,
  SUM(dp.cantidad) AS unidades_vendidas,
  SUM(dp.precio_unitario * dp.cantidad) AS ingresos
FROM detalle_pedidos dp
JOIN productos p ON dp.producto_id = p.id
JOIN submarcas s ON p.submarca_id = s.id
JOIN puntos_venta pdv ON dp.punto_venta_id = pdv.id
WHERE 
  p.submarca_id = :submarcaId
  AND dp.punto_venta_id = :pdvId
  AND dp.fecha >= :fechaInicio
  AND dp.fecha <= :fechaFin
GROUP BY p.nombre, s.nombre, pdv.nombre
ORDER BY ingresos DESC;
```

### **Análisis Comparativo: Modomio vs BlackBurger**

```sql
WITH ventas_por_submarca AS (
  SELECT 
    p.submarca_id,
    s.nombre AS submarca,
    DATE(p.fecha_pedido) AS fecha,
    COUNT(*) AS num_pedidos,
    SUM(p.total) AS ventas_diarias
  FROM pedidos p
  JOIN submarcas s ON p.submarca_id = s.id
  WHERE 
    p.submarca_id IN ('SUB-MODOMIO', 'SUB-BLACKBURGER')
    AND p.fecha_pedido >= :fechaInicio
    AND p.fecha_pedido <= :fechaFin
  GROUP BY p.submarca_id, s.nombre, DATE(p.fecha_pedido)
)
SELECT 
  fecha,
  MAX(CASE WHEN submarca_id = 'SUB-MODOMIO' THEN ventas_diarias ELSE 0 END) AS modomio_ventas,
  MAX(CASE WHEN submarca_id = 'SUB-MODOMIO' THEN num_pedidos ELSE 0 END) AS modomio_pedidos,
  MAX(CASE WHEN submarca_id = 'SUB-BLACKBURGER' THEN ventas_diarias ELSE 0 END) AS blackburger_ventas,
  MAX(CASE WHEN submarca_id = 'SUB-BLACKBURGER' THEN num_pedidos ELSE 0 END) AS blackburger_pedidos
FROM ventas_por_submarca
GROUP BY fecha
ORDER BY fecha DESC;
```

---

## 📊 EJEMPLOS DE COMPONENTES ACTUALIZADOS

### **CuentaResultados.tsx**

```typescript
// Ya está usando SelectedContext correctamente
const [selectedContext, setSelectedContext] = useState<SelectedContext[]>([]);

// El componente puede acceder a submarca_id en cada contexto:
selectedContext.forEach(ctx => {
  console.log('Submarca seleccionada:', ctx.submarca_id);
});
```

### **Dashboard360.tsx**

```typescript
// También usa SelectedContext correctamente
const [selectedContext, setSelectedContext] = useState<SelectedContext[]>([]);

// Filtrar métricas por submarca
const ventasPorSubmarca = useMemo(() => {
  return selectedContext
    .filter(ctx => ctx.submarca_id !== null)
    .map(ctx => ({
      submarcaId: ctx.submarca_id,
      submarcaNombre: getNombreSubmarca(ctx.submarca_id!)
    }));
}, [selectedContext]);
```

---

## 🎨 CONFIGURACIÓN DE SUBMARCAS

Las submarcas se definen en `/constants/empresaConfig.ts`:

```typescript
export const SUBMARCAS: Record<string, Submarca> = {
  'SUB-MODOMIO': {
    id: 'SUB-MODOMIO',
    codigo: 'MODOMIO',
    nombre: 'Modomio',
    marcaId: 'MRC-HOYPECAMOS',
    empresaId: 'EMP-001',
    colorIdentidad: '#FF6B35',
    icono: '🍕',
    tipo: 'Pizzas',
    descripcion: 'Pizzas artesanales con ingredientes frescos',
    activo: true,
    orden: 1
  },
  'SUB-BLACKBURGER': {
    id: 'SUB-BLACKBURGER',
    codigo: 'BLACKBURGER',
    nombre: 'BlackBurger',
    marcaId: 'MRC-HOYPECAMOS',
    empresaId: 'EMP-001',
    colorIdentidad: '#1A1A1A',
    icono: '🍔',
    tipo: 'Hamburguesas',
    descripcion: 'Hamburguesas gourmet con carne premium',
    activo: true,
    orden: 2
  }
};
```

---

## ⚠️ CONSIDERACIONES IMPORTANTES

### **Compatibilidad hacia atrás**

Los componentes que usan `SelectedContext` ahora **deben manejar el campo `submarca_id`**. 

Si un componente espera la estructura antigua (sin `submarca_id`), debes actualizarlo.

### **Migración de datos existentes**

Si tienes datos guardados en `localStorage` con la estructura antigua:

```typescript
// Antes (sin submarca_id)
{
  empresa_id: "EMP-001",
  marca_id: "MRC-HOYPECAMOS",
  punto_venta_id: "PDV-TIANA"
}

// Ahora (con submarca_id)
{
  empresa_id: "EMP-001",
  marca_id: "MRC-HOYPECAMOS",
  submarca_id: null,  // ⭐ Debe agregarse
  punto_venta_id: "PDV-TIANA"
}
```

**Solución:** El contexto limpiará automáticamente el localStorage al detectar una estructura antigua.

### **Queries a Supabase**

Asegúrate de que tus tablas en Supabase tengan la columna `submarca_id`:

```sql
ALTER TABLE productos 
ADD COLUMN submarca_id VARCHAR(50) REFERENCES submarcas(id);

ALTER TABLE pedidos 
ADD COLUMN submarca_id VARCHAR(50) REFERENCES submarcas(id);

-- Índices para mejorar el rendimiento
CREATE INDEX idx_productos_submarca ON productos(submarca_id);
CREATE INDEX idx_pedidos_submarca ON pedidos(submarca_id);
```

---

## ✨ PRÓXIMOS PASOS RECOMENDADOS

### **1. Actualizar componentes de reportes**
- [ ] Módulo de Ventas: Filtrar por submarca
- [ ] Módulo de EBITDA: Comparar submarcas
- [ ] Módulo de Cierres: Agrupar por submarca

### **2. Crear visualizaciones específicas**
- [ ] Gráfico de ventas por submarca (pizza vs hamburguesas)
- [ ] Análisis de productos más vendidos por submarca
- [ ] Comparativa de tickets promedio entre submarcas

### **3. Integración con Backend**
- [ ] Actualizar endpoints de API para soportar filtrado por `submarca_id`
- [ ] Migrar datos existentes para incluir `submarca_id`
- [ ] Crear vistas materializadas en Supabase para análisis por submarca

---

## 🚀 CONCLUSIÓN

La integración de submarcas está **100% completa** en el sistema de filtros. Todos los componentes principales han sido actualizados para soportar la jerarquía de 4 niveles:

1. ✅ **EMPRESA** → Disarmink S.L.
2. ✅ **MARCA** → Hoy Pecamos
3. ✅ **SUBMARCA** → Modomio 🍕 / BlackBurger 🍔
4. ✅ **PUNTO DE VENTA** → Tiana / Badalona

El sistema ahora refleja correctamente la estructura de negocio y permite análisis granular por línea de producto (submarca).

---

**Documentación generada:** 26 de enero de 2025  
**Versión:** 1.0  
**Autor:** Udar Edge Development Team
