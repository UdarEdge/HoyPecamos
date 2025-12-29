/**
 * 🎯 CONFIGURACIÓN DE CANALES DE VENTA
 * 
 * Permite al gerente gestionar los canales de venta disponibles
 * (TPV, Online, WhatsApp, Marketplace, Telefónico, etc.)
 */

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Badge } from '../ui/badge';
import { Switch } from '../ui/switch';
import { Textarea } from '../ui/textarea';
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '../ui/alert-dialog';
import {
  Plus,
  Edit,
  Trash2,
  GripVertical,
  CheckCircle2,
  XCircle,
  Settings,
  ArrowUp,
  ArrowDown,
  AlertTriangle,
  ShoppingCart,
  Link as LinkIcon
} from 'lucide-react';
import { toast } from 'sonner@2.0.3';
import {
  useCanalesVenta,
  PLANTILLAS_CANALES,
  type CanalVenta
} from '../../utils/canales-venta';

export function ConfiguracionCanalesVenta() {
  const {
    canales,
    loading,
    crearCanal,
    actualizarCanal,
    eliminarCanal,
    reordenarCanales
  } = useCanalesVenta();

  const [modalNuevoOpen, setModalNuevoOpen] = useState(false);
  const [modalEditarOpen, setModalEditarOpen] = useState(false);
  const [canalSeleccionado, setCanalSeleccionado] = useState<CanalVenta | null>(null);
  const [alertEliminarOpen, setAlertEliminarOpen] = useState(false);
  const [canalAEliminar, setCanalAEliminar] = useState<CanalVenta | null>(null);

  // Form para nuevo canal
  const [formNombre, setFormNombre] = useState('');
  const [formNombreCorto, setFormNombreCorto] = useState('');
  const [formSlug, setFormSlug] = useState('');
  const [formIcono, setFormIcono] = useState('');
  const [formColor, setFormColor] = useState('#10b981');
  const [formDescripcion, setFormDescripcion] = useState('');
  const [formRequiereIntegracion, setFormRequiereIntegracion] = useState(false);
  const [plantillaSeleccionada, setPlantillaSeleccionada] = useState<string>('');

  // Handlers
  const handleAbrirNuevoCanal = () => {
    limpiarFormulario();
    setModalNuevoOpen(true);
  };

  const handleAbrirEditarCanal = (canal: CanalVenta) => {
    setCanalSeleccionado(canal);
    setFormNombre(canal.nombre);
    setFormNombreCorto(canal.nombre_corto);
    setFormSlug(canal.slug);
    setFormIcono(canal.icono);
    setFormColor(canal.color);
    setFormDescripcion(canal.descripcion || '');
    setFormRequiereIntegracion(canal.requiere_integracion);
    setModalEditarOpen(true);
  };

  const handleSeleccionarPlantilla = (plantillaId: string) => {
    const plantilla = PLANTILLAS_CANALES.find((p, i) => i.toString() === plantillaId);
    if (plantilla) {
      setFormNombre(plantilla.nombre);
      setFormNombreCorto(plantilla.nombre_corto);
      setFormSlug(plantilla.slug);
      setFormIcono(plantilla.icono);
      setFormColor(plantilla.color);
      setFormDescripcion(plantilla.descripcion || '');
      setFormRequiereIntegracion(plantilla.requiere_integracion);
      setPlantillaSeleccionada(plantillaId);
    }
  };

  const limpiarFormulario = () => {
    setFormNombre('');
    setFormNombreCorto('');
    setFormSlug('');
    setFormIcono('');
    setFormColor('#10b981');
    setFormDescripcion('');
    setFormRequiereIntegracion(false);
    setPlantillaSeleccionada('');
  };

  const handleCrearCanal = () => {
    if (!formNombre || !formNombreCorto || !formSlug) {
      toast.error('Por favor completa todos los campos obligatorios');
      return;
    }

    // Verificar que el slug no exista
    if (canales.some(c => c.slug === formSlug)) {
      toast.error('Ya existe un canal con ese slug');
      return;
    }

    try {
      const plantilla = plantillaSeleccionada 
        ? PLANTILLAS_CANALES[parseInt(plantillaSeleccionada)]
        : null;

      crearCanal({
        nombre: formNombre,
        nombre_corto: formNombreCorto,
        slug: formSlug,
        icono: formIcono || '📊',
        color: formColor,
        activo: true,
        orden: canales.length + 1,
        tipo: 'externo',
        requiere_integracion: formRequiereIntegracion,
        descripcion: formDescripcion,
        integraciones_disponibles: plantilla?.integraciones_disponibles || []
      });

      toast.success(`✅ Canal "${formNombre}" creado correctamente`);
      setModalNuevoOpen(false);
      limpiarFormulario();
    } catch (error: any) {
      toast.error(error.message || 'Error al crear canal');
    }
  };

  const handleActualizarCanal = () => {
    if (!canalSeleccionado) return;

    if (!formNombre || !formNombreCorto || !formSlug) {
      toast.error('Por favor completa todos los campos obligatorios');
      return;
    }

    try {
      actualizarCanal(canalSeleccionado.id, {
        nombre: formNombre,
        nombre_corto: formNombreCorto,
        slug: formSlug,
        icono: formIcono,
        color: formColor,
        descripcion: formDescripcion,
        requiere_integracion: formRequiereIntegracion
      });

      toast.success(`✅ Canal "${formNombre}" actualizado correctamente`);
      setModalEditarOpen(false);
      setCanalSeleccionado(null);
      limpiarFormulario();
    } catch (error: any) {
      toast.error(error.message || 'Error al actualizar canal');
    }
  };

  const handleToggleActivo = (canal: CanalVenta) => {
    if (canal.tipo === 'nativo' && canal.activo) {
      toast.error('No se pueden desactivar canales nativos del sistema');
      return;
    }

    try {
      actualizarCanal(canal.id, { activo: !canal.activo });
      toast.success(
        `${!canal.activo ? '✅ Activado' : '⏸️ Desactivado'} canal "${canal.nombre_corto}"`
      );
    } catch (error: any) {
      toast.error(error.message || 'Error al cambiar estado');
    }
  };

  const handleConfirmarEliminar = (canal: CanalVenta) => {
    setCanalAEliminar(canal);
    setAlertEliminarOpen(true);
  };

  const handleEliminarCanal = () => {
    if (!canalAEliminar) return;

    try {
      eliminarCanal(canalAEliminar.id);
      toast.success(`🗑️ Canal "${canalAEliminar.nombre_corto}" eliminado`);
      setAlertEliminarOpen(false);
      setCanalAEliminar(null);
    } catch (error: any) {
      toast.error(error.message || 'Error al eliminar canal');
    }
  };

  const handleMoverCanal = (index: number, direccion: 'up' | 'down') => {
    const nuevosCanales = [...canales];
    const targetIndex = direccion === 'up' ? index - 1 : index + 1;

    if (targetIndex < 0 || targetIndex >= nuevosCanales.length) return;

    // Intercambiar
    [nuevosCanales[index], nuevosCanales[targetIndex]] = 
    [nuevosCanales[targetIndex], nuevosCanales[index]];

    reordenarCanales(nuevosCanales);
    toast.success('✅ Orden actualizado');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#ED1C24] mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando canales...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl mb-1">Canales de Venta</h2>
          <p className="text-sm text-gray-600">
            Gestiona los canales donde recibes pedidos y vendes tus productos
          </p>
        </div>
        <Button onClick={handleAbrirNuevoCanal} className="bg-[#ED1C24] hover:bg-[#C91820]">
          <Plus className="w-4 h-4 mr-2" />
          Añadir Canal
        </Button>
      </div>

      {/* Estadísticas rápidas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Canales</p>
                <p className="text-3xl mt-1">{canales.length}</p>
              </div>
              <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
                <ShoppingCart className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Canales Activos</p>
                <p className="text-3xl mt-1">{canales.filter(c => c.activo).length}</p>
              </div>
              <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
                <CheckCircle2 className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Con Integraciones</p>
                <p className="text-3xl mt-1">
                  {canales.filter(c => c.integracion_activa).length}
                </p>
              </div>
              <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center">
                <LinkIcon className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabla de canales */}
      <Card>
        <CardHeader>
          <CardTitle>Lista de Canales</CardTitle>
          <CardDescription>
            Arrastra para reordenar, activa/desactiva según necesites
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12">Orden</TableHead>
                <TableHead>Canal</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Integración</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {canales.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                    No hay canales configurados
                  </TableCell>
                </TableRow>
              ) : (
                canales.map((canal, index) => (
                  <TableRow key={canal.id}>
                    {/* Orden */}
                    <TableCell>
                      <div className="flex flex-col gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 w-6 p-0"
                          onClick={() => handleMoverCanal(index, 'up')}
                          disabled={index === 0}
                        >
                          <ArrowUp className="w-3 h-3" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 w-6 p-0"
                          onClick={() => handleMoverCanal(index, 'down')}
                          disabled={index === canales.length - 1}
                        >
                          <ArrowDown className="w-3 h-3" />
                        </Button>
                      </div>
                    </TableCell>

                    {/* Canal */}
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div 
                          className="w-10 h-10 rounded-lg flex items-center justify-center text-xl"
                          style={{ backgroundColor: `${canal.color}20` }}
                        >
                          {canal.icono}
                        </div>
                        <div>
                          <p className="font-medium">{canal.nombre}</p>
                          <p className="text-xs text-gray-500">{canal.descripcion}</p>
                        </div>
                      </div>
                    </TableCell>

                    {/* Tipo */}
                    <TableCell>
                      <Badge variant={canal.tipo === 'nativo' ? 'default' : 'outline'}>
                        {canal.tipo === 'nativo' ? 'Nativo' : 'Externo'}
                      </Badge>
                    </TableCell>

                    {/* Estado */}
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Switch
                          checked={canal.activo}
                          onCheckedChange={() => handleToggleActivo(canal)}
                          disabled={canal.tipo === 'nativo'}
                        />
                        <span className="text-sm">
                          {canal.activo ? (
                            <Badge className="bg-green-100 text-green-800 border-green-200">
                              Activo
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="text-gray-500">
                              Inactivo
                            </Badge>
                          )}
                        </span>
                      </div>
                    </TableCell>

                    {/* Integración */}
                    <TableCell>
                      {canal.requiere_integracion ? (
                        canal.integracion_activa ? (
                          <Badge className="bg-green-100 text-green-800 border-green-200">
                            <CheckCircle2 className="w-3 h-3 mr-1" />
                            Conectada
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="text-orange-600 border-orange-300">
                            <AlertTriangle className="w-3 h-3 mr-1" />
                            Sin conectar
                          </Badge>
                        )
                      ) : (
                        <Badge variant="outline" className="text-gray-500">
                          No requiere
                        </Badge>
                      )}
                    </TableCell>

                    {/* Acciones */}
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleAbrirEditarCanal(canal)}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleConfirmarEliminar(canal)}
                          disabled={canal.tipo === 'nativo'}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50 disabled:opacity-50"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Modal Nuevo Canal */}
      <Dialog open={modalNuevoOpen} onOpenChange={setModalNuevoOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Añadir Nuevo Canal de Venta</DialogTitle>
            <DialogDescription>
              Crea un nuevo canal personalizado o usa una plantilla predefinida
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-4">
            {/* Selección de plantilla */}
            <div className="space-y-2">
              <Label>Plantilla (opcional)</Label>
              <Select value={plantillaSeleccionada} onValueChange={handleSeleccionarPlantilla}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona una plantilla o crea personalizado" />
                </SelectTrigger>
                <SelectContent>
                  {PLANTILLAS_CANALES.map((plantilla, index) => (
                    <SelectItem key={index} value={index.toString()}>
                      {plantilla.icono} {plantilla.nombre}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Nombre */}
            <div className="space-y-2">
              <Label htmlFor="nombre">Nombre Completo *</Label>
              <Input
                id="nombre"
                value={formNombre}
                onChange={(e) => setFormNombre(e.target.value)}
                placeholder="Ej: WhatsApp Business"
              />
            </div>

            {/* Nombre Corto */}
            <div className="space-y-2">
              <Label htmlFor="nombre-corto">Nombre Corto *</Label>
              <Input
                id="nombre-corto"
                value={formNombreCorto}
                onChange={(e) => setFormNombreCorto(e.target.value)}
                placeholder="Ej: WhatsApp"
              />
            </div>

            {/* Slug */}
            <div className="space-y-2">
              <Label htmlFor="slug">Slug (identificador único) *</Label>
              <Input
                id="slug"
                value={formSlug}
                onChange={(e) => setFormSlug(e.target.value.toLowerCase().replace(/\s+/g, '-'))}
                placeholder="Ej: whatsapp"
              />
              <p className="text-xs text-gray-500">
                Se usa para filtros y URLs. Solo minúsculas y guiones.
              </p>
            </div>

            {/* Icono y Color */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="icono">Icono (emoji)</Label>
                <Input
                  id="icono"
                  value={formIcono}
                  onChange={(e) => setFormIcono(e.target.value)}
                  placeholder="📱"
                  maxLength={2}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="color">Color</Label>
                <div className="flex gap-2">
                  <Input
                    id="color"
                    type="color"
                    value={formColor}
                    onChange={(e) => setFormColor(e.target.value)}
                    className="w-20"
                  />
                  <Input
                    value={formColor}
                    onChange={(e) => setFormColor(e.target.value)}
                    placeholder="#10b981"
                  />
                </div>
              </div>
            </div>

            {/* Descripción */}
            <div className="space-y-2">
              <Label htmlFor="descripcion">Descripción</Label>
              <Textarea
                id="descripcion"
                value={formDescripcion}
                onChange={(e) => setFormDescripcion(e.target.value)}
                placeholder="Breve descripción del canal..."
                rows={3}
              />
            </div>

            {/* Requiere integración */}
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div>
                <Label>¿Requiere integración externa?</Label>
                <p className="text-xs text-gray-500 mt-1">
                  Marca si necesita conectarse a una API o servicio externo
                </p>
              </div>
              <Switch
                checked={formRequiereIntegracion}
                onCheckedChange={setFormRequiereIntegracion}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setModalNuevoOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleCrearCanal} className="bg-[#ED1C24] hover:bg-[#C91820]">
              Crear Canal
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal Editar Canal */}
      <Dialog open={modalEditarOpen} onOpenChange={setModalEditarOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Editar Canal de Venta</DialogTitle>
            <DialogDescription>
              Modifica la configuración del canal "{canalSeleccionado?.nombre}"
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-4">
            {/* Nombre */}
            <div className="space-y-2">
              <Label htmlFor="edit-nombre">Nombre Completo *</Label>
              <Input
                id="edit-nombre"
                value={formNombre}
                onChange={(e) => setFormNombre(e.target.value)}
              />
            </div>

            {/* Nombre Corto */}
            <div className="space-y-2">
              <Label htmlFor="edit-nombre-corto">Nombre Corto *</Label>
              <Input
                id="edit-nombre-corto"
                value={formNombreCorto}
                onChange={(e) => setFormNombreCorto(e.target.value)}
              />
            </div>

            {/* Slug */}
            <div className="space-y-2">
              <Label htmlFor="edit-slug">Slug *</Label>
              <Input
                id="edit-slug"
                value={formSlug}
                onChange={(e) => setFormSlug(e.target.value.toLowerCase().replace(/\s+/g, '-'))}
                disabled={canalSeleccionado?.tipo === 'nativo'}
              />
              {canalSeleccionado?.tipo === 'nativo' && (
                <p className="text-xs text-gray-500">
                  No se puede modificar el slug de canales nativos
                </p>
              )}
            </div>

            {/* Icono y Color */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-icono">Icono (emoji)</Label>
                <Input
                  id="edit-icono"
                  value={formIcono}
                  onChange={(e) => setFormIcono(e.target.value)}
                  maxLength={2}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-color">Color</Label>
                <div className="flex gap-2">
                  <Input
                    id="edit-color"
                    type="color"
                    value={formColor}
                    onChange={(e) => setFormColor(e.target.value)}
                    className="w-20"
                  />
                  <Input
                    value={formColor}
                    onChange={(e) => setFormColor(e.target.value)}
                  />
                </div>
              </div>
            </div>

            {/* Descripción */}
            <div className="space-y-2">
              <Label htmlFor="edit-descripcion">Descripción</Label>
              <Textarea
                id="edit-descripcion"
                value={formDescripcion}
                onChange={(e) => setFormDescripcion(e.target.value)}
                rows={3}
              />
            </div>

            {/* Requiere integración */}
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div>
                <Label>¿Requiere integración externa?</Label>
                <p className="text-xs text-gray-500 mt-1">
                  Marca si necesita conectarse a una API o servicio externo
                </p>
              </div>
              <Switch
                checked={formRequiereIntegracion}
                onCheckedChange={setFormRequiereIntegracion}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setModalEditarOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleActualizarCanal} className="bg-[#ED1C24] hover:bg-[#C91820]">
              Guardar Cambios
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* AlertDialog Eliminar */}
      <AlertDialog open={alertEliminarOpen} onOpenChange={setAlertEliminarOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar canal "{canalAEliminar?.nombre}"?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. Se eliminará el canal y todas sus configuraciones.
              {canalAEliminar?.integracion_activa && (
                <div className="mt-4 p-3 bg-orange-50 border border-orange-200 rounded-lg">
                  <p className="text-sm text-orange-800 flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4" />
                    Este canal tiene una integración activa que también se desconectará.
                  </p>
                </div>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleEliminarCanal}
              className="bg-red-600 hover:bg-red-700"
            >
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
