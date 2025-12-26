# 🔴⚫ Udar Edge - Backend con Supabase

## ✅ ¡CONEXIÓN EXITOSA!

Tu aplicación Udar Edge ya está conectada a Supabase con backend completo.

---

## 🧪 Panel de Pruebas

**En la pantalla de Login** verás un panel flotante (esquina inferior derecha) con botones de prueba:

1. **Test Conexión** - Verifica que el servidor responde
2. **Crear Marca Test** - Crea una marca de prueba
3. **Obtener Marcas** - Lista todas las marcas en la BD
4. **Migrar X Productos** - Migra todos los productos del catálogo a Supabase

---

## 📦 ¿Qué se ha implementado?

### ✅ **Backend (Servidor Hono)**
- `/supabase/functions/server/index.tsx` - Servidor completo con todas las rutas

### ✅ **Frontend (Servicios)**
- `/utils/supabase/client.tsx` - Cliente Supabase + helpers
- `/services/api.tsx` - Servicios API para todas las operaciones
- `/hooks/useAuth.tsx` - Hook de autenticación completo

### ✅ **Herramientas**
- `/utils/migracion.tsx` - Scripts para migrar datos desde LocalStorage
- `/components/SupabaseTest.tsx` - Panel de pruebas (temporal)

### ✅ **Documentación**
- `/VERCEL_DEPLOY.md` - Guía completa para deploy en Vercel
- `/ARQUITECTURA.md` - Documentación técnica del sistema

---

## 🚀 Próximos Pasos

### 1️⃣ **Probar la Conexión**

```
1. Abre la app en el navegador
2. Espera a llegar a la pantalla de Login
3. Verás el panel de pruebas en la esquina inferior derecha
4. Haz click en "Test Conexión"
5. Deberías ver: ✅ Conexión exitosa
```

### 2️⃣ **Migrar Datos**

```
1. En el panel de pruebas, click en "Migrar X Productos"
2. Espera a que termine (verás el progreso en el resultado)
3. Verifica con "Obtener Marcas" que los datos están en Supabase
```

### 3️⃣ **Integrar en tu App**

Una vez verificado que todo funciona, puedes:

#### **Opción A: Uso directo con servicios API**

```tsx
import { productosAPI, pedidosAPI, authAPI } from './services/api';

// Ejemplo: Obtener productos
const { productos } = await productosAPI.getByMarca('MRC-001');

// Ejemplo: Crear pedido
await pedidosAPI.create({
  marcaId: 'MRC-001',
  productos: [...],
  total: 100
});
```

#### **Opción B: Hook de autenticación**

```tsx
import { useAuth } from './hooks/useAuth';

function MiComponente() {
  const { user, login, logout, isAuthenticated } = useAuth();

  const handleLogin = async () => {
    const result = await login('email@ejemplo.com', 'password');
    if (result.success) {
      console.log('Login exitoso', result.user);
    }
  };

  return (
    <div>
      {isAuthenticated ? (
        <p>Hola {user?.nombre}</p>
      ) : (
        <button onClick={handleLogin}>Login</button>
      )}
    </div>
  );
}
```

### 4️⃣ **Reemplazar LocalStorage**

Ahora puedes reemplazar gradualmente el LocalStorage con llamadas reales:

**ANTES (LocalStorage):**
```tsx
const productos = JSON.parse(localStorage.getItem('productos') || '[]');
```

**DESPUÉS (Supabase):**
```tsx
const { productos } = await productosAPI.getByMarca(marcaId);
```

---

## 🔐 Autenticación

### **Registro de Usuario**

```tsx
import { authAPI } from './services/api';

const result = await authAPI.signup(
  'email@ejemplo.com',
  'password123',
  'Juan Pérez',
  'cliente', // 'cliente' | 'trabajador' | 'gerente'
  'MRC-001'  // ID de la marca
);
```

### **Login**

```tsx
const result = await authAPI.login(
  'email@ejemplo.com',
  'password123'
);

if (result.success) {
  console.log('Access Token:', result.accessToken);
  console.log('User:', result.user);
}
```

### **Logout**

```tsx
await authAPI.logout();
```

### **Obtener Usuario Actual**

```tsx
const { data: { session } } = await authAPI.getSession();
if (session?.access_token) {
  const { data: { user } } = await authAPI.getUser();
  console.log('Usuario actual:', user);
}
```

---

## 📊 Estructura de Datos

### **Marca**
```json
{
  "id": "MRC-001",
  "nombre": "Modommio",
  "descripcion": "Pizzería artesanal",
  "activo": true,
  "colorPrimario": "#000000",
  "colorSecundario": "#ED1C24",
  "createdAt": "2025-12-26T10:00:00Z"
}
```

