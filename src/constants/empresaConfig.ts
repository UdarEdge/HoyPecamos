/**
 * CONFIGURACIÓN CENTRALIZADA DE EMPRESA
 * ======================================
 * 
 * IMPORTANTE: Este archivo es la fuente única de verdad para:
 * - Información de empresas
 * - Marcas disponibles
 * - Submarcas (líneas de producto)
 * - Puntos de venta (PDV)
 * - Relaciones jerárquicas: Empresa → Marca → Submarca → Productos
 * 
 * ⭐ JERARQUÍA CORRECTA:
 * Gerente
 *   └── Empresa (Disgarmink S.L.)
 *       └── Marca (Hoy Pecamos)
 *           ├── Submarca (Modomio - Pizzas)
 *           └── Submarca (BlackBurger - Hamburguesas)
 * 
 * USAR EN: Todos los filtros, cálculos, visualizaciones y componentes
 * 
 * MÓDULOS QUE DEBEN USAR ESTA CONFIG:
 * - Ventas, Cierres, EBITDA
 * - Clientes, Facturación
 * - Productos, Promociones
 * - Equipo y RRHH
 * - Stock y Proveedores
 * - Operativa, Chat y Soporte
 */

import { type Submarca } from '../types/submarca.types';

// ============================================
// TIPOS E INTERFACES
// ============================================

export interface Marca {
  id: string;
  codigo: string;
  nombre: string;
  empresaId: string;
  
  // Identidad visual de la marca principal
  colorPrincipal: string;
  colorSecundario: string;
  logoUrl?: string;
  logo?: string;
  
  // Submarcas que pertenecen a esta marca
  submarcasIds: string[];
  
  // Puntos de venta
  puntosVentaIds: string[];
  
  // Estado
  activo: boolean;
  fechaCreacion?: string;
}

export interface PuntoVenta {
  id: string;
  codigo: string;
  nombre: string;
  direccion: string;
  coordenadas: {
    latitud: number;
    longitud: number;
  };
  telefono: string;
  email: string;
  
  // Submarcas disponibles en este PDV (ahora apuntan a submarcas, no marcas)
  submarcasDisponibles: string[];
  
  marcaId: string; // Marca a la que pertenece
  empresaId: string;
  activo: boolean;
}

export interface Empresa {
  id: string;
  codigo: string;
  nombreFiscal: string;
  nombreComercial: string;
  cif: string;
  domicilioFiscal: string;
  
  // Marcas que pertenecen a esta empresa
  marcasIds: string[];
  
  // Puntos de venta
  puntosVentaIds: string[];
  
  activo: boolean;
}

// ============================================
// DATOS MAESTROS - HOY PECAMOS
// ============================================

/**
 * EMPRESA: Disgarmink S.L.
 */
export const EMPRESAS: Record<string, Empresa> = {
  'EMP-001': {
    id: 'EMP-001',
    codigo: 'DISARMINK',
    nombreFiscal: 'Disarmink S.L.',
    nombreComercial: 'Hoy Pecamos',
    cif: 'B67284315',
    domicilioFiscal: 'Avenida Onze Setembre, 1, 08391 Tiana, Barcelona',
    marcasIds: ['MRC-HOYPECAMOS'],
    puntosVentaIds: ['PDV-TIANA', 'PDV-BADALONA'],
    activo: true
  }
};

/**
 * MARCA: Hoy Pecamos
 * (Marca principal que engloba Modomio y BlackBurger)
 */
export const MARCAS: Record<string, Marca> = {
  'MRC-HOYPECAMOS': {
    id: 'MRC-HOYPECAMOS',
    codigo: 'HOYPECAMOS',
    nombre: 'Hoy Pecamos',
    empresaId: 'EMP-001',
    
    // Colores corporativos Hoy Pecamos
    colorPrincipal: '#ED1C24', // Rojo
    colorSecundario: '#000000', // Negro
    
    // Submarcas (líneas de producto)
    submarcasIds: ['SUB-MODOMIO', 'SUB-BLACKBURGER'],
    
    // Puntos de venta
    puntosVentaIds: ['PDV-TIANA', 'PDV-BADALONA'],
    
    activo: true,
    fechaCreacion: new Date().toISOString()
  }
};

/**
 * SUBMARCAS: Modomio (Pizzas) y BlackBurger (Hamburguesas)
 * Las submarcas son las líneas de producto de "Hoy Pecamos"
 */
