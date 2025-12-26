# 🚀 DEPLOY EN VERCEL - PASO A PASO

## **⚡ 5 PASOS PARA DEPLOY EN VERCEL**

---

### **PASO 1: Preparar Repositorio Git** (5 min)

```bash
# En tu terminal
git init
git add .
git commit -m "🚀 Initial commit - Ready for Vercel"
```

**Crear repositorio en GitHub:**
1. Ve a [github.com/new](https://github.com/new)
2. Nombre: `udar-edge`
3. Privado o Público (tu elección)
4. Click "Create repository"

```bash
# Conectar con GitHub
git remote add origin https://github.com/TU_USUARIO/udar-edge.git
git branch -M main
git push -u origin main
```

✅ **Listo! Código en GitHub**

---

### **PASO 2: Conectar con Vercel** (3 min)

1. Ve a [vercel.com](https://vercel.com)
2. Click en **"Add New Project"**
3. Click en **"Import Git Repository"**
4. Selecciona tu repositorio `udar-edge`
5. Click en **"Import"**

✅ **Listo! Proyecto conectado**

---

### **PASO 3: Configurar Variables de Entorno** (2 min)

En la pantalla de configuración, **antes de desplegar**:

1. Scroll hasta **"Environment Variables"**
2. Añade estas 2 variables:

```
VITE_SUPABASE_URL = https://vpvbrnlpseqtzgpozfhp.supabase.co
```

```
VITE_SUPABASE_ANON_KEY = eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZwdmJybmxwc2VxdHpncG96ZmhwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjYzMjU1ODAsImV4cCI6MjA4MTkwMTU4MH0.VVO8xbApUS61M6upOCju-psgMwAuXN3qRgomRahjU8Q
```

✅ **Listo! Variables configuradas**

---

### **PASO 4: Deploy** (2-3 min)

1. Click en **"Deploy"**
2. Espera a que termine (barra de progreso)
3. Verás un 🎉 cuando termine

✅ **Listo! App desplegada**

---

### **PASO 5: Probar la App** (5 min)

Vercel te dará una URL como:
```
https://udar-edge.vercel.app
```

**Prueba estas cosas:**

1. **Abrir la URL** → Deberías ver el splash screen
2. **Login screen** → Pantalla negra/roja de HoyPecamos
3. **Badge superior izquierdo** → Debe decir **"☁️ Supabase"** (verde)
4. **Panel de pruebas** → Click en 🧪 (esquina inferior derecha)
   - Test Conexión → ✅ debe funcionar
   - Obtener Marcas → Debe mostrar "HoyPecamos Test"

✅ **Listo! Todo funciona**

---

## 🎉 **¡FELICITACIONES!**

Tu app está en vivo en:
```
https://udar-edge.vercel.app
```

---

## 📱 **Instalar en Móvil**

**Android (Chrome):**
1. Abre la URL en Chrome
2. Menu (⋮) → "Añadir a pantalla de inicio"

**iOS (Safari):**
1. Abre la URL en Safari
2. Compartir → "Añadir a pantalla de inicio"

---

## 🔧 **Si algo falla...**

### **Badge muestra "💾 Local" en vez de "☁️ Supabase"**

**Solución:**
1. Vercel Dashboard → Tu Proyecto
2. Settings → Environment Variables
3. Verifica que las 2 variables estén ahí
4. Deployments → ... → Redeploy

### **Pantalla blanca / Error 404**

**Solución:**
1. Vercel Dashboard → Tu Proyecto
2. Settings → General
3. Framework Preset: **Vite**
4. Output Directory: **dist**
5. Deployments → ... → Redeploy

### **"No se pueden cargar productos"**

**Solución:**
1. Panel de pruebas (🧪)
2. Click en "Migrar 116 Productos"
3. Espera a que termine
4. Refresca la página

---

## 📊 **URLs Importantes**

| Servicio | URL |
|----------|-----|
| **Tu App** | https://udar-edge.vercel.app |
| **Backend** | https://vpvbrnlpseqtzgpozfhp.supabase.co/functions/v1/make-server-ae2ba659 |
| **Vercel Dashboard** | https://vercel.com/dashboard |
| **Supabase Dashboard** | https://supabase.com/dashboard/project/vpvbrnlpseqtzgpozfhp |

---

## 🎓 **Credenciales de Prueba**

Puedes crear un usuario de prueba:

```
Email: test@hoypecamos.com
Password: Test123456!
Nombre: Usuario Test
Rol: Cliente
```

O registrarte desde la app.

---

## 📞 **¿Necesitas ayuda?**

Revisa la documentación completa:
- 📘 [VERCEL_DEPLOY_GUIDE.md](./VERCEL_DEPLOY_GUIDE.md)
- 📗 [INTEGRACION_SUPABASE.md](./INTEGRACION_SUPABASE.md)
- 📋 [CHECKLIST_DEPLOY_VERCEL.md](./CHECKLIST_DEPLOY_VERCEL.md)

---

**Tiempo total estimado:** 15-20 minutos  
**Última actualización:** 26 de diciembre de 2024  
**Estado:** ✅ Probado y funcionando
