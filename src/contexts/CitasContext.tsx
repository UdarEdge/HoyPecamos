/**
 * 📅 CONTEXTO DE CITAS
 * Estado compartido del sistema de citas entre todos los perfiles
 */

import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { citasService } from '../services/citas.service';
import type { 
  Cita, 
  ConfiguracionCitas, 
  SolicitudCita, 
  FiltrosCitas,
  DisponibilidadDia,
  EstadisticasCitas
} from '../types/cita.types';

// ============================================
// TIPOS DEL CONTEXTO
// ============================================

interface CitasContextType {
  // Estado
  citas: Cita[];
  citasPendientes: number;
  citasConfirmadas: number;
  
  // Configuración
  configuracion: ConfiguracionCitas | null;
  
  // CRUD Citas
  crearCita: (solicitud: SolicitudCita, clienteNombre: string) => Promise<{ exito: boolean; cita?: Cita; error?: string }>;
  obtenerCitas: (filtros?: FiltrosCitas) => Cita[];
  obtenerCitaPorId: (id: string) => Cita | null;
  confirmarCita: (citaId: string, trabajadorId: string, trabajadorNombre: string) => Promise<{ exito: boolean; error?: string }>;
  cancelarCita: (citaId: string, motivo: string, canceladoPor: string) => Promise<boolean>;
  actualizarEstadoCita: (citaId: string, estado: Cita['estado'], usuarioId: string) => Promise<boolean>;
  
  // Configuración
  cargarConfiguracion: (puntoVentaId: string) => void;
  guardarConfiguracion: (config: ConfiguracionCitas) => void;
  
  // Disponibilidad
  obtenerDisponibilidad: (fecha: string, puntoVentaId: string) => DisponibilidadDia;
  
  // Estadísticas
  obtenerEstadisticas: (filtros?: FiltrosCitas) => EstadisticasCitas;
  
  // Verificación de cita confirmada
  tieneCitaConfirmada: (clienteId: string) => boolean;
  obtenerProximaCitaConfirmada: (clienteId: string) => Cita | null;
  
  // Refrescar datos
  refrescar: () => void;
}

const CitasContext = createContext<CitasContextType | undefined>(undefined);

// ============================================
// PROVIDER
// ============================================

interface CitasProviderProps {
  children: ReactNode;
}

