/**
 * 📅 GESTIÓN DE HORARIOS - GERENTE
 * 
 * Panel para que el gerente:
 * - Asigne horarios y turnos a trabajadores
 * - Vea calendario de turnos
 * - Gestione solicitudes de cambios
 * - Cree plantillas de horarios
 */

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
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
import {
  Calendar,
  Clock,
  Users,
  Plus,
  CheckCircle2,
  XCircle,
  AlertCircle,
  RefreshCw,
  Eye,
  Edit,
  Trash2,
} from 'lucide-react';
import { toast } from 'sonner@2.0.3';
import {
  obtenerTodosTurnos,
  obtenerTodasSolicitudes,
  crearTurno,
  actualizarTurno,
  eliminarTurno,
  aprobarSolicitud,
  rechazarSolicitud,
  obtenerEstadisticasHorarios,
  TIPOS_TURNO,
  type Turno,
  type SolicitudCambioHorario,
  type TipoTurno,
  type EstadoSolicitud,
} from '../../services/horarios.service';

interface GestionHorariosProps {
  gerenteId: string;
  gerenteNombre: string;
}

// Mock de trabajadores - En producción vendría de un servicio
const TRABAJADORES_MOCK = [
  { id: 'TRB-001', nombre: 'Juan Pérez', cargo: 'Panadero' },
  { id: 'TRB-002', nombre: 'María López', cargo: 'Cajera' },
  { id: 'TRB-003', nombre: 'Carlos Ruiz', cargo: 'Repartidor' },
];

const PUNTOS_VENTA_MOCK = [
  { id: 'PDV-001', nombre: 'Badalona Centro' },
  { id: 'PDV-002', nombre: 'Tiana' },
  { id: 'PDV-003', nombre: 'Montgat' },
];

