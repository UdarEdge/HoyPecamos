/**
 * 🔌 INTEGRACIONES DE CANALES
 * 
 * Sistema unificado para gestionar integraciones de todos los canales de venta.
 * Agrupa integraciones por canal (Marketplace, WhatsApp, etc.)
 */

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Badge } from '../ui/badge';
import { Switch } from '../ui/switch';
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
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '../ui/accordion';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../ui/table';
import {
  Settings,
  CheckCircle2,
  XCircle,
  AlertCircle,
  RefreshCw,
  Trash2,
  Eye,
  EyeOff,
  Copy,
  ExternalLink,
  Zap,
  Clock,
  TrendingUp,
  Package,
  Activity,
  Link as LinkIcon,
  Unlink,
  Info,
  AlertTriangle,
  ChevronRight
} from 'lucide-react';
import { toast } from 'sonner@2.0.3';
import {
  useCanalesVenta,
  type CanalVenta,
  type IntegracionCanal
} from '../../utils/canales-venta';

// ============================================================================
// PLANTILLAS DE INTEGRACIONES POR CANAL
// ============================================================================

const PLANTILLAS_INTEGRACIONES: Record<string, {
  nombre: string;
  proveedor: string;
  logo?: string;
  campos_config: {
    nombre: string;
    tipo: 'text' | 'password' | 'url' | 'select';
    placeholder?: string;
    requerido: boolean;
    descripcion?: string;
    opciones?: string[];
  }[];
}[]> = {
  'marketplace': [
    {
      nombre: 'Glovo',
      proveedor: 'Glovo',
      campos_config: [
        { nombre: 'api_key', tipo: 'password', placeholder: 'sk_live_...', requerido: true, descripcion: 'Clave API de Glovo Partners' },
        { nombre: 'store_id', tipo: 'text', placeholder: 'STORE-123456', requerido: true, descripcion: 'ID de tu tienda en Glovo' },
        { nombre: 'webhook_secret', tipo: 'password', placeholder: 'whsec_...', requerido: false, descripcion: 'Secret para verificar webhooks' }
      ]
    },
    {
      nombre: 'Uber Eats',
      proveedor: 'Uber',
      campos_config: [
        { nombre: 'client_id', tipo: 'text', placeholder: 'CLIENT_ID', requerido: true, descripcion: 'Client ID de Uber Eats API' },
        { nombre: 'client_secret', tipo: 'password', placeholder: 'CLIENT_SECRET', requerido: true, descripcion: 'Client Secret' },
        { nombre: 'store_id', tipo: 'text', placeholder: 'STORE-UUID', requerido: true, descripcion: 'UUID de tu restaurante' }
      ]
    },
    {
      nombre: 'Just Eat',
      proveedor: 'Just Eat',
      campos_config: [
        { nombre: 'api_key', tipo: 'password', placeholder: 'API_KEY', requerido: true, descripcion: 'API Key de Just Eat' },
        { nombre: 'restaurant_id', tipo: 'text', placeholder: 'REST-123', requerido: true, descripcion: 'ID del restaurante' }
      ]
    },
    {
      nombre: 'Deliveroo',
      proveedor: 'Deliveroo',
      campos_config: [
        { nombre: 'api_key', tipo: 'password', placeholder: 'API_KEY', requerido: true, descripcion: 'API Key de Deliveroo' },
        { nombre: 'location_id', tipo: 'text', placeholder: 'LOC-123', requerido: true, descripcion: 'ID de ubicación' }
      ]
    }
  ],
  'whatsapp': [
    {
      nombre: 'WhatsApp Business API',
      proveedor: 'Meta',
      campos_config: [
        { nombre: 'phone_number_id', tipo: 'text', placeholder: '123456789', requerido: true, descripcion: 'ID del número de teléfono' },
        { nombre: 'access_token', tipo: 'password', placeholder: 'EAA...', requerido: true, descripcion: 'Token de acceso permanente' },
        { nombre: 'verify_token', tipo: 'password', placeholder: 'mi_token_verificacion', requerido: true, descripcion: 'Token para verificar webhooks' },
        { nombre: 'webhook_url', tipo: 'url', placeholder: 'https://...', requerido: false, descripcion: 'URL de tu webhook (auto-generada)' }
      ]
    },
    {
      nombre: 'Twilio WhatsApp',
      proveedor: 'Twilio',
      campos_config: [
        { nombre: 'account_sid', tipo: 'text', placeholder: 'AC...', requerido: true, descripcion: 'Account SID de Twilio' },
        { nombre: 'auth_token', tipo: 'password', placeholder: 'AUTH_TOKEN', requerido: true, descripcion: 'Auth Token' },
        { nombre: 'whatsapp_number', tipo: 'text', placeholder: '+14155238886', requerido: true, descripcion: 'Número WhatsApp de Twilio' }
      ]
    },
    {
      nombre: 'Wassenger',
      proveedor: 'Wassenger',
      campos_config: [
        { nombre: 'api_key', tipo: 'password', placeholder: 'wapi_...', requerido: true, descripcion: 'API Key de Wassenger' },
        { nombre: 'device_id', tipo: 'text', placeholder: 'DEVICE-123', requerido: true, descripcion: 'ID del dispositivo conectado' }
      ]
    }
  ],
  'email': [
    {
      nombre: 'SMTP Personalizado',
      proveedor: 'SMTP',
      campos_config: [
        { nombre: 'smtp_host', tipo: 'text', placeholder: 'smtp.gmail.com', requerido: true, descripcion: 'Servidor SMTP' },
        { nombre: 'smtp_port', tipo: 'text', placeholder: '587', requerido: true, descripcion: 'Puerto SMTP' },
        { nombre: 'smtp_user', tipo: 'text', placeholder: 'pedidos@tuempresa.com', requerido: true, descripcion: 'Usuario SMTP' },
        { nombre: 'smtp_password', tipo: 'password', placeholder: 'PASSWORD', requerido: true, descripcion: 'Contraseña SMTP' },
        { nombre: 'uso_ssl', tipo: 'select', opciones: ['true', 'false'], requerido: true, descripcion: 'Usar SSL/TLS' }
      ]
    }
  ],
  'telefonico': [
    {
      nombre: 'Centralita VoIP',
      proveedor: 'VoIP',
      campos_config: [
        { nombre: 'sip_server', tipo: 'text', placeholder: 'sip.proveedor.com', requerido: true, descripcion: 'Servidor SIP' },
        { nombre: 'extension', tipo: 'text', placeholder: '1001', requerido: true, descripcion: 'Extensión' },
        { nombre: 'password', tipo: 'password', placeholder: 'PASSWORD', requerido: true, descripcion: 'Contraseña SIP' }
      ]
    }
  ]
};

