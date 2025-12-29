import { useState } from 'react';
import { Card, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { ImageWithFallback } from '../figma/ImageWithFallback';
import { 
  X,
  Plus,
  Minus,
  ShoppingCart,
  Check,
} from 'lucide-react';
import { toast } from 'sonner@2.0.3';
import { useCart } from '../../contexts/CartContext';
import type { Producto } from '../../contexts/ProductosContext';

interface ProductoDetalleProps {
  producto: Producto;
  onClose: () => void;
  onProductoAñadido?: (producto: { nombre: string; imagen?: string; precio: number; cantidad: number }) => void;
}

export function ProductoDetalle({ producto, onClose, onProductoAñadido }: ProductoDetalleProps) {
  const [cantidad, setCantidad] = useState(1);
  const { addItem } = useCart();
  
  // 🔥 ESTADO DINÁMICO: Selecciones por grupo
  // Formato: { 'grupo-id': ['opcion-id-1', 'opcion-id-2', ...] }
  const [selecciones, setSelecciones] = useState<Record<string, string[]>>({});
  
  const tieneOpciones = producto.gruposOpciones && producto.gruposOpciones.length > 0;

  // Manejar selección de opciones
  const handleToggleOpcion = (grupoId: string, opcionId: string, maxSeleccion: number) => {
    setSelecciones(prev => {
      const seleccionGrupo = prev[grupoId] || [];
      
      if (maxSeleccion === 1) {
        // Radio: reemplazar
        return { ...prev, [grupoId]: [opcionId] };
      } else {
        // Checkbox: toggle
        if (seleccionGrupo.includes(opcionId)) {
          // Deseleccionar
          return {
            ...prev,
            [grupoId]: seleccionGrupo.filter(id => id !== opcionId)
          };
        } else {
          // Seleccionar (si no excede max)
          if (seleccionGrupo.length < maxSeleccion) {
            return {
              ...prev,
              [grupoId]: [...seleccionGrupo, opcionId]
            };
          } else {
            toast.error(`Máximo ${maxSeleccion} opciones permitidas`);
            return prev;
          }
        }
      }
    });
  };

  // Calcular precio total (base + adicionales)
  const calcularTotal = () => {
    let total = producto.precio * cantidad;
    
    if (tieneOpciones && producto.gruposOpciones) {
      producto.gruposOpciones.forEach(grupo => {
        const seleccionGrupo = selecciones[grupo.id] || [];
        seleccionGrupo.forEach(opcionId => {
          const opcion = grupo.opciones.find(o => o.id === opcionId);
          if (opcion && opcion.precioAdicional) {
            total += opcion.precioAdicional * cantidad;
          }
        });
      });
    }
    
    return total;
  };

  // Validar si todas las opciones obligatorias están seleccionadas
  const validarSelecciones = (): boolean => {
    if (!tieneOpciones || !producto.gruposOpciones) return true;
    
    for (const grupo of producto.gruposOpciones) {
      if (grupo.obligatorio) {
        const seleccionGrupo = selecciones[grupo.id] || [];
        const minRequerido = grupo.minSeleccion || 1;
        
        if (seleccionGrupo.length < minRequerido) {
          toast.error(`Debes seleccionar al menos ${minRequerido} opción(es) en "${grupo.titulo}"`);
          return false;
        }
      }
    }
    
    return true;
  };

  const handleAñadirAlCarrito = () => {
    // Validar selecciones
    if (!validarSelecciones()) {
      return;
    }
    
    // Añadir al carrito con nueva estructura
    addItem({
      productoId: producto.id,
      nombre: producto.nombre,
      precio: producto.precio,
      cantidad: cantidad,
      imagen: producto.imagen,
      tipoProducto: producto.tipoProducto || '',
      submarcaId: producto.submarcaId,
      stock: producto.stock,
      opciones: tieneOpciones ? {
        selecciones: selecciones
      } : undefined,
    });
    
    toast.success(`✅ ${producto.nombre} añadido al carrito`);
    
    // Callback confirmación
    if (onProductoAñadido) {
      onProductoAñadido({
        nombre: producto.nombre,
        imagen: producto.imagen,
        precio: producto.precio,
        cantidad: cantidad,
      });
    }
    
    onClose();
  };

  return (
    <div className="space-y-6">
      {/* Botón cerrar */}
      <div className="flex items-center justify-between">
        <h2 className="text-gray-900" style={{ fontFamily: 'Poppins, sans-serif' }}>
          Personaliza tu pedido
        </h2>
        <Button
          variant="ghost"
          size="sm"
          onClick={onClose}
          className="rounded-full"
        >
          <X className="w-5 h-5" />
        </Button>
      </div>

      {/* Ficha del Producto */}
      <Card className="border-2 border-teal-200">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6">
          {/* Imagen */}
          <div className="aspect-square relative overflow-hidden rounded-lg bg-gray-100">
            {producto.imagen ? (
              <ImageWithFallback 
                src={producto.imagen} 
                alt={producto.nombre}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-orange-100 to-orange-200 flex items-center justify-center">
                <ShoppingCart className="w-16 h-16 text-orange-400" />
              </div>
            )}
            {producto.destacado && (
              <Badge className="absolute top-3 right-3 bg-teal-600 text-white">
                Destacado
              </Badge>
            )}
          </div>

          {/* Info */}
          <div className="flex flex-col justify-between">
            <div>
              <Badge variant="outline" className="mb-2">
                {producto.tipoProducto || 'Producto'}
              </Badge>
              <h3 className="text-2xl mb-3 text-gray-900" style={{ fontFamily: 'Poppins, sans-serif' }}>
                {producto.nombre}
              </h3>
              <p className="text-gray-600 mb-4">
                {producto.descripcion}
              </p>
              
              <div className="flex items-center gap-3 mb-4">
                <p className="text-3xl font-semibold text-teal-600" style={{ fontFamily: 'Poppins, sans-serif' }}>
                  €{producto.precio.toFixed(2)}
                </p>
              </div>

              <div className="flex items-center gap-2 text-sm mb-4">
                <span className="text-gray-600">Stock:</span>
                <span className={producto.stock > 10 ? 'text-green-600' : 'text-orange-600'}>
                  {producto.stock > 10 ? '✓ Disponible' : `Solo ${producto.stock} unidades`}
                </span>
              </div>
            </div>

            {/* Selector de cantidad */}
            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-600 mb-2">Cantidad:</p>
                <div className="flex items-center gap-3">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCantidad(Math.max(1, cantidad - 1))}
                    className="h-10 w-10 p-0"
                  >
                    <Minus className="w-4 h-4" />
                  </Button>
                  <span className="text-xl min-w-[3rem] text-center" style={{ fontFamily: 'Poppins, sans-serif' }}>
                    {cantidad}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCantidad(Math.min(producto.stock, cantidad + 1))}
                    className="h-10 w-10 p-0"
                  >
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* 🔥 RENDERIZADO DINÁMICO DE GRUPOS DE OPCIONES */}
      {tieneOpciones && producto.gruposOpciones && (
        <div className="space-y-6">
          {producto.gruposOpciones.map((grupo) => {
            const seleccionGrupo = selecciones[grupo.id] || [];
            const esSingleChoice = grupo.maxSeleccion === 1;
            const progreso = `${seleccionGrupo.length}/${grupo.minSeleccion || grupo.maxSeleccion}`;
            const isCompleto = seleccionGrupo.length >= (grupo.minSeleccion || 0);

            return (
              <div key={grupo.id}>
                {/* Header del grupo */}
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-gray-900" style={{ fontFamily: 'Poppins, sans-serif' }}>
                    {grupo.titulo}
                    {grupo.obligatorio && <span className="text-red-600 ml-1">*</span>}
                  </h3>
                  {!esSingleChoice && (
                    <Badge 
                      className={`${
                        isCompleto 
                          ? 'bg-green-500/20 text-green-600 border-green-500/40' 
                          : 'bg-orange-500/20 text-orange-600 border-orange-500/40'
                      }`}
                    >
                      {progreso}
                    </Badge>
                  )}
                </div>

                {grupo.descripcion && (
                  <p className="text-sm text-gray-500 mb-3">{grupo.descripcion}</p>
                )}

                {/* Opciones del grupo */}
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {grupo.opciones.map((opcion) => {
                    const isSeleccionado = seleccionGrupo.includes(opcion.id);
                    
                    return (
                      <Card
                        key={opcion.id}
                        className={`cursor-pointer transition-all ${
                          isSeleccionado
                            ? 'border-2 border-teal-600 bg-teal-50'
                            : 'border hover:border-teal-300'
                        }`}
                        onClick={() => handleToggleOpcion(grupo.id, opcion.id, grupo.maxSeleccion || 1)}
                      >
                        <CardContent className="p-3">
                          <div className="flex items-center gap-3">
                            {/* Radio/Checkbox visual */}
                            <div className={`${
                              esSingleChoice ? 'w-5 h-5 rounded-full' : 'w-5 h-5 rounded-md'
                            } border-2 flex items-center justify-center flex-shrink-0 ${
                              isSeleccionado
                                ? 'border-teal-600 bg-teal-600'
                                : 'border-gray-300'
                            }`}>
                              {isSeleccionado && (
                                esSingleChoice ? (
                                  <div className="w-2 h-2 bg-white rounded-full" />
                                ) : (
                                  <Check className="w-3 h-3 text-white" />
                                )
                              )}
                            </div>
                            
                            {/* Nombre */}
                            <div className="flex-1 min-w-0">
                              <h4 className="text-sm text-gray-900">{opcion.nombre}</h4>
                            </div>

                            {/* Precio adicional */}
                            {opcion.precioAdicional > 0 && (
                              <span className="text-teal-600 text-sm font-semibold">
                                +€{opcion.precioAdicional.toFixed(2)}
                              </span>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Footer: Resumen y Botón */}
      <Card className="sticky bottom-0 bg-white shadow-lg border-2 border-teal-600">
        <CardContent className="p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex-1 w-full sm:w-auto">
              <p className="text-sm text-gray-600 mb-1">Total del pedido:</p>
              <div className="flex items-baseline gap-2">
                <p className="text-3xl font-semibold text-teal-600" style={{ fontFamily: 'Poppins, sans-serif' }}>
                  €{calcularTotal().toFixed(2)}
                </p>
                {cantidad > 1 && (
                  <p className="text-sm text-gray-500">
                    ({cantidad}x)
                  </p>
                )}
              </div>
            </div>
            
            <Button
              onClick={handleAñadirAlCarrito}
              disabled={producto.stock === 0}
              className="w-full sm:w-auto bg-teal-600 hover:bg-teal-700 h-12 px-8"
              style={{ fontFamily: 'Poppins, sans-serif' }}
            >
              <ShoppingCart className="w-5 h-5 mr-2" />
              Añadir al Carrito
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}