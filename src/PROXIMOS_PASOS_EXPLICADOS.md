# 🚀 PRÓXIMOS PASOS - EXPLICACIÓN DETALLADA

## 📚 ÍNDICE

1. [Integrar modal de importación en Configuración](#1-integrar-modal-de-importación)
2. [Conectar menú "Ver escandallo" con datos reales](#2-conectar-ver-escandallo)
3. [Implementar activación/desactivación real de productos](#3-activardesactivar-productos)
4. [Guardar eventos de analytics en base de datos](#4-analytics-y-seguimiento)

---

## 1️⃣ INTEGRAR MODAL DE IMPORTACIÓN

### **📖 ¿Qué es?**

Actualmente el botón "Importar" ha sido eliminado del header de Productos. Este paso consiste en mover toda la funcionalidad de importación a una nueva ubicación dentro del menú de Configuración.

### **🎯 Objetivo**

Centralizar todas las herramientas de administración del sistema (importaciones, exportaciones, configuraciones) en un solo lugar, siguiendo las mejores prácticas de UX.

### **📍 Ubicación propuesta**

```
Dashboard Gerente
  └─ Configuración ⚙️
      └─ Sistema
          └─ Importaciones 📥
              ├─ Importar Productos (CSV/Excel)
              ├─ Importar Clientes
              ├─ Importar Proveedores
              └─ Historial de Importaciones
```

### **💡 Ejemplo visual**

**Pantalla "Configuración > Sistema > Importaciones":**

```
┌──────────────────────────────────────────────────┐
│  ⚙️ CONFIGURACIÓN > SISTEMA > IMPORTACIONES      │
├──────────────────────────────────────────────────┤
│                                                  │
│  📦 IMPORTAR PRODUCTOS                           │
│  ┌────────────────────────────────────────────┐ │
│  │ 1️⃣ Subir archivo (CSV/Excel)               │ │
│  │ 2️⃣ Previsualizar datos                     │ │
│  │ 3️⃣ Confirmar importación                   │ │
│  └────────────────────────────────────────────┘ │
│                                                  │
│  [📥 Descargar Plantilla CSV]                   │
│  [📂 Seleccionar archivo...]                    │
│                                                  │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  │
│                                                  │
│  📊 HISTORIAL DE IMPORTACIONES                  │
│  ┌────────────────────────────────────────────┐ │
│  │ 25/12/2024 - 150 productos - ✅ Exitoso    │ │
│  │ 20/12/2024 - 80 productos  - ✅ Exitoso    │ │
│  │ 15/12/2024 - 45 productos  - ⚠️ 3 errores │ │
│  └────────────────────────────────────────────┘ │
│                                                  │
└──────────────────────────────────────────────────┘
```

### **🔧 Implementación técnica**

```tsx
// Nuevo componente: /components/gerente/ConfiguracionImportaciones.tsx

export function ConfiguracionImportaciones() {
  const [modalImportar, setModalImportar] = useState(false);
  const [historialImportaciones, setHistorialImportaciones] = useState([]);

  return (
    <div className="p-6">
      <h2>Importaciones</h2>
      
      {/* Sección de importar productos */}
      <Card>
        <CardHeader>
          <h3>📦 Importar Productos</h3>
        </CardHeader>
        <CardContent>
          <Button onClick={() => setModalImportar(true)}>
            📥 Iniciar Importación
          </Button>
        </CardContent>
      </Card>

      {/* Historial */}
      <Card className="mt-4">
        <CardHeader>
          <h3>📊 Historial de Importaciones</h3>
        </CardHeader>
        <CardContent>
          {/* Lista de importaciones previas */}
        </CardContent>
      </Card>

      {/* Modal existente */}
      <ModalImportarProductos 
        open={modalImportar}
        onClose={() => setModalImportar(false)}
      />
    </div>
  );
}
```

### **✅ Beneficios**

- ✅ Organización más clara del sistema
- ✅ Historial de todas las importaciones realizadas
- ✅ Facilita el seguimiento de errores
- ✅ Permite configuraciones adicionales (validaciones, mapeos, etc.)

---

## 2️⃣ CONECTAR "VER ESCANDALLO" CON DATOS REALES

### **📖 ¿Qué es un escandallo?**

Un **escandallo** es el desglose detallado de todos los ingredientes y costes que componen un producto final.

**Ejemplo:** Escandallo de "Croissant de Mantequilla"

```
┌─────────────────────────────────────────────┐
│  🥐 ESCANDALLO: Croissant de Mantequilla    │
├─────────────────────────────────────────────┤
│                                             │
│  📋 INGREDIENTES:                           │
│  ┌───────────────────────────────────────┐ │
│  │ Ingrediente     Cantidad    Coste     │ │
│  ├───────────────────────────────────────┤ │
│  │ Harina          250g        €0.15     │ │
│  │ Mantequilla     100g        €0.45     │ │
│  │ Levadura        10g         €0.05     │ │
│  │ Sal             5g          €0.01     │ │
│  │ Azúcar          20g         €0.03     │ │
│  │ Leche           50ml        €0.04     │ │
│  │ Huevo           1 unidad    €0.12     │ │
│  └───────────────────────────────────────┘ │
│                                             │
│  💰 RESUMEN:                                │
│  • Coste Total: €0.85                      │
│  • Precio Venta: €2.50                     │
│  • Margen: €1.65 (66%)                     │
│  • Rentabilidad: ALTA ✅                   │
│                                             │
└─────────────────────────────────────────────┘
```

### **🎯 Objetivo**

Actualmente, cuando haces click en "Ver escandallo" solo aparece un mensaje genérico:

```javascript
toast.info('Abriendo escandallo...');
```

El objetivo es abrir un **modal completo** que muestre:
- Lista de ingredientes
- Cantidades necesarias
- Coste de cada ingrediente
- Coste total
- Precio de venta
- Margen de beneficio

### **🗄️ Estructura de datos necesaria**

**Tabla PRODUCTO_INGREDIENTE (Base de datos):**

```sql
CREATE TABLE PRODUCTO_INGREDIENTE (
  id UUID PRIMARY KEY,
  id_producto VARCHAR(10) REFERENCES PRODUCTO(id_producto),
  id_ingrediente VARCHAR(10) REFERENCES INGREDIENTE(id_ingrediente),
  cantidad DECIMAL(10, 3), -- Cantidad necesaria (ej: 250 gramos)
  unidad_medida VARCHAR(10), -- 'g', 'ml', 'unidades', etc.
  coste_unitario DECIMAL(10, 2), -- Coste del ingrediente
  coste_total DECIMAL(10, 2), -- cantidad * coste_unitario
  created_at TIMESTAMP DEFAULT NOW()
);
```

**Ejemplo de datos:**

```javascript
// Escandallo del PRD-001 (Croissant)
[
  {
    id_ingrediente: 'ING-001',
    nombre: 'Harina de trigo',
    cantidad: 250,
    unidad: 'g',
    coste_unitario: 0.60, // €0.60 por kg
    coste_total: 0.15 // 250g * €0.60/1000g
  },
  {
    id_ingrediente: 'ING-002',
    nombre: 'Mantequilla francesa',
    cantidad: 100,
    unidad: 'g',
    coste_unitario: 4.50, // €4.50 por kg
    coste_total: 0.45
  },
  // ... más ingredientes
]
```

### **🔧 Implementación técnica**

```tsx
// Nuevo componente: /components/gerente/ModalEscandallo.tsx

export function ModalEscandallo({ producto, open, onClose }) {
  const [escandallo, setEscandallo] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (open && producto) {
      // 📡 Llamada al backend
      fetch(`/api/productos/${producto.id}/escandallo`)
        .then(res => res.json())
        .then(data => {
          setEscandallo(data.ingredientes);
          setLoading(false);
        });
    }
  }, [open, producto]);

  const costeTotal = escandallo.reduce((sum, ing) => sum + ing.coste_total, 0);
  const margen = producto.pvp - costeTotal;
  const porcentajeMargen = (margen / producto.pvp) * 100;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <h2>🥐 Escandallo: {producto.nombre}</h2>
        </DialogHeader>

        {loading ? (
          <div>Cargando...</div>
        ) : (
          <>
            {/* Tabla de ingredientes */}
            <Table>
              <thead>
                <tr>
                  <th>Ingrediente</th>
                  <th>Cantidad</th>
                  <th>Coste Unit.</th>
                  <th>Coste Total</th>
                </tr>
              </thead>
              <tbody>
                {escandallo.map(ing => (
                  <tr key={ing.id_ingrediente}>
                    <td>{ing.nombre}</td>
                    <td>{ing.cantidad} {ing.unidad}</td>
                    <td>€{ing.coste_unitario.toFixed(2)}</td>
                    <td>€{ing.coste_total.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </Table>

            {/* Resumen */}
            <div className="bg-gray-50 p-4 rounded">
              <h3>💰 Resumen</h3>
              <p>Coste Total: €{costeTotal.toFixed(2)}</p>
              <p>Precio Venta: €{producto.pvp.toFixed(2)}</p>
              <p>Margen: €{margen.toFixed(2)} ({porcentajeMargen.toFixed(0)}%)</p>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
```

### **🔗 Endpoint del backend**

```typescript
// /supabase/functions/server/index.tsx

app.get('/make-server-ae2ba659/productos/:id/escandallo', async (c) => {
  const idProducto = c.req.param('id');
  
  // Consultar escandallo desde base de datos
  const escandallo = await kv.get(`escandallo:${idProducto}`);
  
  // O consultar de tabla relacional:
  // const { data } = await supabase
  //   .from('PRODUCTO_INGREDIENTE')
  //   .select(`
  //     *,
  //     ingrediente:INGREDIENTE(nombre, unidad_medida)
  //   `)
  //   .eq('id_producto', idProducto);
  
  return c.json({
    id_producto: idProducto,
    ingredientes: escandallo || [],
    coste_total: escandallo?.reduce((sum, i) => sum + i.coste_total, 0)
  });
});
```

### **✅ Beneficios**

- ✅ El gerente puede ver el desglose real de costes
- ✅ Permite identificar productos poco rentables
- ✅ Facilita la toma de decisiones de precios
- ✅ Ayuda a negociar con proveedores

---

## 3️⃣ ACTIVAR/DESACTIVAR PRODUCTOS (REAL)

### **📖 ¿Qué es?**

Actualmente, cuando haces click en "Desactivar" solo se muestra un toast:

```javascript
toast.success('Producto desactivado');
```

Pero el producto **NO se desactiva realmente** en la base de datos.

### **🎯 Objetivo**

Implementar la funcionalidad completa para que al hacer click en "Desactivar":

1. ✅ Se actualice el estado en la base de datos
2. ✅ El producto desaparezca de las apps/TPV activos
3. ✅ Se registre quién y cuándo lo desactivó
4. ✅ Se pueda reactivar posteriormente

### **🗄️ Estructura de datos**

**Opción 1: Campo en tabla PRODUCTO**

```sql
ALTER TABLE PRODUCTO ADD COLUMN activo_global BOOLEAN DEFAULT TRUE;
```

**Opción 2: Tabla STOCK_PDV (desactivar por PDV)**

```sql
CREATE TABLE STOCK_PDV (
  id UUID PRIMARY KEY,
  id_producto VARCHAR(10) REFERENCES PRODUCTO(id_producto),
  id_pdv VARCHAR(10) REFERENCES PDV(id_pdv),
  cantidad_stock INTEGER,
  activo_en_pdv BOOLEAN DEFAULT TRUE, -- ← Control por punto de venta
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### **💡 Ejemplo de flujo**

**Caso 1: Desactivar producto globalmente**

```
1. Gerente hace click en "Desactivar" para PRD-001
   ↓
2. Se abre un modal de confirmación:
   ┌────────────────────────────────────────┐
   │ ⚠️ ¿Desactivar "Croissant"?            │
   │                                        │
   │ El producto dejará de estar visible   │
   │ en:                                    │
   │ • App móvil de clientes               │
   │ • TPV de puntos de venta              │
   │ • Plataformas de delivery             │
   │                                        │
   │ Podrás reactivarlo cuando quieras.    │
   │                                        │
   │ [Cancelar]  [✓ Confirmar Desactivar]  │
   └────────────────────────────────────────┘
   ↓
3. Usuario confirma
   ↓
4. Se ejecuta la actualización:
   UPDATE PRODUCTO 
   SET activo_global = FALSE, 
       updated_by = 'gerente-001',
       updated_at = NOW()
   WHERE id_producto = 'PRD-001';
   ↓
5. Se muestra confirmación:
   🎉 "Croissant desactivado correctamente"
   ↓
6. La fila se actualiza visualmente (opacidad 60%, color gris)
```

**Caso 2: Desactivar producto solo en un PDV**

```
1. Gerente filtra por PDV "Centro"
   ↓
2. Desactiva "Croissant" solo en ese PDV
   ↓
3. Se actualiza:
   UPDATE STOCK_PDV
   SET activo_en_pdv = FALSE
   WHERE id_producto = 'PRD-001' 
     AND id_pdv = 'PDV-CENTRO';
   ↓
4. El producto sigue activo en otros PDVs
```

### **🔧 Implementación técnica**

**Frontend:**

```tsx
// En el menú dropdown de acciones

<DropdownMenuItem 
  onClick={(e) => {
    e.stopPropagation();
    
    // 1. Mostrar modal de confirmación
    setProductoADesactivar(producto);
    setModalConfirmDesactivar(true);
  }}
  className="text-red-600"
>
  <PowerOff className="w-4 h-4 mr-2" />
  Desactivar
</DropdownMenuItem>

// Modal de confirmación
<Dialog open={modalConfirmDesactivar} onOpenChange={setModalConfirmDesactivar}>
  <DialogContent>
    <DialogHeader>
      <h3>⚠️ ¿Desactivar "{productoADesactivar?.nombre}"?</h3>
    </DialogHeader>
    
    <p>El producto dejará de estar visible en:</p>
    <ul>
      <li>• App móvil de clientes</li>
      <li>• TPV de puntos de venta</li>
      <li>• Plataformas de delivery</li>
    </ul>
    
    <DialogFooter>
      <Button variant="ghost" onClick={() => setModalConfirmDesactivar(false)}>
        Cancelar
      </Button>
      <Button 
        variant="destructive"
        onClick={async () => {
          // 2. Llamada al backend
          await desactivarProducto(productoADesactivar.id);
          
          // 3. Actualizar UI
          setModalConfirmDesactivar(false);
          toast.success(`${productoADesactivar.nombre} desactivado correctamente`);
          
          // 4. Recargar lista de productos
          refetchProductos();
        }}
      >
        ✓ Confirmar Desactivar
      </Button>
    </DialogFooter>
  </DialogContent>
</Dialog>
```

**Backend:**

```typescript
// /supabase/functions/server/index.tsx

app.patch('/make-server-ae2ba659/productos/:id/desactivar', async (c) => {
  const idProducto = c.req.param('id');
  const { id_gerente } = await c.req.json();
  
  // Obtener producto actual
  const producto = await kv.get(`producto:${idProducto}`);
  
  if (!producto) {
    return c.json({ error: 'Producto no encontrado' }, 404);
  }
  
  // Actualizar estado
  producto.activo_global = false;
  producto.updated_by = id_gerente;
  producto.updated_at = new Date().toISOString();
  
  // Guardar en base de datos
  await kv.set(`producto:${idProducto}`, producto);
  
  // 📊 Registrar evento (analytics)
  await kv.set(`evento:desactivacion:${Date.now()}`, {
    tipo: 'PRODUCTO_DESACTIVADO',
    id_producto: idProducto,
    id_gerente: id_gerente,
    timestamp: new Date().toISOString()
  });
  
  return c.json({
    success: true,
    mensaje: `Producto ${idProducto} desactivado correctamente`,
    producto: producto
  });
});

// Endpoint para REACTIVAR
app.patch('/make-server-ae2ba659/productos/:id/activar', async (c) => {
  const idProducto = c.req.param('id');
  const { id_gerente } = await c.req.json();
  
  const producto = await kv.get(`producto:${idProducto}`);
  producto.activo_global = true;
  producto.updated_by = id_gerente;
  producto.updated_at = new Date().toISOString();
  
  await kv.set(`producto:${idProducto}`, producto);
  
  return c.json({
    success: true,
    mensaje: `Producto ${idProducto} activado correctamente`
  });
});
```

### **✅ Beneficios**

- ✅ Control real sobre qué productos se muestran
- ✅ Permite ocultar productos temporalmente sin eliminarlos
- ✅ Registro de quién hizo cada cambio (auditoría)
- ✅ Flexibilidad para desactivar por PDV específico

---

## 4️⃣ ANALYTICS: GUARDAR EVENTOS EN BASE DE DATOS

### **📖 ¿Qué son los "eventos de analytics"?**

Los **eventos de analytics** son registros de las acciones que los usuarios realizan en la aplicación. Actualmente, solo se muestran en la consola del navegador:

```javascript
console.log('📤 EVENTO: PRODUCTO_VISUALIZADO', { id_producto: 'PRD-001' });
```

**Guardar estos eventos en la base de datos** significa registrarlos de forma permanente para poder analizarlos después.

### **🎯 ¿Para qué sirve?**

**Ejemplo real:**

Imagina que eres el gerente de HoyPecamos y quieres saber:

1. **¿Qué productos revisan más mis trabajadores?**
   ```
   → Si el Croissant se visualiza 50 veces/día pero solo se vende 10
   → Puede indicar problemas de stock, precio, o confusión
   ```

2. **¿A qué hora se consultan más los escandallos?**
   ```
   → Si se consultan mucho antes de abrir
   → Indica que los empleados están verificando costes
   → Quizás necesitan capacitación
   ```

3. **¿Cuántas veces se desactivan productos por semana?**
   ```
   → Si se desactivan muchos productos los viernes
   → Puede indicar problemas de inventario
   → O planificación de fin de semana
   ```

4. **¿Qué gerente/trabajador es más activo?**
   ```
   → Usuario A: 200 acciones/día
   → Usuario B: 20 acciones/día
   → Permite medir productividad
   ```

### **🗄️ Estructura de datos**

**Tabla EVENTOS_ANALYTICS:**

```sql
CREATE TABLE EVENTOS_ANALYTICS (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tipo_evento VARCHAR(50) NOT NULL, -- 'PRODUCTO_VISUALIZADO', 'ESCANDALLO_VISUALIZADO', etc.
  
  -- Quién hizo la acción
  id_usuario VARCHAR(10), -- Puede ser gerente, trabajador, cliente
  tipo_usuario VARCHAR(20), -- 'gerente', 'trabajador', 'cliente'
  
  -- Qué elemento se afectó
  id_producto VARCHAR(10),
  id_pdv VARCHAR(10),
  id_submarca VARCHAR(10),
  
  -- Contexto de la acción
  metadata JSONB, -- Datos adicionales flexibles
  
  -- Cuándo ocurrió
  timestamp TIMESTAMP DEFAULT NOW(),
  fecha DATE GENERATED ALWAYS AS (DATE(timestamp)) STORED, -- Para queries por fecha
  hora TIME GENERATED ALWAYS AS (TIME(timestamp)) STORED, -- Para análisis por hora
  
  -- Desde dónde se hizo
  device VARCHAR(20), -- 'desktop', 'mobile', 'tablet'
  navegador VARCHAR(50),
  ip_address INET
);

-- Índices para búsquedas rápidas
CREATE INDEX idx_eventos_tipo ON EVENTOS_ANALYTICS(tipo_evento);
CREATE INDEX idx_eventos_usuario ON EVENTOS_ANALYTICS(id_usuario);
CREATE INDEX idx_eventos_fecha ON EVENTOS_ANALYTICS(fecha);
CREATE INDEX idx_eventos_producto ON EVENTOS_ANALYTICS(id_producto);
```

### **📊 Ejemplos de eventos registrados**

**Evento 1: Usuario visualiza producto**

```json
{
  "id": "evt-001",
  "tipo_evento": "PRODUCTO_VISUALIZADO",
  "id_usuario": "GER-001",
  "tipo_usuario": "gerente",
  "id_producto": "PRD-001",
  "metadata": {
    "nombre_producto": "Croissant Mantequilla",
    "vista": "tabla",
    "filtro_activo": "submarca:modomio"
  },
  "timestamp": "2024-12-27T10:30:45Z",
  "device": "desktop",
  "navegador": "Chrome 120"
}
```

**Evento 2: Usuario consulta escandallo**

```json
{
  "id": "evt-002",
  "tipo_evento": "ESCANDALLO_VISUALIZADO",
  "id_usuario": "TRA-005",
  "tipo_usuario": "trabajador",
  "id_producto": "PRD-004",
  "id_pdv": "PDV-CENTRO",
  "metadata": {
    "nombre_producto": "Tarta de Chocolate",
    "coste_escandallo": 2.80,
    "pvp": 5.50,
    "margen": 2.70
  },
  "timestamp": "2024-12-27T08:15:22Z",
  "device": "mobile",
  "navegador": "Safari iOS"
}
```

**Evento 3: Producto desactivado**

```json
{
  "id": "evt-003",
  "tipo_evento": "PRODUCTO_DESACTIVADO",
  "id_usuario": "GER-001",
  "tipo_usuario": "gerente",
  "id_producto": "PRD-015",
  "metadata": {
    "nombre_producto": "Empanada Atún",
    "motivo": "Falta de stock",
    "activo_global": false,
    "stock_antes": 0
  },
  "timestamp": "2024-12-27T16:45:10Z",
  "device": "desktop",
  "navegador": "Firefox 121"
}
```

### **🔧 Implementación técnica**

**Frontend: Función helper para registrar eventos**

```typescript
// /utils/analytics.ts

export async function registrarEvento(
  tipoEvento: string,
  datos: {
    id_producto?: string;
    id_pdv?: string;
    metadata?: any;
  }
) {
  // 1. Obtener información del usuario actual
  const usuario = obtenerUsuarioActual(); // desde contexto/localStorage
  
  // 2. Detectar dispositivo
  const device = window.innerWidth < 768 ? 'mobile' : 'desktop';
  
  // 3. Enviar al backend
  try {
    await fetch('/api/analytics/eventos', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        tipo_evento: tipoEvento,
        id_usuario: usuario.id,
        tipo_usuario: usuario.rol, // 'gerente', 'trabajador', 'cliente'
        id_producto: datos.id_producto,
        id_pdv: datos.id_pdv,
        metadata: datos.metadata,
        device: device,
        navegador: navigator.userAgent
      })
    });
  } catch (error) {
    // No bloquear la UI si falla el analytics
    console.error('Error registrando evento:', error);
  }
}
```

**Uso en el código:**

```tsx
// Cuando se hace click en una fila de producto
<tr onClick={() => {
  // Registrar evento
  registrarEvento('PRODUCTO_VISUALIZADO', {
    id_producto: 'PRD-001',
    metadata: {
      nombre_producto: 'Croissant',
      vista: 'tabla',
      filtro_activo: filtroSubmarca
    }
  });
  
  // Abrir modal
  setModalVerProducto(true);
}}>
```

**Backend: Endpoint para guardar eventos**

```typescript
// /supabase/functions/server/index.tsx

app.post('/make-server-ae2ba659/analytics/eventos', async (c) => {
  const evento = await c.req.json();
  
  // Generar ID único
  const idEvento = `evt-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  
  // Guardar en base de datos
  await kv.set(`evento:${idEvento}`, {
    id: idEvento,
    tipo_evento: evento.tipo_evento,
    id_usuario: evento.id_usuario,
    tipo_usuario: evento.tipo_usuario,
    id_producto: evento.id_producto,
    id_pdv: evento.id_pdv,
    metadata: evento.metadata,
    timestamp: new Date().toISOString(),
    device: evento.device,
    navegador: evento.navegador
  });
  
  // También guardar en lista por tipo para consultas rápidas
  const eventosPorTipo = await kv.getByPrefix(`eventos:${evento.tipo_evento}:`) || [];
  eventosPorTipo.push(idEvento);
  await kv.set(`eventos:${evento.tipo_evento}:${new Date().toISOString().split('T')[0]}`, eventosPorTipo);
  
  return c.json({ success: true, id: idEvento });
});
```

### **📊 Consultas y Dashboards**

**Consulta 1: Productos más vistos hoy**

```typescript
app.get('/make-server-ae2ba659/analytics/productos-mas-vistos', async (c) => {
  const hoy = new Date().toISOString().split('T')[0];
  const eventos = await kv.getByPrefix(`eventos:PRODUCTO_VISUALIZADO:${hoy}`);
  
  // Contar por producto
  const conteo = {};
  eventos.forEach(evt => {
    conteo[evt.id_producto] = (conteo[evt.id_producto] || 0) + 1;
  });
  
  // Ordenar por más vistos
  const ranking = Object.entries(conteo)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10);
  
  return c.json({
    fecha: hoy,
    productos_mas_vistos: ranking.map(([id, views]) => ({ id, views }))
  });
});

