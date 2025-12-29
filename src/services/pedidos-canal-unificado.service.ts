/**
 * 🎯 SERVICIO UNIFICADO DE PROCESAMIENTO DE PEDIDOS
 * 
 * Conecta el nuevo sistema de Canales de Venta con el sistema existente de pedidos.
 * 
 * Responsabilidades:
 * - Recibir pedidos de todos los canales (WhatsApp, Email, Marketplace, etc.)
 * - Usar parsers específicos según el canal
 * - Reutilizar convertirPedidoAgregadorAInterno() existente
 * - Crear pedidos en PedidosContext
 * - Notificar a usuarios
 * 
 * IMPORTANTE: Este servicio NO duplica lógica, solo CONECTA sistemas existentes.
 */

import { PedidoAgregador } from '../lib/aggregator-adapter';
import { 
  convertirPedidoAgregadorAInterno,
  type PedidoDelivery 
} from './pedidos-delivery.service';
import { 
  procesarMensajeWhatsApp,
  generarMensajeConfirmacion,
  generarMensajeError,
  type MensajeWhatsApp
} from './parsers/whatsapp-parser';
import {
  procesarEmailPedido,
  generarEmailConfirmacion,
  type EmailPedido
} from './parsers/email-parser';
import type { Producto } from '../contexts/ProductosContext';
import type { IntegracionCanal } from '../utils/canales-venta';

// ============================================================================
// TIPOS
// ============================================================================

export type CanalOrigen = 
  | 'whatsapp'
  | 'email'
  | 'glovo'
  | 'uber_eats'
  | 'justeat'
  | 'deliveroo'
  | 'telefonico'
  | 'marketplace'
  | 'tpv'
  | 'online';

export interface ResultadoProcesamiento {
  exito: boolean;
  pedido?: PedidoDelivery;
  pedidoId?: string;
  canal: CanalOrigen;
  confianza?: number;
  mensaje?: string;
  error?: string;
  requiereConfirmacionManual?: boolean;
}

export interface WebhookPayload {
  canal: CanalOrigen;
  integracionId: string;
  datos: any; // Datos específicos del canal
  timestamp: Date;
}

// ============================================================================
// PROCESAMIENTO POR CANAL
// ============================================================================

/**
 * Procesa un webhook de WhatsApp
 */
async function procesarWebhookWhatsApp(
  payload: any,
  catalogo: Producto[]
): Promise<ResultadoProcesamiento> {
  
  try {
    // Convertir payload a MensajeWhatsApp
    const mensaje: MensajeWhatsApp = {
      id: payload.id || `wa-${Date.now()}`,
      from: payload.from || payload.phone,
      timestamp: new Date(payload.timestamp || Date.now()),
      text: payload.text || payload.message || payload.body,
      contact: payload.contact
    };
    
    // Usar parser de WhatsApp
    const { pedido, resultado } = procesarMensajeWhatsApp(mensaje, catalogo);
    
    if (!pedido) {
      return {
        exito: false,
        canal: 'whatsapp',
        error: resultado.error || 'No se pudo parsear el mensaje',
        confianza: resultado.confianza,
        mensaje: generarMensajeError()
      };
    }
    
    // Convertir a formato interno usando servicio existente
    const pedidoInterno = convertirPedidoAgregadorAInterno(pedido, 'whatsapp' as any);
    
    // Determinar si requiere confirmación manual
    const requiereConfirmacion = resultado.confianza < 0.8;
    
    return {
      exito: true,
      pedido: pedidoInterno,
      pedidoId: pedidoInterno.id,
      canal: 'whatsapp',
      confianza: resultado.confianza,
      requiereConfirmacionManual: requiereConfirmacion,
      mensaje: generarMensajeConfirmacion(resultado)
    };
    
  } catch (error: any) {
    console.error('Error procesando webhook WhatsApp:', error);
    return {
      exito: false,
      canal: 'whatsapp',
      error: error.message,
      mensaje: generarMensajeError()
    };
  }
}

