/**
 * 🎯 BACKEND: CANALES DE VENTA Y SUS INTEGRACIONES
 * 
 * Rutas para gestionar canales de venta e integraciones desde Supabase.
 */

import { Hono } from 'npm:hono';
import * as kv from './kv_store.tsx';

const app = new Hono();

// Prefijos de claves para KV Store
const PREFIX_CANALES = 'canales_venta:';
const PREFIX_INTEGRACIONES = 'integraciones_canales:';
const PREFIX_LOGS = 'logs_integraciones:';

// ============================================================================
// TIPOS
// ============================================================================

interface CanalVenta {
  id: string;
  nombre: string;
  nombre_corto: string;
  slug: string;
  icono: string;
  color: string;
  activo: boolean;
  orden: number;
  tipo: 'nativo' | 'externo';
  requiere_integracion: boolean;
  descripcion?: string;
  integraciones_disponibles: string[];
  integracion_activa?: string;
  created_at?: string;
  updated_at?: string;
}

interface IntegracionCanal {
  id: string;
  canal_id: string;
  nombre: string;
  proveedor: string;
  tipo: 'api' | 'webhook' | 'nativo' | 'manual';
  estado: 'conectada' | 'desconectada' | 'error' | 'configurando';
  activo: boolean;
  config: Record<string, any>;
  estadisticas?: {
    ultima_sincronizacion?: string;
    pedidos_recibidos_hoy?: number;
    pedidos_recibidos_mes?: number;
    tasa_exito?: number;
    total_sincronizaciones?: number;
  };
  logs?: any[];
  created_at?: string;
  updated_at?: string;
}

// ============================================================================
// RUTAS DE CANALES
// ============================================================================

/**
 * GET /canales
 * Obtener todos los canales de venta
 */
app.get('/canales', async (c) => {
  try {
    const canales = await kv.getByPrefix<CanalVenta>(PREFIX_CANALES);
    
    // Ordenar por orden
    const canalesOrdenados = canales.sort((a, b) => a.orden - b.orden);
    
    return c.json({
      success: true,
      data: canalesOrdenados
    });
  } catch (error: any) {
    console.error('Error al obtener canales:', error);
    return c.json({
      success: false,
      error: error.message
    }, 500);
  }
});

/**
 * GET /canales/:slug
 * Obtener un canal por slug
 */
app.get('/canales/:slug', async (c) => {
  try {
    const slug = c.req.param('slug');
    const canales = await kv.getByPrefix<CanalVenta>(PREFIX_CANALES);
    const canal = canales.find(c => c.slug === slug);
    
    if (!canal) {
      return c.json({
        success: false,
        error: 'Canal no encontrado'
      }, 404);
    }
    
    return c.json({
      success: true,
      data: canal
    });
  } catch (error: any) {
    console.error('Error al obtener canal:', error);
    return c.json({
      success: false,
      error: error.message
    }, 500);
  }
});

/**
 * POST /canales
 * Crear un nuevo canal
 */
