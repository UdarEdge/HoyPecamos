/**
 * 📊 SISTEMA DE ANALYTICS
 * 
 * Registra eventos de usuario para análisis posterior
 */

import { projectId, publicAnonKey } from './supabase/info';

export type TipoEvento = 
  | 'PRODUCTO_VISUALIZADO'
  | 'ESCANDALLO_VISUALIZADO'
  | 'PRODUCTO_DESACTIVADO'
  | 'PRODUCTO_ACTIVADO'
  | 'PRODUCTO_EDITADO'
  | 'PRECIO_MODIFICADO'
  | 'STOCK_MODIFICADO'
  | 'FILTRO_APLICADO'
  | 'EXPORTACION_REALIZADA';

export interface DatosEvento {
  id_producto?: string;
  id_usuario?: string;
  tipo_usuario?: 'gerente' | 'trabajador' | 'cliente';
  id_pdv?: string;
  metadata?: Record<string, any>;
}

export interface EventoAnalytics {
  id: string;
  tipo_evento: TipoEvento;
  id_producto?: string;
  id_usuario: string;
  tipo_usuario: string;
  id_pdv?: string;
  metadata: Record<string, any>;
  timestamp: string;
  device: 'desktop' | 'mobile' | 'tablet';
  navegador: string;
}

/**
 * Detecta el tipo de dispositivo
 */
function detectarDevice(): 'desktop' | 'mobile' | 'tablet' {
  const width = window.innerWidth;
  if (width < 768) return 'mobile';
  if (width < 1024) return 'tablet';
  return 'desktop';
}

/**
 * Obtiene información del navegador
 */
function obtenerNavegador(): string {
  const ua = navigator.userAgent;
  if (ua.includes('Chrome')) return 'Chrome';
  if (ua.includes('Firefox')) return 'Firefox';
  if (ua.includes('Safari')) return 'Safari';
  if (ua.includes('Edge')) return 'Edge';
  return 'Desconocido';
}

/**
 * Registra un evento de analytics
 */
export async function registrarEvento(
  tipoEvento: TipoEvento,
  datos: DatosEvento = {}
): Promise<void> {
  try {
    // Obtener usuario actual desde localStorage
    const usuarioActual = localStorage.getItem('usuario_actual');
    const usuario = usuarioActual ? JSON.parse(usuarioActual) : { id: 'guest', rol: 'gerente' };

    const evento: Omit<EventoAnalytics, 'id'> = {
      tipo_evento: tipoEvento,
      id_producto: datos.id_producto,
      id_usuario: datos.id_usuario || usuario.id,
      tipo_usuario: datos.tipo_usuario || usuario.rol,
      id_pdv: datos.id_pdv,
      metadata: datos.metadata || {},
      timestamp: new Date().toISOString(),
      device: detectarDevice(),
      navegador: obtenerNavegador(),
    };

    // Enviar al backend
    const response = await fetch(
      `https://${projectId}.supabase.co/functions/v1/make-server-ae2ba659/analytics/eventos`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${publicAnonKey}`,
        },
        body: JSON.stringify(evento),
      }
    );

    if (!response.ok) {
      console.warn('⚠️ Error al registrar evento de analytics:', await response.text());
    }
  } catch (error) {
    // No bloquear la UI si falla el analytics
    console.error('❌ Error registrando evento de analytics:', error);
  }
}

/**
 * Obtiene los eventos de un producto específico
 */
export async function obtenerEventosProducto(
  idProducto: string,
  limite: number = 50
): Promise<EventoAnalytics[]> {
  try {
    const response = await fetch(
      `https://${projectId}.supabase.co/functions/v1/make-server-ae2ba659/analytics/productos/${idProducto}/eventos?limite=${limite}`,
      {
        headers: {
          'Authorization': `Bearer ${publicAnonKey}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error('Error al obtener eventos');
    }

    const data = await response.json();
    return data.eventos || [];
  } catch (error) {
    console.error('❌ Error obteniendo eventos del producto:', error);
    return [];
  }
}

/**
 * Obtiene estadísticas resumidas de un producto
 */
export async function obtenerEstadisticasProducto(
  idProducto: string
): Promise<{
  total_visualizaciones: number;
  visualizaciones_hoy: number;
  visualizaciones_semana: number;
  total_escandallos: number;
  total_ediciones: number;
  ultimo_evento: EventoAnalytics | null;
  eventos_por_tipo: Record<TipoEvento, number>;
  usuarios_unicos: number;
}> {
  try {
    const response = await fetch(
      `https://${projectId}.supabase.co/functions/v1/make-server-ae2ba659/analytics/productos/${idProducto}/estadisticas`,
      {
        headers: {
          'Authorization': `Bearer ${publicAnonKey}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error('Error al obtener estadísticas');
    }

    return await response.json();
  } catch (error) {
    console.error('❌ Error obteniendo estadísticas del producto:', error);
    return {
      total_visualizaciones: 0,
      visualizaciones_hoy: 0,
      visualizaciones_semana: 0,
      total_escandallos: 0,
      total_ediciones: 0,
      ultimo_evento: null,
      eventos_por_tipo: {} as Record<TipoEvento, number>,
      usuarios_unicos: 0,
    };
  }
}

/**
 * Obtiene los productos más vistos
 */
export async function obtenerProductosMasVistos(
  limite: number = 10
): Promise<Array<{ id_producto: string; total_vistas: number }>> {
  try {
    const response = await fetch(
      `https://${projectId}.supabase.co/functions/v1/make-server-ae2ba659/analytics/productos/mas-vistos?limite=${limite}`,
      {
        headers: {
          'Authorization': `Bearer ${publicAnonKey}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error('Error al obtener productos más vistos');
    }

    const data = await response.json();
    return data.productos || [];
  } catch (error) {
    console.error('❌ Error obteniendo productos más vistos:', error);
    return [];
  }
}
