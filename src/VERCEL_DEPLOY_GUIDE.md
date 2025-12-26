# 🚀 GUÍA DE DEPLOY EN VERCEL - UDAR EDGE

## ✅ **ESTADO: LISTO PARA DEPLOY**

---

## 📋 **PRE-REQUISITOS**

Antes de empezar, asegúrate de tener:

✅ Cuenta en [Vercel](https://vercel.com) (gratis)  
✅ Cuenta en [Supabase](https://supabase.com) (ya configurada)  
✅ Repositorio Git con el código (GitHub, GitLab, Bitbucket)  
✅ Variables de entorno de Supabase disponibles

---

## 🔧 **PASO 1: PREPARAR EL REPOSITORIO GIT**

### **1.1 Crear repositorio en GitHub**

```bash
# En tu terminal local
git init
git add .
git commit -m "🚀 Initial commit - Udar Edge App"
git branch -M main
git remote add origin https://github.com/TU_USUARIO/udar-edge.git
git push -u origin main
```

### **1.2 Archivos importantes para Vercel**

✅ **Ya incluidos en el proyecto:**
- `/App.tsx` - Componente principal
- `/index.html` - HTML base
- `/styles/globals.css` - Estilos globales
- `/supabase/functions/server/index.tsx` - Backend API

---

## 🌐 **PASO 2: CONFIGURAR VERCEL**

### **2.1 Conectar con Vercel**

1. Ve a [vercel.com](https://vercel.com)
2. Click en **"Add New Project"**
3. **Import Git Repository**
4. Selecciona tu repositorio `udar-edge`
5. Click en **"Import"**

### **2.2 Configuración del Proyecto**

**Framework Preset:** React (Vite)

**Build & Output Settings:**
```
Framework: Vite
Build Command: (automático)
Output Directory: dist
Install Command: (automático)
```

### **2.3 Configurar Variables de Entorno**

En Vercel Dashboard → Settings → Environment Variables, añade:

```env
# ⚠️ CRÍTICO: Variables de Supabase
VITE_SUPABASE_URL=https://vpvbrnlpseqtzgpozfhp.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZwdmJybmxwc2VxdHpncG96ZmhwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjYzMjU1ODAsImV4cCI6MjA4MTkwMTU4MH0.VVO8xbApUS61M6upOCju-psgMwAuXN3qRgomRahjU8Q

# 🔒 Variables del Servidor (Supabase ya las tiene)
SUPABASE_URL=https://vpvbrnlpseqtzgpozfhp.supabase.co
SUPABASE_ANON_KEY=(igual que arriba)
SUPABASE_SERVICE_ROLE_KEY=(obtener de Supabase Dashboard)
```

**🔴 IMPORTANTE:** 
- Las variables con `VITE_` son para el frontend
- Las variables sin `VITE_` son para el backend (Supabase Edge Functions)

---

## 🎯 **PASO 3: DEPLOY**

### **3.1 Desplegar**

1. Click en **"Deploy"** en Vercel
2. Espera 2-3 minutos
3. Vercel construirá y desplegará tu app

### **3.2 Verificar el Deploy**

Una vez completado, verás:

```
✅ Production: https://udar-edge.vercel.app
✅ Preview: https://udar-edge-git-main.vercel.app
```

---

## 🧪 **PASO 4: PROBAR LA APLICACIÓN**

### **4.1 Acceder a la App**

1. Abre `https://udar-edge.vercel.app` (tu URL de Vercel)
2. Deberías ver la pantalla de Login de **HoyPecamos**
3. El badge superior izquierdo debe mostrar **☁️ Supabase** (verde)

### **4.2 Probar Funcionalidades Clave**

**✅ Test de Conexión:**
```
1. En pantalla de Login
2. Click en botón 🧪 (esquina inferior derecha)
3. Click en "Test Conexión"
4. Resultado esperado: ✅ Conexión exitosa
```

**✅ Crear Usuario de Prueba:**
```
1. Click en "Registrarse"
2. Completa el formulario:
   - Email: test@hoypecamos.com
   - Password: Test123456!
   - Nombre: Usuario Test
   - Rol: Cliente
3. Click en "Crear cuenta"
4. Deberías ser redirigido al dashboard de Cliente
```

**✅ Verificar Productos:**
```
1. Ve a "Tienda" o "Catálogo"
2. Deberías ver los 116 productos migrados
3. Click en cualquier producto
4. Añade al carrito
5. Procede al checkout
```

**✅ Crear Pedido:**
```
1. Completa el checkout
2. El pedido debería guardarse en Supabase
3. Ve a "Mis Pedidos"
4. Deberías ver tu pedido
```

---

## 🔧 **PASO 5: CONFIGURACIÓN AVANZADA (OPCIONAL)**

### **5.1 Dominio Personalizado**

En Vercel Dashboard:

1. Settings → Domains
2. Add Domain: `app.hoypecamos.com`
3. Sigue las instrucciones de DNS

### **5.2 Configurar Supabase Edge Functions**

Las Edge Functions ya están desplegadas en Supabase. Para verificar:

```bash
# URL del servidor
https://vpvbrnlpseqtzgpozfhp.supabase.co/functions/v1/make-server-ae2ba659

# Test de conexión
curl https://vpvbrnlpseqtzgpozfhp.supabase.co/functions/v1/make-server-ae2ba659/health
```

### **5.3 Habilitar CORS en Vercel**

Si tienes problemas de CORS, añade `vercel.json`:

```json
{
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        { "key": "Access-Control-Allow-Origin", "value": "*" },
        { "key": "Access-Control-Allow-Methods", "value": "GET,POST,PUT,DELETE,OPTIONS" },
        { "key": "Access-Control-Allow-Headers", "value": "Content-Type, Authorization" }
      ]
    }
  ]
}
```

---

## 📊 **PASO 6: MONITOREO Y LOGS**

### **6.1 Ver Logs en Vercel**

1. Vercel Dashboard → Tu Proyecto
2. **Deployments** → Click en el deployment
3. **Functions** → Ver logs de las funciones
4. **Runtime Logs** → Ver errores en tiempo real

### **6.2 Ver Logs en Supabase**

1. Supabase Dashboard → Edge Functions
2. Click en `make-server-ae2ba659`
3. **Logs** → Ver todas las peticiones

---

## 🎨 **CONFIGURACIÓN WHITE LABEL**

### **Cambiar Tenant (HoyPecamos ↔ Modommio)**

En la app desplegada:

1. Ve a `/public/tenant-switcher.html`
2. O usa el hook `useTenant()` en código:

```typescript
import { useTenant } from './hooks/useTenant';

function MiComponente() {
  const { tenant, cambiarTenant } = useTenant();
  
  return (
    <button onClick={() => cambiarTenant('hoypecamos')}>
      Cambiar a HoyPecamos
    </button>
  );
}
```

---

## 🔴 **PROBLEMAS COMUNES Y SOLUCIONES**

### **❌ Error: "Supabase URL is not defined"**

**Solución:**
```
1. Vercel Dashboard → Settings → Environment Variables
2. Verifica que VITE_SUPABASE_URL esté configurada
3. Redeploy: Deployments → ... → Redeploy
```

### **❌ Error: "No se pueden cargar productos"**

**Solución:**
```
1. Verifica que los 116 productos estén en Supabase
2. Panel de pruebas → "Obtener Marcas"
3. Si está vacío → "Migrar 116 Productos"
```

### **❌ Error: "CORS policy blocked"**

**Solución:**
```
1. Crear archivo /vercel.json con configuración CORS
2. Commit y push
3. Vercel re-desplegará automáticamente
```

### **❌ Badge muestra "💾 Local" en lugar de "☁️ Supabase"**

**Solución:**
```
1. Verifica las variables de entorno en Vercel
2. Asegúrate que VITE_SUPABASE_URL y VITE_SUPABASE_ANON_KEY estén configuradas
3. Redeploy
```

---

## 📱 **CONFIGURACIÓN PARA MOBILE (PWA)**

La app ya está configurada como PWA. Para instalar en móvil:

### **Android:**
1. Abre Chrome en tu móvil
2. Ve a `https://udar-edge.vercel.app`
3. Menu (⋮) → "Añadir a pantalla de inicio"

### **iOS:**
1. Abre Safari en tu iPhone
2. Ve a `https://udar-edge.vercel.app`
3. Botón "Compartir" → "Añadir a pantalla de inicio"

---

## 🎉 **¡DEPLOY COMPLETADO!**

### **URLs Importantes:**

| Servicio | URL |
|----------|-----|
| **App en Producción** | `https://udar-edge.vercel.app` |
| **Backend API** | `https://vpvbrnlpseqtzgpozfhp.supabase.co/functions/v1/make-server-ae2ba659` |
| **Supabase Dashboard** | `https://supabase.com/dashboard/project/vpvbrnlpseqtzgpozfhp` |
| **Vercel Dashboard** | `https://vercel.com/dashboard` |

### **Credenciales de Prueba:**

```
Email: test@hoypecamos.com
Password: Test123456!
Rol: Cliente
```

---

## 📞 **SOPORTE**

Si tienes problemas:

1. **Vercel Logs:** Dashboard → Deployments → Runtime Logs
2. **Supabase Logs:** Dashboard → Edge Functions → Logs
3. **Browser Console:** F12 → Console (para errores de frontend)
4. **Panel de Pruebas:** Botón 🧪 en Login para debugging

---

## 🚀 **PRÓXIMOS PASOS**

Una vez desplegado y probado:

1. ✅ Configurar dominio personalizado
2. ✅ Añadir usuarios reales en Supabase Auth
3. ✅ Migrar más datos si es necesario
4. ✅ Configurar Google Analytics (opcional)
5. ✅ Configurar email de bienvenida (Supabase Auth)
6. ✅ Habilitar notificaciones push (opcional)

---

**Estado:** ✅ LISTO PARA DEPLOY  
**Última actualización:** 26 de diciembre de 2024  
**Version:** 1.0.0
