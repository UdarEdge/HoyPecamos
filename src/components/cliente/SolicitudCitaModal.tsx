/**
 * 📅 MODAL SOLICITUD DE CITA (CLIENTE)
 * Modal para que el cliente solicite una cita con el negocio
 */

import { useState, useEffect } from 'react';
import { Button } from '../ui/button';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';
import { Calendar } from '../ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import { cn } from '../ui/utils';
import { format, addDays, isBefore, startOfDay } from 'date-fns@4.1.0';
import { es } from 'date-fns@4.1.0/locale';
import { 
  CalendarIcon, 
  Upload, 
  AlertCircle, 
  Loader2,
  Clock,
  CheckCircle,
  X
} from 'lucide-react';
import { toast } from 'sonner@2.0.3';
import { useCitas } from '../../hooks/useCitas';
import type { SolicitudCita } from '../../types/cita.types';

interface SolicitudCitaModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  clienteId: string;
  clienteNombre: string;
  puntoVentaId: string;
}

export function SolicitudCitaModal({ 
  isOpen, 
  onOpenChange,
  clienteId,
  clienteNombre,
  puntoVentaId
}: SolicitudCitaModalProps) {
  const { 
    crearCita, 
    cargarConfiguracion, 
    configuracion,
    obtenerDisponibilidad 
  } = useCitas();

  const [loading, setLoading] = useState(false);
  const [fecha, setFecha] = useState<Date>();
  const [servicioSeleccionado, setServicioSeleccionado] = useState<string>('');
  const [horaSeleccionada, setHoraSeleccionada] = useState<string>('');
  const [mensaje, setMensaje] = useState<string>('');
  const [archivos, setArchivos] = useState<FileList | null>(null);
  
  // Estados de disponibilidad
  const [slotsDisponibles, setSlotsDisponibles] = useState<Array<{ hora: string; disponible: boolean; ocupados: number; capacidad: number }>>([]);

  // Cargar configuración al abrir
  useEffect(() => {
    if (isOpen) {
      cargarConfiguracion(puntoVentaId);
    }
  }, [isOpen, puntoVentaId, cargarConfiguracion]);

  // Actualizar slots cuando cambia la fecha
  useEffect(() => {
    if (fecha && configuracion) {
      const fechaStr = format(fecha, 'yyyy-MM-dd');
      const disponibilidad = obtenerDisponibilidad(fechaStr, puntoVentaId);
      
      if (disponibilidad.habilitado) {
        setSlotsDisponibles(
          disponibilidad.slots.map(slot => ({
            hora: slot.horaInicio,
            disponible: slot.disponible,
            ocupados: slot.ocupados,
            capacidad: slot.capacidad
          }))
        );
      } else {
        setSlotsDisponibles([]);
      }
      
      // Reset hora seleccionada si no está disponible
      if (horaSeleccionada) {
        const slotSeleccionado = disponibilidad.slots.find(s => s.horaInicio === horaSeleccionada);
        if (!slotSeleccionado || !slotSeleccionado.disponible) {
          setHoraSeleccionada('');
        }
      }
    }
  }, [fecha, configuracion, puntoVentaId, obtenerDisponibilidad, horaSeleccionada]);

  const handleConfirmar = async () => {
    if (!servicioSeleccionado || !fecha || !horaSeleccionada) {
      toast.error('Por favor, completa todos los campos obligatorios');
      return;
    }

    setLoading(true);
    
    try {
      const solicitud: SolicitudCita = {
        clienteId,
        puntoVentaId,
        servicioId: servicioSeleccionado,
        fecha: format(fecha, 'yyyy-MM-dd'),
        horaInicio: horaSeleccionada,
        mensaje: mensaje || undefined
      };
      
      const resultado = await crearCita(solicitud, clienteNombre);
      
      if (resultado.exito && resultado.cita) {
        toast.success(
          <div className="flex flex-col gap-1">
            <span className="font-medium">¡Cita solicitada correctamente!</span>
            <span className="text-sm opacity-90">
              {resultado.cita.numero} - {format(fecha, "d 'de' MMMM", { locale: es })} a las {horaSeleccionada}
            </span>
            <span className="text-xs opacity-75 mt-1">
              Te notificaremos cuando sea confirmada
            </span>
          </div>,
          { duration: 5000 }
        );
        
        onOpenChange(false);
        resetForm();
      } else {
        toast.error(resultado.error || 'No se pudo crear la cita');
      }
    } catch (error) {
      toast.error('Error al solicitar la cita');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setServicioSeleccionado('');
    setFecha(undefined);
    setHoraSeleccionada('');
    setMensaje('');
    setArchivos(null);
    setSlotsDisponibles([]);
  };

  // Fecha mínima (mañana) y máxima según configuración
  const fechaMinima = addDays(new Date(), configuracion?.anticipacionMinimaDias || 1);
  const fechaMaxima = addDays(new Date(), configuracion?.anticipacionMaximaDias || 30);

  const serviciosDisponibles = configuracion?.servicios.filter(s => s.habilitado) || [];

  // Deshabilitar días según configuración
  const isDayDisabled = (date: Date) => {
    const diaSemana = date.getDay();
    const horario = configuracion?.horarios.find(h => h.diaSemana === diaSemana);
    return !horario || !horario.habilitado || isBefore(date, startOfDay(fechaMinima)) || isBefore(fechaMaxima, date);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[95vw] sm:max-w-[650px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle style={{ fontFamily: 'Poppins, sans-serif' }}>
            Solicitar Cita
          </DialogTitle>
          <DialogDescription>
            Selecciona el servicio, día y hora para tu cita
          </DialogDescription>
        </DialogHeader>

        {!configuracion?.habilitado && (
          <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-orange-600 mt-0.5 shrink-0" />
            <div>
              <p className="font-medium text-orange-900 mb-1">Sistema de citas no disponible</p>
              <p className="text-sm text-orange-700">
                El sistema de citas está temporalmente deshabilitado
              </p>
            </div>
          </div>
        )}

        <div className="space-y-5">
          {/* Servicio */}
          <div>
            <Label htmlFor="servicio" className="required">
              Servicio *
            </Label>
            <Select 
              value={servicioSeleccionado} 
              onValueChange={setServicioSeleccionado}
              disabled={!configuracion?.habilitado}
            >
              <SelectTrigger id="servicio" className="min-h-[44px]">
                <SelectValue placeholder="Selecciona un servicio" />
              </SelectTrigger>
              <SelectContent>
                {serviciosDisponibles.length === 0 ? (
                  <div className="p-4 text-sm text-gray-500 text-center">
                    No hay servicios disponibles
                  </div>
                ) : (
                  serviciosDisponibles.map((servicio) => (
                    <SelectItem key={servicio.id} value={servicio.id}>
                      <div className="flex items-center justify-between gap-3 w-full">
                        <span>{servicio.nombre}</span>
                        <span className="text-xs text-gray-500">
                          {servicio.duracionMinutos} min
                        </span>
                      </div>
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
            {servicioSeleccionado && (
              <p className="text-sm text-gray-600 mt-1">
                {serviciosDisponibles.find(s => s.id === servicioSeleccionado)?.descripcion}
              </p>
            )}
          </div>

          {/* Fecha */}
          <div>
            <Label className="required mb-2 block">Fecha *</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left min-h-[44px]",
                    !fecha && "text-gray-500"
                  )}
                  disabled={!configuracion?.habilitado || !servicioSeleccionado}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {fecha ? format(fecha, "PPP", { locale: es }) : "Selecciona una fecha"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={fecha}
                  onSelect={setFecha}
                  disabled={isDayDisabled}
                  locale={es}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>

          {/* Horarios disponibles */}
          {fecha && slotsDisponibles.length > 0 && (
            <div>
              <Label className="required mb-2 block">Hora *</Label>
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 max-h-[200px] overflow-y-auto p-1">
                {slotsDisponibles.map((slot) => (
                  <button
                    key={slot.hora}
                    type="button"
                    onClick={() => slot.disponible && setHoraSeleccionada(slot.hora)}
                    disabled={!slot.disponible}
                    className={cn(
                      "relative px-3 py-2.5 rounded-lg border-2 text-sm transition-all",
                      "hover:border-black disabled:cursor-not-allowed",
                      slot.disponible
                        ? horaSeleccionada === slot.hora
                          ? "border-black bg-black text-white"
                          : "border-gray-200 bg-white hover:bg-gray-50"
                        : "border-gray-100 bg-gray-50 text-gray-400"
                    )}
                  >
                    <div className="flex items-center justify-center gap-1">
                      <Clock className="w-3 h-3" />
                      <span className="font-medium">{slot.hora}</span>
                    </div>
                    {!slot.disponible && (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <X className="w-4 h-4 text-red-500" />
                      </div>
                    )}
                    {slot.disponible && slot.ocupados > 0 && (
                      <div className="text-[10px] text-gray-500 mt-0.5">
                        {slot.capacidad - slot.ocupados} disponible{slot.capacidad - slot.ocupados !== 1 ? 's' : ''}
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}

          {fecha && slotsDisponibles.length === 0 && (
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 text-center">
              <AlertCircle className="w-5 h-5 text-gray-400 mx-auto mb-2" />
              <p className="text-sm text-gray-600">
                No hay horarios disponibles para este día
              </p>
            </div>
          )}

          {/* Mensaje adicional */}
          <div>
            <Label htmlFor="mensaje">Mensaje adicional (opcional)</Label>
            <Textarea
              id="mensaje"
              value={mensaje}
              onChange={(e) => setMensaje(e.target.value)}
              placeholder="Añade cualquier información adicional que consideres relevante..."
              className="min-h-[80px] resize-none"
              disabled={!configuracion?.habilitado}
            />
          </div>

          {/* Adjuntar archivos */}
          <div>
            <Label htmlFor="archivos">Adjuntar archivos (opcional)</Label>
            <div className="mt-1">
              <label
                htmlFor="archivos"
                className={cn(
                  "flex items-center justify-center gap-2 border-2 border-dashed rounded-lg p-4",
                  "cursor-pointer hover:bg-gray-50 transition-colors",
                  !configuracion?.habilitado && "opacity-50 cursor-not-allowed"
                )}
              >
                <Upload className="w-5 h-5 text-gray-400" />
                <span className="text-sm text-gray-600">
                  {archivos && archivos.length > 0
                    ? `${archivos.length} archivo${archivos.length > 1 ? 's' : ''} seleccionado${archivos.length > 1 ? 's' : ''}`
                    : 'Haz clic para adjuntar archivos'}
                </span>
              </label>
              <input
                id="archivos"
                type="file"
                multiple
                accept="image/*,.pdf"
                onChange={(e) => setArchivos(e.target.files)}
                className="hidden"
                disabled={!configuracion?.habilitado}
              />
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Imágenes o documentos PDF (máx. 5MB por archivo)
            </p>
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={loading}
          >
            Cancelar
          </Button>
          <Button
            onClick={handleConfirmar}
            disabled={loading || !configuracion?.habilitado || !servicioSeleccionado || !fecha || !horaSeleccionada}
            className="bg-black hover:bg-black/90"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Procesando...
              </>
            ) : (
              <>
                <CheckCircle className="w-4 h-4 mr-2" />
                Solicitar Cita
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
