# 🏗️ ARQUITECTURA FINAL: PRODUCTOS CON SUBMARCAS Y CANALES

## 📊 ESTRUCTURA DE DATOS COMPLETA

### **1. TABLA: `PRODUCTO` (Master)**
```typescript
PRODUCTO {
  id_producto: string (PK)         // "PRD-001"
  nombre: string                   // "Croissant Mantequilla"
  descripcion_corta: string
  descripcion_larga: string
  categoria: string                // "Bollería"
  subcategoria: string            // "Pastelería Francesa"
  
  // Precios BASE (referencia)
  pvp_base: number                // €2.50 (precio de referencia)
  iva: number                     // 10%
  escandallo_unitario: number     // €0.85
  margen_porcentaje: number       // 66%
  rentabilidad: 'Alta' | 'Media' | 'Baja'
  
  // Características
  alergenos: string[]             // ["gluten", "lactosa"]
  etiquetas: string[]             // ["saludable", "vegano", "premium"]
  vida_util_horas: number         // 48
  
  // Visibilidad
  imagen_url: string
  activo_global: boolean          // Si false, no aparece en NINGUNA submarca
  visible_tpv: boolean
  visible_app: boolean
  
  // Metadata
  fecha_creacion: Date
  fecha_actualizacion: Date
  ranking_ventas: number
}
```

---

### **2. TABLA: `PRODUCTO_SUBMARCA` (Relación N:M)**
**Define qué productos están en qué submarcas y su precio BASE por submarca**

```typescript
PRODUCTO_SUBMARCA {
  id: string (PK)
  id_producto: string (FK → PRODUCTO)
  id_submarca: string (FK → SUBMARCA)
  
  // ========================================
  // PRECIO BASE DE LA SUBMARCA
  // ========================================
  // Este es el precio "estándar" del producto en esta submarca
  // Si null, usa PRODUCTO.pvp_base
  pvp_submarca: number | null     
  
  // Ejemplo:
  // - Coca-Cola en Modomio: €2.00
  // - Coca-Cola en BlackBurger: €2.50
  
  // ========================================
  // PERSONALIZACIÓN POR SUBMARCA
  // ========================================
  nombre_personalizado: string | null    // Si null, usa PRODUCTO.nombre
  descripcion_personalizada: string | null
  imagen_personalizada: string | null
  
  // ========================================
  // CONTROL DE VISIBILIDAD
  // ========================================
  activo_en_submarca: boolean            // ¿Visible en esta submarca?
  destacado: boolean                     // ¿Aparece en destacados?
  orden_menu: number                     // Orden en el menú digital
  
  // ========================================
  // STOCK DEDICADO (opcional)
  // ========================================
  stock_dedicado: boolean                // ¿Stock independiente por submarca?
  
  // Metadata
  fecha_asignacion: Date
  fecha_ultima_actualizacion: Date
}
```

**LÓGICA DE PRECIO:**
```javascript
// Precio final de un producto en una submarca
const precioSubmarca = producto_submarca.pvp_submarca ?? producto.pvp_base;
```

---

### **3. TABLA: `PRECIO_CANAL` (Precios por Canal de Venta)**
**Define precios específicos para canales de delivery (Glovo, Uber Eats, etc.)**

```typescript
PRECIO_CANAL {
  id: string (PK)
  id_producto: string (FK → PRODUCTO)
  id_submarca: string (FK → SUBMARCA)
  canal_slug: string              // 'tpv', 'online', 'glovo', 'uber_eats', 'just_eat'
  
  // ========================================
  // PRECIO Y COMISIÓN POR CANAL
  // ========================================
  pvp_canal: number               // Precio FINAL en este canal
  comision_porcentaje: number     // % comisión del canal (ej: Glovo 30%)
  margen_neto: number             // Margen después de comisión
  
  // Ejemplo:
  // Pizza Margarita en Modomio
  // - TPV: €9.50 (sin comisión)
  // - Glovo: €11.50 (comisión 30%)
  // - Uber Eats: €11.00 (comisión 25%)
  
  // ========================================
  // CONTROL DE VISIBILIDAD
  // ========================================
  activo_en_canal: boolean        // ¿Disponible en este canal?
  stock_disponible: number | null // Stock dedicado para este canal
  
  // ========================================
  // INCREMENTOS AUTOMÁTICOS
  // ========================================
  incremento_automatico: boolean  // ¿Aplicar incremento automático?
  formula_incremento: string      // "pvp_submarca * 1.20" o "pvp_submarca + 2"
  
  // Metadata
  fecha_activacion: Date
  fecha_ultima_actualizacion: Date
}
```