app.post('/canales', async (c) => {
  try {
    const body = await c.req.json();
    const nuevoCanal: CanalVenta = {
      ...body,
      id: body.id || `canal-${Date.now()}`,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
    // Validar que el slug sea único
    const canalesExistentes = await kv.getByPrefix<CanalVenta>(PREFIX_CANALES);
    if (canalesExistentes.some(c => c.slug === nuevoCanal.slug)) {
      return c.json({
        success: false,
        error: 'Ya existe un canal con ese slug'
      }, 400);
    }
    
    await kv.set(`${PREFIX_CANALES}${nuevoCanal.id}`, nuevoCanal);
    
    return c.json({
      success: true,
      data: nuevoCanal
    }, 201);
  } catch (error: any) {
    console.error('Error al crear canal:', error);
    return c.json({
      success: false,
      error: error.message
    }, 500);
  }
});

/**
 * PUT /canales/:id
 * Actualizar un canal existente
 */
app.put('/canales/:id', async (c) => {
  try {
    const id = c.req.param('id');
    const body = await c.req.json();
    
    const canalExistente = await kv.get<CanalVenta>(`${PREFIX_CANALES}${id}`);
    if (!canalExistente) {
      return c.json({
        success: false,
        error: 'Canal no encontrado'
      }, 404);
    }
    
    // No permitir cambiar el tipo de canales nativos
    if (canalExistente.tipo === 'nativo' && body.tipo && body.tipo !== 'nativo') {
      return c.json({
        success: false,
        error: 'No se puede cambiar el tipo de canales nativos'
      }, 400);
    }
    
    const canalActualizado: CanalVenta = {
      ...canalExistente,
      ...body,
      id,
      updated_at: new Date().toISOString()
    };
    
    await kv.set(`${PREFIX_CANALES}${id}`, canalActualizado);
    
    return c.json({
      success: true,
      data: canalActualizado
    });
  } catch (error: any) {
    console.error('Error al actualizar canal:', error);
    return c.json({
      success: false,
      error: error.message
    }, 500);
  }
});

/**
 * DELETE /canales/:id
 * Eliminar un canal (solo externos)
 */
app.delete('/canales/:id', async (c) => {
  try {
    const id = c.req.param('id');
    
    const canal = await kv.get<CanalVenta>(`${PREFIX_CANALES}${id}`);
    if (!canal) {
      return c.json({
        success: false,
        error: 'Canal no encontrado'
      }, 404);
    }
    
    // No permitir eliminar canales nativos
    if (canal.tipo === 'nativo') {
      return c.json({
        success: false,
        error: 'No se pueden eliminar canales nativos del sistema'
      }, 400);
    }
    
    await kv.del(`${PREFIX_CANALES}${id}`);
    
    // Eliminar también las integraciones asociadas
    const integraciones = await kv.getByPrefix<IntegracionCanal>(PREFIX_INTEGRACIONES);
    const integracionesDelCanal = integraciones.filter(i => i.canal_id === id);
    
    for (const integracion of integracionesDelCanal) {
      await kv.del(`${PREFIX_INTEGRACIONES}${integracion.id}`);
    }
    
    return c.json({
      success: true,
      message: 'Canal eliminado correctamente'
    });
  } catch (error: any) {
    console.error('Error al eliminar canal:', error);
    return c.json({
      success: false,
      error: error.message
    }, 500);
  }
});

// ============================================================================
// RUTAS DE INTEGRACIONES
// ============================================================================

/**
 * GET /integraciones
 * Obtener todas las integraciones
 */
app.get('/integraciones', async (c) => {
  try {
    const integraciones = await kv.getByPrefix<IntegracionCanal>(PREFIX_INTEGRACIONES);
    
    return c.json({
      success: true,
      data: integraciones
    });
  } catch (error: any) {
    console.error('Error al obtener integraciones:', error);
    return c.json({
      success: false,
      error: error.message
    }, 500);
  }
});

/**
 * GET /integraciones/canal/:canalId
 * Obtener integraciones de un canal específico
 */
app.get('/integraciones/canal/:canalId', async (c) => {
  try {
    const canalId = c.req.param('canalId');
    const integraciones = await kv.getByPrefix<IntegracionCanal>(PREFIX_INTEGRACIONES);
    const integracionesDelCanal = integraciones.filter(i => i.canal_id === canalId);
    
    return c.json({
      success: true,
      data: integracionesDelCanal
    });
  } catch (error: any) {
    console.error('Error al obtener integraciones del canal:', error);
    return c.json({
      success: false,
      error: error.message
    }, 500);
  }
});

/**
 * PUT /integraciones/:id
 * Actualizar configuración de una integración
 */
app.put('/integraciones/:id', async (c) => {
  try {
    const id = c.req.param('id');
    const body = await c.req.json();
    
    const integracionExistente = await kv.get<IntegracionCanal>(`${PREFIX_INTEGRACIONES}${id}`);
    if (!integracionExistente) {
      return c.json({
        success: false,
        error: 'Integración no encontrada'
      }, 404);
    }
    
    const integracionActualizada: IntegracionCanal = {
      ...integracionExistente,
      ...body,
      id,
      updated_at: new Date().toISOString()
    };
    
    await kv.set(`${PREFIX_INTEGRACIONES}${id}`, integracionActualizada);
    
    return c.json({
      success: true,
      data: integracionActualizada
    });
  } catch (error: any) {
    console.error('Error al actualizar integración:', error);
    return c.json({
      success: false,
      error: error.message
    }, 500);
  }
});

/**
 * POST /integraciones/:id/conectar
 * Conectar una integración
 */
app.post('/integraciones/:id/conectar', async (c) => {
  try {
    const id = c.req.param('id');
    
    const integracion = await kv.get<IntegracionCanal>(`${PREFIX_INTEGRACIONES}${id}`);
    if (!integracion) {
      return c.json({
        success: false,
        error: 'Integración no encontrada'
      }, 404);
    }
    
    // Validar que tenga configuración
    if (!integracion.config || Object.keys(integracion.config).length === 0) {
      return c.json({
        success: false,
        error: 'Primero debes configurar la integración'
      }, 400);
    }
    
    // Actualizar estado
    integracion.estado = 'conectada';
    integracion.activo = true;
    integracion.updated_at = new Date().toISOString();
    
    await kv.set(`${PREFIX_INTEGRACIONES}${id}`, integracion);
    
    // Actualizar canal con esta integración activa
    const canal = await kv.get<CanalVenta>(`${PREFIX_CANALES}${integracion.canal_id}`);
    if (canal) {
      canal.integracion_activa = id;
      canal.updated_at = new Date().toISOString();
      await kv.set(`${PREFIX_CANALES}${integracion.canal_id}`, canal);
    }
    
    return c.json({
      success: true,
      data: integracion,
      message: 'Integración conectada correctamente'
    });
  } catch (error: any) {
    console.error('Error al conectar integración:', error);
    return c.json({
      success: false,
      error: error.message
    }, 500);
  }
});

/**
 * POST /integraciones/:id/desconectar
 * Desconectar una integración
 */
app.post('/integraciones/:id/desconectar', async (c) => {
  try {
    const id = c.req.param('id');
    
    const integracion = await kv.get<IntegracionCanal>(`${PREFIX_INTEGRACIONES}${id}`);
    if (!integracion) {
      return c.json({
        success: false,
        error: 'Integración no encontrada'
      }, 404);
    }
    
    // Actualizar estado
    integracion.estado = 'desconectada';
    integracion.activo = false;
    integracion.updated_at = new Date().toISOString();
    
    await kv.set(`${PREFIX_INTEGRACIONES}${id}`, integracion);
    
    // Limpiar integración activa del canal si es esta
    const canal = await kv.get<CanalVenta>(`${PREFIX_CANALES}${integracion.canal_id}`);
    if (canal && canal.integracion_activa === id) {
      canal.integracion_activa = undefined;
      canal.updated_at = new Date().toISOString();
      await kv.set(`${PREFIX_CANALES}${integracion.canal_id}`, canal);
    }
    
    return c.json({
      success: true,
      data: integracion,
      message: 'Integración desconectada correctamente'
    });
  } catch (error: any) {
    console.error('Error al desconectar integración:', error);
    return c.json({
      success: false,
      error: error.message
    }, 500);
  }
});

/**
 * POST /integraciones/:id/probar
 * Probar conexión de una integración
 */
app.post('/integraciones/:id/probar', async (c) => {
  try {
    const id = c.req.param('id');
    
    const integracion = await kv.get<IntegracionCanal>(`${PREFIX_INTEGRACIONES}${id}`);
    if (!integracion) {
      return c.json({
        success: false,
        error: 'Integración no encontrada'
      }, 404);
    }
    
    // Aquí iría la lógica real de prueba según el proveedor
    // Por ahora simulamos
    
    // Registrar log
    const log = {
      id: `log-${Date.now()}`,
      integracion_id: id,
      timestamp: new Date().toISOString(),
      tipo: 'info',
      mensaje: 'Prueba de conexión realizada',
      detalles: { test: true }
    };
    
    await kv.set(`${PREFIX_LOGS}${log.id}`, log);
    
    // Actualizar estado
    integracion.estado = 'conectada';
    if (!integracion.estadisticas) {
      integracion.estadisticas = {};
    }
    integracion.estadisticas.ultima_sincronizacion = new Date().toISOString();
    integracion.updated_at = new Date().toISOString();
    
    await kv.set(`${PREFIX_INTEGRACIONES}${id}`, integracion);
    
    return c.json({
      success: true,
      data: integracion,
      message: 'Prueba de conexión exitosa'
    });
  } catch (error: any) {
    console.error('Error al probar integración:', error);
    return c.json({
      success: false,
      error: error.message
    }, 500);
  }
});

// ============================================================================
// WEBHOOKS
// ============================================================================

/**
 * POST /webhooks/:canalId/:integracionId
 * Recibir webhooks de plataformas externas y procesarlos automáticamente
 * 
 * INTEGRACIÓN CON SISTEMA EXISTENTE:
 * - Usa parsers específicos por canal (WhatsApp, Email)
 * - Reutiliza convertirPedidoAgregadorAInterno() para marketplaces
 * - Crea pedidos en el sistema unificado
 */
app.post('/webhooks/:canalId/:integracionId', async (c) => {
  try {
    const { canalId, integracionId } = c.req.param();
    const body = await c.req.json();
    
    console.log(`📥 Webhook recibido para canal ${canalId}, integración ${integracionId}:`, body);
    
    // Validar que la integración existe
    const integracion = await kv.get<IntegracionCanal>(`${PREFIX_INTEGRACIONES}${integracionId}`);
    if (!integracion) {
      return c.json({
        success: false,
        error: 'Integración no encontrada'
      }, 404);
    }
    
    // Validar que la integración está activa
    if (!integracion.activo) {
      return c.json({
        success: false,
        error: 'Integración desactivada'
      }, 403);
    }
    
    // Obtener canal
    const canal = await kv.get<CanalVenta>(`${PREFIX_CANALES}${canalId}`);
    if (!canal) {
      return c.json({
        success: false,
        error: 'Canal no encontrado'
      }, 404);
    }
    
    // PROCESAR WEBHOOK SEGÚN EL TIPO DE CANAL
    // IMPORTANTE: Aquí se integraría con pedidos-canal-unificado.service.ts
    // Por ahora, registramos el webhook y preparamos la estructura
    
    let tipoProcesamiento: 'pedido' | 'estado' | 'otro' = 'otro';
    let estadoProcessamiento: 'exitoso' | 'error' | 'pendiente_confirmacion' = 'exitoso';
    let mensajeLog = 'Webhook recibido';
    
    // Detectar tipo de webhook según el canal
    if (canal.slug === 'whatsapp') {
      tipoProcesamiento = 'pedido';
      mensajeLog = 'Mensaje WhatsApp recibido - Pendiente parseo';
      estadoProcessamiento = 'pendiente_confirmacion';
      
      // En producción:
      // const catalogo = await obtenerCatalogo();
      // const resultado = await procesarWebhookCanal({
      //   canal: 'whatsapp',
      //   integracionId,
      //   datos: body,
      //   timestamp: new Date()
      // }, catalogo);
      
    } else if (canal.slug === 'email') {
      tipoProcesamiento = 'pedido';
      mensajeLog = 'Email de pedido recibido - Pendiente parseo';
      estadoProcessamiento = 'pendiente_confirmacion';
      
    } else if (canal.slug === 'marketplace') {
      tipoProcesamiento = body.event_type === 'order.created' ? 'pedido' : 'estado';
      mensajeLog = `Webhook ${integracion.proveedor}: ${body.event_type || 'pedido'}`;
      
      // Para marketplaces, usar el sistema existente de pedidos-delivery.service.ts
      // const resultado = await procesarWebhookDelivery(integracion.proveedor.toLowerCase(), body);
    }
    
    // Registrar log detallado
    const log = {
      id: `log-${Date.now()}`,
      integracion_id: integracionId,
      timestamp: new Date().toISOString(),
      tipo: estadoProcessamiento === 'exitoso' ? 'info' : 
            estadoProcessamiento === 'error' ? 'error' : 'advertencia',
      mensaje: mensajeLog,
      detalles: {
        canal: canal.slug,
        proveedor: integracion.proveedor,
        tipoProcesamiento,
        payload: body
      }
    };
    
    await kv.set(`${PREFIX_LOGS}${log.id}`, log);
    
    // Actualizar estadísticas de la integración
    if (!integracion.estadisticas) {
      integracion.estadisticas = {};
    }
    
    if (tipoProcesamiento === 'pedido') {
      integracion.estadisticas.pedidos_recibidos_hoy = (integracion.estadisticas.pedidos_recibidos_hoy || 0) + 1;
      integracion.estadisticas.pedidos_recibidos_mes = (integracion.estadisticas.pedidos_recibidos_mes || 0) + 1;
    }
    
    integracion.estadisticas.ultima_sincronizacion = new Date().toISOString();
    integracion.estadisticas.total_sincronizaciones = (integracion.estadisticas.total_sincronizaciones || 0) + 1;
    
    // Calcular tasa de éxito
    const totalLogs = await kv.getByPrefix(`${PREFIX_LOGS}`);
    const logsIntegracion = totalLogs.filter((l: any) => l.integracion_id === integracionId);
    const exitosos = logsIntegracion.filter((l: any) => l.tipo === 'info').length;
    integracion.estadisticas.tasa_exito = logsIntegracion.length > 0 
      ? Math.round((exitosos / logsIntegracion.length) * 100) 
      : 100;
    
    await kv.set(`${PREFIX_INTEGRACIONES}${integracionId}`, integracion);
    
    return c.json({
      success: true,
      message: 'Webhook procesado correctamente',
      data: {
        logId: log.id,
        tipoProcesamiento,
        estadoProcessamiento,
        requiereConfirmacionManual: estadoProcessamiento === 'pendiente_confirmacion'
      }
    });
    
  } catch (error: any) {
    console.error('Error al procesar webhook:', error);
    
    // Registrar error en logs
    const errorLog = {
      id: `log-error-${Date.now()}`,
      integracion_id: c.req.param('integracionId'),
      timestamp: new Date().toISOString(),
      tipo: 'error',
      mensaje: 'Error al procesar webhook',
      detalles: {
        error: error.message,
        stack: error.stack
      }
    };
    
    try {
      await kv.set(`${PREFIX_LOGS}${errorLog.id}`, errorLog);
    } catch (e) {
      console.error('Error guardando log de error:', e);
    }
    
    return c.json({
      success: false,
      error: error.message
    }, 500);
  }
});

// ============================================================================
// LOGS
// ============================================================================

/**
 * GET /logs/pendientes
 * Obtener logs pendientes de procesar (para polling desde frontend)
 */
app.get('/logs/pendientes', async (c) => {
  try {
    const desde = c.req.query('desde');
    const desdeDate = desde ? new Date(desde) : new Date(Date.now() - 60000); // Último minuto por defecto
    
    // Obtener todos los logs
    const logs = await kv.getByPrefix(PREFIX_LOGS);
    
    // Filtrar logs desde la fecha especificada y que sean de tipo 'advertencia' (pendiente confirmación)
    const logsPendientes = logs.filter((log: any) => {
      const logDate = new Date(log.timestamp);
      return logDate > desdeDate && log.tipo === 'advertencia';
    });
    
    return c.json({
      success: true,
      data: logsPendientes
    });
    
  } catch (error: any) {
    console.error('Error al obtener logs pendientes:', error);
    return c.json({
      success: false,
      error: error.message
    }, 500);
  }
});

/**
 * GET /logs/integracion/:integracionId
 * Obtener logs de una integración específica
 */
app.get('/logs/integracion/:integracionId', async (c) => {
  try {
    const integracionId = c.req.param('integracionId');
    const limite = parseInt(c.req.query('limite') || '50');
    
    // Obtener todos los logs
    const todosLogs = await kv.getByPrefix(PREFIX_LOGS);
    
    // Filtrar por integración y ordenar por timestamp desc
    const logsIntegracion = todosLogs
      .filter((log: any) => log.integracion_id === integracionId)
      .sort((a: any, b: any) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, limite);
    
    return c.json({
      success: true,
      data: logsIntegracion
    });
    
  } catch (error: any) {
    console.error('Error al obtener logs de integración:', error);
    return c.json({
      success: false,
      error: error.message
    }, 500);
  }
});

export default app;