// ============================================================================
// COMPONENTE PRINCIPAL
// ============================================================================

export function IntegracionesCanales() {
  const {
    canales,
    canalesActivos,
    integraciones,
    actualizarIntegracion,
    conectarIntegracion,
    desconectarIntegracion,
    refrescar
  } = useCanalesVenta();

  const [canalSeleccionado, setCanalSeleccionado] = useState<string>('marketplace');
  const [modalConfigOpen, setModalConfigOpen] = useState(false);
  const [integracionEditando, setIntegracionEditando] = useState<IntegracionCanal | null>(null);
  const [formConfig, setFormConfig] = useState<Record<string, any>>({});
  const [mostrarSecretos, setMostrarSecretos] = useState<Record<string, boolean>>({});
  const [modalLogsOpen, setModalLogsOpen] = useState(false);
  const [logsSeleccionados, setLogsSeleccionados] = useState<any[]>([]);

  // Filtrar canales que requieren integración
  const canalesConIntegraciones = canalesActivos.filter(c => c.requiere_integracion);

  // Obtener integraciones del canal seleccionado
  const integracionesCanal = integraciones.filter(i => {
    const canal = canales.find(c => c.id === i.canal_id);
    return canal?.slug === canalSeleccionado;
  });

  // Handlers
  const handleAbrirConfig = (integracion: IntegracionCanal) => {
    setIntegracionEditando(integracion);
    setFormConfig(integracion.config || {});
    setModalConfigOpen(true);
  };

  const handleGuardarConfig = () => {
    if (!integracionEditando) return;

    try {
      actualizarIntegracion(integracionEditando.id, {
        config: formConfig,
        estado: 'configurando'
      });

      toast.success(`Configuración de ${integracionEditando.nombre} guardada`);
      setModalConfigOpen(false);
      setIntegracionEditando(null);
      setFormConfig({});
    } catch (error: any) {
      toast.error(error.message || 'Error al guardar configuración');
    }
  };

  const handleProbarConexion = async (integracion: IntegracionCanal) => {
    toast.info(`🔄 Probando conexión con ${integracion.nombre}...`);

    // Simular prueba de conexión
    setTimeout(() => {
      const exito = Math.random() > 0.3; // 70% de éxito

      if (exito) {
        actualizarIntegracion(integracion.id, {
          estado: 'conectada',
          estadisticas: {
            ...integracion.estadisticas,
            ultima_sincronizacion: new Date().toISOString()
          }
        });
        toast.success(`✅ Conexión exitosa con ${integracion.nombre}`);
      } else {
        actualizarIntegracion(integracion.id, {
          estado: 'error'
        });
        toast.error(`❌ Error de conexión con ${integracion.nombre}`);
      }
      refrescar();
    }, 2000);
  };

  const handleToggleIntegracion = (integracion: IntegracionCanal) => {
    if (integracion.activo) {
      desconectarIntegracion(integracion.id);
      toast.success(`⏸️ ${integracion.nombre} desconectado`);
    } else {
      if (integracion.estado === 'conectada') {
        conectarIntegracion(integracion.id);
        toast.success(`✅ ${integracion.nombre} conectado`);
      } else {
        toast.error('Primero debes configurar y probar la conexión');
      }
    }
  };

  const handleVerLogs = (integracion: IntegracionCanal) => {
    setLogsSeleccionados(integracion.logs || []);
    setModalLogsOpen(true);
  };

  const handleCopiarWebhook = (integracion: IntegracionCanal) => {
    const webhookUrl = `https://api.udaredge.com/webhooks/${integracion.canal_id}/${integracion.id}`;
    navigator.clipboard.writeText(webhookUrl);
    toast.success('📋 URL de webhook copiada al portapapeles');
  };

  // Calcular estadísticas generales
  const estadisticasGenerales = {
    total: integraciones.length,
    conectadas: integraciones.filter(i => i.estado === 'conectada' && i.activo).length,
    desconectadas: integraciones.filter(i => i.estado === 'desconectada' || !i.activo).length,
    errores: integraciones.filter(i => i.estado === 'error').length,
    pedidosHoy: integraciones.reduce((sum, i) => sum + (i.estadisticas?.pedidos_recibidos_hoy || 0), 0),
    pedidosMes: integraciones.reduce((sum, i) => sum + (i.estadisticas?.pedidos_recibidos_mes || 0), 0)
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl mb-1">Integraciones de Canales</h2>
        <p className="text-sm text-gray-600">
          Conecta tus canales de venta con plataformas externas para recibir pedidos automáticamente
        </p>
      </div>

      {/* Estadísticas Generales */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total</p>
                <p className="text-3xl mt-1">{estadisticasGenerales.total}</p>
              </div>
              <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
                <Package className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Conectadas</p>
                <p className="text-3xl mt-1">{estadisticasGenerales.conectadas}</p>
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
                <p className="text-sm text-gray-600">Inactivas</p>
                <p className="text-3xl mt-1">{estadisticasGenerales.desconectadas}</p>
              </div>
              <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center">
                <XCircle className="w-6 h-6 text-gray-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Pedidos Hoy</p>
                <p className="text-3xl mt-1">{estadisticasGenerales.pedidosHoy}</p>
              </div>
              <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center">
                <Activity className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Mes Actual</p>
                <p className="text-3xl mt-1">{estadisticasGenerales.pedidosMes}</p>
              </div>
              <div className="w-12 h-12 rounded-full bg-orange-100 flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-orange-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs por Canal */}
      <Card>
        <CardHeader>
          <CardTitle>Integraciones por Canal</CardTitle>
          <CardDescription>
            Selecciona un canal para ver y configurar sus integraciones disponibles
          </CardDescription>
        </CardHeader>
        <CardContent>
          {canalesConIntegraciones.length === 0 ? (
            <div className="text-center py-12">
              <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 mb-2">No hay canales que requieran integraciones</p>
              <p className="text-sm text-gray-500">
                Crea un canal externo en "Canales de Venta" para comenzar
              </p>
            </div>
          ) : (
            <Tabs value={canalSeleccionado} onValueChange={setCanalSeleccionado}>
              <TabsList className="mb-6">
                {canalesConIntegraciones.map(canal => (
                  <TabsTrigger key={canal.slug} value={canal.slug}>
                    <span className="mr-2">{canal.icono}</span>
                    {canal.nombre_corto}
                  </TabsTrigger>
                ))}
              </TabsList>

              {canalesConIntegraciones.map(canal => (
                <TabsContent key={canal.slug} value={canal.slug} className="space-y-4">
                  {/* Lista de Integraciones del Canal */}
                  {integracionesCanal.length === 0 ? (
                    <div className="text-center py-8 border-2 border-dashed border-gray-300 rounded-lg">
                      <Package className="w-10 h-10 text-gray-400 mx-auto mb-3" />
                      <p className="text-gray-600 mb-1">No hay integraciones para este canal</p>
                      <p className="text-sm text-gray-500">Las integraciones se crean automáticamente</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {integracionesCanal.map(integracion => (
                        <Card key={integracion.id} className="border-2">
                          <CardContent className="pt-6">
                            <div className="flex items-start justify-between">
                              {/* Info de la Integración */}
                              <div className="flex items-start gap-4 flex-1">
                                <div className="w-12 h-12 rounded-lg bg-gray-100 flex items-center justify-center text-xl">
                                  {integracion.proveedor === 'Glovo' ? '🛵' :
                                   integracion.proveedor === 'Uber' ? '🚗' :
                                   integracion.proveedor === 'Just Eat' ? '🍔' :
                                   integracion.proveedor === 'Meta' ? '💬' :
                                   integracion.proveedor === 'Twilio' ? '📱' :
                                   '🔌'}
                                </div>
                                <div className="flex-1">
                                  <div className="flex items-center gap-3 mb-2">
                                    <h3 className="text-lg font-semibold">{integracion.nombre}</h3>
                                    <Badge
                                      variant={
                                        integracion.estado === 'conectada' && integracion.activo ? 'default' :
                                        integracion.estado === 'error' ? 'destructive' :
                                        'outline'
                                      }
                                      className={
                                        integracion.estado === 'conectada' && integracion.activo
                                          ? 'bg-green-100 text-green-800 border-green-200'
                                          : ''
                                      }
                                    >
                                      {integracion.estado === 'conectada' && integracion.activo ? (
                                        <>
                                          <CheckCircle2 className="w-3 h-3 mr-1" />
                                          Conectada
                                        </>
                                      ) : integracion.estado === 'error' ? (
                                        <>
                                          <XCircle className="w-3 h-3 mr-1" />
                                          Error
                                        </>
                                      ) : integracion.estado === 'configurando' ? (
                                        <>
                                          <Settings className="w-3 h-3 mr-1" />
                                          Configurando
                                        </>
                                      ) : (
                                        <>
                                          <AlertCircle className="w-3 h-3 mr-1" />
                                          Desconectada
                                        </>
                                      )}
                                    </Badge>
                                  </div>

                                  <p className="text-sm text-gray-600 mb-3">
                                    Proveedor: {integracion.proveedor} • Tipo: {integracion.tipo.toUpperCase()}
                                  </p>

                                  {/* Estadísticas */}
                                  {integracion.estadisticas && (
                                    <div className="grid grid-cols-4 gap-4 p-3 bg-gray-50 rounded-lg">
                                      <div>
                                        <p className="text-xs text-gray-500">Pedidos Hoy</p>
                                        <p className="text-lg font-semibold">
                                          {integracion.estadisticas.pedidos_recibidos_hoy || 0}
                                        </p>
                                      </div>
                                      <div>
                                        <p className="text-xs text-gray-500">Pedidos Mes</p>
                                        <p className="text-lg font-semibold">
                                          {integracion.estadisticas.pedidos_recibidos_mes || 0}
                                        </p>
                                      </div>
                                      <div>
                                        <p className="text-xs text-gray-500">Tasa Éxito</p>
                                        <p className="text-lg font-semibold">
                                          {integracion.estadisticas.tasa_exito || 0}%
                                        </p>
                                      </div>
                                      <div>
                                        <p className="text-xs text-gray-500">Última Sync</p>
                                        <p className="text-xs font-medium">
                                          {integracion.estadisticas.ultima_sincronizacion
                                            ? new Date(integracion.estadisticas.ultima_sincronizacion).toLocaleString('es-ES', {
                                                day: '2-digit',
                                                month: '2-digit',
                                                hour: '2-digit',
                                                minute: '2-digit'
                                              })
                                            : 'Nunca'}
                                        </p>
                                      </div>
                                    </div>
                                  )}
                                </div>
                              </div>

                              {/* Acciones */}
                              <div className="flex flex-col items-end gap-3">
                                <Switch
                                  checked={integracion.activo}
                                  onCheckedChange={() => handleToggleIntegracion(integracion)}
                                />

                                <div className="flex gap-2">
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleAbrirConfig(integracion)}
                                  >
                                    <Settings className="w-4 h-4 mr-1" />
                                    Configurar
                                  </Button>

                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleProbarConexion(integracion)}
                                    disabled={!integracion.config || Object.keys(integracion.config).length === 0}
                                  >
                                    <RefreshCw className="w-4 h-4 mr-1" />
                                    Probar
                                  </Button>

                                  {integracion.tipo === 'webhook' && (
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={() => handleCopiarWebhook(integracion)}
                                    >
                                      <Copy className="w-4 h-4" />
                                    </Button>
                                  )}
                                </div>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}
                </TabsContent>
              ))}
            </Tabs>
          )}
        </CardContent>
      </Card>

      {/* Modal Configuración */}
      <Dialog open={modalConfigOpen} onOpenChange={setModalConfigOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              Configurar {integracionEditando?.nombre}
            </DialogTitle>
            <DialogDescription>
              Introduce las credenciales y configuración de la integración
            </DialogDescription>
          </DialogHeader>

          {integracionEditando && (
            <div className="space-y-6 py-4">
              {/* Información de ayuda */}
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex gap-3">
                  <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                  <div className="text-sm">
                    <p className="font-medium text-blue-900 mb-1">
                      ¿Cómo obtener las credenciales de {integracionEditando.proveedor}?
                    </p>
                    <p className="text-blue-700">
                      Accede al panel de desarrolladores de {integracionEditando.proveedor} y genera
                      las claves API necesarias. Todos los campos son encriptados y almacenados de forma segura.
                    </p>
                  </div>
                </div>
              </div>

              {/* Campos de configuración */}
              {PLANTILLAS_INTEGRACIONES[canalSeleccionado]
                ?.find(p => p.nombre === integracionEditando.nombre)
                ?.campos_config.map((campo, index) => (
                  <div key={index} className="space-y-2">
                    <Label htmlFor={campo.nombre}>
                      {campo.nombre.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                      {campo.requerido && <span className="text-red-500 ml-1">*</span>}
                    </Label>
                    
                    {campo.tipo === 'select' ? (
                      <select
                        id={campo.nombre}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                        value={formConfig[campo.nombre] || ''}
                        onChange={(e) => setFormConfig({ ...formConfig, [campo.nombre]: e.target.value })}
                      >
                        <option value="">Seleccionar...</option>
                        {campo.opciones?.map(opcion => (
                          <option key={opcion} value={opcion}>{opcion}</option>
                        ))}
                      </select>
                    ) : (
                      <div className="relative">
                        <Input
                          id={campo.nombre}
                          type={
                            campo.tipo === 'password' && !mostrarSecretos[campo.nombre]
                              ? 'password'
                              : 'text'
                          }
                          placeholder={campo.placeholder}
                          value={formConfig[campo.nombre] || ''}
                          onChange={(e) => setFormConfig({ ...formConfig, [campo.nombre]: e.target.value })}
                        />
                        {campo.tipo === 'password' && (
                          <button
                            type="button"
                            className="absolute right-3 top-1/2 -translate-y-1/2"
                            onClick={() => setMostrarSecretos({
                              ...mostrarSecretos,
                              [campo.nombre]: !mostrarSecretos[campo.nombre]
                            })}
                          >
                            {mostrarSecretos[campo.nombre] ? (
                              <EyeOff className="w-4 h-4 text-gray-500" />
                            ) : (
                              <Eye className="w-4 h-4 text-gray-500" />
                            )}
                          </button>
                        )}
                      </div>
                    )}
                    
                    {campo.descripcion && (
                      <p className="text-xs text-gray-500">{campo.descripcion}</p>
                    )}
                  </div>
                ))}

              {/* URL de Webhook (si aplica) */}
              {integracionEditando.tipo === 'webhook' && (
                <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
                  <Label className="mb-2 block">URL de Webhook (copiar en la plataforma)</Label>
                  <div className="flex gap-2">
                    <Input
                      value={`https://api.udaredge.com/webhooks/${integracionEditando.canal_id}/${integracionEditando.id}`}
                      readOnly
                      className="font-mono text-sm"
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleCopiarWebhook(integracionEditando)}
                    >
                      <Copy className="w-4 h-4" />
                    </Button>
                  </div>
                  <p className="text-xs text-gray-500 mt-2">
                    Configura esta URL en el panel de {integracionEditando.proveedor} para recibir pedidos automáticamente
                  </p>
                </div>
              )}
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setModalConfigOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleGuardarConfig} className="bg-[#ED1C24] hover:bg-[#C91820]">
              Guardar Configuración
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