/**
 * Procesa un webhook de Email
 */
async function procesarWebhookEmail(
  payload: any,
  catalogo: Producto[]
): Promise<ResultadoProcesamiento> {
  
  try {
    // Convertir payload a EmailPedido
    const email: EmailPedido = {
      id: payload.id || `email-${Date.now()}`,
      from: payload.from || payload.sender,
      subject: payload.subject || '',
      body: payload.body || payload.html || '',
      bodyText: payload.bodyText || payload.text,
      timestamp: new Date(payload.timestamp || Date.now())
    };
    
    // Usar parser de Email
    const { pedido, resultado } = procesarEmailPedido(email, catalogo);
    
    if (!pedido) {
      return {
        exito: false,
        canal: 'email',
        error: resultado.error || 'No se pudo parsear el email',
        mensaje: generarEmailConfirmacion(resultado).subject
      };
    }
    
    // Convertir a formato interno
    const pedidoInterno = convertirPedidoAgregadorAInterno(pedido, 'email' as any);
    
    return {
      exito: true,
      pedido: pedidoInterno,
      pedidoId: pedidoInterno.id,
      canal: 'email',
      mensaje: generarEmailConfirmacion(resultado).subject
    };
    
  } catch (error: any) {
    console.error('Error procesando webhook Email:', error);
    return {
      exito: false,
      canal: 'email',
      error: error.message
    };
  }
}

/**
 * Procesa un webhook de Marketplace (Glovo, Uber Eats, etc.)
 * NOTA: Este ya existe en pedidos-delivery.service.ts, solo lo envolvemos
 */
async function procesarWebhookMarketplace(
  canal: 'glovo' | 'uber_eats' | 'justeat' | 'deliveroo',
  payload: any
): Promise<ResultadoProcesamiento> {
  
  try {
    // IMPORTANTE: Aquí se debe usar el procesarWebhookDelivery existente
    // Por ahora simulamos la estructura
    
    // En producción, esto sería:
    // const pedidoInterno = await procesarWebhookDelivery(canal, payload);
    
    // Simulación básica:
    const pedidoAgregador: PedidoAgregador = {
      id_externo: payload.order_id || payload.id,
      agregador: canal,
      fecha_creacion: new Date(payload.created_at || Date.now()),
      estado: payload.status,
      cliente: payload.customer || payload.client,
      entrega: payload.delivery || payload.address,
      items: payload.items || payload.products,
      totales: payload.totals || payload.pricing
    };
    
    const pedidoInterno = convertirPedidoAgregadorAInterno(pedidoAgregador, canal as any);
    
    return {
      exito: true,
      pedido: pedidoInterno,
      pedidoId: pedidoInterno.id,
      canal: canal as CanalOrigen,
      confianza: 1.0 // Los webhooks de marketplace son 100% confiables
    };
    
  } catch (error: any) {
    console.error(`Error procesando webhook ${canal}:`, error);
    return {
      exito: false,
      canal: canal as CanalOrigen,
      error: error.message
    };
  }
}

// ============================================================================
// FUNCIÓN PRINCIPAL DE PROCESAMIENTO
// ============================================================================

/**
 * Procesa un webhook de cualquier canal
 * 
 * Esta es la función principal que se llama desde el backend.
 * Detecta el canal y delega al procesador específico.
 */
export async function procesarWebhookCanal(
  webhookPayload: WebhookPayload,
  catalogo: Producto[]
): Promise<ResultadoProcesamiento> {
  
  console.log(`📥 Procesando webhook de canal: ${webhookPayload.canal}`);
  
  switch (webhookPayload.canal) {
    case 'whatsapp':
      return procesarWebhookWhatsApp(webhookPayload.datos, catalogo);
    
    case 'email':
      return procesarWebhookEmail(webhookPayload.datos, catalogo);
    
    case 'glovo':
    case 'uber_eats':
    case 'justeat':
    case 'deliveroo':
      return procesarWebhookMarketplace(webhookPayload.canal, webhookPayload.datos);
    
    default:
      return {
        exito: false,
        canal: webhookPayload.canal,
        error: `Canal no soportado: ${webhookPayload.canal}`
      };
  }
}

