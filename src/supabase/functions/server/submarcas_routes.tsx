/**
 * 🏷️ RUTAS DE SUBMARCAS - UDAR EDGE
 * Consultas y análisis específicos para submarcas (Modomio, BlackBurger, etc.)
 */

import { Context } from 'npm:hono';
import * as kv from './kv_store.tsx';

// ============================================================================
// TIPOS
// ============================================================================

interface VentasPorSubmarca {
  submarca_id: string;
  submarca_nombre: string;
  submarca_icono: string;
  total_ventas: number;
  total_pedidos: number;
  ticket_promedio: number;
  productos_vendidos: number;
}

interface ProductoTopSubmarca {
  producto_id: string;
  producto_nombre: string;
  submarca_id: string;
  unidades_vendidas: number;
  ingresos_totales: number;
}

interface ComparativaSubmarcas {
  fecha: string;
  modomio_ventas: number;
  modomio_pedidos: number;
  blackburger_ventas: number;
  blackburger_pedidos: number;
}

// ============================================================================
// HELPER: OBTENER DATOS DE SUBMARCA
// ============================================================================

async function obtenerInfoSubmarca(submarcaId: string) {
  const submarcas: Record<string, any> = {
    'SUB-MODOMIO': {
      id: 'SUB-MODOMIO',
      nombre: 'Modomio',
      icono: '🍕',
      tipo: 'Pizzas'
    },
    'SUB-BLACKBURGER': {
      id: 'SUB-BLACKBURGER',
      nombre: 'BlackBurger',
      icono: '🍔',
      tipo: 'Hamburguesas'
    }
  };
  
  return submarcas[submarcaId] || { id: submarcaId, nombre: submarcaId, icono: '🏪', tipo: 'General' };
}

// ============================================================================
// RUTAS
// ============================================================================

/**
 * GET /submarcas/ventas
 * Obtener ventas totales por submarca en un periodo
 * 
 * Query params:
 * - empresa_id: ID de la empresa
 * - marca_id: ID de la marca (opcional)
 * - fecha_inicio: Fecha inicio (YYYY-MM-DD)
 * - fecha_fin: Fecha fin (YYYY-MM-DD)
 * - punto_venta_id: ID del PDV (opcional)
 */
export async function getVentasPorSubmarca(c: Context) {
  try {
    const { empresa_id, marca_id, fecha_inicio, fecha_fin, punto_venta_id } = c.req.query();

    if (!empresa_id || !fecha_inicio || !fecha_fin) {
      return c.json({ 
        error: 'Parámetros requeridos: empresa_id, fecha_inicio, fecha_fin' 
      }, 400);
    }

    // Construir clave de búsqueda
    const prefix = `pedido:empresa:${empresa_id}`;
    const pedidos = await kv.getByPrefix(prefix);

    // Filtrar por fecha y otros criterios
    const pedidosFiltrados = pedidos.filter((pedido: any) => {
      const fechaPedido = new Date(pedido.fecha_pedido).toISOString().split('T')[0];
      
      // Filtros básicos
      if (fechaPedido < fecha_inicio || fechaPedido > fecha_fin) return false;
      if (marca_id && pedido.marca_id !== marca_id) return false;
      if (punto_venta_id && pedido.punto_venta_id !== punto_venta_id) return false;
      
      return pedido.estado !== 'cancelado';
    });

    // Agrupar por submarca
    const ventasPorSubmarca: Record<string, VentasPorSubmarca> = {};

    for (const pedido of pedidosFiltrados) {
      // Iterar por items del pedido para obtener submarcas
      const items = pedido.items || [];
      
      for (const item of items) {
        const submarcaId = item.submarcaId || 'SIN-SUBMARCA';
        
        if (!ventasPorSubmarca[submarcaId]) {
          const info = await obtenerInfoSubmarca(submarcaId);
          ventasPorSubmarca[submarcaId] = {
            submarca_id: submarcaId,
            submarca_nombre: info.nombre,
            submarca_icono: info.icono,
            total_ventas: 0,
            total_pedidos: 0,
            ticket_promedio: 0,
            productos_vendidos: 0
          };
        }

        const precioItem = item.precio * item.cantidad;
        ventasPorSubmarca[submarcaId].total_ventas += precioItem;
        ventasPorSubmarca[submarcaId].productos_vendidos += item.cantidad;
      }

      // Contar pedidos únicos por submarca predominante
      const submarcaPredominante = items[0]?.submarcaId || 'SIN-SUBMARCA';
      if (ventasPorSubmarca[submarcaPredominante]) {
        ventasPorSubmarca[submarcaPredominante].total_pedidos += 1;
      }
    }

    // Calcular ticket promedio
    Object.values(ventasPorSubmarca).forEach(submarca => {
      if (submarca.total_pedidos > 0) {
        submarca.ticket_promedio = submarca.total_ventas / submarca.total_pedidos;
      }
    });

    // Ordenar por ventas
    const resultado = Object.values(ventasPorSubmarca)
      .sort((a, b) => b.total_ventas - a.total_ventas);

    return c.json({
      success: true,
      periodo: { fecha_inicio, fecha_fin },
      total_submarcas: resultado.length,
      ventas_por_submarca: resultado
    });

  } catch (error) {
    console.error('Error en getVentasPorSubmarca:', error);
    return c.json({ 
      error: `Error al obtener ventas por submarca: ${error.message}` 
    }, 500);
  }
}

