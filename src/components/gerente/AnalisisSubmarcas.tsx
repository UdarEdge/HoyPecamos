/**
 * 🏷️ COMPONENTE: ANÁLISIS DE SUBMARCAS
 * Visualización de métricas comparativas entre Modomio 🍕 y BlackBurger 🍔
 */

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { TrendingUp, TrendingDown, Package, ShoppingCart, DollarSign, Minus } from 'lucide-react';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { projectId, publicAnonKey } from '../../utils/supabase/info';

// ============================================================================
// TIPOS
// ============================================================================

interface VentasSubmarca {
  submarca_id: string;
  submarca_nombre: string;
  submarca_icono: string;
  total_ventas: number;
  total_pedidos: number;
  ticket_promedio: number;
  productos_vendidos: number;
}

interface DatoComparativa {
  fecha: string;
  modomio_ventas: number;
  modomio_pedidos: number;
  blackburger_ventas: number;
  blackburger_pedidos: number;
}

interface Props {
  empresa_id: string;
  marca_id?: string;
  punto_venta_id?: string;
  fecha_inicio?: string;
  fecha_fin?: string;
}

// ============================================================================
// COMPONENTE PRINCIPAL
// ============================================================================

export function AnalisisSubmarcas({
  empresa_id,
  marca_id,
  punto_venta_id,
  fecha_inicio,
  fecha_fin
}: Props) {
  const [ventasPorSubmarca, setVentasPorSubmarca] = useState<VentasSubmarca[]>([]);
  const [comparativa, setComparativa] = useState<DatoComparativa[]>([]);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [vistaActiva, setVistaActiva] = useState<'resumen' | 'comparativa' | 'productos'>('resumen');

  // ============================================================================
  // CARGAR DATOS
  // ============================================================================

  useEffect(() => {
    cargarDatos();
  }, [empresa_id, marca_id, punto_venta_id, fecha_inicio, fecha_fin]);

  const cargarDatos = async () => {
    setCargando(true);
    setError(null);

    try {
      // Fechas por defecto: últimos 7 días
      const fechaFin = fecha_fin || new Date().toISOString().split('T')[0];
      const fechaInicio = fecha_inicio || (() => {
        const d = new Date();
        d.setDate(d.getDate() - 7);
        return d.toISOString().split('T')[0];
      })();

      // Query params
      const params = new URLSearchParams({
        empresa_id,
        fecha_inicio: fechaInicio,
        fecha_fin: fechaFin,
        ...(marca_id && { marca_id }),
        ...(punto_venta_id && { punto_venta_id })
      });

      // Llamar a las APIs
      const [ventasRes, comparativaRes] = await Promise.all([
        fetch(
          `https://${projectId}.supabase.co/functions/v1/make-server-ae2ba659/submarcas/ventas?${params}`,
          {
            headers: { Authorization: `Bearer ${publicAnonKey}` }
          }
        ),
        fetch(
          `https://${projectId}.supabase.co/functions/v1/make-server-ae2ba659/submarcas/comparativa?${params}`,
          {
            headers: { Authorization: `Bearer ${publicAnonKey}` }
          }
        )
      ]);

      if (!ventasRes.ok || !comparativaRes.ok) {
        throw new Error('Error al cargar datos de submarcas');
      }

      const ventasData = await ventasRes.json();
      const comparativaData = await comparativaRes.json();

      if (ventasData.success) {
        setVentasPorSubmarca(ventasData.ventas_por_submarca || []);
      }

      if (comparativaData.success) {
        setComparativa(comparativaData.datos_diarios || []);
      }
    } catch (err: any) {
      console.error('Error al cargar análisis de submarcas:', err);
      setError(err.message);
    } finally {
      setCargando(false);
    }
  };

  // ============================================================================
  // HELPERS
  // ============================================================================

  const formatearMoneda = (valor: number): string => {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'EUR'
    }).format(valor);
  };

  const calcularCrecimiento = (actual: number, anterior: number): number => {
    if (anterior === 0) return 0;
    return ((actual - anterior) / anterior) * 100;
  };

  const obtenerModomio = () => {
    return ventasPorSubmarca.find(v => v.submarca_id === 'SUB-MODOMIO');
  };

  const obtenerBlackBurger = () => {
    return ventasPorSubmarca.find(v => v.submarca_id === 'SUB-BLACKBURGER');
  };

  // ============================================================================
  // RENDER: RESUMEN
  // ============================================================================

  const renderResumen = () => {
    const modomio = obtenerModomio();
    const blackburger = obtenerBlackBurger();

    if (!modomio && !blackburger) {
      return (
        <div className="text-center py-8 text-gray-500">
          No hay datos disponibles para el periodo seleccionado
        </div>
      );
    }

    const totalVentas = (modomio?.total_ventas || 0) + (blackburger?.total_ventas || 0);
    const porcentajeModomio = modomio ? (modomio.total_ventas / totalVentas) * 100 : 0;
    const porcentajeBlackBurger = blackburger ? (blackburger.total_ventas / totalVentas) * 100 : 0;

    return (
      <div className="space-y-6">
        {/* KPIs Generales */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Ventas Totales</CardDescription>
              <CardTitle className="text-2xl">{formatearMoneda(totalVentas)}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-gray-600">
                {(modomio?.total_pedidos || 0) + (blackburger?.total_pedidos || 0)} pedidos
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Productos Vendidos</CardDescription>
              <CardTitle className="text-2xl">
                {(modomio?.productos_vendidos || 0) + (blackburger?.productos_vendidos || 0)}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-gray-600">Unidades totales</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Ticket Promedio</CardDescription>
              <CardTitle className="text-2xl">
                {formatearMoneda(
                  ((modomio?.ticket_promedio || 0) + (blackburger?.ticket_promedio || 0)) / 2
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-gray-600">Media entre submarcas</p>
            </CardContent>
          </Card>
        </div>

        {/* Comparativa de Submarcas */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Modomio */}
          {modomio && (
            <Card className="border-orange-200 bg-orange-50/30">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <span className="text-2xl">{modomio.submarca_icono}</span>
                  <span>{modomio.submarca_nombre}</span>
                  <Badge variant="secondary" className="ml-auto">
                    {porcentajeModomio.toFixed(1)}% del total
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Ventas</span>
                  <span className="font-semibold">{formatearMoneda(modomio.total_ventas)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Pedidos</span>
                  <span className="font-semibold">{modomio.total_pedidos}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Ticket Promedio</span>
                  <span className="font-semibold">{formatearMoneda(modomio.ticket_promedio)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Productos Vendidos</span>
                  <span className="font-semibold">{modomio.productos_vendidos} uds.</span>
                </div>
              </CardContent>
            </Card>
          )}

          {/* BlackBurger */}
          {blackburger && (
            <Card className="border-gray-800 bg-gray-50/30">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <span className="text-2xl">{blackburger.submarca_icono}</span>
                  <span>{blackburger.submarca_nombre}</span>
                  <Badge variant="secondary" className="ml-auto">
                    {porcentajeBlackBurger.toFixed(1)}% del total
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Ventas</span>
                  <span className="font-semibold">{formatearMoneda(blackburger.total_ventas)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Pedidos</span>
                  <span className="font-semibold">{blackburger.total_pedidos}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Ticket Promedio</span>
                  <span className="font-semibold">
                    {formatearMoneda(blackburger.ticket_promedio)}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Productos Vendidos</span>
                  <span className="font-semibold">{blackburger.productos_vendidos} uds.</span>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Barra de progreso comparativa */}
        {modomio && blackburger && (
          <Card>
            <CardHeader>
              <CardTitle>Distribución de Ventas</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex h-8 overflow-hidden rounded-md">
                <div
                  className="bg-orange-500 flex items-center justify-center text-white text-xs font-medium"
                  style={{ width: `${porcentajeModomio}%` }}
                >
                  {porcentajeModomio > 15 && `${porcentajeModomio.toFixed(0)}%`}
                </div>
                <div
                  className="bg-gray-800 flex items-center justify-center text-white text-xs font-medium"
                  style={{ width: `${porcentajeBlackBurger}%` }}
                >
                  {porcentajeBlackBurger > 15 && `${porcentajeBlackBurger.toFixed(0)}%`}
                </div>
              </div>
              <div className="flex justify-between mt-2 text-sm text-gray-600">
                <span>🍕 Modomio</span>
                <span>🍔 BlackBurger</span>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    );
  };

  // ============================================================================
  // RENDER: COMPARATIVA TEMPORAL
  // ============================================================================

  const renderComparativa = () => {
    if (comparativa.length === 0) {
      return (
        <div className="text-center py-8 text-gray-500">
          No hay datos de comparativa temporal disponibles
        </div>
      );
    }

    return (
      <div className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>Evolución Diaria</CardTitle>
            <CardDescription>Comparativa de ventas día a día</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {comparativa.slice(-7).reverse().map((dato, idx) => (
                <div
                  key={idx}
                  className="flex items-center gap-4 p-3 border rounded-lg hover:bg-gray-50"
                >
                  <div className="w-20 text-sm font-medium text-gray-600">
                    {new Date(dato.fecha).toLocaleDateString('es-ES', {
                      day: '2-digit',
                      month: 'short'
                    })}
                  </div>

                  <div className="flex-1 grid grid-cols-2 gap-4">
                    {/* Modomio */}
                    <div className="flex items-center gap-2">
                      <span className="text-lg">🍕</span>
                      <div className="flex-1">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">
                            {dato.modomio_pedidos} pedidos
                          </span>
                          <span className="font-medium text-orange-600">
                            {formatearMoneda(dato.modomio_ventas)}
                          </span>
                        </div>
                        <div className="h-2 bg-gray-200 rounded-full mt-1">
                          <div
                            className="h-full bg-orange-500 rounded-full"
                            style={{
                              width: `${(dato.modomio_ventas / (dato.modomio_ventas + dato.blackburger_ventas)) * 100}%`
                            }}
                          />
                        </div>
                      </div>
                    </div>

                    {/* BlackBurger */}
                    <div className="flex items-center gap-2">
                      <span className="text-lg">🍔</span>
                      <div className="flex-1">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">
                            {dato.blackburger_pedidos} pedidos
                          </span>
                          <span className="font-medium text-gray-800">
                            {formatearMoneda(dato.blackburger_ventas)}
                          </span>
                        </div>
                        <div className="h-2 bg-gray-200 rounded-full mt-1">
                          <div
                            className="h-full bg-gray-800 rounded-full"
                            style={{
                              width: `${(dato.blackburger_ventas / (dato.modomio_ventas + dato.blackburger_ventas)) * 100}%`
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  };

  // ============================================================================
  // RENDER PRINCIPAL
  // ============================================================================

  if (cargando) {
    return (
      <Card>
        <CardContent className="py-12">
          <div className="flex flex-col items-center justify-center gap-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600" />
            <p className="text-sm text-gray-600">Cargando análisis de submarcas...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="border-red-200 bg-red-50/30">
        <CardContent className="py-8">
          <div className="text-center">
            <p className="text-red-600 font-medium">Error al cargar datos</p>
            <p className="text-sm text-gray-600 mt-2">{error}</p>
            <Button onClick={cargarDatos} variant="outline" className="mt-4">
              Reintentar
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Navegación de vistas */}
      <div className="flex gap-2 border-b pb-2">
        <Button
          variant={vistaActiva === 'resumen' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setVistaActiva('resumen')}
        >
          <DollarSign className="w-4 h-4 mr-2" />
          Resumen
        </Button>
        <Button
          variant={vistaActiva === 'comparativa' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setVistaActiva('comparativa')}
        >
          <TrendingUp className="w-4 h-4 mr-2" />
          Evolución
        </Button>
      </div>

      {/* Contenido */}
      {vistaActiva === 'resumen' && renderResumen()}
      {vistaActiva === 'comparativa' && renderComparativa()}
    </div>
  );
}