**LÓGICA DE PRECIO COMPLETA:**
```javascript
// 1. Precio base del producto
const precioBase = producto.pvp_base; // €9.50

// 2. Precio en la submarca (si existe)
const precioSubmarca = producto_submarca.pvp_submarca ?? precioBase; // €9.50

// 3. Precio en el canal (si existe)
const precioCanal = precio_canal?.pvp_canal ?? precioSubmarca; // €11.50 (Glovo)

// PRECIO FINAL
const precioFinal = precioCanal; // €11.50
```

---

### **4. TABLA: `SUBMARCA`**
```typescript
SUBMARCA {
  id_submarca: string (PK)         // "SUB-001"
  id_marca: string (FK → MARCA)    // "MRC-001" (HoyPecamos)
  nombre: string                   // "Modomio" o "BlackBurger"
  slug: string                     // "modomio"
  tipo: 'pizza' | 'burger' | 'cafe' | 'postres' | 'otro'
  
  // Branding
  color_primario: string           // "#ED1C24"
  color_secundario: string         // "#000000"
  logo_url: string
  
  // Estado
  activo: boolean
  fecha_creacion: Date
}
```

---

### **5. TABLA: `STOCK_PDV` (con Submarca)**
```typescript
STOCK_PDV {
  id: string (PK)
  id_producto: string (FK → PRODUCTO)
  id_submarca: string (FK → SUBMARCA)  // ← NUEVO
  pdv_id: string (FK → PUNTO_VENTA)
  
  stock_actual: number
  stock_max: number
  stock_min: number
  activo_en_pdv: boolean
  
  ultima_actualizacion: Date
}
```

---

## 🎯 CASOS DE USO COMPLETOS

### **Caso 1: Producto en múltiples submarcas, mismo precio base**
```typescript
// Pizza Margarita
PRODUCTO {
  id_producto: "PRD-123",
  nombre: "Pizza Margarita",
  pvp_base: 9.50
}

PRODUCTO_SUBMARCA [
  {
    id_producto: "PRD-123",
    id_submarca: "SUB-001", // Modomio
    pvp_submarca: null,     // Usa €9.50
    activo_en_submarca: true
  },
  {
    id_producto: "PRD-123",
    id_submarca: "SUB-002", // BlackBurger
    pvp_submarca: 10.00,    // Precio diferente: €10.00
    activo_en_submarca: true
  }
]

// Sin PRECIO_CANAL → Usa pvp_submarca en todos los canales
// TPV Modomio: €9.50
// TPV BlackBurger: €10.00
```

---

### **Caso 2: Producto con precios diferentes por canal**
```typescript
// Pizza Margarita en Modomio
PRODUCTO_SUBMARCA {
  id_producto: "PRD-123",
  id_submarca: "SUB-001", // Modomio
  pvp_submarca: 9.50      // Precio base en Modomio
}

PRECIO_CANAL [
  {
    id_producto: "PRD-123",
    id_submarca: "SUB-001",
    canal_slug: "tpv",
    pvp_canal: 9.50,       // Precio TPV
    comision_porcentaje: 0,
    activo_en_canal: true
  },
  {
    id_producto: "PRD-123",
    id_submarca: "SUB-001",
    canal_slug: "glovo",
    pvp_canal: 11.50,      // Precio Glovo (+€2)
    comision_porcentaje: 30,
    margen_neto: 8.05,     // 11.50 - 30% = 8.05
    activo_en_canal: true
  },
  {
    id_producto: "PRD-123",
    id_submarca: "SUB-001",
    canal_slug: "uber_eats",
    pvp_canal: 11.00,      // Precio Uber Eats
    comision_porcentaje: 25,
    margen_neto: 8.25,     // 11.00 - 25% = 8.25
    activo_en_canal: true
  }
]

// RESUMEN:
// Pizza Margarita en Modomio:
// - TPV: €9.50 (margen: €7.65)
// - Glovo: €11.50 (margen neto: €8.05 después de comisión)
// - Uber Eats: €11.00 (margen neto: €8.25)
```

---

### **Caso 3: Producto exclusivo de submarca, sin Glovo**
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
    pvp_submarca: null,     // Usa €12.50
    activo_en_submarca: true
  }
  // No hay entrada para Modomio → No aparece ahí
]

