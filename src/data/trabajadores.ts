/**
 * TRABAJADORES - SISTEMA MULTIEMPRESA
 * 
 * Gestión centralizada de trabajadores con contexto de empresa/marca/PDV
 */

import { 
  EMPRESAS, 
  MARCAS, 
  PUNTOS_VENTA 
} from '../constants/empresaConfig';

// ============================================
// INTERFACES Y TIPOS
// ============================================

export type EstadoTrabajador = 'activo' | 'vacaciones' | 'baja' | 'suspendido';
export type TipoContrato = 'indefinido' | 'temporal' | 'practicas' | 'formacion';
export type RolTrabajador = 'trabajador' | 'responsable_pdv' | 'coordinador' | 'gerente_marca';

export interface DistribucionCoste {
  puntoVentaId: string;
  porcentaje: number;
}

export interface Trabajador {
  // Identificación
  id: string;
  userId: string;                   // Relación con User de autenticación
  
  // ⭐ CONTEXTO MULTIEMPRESA
  empresaId: string;                // Empresa principal
  marcaId?: string;                 // Marca principal (opcional)
  puntoVentaId: string;             // PDV principal de trabajo
  puntosVentaAsignados?: string[];  // Múltiples PDVs donde puede trabajar
  
  // Datos personales
  nombre: string;
  apellidos: string;
  email: string;
  telefono: string;
  avatar?: string;
  
  // Datos laborales
  puesto: string;
  departamento: string;
  fechaIngreso: string;
  fechaSalida?: string;
  estado: EstadoTrabajador;
  
  // Contrato y horarios
  tipoContrato: TipoContrato;
  horasContrato: number;              // Horas mensuales contratadas
  horasTrabajadas: number;            // Horas trabajadas este mes
  salarioMensual?: number;            // Salario bruto mensual
  
  // Permisos y acceso
  rol: RolTrabajador;
  permisos: string[];
  
  // ⭐ CENTRO DE COSTES - SISTEMA MIXTO
  centroCostePorcentaje?: number;     // Si trabaja solo en 1 PDV
  distribucionCostes?: DistribucionCoste[];          // LEGACY: mantener compatibilidad
  distribucionCostesManual?: DistribucionCoste[];    // ⭐ Asignada por el GERENTE
  distribucionCostesCalculada?: DistribucionCoste[]; // ⭐ Calculada por FICHAJES
  usarDistribucionManual?: boolean;   // true = usar manual, false = usar calculada
  
  // ⭐ MÉTRICAS DE ABSENTISMO (calculadas)
  estadisticasMesActual?: {
    horasTrabajadas: number;
    diasTrabajados: number;
    diasAbsentismo: number;
    porcentajeAbsentismo: number;
    horasExtra: number;
  };
  
  // Documentación (opcional)
  dni?: string;
  nss?: string;
  direccion?: string;
  fechaNacimiento?: string;
  
  // Metadatos
  createdAt: string;
  updatedAt: string;
}

// ============================================
// DATOS MOCK - 6 TRABAJADORES
// ============================================

