# 🎯 Sistema de Canales de Venta - Udar Edge

## 📋 Descripción

Sistema completo y escalable para gestionar canales de venta dinámicos en la aplicación SaaS Udar Edge. Permite al gerente añadir, modificar y gestionar canales de venta (TPV, Online, WhatsApp, Marketplace, etc.) sin necesidad de modificar código.

---

## 🏗️ Arquitectura

### **3 Capas Independientes**

```
┌──────────────────────────────────────────────┐
│ CAPA 1: CANALES DE VENTA                    │
│ (Concepto de negocio - dónde se vende)      │
├──────────────────────────────────────────────┤
│ • TPV (Tienda Física)                       │
│ • Online (App/Web)                          │
│ • WhatsApp                                  │
│ • Marketplace                               │
│ • Telefónico                                │
│ • ... (configurables)                       │
└──────────────────────────────────────────────┘
                    ⬇️
┌──────────────────────────────────────────────┐
│ CAPA 2: INTEGRACIONES                       │
│ (Implementación técnica - cómo se conecta)  │
├──────────────────────────────────────────────┤
│ WhatsApp → WhatsApp Business API            │
│           → Twilio WhatsApp                 │
│           → Wassenger                       │
│                                             │
│ Marketplace → Glovo API                     │
│             → Uber Eats API                 │
│             → Just Eat API                  │
└──────────────────────────────────────────────┘
                    ⬇️
┌──────────────────────────────────────────────┐
│ CAPA 3: AGENTES EXTERNOS (independiente)    │
│ (Gestión documental con terceros)          │
├──────────────────────────────────────────────┤
│ • Proveedores                               │
│ • Gestorías                                 │
│ • Auditores                                 │
│ ⚠️ NO se mezcla con Canales de Venta        │
└──────────────────────────────────────────────┘
```

---

## 📁 Archivos Creados/Modificados

### **Nuevos Archivos**

1. **`/utils/canales-venta.ts`**
   - Sistema base de gestión de canales
   - Hook `useCanalesVenta()`
   - Tipos e interfaces
   - Funciones CRUD
   - LocalStorage + Supabase (sistema híbrido)

2. **`/components/gerente/ConfiguracionCanalesVenta.tsx`**
   - Interfaz de gestión de canales
   - CRUD completo
   - Reordenamiento drag & drop
   - Activar/desactivar canales
   - Plantillas predefinidas

3. **`/CANALES_VENTA_README.md`**
   - Documentación completa del sistema

### **Archivos Modificados**

1. **`/components/gerente/ClientesGerente.tsx`**
   - Importa `useCanalesVenta`
   - Filtro de canal dinámico (lee desde configuración)
   - Tipo `filtroCanal` cambiado de enum a `string`

2. **`/components/gerente/ConfiguracionGerente.tsx`**
   - Importa `ConfiguracionCanalesVenta`
   - Añade botón "Canales de Venta" en subfiltro Sistema
   - Renderiza componente en subfiltro

---

## 🎨 Características Implementadas

### **✅ Gestión de Canales**

- ✅ Crear canal personalizado o desde plantilla
- ✅ Editar nombre, icono, color, descripción
- ✅ Activar/desactivar canales
- ✅ Reordenar con botones arriba/abajo
- ✅ Eliminar canales (excepto nativos)
- ✅ Validación de slugs únicos
- ✅ Protección de canales nativos (TPV, Online)

### **✅ Plantillas Predefinidas**

- 📱 WhatsApp
- ☎️ Telefónico
- 🏢 Corporativo (B2B)
- 📧 Email
- 📣 Redes Sociales

### **✅ Canales por Defecto**

- 🏪 TPV (Tienda Física) - Nativo
- 🌐 Online (App/Web) - Nativo
- 📦 Marketplace (Delivery) - Externo

### **✅ Integración con Filtros**

- Filtro dinámico en ClientesGerente
- Muestra solo canales activos
- Iconos y colores personalizados
- Opción "Todos los canales"

---

## 🔧 Uso del Sistema

### **1. Configurar Canales de Venta**

```
Gerente → Configuración → Sistema → Canales de Venta
```

**Acciones disponibles:**
- `+ Añadir Canal` → Crear nuevo canal
- `Editar` (icono lápiz) → Modificar canal existente
- `Activar/Desactivar` (switch) → Cambiar estado
- `Eliminar` (icono basura) → Borrar canal (no nativos)
- `↑ ↓` → Reordenar posición

### **2. Usar en Filtros (Clientes/Productos)**

```
Gerente → Clientes → Filtro "Canales"
```

Los canales aparecen automáticamente en el selector de filtros.

---

## 💾 Almacenamiento

### **LocalStorage (actual)**

```javascript
// Canales
localStorage.getItem('udar_canales_venta')

// Integraciones
localStorage.getItem('udar_integraciones_canales')
```

### **Supabase (próximamente)**