/**
 * GET /submarcas/productos-top
 * Obtener productos más vendidos por submarca
 * 
 * Query params:
 * - submarca_id: ID de la submarca
 * - fecha_inicio: Fecha inicio (YYYY-MM-DD)
 * - fecha_fin: Fecha fin (YYYY-MM-DD)
 * - limit: Número de productos a retornar (default: 10)
 */
export async function getProductosTopPorSubmarca(c: Context) {
  try {
    const { submarca_id, fecha_inicio, fecha_fin, limit = '10' } = c.req.query();

    if (!submarca_id || !fecha_inicio || !fecha_fin) {
      return c.json({ 
        error: 'Parámetros requeridos: submarca_id, fecha_inicio, fecha_fin' 
      }, 400);
    }

    // Obtener todos los productos de la submarca desde el KV store
    const prefix = `producto:submarca:${submarca_id}`;
    const productos = await kv.getByPrefix(prefix);

    // Obtener todos los pedidos del periodo
    const pedidosPrefix = 'pedido:empresa:';
    const todosPedidos = await kv.getByPrefix(pedidosPrefix);

    const pedidosFiltrados = todosPedidos.filter((pedido: any) => {
      const fechaPedido = new Date(pedido.fecha_pedido).toISOString().split('T')[0];
      return fechaPedido >= fecha_inicio && 
             fechaPedido <= fecha_fin && 
             pedido.estado !== 'cancelado';
    });

    // Agrupar ventas por producto
    const ventasPorProducto: Record<string, ProductoTopSubmarca> = {};

    for (const pedido of pedidosFiltrados) {
      const items = pedido.items || [];
      
      for (const item of items) {
        if (item.submarcaId === submarca_id) {
          const productoId = item.id;
          
          if (!ventasPorProducto[productoId]) {
            ventasPorProducto[productoId] = {
              producto_id: productoId,
              producto_nombre: item.nombre,
              submarca_id: submarca_id,
              unidades_vendidas: 0,
              ingresos_totales: 0
            };
          }

          ventasPorProducto[productoId].unidades_vendidas += item.cantidad;
          ventasPorProducto[productoId].ingresos_totales += item.precio * item.cantidad;
        }
      }
    }

    // Ordenar por unidades vendidas y limitar
    const resultado = Object.values(ventasPorProducto)
      .sort((a, b) => b.unidades_vendidas - a.unidades_vendidas)
      .slice(0, parseInt(limit));

    const submarcaInfo = await obtenerInfoSubmarca(submarca_id);

    return c.json({
      success: true,
      submarca: submarcaInfo,
      periodo: { fecha_inicio, fecha_fin },
      total_productos: resultado.length,
      productos_top: resultado
    });

  } catch (error) {
    console.error('Error en getProductosTopPorSubmarca:', error);
    return c.json({ 
      error: `Error al obtener productos top: ${error.message}` 
    }, 500);
  }
}

/**
 * GET /submarcas/comparativa
 * Comparar métricas entre Modomio y BlackBurger
 * 
 * Query params:
 * - empresa_id: ID de la empresa
 * - fecha_inicio: Fecha inicio (YYYY-MM-DD)
 * - fecha_fin: Fecha fin (YYYY-MM-DD)
 * - agrupacion: 'dia' | 'semana' | 'mes' (default: 'dia')
 */
