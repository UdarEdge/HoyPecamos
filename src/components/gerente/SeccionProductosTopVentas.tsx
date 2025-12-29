import { Download, TrendingUp, ArrowUpRight, ArrowDownRight, Minus } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';

interface ProductoTop {
  producto_id: string;
  producto_nombre: string;
  producto_imagen: string;
  categoria: string;
  submarca_nombre: string;
  submarca_icono: string;
  unidades_vendidas: number;
  total_ingresos: number;
  precio_promedio: number;
  porcentaje_ventas: number;
  tendencia: "subida" | "bajada" | "estable";
  variacion_vs_anterior: number;
}

interface SeccionProductosTopVentasProps {
  productos: ProductoTop[];
  cargando: boolean;
  onExportar: () => void;
}

export function SeccionProductosTopVentas({ 
  productos, 
  cargando, 
  onExportar 
}: SeccionProductosTopVentasProps) {
  
  if (cargando) {
    return (
      <Card className="border-gray-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5" style={{ color: '#ED1C24' }} />
            Productos Más Vendidos
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12 text-gray-500">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mb-4"></div>
            <p>Cargando productos...</p>
          </div>
        </CardContent>
      </Card>
    );
  }
  
  if (productos.length === 0) {
    return (
      <Card className="border-gray-200">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5" style={{ color: '#ED1C24' }} />
            Productos Más Vendidos
          </CardTitle>
          <Button 
            onClick={onExportar}
            className="bg-black text-white hover:bg-gray-800"
            size="sm"
          >
            <Download className="w-4 h-4 mr-2" />
            Exportar CSV
          </Button>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12 text-gray-500">
            <p>No hay datos de productos para el periodo seleccionado</p>
          </div>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <Card className="border-gray-200">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="w-5 h-5" style={{ color: '#ED1C24' }} />
          Productos Más Vendidos
        </CardTitle>
        <Button 
          onClick={onExportar}
          className="bg-black text-white hover:bg-gray-800"
          size="sm"
        >
          <Download className="w-4 h-4 mr-2" />
          Exportar CSV
        </Button>
      </CardHeader>
      <CardContent>
        <div className="mb-4">
          <p className="text-sm text-gray-600">
            🏆 Top {productos.length} productos del periodo
          </p>
        </div>
        
        <div className="space-y-3">
          {productos.map((producto, index) => (
            <div 
              key={producto.producto_id}
              className="flex items-center gap-4 p-4 border border-gray-200 rounded-lg hover:border-red-200 transition-colors"
            >
              {/* Ranking */}
              <div className="flex-shrink-0 w-12 text-center">
                <div 
                  className={`text-2xl ${
                    index === 0 ? 'text-yellow-500' : 
                    index === 1 ? 'text-gray-400' : 
                    index === 2 ? 'text-orange-600' : 
                    'text-gray-300'
                  }`}
                  style={{ fontWeight: '700' }}
                >
                  #{index + 1}
                </div>
              </div>
              
              {/* Imagen */}
              {producto.producto_imagen ? (
                <img 
                  src={producto.producto_imagen} 
                  alt={producto.producto_nombre}
                  className="w-16 h-16 object-cover rounded-lg flex-shrink-0"
                  onError={(e) => {
                    // Fallback si la imagen no carga
                    (e.target as HTMLImageElement).src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="64" height="64"%3E%3Crect fill="%23f3f4f6" width="64" height="64"/%3E%3Ctext x="50%25" y="50%25" font-size="32" text-anchor="middle" dy=".3em"%3E📦%3C/text%3E%3C/svg%3E';
                  }}
                />
              ) : (
                <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center text-2xl flex-shrink-0">
                  📦
                </div>
              )}
              
              {/* Info del producto */}
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-gray-900 truncate">
                  {producto.producto_nombre}
                </h3>
                <p className="text-sm text-gray-500">
                  {producto.submarca_icono} {producto.submarca_nombre} • {producto.categoria}
                </p>
              </div>
              
              {/* Métricas */}
              <div className="flex-shrink-0 text-right">
                <div className="font-semibold text-gray-900">
                  {producto.unidades_vendidas} uds • €{producto.total_ingresos.toFixed(2)}
                </div>
                <div className="text-sm text-gray-500 flex items-center justify-end gap-2">
                  <span>{producto.porcentaje_ventas.toFixed(1)}% del total</span>
                  {producto.tendencia === 'subida' && producto.variacion_vs_anterior > 0 && (
                    <span className="text-green-600 flex items-center gap-1">
                      <ArrowUpRight className="w-3 h-3" />
                      {producto.variacion_vs_anterior.toFixed(1)}%
                    </span>
                  )}
                  {producto.tendencia === 'bajada' && producto.variacion_vs_anterior < 0 && (
                    <span className="text-red-600 flex items-center gap-1">
                      <ArrowDownRight className="w-3 h-3" />
                      {Math.abs(producto.variacion_vs_anterior).toFixed(1)}%
                    </span>
                  )}
                  {producto.tendencia === 'estable' && (
                    <span className="text-gray-400 flex items-center gap-1">
                      <Minus className="w-3 h-3" />
                      0%
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
        
        {productos.length >= 10 && (
          <div className="mt-4 text-center">
            <p className="text-sm text-gray-500">
              Mostrando los 10 productos con mayores ingresos
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
