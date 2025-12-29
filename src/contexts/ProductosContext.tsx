/**
 * 🛍️ CONTEXTO DE PRODUCTOS Y CATEGORÍAS
 * Centraliza la gestión de productos y categorías para usar en TPV y Gestión de Productos
 * ✅ FASE 2: Sincronización de stock en tiempo real + BroadcastChannel
 * 
 * JERARQUÍA:
 * Gerente → Empresa → Marca → Submarca → Productos
 * 
 * ⭐ Los productos ahora se asocian a SUBMARCAS (no a categorías)
 */

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import { deliverySyncService, type ProductoDelivery } from '../services/delivery-sync.service';
import { stockReservationService } from '../services/stock-reservation.service';
import { productosAPI } from '../services/api';
import { toast } from 'sonner@2.0.3';

// ============================================
// BROADCAST CHANNEL - Sincronización de stock
// ============================================

let stockChannel: BroadcastChannel | null = null;

if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
  stockChannel = new BroadcastChannel('udar-stock-sync');
}

// ============================================
// TIPOS
// ============================================

interface OpcionPersonalizacion {
  id: string;
  nombre: string;
  precioAdicional?: number;
}

interface GrupoOpciones {
  id: string;
  titulo: string;
  descripcion?: string;
  obligatorio: boolean;
  minSeleccion?: number;
  maxSeleccion?: number;
  opciones: OpcionPersonalizacion[];
}

export interface Producto {
  id: string;
  nombre: string;
  
  // ⭐ CAMBIO: categoria → submarcaId
  submarcaId: string; // ID de la submarca (ej: "SUB-MODOMIO", "SUB-BLACKBURGER")
  
  // Tipo de producto (opcional, para clasificación)
  tipoProducto?: string; // "Combo", "Burger", "Pizza", "Entrante", "Postre", "Bebida"
  
  precio: number;
  stock: number;
  descripcion?: string;
  imagen?: string;
  activo?: boolean;
  visible_tpv?: boolean;
  sku?: string;
  iva?: number;
  gruposOpciones?: GrupoOpciones[]; // Para productos personalizables (combos, pizzas, etc.)
}

// ============================================
// TIPOS DE PRODUCTO (para clasificación)
// ============================================

// Tipos de producto generales (se comparten entre submarcas)
export const TIPOS_PRODUCTO = [
  'Combo',
  'Burger',
  'Pizza Premium',
  'Pizza Clásica',
  'Entrante',
  'Postre',
  'Bebida sin Alcohol',
  'Bebida con Alcohol'
];

// ============================================
// PRODUCTOS INICIALES - VACÍO (BASE LIMPIA)
// ============================================

// ⭐ Base limpia para empezar a crear productos desde cero en producción
const PRODUCTOS_INICIALES: Producto[] = [
  // Array vacío - Los productos se crearán desde el panel de gerente
  // y se guardarán en Supabase
];

// ============================================
// CONTEXT
// ============================================

interface ProductosContextType {
  productos: Producto[];
  categorias: string[];
  cargando: boolean;
  usandoSupabase: boolean;
  agregarProducto: (producto: Producto) => void;
  actualizarProducto: (id: string, producto: Partial<Producto>) => void;
  eliminarProducto: (id: string) => void;
  agregarCategoria: (categoria: string) => void;
  obtenerProductosPorSubmarca: (submarcaId: string) => Producto[];
  obtenerProductosPorTipo: (tipoProducto: string) => Producto[];
  
  // ✅ NUEVAS FUNCIONES - FASE 2
  obtenerProducto: (id: string) => Producto | undefined;
  actualizarStock: (id: string, nuevoStock: number) => void;
  incrementarStock: (id: string, cantidad: number) => void;
  decrementarStock: (id: string, cantidad: number) => boolean;
  verificarDisponibilidad: (id: string, cantidad: number, sessionId?: string) => {
    disponible: boolean;
    stockReal: number;
    stockReservado: number;
    stockDisponible: number;
  };
}

const ProductosContext = createContext<ProductosContextType | undefined>(undefined);

// ============================================
// PROVIDER
// ============================================