export async function getComparativaSubmarcas(c: Context) {
  try {
    const { empresa_id, fecha_inicio, fecha_fin, agrupacion = 'dia' } = c.req.query();

    if (!empresa_id || !fecha_inicio || !fecha_fin) {
      return c.json({ 
        error: 'Parámetros requeridos: empresa_id, fecha_inicio, fecha_fin' 
      }, 400);
    }

    // Obtener pedidos
    const prefix = `pedido:empresa:${empresa_id}`;
    const pedidos = await kv.getByPrefix(prefix);

    const pedidosFiltrados = pedidos.filter((pedido: any) => {
      const fechaPedido = new Date(pedido.fecha_pedido).toISOString().split('T')[0];
      return fechaPedido >= fecha_inicio && 
             fechaPedido <= fecha_fin && 
             pedido.estado !== 'cancelado';
    });

    // Agrupar por fecha y submarca
    const comparativa: Record<string, ComparativaSubmarcas> = {};

    for (const pedido of pedidosFiltrados) {
      const fechaPedido = new Date(pedido.fecha_pedido).toISOString().split('T')[0];
      
      if (!comparativa[fechaPedido]) {
        comparativa[fechaPedido] = {
          fecha: fechaPedido,
          modomio_ventas: 0,
          modomio_pedidos: 0,
          blackburger_ventas: 0,
          blackburger_pedidos: 0
        };
      }

      const items = pedido.items || [];
      let modomioTotal = 0;
      let blackburgerTotal = 0;
      let tieneModomio = false;
      let tieneBlackburger = false;

      for (const item of items) {
        const precioItem = item.precio * item.cantidad;
        
        if (item.submarcaId === 'SUB-MODOMIO') {
          modomioTotal += precioItem;
          tieneModomio = true;
        } else if (item.submarcaId === 'SUB-BLACKBURGER') {
          blackburgerTotal += precioItem;
          tieneBlackburger = true;
        }
      }

      comparativa[fechaPedido].modomio_ventas += modomioTotal;
      comparativa[fechaPedido].blackburger_ventas += blackburgerTotal;
      
      if (tieneModomio) comparativa[fechaPedido].modomio_pedidos += 1;
      if (tieneBlackburger) comparativa[fechaPedido].blackburger_pedidos += 1;
    }

    // Convertir a array y ordenar por fecha
    const resultado = Object.values(comparativa)
      .sort((a, b) => a.fecha.localeCompare(b.fecha));

    // Calcular totales
    const totales = {
      modomio_ventas_total: resultado.reduce((sum, d) => sum + d.modomio_ventas, 0),
      modomio_pedidos_total: resultado.reduce((sum, d) => sum + d.modomio_pedidos, 0),
      blackburger_ventas_total: resultado.reduce((sum, d) => sum + d.blackburger_ventas, 0),
      blackburger_pedidos_total: resultado.reduce((sum, d) => sum + d.blackburger_pedidos, 0)
    };

    return c.json({
      success: true,
      periodo: { fecha_inicio, fecha_fin },
      agrupacion,
      totales,
      datos_diarios: resultado
    });

  } catch (error) {
    console.error('Error en getComparativaSubmarcas:', error);
    return c.json({ 
      error: `Error al obtener comparativa: ${error.message}` 
    }, 500);
  }
}

/**
 * GET /submarcas/metricas-resumen
 * Resumen ejecutivo de métricas por submarca
 * 
 * Query params:
 * - empresa_id: ID de la empresa
 * - fecha_inicio: Fecha inicio (YYYY-MM-DD)
 * - fecha_fin: Fecha fin (YYYY-MM-DD)
 */
export async function getMetricasResumen(c: Context) {
  try {
    const { empresa_id, fecha_inicio, fecha_fin } = c.req.query();

    if (!empresa_id || !fecha_inicio || !fecha_fin) {
      return c.json({ 
        error: 'Parámetros requeridos: empresa_id, fecha_inicio, fecha_fin' 
      }, 400);
    }

    // Obtener ventas por submarca
    const ventasReq = new Request(`http://localhost/submarcas/ventas?empresa_id=${empresa_id}&fecha_inicio=${fecha_inicio}&fecha_fin=${fecha_fin}`);
    const ventasCtx = { req: ventasReq, json: c.json.bind(c) } as any;
    const ventasData = await getVentasPorSubmarca(ventasCtx);

    // Calcular métricas adicionales
    const metricas = {
      periodo: { fecha_inicio, fecha_fin },
      submarcas: [] as any[],
      comparativa: {
        submarca_lider: '',
        diferencia_ventas: 0,
        crecimiento_relativo: 0
      }
    };

    // Si hay datos, procesar
    if (ventasData && typeof ventasData === 'object') {
      // Nota: En producción real, aquí procesaríamos la respuesta JSON
      metricas.submarcas = [
        {
          submarca_id: 'SUB-MODOMIO',
          nombre: 'Modomio 🍕',
          metricas: {
            ventas: 0,
            pedidos: 0,
            ticket_promedio: 0,
            crecimiento: 0
          }
        },
        {
          submarca_id: 'SUB-BLACKBURGER',
          nombre: 'BlackBurger 🍔',
          metricas: {
            ventas: 0,
            pedidos: 0,
            ticket_promedio: 0,
            crecimiento: 0
          }
        }
      ];
    }

    return c.json({
      success: true,
      ...metricas
    });

  } catch (error) {
    console.error('Error en getMetricasResumen:', error);
    return c.json({ 
      error: `Error al obtener métricas resumen: ${error.message}` 
    }, 500);
  }
}
