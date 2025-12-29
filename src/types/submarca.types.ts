/**
 * 🏷️ TIPOS DE SUBMARCAS - UDAR EDGE
 * Define las submarcas como líneas de producto dentro de una marca
 * 
 * JERARQUÍA:
 * Gerente → Empresa → Marca → Submarca → Productos
 * 
 * Ejemplo:
 * - Empresa: Disgarmink S.L.
 * - Marca: Hoy Pecamos
 * - Submarcas: Modomio (pizzas), BlackBurger (hamburguesas)
 */

export interface Submarca {
  id: string;
  codigo: string;
  nombre: string;
  marcaId: string; // ID de la marca padre (ej: "MRC-HOYPECAMOS")
  empresaId: string; // ID de la empresa (heredado)
  
  // Identidad visual
  colorIdentidad: string;
  icono?: string;
  logoUrl?: string;
  logo?: string; // Alias de logoUrl
  
  // Información
  tipo: string; // "Pizzas", "Hamburguesas", "Postres", etc.
  descripcion?: string;
  
  // Estado
  activo: boolean;
  fechaCreacion?: string;
  
  // Metadata
  orden?: number; // Para ordenar en la UI
}

/**
 * Helper: Verificar si una submarca está activa
 */
export function estaActivaSubmarca(submarca: Submarca): boolean {
  return submarca.activo === true;
}

/**
 * Helper: Obtener submarcas de una marca
 */
export function obtenerSubmarcasPorMarca(
  submarcas: Submarca[], 
  marcaId: string
): Submarca[] {
  return submarcas.filter(s => s.marcaId === marcaId && s.activo);
}

/**
 * Helper: Obtener submarca por ID
 */
export function obtenerSubmarcaPorId(
  submarcas: Submarca[], 
  submarcaId: string
): Submarca | undefined {
  return submarcas.find(s => s.id === submarcaId);
}
