/**
 * 📱 PARSER DE MENSAJES DE WHATSAPP
 * 
 * Convierte mensajes de WhatsApp en pedidos estructurados.
 * Detecta intenciones de pedido y extrae productos automáticamente.
 * 
 * Flujo:
 * 1. Recibir mensaje de WhatsApp
 * 2. Detectar intención de pedido
 * 3. Extraer productos y cantidades
 * 4. Validar contra catálogo
 * 5. Crear objeto PedidoAgregador
 * 6. Usar convertirPedidoAgregadorAInterno() para formato interno
 */

import { PedidoAgregador, EstadoPedidoAgregador } from '../../lib/aggregator-adapter';
import type { Producto } from '../../contexts/ProductosContext';

// ============================================================================
// TIPOS
// ============================================================================

export interface MensajeWhatsApp {
  id: string;
  from: string; // Número de teléfono del cliente
  timestamp: Date;
  text: string;
  contact?: {
    name?: string;
  };
}

export interface ProductoDetectado {
  nombre: string;
  cantidad: number;
  confianza: number; // 0-1
  productoId?: string;
  precio?: number;
}

export interface ResultadoParseo {
  exito: boolean;
  confianza: number; // 0-1 (confianza general del parseo)
  productos: ProductoDetectado[];
  clienteNombre?: string;
  clienteTelefono: string;
  observaciones?: string;
  error?: string;
}

// ============================================================================
// PATRONES DE DETECCIÓN
// ============================================================================

const PALABRAS_CLAVE_PEDIDO = [
  'quiero',
  'pedir',
  'pedido',
  'solicitar',
  'encargar',
  'ordenar',
  'comprar',
  'llevar',
  'necesito',
  'me gustaría',
  'podría',
  'quisiera'
];

const PALABRAS_CLAVE_CANTIDAD = {
  'un': 1, 'una': 1,
  'dos': 2,
  'tres': 3,
  'cuatro': 4,
  'cinco': 5,
  'seis': 6,
  'siete': 7,
  'ocho': 8,
  'nueve': 9,
  'diez': 10
};

const PATRONES_CANTIDAD = [
  /(\d+)\s*x\s*([a-záéíóúñ\s]+)/gi, // "2x pizza margarita"
  /(\d+)\s+de\s+([a-záéíóúñ\s]+)/gi, // "2 de pizza margarita"
  /(\d+)\s+([a-záéíóúñ\s]+)/gi, // "2 pizza margarita"
  /(un|una|dos|tres|cuatro|cinco|seis|siete|ocho|nueve|diez)\s+([a-záéíóúñ\s]+)/gi // "dos pizzas"
];

// ============================================================================
// FUNCIONES DE PARSEO
// ============================================================================

/**
 * Detecta si el mensaje tiene intención de pedido
 */
export function esIntencioDePedido(mensaje: string): boolean {
  const mensajeLower = mensaje.toLowerCase();
  
  // Verificar palabras clave
  const tieneIntencioDePedido = PALABRAS_CLAVE_PEDIDO.some(palabra => 
    mensajeLower.includes(palabra)
  );
  
  // Verificar patrones numéricos (ej: "2 pizzas")
  const tienePatronCantidad = PATRONES_CANTIDAD.some(patron => 
    patron.test(mensaje)
  );
  
  return tieneIntencioDePedido || tienePatronCantidad;
}

/**
 * Extrae productos y cantidades del mensaje
 */
export function extraerProductos(mensaje: string, catalogo: Producto[]): ProductoDetectado[] {
  const productosDetectados: ProductoDetectado[] = [];
  const mensajeLower = mensaje.toLowerCase();
  
  // Intentar con cada patrón
  for (const patron of PATRONES_CANTIDAD) {
    let match;
    patron.lastIndex = 0; // Reset regex
    
    while ((match = patron.exec(mensaje)) !== null) {
      const cantidadStr = match[1];
      const nombreProducto = match[2].trim();
      
      // Convertir cantidad
      let cantidad = parseInt(cantidadStr);
      if (isNaN(cantidad)) {
        cantidad = PALABRAS_CLAVE_CANTIDAD[cantidadStr.toLowerCase()] || 1;
      }
      
      // Buscar producto en catálogo
      const productoEncontrado = buscarProductoEnCatalogo(nombreProducto, catalogo);
      
      if (productoEncontrado) {
        productosDetectados.push({
          nombre: productoEncontrado.nombre,
          cantidad,
          confianza: productoEncontrado.confianza,
          productoId: productoEncontrado.id,
          precio: productoEncontrado.precio
        });
      } else {
        // Producto no encontrado en catálogo, agregar con baja confianza
        productosDetectados.push({
          nombre: nombreProducto,
          cantidad,
          confianza: 0.3
        });
      }
    }
  }
  
  // Si no se encontraron patrones, intentar buscar nombres de productos directamente
  if (productosDetectados.length === 0) {
    for (const producto of catalogo) {
      const nombreProductoLower = producto.nombre.toLowerCase();
      if (mensajeLower.includes(nombreProductoLower)) {
        productosDetectados.push({
          nombre: producto.nombre,
          cantidad: 1,
          confianza: 0.7,
          productoId: producto.id,
          precio: producto.precio
        });
      }
    }
  }
  
  return productosDetectados;
}

