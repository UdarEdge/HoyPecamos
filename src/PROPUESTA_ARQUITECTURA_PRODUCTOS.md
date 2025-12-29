# 🏗️ PROPUESTA: MEJORA DE ARQUITECTURA Y UX - PRODUCTOS

## 📊 SITUACIÓN ACTUAL

### **Problemas Identificados:**

1. **UX:**
   - ❌ Barra de búsqueda y filtros separados de la tabla (ocupan espacio)
   - ❌ No hay forma clara de filtrar por marca/submarca
   - ❌ Los filtros están fuera del contexto visual de la tabla

2. **Arquitectura:**
   - ❌ No hay relación clara entre PRODUCTO ↔ MARCA/SUBMARCA
   - ❌ Un producto debería poder estar en múltiples submarcas
   - ❌ No hay visibilidad de qué productos pertenecen a qué submarca

---

## 🎯 PROPUESTA DE MEJORA

### **1. MEJORA UX - INTERFAZ**

#### **ANTES:**
```
┌────────────────────────────────────────┐
│ Catálogo de Productos        [Exportar]│
├────────────────────────────────────────┤
│ [🔍 Buscar productos...] [🔽 Filtros]  │ ← ELIMINAR
├────────────────────────────────────────┤
│ TABLA DE PRODUCTOS                     │
└────────────────────────────────────────┘
```

#### **DESPUÉS:**
```
┌────────────────────────────────────────┐
│ Catálogo de Productos        [Exportar]│
├────────────────────────────────────────┤
│ ┌─ TABLA DE PRODUCTOS ────────────────┐│
│ │ Filtros integrados:                 ││
│ │ [🔍 Buscar] [📁 Categoría] [🏷️ Marc..││ ← Scroll horizontal
│ │                                     ││
│ │ PRD | Descripción | Categoría | ... ││
│ │ ──────────────────────────────────── ││
│ │ PRD-001 | Croissant | Bollería | ...││
│ └─────────────────────────────────────┘│
└────────────────────────────────────────┘
```

**Ventajas:**
- ✅ Filtros en el contexto visual de la tabla
- ✅ Más espacio vertical para datos
- ✅ UX más limpia y moderna
- ✅ Filtros con scroll horizontal (sin wrap)
- ✅ Búsqueda integrada como un filtro más

---

### **2. ARQUITECTURA DE DATOS - PRODUCTOS Y SUBMARCAS**

#### **🏗️ ESTRUCTURA ACTUAL (inferida):**
```
PRODUCTO {
  id_producto: string
  nombre: string
  categoria: string
  // ... sin relación directa con marcas
}
```

#### **🚀 NUEVA ARQUITECTURA PROPUESTA:**

