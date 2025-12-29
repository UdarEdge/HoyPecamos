/**
 * 🎯 SISTEMA DE CANALES DE VENTA
 * 
 * Gestión centralizada de canales de venta y sus integraciones.
 * Arquitectura de 3 capas:
 * 
 * CAPA 1: Canales de Venta (concepto de negocio - dónde se vende)
 * CAPA 2: Integraciones (implementación técnica - cómo se conecta)
 * CAPA 3: Agentes Externos (entidades terceras - gestión documental - independiente)
 */

import { useState, useEffect } from 'react';
import { toast } from 'sonner@2.0.3';

// ============================================================================
// INTERFACES Y TIPOS
// ============================================================================

export interface CanalVenta {
  id: string;
  nombre: string;              // "TPV (Tienda Física)"
  nombre_corto: string;         // "TPV"
  slug: string;                 // "tpv" (para filtros y URLs)
  icono: string;                // "🏪" emoji o nombre de icono lucide
  color: string;                // "#10b981" (código hex)
  activo: boolean;
  orden: number;
  tipo: 'nativo' | 'externo';   // nativo = TPV/Online, externo = WhatsApp/Marketplace
  requiere_integracion: boolean;
  descripcion?: string;
  integraciones_disponibles: string[]; // IDs de integraciones posibles
  integracion_activa?: string;  // ID de la integración conectada actualmente
  created_at?: string;
  updated_at?: string;
}

export interface IntegracionCanal {
  id: string;
  canal_id: string;             // Vinculado a CanalVenta
  nombre: string;               // "WhatsApp Business API"
  proveedor: string;            // "Meta", "Twilio", "Glovo", etc.
  tipo: 'api' | 'webhook' | 'nativo' | 'manual';
  estado: 'conectada' | 'desconectada' | 'error' | 'configurando';
  activo: boolean;
  config: {
    api_key?: string;
    api_secret?: string;
    webhook_url?: string;
    telefono_negocio?: string;  // Para WhatsApp
    email_integracion?: string; // Para email
    url_base?: string;
    // Campos específicos por proveedor
    [key: string]: any;
  };
  estadisticas?: {
    ultima_sincronizacion?: string;
    pedidos_recibidos_hoy?: number;
    pedidos_recibidos_mes?: number;
    tasa_exito?: number;
    total_sincronizaciones?: number;
  };
  logs?: LogIntegracion[];
  created_at?: string;
  updated_at?: string;
}

export interface LogIntegracion {
  id: string;
  integracion_id: string;
  timestamp: string;
  tipo: 'exito' | 'error' | 'advertencia' | 'info';
  mensaje: string;
  detalles?: any;
}

// ============================================================================
// CANALES POR DEFECTO
// ============================================================================

export const CANALES_DEFAULT: CanalVenta[] = [
  {
    id: 'canal-tpv',
    nombre: 'TPV (Tienda Física)',
    nombre_corto: 'TPV',
    slug: 'tpv',
    icono: '🏪',
    color: '#10b981', // verde
    activo: true,
    orden: 1,
    tipo: 'nativo',
    requiere_integracion: false,
    descripcion: 'Ventas realizadas en punto de venta físico',
    integraciones_disponibles: ['int-tpv-nativo'],
    integracion_activa: 'int-tpv-nativo',
    created_at: new Date().toISOString()
  },
  {
    id: 'canal-online',
    nombre: 'Online (App/Web)',
    nombre_corto: 'Online',
    slug: 'online',
    icono: '🌐',
    color: '#3b82f6', // azul
    activo: true,
    orden: 2,
    tipo: 'nativo',
    requiere_integracion: false,
    descripcion: 'Ventas a través de aplicación móvil y web',
    integraciones_disponibles: ['int-online-nativo'],
    integracion_activa: 'int-online-nativo',
    created_at: new Date().toISOString()
  },
  {
    id: 'canal-marketplace',
    nombre: 'Marketplace (Delivery)',
    nombre_corto: 'Marketplace',
    slug: 'marketplace',
    icono: '📦',
    color: '#f59e0b', // naranja
    activo: true,
    orden: 3,
    tipo: 'externo',
    requiere_integracion: true,
    descripcion: 'Plataformas de delivery y marketplaces',
    integraciones_disponibles: ['int-glovo', 'int-ubereats', 'int-justeat', 'int-deliveroo'],
    created_at: new Date().toISOString()
  }
];