// Respuesta:
// {
//   "fecha": "2024-12-27",
//   "productos_mas_vistos": [
//     { "id": "PRD-001", "views": 45 },
//     { "id": "PRD-002", "views": 32 },
//     { "id": "PRD-004", "views": 28 }
//   ]
// }
```

**Dashboard visual:**

```
┌──────────────────────────────────────────────────┐
│  📊 ANALYTICS - PRODUCTOS                        │
├──────────────────────────────────────────────────┤
│                                                  │
│  🏆 TOP 5 PRODUCTOS MÁS VISTOS HOY              │
│  ┌────────────────────────────────────────────┐ │
│  │ 1. Croissant        █████████████  45 views│ │
│  │ 2. Café Espresso    █████████      32 views│ │
│  │ 3. Tarta Chocolate  ████████       28 views│ │
│  │ 4. Pan Integral     ██████         22 views│ │
│  │ 5. Bocadillo Jamón  █████          18 views│ │
│  └────────────────────────────────────────────┘ │
│                                                  │
│  ⏰ HORAS PICO DE ACTIVIDAD                     │
│  ┌────────────────────────────────────────────┐ │
│  │ 08:00-10:00  ████████  Alto                │ │
│  │ 10:00-12:00  ███       Medio               │ │
│  │ 12:00-14:00  ██████    Alto                │ │
│  │ 14:00-16:00  ██        Bajo                │ │
│  └────────────────────────────────────────────┘ │
│                                                  │
│  👥 USUARIOS MÁS ACTIVOS                        │
│  • Gerente María: 85 acciones                   │
│  • Trabajador Juan: 62 acciones                 │
│  • Trabajador Ana: 45 acciones                  │
│                                                  │
└──────────────────────────────────────────────────┘
```

### **✅ Beneficios**

**Para el Gerente:**
- ✅ Saber qué productos generan más interés
- ✅ Identificar patrones de uso del sistema
- ✅ Medir productividad del equipo
- ✅ Detectar problemas (ej: muchas desactivaciones = problemas de stock)

**Para el Negocio:**
- ✅ Decisiones basadas en datos reales
- ✅ Optimizar inventario según consultas
- ✅ Identificar productos "estrella"
- ✅ Mejorar la formación del personal

**Ejemplo de insight real:**

```
📊 INSIGHT DETECTADO:

El producto "Croissant" (PRD-001) tiene:
• 50 visualizaciones/día
• 10 consultas de escandallo/día
• Solo 15 ventas/día

🔍 Análisis:
Los trabajadores lo consultan mucho pero no se vende bien.

💡 Posible causa:
• Precio muy alto (€2.50)
• Confusión en la presentación
• Falta de stock en horas pico

✅ Acción recomendada:
Revisar precio y disponibilidad
```

---

## 🎯 RESUMEN DE PRÓXIMOS PASOS

| Paso | Complejidad | Tiempo estimado | Prioridad |
|------|-------------|-----------------|-----------|
| 1. Modal de importación | 🟢 Baja | 2-3 horas | Media |
| 2. Ver escandallo | 🟡 Media | 4-6 horas | Alta |
| 3. Activar/Desactivar | 🟡 Media | 3-4 horas | Alta |
| 4. Analytics | 🔴 Alta | 6-8 horas | Baja* |

*Baja prioridad inicial, pero alto valor a largo plazo

---

## 📚 GLOSARIO DE TÉRMINOS

| Término | Significado |
|---------|-------------|
| **Escandallo** | Desglose de ingredientes y costes de un producto |
| **Analytics** | Análisis de datos de uso de la aplicación |
| **Evento** | Acción que realiza un usuario (click, visualización, etc.) |
| **Metadata** | Datos adicionales que acompañan a un evento |
| **KV Store** | Base de datos clave-valor para almacenar datos |
| **Endpoint** | URL del backend que recibe/envía datos |
| **Timestamp** | Marca de tiempo exacta (fecha y hora) |
| **PDV** | Punto De Venta (tienda física) |

---

**¿Queda todo más claro? ¿Hay algo específico que quieras profundizar o implementar primero?** 😊
