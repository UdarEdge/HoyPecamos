/**
 * 📅 GESTIÓN DE CITAS - PERFIL GERENTE
 * Vista completa para administrar todas las citas del sistema
 */

import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Badge } from '../ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu';
import {
  Calendar,
  Clock,
  User,
  Search,
  Filter,
  MoreVertical,
  CheckCircle,
  XCircle,
  AlertCircle,
  Download,
  RefreshCw,
  UserCheck,
  Ban,
  TrendingUp,
  TrendingDown,
  Users
} from 'lucide-react';
import { format, parseISO } from 'date-fns@4.1.0';
import { es } from 'date-fns@4.1.0/locale';
import { toast } from 'sonner@2.0.3';
import { useCitas } from '../../hooks/useCitas';
import type { Cita, EstadoCita } from '../../types/cita.types';

interface GestionCitasProps {
  puntoVentaId?: string;
  empresaId?: string;
}

export function GestionCitas({ puntoVentaId, empresaId }: GestionCitasProps) {
  const { 
    obtenerCitas, 
    obtenerEstadisticas,
    actualizarEstadoCita,
    cancelarCita,
    refrescar 
  } = useCitas();

  // Estados
  const [tabActiva, setTabActiva] = useState<EstadoCita | 'todas'>('todas');
  const [busqueda, setBusqueda] = useState('');
  const [citaSeleccionada, setCitaSeleccionada] = useState<Cita | null>(null);
  const [modalCancelar, setModalCancelar] = useState(false);
  const [motivoCancelacion, setMotivoCancelacion] = useState('');
  const [procesando, setProcesando] = useState(false);

  // Obtener todas las citas
  const todasLasCitas = useMemo(() => {
    return obtenerCitas({
      puntoVentaId,
      empresaId
    });
  }, [obtenerCitas, puntoVentaId, empresaId]);

  // Filtrar citas según tab activo y búsqueda
  const citasFiltradas = useMemo(() => {
    let citas = todasLasCitas;

    // Filtrar por estado
    if (tabActiva !== 'todas') {
      citas = citas.filter(c => c.estado === tabActiva);
    }

    // Filtrar por búsqueda
    if (busqueda.trim()) {
      const termino = busqueda.toLowerCase();
      citas = citas.filter(c => 
        c.numero.toLowerCase().includes(termino) ||
        c.clienteNombre.toLowerCase().includes(termino) ||
        c.servicioNombre.toLowerCase().includes(termino) ||
        c.trabajadorAsignadoNombre?.toLowerCase().includes(termino)
      );
    }

    // Ordenar por fecha más reciente primero
    return citas.sort((a, b) => {
      const fechaA = new Date(`${a.fecha}T${a.horaInicio}`);
      const fechaB = new Date(`${b.fecha}T${b.horaInicio}`);
      return fechaB.getTime() - fechaA.getTime();
    });
  }, [todasLasCitas, tabActiva, busqueda]);

  // Calcular estadísticas
  const estadisticas = useMemo(() => {
    return obtenerEstadisticas({
      puntoVentaId,
      empresaId
    });
  }, [obtenerEstadisticas, puntoVentaId, empresaId]);

  // Contadores por estado
  const contadores = useMemo(() => {
    return {
      total: todasLasCitas.length,
      solicitadas: todasLasCitas.filter(c => c.estado === 'solicitada').length,
      confirmadas: todasLasCitas.filter(c => c.estado === 'confirmada').length,
      enProgreso: todasLasCitas.filter(c => c.estado === 'en-progreso').length,
      completadas: todasLasCitas.filter(c => c.estado === 'completada').length,
      canceladas: todasLasCitas.filter(c => c.estado === 'cancelada').length,
      noPresentado: todasLasCitas.filter(c => c.estado === 'no-presentado').length,
    };
  }, [todasLasCitas]);

  // Handlers
  const handleRefrescar = () => {
    refrescar();
    toast.success('Datos actualizados');
  };

  const handleCancelarCita = async () => {
    if (!citaSeleccionada || !motivoCancelacion.trim()) {
      toast.error('Debes proporcionar un motivo de cancelación');
      return;
    }

    setProcesando(true);
    const resultado = await cancelarCita(
      citaSeleccionada.id,
      motivoCancelacion,
      'gerente'
    );

    setProcesando(false);

    if (resultado) {
      toast.success('Cita cancelada correctamente');
      setModalCancelar(false);
      setMotivoCancelacion('');
      setCitaSeleccionada(null);
    } else {
      toast.error('Error al cancelar la cita');
    }
  };

  const handleCambiarEstado = async (citaId: string, nuevoEstado: EstadoCita) => {
    setProcesando(true);
    const resultado = await actualizarEstadoCita(citaId, nuevoEstado, 'gerente-user-id');
    setProcesando(false);

    if (resultado) {
      toast.success('Estado actualizado correctamente');
    } else {
      toast.error('Error al actualizar el estado');
    }
  };

  const handleExportar = () => {
    toast.info('Exportando datos de citas...');
    // TODO: Implementar exportación a CSV/Excel
  };

  // Función auxiliar para obtener el badge de estado
  const getEstadoBadge = (estado: EstadoCita) => {
    const configs = {
      'solicitada': { variant: 'secondary' as const, label: 'Solicitada', className: 'bg-orange-100 text-orange-700' },
      'confirmada': { variant: 'secondary' as const, label: 'Confirmada', className: 'bg-blue-100 text-blue-700' },
      'en-progreso': { variant: 'secondary' as const, label: 'En Progreso', className: 'bg-purple-100 text-purple-700' },
      'completada': { variant: 'secondary' as const, label: 'Completada', className: 'bg-green-100 text-green-700' },
      'cancelada': { variant: 'secondary' as const, label: 'Cancelada', className: 'bg-red-100 text-red-700' },
      'no-presentado': { variant: 'secondary' as const, label: 'No se presentó', className: 'bg-gray-100 text-gray-700' },
    };

    const config = configs[estado];
    return (
      <Badge variant={config.variant} className={config.className}>
        {config.label}
      </Badge>
    );
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-semibold mb-1">Gestión de Citas</h2>
          <p className="text-sm sm:text-base text-gray-600">
            Administra todas las citas y reservas del sistema
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleRefrescar} className="gap-2 min-h-[44px]">
            <RefreshCw className="h-4 w-4" />
            <span className="hidden sm:inline">Actualizar</span>
          </Button>
          <Button variant="outline" onClick={handleExportar} className="gap-2 min-h-[44px]">
            <Download className="h-4 w-4" />
            <span className="hidden sm:inline">Exportar</span>
          </Button>
        </div>
      </div>

      {/* KPIs - Optimizado para móvil */}
      <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-2 sm:gap-4">
        <Card>
          <CardContent className="p-3 sm:pt-6">
            <div className="text-center">
              <div className="text-lg sm:text-2xl font-bold">{contadores.total}</div>
              <div className="text-[10px] sm:text-xs text-gray-600 mt-0.5 sm:mt-1">Total</div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-3 sm:pt-6">
            <div className="text-center">
              <div className="text-lg sm:text-2xl font-bold text-orange-600">{contadores.solicitadas}</div>
              <div className="text-[10px] sm:text-xs text-gray-600 mt-0.5 sm:mt-1">Solicitadas</div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-3 sm:pt-6">
            <div className="text-center">
              <div className="text-lg sm:text-2xl font-bold text-blue-600">{contadores.confirmadas}</div>
              <div className="text-[10px] sm:text-xs text-gray-600 mt-0.5 sm:mt-1">Confirmadas</div>
            </div>
          </CardContent>
        </Card>

        <Card className="hidden md:block">
          <CardContent className="p-3 sm:pt-6">
            <div className="text-center">
              <div className="text-lg sm:text-2xl font-bold text-purple-600">{contadores.enProgreso}</div>
              <div className="text-[10px] sm:text-xs text-gray-600 mt-0.5 sm:mt-1">En Progreso</div>
            </div>
          </CardContent>
        </Card>

        <Card className="hidden lg:block">
          <CardContent className="p-3 sm:pt-6">
            <div className="text-center">
              <div className="text-lg sm:text-2xl font-bold text-green-600">{contadores.completadas}</div>
              <div className="text-[10px] sm:text-xs text-gray-600 mt-0.5 sm:mt-1">Completadas</div>
            </div>
          </CardContent>
        </Card>

        <Card className="hidden lg:block">
          <CardContent className="p-3 sm:pt-6">
            <div className="text-center">
              <div className="text-lg sm:text-2xl font-bold text-red-600">{contadores.canceladas}</div>
              <div className="text-[10px] sm:text-xs text-gray-600 mt-0.5 sm:mt-1">Canceladas</div>
            </div>
          </CardContent>
        </Card>

        <Card className="hidden lg:block">
          <CardContent className="p-3 sm:pt-6">
            <div className="text-center">
              <div className="text-lg sm:text-2xl font-bold text-gray-600">{contadores.noPresentado}</div>
              <div className="text-[10px] sm:text-xs text-gray-600 mt-0.5 sm:mt-1">No Presentado</div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Estadísticas Adicionales */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-4">
        <Card>
          <CardHeader className="pb-2 sm:pb-3">
            <CardTitle className="text-xs sm:text-sm flex items-center gap-2">
              <TrendingUp className="h-3 w-3 sm:h-4 sm:w-4 text-green-600" />
              Tasa de Confirmación
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xl sm:text-2xl font-bold">{estadisticas.tasaConfirmacion.toFixed(1)}%</div>
            <p className="text-[10px] sm:text-xs text-gray-600 mt-1">Citas confirmadas vs solicitadas</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2 sm:pb-3">
            <CardTitle className="text-xs sm:text-sm flex items-center gap-2">
              <CheckCircle className="h-3 w-3 sm:h-4 sm:w-4 text-blue-600" />
              Tasa de Cumplimiento
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xl sm:text-2xl font-bold">{estadisticas.tasaCumplimiento.toFixed(1)}%</div>
            <p className="text-[10px] sm:text-xs text-gray-600 mt-1">Citas completadas vs confirmadas</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2 sm:pb-3">
            <CardTitle className="text-xs sm:text-sm flex items-center gap-2">
              <TrendingDown className="h-3 w-3 sm:h-4 sm:w-4 text-red-600" />
              Tasa de Cancelación
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xl sm:text-2xl font-bold">{estadisticas.tasaCancelacion.toFixed(1)}%</div>
            <p className="text-[10px] sm:text-xs text-gray-600 mt-1">Citas canceladas del total</p>
          </CardContent>
        </Card>
      </div>

      {/* Barra de búsqueda y filtros */}
      <Card>
        <CardContent className="p-3 sm:pt-6">
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Buscar por número, cliente, servicio..."
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                className="pl-10 min-h-[44px]"
              />
            </div>
            <Button variant="outline" className="gap-2 min-h-[44px]">
              <Filter className="h-4 w-4" />
              Filtros
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Tabs por estado - Scroll horizontal en móvil */}
      <Tabs value={tabActiva} onValueChange={(v) => setTabActiva(v as EstadoCita | 'todas')}>
        <div className="overflow-x-auto -mx-3 px-3 sm:mx-0 sm:px-0">
          <TabsList className="inline-flex w-auto min-w-full sm:grid sm:w-full sm:grid-cols-4 lg:grid-cols-7">
            <TabsTrigger value="todas" className="whitespace-nowrap text-xs sm:text-sm min-h-[44px]">
              Todas ({contadores.total})
            </TabsTrigger>
            <TabsTrigger value="solicitada" className="whitespace-nowrap text-xs sm:text-sm min-h-[44px]">
              Solicitadas ({contadores.solicitadas})
            </TabsTrigger>
            <TabsTrigger value="confirmada" className="whitespace-nowrap text-xs sm:text-sm min-h-[44px]">
              Confirmadas ({contadores.confirmadas})
            </TabsTrigger>
            <TabsTrigger value="en-progreso" className="whitespace-nowrap text-xs sm:text-sm min-h-[44px] hidden lg:flex">
              En Progreso ({contadores.enProgreso})
            </TabsTrigger>
            <TabsTrigger value="completada" className="whitespace-nowrap text-xs sm:text-sm min-h-[44px] hidden lg:flex">
              Completadas ({contadores.completadas})
            </TabsTrigger>
            <TabsTrigger value="cancelada" className="whitespace-nowrap text-xs sm:text-sm min-h-[44px] hidden lg:flex">
              Canceladas ({contadores.canceladas})
            </TabsTrigger>
            <TabsTrigger value="no-presentado" className="whitespace-nowrap text-xs sm:text-sm min-h-[44px] hidden lg:flex">
              No Presentado ({contadores.noPresentado})
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value={tabActiva} className="mt-4 sm:mt-6">
          {citasFiltradas.length === 0 ? (
            <Card>
              <CardContent className="py-8 sm:py-12 text-center">
                <Calendar className="h-10 w-10 sm:h-12 sm:w-12 text-gray-300 mx-auto mb-3" />
                <p className="text-sm sm:text-base text-gray-600">
                  {busqueda ? 'No se encontraron citas con ese criterio' : 'No hay citas en este estado'}
                </p>
              </CardContent>
            </Card>
          ) : (
            <>
              {/* Vista de tarjetas - Móvil */}
              <div className="md:hidden space-y-3">
                {citasFiltradas.map((cita) => (
                  <Card key={cita.id} className="overflow-hidden">
                    <CardContent className="p-4">
                      {/* Header de la tarjeta */}
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1 min-w-0">
                          <div className="font-semibold text-sm mb-1">#{cita.numero}</div>
                          <div className="font-medium text-base truncate">{cita.clienteNombre}</div>
                          {cita.clienteTelefono && (
                            <div className="text-xs text-gray-500 mt-0.5">{cita.clienteTelefono}</div>
                          )}
                        </div>
                        <div className="ml-2">
                          {getEstadoBadge(cita.estado)}
                        </div>
                      </div>

                      {/* Información del servicio */}
                      <div className="space-y-2 mb-3 text-sm">
                        <div className="flex items-center gap-2 text-gray-700">
                          <AlertCircle className="h-4 w-4 text-gray-400 shrink-0" />
                          <span className="truncate">{cita.servicioNombre}</span>
                          <span className="text-xs text-gray-500 ml-auto shrink-0">({cita.servicioDuracion} min)</span>
                        </div>

                        <div className="flex items-center gap-2 text-gray-700">
                          <Calendar className="h-4 w-4 text-gray-400 shrink-0" />
                          <span>{format(parseISO(cita.fecha), 'dd MMM yyyy', { locale: es })}</span>
                        </div>

                        <div className="flex items-center gap-2 text-gray-700">
                          <Clock className="h-4 w-4 text-gray-400 shrink-0" />
                          <span>{cita.horaInicio} - {cita.horaFin}</span>
                        </div>

                        {cita.trabajadorAsignadoNombre && (
                          <div className="flex items-center gap-2 text-gray-700">
                            <UserCheck className="h-4 w-4 text-blue-600 shrink-0" />
                            <span className="truncate">{cita.trabajadorAsignadoNombre}</span>
                          </div>
                        )}
                      </div>

                      {/* Acciones */}
                      <div className="flex gap-2 pt-3 border-t">
                        {cita.estado === 'solicitada' && (
                          <Button
                            size="sm"
                            onClick={() => handleCambiarEstado(cita.id, 'confirmada')}
                            className="flex-1 min-h-[44px] gap-2"
                          >
                            <CheckCircle className="h-4 w-4" />
                            Confirmar
                          </Button>
                        )}
                        {cita.estado === 'confirmada' && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleCambiarEstado(cita.id, 'en-progreso')}
                            className="flex-1 min-h-[44px] gap-2"
                          >
                            <Clock className="h-4 w-4" />
                            En Progreso
                          </Button>
                        )}
                        {cita.estado === 'en-progreso' && (
                          <Button
                            size="sm"
                            onClick={() => handleCambiarEstado(cita.id, 'completada')}
                            className="flex-1 min-h-[44px] gap-2 bg-green-600 hover:bg-green-700"
                          >
                            <CheckCircle className="h-4 w-4" />
                            Completar
                          </Button>
                        )}
                        {(cita.estado === 'solicitada' || cita.estado === 'confirmada') && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setCitaSeleccionada(cita);
                              setModalCancelar(true);
                            }}
                            className="min-h-[44px] border-red-200 text-red-600 hover:bg-red-50"
                          >
                            <XCircle className="h-4 w-4" />
                          </Button>
                        )}
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="outline" size="sm" className="min-h-[44px] min-w-[44px] p-0">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            {cita.estado === 'solicitada' && (
                              <DropdownMenuItem
                                onClick={() => handleCambiarEstado(cita.id, 'confirmada')}
                              >
                                <CheckCircle className="h-4 w-4 mr-2" />
                                Confirmar
                              </DropdownMenuItem>
                            )}
                            {cita.estado === 'confirmada' && (
                              <DropdownMenuItem
                                onClick={() => handleCambiarEstado(cita.id, 'en-progreso')}
                              >
                                <Clock className="h-4 w-4 mr-2" />
                                Marcar En Progreso
                              </DropdownMenuItem>
                            )}
                            {cita.estado === 'en-progreso' && (
                              <DropdownMenuItem
                                onClick={() => handleCambiarEstado(cita.id, 'completada')}
                              >
                                <CheckCircle className="h-4 w-4 mr-2 text-green-600" />
                                Marcar Completada
                              </DropdownMenuItem>
                            )}
                            {(cita.estado === 'solicitada' || cita.estado === 'confirmada') && (
                              <DropdownMenuItem
                                onClick={() => {
                                  setCitaSeleccionada(cita);
                                  setModalCancelar(true);
                                }}
                                className="text-red-600"
                              >
                                <XCircle className="h-4 w-4 mr-2" />
                                Cancelar Cita
                              </DropdownMenuItem>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Vista de tabla - Desktop */}
              <Card className="hidden md:block">
                <CardContent className="p-0">
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Número</TableHead>
                          <TableHead>Cliente</TableHead>
                          <TableHead>Servicio</TableHead>
                          <TableHead>Fecha y Hora</TableHead>
                          <TableHead>Trabajador</TableHead>
                          <TableHead>Estado</TableHead>
                          <TableHead className="text-right">Acciones</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {citasFiltradas.map((cita) => (
                          <TableRow key={cita.id}>
                            <TableCell className="font-medium">{cita.numero}</TableCell>
                            <TableCell>
                              <div>
                                <div className="font-medium">{cita.clienteNombre}</div>
                                {cita.clienteTelefono && (
                                  <div className="text-xs text-gray-500">{cita.clienteTelefono}</div>
                                )}
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="text-sm">{cita.servicioNombre}</div>
                              <div className="text-xs text-gray-500">{cita.servicioDuracion} min</div>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <Calendar className="h-4 w-4 text-gray-400" />
                                <div>
                                  <div className="text-sm">
                                    {format(parseISO(cita.fecha), 'dd MMM yyyy', { locale: es })}
                                  </div>
                                  <div className="text-xs text-gray-500 flex items-center gap-1">
                                    <Clock className="h-3 w-3" />
                                    {cita.horaInicio} - {cita.horaFin}
                                  </div>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              {cita.trabajadorAsignadoNombre ? (
                                <div className="flex items-center gap-2">
                                  <UserCheck className="h-4 w-4 text-blue-600" />
                                  <span className="text-sm">{cita.trabajadorAsignadoNombre}</span>
                                </div>
                              ) : (
                                <span className="text-xs text-gray-400">Sin asignar</span>
                              )}
                            </TableCell>
                            <TableCell>{getEstadoBadge(cita.estado)}</TableCell>
                            <TableCell className="text-right">
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="sm">
                                    <MoreVertical className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  {cita.estado === 'solicitada' && (
                                    <DropdownMenuItem
                                      onClick={() => handleCambiarEstado(cita.id, 'confirmada')}
                                    >
                                      <CheckCircle className="h-4 w-4 mr-2" />
                                      Confirmar
                                    </DropdownMenuItem>
                                  )}
                                  {cita.estado === 'confirmada' && (
                                    <DropdownMenuItem
                                      onClick={() => handleCambiarEstado(cita.id, 'en-progreso')}
                                    >
                                      <Clock className="h-4 w-4 mr-2" />
                                      Marcar En Progreso
                                    </DropdownMenuItem>
                                  )}
                                  {cita.estado === 'en-progreso' && (
                                    <DropdownMenuItem
                                      onClick={() => handleCambiarEstado(cita.id, 'completada')}
                                    >
                                      <CheckCircle className="h-4 w-4 mr-2 text-green-600" />
                                      Marcar Completada
                                    </DropdownMenuItem>
                                  )}
                                  {(cita.estado === 'solicitada' || cita.estado === 'confirmada') && (
                                    <DropdownMenuItem
                                      onClick={() => {
                                        setCitaSeleccionada(cita);
                                        setModalCancelar(true);
                                      }}
                                      className="text-red-600"
                                    >
                                      <XCircle className="h-4 w-4 mr-2" />
                                      Cancelar Cita
                                    </DropdownMenuItem>
                                  )}
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </TabsContent>
      </Tabs>

      {/* Modal de Cancelación */}
      <Dialog open={modalCancelar} onOpenChange={setModalCancelar}>
        <DialogContent className="max-w-[95vw] sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Cancelar Cita</DialogTitle>
            <DialogDescription>
              ¿Estás seguro de que deseas cancelar la cita {citaSeleccionada?.numero}?
              Esta acción notificará al cliente.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {citaSeleccionada && (
              <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-gray-400" />
                  <span className="font-medium">{citaSeleccionada.clienteNombre}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-gray-400" />
                  <span className="text-sm">
                    {format(parseISO(citaSeleccionada.fecha), 'dd/MM/yyyy', { locale: es })} - {citaSeleccionada.horaInicio}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 text-gray-400" />
                  <span className="text-sm">{citaSeleccionada.servicioNombre}</span>
                </div>
              </div>
            )}

            <div className="space-y-2">
              <label className="text-sm font-medium">Motivo de cancelación *</label>
              <textarea
                className="w-full min-h-[100px] px-3 py-2 border rounded-md text-sm"
                placeholder="Explica el motivo de la cancelación..."
                value={motivoCancelacion}
                onChange={(e) => setMotivoCancelacion(e.target.value)}
              />
            </div>
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="outline"
              onClick={() => {
                setModalCancelar(false);
                setMotivoCancelacion('');
              }}
              disabled={procesando}
              className="min-h-[44px]"
            >
              Volver
            </Button>
            <Button
              variant="destructive"
              onClick={handleCancelarCita}
              disabled={procesando || !motivoCancelacion.trim()}
              className="min-h-[44px]"
            >
              {procesando ? 'Cancelando...' : 'Cancelar Cita'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}