// Integraciones por defecto
export const INTEGRACIONES_DEFAULT: IntegracionCanal[] = [
  {
    id: 'int-tpv-nativo',
    canal_id: 'canal-tpv',
    nombre: 'Sistema TPV Nativo',
    proveedor: 'Udar Edge',
    tipo: 'nativo',
    estado: 'conectada',
    activo: true,
    config: {},
    estadisticas: {
      ultima_sincronizacion: new Date().toISOString(),
      pedidos_recibidos_hoy: 0,
      pedidos_recibidos_mes: 0,
      tasa_exito: 100
    },
    created_at: new Date().toISOString()
  },
  {
    id: 'int-online-nativo',
    canal_id: 'canal-online',
    nombre: 'App/Web Nativa',
    proveedor: 'Udar Edge',
    tipo: 'nativo',
    estado: 'conectada',
    activo: true,
    config: {},
    estadisticas: {
      ultima_sincronizacion: new Date().toISOString(),
      pedidos_recibidos_hoy: 0,
      pedidos_recibidos_mes: 0,
      tasa_exito: 100
    },
    created_at: new Date().toISOString()
  },
  {
    id: 'int-glovo',
    canal_id: 'canal-marketplace',
    nombre: 'Glovo',
    proveedor: 'Glovo',
    tipo: 'api',
    estado: 'conectada',
    activo: true,
    config: {
      api_key: '***********',
      store_id: 'STORE-123'
    },
    estadisticas: {
      ultima_sincronizacion: new Date().toISOString(),
      pedidos_recibidos_hoy: 12,
      pedidos_recibidos_mes: 340,
      tasa_exito: 98.5,
      total_sincronizaciones: 1250
    },
    created_at: new Date().toISOString()
  },
  {
    id: 'int-ubereats',
    canal_id: 'canal-marketplace',
    nombre: 'Uber Eats',
    proveedor: 'Uber',
    tipo: 'api',
    estado: 'conectada',
    activo: true,
    config: {
      api_key: '***********',
      store_id: 'UBER-456'
    },
    estadisticas: {
      ultima_sincronizacion: new Date().toISOString(),
      pedidos_recibidos_hoy: 8,
      pedidos_recibidos_mes: 215,
      tasa_exito: 97.2,
      total_sincronizaciones: 890
    },
    created_at: new Date().toISOString()
  },
  {
    id: 'int-justeat',
    canal_id: 'canal-marketplace',
    nombre: 'Just Eat',
    proveedor: 'Just Eat',
    tipo: 'api',
    estado: 'desconectada',
    activo: false,
    config: {},
    created_at: new Date().toISOString()
  }
];

// ============================================================================
// PLANTILLAS DE CANALES (para añadir rápido)
// ============================================================================

export const PLANTILLAS_CANALES: Omit<CanalVenta, 'id' | 'created_at' | 'updated_at'>[] = [
  {
    nombre: 'WhatsApp',
    nombre_corto: 'WhatsApp',
    slug: 'whatsapp',
    icono: '📱',
    color: '#25D366',
    activo: false,
    orden: 10,
    tipo: 'externo',
    requiere_integracion: true,
    descripcion: 'Pedidos recibidos por WhatsApp Business',
    integraciones_disponibles: ['int-whatsapp-business', 'int-twilio-whatsapp', 'int-wassenger']
  },
  {
    nombre: 'Telefónico',
    nombre_corto: 'Teléfono',
    slug: 'telefonico',
    icono: '☎️',
    color: '#6366f1',
    activo: false,
    orden: 11,
    tipo: 'externo',
    requiere_integracion: false,
    descripcion: 'Pedidos por llamada telefónica',
    integraciones_disponibles: ['int-centralita-voip']
  },
  {
    nombre: 'Corporativo (B2B)',
    nombre_corto: 'Corporativo',
    slug: 'corporativo',
    icono: '🏢',
    color: '#8b5cf6',
    activo: false,
    orden: 12,
    tipo: 'externo',
    requiere_integracion: false,
    descripcion: 'Ventas a empresas y contratos corporativos',
    integraciones_disponibles: []
  },
  {
    nombre: 'Email',
    nombre_corto: 'Email',
    slug: 'email',
    icono: '📧',
    color: '#ec4899',
    activo: false,
    orden: 13,
    tipo: 'externo',
    requiere_integracion: true,
    descripcion: 'Pedidos recibidos por correo electrónico',
    integraciones_disponibles: ['int-email-smtp']
  },
  {
    nombre: 'Redes Sociales',
    nombre_corto: 'RRSS',
    slug: 'redes-sociales',
    icono: '📣',
    color: '#f43f5e',
    activo: false,
    orden: 14,
    tipo: 'externo',
    requiere_integracion: true,
    descripcion: 'Pedidos desde Instagram, Facebook, etc.',
    integraciones_disponibles: ['int-facebook', 'int-instagram']
  }
];