export function CitasProvider({ children }: CitasProviderProps) {
  const [citas, setCitas] = useState<Cita[]>([]);
  const [configuracion, setConfiguracion] = useState<ConfiguracionCitas | null>(null);
  const [citasPendientes, setCitasPendientes] = useState(0);
  const [citasConfirmadas, setCitasConfirmadas] = useState(0);

  // Cargar citas al iniciar
  const cargarCitas = useCallback(() => {
    const todasLasCitas = citasService.obtenerCitas();
    setCitas(todasLasCitas);
    
    // Actualizar contadores
    const pendientes = todasLasCitas.filter(c => c.estado === 'solicitada').length;
    const confirmadas = todasLasCitas.filter(c => c.estado === 'confirmada').length;
    
    setCitasPendientes(pendientes);
    setCitasConfirmadas(confirmadas);
  }, []);

  useEffect(() => {
    cargarCitas();
    
    // Listener para cambios en localStorage (sincronización entre tabs)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'udar_citas') {
        cargarCitas();
      }
    };
    
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [cargarCitas]);

  // ============================================
  // CRUD CITAS
  // ============================================

  const crearCita = useCallback(async (solicitud: SolicitudCita, clienteNombre: string) => {
    const resultado = citasService.crear(solicitud, clienteNombre);
    
    if (resultado.exito) {
      cargarCitas();
    }
    
    return resultado;
  }, [cargarCitas]);

  const obtenerCitas = useCallback((filtros?: FiltrosCitas) => {
    return citasService.obtenerCitas(filtros);
  }, []);

  const obtenerCitaPorId = useCallback((id: string) => {
    return citasService.obtenerPorId(id);
  }, []);

  const confirmarCita = useCallback(async (citaId: string, trabajadorId: string, trabajadorNombre: string) => {
    const resultado = citasService.confirmar(citaId, trabajadorId, trabajadorNombre);
    
    if (resultado.exito) {
      cargarCitas();
    }
    
    return resultado;
  }, [cargarCitas]);

  const cancelarCita = useCallback(async (citaId: string, motivo: string, canceladoPor: string) => {
    const resultado = citasService.cancelar(citaId, motivo, canceladoPor);
    
    if (resultado) {
      cargarCitas();
    }
    
    return resultado;
  }, [cargarCitas]);

  const actualizarEstadoCita = useCallback(async (citaId: string, estado: Cita['estado'], usuarioId: string) => {
    const resultado = citasService.actualizarEstado(citaId, estado, usuarioId);
    
    if (resultado) {
      cargarCitas();
    }
    
    return resultado;
  }, [cargarCitas]);

  // ============================================
  // CONFIGURACIÓN
  // ============================================

  const cargarConfiguracion = useCallback((puntoVentaId: string) => {
    const config = citasService.getConfiguracion(puntoVentaId);
    setConfiguracion(config);
  }, []);

  const guardarConfiguracion = useCallback((config: ConfiguracionCitas) => {
    citasService.saveConfiguracion(config);
    setConfiguracion(config);
  }, []);

  // ============================================
  // DISPONIBILIDAD
  // ============================================

  const obtenerDisponibilidad = useCallback((fecha: string, puntoVentaId: string) => {
    return citasService.obtenerDisponibilidadDia(fecha, puntoVentaId);
  }, []);

  // ============================================
  // ESTADÍSTICAS
  // ============================================

  const obtenerEstadisticas = useCallback((filtros?: FiltrosCitas) => {
    return citasService.obtenerEstadisticas(filtros);
  }, []);

  // ============================================
  // VERIFICACIÓN CITA CONFIRMADA
  // ============================================

  const tieneCtaConfirmada = useCallback((clienteId: string) => {
    const ahora = new Date();
    const hoy = ahora.toISOString().split('T')[0];
    
    const citasConfirmadasCliente = citas.filter(c => 
      c.clienteId === clienteId &&
      c.estado === 'confirmada' &&
      c.fecha >= hoy
    );
    
    return citasConfirmadasCliente.length > 0;
  }, [citas]);

  const obtenerProximaCitaConfirmada = useCallback((clienteId: string) => {
    const ahora = new Date();
    const hoy = ahora.toISOString().split('T')[0];
    
    const citasConfirmadasCliente = citas
      .filter(c => 
        c.clienteId === clienteId &&
        c.estado === 'confirmada' &&
        c.fecha >= hoy
      )
      .sort((a, b) => {
        const fechaA = new Date(`${a.fecha}T${a.horaInicio}`);
        const fechaB = new Date(`${b.fecha}T${b.horaInicio}`);
        return fechaA.getTime() - fechaB.getTime();
      });
    
    return citasConfirmadasCliente[0] || null;
  }, [citas]);

  // ============================================
  // REFRESCAR
  // ============================================

  const refrescar = useCallback(() => {
    cargarCitas();
  }, [cargarCitas]);

  // ============================================
  // VALUE
  // ============================================

  const value: CitasContextType = {
    citas,
    citasPendientes,
    citasConfirmadas,
    configuracion,
    crearCita,
    obtenerCitas,
    obtenerCitaPorId,
    confirmarCita,
    cancelarCita,
    actualizarEstadoCita,
    cargarConfiguracion,
    guardarConfiguracion,
    obtenerDisponibilidad,
    obtenerEstadisticas,
    tieneCtaConfirmada,
    obtenerProximaCitaConfirmada,
    refrescar
  };

  return (
    <CitasContext.Provider value={value}>
      {children}
    </CitasContext.Provider>
  );
}

// ============================================
// HOOK
// ============================================

export function useCitas() {
  const context = useContext(CitasContext);
  
  if (context === undefined) {
    throw new Error('useCitas debe usarse dentro de CitasProvider');
  }
  
  return context;
}