```sql
-- Tabla: canales_venta
CREATE TABLE canales_venta (
  id TEXT PRIMARY KEY,
  nombre TEXT NOT NULL,
  nombre_corto TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  icono TEXT,
  color TEXT,
  activo BOOLEAN DEFAULT true,
  orden INTEGER,
  tipo TEXT CHECK(tipo IN ('nativo', 'externo')),
  requiere_integracion BOOLEAN DEFAULT false,
  descripcion TEXT,
  integraciones_disponibles TEXT[],
  integracion_activa TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Tabla: integraciones_canales
CREATE TABLE integraciones_canales (
  id TEXT PRIMARY KEY,
  canal_id TEXT REFERENCES canales_venta(id) ON DELETE CASCADE,
  nombre TEXT NOT NULL,
  proveedor TEXT NOT NULL,
  tipo TEXT CHECK(tipo IN ('api', 'webhook', 'nativo', 'manual')),
  estado TEXT CHECK(estado IN ('conectada', 'desconectada', 'error', 'configurando')),
  activo BOOLEAN DEFAULT false,
  config JSONB,
  estadisticas JSONB,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

---

## 📊 Tipos e Interfaces

### **CanalVenta**

```typescript
interface CanalVenta {
  id: string;
  nombre: string;              // "TPV (Tienda Física)"
  nombre_corto: string;         // "TPV"
  slug: string;                 // "tpv"
  icono: string;                // "🏪"
  color: string;                // "#10b981"
  activo: boolean;
  orden: number;
  tipo: 'nativo' | 'externo';
  requiere_integracion: boolean;
  descripcion?: string;
  integraciones_disponibles: string[];
  integracion_activa?: string;
  created_at?: string;
  updated_at?: string;
}
```

### **IntegracionCanal**

```typescript
interface IntegracionCanal {
  id: string;
  canal_id: string;
  nombre: string;               // "WhatsApp Business API"
  proveedor: string;            // "Meta", "Twilio", "Glovo"
  tipo: 'api' | 'webhook' | 'nativo' | 'manual';
  estado: 'conectada' | 'desconectada' | 'error' | 'configurando';
  activo: boolean;
  config: {
    api_key?: string;
    webhook_url?: string;
    [key: string]: any;
  };
  estadisticas?: {
    ultima_sincronizacion?: string;
    pedidos_recibidos_hoy?: number;
    tasa_exito?: number;
  };
  created_at?: string;
  updated_at?: string;
}
```

---

## 🎯 Hook Personalizado

### **useCanalesVenta()**

```typescript
const {
  canales,              // Todos los canales
  canalesActivos,       // Solo canales activos
  integraciones,        // Todas las integraciones
  loading,              // Estado de carga
  refrescar,            // Recargar datos
  
  // Métodos de canales
  crearCanal,
  actualizarCanal,
  eliminarCanal,
  reordenarCanales,
  
  // Métodos de integraciones
  obtenerIntegracionesPorCanal,
  actualizarIntegracion,
  conectarIntegracion,
  desconectarIntegracion
} = useCanalesVenta();
```

---

## 🚀 Próximos Pasos

### **Fase 1: Base** ✅ COMPLETADA
- ✅ Sistema de gestión de canales
- ✅ Componente de configuración
- ✅ Integración con filtros

### **Fase 2: Integraciones** (próximamente)
- ⏳ Componente `IntegracionesCanales.tsx`
- ⏳ Gestión de credenciales API
- ⏳ Webhooks y sincronización
- ⏳ Logs de integraciones

### **Fase 3: Backend** (próximamente)
- ⏳ Rutas Supabase `/canales-venta`
- ⏳ Rutas `/integraciones/:id/conectar`
- ⏳ Sincronización automática
- ⏳ Webhooks de plataformas externas

### **Fase 4: Recepción de Pedidos** (próximamente)
- ⏳ API para recibir pedidos de WhatsApp
- ⏳ API para recibir pedidos de Marketplace
- ⏳ Parser de mensajes automático
- ⏳ Notificaciones en tiempo real

---

## 🔐 Validaciones

- ✅ No se pueden eliminar canales nativos (TPV, Online)
- ✅ No se pueden desactivar canales nativos
- ✅ Slugs deben ser únicos
- ✅ Nombres obligatorios
- ✅ Protección contra duplicados

---

## 🎨 Paleta de Colores

Siguiendo el esquema de "HoyPecamos" (negro y rojo #ED1C24):

- **Botones principales:** `#ED1C24` (rojo)
- **Botones activos:** `#10b981` (teal/verde)
- **Canales TPV:** `#10b981` (verde)
- **Canales Online:** `#3b82f6` (azul)
- **Canales Marketplace:** `#f59e0b` (naranja)
- **Canales WhatsApp:** `#25D366` (verde WhatsApp)
- **Canales Telefónico:** `#6366f1` (índigo)

---

## 📞 Soporte

Para dudas o problemas con el sistema de canales:
1. Revisar esta documentación
2. Verificar la consola del navegador
3. Comprobar LocalStorage: `udar_canales_venta`
4. Reiniciar el hook con `refrescar()`

---

## 🎉 ¡Listo!

El sistema de Canales de Venta está completamente funcional y listo para usar. Ahora puedes:

1. ✅ Añadir nuevos canales sin tocar código
2. ✅ Filtrar clientes y productos por canal
3. ✅ Personalizar iconos y colores
4. ✅ Activar/desactivar según necesidad
5. ✅ Preparar integraciones futuras

---

**Desarrollado con ❤️ para Udar Edge**