// ============================================================================
// ALMACENAMIENTO LOCAL + SUPABASE (Sistema híbrido)
// ============================================================================

const STORAGE_KEY_CANALES = 'udar_canales_venta';
const STORAGE_KEY_INTEGRACIONES = 'udar_integraciones_canales';

/**
 * Inicializar canales con valores por defecto si no existen
 */
export function inicializarCanales(): CanalVenta[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY_CANALES);
    if (stored) {
      return JSON.parse(stored);
    }
    
    // Si no existen, crear por defecto
    localStorage.setItem(STORAGE_KEY_CANALES, JSON.stringify(CANALES_DEFAULT));
    return CANALES_DEFAULT;
  } catch (error) {
    console.error('Error al inicializar canales:', error);
    return CANALES_DEFAULT;
  }
}

/**
 * Inicializar integraciones con valores por defecto si no existen
 */
export function inicializarIntegraciones(): IntegracionCanal[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY_INTEGRACIONES);
    if (stored) {
      return JSON.parse(stored);
    }
    
    // Si no existen, crear por defecto
    localStorage.setItem(STORAGE_KEY_INTEGRACIONES, JSON.stringify(INTEGRACIONES_DEFAULT));
    return INTEGRACIONES_DEFAULT;
  } catch (error) {
    console.error('Error al inicializar integraciones:', error);
    return INTEGRACIONES_DEFAULT;
  }
}

/**
 * Obtener todos los canales
 */
export function obtenerCanales(): CanalVenta[] {
  return inicializarCanales();
}

/**
 * Obtener canales activos (para filtros)
 */
export function obtenerCanalesActivos(): CanalVenta[] {
  return obtenerCanales().filter(c => c.activo).sort((a, b) => a.orden - b.orden);
}

/**
 * Obtener canal por slug
 */
export function obtenerCanalPorSlug(slug: string): CanalVenta | undefined {
  return obtenerCanales().find(c => c.slug === slug);
}

/**
 * Guardar canales
 */
export function guardarCanales(canales: CanalVenta[]): void {
  try {
    localStorage.setItem(STORAGE_KEY_CANALES, JSON.stringify(canales));
    
    // TODO: Sincronizar con Supabase
    // await supabase.from('canales_venta').upsert(canales);
  } catch (error) {
    console.error('Error al guardar canales:', error);
    throw error;
  }
}

/**
 * Crear nuevo canal
 */
export function crearCanal(canal: Omit<CanalVenta, 'id' | 'created_at' | 'updated_at'>): CanalVenta {
  const canales = obtenerCanales();
  const nuevoCanal: CanalVenta = {
    ...canal,
    id: `canal-${Date.now()}`,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };
  
  guardarCanales([...canales, nuevoCanal]);
  return nuevoCanal;
}

/**
 * Actualizar canal
 */
export function actualizarCanal(id: string, datos: Partial<CanalVenta>): void {
  const canales = obtenerCanales();
  const index = canales.findIndex(c => c.id === id);
  
  if (index === -1) {
    throw new Error('Canal no encontrado');
  }
  
  canales[index] = {
    ...canales[index],
    ...datos,
    updated_at: new Date().toISOString()
  };
  
  guardarCanales(canales);
}

/**
 * Eliminar canal
 */
export function eliminarCanal(id: string): void {
  const canales = obtenerCanales();
  const canalAEliminar = canales.find(c => c.id === id);
  
  if (!canalAEliminar) {
    throw new Error('Canal no encontrado');
  }
  
  // No permitir eliminar canales nativos
  if (canalAEliminar.tipo === 'nativo') {
    throw new Error('No se pueden eliminar canales nativos del sistema');
  }
  
  guardarCanales(canales.filter(c => c.id !== id));
}

/**
 * Reordenar canales
 */
export function reordenarCanales(canales: CanalVenta[]): void {
  const canalesConOrden = canales.map((canal, index) => ({
    ...canal,
    orden: index + 1,
    updated_at: new Date().toISOString()
  }));
  
  guardarCanales(canalesConOrden);
}

// ============================================================================
// GESTIÓN DE INTEGRACIONES
// ============================================================================

/**
 * Obtener todas las integraciones
 */
export function obtenerIntegraciones(): IntegracionCanal[] {
  return inicializarIntegraciones();
}

/**
 * Obtener integraciones por canal
 */