PRECIO_CANAL [
  {
    id_producto: "PRD-789",
    id_submarca: "SUB-002",
    canal_slug: "tpv",
    pvp_canal: 12.50,
    activo_en_canal: true
  },
  {
    id_producto: "PRD-789",
    id_submarca: "SUB-002",
    canal_slug: "glovo",
    pvp_canal: 14.50,      // +€2 en Glovo
    comision_porcentaje: 30,
    activo_en_canal: true
  }
  // No hay entrada para uber_eats → No disponible ahí
]
```

---

## 📊 CONSULTAS SQL CLAVE

### **Query 1: Obtener productos de una submarca con precios por canal**
```sql
SELECT 
  p.id_producto,
  p.nombre,
  p.categoria,
  p.pvp_base,
  
  -- Precio en la submarca
  COALESCE(ps.pvp_submarca, p.pvp_base) as precio_submarca,
  
  -- Precios por canal
  pc_tpv.pvp_canal as precio_tpv,
  pc_glovo.pvp_canal as precio_glovo,
  pc_uber.pvp_canal as precio_uber_eats,
  
  -- Márgenes
  pc_glovo.margen_neto as margen_glovo,
  pc_uber.margen_neto as margen_uber,
  
  -- Submarca info
  s.nombre as submarca_nombre
  
FROM PRODUCTO p
INNER JOIN PRODUCTO_SUBMARCA ps ON p.id_producto = ps.id_producto
INNER JOIN SUBMARCA s ON ps.id_submarca = s.id_submarca

-- Precios por canal (LEFT JOIN porque pueden no existir)
LEFT JOIN PRECIO_CANAL pc_tpv 
  ON p.id_producto = pc_tpv.id_producto 
  AND ps.id_submarca = pc_tpv.id_submarca 
  AND pc_tpv.canal_slug = 'tpv'
  
LEFT JOIN PRECIO_CANAL pc_glovo 
  ON p.id_producto = pc_glovo.id_producto 
  AND ps.id_submarca = pc_glovo.id_submarca 
  AND pc_glovo.canal_slug = 'glovo'
  
LEFT JOIN PRECIO_CANAL pc_uber 
  ON p.id_producto = pc_uber.id_producto 
  AND ps.id_submarca = pc_uber.id_submarca 
  AND pc_uber.canal_slug = 'uber_eats'

WHERE ps.id_submarca = 'SUB-001' 
  AND ps.activo_en_submarca = true
  AND p.activo_global = true
ORDER BY ps.orden_menu;
```

---

### **Query 2: Calcular precio final para una venta**
```sql
-- Función para obtener precio final
CREATE FUNCTION obtener_precio_venta(
  p_id_producto VARCHAR,
  p_id_submarca VARCHAR,
  p_canal_slug VARCHAR
) RETURNS DECIMAL(10,2) AS $$
DECLARE
  v_precio_canal DECIMAL(10,2);
  v_precio_submarca DECIMAL(10,2);
  v_precio_base DECIMAL(10,2);
BEGIN
  -- 1. Intentar obtener precio del canal
  SELECT pvp_canal INTO v_precio_canal
  FROM PRECIO_CANAL
  WHERE id_producto = p_id_producto
    AND id_submarca = p_id_submarca
    AND canal_slug = p_canal_slug
    AND activo_en_canal = true;
  
  IF v_precio_canal IS NOT NULL THEN
    RETURN v_precio_canal;
  END IF;
  
  -- 2. Si no existe, obtener precio de submarca
  SELECT COALESCE(pvp_submarca, (SELECT pvp_base FROM PRODUCTO WHERE id_producto = p_id_producto))
  INTO v_precio_submarca
  FROM PRODUCTO_SUBMARCA
  WHERE id_producto = p_id_producto
    AND id_submarca = p_id_submarca;
  
  RETURN v_precio_submarca;
END;
$$ LANGUAGE plpgsql;

-- Uso:
SELECT obtener_precio_venta('PRD-123', 'SUB-001', 'glovo'); -- €11.50
SELECT obtener_precio_venta('PRD-123', 'SUB-001', 'tpv');   -- €9.50
```

---

### **Query 3: Listar submarcas de un producto con sus precios**
```sql
SELECT 
  s.nombre as submarca,
  COALESCE(ps.pvp_submarca, p.pvp_base) as precio_base,
  
  -- Canales disponibles
  STRING_AGG(
    CASE 
      WHEN pc.canal_slug IS NOT NULL 
      THEN pc.canal_slug || ':€' || pc.pvp_canal 
    END, 
    ', '
  ) as canales_disponibles
  
