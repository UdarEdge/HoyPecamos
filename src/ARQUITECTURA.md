# 🏗️ Arquitectura Técnica - Udar Edge

## 📐 Stack Tecnológico

### **Frontend**
- **React 18** + **TypeScript**
- **Tailwind CSS 4.0** para estilos
- **React Router** para navegación
- **Context API** para estado global
- **Custom Hooks** para lógica reutilizable

### **Backend**
- **Supabase** (PostgreSQL + Edge Functions)
- **Hono** (Web server en Deno)
- **KV Store** para almacenamiento clave-valor
- **Supabase Auth** para autenticación

### **Deployment**
- **Vercel** (Frontend + CDN)
- **Supabase** (Backend + Database)

---

## 🎯 Arquitectura de Tres Capas

```
┌─────────────────────────────────────────────────┐
│           FRONTEND (Vercel)                     │
│  - React Components                             │
│  - Context API (Estado)                         │
│  - Custom Hooks                                 │
│  - Tailwind CSS                                 │
└─────────────────┬───────────────────────────────┘
                  │
                  │ HTTPS + Auth Token
                  │
┌─────────────────▼───────────────────────────────┐
│        BACKEND (Supabase Edge Functions)        │
│  - Hono Web Server                              │
│  - API REST Endpoints                           │
│  - Authentication & Authorization               │
│  - Business Logic                               │
└─────────────────┬───────────────────────────────┘
                  │
                  │ SQL + KV Store
                  │
┌─────────────────▼───────────────────────────────┐
│         DATABASE (Supabase)                     │
│  - PostgreSQL (KV Store)                        │
│  - Row Level Security                           │
│  - Real-time Subscriptions                     │
│  - Storage (Blob/Files)                         │
└─────────────────────────────────────────────────┘
```

---

## 🗂️ Estructura de Archivos

```
/
├── supabase/
│   └── functions/
│       └── server/
│           ├── index.tsx         # Servidor Hono principal
│           └── kv_store.tsx      # Utilidades KV (protegido)
│
├── utils/
│   ├── supabase/
│   │   ├── info.tsx             # Config de Supabase (protegido)
│   │   └── client.tsx           # Cliente Supabase + helpers
│   └── migracion.tsx            # Scripts de migración
│
├── services/
│   └── api.tsx                  # Servicios API (CRUD)
│
├── hooks/
│   └── useAuth.tsx              # Hook de autenticación
│
├── contexts/
│   ├── ProductosContext.tsx     # Estado de productos
│   ├── PedidosContext.tsx       # Estado de pedidos
│   └── AuthContext.tsx          # Estado de autenticación (próximo)
│
├── components/
│   ├── SupabaseTest.tsx         # Panel de pruebas
│   └── ...                      # Otros componentes
│
├── App.tsx                      # Componente principal
├── VERCEL_DEPLOY.md            # Guía de deployment
└── ARQUITECTURA.md             # Este archivo
```

---

## 🔐 Autenticación y Autorización

### **Flow de Autenticación**

```
1. Usuario → Login/Signup
        ↓
2. Frontend → POST /auth/login (email, password)
        ↓
3. Supabase Auth → Validar credenciales
        ↓
4. Backend → Retornar access_token + user data
        ↓
5. Frontend → Guardar token en memoria + Context
        ↓
6. Requests → Authorization: Bearer {access_token}
```

### **Roles de Usuario**

- **Cliente**: Ver productos, hacer pedidos, ver historial
- **Trabajador**: Gestionar pedidos, actualizar estados, ver inventario
- **Gerente**: Acceso completo, dashboard, reportes, configuración

### **Row Level Security (RLS)**

Cada recurso está protegido por el `marcaId` del usuario:

```sql
-- Ejemplo conceptual (no ejecutar, solo ilustrativo)
CREATE POLICY "Users see only their tenant data"
ON productos
FOR SELECT
USING (marcaId = auth.jwt() ->> 'marcaId');
```

---

## 📊 Modelo de Datos (KV Store)

### **Estructura de Claves**

```
# Usuarios
usuario:{userId}                    → User data
usuario:marca:{marcaId}:{userId}    → Index por marca
usuario:rol:{rol}:{userId}          → Index por rol

# Marcas/Empresas
marca:{marcaId}                     → Marca data

# Productos
producto:{productoId}               → Producto data
producto:marca:{marcaId}:{prodId}   → Index por marca

# Pedidos
pedido:{pedidoId}                   → Pedido data
pedido:usuario:{userId}:{pedidoId}  → Index por usuario
pedido:marca:{marcaId}:{pedidoId}   → Index por marca

# Proveedores
proveedor:{proveedorId}             → Proveedor data
proveedor:marca:{marcaId}:{provId}  → Index por marca

# Planes
plan:{planId}                       → Plan data
plan:marca:{marcaId}:{planId}       → Index por marca

# Configuración White Label
config:{marcaId}                    → Config por tenant
```

### **Ejemplo de Datos**

