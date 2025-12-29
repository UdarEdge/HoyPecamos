# 🚀 SELECTOR RÁPIDO DE PERFILES

## 📋 DESCRIPCIÓN

Componente de **botón flotante emergente** que permite cambiar instantáneamente entre los 3 perfiles de usuario (Cliente, Trabajador, Gerente) sin tener que navegar por menús complejos.

---

## ✨ CARACTERÍSTICAS

### **🎯 Funcionalidades**
- ✅ **Botón flotante** en la esquina inferior derecha
- ✅ **Modal emergente** con lista de perfiles
- ✅ **Cambio instantáneo** de perfil con 1 clic
- ✅ **Indicador visual** del perfil actual
- ✅ **Diseño adaptativo** con colores del tenant
- ✅ **Animaciones suaves** y feedback visual

### **🎨 Diseño**
- ✅ Colores personalizados por tenant (HoyPecamos: rojo #ED1C24 y negro)
- ✅ Iconos distintivos para cada perfil:
  - 🛒 **Cliente** → Azul
  - 👨‍💼 **Trabajador** → Verde
  - 👑 **Gerente** → Morado
- ✅ Badge animado con emoji del perfil actual
- ✅ Sombras y efectos de hover profesionales

---

## 📦 UBICACIÓN DE ARCHIVOS

### **Componente Principal**
```
/components/SelectorRapidoPerfiles.tsx
```

### **Integración**
```
/App.tsx (líneas 32, 285-289)
```

---

## 🔧 IMPLEMENTACIÓN

### **1. Importación en App.tsx**
```typescript
import { SelectorRapidoPerfiles } from './components/SelectorRapidoPerfiles';
```

### **2. Uso en el árbol de componentes**
```tsx
{/* ⭐ SELECTOR RÁPIDO DE PERFILES - Botón flotante */}
<SelectorRapidoPerfiles 
  currentRole={currentUser.role}
  onCambiarRol={handleCambiarRol}
  branding={branding}
/>
```

---

## 📝 PROPS

```typescript
interface Props {
  currentRole: UserRole;  // 'cliente' | 'trabajador' | 'gerente' | null
  onCambiarRol: (nuevoRol: 'cliente' | 'trabajador' | 'gerente') => void;
  branding?: {
    primaryColor?: string;    // Color primario (default: #ED1C24)
    secondaryColor?: string;  // Color secundario (default: #000000)
  };
}
```

### **Descripción de Props**

| Prop | Tipo | Requerido | Descripción |
|------|------|-----------|-------------|
| `currentRole` | `UserRole` | ✅ Sí | Rol actual del usuario |
| `onCambiarRol` | `function` | ✅ Sí | Callback para cambiar de rol |
| `branding` | `object` | ❌ No | Colores personalizados del tenant |

---

## 🎨 DISEÑO VISUAL

### **Botón Flotante**
```
┌──────────────────────────────────────┐
│                                      │
│                                      │
│                               ┌────┐ │
│                            🛒 │ 👤 │ │
│                               └────┘ │
└──────────────────────────────────────┘
```

- **Posición:** Fija en `bottom: 24px`, `right: 24px`
- **Tamaño:** 56px × 56px (circular)
- **Color:** Rojo #ED1C24 con borde negro
- **Badge:** Emoji animado del perfil actual (bounce)

---

### **Modal de Selección**

```
┌─────────────────────────────────────────┐
│ 👤 Selector de Perfil                   │
│ Cambia rápidamente entre roles          │
├─────────────────────────────────────────┤
│                                         │
│  🛒  Cliente                   [Activo]│
│      Explora productos, haz pedidos     │
│                                         │
│  👨‍💼  Trabajador                     →  │
│      Gestiona pedidos y stock           │
│                                         │
│  👑  Gerente                         →  │
│      Dashboards y métricas              │
│                                         │
├─────────────────────────────────────────┤
│ Perfil actual: Cliente          [Cerrar]│
└─────────────────────────────────────────┘
```

---

## 🎯 FLUJO DE USO

### **Paso 1: Click en botón flotante**
El usuario hace clic en el botón con icono de usuario (👤) en la esquina inferior derecha.

### **Paso 2: Modal se abre**
Aparece un modal con:
- Header con gradiente (colores del tenant)
- Lista de 3 perfiles disponibles
- Perfil actual marcado con badge "Activo"

### **Paso 3: Selección de perfil**
- Usuario hace clic en el perfil deseado
- Cambio **inmediato** sin recarga de página
- Modal se cierra automáticamente

### **Paso 4: Confirmación visual**
- Badge del botón flotante cambia al emoji del nuevo perfil
- Dashboard cambia al del nuevo rol

---

## 📱 RESPONSIVE

### **Desktop (> 640px)**
- Modal centrado con ancho máximo de 500px
- Botón flotante siempre visible
- Efectos hover completos

### **Mobile (< 640px)**
- Modal ocupa casi toda la pantalla
- Botón flotante con tamaño optimizado
- Touch-friendly (áreas táctiles grandes)

---

## 🎨 PERFILES DISPONIBLES

### **1. Cliente 🛒**
```typescript
{
  id: 'cliente',
  nombre: 'Cliente',
  descripcion: 'Explora productos, haz pedidos y gestiona tus favoritos',
  icono: <ShoppingBag />,
  color: 'Azul (#2563eb)',
  badge: '🛒'
}
```

**Dashboard:**
- Catálogo de productos
- Carrito de compras
- Historial de pedidos
- Perfil y favoritos

---

### **2. Trabajador 👨‍💼**
```typescript
{
  id: 'trabajador',
  nombre: 'Trabajador',
  descripcion: 'Gestiona pedidos, stock y operaciones diarias',
  icono: <Briefcase />,
  color: 'Verde (#16a34a)',
  badge: '👨‍💼'
}
```

**Dashboard:**
- Gestión de pedidos
- Control de stock
- Caja rápida
- Operaciones diarias

---

### **3. Gerente 👑**
```typescript
{
  id: 'gerente',
  nombre: 'Gerente',
  descripcion: 'Dashboards, métricas, análisis y configuración',
  icono: <Crown />,
  color: 'Morado (#9333ea)',
  badge: '👑'
}
```

**Dashboard:**
- Dashboard 360
- Cuenta de resultados
- Análisis de submarcas
- Configuración

---

## 🎬 ANIMACIONES

### **Botón Flotante**
- ✅ **Hover:** Escala 1.1× con sombra aumentada
- ✅ **Badge:** Animación bounce continua
- ✅ **Transición:** 300ms ease-in-out

### **Modal**
- ✅ **Entrada:** Slide-in desde arriba
- ✅ **Salida:** Fade-out suave
- ✅ **Items:** Hover con cambio de color de fondo

### **Cards de Perfil**
- ✅ **Hover:** Borde cambia de color + fondo sutil
- ✅ **Activo:** Ring de 2px + fondo coloreado
- ✅ **Transición:** 200ms all

---

## 🔒 RESTRICCIONES

### **Perfil Actual**
- ✅ El perfil actualmente seleccionado **NO es clickeable**
- ✅ Se muestra con badge "Activo" y estilo diferenciado
- ✅ Cursor cambia a `cursor-default`

### **Modal**
- ✅ Cierre con botón "Cerrar"
- ✅ Cierre con click fuera del modal
- ✅ Cierre con tecla Escape (nativo de Dialog)

---

## 🎨 PERSONALIZACIÓN POR TENANT

El componente se adapta automáticamente a los colores del tenant:

```typescript
// Ejemplo: HoyPecamos
branding = {
  primaryColor: '#ED1C24',    // Rojo
  secondaryColor: '#000000'   // Negro
}

// Resultado:
// - Botón flotante: Fondo rojo, borde negro
// - Header del modal: Gradiente de rojo a negro
// - Badge "Activo": Fondo rojo
```

---

## 🛠️ DEPENDENCIAS

### **Componentes UI**
- `Button` de `/components/ui/button`
- `Dialog`, `DialogContent`, `DialogHeader`, `DialogTitle`, `DialogDescription` de `/components/ui/dialog`

### **Iconos (lucide-react)**
- `User` - Icono del botón flotante
- `ShoppingBag` - Cliente
- `Briefcase` - Trabajador
- `Crown` - Gerente
- `X` - Cerrar modal
- `ChevronRight` - Flecha de navegación

---

## 📊 EJEMPLO DE USO COMPLETO

```tsx
import { useState } from 'react';
import { SelectorRapidoPerfiles } from './components/SelectorRapidoPerfiles';
import type { UserRole } from './App';

function MiApp() {
  const [currentUser, setCurrentUser] = useState({
    id: '123',
    name: 'Juan Pérez',
    email: 'juan@example.com',
    role: 'cliente' as UserRole
  });

  const handleCambiarRol = (nuevoRol: 'cliente' | 'trabajador' | 'gerente') => {
    setCurrentUser({
      ...currentUser,
      role: nuevoRol
    });
  };

  const branding = {
    primaryColor: '#ED1C24',
    secondaryColor: '#000000'
  };

  return (
    <div>
      {/* Tu aplicación aquí */}
      
      {/* Selector de perfiles flotante */}
      <SelectorRapidoPerfiles
        currentRole={currentUser.role}
        onCambiarRol={handleCambiarRol}
        branding={branding}
      />
    </div>
  );
}
```

---

## ✅ VENTAJAS

### **Para Desarrolladores**
- ✅ Fácil testing de diferentes perfiles
- ✅ Debug rápido de funcionalidades específicas
- ✅ No requiere logout/login para cambiar rol

### **Para Usuarios**
- ✅ Navegación instantánea entre perfiles
- ✅ Menos clicks que el método tradicional
- ✅ Feedback visual claro del perfil actual

### **Para QA/Testing**
- ✅ Testing rápido de todos los roles
- ✅ Validación de permisos por perfil
- ✅ Pruebas de flujos multi-rol

---

## 🔮 MEJORAS FUTURAS

### **Posibles Extensiones**
- [ ] Atajo de teclado (Ctrl+Shift+P)
- [ ] Historial de cambios de perfil
- [ ] Modo demo (sin autenticación)
- [ ] Favoritos de perfiles
- [ ] Perfiles personalizados

### **Analytics**
- [ ] Tracking de cambios de perfil
- [ ] Tiempo en cada perfil
- [ ] Perfiles más usados

---

## 🎊 CONCLUSIÓN

**Selector Rápido de Perfiles** implementado con éxito! 

Características principales:
- ✅ Botón flotante siempre accesible
- ✅ Modal elegante y profesional
- ✅ Cambio instantáneo de perfil
- ✅ Diseño responsive y personalizable
- ✅ Integrado en App.tsx

El componente está **listo para usar** y mejora significativamente la experiencia de navegación entre perfiles.

---

**Creado:** 26 de enero de 2025  
**Versión:** 1.0  
**Estado:** ✅ COMPLETO Y FUNCIONAL
