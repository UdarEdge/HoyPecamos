import { useState, useMemo } from 'react';
import { Card, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Input } from '../ui/input';
import { Dialog, DialogContent } from '../ui/dialog';
import {
  Users,
  Clock,
  Calendar,
  DollarSign,
  UserCheck,
  TrendingUp,
  Search,
  CalendarDays,
  ClipboardList,
  FileText,
  UserPlus,
  Mail,
  ChevronDown,
  Activity,
  AlertCircle,
  Sparkles,
  GraduationCap,
  LayoutGrid,
  Table
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu';
import { ListadoEquipoMejorado } from './ListadoEquipoMejorado';
import { DetalleEmpleadoModal } from './DetalleEmpleadoModal';
import { GestionHorariosRapida } from './GestionHorariosRapida';
import { FichajesEnVivo } from './FichajesEnVivo';
import { ReportesAvanzados } from './ReportesAvanzados';
import { ModalGestionOnboarding } from './ModalGestionOnboarding';
import { ModalInvitarEmpleado } from './ModalInvitarEmpleado';
import { toast } from 'sonner@2.0.3';
import type { Trabajador } from '../../data/trabajadores';
import { trabajadores } from '../../data/trabajadores';
import { PUNTOS_VENTA } from '../../constants/empresaConfig';
import { calcularHorasTrabajadas } from '../../data/fichajes';
import { Progress } from '../ui/progress';

export function EquipoRRHHv2() {
  const [empleadoSeleccionado, setEmpleadoSeleccionado] = useState<Trabajador | null>(null);
  const [modalDetalleEmpleado, setModalDetalleEmpleado] = useState(false);
  const [modalGestionHorarios, setModalGestionHorarios] = useState(false);
  const [modalFichajesVivo, setModalFichajesVivo] = useState(false);
  const [modalReportes, setModalReportes] = useState(false);
  const [modalOnboarding, setModalOnboarding] = useState(false);
  const [modalInvitarEmpleado, setModalInvitarEmpleado] = useState(false);
  const [modalAñadirEmpleado, setModalAñadirEmpleado] = useState(false);
  const [vistaActual, setVistaActual] = useState<'equipo' | 'horarios' | 'fichajes' | 'reportes' | 'onboarding'>('equipo');
  const [modoVisualizacion, setModoVisualizacion] = useState<'tarjetas' | 'tabla'>('tabla');

  // KPIs Generales
  const kpis = useMemo(() => {
    const totalEmpleados = trabajadores.length;
    const empleadosActivos = trabajadores.filter(e => e.estado === 'activo').length;
    const empleadosDeBaja = trabajadores.filter(e => e.estado === 'baja').length;
    const empleadosVacaciones = trabajadores.filter(e => e.estado === 'vacaciones').length;
    const costeMensual = trabajadores.reduce((sum, e) => sum + (e.salarioMensual || 0), 0);
    const horasTotalesMes = trabajadores.reduce((sum, e) => sum + e.horasTrabajadas, 0);
    const horasContratoMes = trabajadores.reduce((sum, e) => sum + e.horasContrato, 0);
    const cumplimientoHorario = horasContratoMes > 0 ? (horasTotalesMes / horasContratoMes) * 100 : 0;
    
    // Fichados ahora (simulado)
    const fichadosAhora = 4; // Actualizado a 4 (de 6 empleados)
    const retrasos = 0;

    // Onboarding (simulado - en producción vendría del servicio)
    const enOnboarding = 2; // Actualizado
    const progresoPromedioOnboarding = 75;

    return {
      totalEmpleados,
      empleadosActivos,
      empleadosDeBaja,
      empleadosVacaciones,
      costeMensual,
      horasTotalesMes,
      horasContratoMes,
      cumplimientoHorario,
      fichadosAhora,
      retrasos,
      enOnboarding,
      progresoPromedioOnboarding
    };
  }, []);

  // Handlers
  const handleAbrirChat = (trabajador: Trabajador) => {
    toast.info(`Abriendo chat con ${trabajador.nombre} ${trabajador.apellidos}`);
  };

  const handleVerPerfil = (trabajador: Trabajador) => {
    setEmpleadoSeleccionado(trabajador);
    setModalDetalleEmpleado(true);
  };

  const handleAdministrarPermisos = (trabajador: Trabajador) => {
    setEmpleadoSeleccionado(trabajador);
    setModalDetalleEmpleado(true);
    // TODO: Abrir tab de permisos
  };

  const handleModificarContrato = (trabajador: Trabajador) => {
    setEmpleadoSeleccionado(trabajador);
    setModalDetalleEmpleado(true);
    // TODO: Abrir tab de información
  };

  return (
    <div className="space-y-6">
      {/* 📊 HEADER CON TÍTULO Y ACCIONES */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900" style={{ fontFamily: 'Poppins, sans-serif' }}>
            Equipo y Recursos Humanos
          </h1>
          <p className="text-sm text-gray-600 mt-1">
            Gestión completa del equipo, horarios y fichajes
          </p>
        </div>

        {/* Botón Nuevo Empleado */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button className="bg-black hover:bg-gray-800">
              <UserPlus className="w-4 h-4 mr-2" />
              Nuevo Empleado
              <ChevronDown className="w-4 h-4 ml-2" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-64">
            <DropdownMenuItem onClick={() => setModalInvitarEmpleado(true)} className="cursor-pointer">
              <Mail className="w-4 h-4 mr-2 text-blue-600" />
              <div className="flex flex-col">
                <span className="font-medium">Invitar por Email/Link</span>
                <span className="text-xs text-gray-500">El empleado se auto-registra</span>
              </div>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setModalAñadirEmpleado(true)} className="cursor-pointer">
              <UserPlus className="w-4 h-4 mr-2 text-green-600" />
              <div className="flex flex-col">
                <span className="font-medium">Crear Directamente</span>
                <span className="text-xs text-gray-500">Alta manual del empleado</span>
              </div>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* 🎯 FILTROS HORIZONTALES CON SCROLL */}
      <div className="relative">
        <div className="flex items-center gap-3 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
          {/* Equipo */}
          <Button
            variant={vistaActual === 'equipo' ? 'default' : 'outline'}
            className={`flex-shrink-0 h-auto py-3 px-4 flex flex-col items-start gap-1 min-w-[160px] ${
              vistaActual === 'equipo' 
                ? 'bg-black text-white hover:bg-gray-800' 
                : 'hover:bg-gray-50 border-gray-300'
            }`}
            onClick={() => setVistaActual('equipo')}
          >
            <div className="flex items-center gap-2 w-full">
              <Users className="w-4 h-4" />
              <span className="font-semibold text-sm">Equipo</span>
            </div>
            <div className="flex items-center gap-2 w-full justify-between">
              <span className="text-xs opacity-80">{kpis.totalEmpleados} empleados</span>
              <div className="flex items-center gap-1">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setModoVisualizacion('tarjetas');
                  }}
                  className={`p-1 rounded ${modoVisualizacion === 'tarjetas' ? 'bg-white/20' : 'opacity-60 hover:opacity-100'}`}
                >
                  <LayoutGrid className="w-3 h-3" />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setModoVisualizacion('tabla');
                  }}
                  className={`p-1 rounded ${modoVisualizacion === 'tabla' ? 'bg-white/20' : 'opacity-60 hover:opacity-100'}`}
                >
                  <Table className="w-3 h-3" />
                </button>
              </div>
            </div>
          </Button>

          {/* Horarios */}
          <Button
            variant={vistaActual === 'horarios' ? 'default' : 'outline'}
            className={`flex-shrink-0 h-auto py-3 px-4 flex flex-col items-start gap-1 min-w-[160px] ${
              vistaActual === 'horarios' 
                ? 'bg-blue-600 text-white hover:bg-blue-700' 
                : 'hover:bg-blue-50 border-blue-200'
            }`}
            onClick={() => {
              setVistaActual('horarios');
              setModalGestionHorarios(true);
            }}
          >
            <div className="flex items-center gap-2 w-full">
              <CalendarDays className="w-4 h-4" />
              <span className="font-semibold text-sm">Horarios</span>
            </div>
            <span className="text-xs opacity-80">Planificar turnos</span>
          </Button>

          {/* Fichajes */}
          <Button
            variant={vistaActual === 'fichajes' ? 'default' : 'outline'}
            className={`flex-shrink-0 h-auto py-3 px-4 flex flex-col items-start gap-1 min-w-[160px] ${
              vistaActual === 'fichajes' 
                ? 'bg-green-600 text-white hover:bg-green-700' 
                : 'hover:bg-green-50 border-green-200'
            }`}
            onClick={() => {
              setVistaActual('fichajes');
              setModalFichajesVivo(true);
            }}
          >
            <div className="flex items-center gap-2 w-full">
              <Activity className="w-4 h-4" />
              <span className="font-semibold text-sm">Fichajes</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse"></div>
              <span className="text-xs opacity-80">{kpis.fichadosAhora} fichados ahora</span>
            </div>
          </Button>

          {/* Reportes */}
          <Button
            variant={vistaActual === 'reportes' ? 'default' : 'outline'}
            className={`flex-shrink-0 h-auto py-3 px-4 flex flex-col items-start gap-1 min-w-[160px] ${
              vistaActual === 'reportes' 
                ? 'bg-purple-600 text-white hover:bg-purple-700' 
                : 'hover:bg-purple-50 border-purple-200'
            }`}
            onClick={() => {
              setVistaActual('reportes');
              setModalReportes(true);
            }}
          >
            <div className="flex items-center gap-2 w-full">
              <FileText className="w-4 h-4" />
              <span className="font-semibold text-sm">Reportes</span>
            </div>
            <span className="text-xs opacity-80">Análisis y estadísticas</span>
          </Button>

          {/* Onboarding */}
          <Button
            variant={vistaActual === 'onboarding' ? 'default' : 'outline'}
            className={`flex-shrink-0 h-auto py-3 px-4 flex flex-col items-start gap-1 min-w-[160px] relative ${
              vistaActual === 'onboarding' 
                ? 'bg-indigo-600 text-white hover:bg-indigo-700' 
                : 'hover:bg-indigo-50 border-indigo-200'
            }`}
            onClick={() => {
              setVistaActual('onboarding');
              setModalOnboarding(true);
            }}
          >
            <div className="flex items-center gap-2 w-full">
              <GraduationCap className="w-4 h-4" />
              <span className="font-semibold text-sm">Onboarding</span>
              {kpis.enOnboarding > 0 && (
                <Badge className={`ml-auto text-[10px] h-4 px-1.5 ${
                  vistaActual === 'onboarding' 
                    ? 'bg-white text-indigo-600' 
                    : 'bg-indigo-600 text-white'
                }`}>
                  {kpis.enOnboarding}
                </Badge>
              )}
            </div>
            <div className="flex items-center gap-2 w-full">
              <div className="flex-1 h-1 bg-gray-200 rounded-full overflow-hidden">
                <div 
                  className={`h-full ${vistaActual === 'onboarding' ? 'bg-white' : 'bg-indigo-600'}`}
                  style={{ width: `${kpis.progresoPromedioOnboarding}%` }}
                ></div>
              </div>
              <span className="text-xs opacity-80">{kpis.progresoPromedioOnboarding}%</span>
            </div>
          </Button>
        </div>
      </div>

      {/* 📊 KPIs COMPACTOS */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {/* Total Empleados */}
        <Card className="border-l-4 border-l-black hover:shadow-md transition-shadow">
          <CardContent className="p-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-600 mb-1">Total Empleados</p>
                <p className="text-2xl font-bold text-gray-900">{kpis.totalEmpleados}</p>
              </div>
              <Users className="w-8 h-8 text-gray-400" />
            </div>
          </CardContent>
        </Card>

        {/* Activos */}
        <Card className="border-l-4 border-l-green-500 hover:shadow-md transition-shadow">
          <CardContent className="p-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-600 mb-1">Activos</p>
                <p className="text-2xl font-bold text-green-700">{kpis.empleadosActivos}</p>
              </div>
              <UserCheck className="w-8 h-8 text-green-400" />
            </div>
          </CardContent>
        </Card>

        {/* En Onboarding */}
        <Card 
          className="border-l-4 border-l-purple-500 hover:shadow-md transition-shadow cursor-pointer"
          onClick={() => setModalOnboarding(true)}
        >
          <CardContent className="p-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-600 mb-1">Onboarding</p>
                <p className="text-2xl font-bold text-purple-700">{kpis.enOnboarding}</p>
              </div>
              <GraduationCap className="w-8 h-8 text-purple-400" />
            </div>
          </CardContent>
        </Card>

        {/* Coste Mensual */}
        <Card className="border-l-4 border-l-[#ED1C24] hover:shadow-md transition-shadow">
          <CardContent className="p-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-600 mb-1">Coste Mensual</p>
                <p className="text-2xl font-bold text-gray-900">
                  {(kpis.costeMensual / 1000).toFixed(1)}k€
                </p>
              </div>
              <DollarSign className="w-8 h-8 text-red-400" />
            </div>
          </CardContent>
        </Card>

        {/* Cumplimiento */}
        <Card className="border-l-4 border-l-blue-500 hover:shadow-md transition-shadow">
          <CardContent className="p-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-600 mb-1">Cumplimiento</p>
                <p className="text-2xl font-bold text-blue-700">{kpis.cumplimientoHorario.toFixed(0)}%</p>
              </div>
              <Clock className="w-8 h-8 text-blue-400" />
            </div>
          </CardContent>
        </Card>

        {/* Fichados */}
        <Card className="border-l-4 border-l-teal-500 hover:shadow-md transition-shadow">
          <CardContent className="p-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-600 mb-1">Fichados</p>
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <p className="text-2xl font-bold text-teal-700">{kpis.fichadosAhora}</p>
                </div>
              </div>
              <Activity className="w-8 h-8 text-teal-400" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 👥 LISTADO DE EMPLEADOS */}
      <ListadoEquipoMejorado
        empleados={trabajadores}
        onAbrirChat={handleAbrirChat}
        onVerPerfil={handleVerPerfil}
        onAdministrarPermisos={handleAdministrarPermisos}
        onModificarContrato={handleModificarContrato}
      />

      {/* 🔹 MODALES */}
      
      {/* Modal Detalle Empleado */}
      {empleadoSeleccionado && (
        <DetalleEmpleadoModal
          isOpen={modalDetalleEmpleado}
          onOpenChange={setModalDetalleEmpleado}
          empleado={empleadoSeleccionado}
        />
      )}

      {/* Modal Gestión de Horarios */}
      <GestionHorariosRapida
        isOpen={modalGestionHorarios}
        onOpenChange={setModalGestionHorarios}
      />

      {/* Modal Fichajes en Vivo */}
      <FichajesEnVivo
        isOpen={modalFichajesVivo}
        onOpenChange={setModalFichajesVivo}
      />

      {/* Modal Reportes Avanzados */}
      <ReportesAvanzados
        isOpen={modalReportes}
        onOpenChange={setModalReportes}
      />

      {/* Modal Onboarding */}
      <ModalGestionOnboarding
        isOpen={modalOnboarding}
        onOpenChange={setModalOnboarding}
        enOnboarding={kpis.enOnboarding}
        progresoPromedioOnboarding={kpis.progresoPromedioOnboarding}
      />

      {/* Modal Invitar Empleado */}
      <ModalInvitarEmpleado 
        isOpen={modalInvitarEmpleado} 
        onOpenChange={setModalInvitarEmpleado}
        empresaId="EMPRESA-001"
        empresaNombre="HoyPecamos"
        onInvitacionCreada={() => {
          toast.success('Invitación enviada correctamente');
        }}
      />
    </div>
  );
}