```json
// usuario:abc123
{
  "id": "abc123",
  "email": "cliente@modommio.com",
  "nombre": "Juan Pérez",
  "rol": "cliente",
  "marcaId": "MRC-001",
  "activo": true,
  "createdAt": "2025-12-26T10:00:00Z"
}

// producto:mod-prem-001
{
  "id": "mod-prem-001",
  "nombre": "Premium Barbacoa",
  "categoria": "Pizzas Premium",
  "precio": 15.50,
  "stock": 25,
  "marcas_ids": ["MRC-001"],
  "imagen": "https://...",
  "activo": true,
  "createdAt": "2025-12-26T10:00:00Z"
}

// pedido:PED-1735210000
{
  "id": "PED-1735210000",
  "userId": "abc123",
  "marcaId": "MRC-001",
  "productos": [
    { "id": "mod-prem-001", "cantidad": 2, "precio": 15.50 }
  ],
  "total": 31.00,
  "estado": "pendiente",
  "createdAt": "2025-12-26T11:00:00Z"
}
```

---

## 🔄 APIs y Endpoints

### **Base URL**
```
https://{projectId}.supabase.co/functions/v1/make-server-ae2ba659
```

### **Autenticación**

```bash
POST /auth/signup
POST /auth/login
```

### **Marcas/Empresas**

```bash
POST   /marcas              # Crear marca
GET    /marcas              # Listar todas
GET    /marcas/:id          # Obtener por ID
PUT    /marcas/:id          # Actualizar
```

### **Productos**

```bash
POST   /productos                  # Crear producto
GET    /productos/:id              # Obtener por ID
GET    /productos/marca/:marcaId   # Listar por marca
PUT    /productos/:id              # Actualizar
DELETE /productos/:id              # Eliminar
```

### **Pedidos**

```bash
POST   /pedidos                      # Crear pedido
GET    /pedidos/usuario/:userId      # Listar por usuario
GET    /pedidos/marca/:marcaId       # Listar por marca
PUT    /pedidos/:id                  # Actualizar estado
```

### **Proveedores**

```bash
POST   /proveedores                  # Crear proveedor
GET    /proveedores/marca/:marcaId   # Listar por marca
PUT    /proveedores/:id              # Actualizar
```

### **Planes**

```bash
POST   /planes                       # Crear plan
GET    /planes/marca/:marcaId        # Listar por marca
```

### **Configuración**

```bash
POST   /config/:marcaId              # Guardar config
GET    /config/:marcaId              # Obtener config
```

---

## 🎨 Sistema White Label

### **Detección de Tenant**

```tsx
// Por URL
const marcaSlug = window.location.pathname.split('/')[1];

// Por dominio
const subdomain = window.location.hostname.split('.')[0];

// Por parámetro
const marcaId = new URLSearchParams(window.location.search).get('marca');
```

### **Configuración Dinámica**

```tsx
// Cargar config desde backend
const config = await configAPI.get(marcaId);

// Aplicar colores
document.documentElement.style.setProperty('--color-primary', config.colorPrimario);
document.documentElement.style.setProperty('--color-secondary', config.colorSecundario);

// Aplicar logo
<img src={config.logoUrl} alt={config.nombre} />
```

---

## 🚀 Performance y Optimización

### **Frontend**
- ✅ Code splitting por rutas
- ✅ Lazy loading de componentes
- ✅ Memoización con useMemo/useCallback
- ✅ Imágenes optimizadas (Unsplash CDN)
- ✅ CSS minificado (Tailwind)

### **Backend**
- ✅ Índices en KV Store por marca/usuario
- ✅ Caché de configuración White Label
- ✅ Conexiones pool a base de datos
- ✅ CORS optimizado

### **Vercel CDN**
- ✅ Assets estáticos cacheados
- ✅ Edge Functions (próximamente)
- ✅ Compresión Gzip/Brotli
- ✅ HTTP/2 + HTTP/3

---

## 📱 Responsive Design

### **Breakpoints**
```css
/* Mobile First */
360px - 390px  → Mobile
391px - 768px  → Tablet
769px - 1024px → Laptop
1025px+        → Desktop
```

### **Estrategia**
- Base: Mobile (360-390px)
- Media queries para tablets y desktop
- Touch-friendly targets (44px mínimo)
- Gestos móviles (swipe, tap, hold)

---

## 🔮 Roadmap Técnico

### **Fase 1: Migración Backend** ✅
- [x] Conectar Supabase
- [x] Crear API REST completa
- [x] Sistema de autenticación
- [x] Migración de datos

### **Fase 2: Integración Frontend** (Próxima)
- [ ] Reemplazar LocalStorage con API calls
- [ ] Implementar useAuth en componentes
- [ ] Real-time con Supabase subscriptions
- [ ] Manejo de errores y loading states

### **Fase 3: Features Avanzadas**
- [ ] Notificaciones push
- [ ] Pagos con Stripe/PayPal
- [ ] Chat en tiempo real
- [ ] Analytics y reportes

### **Fase 4: Producción**
- [ ] Deploy en Vercel
- [ ] Dominios personalizados
- [ ] SSL y seguridad
- [ ] Monitoreo y alertas

---

## 🛡️ Seguridad

### **Implementado**
- ✅ HTTPS en todas las conexiones
- ✅ JWT tokens para autenticación
- ✅ Validación server-side
- ✅ CORS configurado
- ✅ Email auto-confirmado (sin servidor SMTP)

### **Recomendaciones**
- ⚠️ Implementar rate limiting
- ⚠️ Sanitización de inputs
- ⚠️ Logs de auditoría
- ⚠️ Backup automático de datos
- ⚠️ 2FA para gerentes

---

## 📞 Contacto y Soporte

**Documentación Oficial:**
- Supabase: https://supabase.com/docs
- Vercel: https://vercel.com/docs
- Hono: https://hono.dev
- React: https://react.dev

---

🔴⚫ **Udar Edge - Arquitectura Multiempresa Escalable**