/**
 * Busca un producto en el catálogo con similitud de texto
 */
function buscarProductoEnCatalogo(nombreBuscado: string, catalogo: Producto[]): 
  { id: string; nombre: string; precio: number; confianza: number } | null {
  
  const nombreBuscadoLower = nombreBuscado.toLowerCase();
  let mejorCoincidencia: { id: string; nombre: string; precio: number; confianza: number } | null = null;
  let mejorSimilitud = 0;
  
  for (const producto of catalogo) {
    const nombreProductoLower = producto.nombre.toLowerCase();
    
    // Coincidencia exacta
    if (nombreProductoLower === nombreBuscadoLower) {
      return { 
        id: producto.id, 
        nombre: producto.nombre, 
        precio: producto.precio,
        confianza: 1.0 
      };
    }
    
    // Contiene el nombre
    if (nombreProductoLower.includes(nombreBuscadoLower) || 
        nombreBuscadoLower.includes(nombreProductoLower)) {
      const similitud = calcularSimilitud(nombreBuscadoLower, nombreProductoLower);
      if (similitud > mejorSimilitud) {
        mejorSimilitud = similitud;
        mejorCoincidencia = { 
          id: producto.id, 
          nombre: producto.nombre, 
          precio: producto.precio,
          confianza: similitud 
        };
      }
    }
  }
  
  // Solo retornar si la similitud es mayor al 50%
  return mejorSimilitud > 0.5 ? mejorCoincidencia : null;
}

/**
 * Calcula similitud entre dos textos (algoritmo básico)
 */
function calcularSimilitud(texto1: string, texto2: string): number {
  const palabras1 = texto1.split(' ');
  const palabras2 = texto2.split(' ');
  
  let coincidencias = 0;
  for (const palabra1 of palabras1) {
    for (const palabra2 of palabras2) {
      if (palabra1 === palabra2 || palabra1.includes(palabra2) || palabra2.includes(palabra1)) {
        coincidencias++;
      }
    }
  }
  
  const total = Math.max(palabras1.length, palabras2.length);
  return total > 0 ? coincidencias / total : 0;
}

/**
 * Extrae observaciones del mensaje
 */
export function extraerObservaciones(mensaje: string, productosDetectados: ProductoDetectado[]): string {
  let observaciones = mensaje;
  
  // Remover las partes que ya fueron parseadas como productos
  for (const producto of productosDetectados) {
    const regex = new RegExp(`\\d*\\s*x?\\s*${producto.nombre}`, 'gi');
    observaciones = observaciones.replace(regex, '');
  }
  
  // Remover palabras clave de pedido
  for (const palabra of PALABRAS_CLAVE_PEDIDO) {
    const regex = new RegExp(palabra, 'gi');
    observaciones = observaciones.replace(regex, '');
  }
  
  // Limpiar y recortar
  observaciones = observaciones
    .replace(/\s+/g, ' ')
    .trim();
  
  return observaciones.length > 5 ? observaciones : '';
}

/**
 * Parser principal de WhatsApp
 */
export function parsearMensajeWhatsApp(
  mensaje: MensajeWhatsApp,
  catalogo: Producto[]
): ResultadoParseo {
  
  // Verificar intención
  if (!esIntencioDePedido(mensaje.text)) {
    return {
      exito: false,
      confianza: 0,
      productos: [],
      clienteTelefono: mensaje.from,
      error: 'No se detectó intención de pedido en el mensaje'
    };
  }
  
  // Extraer productos
  const productos = extraerProductos(mensaje.text, catalogo);
  
  if (productos.length === 0) {
    return {
      exito: false,
      confianza: 0.2,
      productos: [],
      clienteTelefono: mensaje.from,
      error: 'No se pudieron identificar productos en el mensaje'
    };
  }
  
  // Calcular confianza general (promedio de confianzas de productos)
  const confianzaGeneral = productos.reduce((sum, p) => sum + p.confianza, 0) / productos.length;
  
  // Extraer observaciones
  const observaciones = extraerObservaciones(mensaje.text, productos);
  
  return {
    exito: true,
    confianza: confianzaGeneral,
    productos,
    clienteNombre: mensaje.contact?.name,
    clienteTelefono: mensaje.from,
    observaciones: observaciones || undefined
  };
}