export const trabajadores: Trabajador[] = [
  // ==========================================
  // PDV: TIANA
  // ==========================================
  
  // 1. CAJERO - TIANA
  {
    id: 'TRB-001',
    userId: 'USER-TRB-001',
    empresaId: 'EMP-001',
    marcaId: 'MRC-HOYPECAMOS',
    puntoVentaId: 'PDV-TIANA',
    puntosVentaAsignados: ['PDV-TIANA'],
    
    nombre: 'Laura',
    apellidos: 'Martínez Ruiz',
    email: 'laura.martinez@hoypecamos.com',
    telefono: '+34 630 456 789',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Laura',
    
    puesto: 'Cajera',
    departamento: 'sala',
    fechaIngreso: '2023-05-10',
    estado: 'activo',
    
    tipoContrato: 'indefinido',
    horasContrato: 160,
    horasTrabajadas: 152,
    salarioMensual: 1400,
    
    rol: 'trabajador',
    permisos: ['fichar', 'ver_pedidos', 'crear_pedido', 'cobrar', 'tpv'],
    
    centroCostePorcentaje: 100,
    
    createdAt: '2023-05-10T00:00:00Z',
    updatedAt: '2025-12-31T00:00:00Z'
  },
  
  // 2. COCINERO - TIANA
  {
    id: 'TRB-002',
    userId: 'USER-TRB-002',
    empresaId: 'EMP-001',
    marcaId: 'MRC-HOYPECAMOS',
    puntoVentaId: 'PDV-TIANA',
    puntosVentaAsignados: ['PDV-TIANA'],
    
    nombre: 'Carlos',
    apellidos: 'Méndez García',
    email: 'carlos.mendez@hoypecamos.com',
    telefono: '+34 610 234 567',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Carlos',
    
    puesto: 'Cocinero',
    departamento: 'cocina',
    fechaIngreso: '2023-01-15',
    estado: 'activo',
    
    tipoContrato: 'indefinido',
    horasContrato: 160,
    horasTrabajadas: 168,
    salarioMensual: 1800,
    
    rol: 'trabajador',
    permisos: ['fichar', 'ver_pedidos', 'cambiar_estado_cocina', 'gestionar_stock'],
    
    centroCostePorcentaje: 100,
    
    createdAt: '2023-01-15T00:00:00Z',
    updatedAt: '2025-12-31T00:00:00Z'
  },
  
  // 3. REPARTIDOR - TIANA
  {
    id: 'TRB-003',
    userId: 'USER-TRB-003',
    empresaId: 'EMP-001',
    marcaId: 'MRC-HOYPECAMOS',
    puntoVentaId: 'PDV-TIANA',
    puntosVentaAsignados: ['PDV-TIANA'],
    
    nombre: 'Pedro',
    apellidos: 'Fernández Torres',
    email: 'pedro.fernandez@hoypecamos.com',
    telefono: '+34 655 234 567',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Pedro',
    
    puesto: 'Repartidor',
    departamento: 'delivery',
    fechaIngreso: '2024-01-15',
    estado: 'activo',
    
    tipoContrato: 'indefinido',
    horasContrato: 160,
    horasTrabajadas: 160,
    salarioMensual: 1500,
    
    rol: 'trabajador',
    permisos: ['fichar', 'ver_pedidos', 'gestionar_entregas'],
    
    centroCostePorcentaje: 100,
    
    createdAt: '2024-01-15T00:00:00Z',
    updatedAt: '2025-12-31T00:00:00Z'
  },
  
  // ==========================================
  // PDV: BADALONA
  // ==========================================
  
  // 4. CAJERO - BADALONA
  {
    id: 'TRB-004',
    userId: 'USER-TRB-004',
    empresaId: 'EMP-001',
    marcaId: 'MRC-HOYPECAMOS',
    puntoVentaId: 'PDV-BADALONA',
    puntosVentaAsignados: ['PDV-BADALONA'],
    
    nombre: 'Lucía',
    apellidos: 'Jiménez Romero',
    email: 'lucia.jimenez@hoypecamos.com',
    telefono: '+34 605 789 012',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Lucia',
    
    puesto: 'Cajera',
    departamento: 'sala',
    fechaIngreso: '2023-08-01',
    estado: 'activo',
    
    tipoContrato: 'indefinido',
    horasContrato: 160,
    horasTrabajadas: 158,
    salarioMensual: 1400,
    
    rol: 'trabajador',
    permisos: ['fichar', 'ver_pedidos', 'crear_pedido', 'cobrar', 'tpv'],
    
    centroCostePorcentaje: 100,
    
    createdAt: '2023-08-01T00:00:00Z',
    updatedAt: '2025-12-31T00:00:00Z'
  },
  
  // 5. COCINERO - BADALONA
  {
    id: 'TRB-005',
    userId: 'USER-TRB-005',
    empresaId: 'EMP-001',
    marcaId: 'MRC-HOYPECAMOS',
    puntoVentaId: 'PDV-BADALONA',
    puntosVentaAsignados: ['PDV-BADALONA'],
    
    nombre: 'Javier',
    apellidos: 'Sánchez Ruiz',
    email: 'javier.sanchez@hoypecamos.com',
    telefono: '+34 675 456 789',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Javier',
    
    puesto: 'Cocinero',
    departamento: 'cocina',
    fechaIngreso: '2023-04-10',
    estado: 'activo',
    
    tipoContrato: 'indefinido',
    horasContrato: 160,
    horasTrabajadas: 165,
    salarioMensual: 1700,
    
    rol: 'trabajador',
    permisos: ['fichar', 'ver_pedidos', 'cambiar_estado_cocina', 'gestionar_stock'],
    
    centroCostePorcentaje: 100,
    
    createdAt: '2023-04-10T00:00:00Z',
    updatedAt: '2025-12-31T00:00:00Z'
  },
  
  // 6. REPARTIDOR - BADALONA
  {
    id: 'TRB-006',
    userId: 'USER-TRB-006',
    empresaId: 'EMP-001',
    marcaId: 'MRC-HOYPECAMOS',
    puntoVentaId: 'PDV-BADALONA',
    puntosVentaAsignados: ['PDV-BADALONA'],
    
    nombre: 'Miguel',
    apellidos: 'Torres Blanco',
    email: 'miguel.torres@hoypecamos.com',
    telefono: '+34 615 890 123',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Miguel',
    
    puesto: 'Repartidor',
    departamento: 'delivery',
    fechaIngreso: '2024-03-10',
    estado: 'activo',
    
    tipoContrato: 'temporal',
    horasContrato: 160,
    horasTrabajadas: 155,
    salarioMensual: 1450,
    
    rol: 'trabajador',
    permisos: ['fichar', 'ver_pedidos', 'gestionar_entregas'],
    
    centroCostePorcentaje: 100,
    
    createdAt: '2024-03-10T00:00:00Z',
    updatedAt: '2025-12-31T00:00:00Z'
  }
];