```typescript
// ============================================
// TABLA: PRODUCTO (Master)
// ============================================
PRODUCTO {
  id_producto: string (PK)         // "PRD-001"
  nombre: string                   // "Croissant Mantequilla"
  descripcion_corta: string
  descripcion_larga: string
  categoria: string                // "Bollería"
  subcategoria: string            // "Pastelería Francesa"
  pvp_base: number                // Precio base (puede variar por submarca)
  iva: number                     // 10%
  escandallo_unitario: number     // €0.85
  alergenos: string[]             // ["gluten", "lactosa"]
  etiquetas: string[]             // ["saludable", "vegano", "premium"]
  vida_util_horas: number         // 48
  imagen_url: string
  activo_global: boolean          // Si false, no aparece en NINGUNA submarca
  fecha_creacion: Date
  fecha_actualizacion: Date
}

// ============================================
// TABLA: PRODUCTO_SUBMARCA (Relación N:M)
// ============================================
PRODUCTO_SUBMARCA {
  id: string (PK)
  id_producto: string (FK → PRODUCTO)
  id_submarca: string (FK → SUBMARCA)
  
  // Personalización por submarca
  nombre_personalizado: string | null    // Si null, usa PRODUCTO.nombre
  pvp_submarca: number | null            // Si null, usa PRODUCTO.pvp_base
  descripcion_personalizada: string | null
  imagen_personalizada: string | null
  
  // Control de visibilidad
  activo_en_submarca: boolean            // Visible en esta submarca
  destacado: boolean                     // Aparece en destacados
  orden_menu: number                     // Orden en el menú digital
  
  // Stock específico (si se gestiona por submarca)
  stock_dedicado: boolean                // ¿Stock independiente?
  
  // Metadata
  fecha_asignacion: Date
  fecha_ultima_actualizacion: Date
}

// ============================================
// EJEMPLO DE SUBMARCAS
// ============================================
SUBMARCA {
  id_submarca: string (PK)         // "SUB-001"
  id_marca: string (FK → MARCA)    // "MRC-001" (HoyPecamos)
  nombre: string                   // "Modomio" o "BlackBurger"
  slug: string                     // "modomio"
  tipo: 'pizza' | 'burger' | 'cafe' | 'postres' | 'otro'
  color_primario: string           // "#ED1C24"
  color_secundario: string         // "#000000"
  logo_url: string
  activo: boolean
}

// ============================================
// TABLA: STOCK_PDV (con relación a submarca)
// ============================================
STOCK_PDV {
  id: string (PK)
  id_producto: string (FK → PRODUCTO)
  id_submarca: string (FK → SUBMARCA)  // ← NUEVA columna
  pdv_id: string (FK → PUNTO_VENTA)
  
  stock_actual: number
  stock_max: number
  stock_min: number
  activo_en_pdv: boolean
  
  ultima_actualizacion: Date
}
```

---

### **3. CASOS DE USO**

#### **Caso 1: Producto en múltiples submarcas con mismo precio**
```typescript
// Pizza Margarita disponible en:
// - Modomio (Submarca Pizzas): €9.50
// - BlackBurger (Submarca Burgers): €9.50 (como extra/side)

PRODUCTO {
  id_producto: "PRD-123",
  nombre: "Pizza Margarita",
  pvp_base: 9.50
}

PRODUCTO_SUBMARCA [
  {
    id_producto: "PRD-123",
    id_submarca: "SUB-001", // Modomio
    activo_en_submarca: true,
    pvp_submarca: null,  // Usa pvp_base
    destacado: true
  },
  {
    id_producto: "PRD-123",
    id_submarca: "SUB-002", // BlackBurger
    activo_en_submarca: true,
    pvp_submarca: null,  // Usa pvp_base
    destacado: false
  }
]
```

#### **Caso 2: Producto con precio diferente por submarca**
```typescript
// Coca-Cola disponible en:
// - Modomio: €2.00 (promoción)
// - BlackBurger: €2.50 (precio estándar)

PRODUCTO {
  id_producto: "PRD-456",
  nombre: "Coca-Cola 330ml",
  pvp_base: 2.50
}

PRODUCTO_SUBMARCA [
  {
    id_producto: "PRD-456",
    id_submarca: "SUB-001", // Modomio
    activo_en_submarca: true,
    pvp_submarca: 2.00,  // ← Precio personalizado
    destacado: false
  },
  {
    id_producto: "PRD-456",
    id_submarca: "SUB-002", // BlackBurger
    activo_en_submarca: true,
    pvp_submarca: null,  // Usa pvp_base (€2.50)
    destacado: false
  }
]
```

#### **Caso 3: Producto exclusivo de una submarca**
```typescript
// BlackBurger Clásica solo en BlackBurger

PRODUCTO {
  id_producto: "PRD-789",
  nombre: "BlackBurger Clásica",
  pvp_base: 12.50
}

PRODUCTO_SUBMARCA [
  {
    id_producto: "PRD-789",
    id_submarca: "SUB-002", // BlackBurger
    activo_en_submarca: true,
    pvp_submarca: null,
    destacado: true
  }
  // No hay registro para Modomio
]
```

---

### **4. CONSULTAS SQL EJEMPLO**

