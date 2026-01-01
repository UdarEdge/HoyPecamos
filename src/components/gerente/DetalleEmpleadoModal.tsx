import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import {
  User,
  FileText,
  Clock,
  Activity,
  Shield,
  History,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Briefcase,
  DollarSign,
  Download,
  Edit,
  Trash2
} from 'lucide-react';
import { format } from 'date-fns@4.1.0';
import { es } from 'date-fns@4.1.0/locale';
import type { Trabajador } from '../../data/trabajadores';
import { PUNTOS_VENTA, getNombreEmpresa, getNombreMarca, getIconoMarca } from '../../constants/empresaConfig';

interface DetalleEmpleadoModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  empleado: Trabajador;
}

export function DetalleEmpleadoModal({ isOpen, onOpenChange, empleado }: DetalleEmpleadoModalProps) {
  const [activeTab, setActiveTab] = useState('info');

  const documentosMock = [
    { id: 1, nombre: 'DNI', tipo: 'PDF', fecha: '2024-03-15', size: '2.3 MB' },
    { id: 2, nombre: 'Contrato de Trabajo', tipo: 'PDF', fecha: '2024-03-10', size: '485 KB' },
    { id: 3, nombre: 'Seguro Social', tipo: 'PDF', fecha: '2024-02-28', size: '1.1 MB' },
    { id: 4, nombre: 'Certificado Médico', tipo: 'PDF', fecha: '2024-01-15', size: '650 KB' },
  ];

  const horariosMock = [
    { dia: 'Lunes', entrada: '06:00', salida: '14:00', horas: 8 },
    { dia: 'Martes', entrada: '06:00', salida: '14:00', horas: 8 },
    { dia: 'Miércoles', entrada: 'Descanso', salida: '-', horas: 0 },
    { dia: 'Jueves', entrada: '06:00', salida: '14:00', horas: 8 },
    { dia: 'Viernes', entrada: '06:00', salida: '14:00', horas: 8 },
    { dia: 'Sábado', entrada: '06:00', salida: '12:00', horas: 6 },
    { dia: 'Domingo', entrada: 'Descanso', salida: '-', horas: 0 },
  ];

  const fichajesMock = [
    { fecha: '2024-12-30', entrada: '06:05', salida: '14:10', total: '8h 5m', estado: 'Completo' },
    { fecha: '2024-12-29', entrada: '05:58', salida: '14:00', total: '8h 2m', estado: 'Completo' },
    { fecha: '2024-12-28', entrada: '06:12', salida: '14:15', total: '8h 3m', estado: 'Retraso' },
    { fecha: '2024-12-27', entrada: '-', salida: '-', total: '-', estado: 'Descanso' },
    { fecha: '2024-12-26', entrada: '06:00', salida: '13:55', total: '7h 55m', estado: 'Completo' },
  ];

  const historialMock = [
    { fecha: '2024-12-01', accion: 'Modificación salarial', detalle: 'Incremento a 2,100€/mes', usuario: 'María García' },
    { fecha: '2024-09-15', accion: 'Cambio de horario', detalle: 'Turno de mañana', usuario: 'María García' },
    { fecha: '2024-06-01', accion: 'Asignación de PDV', detalle: 'Tiana', usuario: 'Sistema' },
    { fecha: '2024-01-15', accion: 'Alta del empleado', detalle: 'Incorporación inicial', usuario: 'María García' },
  ];

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-4">
            <Avatar className="w-16 h-16 border-2 border-gray-200">
              <AvatarImage src={empleado.avatar} />
              <AvatarFallback className="text-lg">
                {empleado.nombre.charAt(0)}{empleado.apellidos.charAt(0)}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <DialogTitle className="text-2xl">
                {empleado.nombre} {empleado.apellidos}
              </DialogTitle>
              <DialogDescription className="flex items-center gap-2 mt-1">
                <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                  {empleado.puesto}
                </Badge>
                <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                  📍 {PUNTOS_VENTA[empleado.puntoVentaId]?.nombre || 'Sin asignar'}
                </Badge>
                <Badge className={empleado.estado === 'activo' ? 'bg-green-600' : 'bg-red-600'}>
                  {empleado.estado === 'activo' ? 'Activo' : 'Inactivo'}
                </Badge>
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full mt-4">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="info" className="text-sm">
              <User className="w-4 h-4 mr-2" />
              Información
            </TabsTrigger>
            <TabsTrigger value="documentos" className="text-sm">
              <FileText className="w-4 h-4 mr-2" />
              Documentos
            </TabsTrigger>
            <TabsTrigger value="horarios" className="text-sm">
              <Clock className="w-4 h-4 mr-2" />
              Horarios
            </TabsTrigger>
            <TabsTrigger value="fichajes" className="text-sm">
              <Activity className="w-4 h-4 mr-2" />
              Fichajes
            </TabsTrigger>
            <TabsTrigger value="historial" className="text-sm">
              <History className="w-4 h-4 mr-2" />
              Historial
            </TabsTrigger>
          </TabsList>

          {/* TAB: INFORMACIÓN */}
          <TabsContent value="info" className="space-y-4 mt-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Datos Personales</CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center gap-3">
                  <Mail className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-xs text-gray-500">Email</p>
                    <p className="text-sm font-medium">{empleado.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Phone className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-xs text-gray-500">Teléfono</p>
                    <p className="text-sm font-medium">{empleado.telefono}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Calendar className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-xs text-gray-500">Fecha de Ingreso</p>
                    <p className="text-sm font-medium">
                      {format(new Date(empleado.fechaIngreso), "d 'de' MMMM 'de' yyyy", { locale: es })}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Briefcase className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-xs text-gray-500">Departamento</p>
                    <p className="text-sm font-medium">{empleado.departamento}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Información Laboral</CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <p className="text-xs text-gray-500 mb-1">Empresa</p>
                  <Badge variant="outline" className="bg-blue-50 text-blue-700">
                    🏢 {getNombreEmpresa(empleado.empresaId)}
                  </Badge>
                </div>
                {empleado.marcaId && (
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Marca</p>
                    <Badge variant="outline" className="bg-purple-50 text-purple-700">
                      {getIconoMarca(empleado.marcaId)} {getNombreMarca(empleado.marcaId)}
                    </Badge>
                  </div>
                )}
                <div>
                  <p className="text-xs text-gray-500 mb-1">Tipo de Contrato</p>
                  <p className="text-sm font-medium">{empleado.tipoContrato}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-1">Horas Contrato/Mes</p>
                  <p className="text-sm font-medium">{empleado.horasContrato}h</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-1">Salario Mensual</p>
                  <p className="text-sm font-medium flex items-center gap-1">
                    <DollarSign className="w-4 h-4 text-green-600" />
                    {empleado.salarioMensual?.toLocaleString()}€
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* TAB: DOCUMENTOS */}
          <TabsContent value="documentos" className="space-y-4 mt-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-lg">Documentos Adjuntos</CardTitle>
                <Button size="sm" variant="outline">
                  <Download className="w-4 h-4 mr-2" />
                  Subir Documento
                </Button>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {documentosMock.map((doc) => (
                    <div key={doc.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-red-100 flex items-center justify-center">
                          <FileText className="w-5 h-5 text-red-600" />
                        </div>
                        <div>
                          <p className="text-sm font-medium">{doc.nombre}</p>
                          <p className="text-xs text-gray-500">{doc.tipo} • {doc.size} • {doc.fecha}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button size="sm" variant="ghost">
                          <Download className="w-4 h-4" />
                        </Button>
                        <Button size="sm" variant="ghost" className="text-red-600 hover:text-red-700">
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* TAB: HORARIOS */}
          <TabsContent value="horarios" className="space-y-4 mt-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-lg">Horario Asignado</CardTitle>
                <Button size="sm" variant="outline">
                  <Edit className="w-4 h-4 mr-2" />
                  Modificar
                </Button>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {horariosMock.map((horario, idx) => (
                    <div key={idx} className={`flex items-center justify-between p-3 border rounded-lg ${horario.entrada === 'Descanso' ? 'bg-gray-50' : 'bg-white'}`}>
                      <div className="flex items-center gap-4 flex-1">
                        <div className="w-24">
                          <p className="font-medium text-sm">{horario.dia}</p>
                        </div>
                        <div className="flex items-center gap-4 flex-1">
                          {horario.entrada === 'Descanso' ? (
                            <Badge variant="outline" className="bg-gray-100">Descanso</Badge>
                          ) : (
                            <>
                              <div>
                                <p className="text-xs text-gray-500">Entrada</p>
                                <p className="text-sm font-medium">{horario.entrada}</p>
                              </div>
                              <div>
                                <p className="text-xs text-gray-500">Salida</p>
                                <p className="text-sm font-medium">{horario.salida}</p>
                              </div>
                              <div>
                                <p className="text-xs text-gray-500">Total</p>
                                <Badge className="bg-blue-600">{horario.horas}h</Badge>
                              </div>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <p className="text-sm font-medium text-blue-900">Total Semanal: 38 horas</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* TAB: FICHAJES */}
          <TabsContent value="fichajes" className="space-y-4 mt-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Registro de Fichajes</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {fichajesMock.map((fichaje, idx) => (
                    <div key={idx} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-4 flex-1">
                        <div className="w-32">
                          <p className="text-sm font-medium">{fichaje.fecha}</p>
                        </div>
                        <div className="flex items-center gap-4">
                          <div>
                            <p className="text-xs text-gray-500">Entrada</p>
                            <p className="text-sm font-medium">{fichaje.entrada}</p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500">Salida</p>
                            <p className="text-sm font-medium">{fichaje.salida}</p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500">Total</p>
                            <p className="text-sm font-medium">{fichaje.total}</p>
                          </div>
                        </div>
                      </div>
                      <Badge className={
                        fichaje.estado === 'Completo' ? 'bg-green-600' :
                        fichaje.estado === 'Retraso' ? 'bg-orange-600' :
                        'bg-gray-600'
                      }>
                        {fichaje.estado}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* TAB: HISTORIAL */}
          <TabsContent value="historial" className="space-y-4 mt-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Historial de Cambios</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="relative">
                  <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gray-200"></div>
                  <div className="space-y-4">
                    {historialMock.map((item, idx) => (
                      <div key={idx} className="relative pl-12">
                        <div className="absolute left-0 w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center border-4 border-white">
                          <History className="w-4 h-4 text-blue-600" />
                        </div>
                        <div className="p-4 border rounded-lg bg-white">
                          <div className="flex items-start justify-between mb-1">
                            <p className="font-medium text-sm">{item.accion}</p>
                            <p className="text-xs text-gray-500">{item.fecha}</p>
                          </div>
                          <p className="text-sm text-gray-600">{item.detalle}</p>
                          <p className="text-xs text-gray-500 mt-2">Por: {item.usuario}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