FROM PRODUCTO_SUBMARCA ps
INNER JOIN SUBMARCA s ON ps.id_submarca = s.id_submarca
INNER JOIN PRODUCTO p ON ps.id_producto = p.id_producto
LEFT JOIN PRECIO_CANAL pc 
  ON ps.id_producto = pc.id_producto 
  AND ps.id_submarca = pc.id_submarca
  AND pc.activo_en_canal = true
  
WHERE ps.id_producto = 'PRD-123'
GROUP BY s.nombre, ps.pvp_submarca, p.pvp_base;

-- Resultado:
-- Modomio | €9.50 | tpv:€9.50, glovo:€11.50, uber_eats:€11.00
-- BlackBurger | €10.00 | tpv:€10.00
```

---

## 🎨 UI: COLUMNA "SUBMARCAS" EN TABLA

### **Mockup Visual:**
```
┌────────────┬──────────────────┬────────────────────────────┬──────┐
│ PRD        │ Descripción      │ Submarcas                  │ PVP  │
├────────────┼──────────────────┼────────────────────────────┼──────┤
│ PRD-123    │ Pizza Margarita  │ [🍕 Modomio €9.50]         │ €9.50│
│            │                  │ [🍔 BlackBurger €10.00]    │      │
├────────────┼──────────────────┼────────────────────────────┼──────┤
│ PRD-456    │ Coca-Cola 330ml  │ [🍕 Modomio €2.00]         │ €2.50│
│            │                  │ [🍔 BlackBurger €2.50]     │      │
├────────────┼──────────────────┼────────────────────────────┼──────┤
│ PRD-789    │ BlackBurger Clás │ [🍔 BlackBurger €12.50]    │€12.50│
└────────────┴──────────────────┴────────────────────────────┴──────┘
```

### **Componente React:**
```jsx
<td className="py-3 px-4">
  <div className="flex flex-wrap gap-1.5">
    {producto.submarcas.map((submarca) => (
      <Badge 
        key={submarca.id}
        variant="outline" 
        className={cn(
          "text-xs cursor-pointer hover:shadow-md transition-all",
          submarca.slug === 'modomio' 
            ? "bg-purple-50 text-purple-700 border-purple-200" 
            : "bg-orange-50 text-orange-700 border-orange-200"
        )}
        onClick={() => setFiltroSubmarca(submarca.slug)}
      >
        {submarca.icono} {submarca.nombre}
        <span className="ml-1 font-semibold">
          €{submarca.precio_en_submarca}
        </span>
      </Badge>
    ))}
    
    {/* Tooltip con precios por canal */}
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Info className="w-3.5 h-3.5 text-gray-400 cursor-help" />
        </TooltipTrigger>
        <TooltipContent className="max-w-xs">
          <div className="space-y-2 text-xs">
            <p className="font-semibold">Precios por canal:</p>
            {producto.precios_canal.map((pc) => (
              <div key={pc.canal} className="flex justify-between gap-4">
                <span>{pc.canal_nombre}:</span>
                <span className="font-semibold">€{pc.pvp_canal}</span>
              </div>
            ))}
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  </div>
</td>
```

---

## ✅ RESUMEN ARQUITECTURA FINAL

### **Jerarquía de Precios (Cascada):**
```
1. PRODUCTO.pvp_base (€9.50)
   ↓ Si existe
2. PRODUCTO_SUBMARCA.pvp_submarca (€10.00)
   ↓ Si existe
3. PRECIO_CANAL.pvp_canal (€11.50)

PRECIO FINAL = El más específico disponible
```

### **Tablas Creadas:**
- ✅ `PRODUCTO` - Producto master
- ✅ `PRODUCTO_SUBMARCA` - Relación N:M con precios por submarca
- ✅ `PRECIO_CANAL` - Precios específicos por canal de venta
- ✅ `SUBMARCA` - Modomio, BlackBurger, etc.
- ✅ `STOCK_PDV` - Stock por producto, submarca y PDV

### **Ventajas:**
- ✅ Flexibilidad total: 1 producto → N submarcas → M canales
- ✅ Precios en cascada con fallback automático
- ✅ Control de márgenes netos por canal (después de comisiones)
- ✅ Visibilidad independiente por submarca y canal
- ✅ Trazabilidad completa de precios

---

## 🚀 SIGUIENTE PASO: IMPLEMENTACIÓN UI

Ahora voy a implementar:
1. ✅ Eliminar barra de búsqueda + botón filtros superior
2. ✅ Añadir filtros integrados en tabla (scroll horizontal)
3. ✅ Añadir columna "Submarcas" con badges
4. ✅ Click en badge para filtrar por submarca

**¿Todo correcto? Procedo con la implementación** 🚀