export function GestionHorarios({ gerenteId, gerenteNombre }: GestionHorariosProps) {
  const [activeTab, setActiveTab] = useState('solicitudes');
  const [solicitudes, setSolicitudes] = useState<SolicitudCambioHorario[]>([]);
  const [turnos, setTurnos] = useState<Turno[]>([]);
  const [estadisticas, setEstadisticas] = useState({
    totalTurnos: 0,
    turnosConfirmados: 0,
    turnosPendientes: 0,
    turnosModificados: 0,
    totalSolicitudes: 0,
    solicitudesPendientes: 0,
    solicitudesAprobadas: 0,
    solicitudesRechazadas: 0,
  });

  // Estados para crear turno
  const [modalCrearTurno, setModalCrearTurno] = useState(false);
  const [trabajadorSeleccionado, setTrabajadorSeleccionado] = useState('');
  const [fechaTurno, setFechaTurno] = useState('');
  const [tipoTurno, setTipoTurno] = useState<TipoTurno>('manana');
  const [horaInicio, setHoraInicio] = useState('');
  const [horaFin, setHoraFin] = useState('');
  const [horaInicio2, setHoraInicio2] = useState('');
  const [horaFin2, setHoraFin2] = useState('');
  const [puntoVentaId, setPuntoVentaId] = useState('');
  const [notasTurno, setNotasTurno] = useState('');

  // Estados para revisar solicitud
  const [modalRevisarSolicitud, setModalRevisarSolicitud] = useState(false);
  const [solicitudSeleccionada, setSolicitudSeleccionada] = useState<SolicitudCambioHorario | null>(null);
  const [respuestaGerente, setRespuestaGerente] = useState('');

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = () => {
    // Cargar solicitudes pendientes
    const sols = obtenerTodasSolicitudes({ estado: 'pendiente' });
    setSolicitudes(sols);

    // Cargar turnos de la semana actual
    const hoy = new Date();
    const inicioDeSemana = new Date(hoy);
    inicioDeSemana.setDate(hoy.getDate() - hoy.getDay() + 1);
    const finDeSemana = new Date(inicioDeSemana);
    finDeSemana.setDate(inicioDeSemana.getDate() + 6);

    const fechaInicio = inicioDeSemana.toISOString().split('T')[0];
    const fechaFin = finDeSemana.toISOString().split('T')[0];

    const turnosSemana = obtenerTodosTurnos({ fechaInicio, fechaFin });
    setTurnos(turnosSemana);

    // Cargar estadísticas
    const stats = obtenerEstadisticasHorarios();
    setEstadisticas(stats);
  };

  const handleCrearTurno = () => {
    if (!trabajadorSeleccionado || !fechaTurno || !tipoTurno) {
      toast.error('Completa los campos obligatorios');
      return;
    }

    if (tipoTurno !== 'descanso' && (!horaInicio || !horaFin)) {
      toast.error('Define el horario del turno');
      return;
    }

    const trabajador = TRABAJADORES_MOCK.find(t => t.id === trabajadorSeleccionado);
    const puntoVenta = PUNTOS_VENTA_MOCK.find(p => p.id === puntoVentaId);

    const nuevoTurno = crearTurno({
      trabajadorId: trabajadorSeleccionado,
      trabajadorNombre: trabajador?.nombre || '',
      fecha: fechaTurno,
      diaSemana: obtenerDiaSemana(fechaTurno),
      tipoTurno,
      horaInicio: tipoTurno !== 'descanso' ? horaInicio : undefined,
      horaFin: tipoTurno !== 'descanso' ? horaFin : undefined,
      horaInicio2: tipoTurno === 'partido' ? horaInicio2 : undefined,
      horaFin2: tipoTurno === 'partido' ? horaFin2 : undefined,
      puntoVentaId: puntoVentaId || undefined,
      puntoVentaNombre: puntoVenta?.nombre,
      estado: 'confirmado',
      notas: notasTurno || undefined,
      creadoPor: gerenteId,
    });

    toast.success('Turno creado correctamente');

    // Resetear form
    setModalCrearTurno(false);
    setTrabajadorSeleccionado('');
    setFechaTurno('');
    setTipoTurno('manana');
    setHoraInicio('');
    setHoraFin('');
    setHoraInicio2('');
    setHoraFin2('');
    setPuntoVentaId('');
    setNotasTurno('');

    cargarDatos();
  };

  const handleAbrirRevisarSolicitud = (solicitud: SolicitudCambioHorario) => {
    setSolicitudSeleccionada(solicitud);
    setRespuestaGerente('');
    setModalRevisarSolicitud(true);
  };

  const handleAprobarSolicitud = () => {
    if (!solicitudSeleccionada) return;

    aprobarSolicitud(
      solicitudSeleccionada.id,
      gerenteId,
      respuestaGerente || 'Solicitud aprobada'
    );

    toast.success('Solicitud aprobada', {
      description: `Se notificará a ${solicitudSeleccionada.trabajadorNombre}`,
    });

    setModalRevisarSolicitud(false);
    setSolicitudSeleccionada(null);
    setRespuestaGerente('');
    cargarDatos();
  };

  const handleRechazarSolicitud = () => {
    if (!solicitudSeleccionada) return;

    if (!respuestaGerente.trim()) {
      toast.error('Proporciona un motivo de rechazo');
      return;
    }

    rechazarSolicitud(
      solicitudSeleccionada.id,
      gerenteId,
      respuestaGerente
    );

    toast.info('Solicitud rechazada', {
      description: `Se notificará a ${solicitudSeleccionada.trabajadorNombre}`,
    });

    setModalRevisarSolicitud(false);
    setSolicitudSeleccionada(null);
    setRespuestaGerente('');
    cargarDatos();
  };

  const obtenerDiaSemana = (fecha: string): string => {
    const dias = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
    const date = new Date(fecha + 'T00:00:00');
    return dias[date.getDay()];
  };

  const formatearFecha = (isoDate: string): string => {
    const date = new Date(isoDate);
    return date.toLocaleDateString('es-ES', { 
      day: '2-digit', 
      month: 'short', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getTipoSolicitudLabel = (tipo: SolicitudCambioHorario['tipo']): string => {
    switch (tipo) {
      case 'cambio_turno':
        return 'Cambio de turno';
      case 'dia_libre':
        return 'Día libre';
      case 'cambio_horario':
        return 'Cambio de horario';
      case 'intercambio':
        return 'Intercambio';
      default:
        return tipo;
    }
  };

  return (
    <div className="space-y-6">
      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Clock className="h-5 w-5 text-gray-500" />
                <Badge variant="outline">{estadisticas.solicitudesPendientes}</Badge>
              </div>
              <p className="text-2xl font-bold">{estadisticas.totalSolicitudes}</p>
              <p className="text-sm text-muted-foreground">Solicitudes Totales</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <CheckCircle2 className="h-5 w-5 text-green-500" />
              </div>
              <p className="text-2xl font-bold text-green-600">{estadisticas.turnosConfirmados}</p>
              <p className="text-sm text-muted-foreground">Turnos Confirmados</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <AlertCircle className="h-5 w-5 text-orange-500" />
              </div>
              <p className="text-2xl font-bold text-orange-600">{estadisticas.turnosPendientes}</p>
              <p className="text-sm text-muted-foreground">Turnos Pendientes</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Calendar className="h-5 w-5 text-blue-500" />
              </div>
              <p className="text-2xl font-bold text-blue-600">{estadisticas.totalTurnos}</p>
              <p className="text-sm text-muted-foreground">Total Turnos</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="solicitudes" className="gap-2">
            <Clock className="h-4 w-4" />
            Solicitudes
            {estadisticas.solicitudesPendientes > 0 && (
              <Badge variant="destructive" className="ml-2">
                {estadisticas.solicitudesPendientes}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="turnos" className="gap-2">
            <Calendar className="h-4 w-4" />
            Turnos
          </TabsTrigger>
          <TabsTrigger value="asignar" className="gap-2">
            <Plus className="h-4 w-4" />
            Asignar Turno
          </TabsTrigger>
        </TabsList>

        {/* TAB 1: SOLICITUDES PENDIENTES */}
        <TabsContent value="solicitudes" className="space-y-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Solicitudes Pendientes</CardTitle>
                <CardDescription>
                  Revisa y gestiona las solicitudes de cambio de horario
                </CardDescription>
              </div>
              <Button variant="ghost" size="sm" onClick={cargarDatos}>
                <RefreshCw className="h-4 w-4" />
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              {solicitudes.length === 0 ? (
                <div className="flex items-center justify-center p-12 border-2 border-dashed rounded-lg">
                  <div className="text-center space-y-2">
                    <CheckCircle2 className="w-12 h-12 mx-auto text-green-500" />
                    <p className="text-sm text-muted-foreground">
                      No hay solicitudes pendientes
                    </p>
                  </div>
                </div>
              ) : (
                solicitudes.map((solicitud) => (
                  <Card key={solicitud.id} className="border-l-4 border-l-orange-500">
                    <CardContent className="pt-6">
                      <div className="space-y-3">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <Users className="h-4 w-4 text-muted-foreground" />
                              <p className="font-semibold">{solicitud.trabajadorNombre}</p>
                            </div>
                            <p className="text-sm text-muted-foreground">
                              {getTipoSolicitudLabel(solicitud.tipo)} - {solicitud.fechaSolicitada}
                            </p>
                          </div>
                          <Badge variant="outline">
                            <Clock className="h-3 w-3 mr-1" />
                            Pendiente
                          </Badge>
                        </div>

                        <div className="space-y-1">
                          <p className="text-sm"><strong>Motivo:</strong> {solicitud.motivoSolicitud}</p>
                          {solicitud.detalles && (
                            <p className="text-sm text-muted-foreground">{solicitud.detalles}</p>
                          )}
                          <p className="text-xs text-muted-foreground">
                            Solicitado: {formatearFecha(solicitud.solicitadoEn)}
                          </p>
                        </div>

                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            className="flex-1"
                            onClick={() => handleAbrirRevisarSolicitud(solicitud)}
                          >
                            <Eye className="h-4 w-4 mr-2" />
                            Revisar
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* TAB 2: TURNOS ASIGNADOS */}
        <TabsContent value="turnos" className="space-y-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Turnos de Esta Semana</CardTitle>
                <CardDescription>
                  Vista general de turnos asignados
                </CardDescription>
              </div>
              <Button size="sm" onClick={() => setModalCrearTurno(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Nuevo Turno
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              {turnos.length === 0 ? (
                <div className="flex items-center justify-center p-12 border-2 border-dashed rounded-lg">
                  <div className="text-center space-y-2">
                    <Calendar className="w-12 h-12 mx-auto text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">
                      No hay turnos asignados para esta semana
                    </p>
                    <Button variant="outline" onClick={() => setModalCrearTurno(true)}>
                      Crear Primer Turno
                    </Button>
                  </div>
                </div>
              ) : (
                turnos.map((turno) => (
                  <div key={turno.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-4">
                      <div className="text-center">
                        <p className="text-xs text-muted-foreground">{turno.diaSemana}</p>
                        <p className="text-lg font-bold">{new Date(turno.fecha + 'T00:00:00').getDate()}</p>
                      </div>
                      <div>
                        <p className="font-medium">{turno.trabajadorNombre}</p>
                        <p className="text-sm text-muted-foreground">
                          {TIPOS_TURNO.find(t => t.value === turno.tipoTurno)?.label} 
                          {turno.horaInicio && turno.horaFin && ` - ${turno.horaInicio} a ${turno.horaFin}`}
                        </p>
                        {turno.puntoVentaNombre && (
                          <p className="text-xs text-muted-foreground">{turno.puntoVentaNombre}</p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={turno.estado === 'confirmado' ? 'default' : 'outline'}>
                        {turno.estado}
                      </Badge>
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* TAB 3: ASIGNAR TURNO */}
        <TabsContent value="asignar" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Asignar Nuevo Turno</CardTitle>
              <CardDescription>
                Crea y asigna un turno a un trabajador
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="trabajador">Trabajador *</Label>
                    <Select value={trabajadorSeleccionado} onValueChange={setTrabajadorSeleccionado}>
                      <SelectTrigger id="trabajador">
                        <SelectValue placeholder="Selecciona un trabajador" />
                      </SelectTrigger>
                      <SelectContent>
                        {TRABAJADORES_MOCK.map((trabajador) => (
                          <SelectItem key={trabajador.id} value={trabajador.id}>
                            {trabajador.nombre} - {trabajador.cargo}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="fecha">Fecha *</Label>
                    <Input
                      id="fecha"
                      type="date"
                      value={fechaTurno}
                      onChange={(e) => setFechaTurno(e.target.value)}
                      min={new Date().toISOString().split('T')[0]}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="tipoTurno">Tipo de Turno *</Label>
                    <Select value={tipoTurno} onValueChange={(val) => setTipoTurno(val as TipoTurno)}>
                      <SelectTrigger id="tipoTurno">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {TIPOS_TURNO.map((tipo) => (
                          <SelectItem key={tipo.value} value={tipo.value}>
                            {tipo.label} {tipo.descripcion && `(${tipo.descripcion})`}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="puntoVenta">Punto de Venta</Label>
                    <Select value={puntoVentaId} onValueChange={setPuntoVentaId}>
                      <SelectTrigger id="puntoVenta">
                        <SelectValue placeholder="Selecciona un punto de venta" />
                      </SelectTrigger>
                      <SelectContent>
                        {PUNTOS_VENTA_MOCK.map((pdv) => (
                          <SelectItem key={pdv.id} value={pdv.id}>
                            {pdv.nombre}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {tipoTurno !== 'descanso' && (
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="horaInicio">Hora Inicio *</Label>
                      <Input
                        id="horaInicio"
                        type="time"
                        value={horaInicio}
                        onChange={(e) => setHoraInicio(e.target.value)}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="horaFin">Hora Fin *</Label>
                      <Input
                        id="horaFin"
                        type="time"
                        value={horaFin}
                        onChange={(e) => setHoraFin(e.target.value)}
                      />
                    </div>
                  </div>
                )}

                {tipoTurno === 'partido' && (
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="horaInicio2">Hora Inicio 2</Label>
                      <Input
                        id="horaInicio2"
                        type="time"
                        value={horaInicio2}
                        onChange={(e) => setHoraInicio2(e.target.value)}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="horaFin2">Hora Fin 2</Label>
                      <Input
                        id="horaFin2"
                        type="time"
                        value={horaFin2}
                        onChange={(e) => setHoraFin2(e.target.value)}
                      />
                    </div>
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="notas">Notas (opcional)</Label>
                  <Textarea
                    id="notas"
                    value={notasTurno}
                    onChange={(e) => setNotasTurno(e.target.value)}
                    placeholder="Información adicional del turno..."
                    rows={3}
                  />
                </div>

                <Button onClick={handleCrearTurno} className="w-full">
                  <Plus className="h-4 w-4 mr-2" />
                  Crear Turno
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Modal Revisar Solicitud */}
      <Dialog open={modalRevisarSolicitud} onOpenChange={setModalRevisarSolicitud}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Revisar Solicitud</DialogTitle>
            <DialogDescription>
              Revisa los detalles y aprueba o rechaza la solicitud
            </DialogDescription>
          </DialogHeader>

          {solicitudSeleccionada && (
            <div className="space-y-4 py-4">
              <div className="space-y-2 p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-muted-foreground" />
                  <p className="font-semibold">{solicitudSeleccionada.trabajadorNombre}</p>
                </div>
                <p className="text-sm text-muted-foreground">
                  {getTipoSolicitudLabel(solicitudSeleccionada.tipo)} - {solicitudSeleccionada.fechaSolicitada}
                </p>
                <div className="space-y-1 mt-3">
                  <p className="text-sm"><strong>Motivo:</strong> {solicitudSeleccionada.motivoSolicitud}</p>
                  {solicitudSeleccionada.detalles && (
                    <p className="text-sm"><strong>Detalles:</strong> {solicitudSeleccionada.detalles}</p>
                  )}
                  <p className="text-xs text-muted-foreground">
                    Solicitado: {formatearFecha(solicitudSeleccionada.solicitadoEn)}
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="respuesta">Tu Respuesta (opcional para aprobar, obligatorio para rechazar)</Label>
                <Textarea
                  id="respuesta"
                  value={respuestaGerente}
                  onChange={(e) => setRespuestaGerente(e.target.value)}
                  placeholder="Escribe un comentario para el trabajador..."
                  rows={3}
                />
              </div>
            </div>
          )}

          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => setModalRevisarSolicitud(false)}
            >
              Cancelar
            </Button>
            <Button
              variant="destructive"
              onClick={handleRechazarSolicitud}
            >
              <XCircle className="h-4 w-4 mr-2" />
              Rechazar
            </Button>
            <Button
              onClick={handleAprobarSolicitud}
            >
              <CheckCircle2 className="h-4 w-4 mr-2" />
              Aprobar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
