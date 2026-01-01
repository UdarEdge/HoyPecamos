import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { Input } from '../ui/input';
import { Checkbox } from '../ui/checkbox';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../ui/table';
import {
  Users,
  TrendingUp,
  DollarSign,
  Clock,
  Search,
  Grid3x3,
  TableIcon,
  FileDown,
  MoreVertical,
  MessageCircle,
  Eye,
  Shield,
  Edit,
  Mail,
  Phone,
  Calendar,
  Briefcase,
  MapPin,
  Percent,
  Send,
  UserCheck
} from 'lucide-react';
import { format } from 'date-fns@4.1.0';
import { toast } from 'sonner@2.0.3';
import type { Trabajador } from '../../data/trabajadores';
import {
  getNombreEmpresa,
  getNombreMarca,
  getIconoMarca,
  PUNTOS_VENTA
} from '../../constants/empresaConfig';

interface ListadoEquipoMejoradoProps {
  empleados: Trabajador[];
  onAbrirChat: (trabajador: Trabajador) => void;
  onVerPerfil: (trabajador: Trabajador) => void;
  onAdministrarPermisos: (trabajador: Trabajador) => void;
  onModificarContrato: (trabajador: Trabajador) => void;
}

export function ListadoEquipoMejorado({
  empleados,
  onAbrirChat,
  onVerPerfil,
  onAdministrarPermisos,
  onModificarContrato
}: ListadoEquipoMejoradoProps) {
  const [vistaEquipo, setVistaEquipo] = useState<'cards' | 'tabla'>('cards');
  const [empleadosSeleccionados, setEmpleadosSeleccionados] = useState<string[]>([]);
  const [busquedaEquipo, setBusquedaEquipo] = useState('');

  // KPIs del equipo
  const totalEmpleados = empleados.length;
  const empleadosActivos = empleados.filter(e => e.estado === 'activo').length;
  const empleadosDeBaja = empleados.filter(e => e.estado === 'baja').length;
  const empleadosVacaciones = empleados.filter(e => e.estado === 'vacaciones').length;
  const costeMensual = empleados.reduce((sum, e) => sum + (e.salarioMensual || 0), 0);
  const horasTotalesMes = empleados.reduce((sum, e) => sum + e.horasTrabajadas, 0);
  const horasContratoMes = empleados.reduce((sum, e) => sum + e.horasContrato, 0);
  const cumplimientoHorario = horasContratoMes > 0 ? (horasTotalesMes / horasContratoMes) * 100 : 0;

  // Filtrar por búsqueda
  const empleadosFiltrados = empleados.filter(emp => {
    if (!busquedaEquipo.trim()) return true;
    const searchTerm = busquedaEquipo.toLowerCase();
    const nombreCompleto = `${emp.nombre} ${emp.apellidos}`.toLowerCase();
    const puesto = emp.puesto.toLowerCase();
    const email = emp.email.toLowerCase();
    const pdv = (PUNTOS_VENTA[emp.puntoVentaId]?.nombre || '').toLowerCase();
    return nombreCompleto.includes(searchTerm) || puesto.includes(searchTerm) || 
           email.includes(searchTerm) || pdv.includes(searchTerm);
  });

  // Handlers
  const handleToggleSeleccionEmpleado = (empleadoId: string) => {
    setEmpleadosSeleccionados(prev => 
      prev.includes(empleadoId) 
        ? prev.filter(id => id !== empleadoId)
        : [...prev, empleadoId]
    );
  };

  const handleSeleccionarTodos = () => {
    if (empleadosSeleccionados.length === empleadosFiltrados.length) {
      setEmpleadosSeleccionados([]);
    } else {
      setEmpleadosSeleccionados(empleadosFiltrados.map(e => e.id));
    }
  };

  const handleAccionMasiva = (accion: 'exportar' | 'notificar') => {
    if (empleadosSeleccionados.length === 0) {
      toast.error('Selecciona al menos un empleado');
      return;
    }
    
    switch(accion) {
      case 'exportar':
        toast.success(`Exportando ${empleadosSeleccionados.length} empleados...`);
        break;
      case 'notificar':
        toast.success(`Enviando notificación a ${empleadosSeleccionados.length} empleados...`);
        break;
    }
  };

  const getEstadoBadge = (estado: string) => {
    const configs = {
      activo: { className: 'bg-green-100 text-green-800 border-green-300', label: 'Activo' },
      vacaciones: { className: 'bg-blue-100 text-blue-800 border-blue-300', label: 'Vacaciones' },
      baja: { className: 'bg-red-100 text-red-800 border-red-300', label: 'Baja' },
    };
    const config = configs[estado as keyof typeof configs] || configs.activo;
    return <Badge variant="outline" className={config.className}>{config.label}</Badge>;
  };

  return (
    <div className="space-y-6">
      {/* 🎯 KPIs DESTACADOS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-l-4 border-l-black">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Total Empleados</p>
                <p className="text-3xl font-bold text-gray-900">{totalEmpleados}</p>
              </div>
              <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center">
                <Users className="w-6 h-6 text-gray-700" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-green-500">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Activos</p>
                <p className="text-3xl font-bold text-green-700">{empleadosActivos}</p>
                <p className="text-xs text-gray-500 mt-1">
                  {((empleadosActivos / totalEmpleados) * 100).toFixed(0)}% del total
                </p>
              </div>
              <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
                <UserCheck className="w-6 h-6 text-green-700" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-[#ED1C24]">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Coste Mensual</p>
                <p className="text-3xl font-bold text-gray-900">
                  {(costeMensual / 1000).toFixed(1)}k€
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  {(costeMensual / totalEmpleados).toFixed(0)}€ / empleado
                </p>
              </div>
              <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-[#ED1C24]" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-blue-500">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Cumplimiento</p>
                <p className="text-3xl font-bold text-blue-700">{cumplimientoHorario.toFixed(0)}%</p>
                <p className="text-xs text-gray-500 mt-1">
                  {horasTotalesMes}h / {horasContratoMes}h
                </p>
              </div>
              <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
                <Clock className="w-6 h-6 text-blue-700" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 🔍 BARRA DE BÚSQUEDA Y ACCIONES */}
      <Card>
        <CardHeader className="p-4 border-b">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 justify-between">
            <div className="flex-1 w-full sm:w-auto">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Buscar por nombre, puesto, email o PDV..."
                  value={busquedaEquipo}
                  onChange={(e) => setBusquedaEquipo(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              {/* Botones de Vista */}
              <div className="flex border rounded-lg overflow-hidden">
                <Button
                  variant={vistaEquipo === 'cards' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setVistaEquipo('cards')}
                  className="rounded-none"
                >
                  <Grid3x3 className="w-4 h-4" />
                </Button>
                <Button
                  variant={vistaEquipo === 'tabla' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setVistaEquipo('tabla')}
                  className="rounded-none"
                >
                  <TableIcon className="w-4 h-4" />
                </Button>
              </div>

              {/* Acciones Masivas */}
              {empleadosSeleccionados.length > 0 && (
                <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-100 rounded-lg border">
                  <span className="text-sm font-medium">{empleadosSeleccionados.length} seleccionados</span>
                  <Button size="sm" variant="ghost" onClick={() => handleAccionMasiva('exportar')}>
                    <FileDown className="w-4 h-4" />
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => handleAccionMasiva('notificar')}>
                    <Send className="w-4 h-4" />
                  </Button>
                </div>
              )}
            </div>
          </div>

          {busquedaEquipo && (
            <div className="mt-2 text-sm text-gray-600">
              Mostrando {empleadosFiltrados.length} de {totalEmpleados} empleados
            </div>
          )}
        </CardHeader>

        <CardContent className="p-4">
          {/* 📋 VISTA CARDS */}
          {vistaEquipo === 'cards' && (
            <div className="space-y-3">
              {empleadosFiltrados.map((empleado) => (
                <div
                  key={empleado.id}
                  className={`relative p-4 border rounded-lg transition-all hover:shadow-md ${
                    empleadosSeleccionados.includes(empleado.id) ? 'ring-2 ring-black bg-gray-50' : 'bg-white'
                  }`}
                >
                  {/* Checkbox de selección */}
                  <div className="absolute top-4 left-4">
                    <Checkbox
                      checked={empleadosSeleccionados.includes(empleado.id)}
                      onCheckedChange={() => handleToggleSeleccionEmpleado(empleado.id)}
                    />
                  </div>

                  <div className="flex items-start gap-4 pl-8">
                    {/* Avatar */}
                    <Avatar className="w-16 h-16 border-2 border-gray-200">
                      <AvatarImage src={empleado.avatar} alt={empleado.nombre} />
                      <AvatarFallback className="text-lg font-semibold">
                        {empleado.nombre.charAt(0)}{empleado.apellidos.charAt(0)}
                      </AvatarFallback>
                    </Avatar>

                    {/* Información Principal */}
                    <div className="flex-1 min-w-0">
                      {/* Nombre y Estado */}
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="text-lg font-semibold text-gray-900 truncate">
                          {empleado.nombre} {empleado.apellidos}
                        </h3>
                        {getEstadoBadge(empleado.estado)}
                      </div>

                      {/* Badges de contexto */}
                      <div className="flex flex-wrap gap-2 mb-3">
                        <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700 border-blue-200">
                          🏢 {getNombreEmpresa(empleado.empresaId)}
                        </Badge>
                        {empleado.marcaId && (
                          <Badge variant="outline" className="text-xs bg-purple-50 text-purple-700 border-purple-200">
                            {getIconoMarca(empleado.marcaId)} {getNombreMarca(empleado.marcaId)}
                          </Badge>
                        )}
                        <Badge variant="outline" className="text-xs bg-green-50 text-green-700 border-green-200">
                          📍 {PUNTOS_VENTA[empleado.puntoVentaId]?.nombre || 'Sin asignar'}
                        </Badge>
                      </div>

                      {/* Grid de Información */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-3">
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Briefcase className="w-4 h-4 text-gray-400 shrink-0" />
                          <span className="truncate">{empleado.puesto}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Mail className="w-4 h-4 text-gray-400 shrink-0" />
                          <span className="truncate">{empleado.email}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Phone className="w-4 h-4 text-gray-400 shrink-0" />
                          <span>{empleado.telefono}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Calendar className="w-4 h-4 text-gray-400 shrink-0" />
                          <span>Desde {format(new Date(empleado.fechaIngreso), 'dd/MM/yyyy')}</span>
                        </div>
                      </div>

                      {/* Barra de Progreso de Horas */}
                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4 text-gray-400" />
                          <span className="text-sm font-medium">{empleado.horasTrabajadas}h</span>
                          <span className="text-sm text-gray-500">/ {empleado.horasContrato}h</span>
                        </div>
                        <div className="flex-1">
                          <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                            <div
                              className={`h-full transition-all ${
                                empleado.horasTrabajadas > empleado.horasContrato
                                  ? 'bg-orange-500'
                                  : empleado.horasTrabajadas / empleado.horasContrato > 0.9
                                  ? 'bg-green-500'
                                  : 'bg-blue-500'
                              }`}
                              style={{
                                width: `${Math.min((empleado.horasTrabajadas / empleado.horasContrato) * 100, 100)}%`
                              }}
                            />
                          </div>
                        </div>
                        <span className="text-sm text-gray-500">
                          {((empleado.horasTrabajadas / empleado.horasContrato) * 100).toFixed(0)}%
                        </span>
                      </div>
                    </div>

                    {/* Menú de Acciones */}
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm" className="h-9 w-9 p-0 shrink-0">
                          <MoreVertical className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-48">
                        <DropdownMenuItem onClick={() => onAbrirChat(empleado)}>
                          <MessageCircle className="w-4 h-4 mr-2" />
                          Abrir Chat
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => onVerPerfil(empleado)}>
                          <Eye className="w-4 h-4 mr-2" />
                          Ver perfil
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => onAdministrarPermisos(empleado)}>
                          <Shield className="w-4 h-4 mr-2" />
                          Administrar permisos
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => onModificarContrato(empleado)}>
                          <Edit className="w-4 h-4 mr-2" />
                          Modificar contrato
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              ))}

              {empleadosFiltrados.length === 0 && (
                <div className="text-center py-12 text-gray-500">
                  <Users className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>No se encontraron empleados</p>
                </div>
              )}
            </div>
          )}

          {/* 📊 VISTA TABLA */}
          {vistaEquipo === 'tabla' && (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12">
                      <Checkbox
                        checked={empleadosSeleccionados.length === empleadosFiltrados.length && empleadosFiltrados.length > 0}
                        onCheckedChange={handleSeleccionarTodos}
                      />
                    </TableHead>
                    <TableHead>Empleado</TableHead>
                    <TableHead>Puesto</TableHead>
                    <TableHead>PDV</TableHead>
                    <TableHead>Horas</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead className="w-12"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {empleadosFiltrados.map((empleado) => (
                    <TableRow key={empleado.id} className={empleadosSeleccionados.includes(empleado.id) ? 'bg-gray-50' : ''}>
                      <TableCell>
                        <Checkbox
                          checked={empleadosSeleccionados.includes(empleado.id)}
                          onCheckedChange={() => handleToggleSeleccionEmpleado(empleado.id)}
                        />
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar className="w-8 h-8">
                            <AvatarImage src={empleado.avatar} />
                            <AvatarFallback className="text-xs">
                              {empleado.nombre.charAt(0)}{empleado.apellidos.charAt(0)}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="font-medium">{empleado.nombre} {empleado.apellidos}</div>
                            <div className="text-xs text-gray-500">{empleado.email}</div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>{empleado.puesto}</TableCell>
                      <TableCell>{PUNTOS_VENTA[empleado.puntoVentaId]?.nombre || 'N/A'}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <span className="text-sm">{empleado.horasTrabajadas}/{empleado.horasContrato}h</span>
                          <div className="w-16 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-blue-500"
                              style={{
                                width: `${Math.min((empleado.horasTrabajadas / empleado.horasContrato) * 100, 100)}%`
                              }}
                            />
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>{getEstadoBadge(empleado.estado)}</TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                              <MoreVertical className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-48">
                            <DropdownMenuItem onClick={() => onAbrirChat(empleado)}>
                              <MessageCircle className="w-4 h-4 mr-2" />
                              Abrir Chat
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => onVerPerfil(empleado)}>
                              <Eye className="w-4 h-4 mr-2" />
                              Ver perfil
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => onAdministrarPermisos(empleado)}>
                              <Shield className="w-4 h-4 mr-2" />
                              Administrar permisos
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => onModificarContrato(empleado)}>
                              <Edit className="w-4 h-4 mr-2" />
                              Modificar contrato
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {empleadosFiltrados.length === 0 && (
                <div className="text-center py-12 text-gray-500">
                  <Users className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>No se encontraron empleados</p>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