export const SUBMARCAS: Record<string, Submarca> = {
  'SUB-MODOMIO': {
    id: 'SUB-MODOMIO',
    codigo: 'MODOMIO',
    nombre: 'Modomio',
    marcaId: 'MRC-HOYPECAMOS',
    empresaId: 'EMP-001',
    
    // Identidad visual
    colorIdentidad: '#FF6B35',
    icono: '🍕',
    logoUrl: 'figma:asset/b966ced4dfea1f56e5df241d7888d0c365c0e242.png',
    
    tipo: 'Pizzas',
    descripcion: 'Pizzas artesanales con ingredientes frescos',
    
    activo: true,
    fechaCreacion: new Date().toISOString(),
    orden: 1
  },
  'SUB-BLACKBURGER': {
    id: 'SUB-BLACKBURGER',
    codigo: 'BLACKBURGER',
    nombre: 'BlackBurger',
    marcaId: 'MRC-HOYPECAMOS',
    empresaId: 'EMP-001',
    
    // Identidad visual
    colorIdentidad: '#1A1A1A',
    icono: '🍔',
    logoUrl: 'figma:asset/38810c4050d91b450da46794e58e881817083739.png',
    
    tipo: 'Hamburguesas',
    descripcion: 'Hamburguesas gourmet con carne premium',
    
    activo: true,
    fechaCreacion: new Date().toISOString(),
    orden: 2
  }
};

/**
 * PUNTOS DE VENTA
 * Ahora tienen submarcasDisponibles en lugar de marcasDisponibles
 */
export const PUNTOS_VENTA: Record<string, PuntoVenta> = {
  'PDV-TIANA': {
    id: 'PDV-TIANA',
    codigo: 'PDV-TIANA',
    nombre: 'Tiana',
    direccion: 'Passeig de la Vilesa, 6, 08391 Tiana, Barcelona',
    coordenadas: {
      latitud: 41.4933,
      longitud: 2.2633
    },
    telefono: '+34 933 456 789',
    email: 'tiana@hoypecamos.com',
    
    // Submarcas disponibles en este PDV
    submarcasDisponibles: ['SUB-MODOMIO', 'SUB-BLACKBURGER'],
    
    marcaId: 'MRC-HOYPECAMOS',
    empresaId: 'EMP-001',
    activo: true
  },
  'PDV-BADALONA': {
    id: 'PDV-BADALONA',
    codigo: 'PDV-BADALONA',
    nombre: 'Badalona',
    direccion: 'Carrer del Doctor Robert, 75, 08915 Badalona, Barcelona',
    coordenadas: {
      latitud: 41.4500,
      longitud: 2.2461
    },
    telefono: '+34 933 456 790',
    email: 'badalona@hoypecamos.com',
    
    // Submarcas disponibles en este PDV
    submarcasDisponibles: ['SUB-MODOMIO', 'SUB-BLACKBURGER'],
    
    marcaId: 'MRC-HOYPECAMOS',
    empresaId: 'EMP-001',
    activo: true
  }
};

// ============================================
// FUNCIONES AUXILIARES
// ============================================

/**
 * Obtiene el nombre completo de la empresa para visualización
 */
export function getNombreEmpresa(empresaId: string): string {
  const empresa = EMPRESAS[empresaId];
  if (!empresa) return 'Empresa no encontrada';
  return `${empresa.nombreFiscal} - ${empresa.nombreComercial}`;
}

/**
 * Obtiene el nombre de la marca
 */
export function getNombreMarca(marcaId: string): string {
  const marca = MARCAS[marcaId];
  return marca?.nombre || 'Marca no encontrada';
}

/**
 * Obtiene el nombre de la submarca
 */
export function getNombreSubmarca(submarcaId: string): string {
  const submarca = SUBMARCAS[submarcaId];
  return submarca?.nombre || 'Submarca no encontrada';
}

/**
 * Obtiene el nombre del PDV
 */
export function getNombrePDV(pdvId: string): string {
  const pdv = PUNTOS_VENTA[pdvId];
  return pdv?.nombre || 'PDV no encontrado';
}

/**
 * Obtiene el nombre completo del PDV con sus submarcas
 */
export function getNombrePDVConSubmarcas(pdvId: string): string {
  const pdv = PUNTOS_VENTA[pdvId];
  if (!pdv) return 'PDV no encontrado';
  
  const submarcasNombres = pdv.submarcasDisponibles
    .map(submarcaId => SUBMARCAS[submarcaId]?.nombre)
    .filter(Boolean)
    .join(', ');
  
  if (submarcasNombres) {
    return `${pdv.nombre} - ${submarcasNombres}`;
  }
  return pdv.nombre;
}