#### **Obtener productos de una submarca específica:**
```sql
SELECT 
  p.*,
  ps.pvp_submarca,
  COALESCE(ps.pvp_submarca, p.pvp_base) as pvp_final,
  ps.activo_en_submarca,
  ps.destacado,
  s.nombre as submarca_nombre
FROM PRODUCTO p
INNER JOIN PRODUCTO_SUBMARCA ps ON p.id_producto = ps.id_producto
INNER JOIN SUBMARCA s ON ps.id_submarca = s.id_submarca
WHERE ps.id_submarca = 'SUB-001' 
  AND ps.activo_en_submarca = true
  AND p.activo_global = true
ORDER BY ps.orden_menu;
```

#### **Obtener todas las submarcas donde está un producto:**
```sql
SELECT 
  s.nombre as submarca,
  ps.pvp_submarca,
  COALESCE(ps.pvp_submarca, p.pvp_base) as pvp_final,
  ps.activo_en_submarca,
  ps.destacado
FROM PRODUCTO_SUBMARCA ps
INNER JOIN SUBMARCA s ON ps.id_submarca = s.id_submarca
WHERE ps.id_producto = 'PRD-123';
```

#### **Stock total de un producto en todos los PDVs de una submarca:**
```sql
SELECT 
  p.nombre,
  s.nombre as submarca,
  SUM(stock.stock_actual) as stock_total
FROM STOCK_PDV stock
INNER JOIN PRODUCTO p ON stock.id_producto = p.id_producto
INNER JOIN SUBMARCA s ON stock.id_submarca = s.id_submarca
WHERE stock.id_submarca = 'SUB-001'
  AND stock.id_producto = 'PRD-123'
GROUP BY p.nombre, s.nombre;
```

---

### **5. UI/UX - FILTROS INTEGRADOS EN TABLA**

#### **Componente de Filtros (dentro de la tabla):**
```jsx
<Card>
  <CardContent className="p-0">
    {/* Filtros integrados con scroll horizontal */}
    <div className="border-b bg-gray-50 p-3">
      <div className="overflow-x-auto -mx-2 px-2 scrollbar-hide">
        <div className="flex gap-2 min-w-max pb-1">
          
          {/* Búsqueda */}
          <div className="relative flex-shrink-0 w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              placeholder="Buscar productos..."
              className="pl-10 h-9"
              value={busquedaProducto}
              onChange={(e) => setBusquedaProducto(e.target.value)}
            />
          </div>

          {/* Filtro Submarca */}
          <Select value={filtroSubmarca} onValueChange={setFiltroSubmarca}>
            <SelectTrigger className="h-9 w-40">
              <SelectValue placeholder="Submarca" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todas">Todas</SelectItem>
              <SelectItem value="modomio">🍕 Modomio</SelectItem>
              <SelectItem value="blackburger">🍔 BlackBurger</SelectItem>
            </SelectContent>
          </Select>

          {/* Filtro Categoría */}
          <Select value={filtroCategoria} onValueChange={setFiltroCategoria}>
            <SelectTrigger className="h-9 w-40">
              <SelectValue placeholder="Categoría" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todas">Todas</SelectItem>
              <SelectItem value="pizzas">Pizzas</SelectItem>
              <SelectItem value="burgers">Hamburguesas</SelectItem>
              <SelectItem value="bebidas">Bebidas</SelectItem>
              <SelectItem value="postres">Postres</SelectItem>
            </SelectContent>
          </Select>

          {/* Filtro Rentabilidad */}
          <Select value={filtroRentabilidad} onValueChange={setFiltroRentabilidad}>
            <SelectTrigger className="h-9 w-40">
              <SelectValue placeholder="Rentabilidad" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todas">Todas</SelectItem>
              <SelectItem value="alta">🟢 Alta</SelectItem>
              <SelectItem value="media">🟡 Media</SelectItem>
              <SelectItem value="baja">🔴 Baja</SelectItem>
            </SelectContent>
          </Select>

          {/* Filtro Stock */}
          <Select value={filtroStock} onValueChange={setFiltroStock}>
            <SelectTrigger className="h-9 w-40">
              <SelectValue placeholder="Stock" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todos</SelectItem>
              <SelectItem value="disponible">✅ Disponible</SelectItem>
              <SelectItem value="bajo">⚠️ Bajo</SelectItem>
              <SelectItem value="agotado">❌ Agotado</SelectItem>
            </SelectContent>
          </Select>

          {/* Filtro Activo */}
          <Select value={filtroActivo} onValueChange={setFiltroActivo}>
            <SelectTrigger className="h-9 w-36">
              <SelectValue placeholder="Estado" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todos</SelectItem>
              <SelectItem value="activos">Activos</SelectItem>
              <SelectItem value="inactivos">Inactivos</SelectItem>
            </SelectContent>
          </Select>

          {/* Botón Limpiar Filtros */}
          {(busquedaProducto || filtroSubmarca !== 'todas' || filtroCategoria !== 'todas') && (
            <Button
              variant="ghost"
              size="sm"
              className="h-9"
              onClick={() => {
                setBusquedaProducto('');
                setFiltroSubmarca('todas');
                setFiltroCategoria('todas');
                setFiltroRentabilidad('todas');
                setFiltroStock('todos');
                setFiltroActivo('todos');
              }}
            >
              <X className="w-4 h-4 mr-1" />
              Limpiar
            </Button>
          )}
        </div>
      </div>

      {/* Contador de resultados */}
      <div className="mt-2 text-xs text-gray-600">
        Mostrando {productosFiltrados.length} de {productosTotal} productos
      </div>
    </div>

    {/* Tabla de productos */}
    <div className="overflow-x-auto">
      <table className="w-full">
        {/* ... */}
      </table>
    </div>
  </CardContent>
</Card>
```

