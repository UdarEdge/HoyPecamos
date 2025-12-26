# 🚀 Udar Edge - Sistema SaaS Multiempresa

**Aplicación web progresiva (PWA) para digitalización de negocios de alimentación con gestión completa de pedidos, productos, proveedores y más.**

---

## ⚡ Deploy Rápido en Vercel

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/TU_USUARIO/udar-edge)

### 1️⃣ **Conectar con Vercel**

```bash
# Clonar el repositorio
git clone https://github.com/TU_USUARIO/udar-edge.git
cd udar-edge

# Push a tu repositorio
git remote set-url origin https://github.com/TU_USUARIO/udar-edge.git
git push -u origin main
```

### 2️⃣ **Configurar Variables de Entorno**

En Vercel Dashboard → Settings → Environment Variables:

```env
VITE_SUPABASE_URL=https://vpvbrnlpseqtzgpozfhp.supabase.co
VITE_SUPABASE_ANON_KEY=tu_clave_anonima
```

### 3️⃣ **Deploy**

```
✅ Vercel detectará automáticamente Vite
✅ Build y deploy en 2-3 minutos
✅ URL de producción lista para usar
```

---

## 🎯 **Características Principales**

### **Backend Supabase**
- ✅ API REST completa con 40+ endpoints
- ✅ Autenticación multiusuario (Supabase Auth)
- ✅ Base de datos KV Store (clave-valor)
- ✅ Edge Functions con Hono
- ✅ Sistema híbrido (cloud + local fallback)

### **Frontend React + TypeScript**
- ✅ 3 perfiles: Cliente, Trabajador, Gerente
- ✅ White Label (HoyPecamos & Modommio)
- ✅ TPV avanzado con gestión de caja
- ✅ Sistema de pedidos en tiempo real
- ✅ Gestión de productos, stock y proveedores
- ✅ Dashboard de analíticas y reportes
- ✅ Sistema de cupones y promociones

### **Mobile/PWA**
- ✅ Instalable en Android e iOS
- ✅ Notificaciones push
- ✅ Modo offline con sincronización
- ✅ Responsive design completo

---

## 📊 **Datos Preconfigurados**

✅ **116 productos** migrados (combos, burgers, pizzas, bebidas)  
✅ **2 marcas** configuradas (HoyPecamos & Modommio)  
✅ **Colores de marca** (#000000 y #ED1C24)  
✅ **Categorías** completas de productos  
✅ **Sistema de roles** y permisos

---

## 🧪 **Probar Localmente**

```bash
# Instalar dependencias
npm install

# Configurar variables de entorno
cp .env.example .env
# Editar .env con tus credenciales de Supabase

# Desarrollo
npm run dev

# Build
npm run build

# Preview
npm run preview
```

Abre `http://localhost:5173`

---

## 🎨 **White Label**

Cambiar entre tenants (HoyPecamos ↔ Modommio):

```typescript
import { useTenant } from './hooks/useTenant';

const { tenant, cambiarTenant } = useTenant();

// Cambiar a HoyPecamos
cambiarTenant('hoypecamos');

// Cambiar a Modommio
cambiarTenant('modommio');
```

O accede a: `/public/tenant-switcher.html`

---

## 📖 **Documentación**

- 📘 **[Guía de Deploy en Vercel](./VERCEL_DEPLOY_GUIDE.md)** - Instrucciones completas paso a paso
- 📗 **[Integración Supabase](./INTEGRACION_SUPABASE.md)** - Arquitectura y endpoints
- 📙 **[Guía de Backend](./README_SUPABASE.md)** - Documentación del servidor
- 📕 **[White Label](./README_WHITE_LABEL.md)** - Configuración de marcas

---

## 🔧 **Arquitectura**

```
Frontend (React + Vite)
    ↓ fetch
Backend (Supabase Edge Functions + Hono)
    ↓
Database (Supabase KV Store)
```

### **Endpoints Principales:**

```
GET  /health                    → Health check
POST /auth/signup               → Registro de usuarios
POST /auth/login                → Login
GET  /marcas                    → Obtener marcas
GET  /productos/marca/:marcaId  → Productos por marca
POST /pedidos                   → Crear pedido
GET  /pedidos/marca/:marcaId    → Pedidos por marca
```

**Base URL:** `https://vpvbrnlpseqtzgpozfhp.supabase.co/functions/v1/make-server-ae2ba659`

---

## 🎯 **Flujo de Datos**

1. **Usuario abre la app**
2. **Frontend carga desde Supabase** (con fallback a LocalStorage)
3. **Badge visual indica** ☁️ Supabase o 💾 Local
4. **Cambios se sincronizan** automáticamente con Supabase
5. **LocalStorage actúa como backup** para máxima confiabilidad

---

## 🔒 **Seguridad**

- ✅ Autenticación con Supabase Auth
- ✅ JWT tokens para autorización
- ✅ CORS configurado correctamente
- ✅ Variables de entorno para claves sensibles
- ✅ Service Role Key solo en backend
- ✅ Rate limiting en endpoints críticos

---

## 🧪 **Panel de Pruebas**

En pantalla de Login (esquina inferior derecha):

```
🧪 Panel de Pruebas
  ├─ Test Conexión
  ├─ Crear Marca Test
  ├─ Obtener Marcas
  └─ Migrar 116 Productos
```

---

## 📱 **Instalar como App Móvil**

### **Android:**
1. Chrome → Menu (⋮) → "Añadir a pantalla de inicio"

### **iOS:**
1. Safari → Compartir → "Añadir a pantalla de inicio"

---

## 🎉 **Estado del Proyecto**

| Módulo | Estado |
|--------|--------|
| Backend API | ✅ 100% |
| Frontend Cliente | ✅ 90% |
| Frontend Trabajador | ✅ 85% |
| Frontend Gerente | ✅ 90% |
| Autenticación | ✅ 100% |
| Base de Datos | ✅ 100% |
| White Label | ✅ 100% |
| PWA/Mobile | ✅ 85% |
| Integración Supabase | ✅ 100% |

---

## 🚀 **Próximas Mejoras**

- [ ] Sistema de pagos online (Stripe/PayPal)
- [ ] Notificaciones push en tiempo real
- [ ] Chat interno entre usuarios
- [ ] Integración con agregadores (Glovo, Uber Eats)
- [ ] Sistema de fidelización
- [ ] Dashboard de BI avanzado

---

## 📞 **Soporte**

- 📧 Email: support@udaredge.com
- 💬 GitHub Issues: [github.com/TU_USUARIO/udar-edge/issues](https://github.com/TU_USUARIO/udar-edge/issues)
- 📚 Documentación: `/docs`

---

## 📄 **Licencia**

Copyright © 2024 Udar Edge. Todos los derechos reservados.

---

## 👥 **Créditos**

Desarrollado con ❤️ por el equipo de Udar Edge

**Stack tecnológico:**
- React 18 + TypeScript
- Vite
- Tailwind CSS
- Supabase (Backend as a Service)
- Hono (Web Server)
- shadcn/ui (UI Components)

---

**Version:** 1.0.0  
**Última actualización:** 26 de diciembre de 2024  
**Estado:** ✅ Listo para producción
