# 🚀 GUÍA RÁPIDA: Sistema de Canales de Venta

## 📍 ACCESOS RÁPIDOS EN LA APLICACIÓN

### **Para GERENTES:**

```
┌─────────────────────────────────────────────────────────────┐
│ 1️⃣  CONFIGURAR CANALES                                      │
│    Ruta: Gerente → Configuración → Sistema → Canales       │
│    URL: /gerente/configuracion?tab=sistema&sub=canales     │
│                                                             │
│    🎯 Aquí puedes:                                          │
│    • Ver todos los canales (TPV, Online, Marketplace...)   │
│    • Añadir nuevos canales (+ Añadir Canal)                │
│    • Activar/desactivar canales (switch)                   │
│    • Reordenar canales (botones ↑↓)                        │
│    • Eliminar canales externos (botón 🗑️)                  │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│ 2️⃣  CONFIGURAR INTEGRACIONES                                │
│    Ruta: Gerente → Configuración → Sistema → Integraciones │
│    URL: /gerente/configuracion?tab=sistema&sub=integraciones│
│                                                             │
│    🎯 Aquí puedes:                                          │
│    • Ver integraciones por canal (tabs)                    │
│    • Configurar credenciales API                           │
│    • Probar conexión (botón Probar)                        │
│    • Activar/desactivar (switch)                           │
│    • Ver estadísticas (Pedidos Hoy, Mes, Tasa Éxito)      │
│    • Copiar URL webhook (botón 📋)                         │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│ 3️⃣  FILTRAR CLIENTES POR CANAL                              │
│    Ruta: Gerente → Clientes                                │
│    URL: /gerente/clientes                                  │
│                                                             │
│    🎯 Aquí puedes:                                          │
│    • Filtrar clientes por canal (dropdown dinámico)        │
│    • Ver de dónde vino cada cliente                        │
│    • Exportar listas segmentadas                           │
│                                                             │
│    Filtros disponibles:                                    │
│    🔀 Todos los canales                                    │
│    🏪 TPV (Tienda Física)                                  │
│    🌐 Online (App/Web)                                     │
│    📦 Marketplace (Delivery)                               │
│    📱 WhatsApp                                             │
│    📧 Email                                                │
│    ☎️ Telefónico                                           │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│ 4️⃣  VER ESTADÍSTICAS DE CANALES                             │
│    Ruta: Gerente → Dashboard                               │
│    URL: /gerente                                           │
│                                                             │
│    🎯 Aquí ves:                                             │
│    • Pedidos por canal (gráfico)                           │
│    • Ingresos por canal                                    │
│    • Evolución temporal                                    │
│    • Comparativas de rendimiento                           │
└─────────────────────────────────────────────────────────────┘
```

---

## 🔧 CONFIGURACIÓN PASO A PASO

### **CASO 1: Activar WhatsApp**

```
1. CREAR CANAL
   ────────────
   Gerente → Configuración → Sistema → Canales de Venta
   → Click "+ Añadir Canal"
   → Seleccionar plantilla "WhatsApp"
   → Confirmar
   
   ✅ Canal creado automáticamente:
      Nombre: WhatsApp
      Icono: 📱
      Color: #25D366
      Requiere integración: Sí

2. CONFIGURAR INTEGRACIÓN
   ──────────────────────
   Gerente → Configuración → Sistema → Integraciones
   → Tab "WhatsApp"
   → Click "Configurar" en "WhatsApp Business API"
   → Rellenar campos:
      • Phone Number ID: [tu ID de Meta]
      • Access Token: [tu token de Meta]
      • Verify Token: [crear uno seguro]
   → Click "Guardar Configuración"
   
3. PROBAR CONEXIÓN
   ───────────────
   → Click "Probar"
   → Esperar mensaje: "✅ Conexión exitosa con WhatsApp Business API"
   
4. ACTIVAR
   ────────
   → Switch ON
   → Estado cambia a "✅ Conectada"
   
5. CONFIGURAR EN META
   ──────────────────
   → Click botón "📋" para copiar URL webhook
   → Ir a https://business.facebook.com
   → Configurar webhook con URL copiada
   
6. PROBAR
   ──────
   → Enviar mensaje de prueba desde tu WhatsApp:
     "Quiero 2 pizzas margarita"
   
   → Revisar que aparece pedido en Dashboard con badge 📱 WhatsApp
```

---

