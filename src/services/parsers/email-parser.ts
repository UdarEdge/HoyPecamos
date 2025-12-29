/**
 * 📧 PARSER DE EMAILS DE PEDIDOS
 * 
 * Convierte emails estructurados en pedidos.
 * Soporta formatos comunes de emails de pedidos.
 * 
 * Flujo:
 * 1. Recibir email
 * 2. Detectar formato (tabla, lista, texto plano)
 * 3. Extraer productos y cantidades
 * 4. Extraer datos de cliente y entrega
 * 5. Crear objeto PedidoAgregador
 */

import { PedidoAgregador, EstadoPedidoAgregador } from '../../lib/aggregator-adapter';
import type { Producto } from '../../contexts/ProductosContext';

// ============================================================================
// TIPOS
// ============================================================================

export interface EmailPedido {
  id: string;
  from: string; // Email del cliente
  subject: string;
  body: string; // Contenido HTML o texto plano
  bodyText?: string; // Versión texto plano
  timestamp: Date;
  attachments?: any[];
}

export interface DatosClienteEmail {
  nombre?: string;
  email: string;
  telefono?: string;
  direccion?: string;
  codigoPostal?: string;
  ciudad?: string;
}

export interface ProductoEmail {
  nombre: string;
  cantidad: number;
  precio?: number;
  referencia?: string;
}

export interface ResultadoEmailParseo {
  exito: boolean;
  cliente: DatosClienteEmail;
  productos: ProductoEmail[];
  observaciones?: string;
  total?: number;
  error?: string;
}

// ============================================================================
// PATRONES DE DETECCIÓN
// ============================================================================

const PATRONES_ASUNTO = [
  /pedido/i,
  /orden/i,
  /solicitud/i,
  /compra/i,
  /encargar/i,
  /order/i
];

const PATRONES_TABLA = {
  cantidad: /cantidad|cant\.|qty|quantity/i,
  producto: /producto|artículo|item|descripción/i,
  precio: /precio|price|importe/i
};

// Patrón para extraer productos de listas
const PATRON_LISTA_PRODUCTOS = [
  /(\d+)\s*x\s*([^\n\r]+)/gi, // "2x Pizza Margarita"
  /(\d+)\s+unidades?\s+de\s+([^\n\r]+)/gi, // "2 unidades de Pizza"
  /(\d+)\s+-\s+([^\n\r]+)/gi, // "2 - Pizza Margarita"
  /•\s*(\d+)\s+([^\n\r]+)/gi, // "• 2 Pizza Margarita"
  /-\s*(\d+)\s+([^\n\r]+)/gi // "- 2 Pizza Margarita"
];