// ============================================
// FUNCIONES AUXILIARES
// ============================================

/**
 * Obtiene trabajadores de un punto de venta específico
 */
export function obtenerTrabajadoresPorPDV(puntoVentaId: string): Trabajador[] {
  return trabajadores.filter(t => t.puntoVentaId === puntoVentaId);
}

/**
 * Obtiene trabajadores de una empresa
 */
export function obtenerTrabajadoresPorEmpresa(empresaId: string): Trabajador[] {
  return trabajadores.filter(t => t.empresaId === empresaId);
}

/**
 * Obtiene trabajadores de una marca
 */
export function obtenerTrabajadoresPorMarca(marcaId: string): Trabajador[] {
  return trabajadores.filter(t => t.marcaId === marcaId);
}

/**
 * Obtiene trabajadores por departamento
 */
export function obtenerTrabajadoresPorDepartamento(departamento: string): Trabajador[] {
  return trabajadores.filter(t => t.departamento === departamento);
}

/**
 * Obtiene trabajadores activos
 */
export function obtenerTrabajadoresActivos(): Trabajador[] {
  return trabajadores.filter(t => t.estado === 'activo');
}

/**
 * Busca un trabajador por ID
 */
export function obtenerTrabajadorPorId(id: string): Trabajador | undefined {
  return trabajadores.find(t => t.id === id);
}

/**
 * Obtiene el número total de trabajadores
 */
export function obtenerTotalTrabajadores(): number {
  return trabajadores.length;
}

/**
 * Calcula el coste total de nómina mensual
 */
export function calcularCosteTotalNomina(): number {
  return trabajadores.reduce((total, t) => total + (t.salarioMensual || 0), 0);
}