export function obtenerIntegracionesPorCanal(canalId: string): IntegracionCanal[] {
  return obtenerIntegraciones().filter(i => i.canal_id === canalId);
}

/**
 * Obtener integración activa de un canal
 */
export function obtenerIntegracionActiva(canalId: string): IntegracionCanal | undefined {
  const canal = obtenerCanales().find(c => c.id === canalId);
  if (!canal || !canal.integracion_activa) return undefined;
  
  return obtenerIntegraciones().find(i => i.id === canal.integracion_activa);
}

/**
 * Guardar integraciones
 */
export function guardarIntegraciones(integraciones: IntegracionCanal[]): void {
  try {
    localStorage.setItem(STORAGE_KEY_INTEGRACIONES, JSON.stringify(integraciones));
    
    // TODO: Sincronizar con Supabase
    // await supabase.from('integraciones_canales').upsert(integraciones);
  } catch (error) {
    console.error('Error al guardar integraciones:', error);
    throw error;
  }
}

/**
 * Actualizar integración
 */
export function actualizarIntegracion(id: string, datos: Partial<IntegracionCanal>): void {
  const integraciones = obtenerIntegraciones();
  const index = integraciones.findIndex(i => i.id === id);
  
  if (index === -1) {
    throw new Error('Integración no encontrada');
  }
  
  integraciones[index] = {
    ...integraciones[index],
    ...datos,
    updated_at: new Date().toISOString()
  };
  
  guardarIntegraciones(integraciones);
}

/**
 * Conectar integración a un canal
 */
export function conectarIntegracion(integracionId: string): void {
  const integracion = obtenerIntegraciones().find(i => i.id === integracionId);
  if (!integracion) {
    throw new Error('Integración no encontrada');
  }
  
  // Actualizar estado de la integración
  actualizarIntegracion(integracionId, {
    estado: 'conectada',
    activo: true
  });
  
  // Actualizar canal para marcar esta integración como activa
  actualizarCanal(integracion.canal_id, {
    integracion_activa: integracionId
  });
}

/**
 * Desconectar integración
 */
export function desconectarIntegracion(integracionId: string): void {
  const integracion = obtenerIntegraciones().find(i => i.id === integracionId);
  if (!integracion) {
    throw new Error('Integración no encontrada');
  }
  
  // Actualizar estado de la integración
  actualizarIntegracion(integracionId, {
    estado: 'desconectada',
    activo: false
  });
  
  // Limpiar integración activa del canal
  const canal = obtenerCanales().find(c => c.id === integracion.canal_id);
  if (canal && canal.integracion_activa === integracionId) {
    actualizarCanal(canal.id, {
      integracion_activa: undefined
    });
  }
}

// ============================================================================
// HOOK PERSONALIZADO
// ============================================================================

export function useCanalesVenta() {
  const [canales, setCanales] = useState<CanalVenta[]>([]);
  const [integraciones, setIntegraciones] = useState<IntegracionCanal[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = () => {
    try {
      setCanales(obtenerCanales());
      setIntegraciones(obtenerIntegraciones());
    } catch (error) {
      console.error('Error al cargar canales:', error);
      toast.error('Error al cargar canales de venta');
    } finally {
      setLoading(false);
    }
  };

  const refrescar = () => {
    cargarDatos();
  };

  return {
    canales,
    canalesActivos: canales.filter(c => c.activo).sort((a, b) => a.orden - b.orden),
    integraciones,
    loading,
    refrescar,
    // Métodos de canales
    crearCanal: (canal: Omit<CanalVenta, 'id' | 'created_at' | 'updated_at'>) => {
      const nuevo = crearCanal(canal);
      refrescar();
      return nuevo;
    },
    actualizarCanal: (id: string, datos: Partial<CanalVenta>) => {
      actualizarCanal(id, datos);
      refrescar();
    },
    eliminarCanal: (id: string) => {
      eliminarCanal(id);
      refrescar();
    },
    reordenarCanales: (nuevosCanales: CanalVenta[]) => {
      reordenarCanales(nuevosCanales);
      refrescar();
    },
    // Métodos de integraciones
    obtenerIntegracionesPorCanal,
    actualizarIntegracion: (id: string, datos: Partial<IntegracionCanal>) => {
      actualizarIntegracion(id, datos);
      refrescar();
    },
    conectarIntegracion: (id: string) => {
      conectarIntegracion(id);
      refrescar();
    },
    desconectarIntegracion: (id: string) => {
      desconectarIntegracion(id);
      refrescar();
    }
  };
}

export default useCanalesVenta;