// ============================================================================
// INTEGRACIÓN CON PEDIDOS CONTEXT
// ============================================================================

/**
 * Crea un pedido en el sistema usando PedidosContext
 * 
 * NOTA: Esta función debe ser llamada desde el componente React
 * que tenga acceso al contexto, no desde aquí directamente.
 */
export interface CrearPedidoEnContextoParams {
  pedidoDelivery: PedidoDelivery;
  userId: string;
  userName: string;
}

/**
 * Convierte PedidoDelivery al formato esperado por PedidosContext
 */
export function convertirPedidoDeliveryAContexto(pedido: PedidoDelivery): any {
  return {
    clienteNombre: pedido.cliente.nombre,
    clienteEmail: pedido.cliente.email || '',
    clienteTelefono: pedido.cliente.telefono,
    items: pedido.items,
    tipoEntrega: pedido.tipoEntrega || 'domicilio',
    direccionEntrega: pedido.cliente.direccion,
    metodoPago: pedido.metodoPago || 'pendiente',
    observaciones: pedido.observaciones,
    // Agregar información del canal
    canalOrigen: pedido.agregador,
    idAgregadorExterno: pedido.idAgregadorExterno
  };
}

// ============================================================================
// NOTIFICACIONES
// ============================================================================

/**
 * Envía notificación de nuevo pedido
 */
export async function notificarNuevoPedido(
  resultado: ResultadoProcesamiento,
  integracion: IntegracionCanal
): Promise<void> {
  
  if (!resultado.exito || !resultado.pedido) {
    console.warn('No se puede notificar pedido fallido');
    return;
  }
  
  const mensaje = `
    🔔 Nuevo pedido desde ${integracion.nombre}
    
    Cliente: ${resultado.pedido.cliente.nombre}
    Total: ${resultado.pedido.total.toFixed(2)}€
    Productos: ${resultado.pedido.items.length}
    
    ${resultado.requiereConfirmacionManual ? '⚠️ Requiere confirmación manual' : '✅ Pedido automático'}
  `;
  
  console.log(mensaje);
  
  // Aquí se integraría con notificationsService
  // await notificationsService.enviarNotificacion({
  //   tipo: 'nuevo_pedido',
  //   mensaje,
  //   prioridad: resultado.requiereConfirmacionManual ? 'alta' : 'normal'
  // });
}

// ============================================================================
// RESPUESTAS AUTOMÁTICAS
// ============================================================================

/**
 * Envía respuesta automática al cliente según el canal
 */
export async function enviarRespuestaAutomatica(
  resultado: ResultadoProcesamiento,
  integracion: IntegracionCanal,
  datosContacto: { telefono?: string; email?: string }
): Promise<void> {
  
  if (!resultado.mensaje) return;
  
  switch (resultado.canal) {
    case 'whatsapp':
      if (datosContacto.telefono) {
        await enviarMensajeWhatsApp(datosContacto.telefono, resultado.mensaje, integracion);
      }
      break;
    
    case 'email':
      if (datosContacto.email) {
        await enviarEmailRespuesta(datosContacto.email, resultado.mensaje, integracion);
      }
      break;
  }
}

/**
 * Envía mensaje de WhatsApp usando la integración configurada
 */
