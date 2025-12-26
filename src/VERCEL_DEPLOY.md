# 🚀 Guía de Deployment en Vercel - Udar Edge

## 📋 Pre-requisitos

1. **Cuenta de Vercel**: https://vercel.com
2. **Repositorio Git**: GitHub, GitLab o Bitbucket
3. **Variables de entorno de Supabase** (ya configuradas en este proyecto)

---

## 🔧 Configuración de Variables de Entorno en Vercel

Después de importar tu proyecto en Vercel, configura estas variables de entorno:

```bash
# Supabase (ya las tienes configuradas en Figma Make)
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
```

---

## 📦 Pasos para Deploy

### 1. **Preparar el Repositorio**

```bash
# Inicializar git si no lo has hecho
git init

# Agregar todos los archivos
git add .

# Commit inicial
git commit -m "Initial commit - Udar Edge"

# Conectar con tu repositorio remoto
git remote add origin https://github.com/tu-usuario/udar-edge.git
git push -u origin main
```

### 2. **Importar en Vercel**

1. Ve a https://vercel.com/dashboard
2. Click en **"Add New Project"**
3. Importa tu repositorio de GitHub/GitLab/Bitbucket
4. Vercel detectará automáticamente que es un proyecto React/Vite

### 3. **Configurar el Proyecto**

En la pantalla de configuración:

- **Framework Preset**: Vite
- **Root Directory**: `./` (raíz)
- **Build Command**: `npm run build` (automático)
- **Output Directory**: `dist` (automático)

### 4. **Variables de Entorno**

En la sección "Environment Variables":

1. Copia las variables de Supabase desde Figma Make
2. Pégalas en Vercel
3. Aplica a **Production**, **Preview** y **Development**

### 5. **Deploy**

Click en **"Deploy"** y espera unos 2-3 minutos.

---

## 🌐 URLs Personalizadas por Tenant (White Label)

### Opción 1: Subdominos en Vercel

```bash
# Configurar en Vercel Dashboard > Settings > Domains
modommio.udar-edge.vercel.app
hoypecamos.udar-edge.vercel.app
```

### Opción 2: Dominios Personalizados

```bash
# Agregar dominios custom
modommio.com
hoypecamos.com
```

**Configurar DNS:**
```
Type: CNAME
Name: @ (o www)
Value: cname.vercel-dns.com
```

### Opción 3: Detección por Ruta

El sistema actual usa `/:marcaSlug/*` en las rutas, funciona sin configuración adicional:

```
https://tu-app.vercel.app/modommio
https://tu-app.vercel.app/hoypecamos
```

---

## 🔄 Deploy Automático

Vercel hace deploy automático cuando:
- Push a la rama `main` → Deploy a Producción
- Pull Request → Deploy Preview (URL temporal)
- Push a otras ramas → Deploy Preview

---

## ⚡ Optimizaciones Recomendadas

### 1. **Image Optimization**

Vercel optimiza imágenes automáticamente. Para Unsplash:

```tsx
import Image from 'next/image'; // Solo si migras a Next.js

// O usa el componente ImageWithFallback existente
```

### 2. **Caching**

Vercel cachea assets estáticos automáticamente (JS, CSS, imágenes).

### 3. **Analíticas**

Habilita Vercel Analytics en el dashboard para:
- Métricas de rendimiento
- Visitantes únicos
- Page views
- Core Web Vitals

---

## 🛠️ Comandos Útiles

```bash
# Instalar Vercel CLI (opcional)
npm i -g vercel

# Deploy desde terminal
vercel

# Deploy a producción
vercel --prod

# Ver logs
vercel logs

# Alias personalizado
vercel alias set deployment-url.vercel.app custom-domain.com
```

---

## 🔍 Troubleshooting

### Error: "Module not found"
```bash
# Verifica package.json y reinstala
npm install
```

### Error: "Build failed"
```bash
# Revisa los logs en Vercel Dashboard
# Verifica que todas las importaciones sean correctas
```

### Error: "Environment variables not found"
```bash
# Asegúrate de haber configurado TODAS las variables en Vercel
# Ve a Settings > Environment Variables
```

### Error: "API routes not working"
```bash
# Las Supabase Functions ya están desplegadas en Supabase
# No necesitas configuración adicional
# Solo verifica SUPABASE_URL en variables de entorno
```

---

## 📊 Monitoreo Post-Deploy

1. **Vercel Dashboard**: Métricas en tiempo real
2. **Supabase Dashboard**: Logs de API y base de datos
3. **Console del navegador**: Errors del frontend

---

## 🎨 White Label por Tenant

Cada marca (Modommio, HoyPecamos) puede tener:

1. **Dominio propio**: `modommio.com`, `hoypecamos.com`
2. **Subdirección**: `app.com/modommio`, `app.com/hoypecamos`
3. **Subdominio**: `modommio.app.com`, `hoypecamos.app.com`

La detección del tenant se hace automáticamente en el frontend basándose en la URL.

---

## ✅ Checklist Final

- [ ] Código commiteado en Git
- [ ] Repositorio en GitHub/GitLab/Bitbucket
- [ ] Variables de entorno configuradas en Vercel
- [ ] Primer deploy exitoso
- [ ] URLs funcionando correctamente
- [ ] API de Supabase conectada
- [ ] Tests de funcionalidad básica

---

## 📞 Soporte

- **Vercel Docs**: https://vercel.com/docs
- **Supabase Docs**: https://supabase.com/docs
- **Figma Make**: https://help.figma.com

---

🔴⚫ **¡Tu aplicación Udar Edge está lista para producción!**