/**
 * Convierte el resultado del parseo a formato PedidoAgregador
 */
export function convertirParseoAPedidoAgregador(
  resultado: ResultadoParseo,
  mensajeId: string
): PedidoAgregador {
  
  const total = resultado.productos.reduce((sum, p) => {
    return sum + ((p.precio || 0) * p.cantidad);
  }, 0);
  
  const iva = total * 0.10; // 10% IVA por defecto
  const subtotal = total - iva;
  
  return {
    id_externo: mensajeId,
    agregador: 'whatsapp',
    fecha_creacion: new Date(),
    estado: EstadoPedidoAgregador.NUEVO,
    
    cliente: {
      nombre: resultado.clienteNombre || 'Cliente WhatsApp',
      telefono: resultado.clienteTelefono,
      email: undefined
    },
    
    entrega: {
      direccion: 'Por definir',
      codigo_postal: '',
      ciudad: '',
      notas: resultado.observaciones
    },
    
    items: resultado.productos.map(p => ({
      id_externo: p.productoId || `PROD-${Date.now()}`,
      sku: p.productoId,
      nombre: p.nombre,
      cantidad: p.cantidad,
      precio_unitario: p.precio || 0,
      modificadores: []
    })),
    
    totales: {
      subtotal,
      impuestos: iva,
      descuentos: 0,
      propina: 0,
      costo_entrega: 0,
      total
    },
    
    metadata: {
      canal: 'whatsapp',
      confianza_parseo: resultado.confianza,
      mensaje_original: undefined // Se puede agregar si es necesario
    }
  };
}

// ============================================================================
// FUNCIÓN PRINCIPAL TODO-EN-UNO
// ============================================================================

/**
 * Procesa un mensaje de WhatsApp y lo convierte en un PedidoAgregador
 * 
 * @param mensaje Mensaje de WhatsApp recibido
 * @param catalogo Catálogo de productos para validar
 * @returns PedidoAgregador o null si no se pudo parsear
 */
export function procesarMensajeWhatsApp(
  mensaje: MensajeWhatsApp,
  catalogo: Producto[]
): { pedido: PedidoAgregador | null; resultado: ResultadoParseo } {
  
  const resultado = parsearMensajeWhatsApp(mensaje, catalogo);
  
  if (!resultado.exito) {
    return { pedido: null, resultado };
  }
  
  // Solo crear pedido si la confianza es mayor al 60%
  if (resultado.confianza < 0.6) {
    return { 
      pedido: null, 
      resultado: {
        ...resultado,
        error: 'Confianza muy baja en el parseo. Requiere confirmación manual.'
      }
    };
  }
  
  const pedido = convertirParseoAPedidoAgregador(resultado, mensaje.id);
  
  return { pedido, resultado };
}

// ============================================================================
// FUNCIONES DE UTILIDAD
// ============================================================================

/**
 * Genera mensaje de confirmación para enviar al cliente
 */
export function generarMensajeConfirmacion(resultado: ResultadoParseo): string {
  if (!resultado.exito) {
    return '❌ Lo siento, no pude entender tu pedido. ¿Podrías reformularlo?';
  }
  
  if (resultado.confianza < 0.6) {
    return '⚠️ He detectado tu pedido pero no estoy seguro. Un operador te confirmará pronto:\n\n' +
           resultado.productos.map(p => `• ${p.cantidad}x ${p.nombre}`).join('\n');
  }
  
  const total = resultado.productos.reduce((sum, p) => sum + ((p.precio || 0) * p.cantidad), 0);
  
  return '✅ ¡Pedido recibido!\n\n' +
         resultado.productos.map(p => 
           `• ${p.cantidad}x ${p.nombre}${p.precio ? ` - ${p.precio.toFixed(2)}€` : ''}`
         ).join('\n') +
         (total > 0 ? `\n\n💰 Total: ${total.toFixed(2)}€` : '') +
         '\n\nTe confirmaremos en breve. ¡Gracias! 🙌';
}

/**
 * Genera mensaje de error para el cliente
 */
export function generarMensajeError(): string {
  return '❌ Lo siento, no pude procesar tu pedido.\n\n' +
         'Por favor, inténtalo de nuevo o llámanos al teléfono de la tienda.\n\n' +
         'Ejemplo de pedido:\n' +
         '"Quiero 2 pizzas margarita y 1 coca-cola"';
}