async function enviarMensajeWhatsApp(
  telefono: string,
  mensaje: string,
  integracion: IntegracionCanal
): Promise<void> {
  
  console.log(`📱 Enviando WhatsApp a ${telefono}:`, mensaje);
  
  // Aquí se integraría con la API de WhatsApp Business
  // según la configuración de la integración
  
  const config = integracion.config;
  
  if (integracion.proveedor === 'Meta' && config.access_token) {
    // WhatsApp Business API
    // await fetch(`https://graph.facebook.com/v18.0/${config.phone_number_id}/messages`, {
    //   method: 'POST',
    //   headers: {
    //     'Authorization': `Bearer ${config.access_token}`,
    //     'Content-Type': 'application/json'
    //   },
    //   body: JSON.stringify({
    //     messaging_product: 'whatsapp',
    //     to: telefono,
    //     text: { body: mensaje }
    //   })
    // });
  } else if (integracion.proveedor === 'Twilio' && config.auth_token) {
    // Twilio WhatsApp
    // await fetch(`https://api.twilio.com/2010-04-01/Accounts/${config.account_sid}/Messages.json`, {
    //   method: 'POST',
    //   headers: {
    //     'Authorization': `Basic ${btoa(`${config.account_sid}:${config.auth_token}`)}`,
    //     'Content-Type': 'application/x-www-form-urlencoded'
    //   },
    //   body: new URLSearchParams({
    //     From: config.whatsapp_number,
    //     To: `whatsapp:${telefono}`,
    //     Body: mensaje
    //   })
    // });
  }
}

/**
 * Envía email de respuesta usando la integración configurada
 */
async function enviarEmailRespuesta(
  email: string,
  asunto: string,
  integracion: IntegracionCanal
): Promise<void> {
  
  console.log(`📧 Enviando Email a ${email}:`, asunto);
  
  // Aquí se integraría con SMTP o servicio de email
  const config = integracion.config;
  
  // Simulación de envío SMTP
  // const transporter = nodemailer.createTransport({
  //   host: config.smtp_host,
  //   port: config.smtp_port,
  //   secure: config.uso_ssl === 'true',
  //   auth: {
  //     user: config.smtp_user,
  //     pass: config.smtp_password
  //   }
  // });
  // 
  // await transporter.sendMail({
  //   from: config.smtp_user,
  //   to: email,
  //   subject: asunto,
  //   html: mensaje
  // });
}

// ============================================================================
// ESTADÍSTICAS
// ============================================================================

/**
 * Actualiza estadísticas de la integración
 */
export function actualizarEstadisticasIntegracion(
  integracionId: string,
  resultado: ResultadoProcesamiento
): void {
  
  // Aquí se actualizarían las estadísticas en el sistema de canales
  console.log(`📊 Actualizando estadísticas de integración ${integracionId}:`, {
    exito: resultado.exito,
    canal: resultado.canal,
    confianza: resultado.confianza
  });
  
  // En producción:
  // const integracion = obtenerIntegracion(integracionId);
  // integracion.estadisticas.pedidos_recibidos_hoy += 1;
  // if (resultado.exito) {
  //   integracion.estadisticas.tasa_exito = ...;
  // }
  // actualizarIntegracion(integracionId, integracion);
}

// ============================================================================
// LOGS
// ============================================================================

/**
 * Registra log de procesamiento
 */
export function registrarLogProcesamiento(
  integracionId: string,
  resultado: ResultadoProcesamiento
): void {
  
  const log = {
    id: `log-${Date.now()}`,
    integracion_id: integracionId,
    timestamp: new Date().toISOString(),
    tipo: resultado.exito ? 'exito' : 'error',
    mensaje: resultado.exito 
      ? `Pedido procesado correctamente desde ${resultado.canal}`
      : `Error procesando pedido: ${resultado.error}`,
    detalles: {
      canal: resultado.canal,
      pedidoId: resultado.pedidoId,
      confianza: resultado.confianza,
      requiereConfirmacion: resultado.requiereConfirmacionManual
    }
  };
  
  console.log('📝 Log:', log);
  
  // En producción, guardar en KV Store o base de datos
}