// Patrones para extraer información de contacto
const PATRON_EMAIL = /([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/;
const PATRON_TELEFONO = /(?:(?:\+|00)34)?[\s.-]?[6-9]\d{2}[\s.-]?\d{3}[\s.-]?\d{3}/;
const PATRON_CODIGO_POSTAL = /\b(\d{5})\b/;

// ============================================================================
// FUNCIONES DE PARSEO
// ============================================================================

/**
 * Detecta si el email es un pedido
 */
export function esEmailDePedido(email: EmailPedido): boolean {
  const asuntoLower = email.subject.toLowerCase();
  return PATRONES_ASUNTO.some(patron => patron.test(asuntoLower));
}

/**
 * Convierte HTML a texto plano (básico)
 */
function htmlATexto(html: string): string {
  return html
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/p>/gi, '\n')
    .replace(/<\/div>/gi, '\n')
    .replace(/<[^>]+>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .trim();
}

/**
 * Extrae datos del cliente del email
 */
export function extraerDatosCliente(email: EmailPedido): DatosClienteEmail {
  const texto = htmlATexto(email.bodyText || email.body);
  
  // Email
  const emailCliente = email.from;
  
  // Nombre (intentar extraer del remitente)
  let nombre: string | undefined;
  const matchNombre = email.from.match(/^([^<]+)</);
  if (matchNombre) {
    nombre = matchNombre[1].trim();
  }
  
  // Teléfono
  const matchTelefono = texto.match(PATRON_TELEFONO);
  const telefono = matchTelefono ? matchTelefono[0].replace(/[\s.-]/g, '') : undefined;
  
  // Dirección (buscar después de palabras clave)
  let direccion: string | undefined;
  const matchDireccion = texto.match(/(?:dirección|direccion|entrega|envío|envio):\s*([^\n]+)/i);
  if (matchDireccion) {
    direccion = matchDireccion[1].trim();
  }
  
  // Código postal
  const matchCP = texto.match(PATRON_CODIGO_POSTAL);
  const codigoPostal = matchCP ? matchCP[1] : undefined;
  
  // Ciudad (intentar extraer de la dirección)
  let ciudad: string | undefined;
  if (direccion) {
    const partesDireccion = direccion.split(',');
    if (partesDireccion.length > 1) {
      ciudad = partesDireccion[partesDireccion.length - 1].trim();
    }
  }
  
  return {
    nombre,
    email: emailCliente,
    telefono,
    direccion,
    codigoPostal,
    ciudad
  };
}

/**
 * Extrae productos de una tabla HTML
 */
function extraerProductosDeTabla(html: string): ProductoEmail[] {
  const productos: ProductoEmail[] = [];
  
  // Buscar tabla
  const tablaMatch = html.match(/<table[^>]*>(.*?)<\/table>/is);
  if (!tablaMatch) return productos;
  
  const tabla = tablaMatch[1];
  
  // Extraer filas
  const filas = tabla.match(/<tr[^>]*>(.*?)<\/tr>/gis);
  if (!filas || filas.length < 2) return productos; // Necesitamos al menos header + 1 fila
  
  // Identificar columnas del header
  const header = filas[0];
  const celdasHeader = header.match(/<th[^>]*>(.*?)<\/th>/gis) || 
                       header.match(/<td[^>]*>(.*?)<\/td>/gis);
  
  if (!celdasHeader) return productos;
  
  let colCantidad = -1;
  let colProducto = -1;
  let colPrecio = -1;
  
  celdasHeader.forEach((celda, index) => {
    const texto = htmlATexto(celda).toLowerCase();
    if (PATRONES_TABLA.cantidad.test(texto)) colCantidad = index;
    if (PATRONES_TABLA.producto.test(texto)) colProducto = index;
    if (PATRONES_TABLA.precio.test(texto)) colPrecio = index;
  });
  
  // Si no encontramos las columnas esenciales, salir
  if (colProducto === -1) return productos;
  
  // Procesar filas de datos
  for (let i = 1; i < filas.length; i++) {
    const fila = filas[i];
    const celdas = fila.match(/<td[^>]*>(.*?)<\/td>/gis);
    
    if (!celdas) continue;
    
    const cantidad = colCantidad !== -1 && celdas[colCantidad]
      ? parseInt(htmlATexto(celdas[colCantidad]))
      : 1;
    
    const nombre = celdas[colProducto]
      ? htmlATexto(celdas[colProducto])
      : '';
    
    const precio = colPrecio !== -1 && celdas[colPrecio]
      ? parseFloat(htmlATexto(celdas[colPrecio]).replace(/[^\d.,]/g, '').replace(',', '.'))
      : undefined;
    
    if (nombre && !isNaN(cantidad)) {
      productos.push({ nombre, cantidad, precio });
    }
  }
  
  return productos;
}

/**
 * Extrae productos de una lista de texto
 */
function extraerProductosDeLista(texto: string): ProductoEmail[] {
  const productos: ProductoEmail[] = [];
  
  for (const patron of PATRON_LISTA_PRODUCTOS) {
    let match;
    patron.lastIndex = 0;
    
    while ((match = patron.exec(texto)) !== null) {
      const cantidad = parseInt(match[1]);
      const nombre = match[2].trim();
      
      if (!isNaN(cantidad) && nombre) {
        // Intentar extraer precio del nombre
        const matchPrecio = nombre.match(/([€$]?\s*\d+[.,]\d{2})/);
        const precio = matchPrecio
          ? parseFloat(matchPrecio[1].replace(/[€$\s]/g, '').replace(',', '.'))
          : undefined;
        
        const nombreLimpio = nombre.replace(/([€$]?\s*\d+[.,]\d{2})/, '').trim();
        
        productos.push({
          nombre: nombreLimpio,
          cantidad,
          precio
        });
      }
    }
  }
  
  return productos;
}

/**
 * Valida y enriquece productos con el catálogo
 */
function validarProductosConCatalogo(
  productosEmail: ProductoEmail[],
  catalogo: Producto[]
): ProductoEmail[] {
  
  return productosEmail.map(productoEmail => {
    // Buscar en catálogo
    const productoEncontrado = catalogo.find(p => 
      p.nombre.toLowerCase().includes(productoEmail.nombre.toLowerCase()) ||
      productoEmail.nombre.toLowerCase().includes(p.nombre.toLowerCase())
    );
    
    if (productoEncontrado) {
      return {
        ...productoEmail,
        nombre: productoEncontrado.nombre, // Nombre correcto del catálogo
        precio: productoEmail.precio || productoEncontrado.precio,
        referencia: productoEncontrado.id
      };
    }
    
    return productoEmail;
  });
}

/**
 * Parser principal de email
 */
export function parsearEmailPedido(
  email: EmailPedido,
  catalogo: Producto[]
): ResultadoEmailParseo {
  
  // Verificar si es un email de pedido
  if (!esEmailDePedido(email)) {
    return {
      exito: false,
      cliente: { email: email.from },
      productos: [],
      error: 'El email no parece ser un pedido'
    };
  }
  
  // Extraer datos del cliente
  const cliente = extraerDatosCliente(email);
  
  // Intentar extraer productos de tabla HTML
  let productos = extraerProductosDeTabla(email.body);
  
  // Si no hay tabla, intentar con listas de texto
  if (productos.length === 0) {
    const texto = htmlATexto(email.bodyText || email.body);
    productos = extraerProductosDeLista(texto);
  }
  
  if (productos.length === 0) {
    return {
      exito: false,
      cliente,
      productos: [],
      error: 'No se pudieron identificar productos en el email'
    };
  }
  
  // Validar con catálogo
  productos = validarProductosConCatalogo(productos, catalogo);
  
  // Calcular total
  const total = productos.reduce((sum, p) => sum + ((p.precio || 0) * p.cantidad), 0);
  
  // Extraer observaciones (buscar sección de notas/comentarios)
  const texto = htmlATexto(email.bodyText || email.body);
  const matchObservaciones = texto.match(/(?:notas?|comentarios?|observaciones?):\s*([^\n]+)/i);
  const observaciones = matchObservaciones ? matchObservaciones[1].trim() : undefined;
  
  return {
    exito: true,
    cliente,
    productos,
    observaciones,
    total
  };
}

/**
 * Convierte el resultado del parseo a formato PedidoAgregador
 */
export function convertirEmailAPedidoAgregador(
  resultado: ResultadoEmailParseo,
  emailId: string
): PedidoAgregador {
  
  const total = resultado.total || 
    resultado.productos.reduce((sum, p) => sum + ((p.precio || 0) * p.cantidad), 0);
  
  const iva = total * 0.10; // 10% IVA por defecto
  const subtotal = total - iva;
  
  return {
    id_externo: emailId,
    agregador: 'email',
    fecha_creacion: new Date(),
    estado: EstadoPedidoAgregador.NUEVO,
    
    cliente: {
      nombre: resultado.cliente.nombre || 'Cliente Email',
      telefono: resultado.cliente.telefono || '',
      email: resultado.cliente.email
    },
    
    entrega: {
      direccion: resultado.cliente.direccion || 'Por definir',
      codigo_postal: resultado.cliente.codigoPostal || '',
      ciudad: resultado.cliente.ciudad || '',
      notas: resultado.observaciones
    },
    
    items: resultado.productos.map(p => ({
      id_externo: p.referencia || `PROD-${Date.now()}`,
      sku: p.referencia,
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
      canal: 'email',
      asunto: undefined // Se puede agregar si es necesario
    }
  };
}

// ============================================================================
// FUNCIÓN PRINCIPAL TODO-EN-UNO
// ============================================================================

/**
 * Procesa un email y lo convierte en un PedidoAgregador
 * 
 * @param email Email recibido
 * @param catalogo Catálogo de productos para validar
 * @returns PedidoAgregador o null si no se pudo parsear
 */
export function procesarEmailPedido(
  email: EmailPedido,
  catalogo: Producto[]
): { pedido: PedidoAgregador | null; resultado: ResultadoEmailParseo } {
  
  const resultado = parsearEmailPedido(email, catalogo);
  
  if (!resultado.exito) {
    return { pedido: null, resultado };
  }
  
  const pedido = convertirEmailAPedidoAgregador(resultado, email.id);
  
  return { pedido, resultado };
}

// ============================================================================
// FUNCIONES DE UTILIDAD
// ============================================================================

/**
 * Genera email de confirmación para el cliente
 */
export function generarEmailConfirmacion(resultado: ResultadoEmailParseo): {
  subject: string;
  body: string;
} {
  
  if (!resultado.exito) {
    return {
      subject: '❌ No pudimos procesar tu pedido',
      body: `
        <h2>Error al procesar pedido</h2>
        <p>Lo sentimos, no pudimos procesar tu pedido automáticamente.</p>
        <p>Por favor, contacta con nosotros directamente.</p>
        <p><strong>Error:</strong> ${resultado.error}</p>
      `
    };
  }
  
  const productosHTML = resultado.productos.map(p => `
    <tr>
      <td>${p.cantidad}</td>
      <td>${p.nombre}</td>
      <td>${p.precio ? `${p.precio.toFixed(2)}€` : '-'}</td>
      <td>${p.precio ? `${(p.precio * p.cantidad).toFixed(2)}€` : '-'}</td>
    </tr>
  `).join('');
  
  return {
    subject: '✅ Pedido recibido - Confirmación',
    body: `
      <h2>¡Pedido recibido correctamente!</h2>
      <p>Hola ${resultado.cliente.nombre || 'cliente'},</p>
      <p>Hemos recibido tu pedido y lo estamos procesando.</p>
      
      <h3>Resumen del pedido:</h3>
      <table border="1" cellpadding="10">
        <thead>
          <tr>
            <th>Cantidad</th>
            <th>Producto</th>
            <th>Precio Unit.</th>
            <th>Subtotal</th>
          </tr>
        </thead>
        <tbody>
          ${productosHTML}
        </tbody>
      </table>
      
      ${resultado.total ? `<p><strong>Total: ${resultado.total.toFixed(2)}€</strong></p>` : ''}
      
      ${resultado.observaciones ? `<p><strong>Observaciones:</strong> ${resultado.observaciones}</p>` : ''}
      
      <p>Te confirmaremos la preparación de tu pedido en breve.</p>
      <p>¡Gracias por tu confianza!</p>
    `
  };
}
