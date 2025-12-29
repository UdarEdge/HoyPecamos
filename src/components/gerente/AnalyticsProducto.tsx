/**
 * 📊 ANALYTICS DEL PRODUCTO
 * 
 * Muestra estadísticas de uso y visualización de un producto
 */

import { useEffect, useState } from 'react';
import {  Activity, Eye, FileText, Edit, TrendingUp, Users, Calendar, Smartphone, Monitor, Tablet } from 'lucide-react';
import { Card, CardContent, CardHeader } from '../ui/card';
import { Badge } from '../ui/badge';
import { obtenerEventosProducto, obtenerEstadisticasProducto, type EventoAnalytics } from '../../utils/analytics';

interface AnalyticsProductoProps {
  idProducto: string;
  nombreProducto: string;
}

export function AnalyticsProducto({ idProducto, nombreProducto }: AnalyticsProductoProps) {
  const [eventos, setEventos] = useState<EventoAnalytics[]>([]);
  const [estadisticas, setEstadisticas] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    cargarAnalytics();
  }, [idProducto]);

  const cargarAnalytics = async () => {
    setLoading(true);
    try {
      const [eventosData, statsData] = await Promise.all([
        obtenerEventosProducto(idProducto, 20),
        obtenerEstadisticasProducto(idProducto)
      ]);
      
      setEventos(eventosData);
      setEstadisticas(statsData);
    } catch (error) {
      console.error('Error cargando analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Activity className="w-8 h-8 animate-spin text-gray-400" />
        <span className="ml-3 text-gray-600">Cargando estadísticas...</span>
      </div>
    );
  }

  const formatearFecha = (timestamp: string) => {
    const fecha = new Date(timestamp);
    return fecha.toLocaleDateString('es-ES', { 
      day: '2-digit', 
      month: 'short', 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const obtenerIconoEvento = (tipo: string) => {
    switch (tipo) {
      case 'PRODUCTO_VISUALIZADO':
        return <Eye className="w-4 h-4 text-blue-600" />;
      case 'ESCANDALLO_VISUALIZADO':
        return <FileText className="w-4 h-4 text-purple-600" />;
      case 'PRODUCTO_EDITADO':
      case 'PRECIO_MODIFICADO':
      case 'STOCK_MODIFICADO':
        return <Edit className="w-4 h-4 text-orange-600" />;
      default:
        return <Activity className="w-4 h-4 text-gray-600" />;
    }
  };

  const obtenerNombreEvento = (tipo: string) => {
    switch (tipo) {
      case 'PRODUCTO_VISUALIZADO':
        return 'Visualización';
      case 'ESCANDALLO_VISUALIZADO':
        return 'Escandallo consultado';
      case 'PRODUCTO_EDITADO':
        return 'Producto editado';
      case 'PRECIO_MODIFICADO':
        return 'Precio modificado';
      case 'STOCK_MODIFICADO':
        return 'Stock actualizado';
      case 'PRODUCTO_DESACTIVADO':
        return 'Producto desactivado';
      case 'PRODUCTO_ACTIVADO':
        return 'Producto activado';
      default:
        return tipo;
    }
  };

  const obtenerIconoDevice = (device: string) => {
    switch (device) {
      case 'mobile':
        return <Smartphone className="w-3.5 h-3.5 text-gray-500" />;
      case 'tablet':
        return <Tablet className="w-3.5 h-3.5 text-gray-500" />;
      default:
        return <Monitor className="w-3.5 h-3.5 text-gray-500" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* KPIs Principales */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-1">
              <Eye className="w-4 h-4 text-blue-600" />
              <span className="text-xs font-medium text-gray-600">Vistas Totales</span>
            </div>
            <div className="text-2xl font-bold text-gray-900">
              {estadisticas?.total_visualizaciones || 0}
            </div>
            <div className="text-xs text-gray-500 mt-1">
              Hoy: {estadisticas?.visualizaciones_hoy || 0}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-1">
              <TrendingUp className="w-4 h-4 text-green-600" />
              <span className="text-xs font-medium text-gray-600">Última Semana</span>
            </div>
            <div className="text-2xl font-bold text-gray-900">
              {estadisticas?.visualizaciones_semana || 0}
            </div>
            <div className="text-xs text-gray-500 mt-1">
              vistas
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-1">
              <FileText className="w-4 h-4 text-purple-600" />
              <span className="text-xs font-medium text-gray-600">Escandallos</span>
            </div>
            <div className="text-2xl font-bold text-gray-900">
              {estadisticas?.total_escandallos || 0}
            </div>
            <div className="text-xs text-gray-500 mt-1">
              consultados
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-1">
              <Users className="w-4 h-4 text-orange-600" />
              <span className="text-xs font-medium text-gray-600">Usuarios Únicos</span>
            </div>
            <div className="text-2xl font-bold text-gray-900">
              {estadisticas?.usuarios_unicos || 0}
            </div>
            <div className="text-xs text-gray-500 mt-1">
              personas
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Desglose por tipo de evento */}
      {estadisticas?.eventos_por_tipo && Object.keys(estadisticas.eventos_por_tipo).length > 0 && (
        <Card>
          <CardHeader>
            <h4 className="font-semibold text-gray-900 flex items-center gap-2">
              <Activity className="w-4 h-4" />
              Eventos por Tipo
            </h4>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {Object.entries(estadisticas.eventos_por_tipo).map(([tipo, cantidad]: [string, any]) => (
                <div key={tipo} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-2">
                    {obtenerIconoEvento(tipo)}
                    <span className="text-sm text-gray-700">{obtenerNombreEvento(tipo)}</span>
                  </div>
                  <Badge variant="secondary" className="ml-2">{cantidad}</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Timeline de eventos recientes */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <h4 className="font-semibold text-gray-900 flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              Actividad Reciente
            </h4>
            <Badge variant="outline" className="text-xs">
              Últimos {eventos.length} eventos
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          {eventos.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Activity className="w-12 h-12 mx-auto mb-3 text-gray-300" />
              <p className="text-sm">No hay eventos registrados para este producto</p>
            </div>
          ) : (
            <div className="space-y-3">
              {eventos.map((evento) => (
                <div 
                  key={evento.id} 
                  className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors border border-gray-100"
                >
                  {/* Icono del evento */}
                  <div className="mt-0.5">
                    {obtenerIconoEvento(evento.tipo_evento)}
                  </div>

                  {/* Información del evento */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium text-gray-900 text-sm">
                        {obtenerNombreEvento(evento.tipo_evento)}
                      </span>
                      {evento.tipo_usuario && (
                        <Badge variant="outline" className="text-xs">
                          {evento.tipo_usuario}
                        </Badge>
                      )}
                    </div>
                    
                    {/* Metadata */}
                    {evento.metadata && Object.keys(evento.metadata).length > 0 && (
                      <div className="text-xs text-gray-600 mt-1">
                        {evento.metadata.vista && (
                          <span className="mr-3">Vista: {evento.metadata.vista}</span>
                        )}
                        {evento.metadata.filtro_activo && (
                          <span>Filtro: {evento.metadata.filtro_activo}</span>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Fecha y dispositivo */}
                  <div className="flex flex-col items-end gap-1 text-right">
                    <span className="text-xs text-gray-500">
                      {formatearFecha(evento.timestamp)}
                    </span>
                    <div className="flex items-center gap-1">
                      {obtenerIconoDevice(evento.device)}
                      <span className="text-xs text-gray-400">{evento.navegador}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Último evento */}
      {estadisticas?.ultimo_evento && (
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-sm">
              <Activity className="w-4 h-4 text-blue-600" />
              <span className="text-gray-700">
                <strong>Última actividad:</strong> {obtenerNombreEvento(estadisticas.ultimo_evento.tipo_evento)}
              </span>
              <span className="text-gray-500">•</span>
              <span className="text-gray-600">
                {formatearFecha(estadisticas.ultimo_evento.timestamp)}
              </span>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