/**
 * Obtiene todas las marcas de una empresa
 */
export function getMarcasEmpresa(empresaId: string): Marca[] {
  const empresa = EMPRESAS[empresaId];
  if (!empresa) return [];
  return empresa.marcasIds.map(id => MARCAS[id]).filter(Boolean);
}

/**
 * Obtiene todas las submarcas de una marca
 */
export function getSubmarcasMarca(marcaId: string): Submarca[] {
  const marca = MARCAS[marcaId];
  if (!marca) return [];
  return marca.submarcasIds.map(id => SUBMARCAS[id]).filter(Boolean);
}

/**
 * Obtiene todos los PDVs de una empresa
 */
export function getPDVsEmpresa(empresaId: string): PuntoVenta[] {
  const empresa = EMPRESAS[empresaId];
  if (!empresa) return [];
  return empresa.puntosVentaIds.map(id => PUNTOS_VENTA[id]).filter(Boolean);
}

/**
 * Obtiene todos los PDVs que tienen una submarca específica
 */
export function getPDVsPorSubmarca(submarcaId: string): PuntoVenta[] {
  return Object.values(PUNTOS_VENTA).filter(pdv => 
    pdv.submarcasDisponibles.includes(submarcaId)
  );
}

/**
 * Obtiene el icono de una submarca
 */
export function getIconoSubmarca(submarcaId: string): string {
  const submarca = SUBMARCAS[submarcaId];
  return submarca?.icono || '🏪';
}

// ============================================
// FUNCIONES DE COMPATIBILIDAD (DEPRECATED)
// ============================================

/**
 * @deprecated Usar getNombrePDVConSubmarcas en su lugar
 * Mantiene compatibilidad con código antiguo
 */
export function getNombrePDVConMarcas(pdvId: string): string {
  return getNombrePDVConSubmarcas(pdvId);
}

/**
 * @deprecated Usar getIconoSubmarca en su lugar
 * Mantiene compatibilidad con código antiguo
 */
export function getIconoMarca(marcaId: string): string {
  // Convertir marcaId a submarcaId si es necesario
  // Por ahora, retornar icono genérico
  const marca = MARCAS[marcaId];
  if (!marca) return '🏪';
  
  // Si la marca tiene submarcas, usar el icono de la primera
  if (marca.submarcasIds && marca.submarcasIds.length > 0) {
    return getIconoSubmarca(marca.submarcasIds[0]);
  }
  
  return '🏪';
}

// ============================================
// ARRAYS PARA SELECT/DROPDOWN
// ============================================

export const EMPRESAS_ARRAY = Object.values(EMPRESAS);
export const MARCAS_ARRAY = Object.values(MARCAS);
export const SUBMARCAS_ARRAY = Object.values(SUBMARCAS);
export const PUNTOS_VENTA_ARRAY = Object.values(PUNTOS_VENTA);

// ============================================
// CONFIGURACIÓN DE FILTROS GLOBALES
// ============================================

/**
 * Opciones para filtros de empresa
 */
export const OPCIONES_FILTRO_EMPRESA = EMPRESAS_ARRAY.map(emp => ({
  value: emp.id,
  label: getNombreEmpresa(emp.id),
  empresaId: emp.id
}));

/**
 * Opciones para filtros de marca
 */
export const OPCIONES_FILTRO_MARCA = MARCAS_ARRAY.map(marca => ({
  value: marca.id,
  label: marca.nombre,
  marcaId: marca.id,
  empresaId: marca.empresaId
}));

/**
 * Opciones para filtros de submarca
 */
export const OPCIONES_FILTRO_SUBMARCA = SUBMARCAS_ARRAY.map(submarca => ({
  value: submarca.id,
  label: submarca.nombre,
  submarcaId: submarca.id,
  marcaId: submarca.marcaId,
  icono: submarca.icono
}));

/**
 * Opciones para filtros de PDV
 */
export const OPCIONES_FILTRO_PDV = PUNTOS_VENTA_ARRAY.map(pdv => ({
  value: pdv.id,
  label: getNombrePDVConSubmarcas(pdv.id),
  pdvId: pdv.id,
  marcaId: pdv.marcaId,
  empresaId: pdv.empresaId
}));