---

### **6. NUEVA COLUMNA EN TABLA: SUBMARCAS**

#### **Actualizar tabla para mostrar submarcas:**
```jsx
<th className="text-left py-3 px-4 text-xs font-semibold text-gray-600 uppercase tracking-wider">
  Submarcas
</th>

{/* En tbody */}
<td className="py-3 px-4">
  <div className="flex flex-wrap gap-1">
    <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200 text-xs">
      🍕 Modomio
    </Badge>
    <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-200 text-xs">
      🍔 BlackBurger
    </Badge>
  </div>
</td>
```

---

## ✅ RESUMEN DE CAMBIOS

### **UX:**
1. ✅ Eliminar barra de búsqueda superior
2. ✅ Eliminar botón de filtros superior
3. ✅ Añadir filtros integrados dentro de la tabla (con scroll horizontal)
4. ✅ Búsqueda como filtro integrado
5. ✅ Contador de resultados filtrados

### **Arquitectura:**
1. ✅ Nueva tabla: `PRODUCTO_SUBMARCA` (relación N:M)
2. ✅ Campo `pvp_submarca` para precios personalizados
3. ✅ Campo `activo_en_submarca` para visibilidad
4. ✅ Campo `destacado` para promociones
5. ✅ Campo `orden_menu` para ordenación personalizada
6. ✅ Actualizar `STOCK_PDV` con `id_submarca`
7. ✅ Nueva columna en tabla UI: "Submarcas"

### **Queries:**
1. ✅ Productos por submarca
2. ✅ Submarcas de un producto
3. ✅ Stock por submarca
4. ✅ Precio final (con fallback a pvp_base)

---

## 🚀 PRÓXIMOS PASOS

1. **¿Aprobar arquitectura propuesta?**
   - Tabla `PRODUCTO_SUBMARCA`
   - Lógica de precios personalizados
   - Sistema de visibilidad por submarca

2. **¿Implementar UI con filtros integrados?**
   - Eliminar búsqueda/filtros superiores
   - Añadir filtros dentro de la tabla
   - Scroll horizontal sin barra visible

3. **¿Añadir columna "Submarcas" en tabla?**
   - Mostrar badges con submarcas asignadas
   - Click para filtrar por submarca

---

**¿Te parece bien esta propuesta? ¿Algún ajuste antes de implementar?** 🤔