### **CASO 2: Activar Email**

```
1. CREAR CANAL
   ────────────
   → Plantilla "Email" (📧)
   
2. CONFIGURAR SMTP
   ───────────────
   Integraciones → Tab "Email" → SMTP Personalizado
   → SMTP Host: smtp.gmail.com (o tu proveedor)
   → Puerto: 587
   → Usuario: pedidos@tuempresa.com
   → Contraseña: [contraseña de aplicación]
   → SSL: Sí
   
3. PROBAR
   ──────
   → Enviar email de prueba a pedidos@tuempresa.com:
   
     Asunto: Pedido
     
     Hola, quiero:
     • 2 Pizza Margarita - 9.00€
     • 1 Coca-Cola - 2.50€
     
     Dirección: Calle Mayor 123
   
   → Revisar que aparece en Dashboard con badge 📧 Email
```

---

### **CASO 3: Activar Glovo**

```
1. REUTILIZAR CONFIGURACIÓN EXISTENTE
   ──────────────────────────────────
   Si ya tienes Glovo en "Integraciones Delivery (legacy)":
   → El nuevo sistema lee automáticamente las credenciales
   
2. O CONFIGURAR DESDE CERO
   ─────────────────────────
   Integraciones → Tab "Marketplace" → Glovo
   → API Key: [de Glovo Partners]
   → Store ID: [tu ID de tienda]
   → Webhook Secret: [generar en Glovo]
   
3. COPIAR WEBHOOK
   ──────────────
   → Botón 📋 para copiar URL
   → Configurar en Glovo Partners
   
4. ACTIVAR
   ────────
   → Switch ON
   
5. PROBAR
   ──────
   → Hacer pedido de prueba desde Glovo
   → Debe aparecer en Dashboard con badge 🛵 Glovo
```

---

## 📊 EJEMPLOS DE USO

### **Ejemplo 1: Cliente pide por WhatsApp**

```
CLIENTE envía:
"Hola, quiero 2 pizzas margarita y 1 coca-cola para llevar"

SISTEMA procesa:
1. ✅ Detecta intención de pedido
2. ✅ Extrae productos:
   • 2x Pizza Margarita (validado en catálogo → 9.00€ c/u)
   • 1x Coca-Cola (validado en catálogo → 2.50€)
3. ✅ Crea pedido en sistema (PED-WHATSAPP-20241227-001)
4. ✅ Envía confirmación automática:

CLIENTE recibe:
"✅ ¡Pedido recibido!

• 2x Pizza Margarita - 18.00€
• 1x Coca-Cola - 2.50€

💰 Total: 20.50€

Te confirmaremos en breve. ¡Gracias! 🙌"

GERENTE ve en Dashboard:
┌─────────────────────────────────────────┐
│ #0012 - 27/12 12:35   📱 WhatsApp       │
│ Cliente WhatsApp (+34 612 345 678)      │
│ • 2x Pizza Margarita                    │
│ • 1x Coca-Cola                          │
│ Total: 20.50€          [⚡ Auto] 95%    │
│ [Confirmar] [Rechazar]                  │
└─────────────────────────────────────────┘
```

---

### **Ejemplo 2: Cliente envía email**

```
CLIENTE envía email:

De: juan@example.com
Asunto: Pedido para HoyPecamos

Hola,

Quisiera hacer un pedido:
• 2 Pizza Margarita - 9.00€
• 1 Coca-Cola - 2.50€

Dirección: Calle Mayor 123, 28001 Madrid
Teléfono: 612 345 678
Notas: Sin cebolla en las pizzas

Gracias

────────────────────────────────────────

SISTEMA procesa:
1. ✅ Detecta email de pedido (asunto contiene "Pedido")
2. ✅ Extrae productos de lista con bullets
3. ✅ Extrae datos de cliente:
   • Nombre: Juan (del email)
   • Email: juan@example.com
   • Teléfono: 612345678
   • Dirección: Calle Mayor 123, 28001 Madrid
   • Notas: Sin cebolla en las pizzas
4. ✅ Valida productos con catálogo
5. ✅ Crea pedido
6. ✅ Envía email de confirmación HTML

CLIENTE recibe:
┌─────────────────────────────────────────┐
│ ✅ Pedido recibido - Confirmación       │
├─────────────────────────────────────────┤
│ Hola Juan,                              │
│                                         │
│ Hemos recibido tu pedido y lo estamos  │
│ procesando.                             │
│                                         │
│ Resumen del pedido:                     │
│ ┌────────────────────────────────────┐ │
│ │ Cant. │ Producto      │ Subtotal   │ │
│ ├────────────────────────────────────┤ │
│ │ 2     │ Pizza Margar. │ 18.00€    │ │
│ │ 1     │ Coca-Cola     │ 2.50€     │ │
│ └────────────────────────────────────┘ │
│                                         │
│ Total: 20.50€                           │
│                                         │
│ Observaciones: Sin cebolla en las pizzas│
│                                         │
│ ¡Gracias por tu confianza!              │
└─────────────────────────────────────────┘

GERENTE ve:
┌─────────────────────────────────────────┐
│ #0013 - 27/12 12:40   📧 Email          │
│ Juan (juan@example.com)                 │
│ • 2x Pizza Margarita                    │
│ • 1x Coca-Cola                          │
│ Total: 20.50€          [✅ Auto] 100%   │
│ Observaciones: Sin cebolla en las pizzas│
│ Dirección: Calle Mayor 123, 28001 Madrid│
│ [Preparar]                              │
└─────────────────────────────────────────┘
```