export function ProductosProvider({ children }: { children: ReactNode }) {
  const [productos, setProductos] = useState<Producto[]>([]);
  const [categorias, setCategorias] = useState<string[]>(TIPOS_PRODUCTO);
  const [cargando, setCargando] = useState(true);
  const [usandoSupabase, setUsandoSupabase] = useState(false);

  // ============================================
  // 🚀 CARGAR PRODUCTOS DESDE SUPABASE AL INICIO
  // ============================================
  useEffect(() => {
    async function cargarProductos() {
      try {
        setCargando(true);
        
        // Intentar cargar desde Supabase primero (usando marca HoyPecamos)
        const response = await productosAPI.getByMarca('MRC-HOYPECAMOS');
        
        if (response.success && response.productos && response.productos.length > 0) {
          console.log('✅ Productos cargados desde Supabase:', response.productos.length);
          setProductos(response.productos);
          setUsandoSupabase(true);
        } else {
          // Si no hay productos en Supabase, usar datos locales
          console.log('⚠️ No hay productos en Supabase, usando datos locales');
          setProductos(PRODUCTOS_INICIALES);
          setUsandoSupabase(false);
        }
      } catch (error) {
        console.error('❌ Error cargando productos, usando datos locales:', error);
        setProductos(PRODUCTOS_INICIALES);
        setUsandoSupabase(false);
      } finally {
        setCargando(false);
      }
    }

    cargarProductos();
  }, []);

  const agregarProducto = async (producto: Producto) => {
    // Actualizar estado local inmediatamente
    setProductos(prev => [...prev, producto]);
    
    // 🚀 Si estamos usando Supabase, guardar en la nube
    if (usandoSupabase) {
      try {
        await productosAPI.create(producto);
        console.log('✅ Producto guardado en Supabase:', producto.id);
      } catch (error) {
        console.error('❌ Error guardando producto en Supabase:', error);
        toast.error('Error al guardar producto en la nube');
      }
    }
    
    // 🚀 Sincronizar automáticamente con plataformas de delivery
    deliverySyncService.sincronizarProducto(producto as ProductoDelivery, 'crear')
      .then(resultados => {
        const exitosos = resultados.filter(r => r.exitoso).length;
        if (exitosos > 0) {
          toast.success(`✅ Producto sincronizado con ${exitosos} plataforma(s) de delivery`);
        }
      })
      .catch(error => {
        console.error('Error sincronizando producto:', error);
      });
  };

  const actualizarProducto = async (id: string, productoActualizado: Partial<Producto>) => {
    // Actualizar estado local inmediatamente
    setProductos(prev =>
      prev.map(p => (p.id === id ? { ...p, ...productoActualizado } : p))
    );
    
    // 🚀 Si estamos usando Supabase, actualizar en la nube
    if (usandoSupabase) {
      try {
        await productosAPI.update(id, productoActualizado);
        console.log('✅ Producto actualizado en Supabase:', id);
      } catch (error) {
        console.error('❌ Error actualizando producto en Supabase:', error);
        toast.error('Error al actualizar producto en la nube');
      }
    }
    
    // 🚀 Sincronizar automáticamente con plataformas de delivery
    const productoCompleto = productos.find(p => p.id === id);
    if (productoCompleto) {
      const productoActualizadoCompleto = { ...productoCompleto, ...productoActualizado };
      deliverySyncService.sincronizarProducto(productoActualizadoCompleto as ProductoDelivery, 'actualizar')
        .then(resultados => {
          const exitosos = resultados.filter(r => r.exitoso).length;
          if (exitosos > 0) {
            toast.success(`✅ Cambios sincronizados con ${exitosos} plataforma(s) de delivery`);
          }
        })
        .catch(error => {
          console.error('Error sincronizando actualización:', error);
        });
    }
  };

  const eliminarProducto = async (id: string) => {
    const productoAEliminar = productos.find(p => p.id === id);
    
    // Actualizar estado local inmediatamente
    setProductos(prev => prev.filter(p => p.id !== id));
    
    // 🚀 Si estamos usando Supabase, eliminar de la nube
    if (usandoSupabase) {
      try {
        await productosAPI.delete(id);
        console.log('✅ Producto eliminado de Supabase:', id);
      } catch (error) {
        console.error('❌ Error eliminando producto de Supabase:', error);
        toast.error('Error al eliminar producto de la nube');
      }
    }
    
    // 🚀 Sincronizar automáticamente con plataformas de delivery
    if (productoAEliminar) {
      deliverySyncService.sincronizarProducto(productoAEliminar as ProductoDelivery, 'eliminar')
        .then(resultados => {
          const exitosos = resultados.filter(r => r.exitoso).length;
          if (exitosos > 0) {
            toast.success(`✅ Producto eliminado de ${exitosos} plataforma(s) de delivery`);
          }
        })
        .catch(error => {
          console.error('Error sincronizando eliminación:', error);
        });
    }
  };

  const agregarCategoria = (categoria: string) => {
    if (!categorias.includes(categoria)) {
      setCategorias(prev => [...prev, categoria]);
    }
  };

  // ⭐ NUEVO: Obtener productos por SUBMARCA (reemplaza obtenerProductosPorMarca)
  const obtenerProductosPorSubmarca = (submarcaId: string) => {
    return productos.filter(p => p.submarcaId === submarcaId && p.activo && p.visible_tpv);
  };

  // ⭐ NUEVO: Obtener productos por TIPO (reemplaza obtenerProductosPorCategoria)
  const obtenerProductosPorTipo = (tipoProducto: string) => {
    return productos.filter(p => p.tipoProducto === tipoProducto && p.activo && p.visible_tpv);
  };

  // ============================================================================
  // ✅ NUEVAS FUNCIONES - FASE 2
  // ============================================================================

  // Escuchar cambios de stock de otros tabs
  useEffect(() => {
    if (!stockChannel) return;

    const handleMessage = (event: MessageEvent) => {
      const { type, productoId, stock } = event.data;

      if (type === 'STOCK_ACTUALIZADO') {
        setProductos(prev =>
          prev.map(p => (p.id === productoId ? { ...p, stock } : p))
        );
      }
    };

    stockChannel.onmessage = handleMessage;

    return () => {
      if (stockChannel) {
        stockChannel.onmessage = null;
      }
    };
  }, []);

  // Obtener un producto por ID
  const obtenerProducto = useCallback((id: string): Producto | undefined => {
    return productos.find(p => p.id === id);
  }, [productos]);

  // Actualizar stock directamente
  const actualizarStock = useCallback((id: string, nuevoStock: number) => {
    setProductos(prev =>
      prev.map(p => {
        if (p.id === id) {
          return { ...p, stock: nuevoStock };
        }
        return p;
      })
    );

    // ✅ Broadcast a otros tabs
    if (stockChannel) {
      stockChannel.postMessage({
        type: 'STOCK_ACTUALIZADO',
        productoId: id,
        stock: nuevoStock,
      });
    }

    console.info(`✅ Stock actualizado: ${id} → ${nuevoStock} unidades`);
  }, []);

  // Incrementar stock
  const incrementarStock = useCallback((id: string, cantidad: number) => {
    const producto = productos.find(p => p.id === id);
    if (!producto) {
      console.warn(`⚠️ Producto ${id} no encontrado`);
      return;
    }

    const nuevoStock = producto.stock + cantidad;
    actualizarStock(id, nuevoStock);
  }, [productos, actualizarStock]);

  // Decrementar stock
  const decrementarStock = useCallback((id: string, cantidad: number): boolean => {
    const producto = productos.find(p => p.id === id);
    if (!producto) {
      console.warn(`⚠️ Producto ${id} no encontrado`);
      return false;
    }

    if (producto.stock < cantidad) {
      console.warn(`⚠️ Stock insuficiente: ${producto.stock} < ${cantidad}`);
      return false;
    }

    const nuevoStock = producto.stock - cantidad;
    actualizarStock(id, nuevoStock);
    return true;
  }, [productos, actualizarStock]);

  // Verificar disponibilidad considerando reservas
  const verificarDisponibilidad = useCallback((
    id: string,
    cantidad: number,
    sessionId?: string
  ): {
    disponible: boolean;
    stockReal: number;
    stockReservado: number;
    stockDisponible: number;
  } => {
    const producto = productos.find(p => p.id === id);
    
    if (!producto) {
      return {
        disponible: false,
        stockReal: 0,
        stockReservado: 0,
        stockDisponible: 0,
      };
    }

    // Obtener stock reservado por otros (excluyendo la sesión actual)
    const stockReservado = stockReservationService.obtenerStockReservado(id, sessionId);
    const stockDisponible = producto.stock - stockReservado;

    return {
      disponible: stockDisponible >= cantidad && producto.activo !== false,
      stockReal: producto.stock,
      stockReservado,
      stockDisponible,
    };
  }, [productos]);

  return (
    <ProductosContext.Provider
      value={{
        productos,
        categorias,
        cargando,
        usandoSupabase,
        agregarProducto,
        actualizarProducto,
        eliminarProducto,
        agregarCategoria,
        obtenerProductosPorSubmarca,
        obtenerProductosPorTipo,
        // ✅ FASE 2: Nuevas funciones
        obtenerProducto,
        actualizarStock,
        incrementarStock,
        decrementarStock,
        verificarDisponibilidad,
      }}
    >
      {children}
    </ProductosContext.Provider>
  );
}

// ============================================
// HOOK
// ============================================

export function useProductos() {
  const context = useContext(ProductosContext);
  if (context === undefined) {
    throw new Error('useProductos debe usarse dentro de ProductosProvider');
  }
  return context;
}