### **Producto**
```json
{
  "id": "mod-prem-001",
  "nombre": "Premium Barbacoa",
  "categoria": "Pizzas Premium",
  "precio": 15.50,
  "stock": 25,
  "descripcion": "...",
  "imagen": "https://...",
  "marcas_ids": ["MRC-001"],
  "activo": true,
  "visible_tpv": true,
  "sku": "MOD-PREM-001",
  "iva": 10,
  "createdAt": "2025-12-26T10:00:00Z"
}
```

### **Pedido**
```json
{
  "id": "PED-1735210000",
  "userId": "abc123",
  "marcaId": "MRC-001",
  "productos": [
    {
      "id": "mod-prem-001",
      "nombre": "Premium Barbacoa",
      "cantidad": 2,
      "precio": 15.50
    }
  ],
  "total": 31.00,
  "estado": "pendiente",
  "createdAt": "2025-12-26T11:00:00Z"
}
```

---

## 🛠️ APIs Disponibles

### **Autenticación**
- `authAPI.signup()` - Registrar usuario
- `authAPI.login()` - Iniciar sesión
- `authAPI.logout()` - Cerrar sesión
- `authAPI.getSession()` - Obtener sesión actual
- `authAPI.getUser()` - Obtener usuario actual

### **Marcas**
- `marcasAPI.create()` - Crear marca
- `marcasAPI.getById()` - Obtener marca por ID
- `marcasAPI.getAll()` - Listar todas las marcas
- `marcasAPI.update()` - Actualizar marca

### **Productos**
- `productosAPI.create()` - Crear producto
- `productosAPI.getById()` - Obtener producto por ID
- `productosAPI.getByMarca()` - Listar productos por marca
- `productosAPI.update()` - Actualizar producto
- `productosAPI.delete()` - Eliminar producto

### **Pedidos**
- `pedidosAPI.create()` - Crear pedido
- `pedidosAPI.getByUsuario()` - Listar pedidos por usuario
- `pedidosAPI.getByMarca()` - Listar pedidos por marca
- `pedidosAPI.update()` - Actualizar pedido

### **Proveedores**
- `proveedoresAPI.create()` - Crear proveedor
- `proveedoresAPI.getByMarca()` - Listar proveedores por marca
- `proveedoresAPI.update()` - Actualizar proveedor

### **Planes**
- `planesAPI.create()` - Crear plan
- `planesAPI.getByMarca()` - Listar planes por marca

### **Configuración White Label**
- `configAPI.save()` - Guardar configuración
- `configAPI.get()` - Obtener configuración

---

## 🔄 Tiempo Real

Para actualización en tiempo real de pedidos (próximamente):

```tsx
import { getSupabaseClient } from './utils/supabase/client';

const supabase = getSupabaseClient();

// Suscribirse a cambios en pedidos
supabase
  .channel('pedidos')
  .on('postgres_changes', {
    event: '*',
    schema: 'public',
    table: 'kv_store_ae2ba659',
    filter: `key=like.pedido:%`
  }, (payload) => {
    console.log('Pedido actualizado:', payload);
    // Actualizar UI
  })
  .subscribe();
```

---

## 🐛 Troubleshooting

### **Error: "No autorizado"**
- Verifica que el usuario esté logueado
- Asegúrate de incluir el access_token en las peticiones

### **Error: "Marca no encontrada"**
- Verifica que la marca exista en Supabase
- Usa el panel de pruebas para crear una marca

### **Error de CORS**
- Ya está configurado en el servidor
- Si persiste, verifica las variables de entorno

### **Los productos no se migran**
- Verifica que ProductosContext tenga productos
- Revisa la consola para ver errores específicos

---

## 📞 Siguientes Pasos

1. ✅ **Probar APIs** con el panel de pruebas
2. ✅ **Migrar productos** desde LocalStorage
3. 🔄 **Integrar autenticación** en LoginView
4. 🔄 **Reemplazar ProductosContext** con llamadas a Supabase
5. 🔄 **Implementar tiempo real** para pedidos
6. 🚀 **Deploy en Vercel** (ver `/VERCEL_DEPLOY.md`)

---

## 📖 Documentación Completa

- **Arquitectura**: `/ARQUITECTURA.md`
- **Deploy Vercel**: `/VERCEL_DEPLOY.md`
- **Supabase Docs**: https://supabase.com/docs

---

🔴⚫ **¡Tu backend está listo! Ahora puedes empezar a integrar Supabase en tu app.**