---

### **Ejemplo 3: Pedido de Glovo**

```
CLIENTE pide desde App Glovo

────────────────────────────────────────

GLOVO envía webhook:
POST /webhooks/canal-marketplace/int-glovo
{
  "order_id": "GLOVO-123456",
  "event_type": "order.created",
  "customer": {
    "name": "María García",
    "phone": "+34655123456"
  },
  "items": [
    { "name": "Hamburguesa Completa", "qty": 1, "price": 12.00 }
  ],
  "total": 12.00
}

SISTEMA procesa:
1. ✅ Detecta webhook de Glovo
2. ✅ Usa sistema existente (pedidos-delivery.service.ts)
3. ✅ Convierte a formato interno
4. ✅ Crea pedido
5. ✅ Actualiza estadísticas de integración

GERENTE ve:
┌─────────────────────────────────────────┐
│ #0014 - 27/12 12:45   🛵 Glovo          │
│ María García (+34 655 123 456)          │
│ • 1x Hamburguesa Completa               │
│ Total: 12.00€          [✅ Confirmado]  │
│ [Preparar]                              │
└─────────────────────────────────────────┘

ESTADÍSTICAS Glovo actualizadas:
• Pedidos Hoy: 6 → 7
• Pedidos Mes: 120 → 121
• Tasa Éxito: 98%
• Última Sync: 27/12 12:45
```

---

## 🎯 CASOS DE USO COMUNES

### **1. Marketing Segmentado**

```
OBJETIVO: Enviar promoción solo a clientes de WhatsApp

PASOS:
1. Gerente → Clientes
2. Filtro Canales: 📱 WhatsApp
3. Exportar lista (botón Exportar)
4. Usar lista para campaña de WhatsApp Marketing

RESULTADO:
• Lista de 120 clientes que prefieren WhatsApp
• Enviar promoción "20% de descuento en tu próximo pedido por WhatsApp"
• Conversión: 35% (42 pedidos nuevos)
```

---

### **2. Análisis de Rendimiento**

```
OBJETIVO: Identificar canal más rentable

PASOS:
1. Gerente → Dashboard
2. Ver sección "Rendimiento por Canal"
3. Analizar:
   • TPV: 450 pedidos → 11,250€ (ticket: 25€)
   • Marketplace: 320 pedidos → 8,960€ (ticket: 28€)
   • WhatsApp: 120 pedidos → 2,880€ (ticket: 24€)

CONCLUSIÓN:
• Marketplace tiene mejor ticket promedio
• WhatsApp está creciendo rápido (120% mes a mes)
• Decisión: Invertir más en marketing de WhatsApp
```

---

### **3. Optimización de Personal**

```
OBJETIVO: Saber cuándo llegan más pedidos de cada canal

PASOS:
1. Gerente → Estadísticas Avanzadas
2. Filtrar por canal
3. Ver gráfico de horas pico

RESULTADO:
• TPV: Pico 13:00-15:00 (almuerzo)
• Marketplace: Pico 20:00-22:00 (cena)
• WhatsApp: Distribuido todo el día
• Online: Pico 12:00-14:00 y 20:00-22:00

DECISIÓN:
• Reforzar cocina 20:00-22:00 para marketplace
• Un operador dedicado a WhatsApp todo el día
```

---

## ⚠️ SOLUCIÓN DE PROBLEMAS

### **Problema: WhatsApp no recibe pedidos**

```
VERIFICAR:
1. ✅ Canal activado (switch ON en Canales de Venta)
2. ✅ Integración conectada (✅ Conectada en Integraciones)
3. ✅ Webhook configurado en Meta Business
4. ✅ Access Token válido (no expirado)

PROBAR:
→ Integraciones → WhatsApp Business API → Probar
→ Debe mostrar "✅ Conexión exitosa"

SI FALLA:
→ Ver Logs (botón Ver Logs)
→ Buscar error específico
→ Revisar credenciales en Meta Business
```

---

### **Problema: Email no parsea correctamente**

```
VERIFICAR:
1. ✅ Formato del email (debe tener "Pedido" en asunto)
2. ✅ Productos en lista o tabla
3. ✅ Productos existen en catálogo

EJEMPLO CORRECTO:
Asunto: Pedido para HoyPecamos

• 2 Pizza Margarita
• 1 Coca-Cola

EJEMPLO INCORRECTO:
Asunto: Hola

Quiero dos pizzas margaritas
(Falta formato de lista)

SOLUCIÓN:
→ Pedir a clientes usar formato de lista
→ O revisar manualmente pedidos con baja confianza
```

---

### **Problema: Glovo no aparece en integraciones**

```
CAUSA:
Canal Marketplace no creado o integración no configurada

SOLUCIÓN:
1. Verificar canal Marketplace existe:
   Canales de Venta → Buscar "📦 Marketplace"
   
2. Si no existe, crear:
   → + Añadir Canal → Plantilla "Marketplace"
   
3. Verificar integración Glovo:
   Integraciones → Tab "Marketplace" → Debe aparecer Glovo
   
4. Si no aparece, revisar que canal tiene:
   integraciones_disponibles: ['int-glovo', ...]
```

---

## 📈 MÉTRICAS A VIGILAR

### **Diariamente:**
```
✅ Pedidos recibidos por canal (Dashboard)
✅ Tasa de éxito de integraciones (Integraciones)
✅ Pedidos pendientes de confirmación manual (Pedidos)
```

### **Semanalmente:**
```
✅ Evolución de pedidos por canal (Estadísticas)
✅ Ticket promedio por canal (Análisis)
✅ Logs de errores (Integraciones → Logs)
```

### **Mensualmente:**
```
✅ Crecimiento de cada canal (Comparativa mes a mes)
✅ Retorno de inversión por canal (Ingresos vs. Costes)
✅ Satisfacción de clientes por canal (Encuestas)
```

---

## 🚀 PRÓXIMOS PASOS

### **Para maximizar el sistema:**

1. **Entrenar al equipo:**
   - Mostrar cómo confirmar pedidos de WhatsApp
   - Enseñar a revisar logs
   - Explicar flujo completo

2. **Promocionar canales digitales:**
   - Anunciar WhatsApp en redes sociales
   - Añadir botón de WhatsApp en web
   - Promoción: "Pide por WhatsApp y ahorra tiempo"

3. **Monitorear y optimizar:**
   - Revisar tasa de éxito semanal
   - Ajustar parsers si baja confianza
   - Añadir productos al catálogo si faltan

4. **Expandir:**
   - Añadir Instagram Direct
   - Añadir Facebook Messenger
   - Añadir Telegram

---

## 📞 CONTACTO Y SOPORTE

### **Si necesitas ayuda:**

1. **Revisar logs:**
   ```
   Configuración → Integraciones → [Click en integración] → Ver Logs
   ```

2. **Verificar estado:**
   ```
   Integraciones → Ver estado de todas las integraciones
   ```

3. **Documentación completa:**
   - `/FASE_4_IMPLEMENTACION_COMPLETA.md` → Guía técnica detallada
   - `/AUDITORIA_SISTEMA_PEDIDOS_EXISTENTE.md` → Arquitectura del sistema
   - `/CANALES_VENTA_README.md` → Documentación para desarrolladores

---

🎉 **¡Sistema listo para usar!** 🎉

**Comienza ahora:**
1. Configurar tu primer canal (WhatsApp recomendado)
2. Recibir primer pedido automático
3. Ver estadísticas en tiempo real
4. ¡Escalar tu negocio! 🚀
