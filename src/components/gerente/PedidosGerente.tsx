/**
 * 📦 VISTA DE PEDIDOS PARA GERENTE
 * 
 * Vista completa de gestión de pedidos con filtros avanzados por empresa/marca/PDV.
 * Incluye visualización de todos los canales (App, TPV, Delivery externo).
 * 
 * ✨ Características:
 * - Filtros jerárquicos (Empresa > Marca > PDV)
 * - Filtros por columna (estilo Excel/Airtable)
 * - Vista por origen (App, TPV, Glovo, Just Eat, Uber Eats)
 * - Estadísticas en tiempo real
 * - Gestión de repartidores
 * - Exportación de datos
 * - Auto-refresh cada 30 segundos
 * - Header compacto optimizado para móvil
 */

import { useState, useMemo, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Badge } from '../ui/badge';
import { EmptyState } from '../ui/empty-state';
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../ui/table';
import { 
  Search,
  Eye,
  CheckCircle,
  Clock,
  Truck,
  Package,
  MapPin,
  LayoutGrid,
  LayoutList,
  Store,
  ShoppingCart,
  Smartphone,
  CreditCard,
  Bike,
  Download,
  Filter,
  TrendingUp,
  DollarSign,
  Users,
  AlertCircle,
  RefreshCw,
  ChevronDown,
  ChevronUp,
  MoreVertical,
  X,
  Settings,
  Globe
} from 'lucide-react';
import { toast } from 'sonner@2.0.3';
import { 
  obtenerPedidosFiltrados,
  type Pedido,
  type EstadoPedido,
  type OrigenPedido,
  type FiltrosPedidos
} from '../../services/pedidos.service';
import { ModalDetallePedido } from '../pedidos/ModalDetallePedido';
import { EMPRESAS, MARCAS, PUNTOS_VENTA } from '../../constants/empresaConfig';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { FiltroContextoJerarquico, SelectedContext } from './FiltroContextoJerarquico';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '../ui/collapsible';
import { Label } from '../ui/label';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '../ui/popover';
import { Checkbox } from '../ui/checkbox';

type VistaMode = 'tabla' | 'tarjetas';

// Tipos para filtros de columna
interface FiltrosColumna {
  numero: string;
  cliente: string;
  estados: EstadoPedido[];
  origenes: OrigenPedido[];
  totalMin: number | null;
  totalMax: number | null;
}

// ============================================================================
// COMPONENTE PRINCIPAL
// ============================================================================

export function PedidosGerente() {
  const [selectedContext, setSelectedContext] = useState<SelectedContext[]>([]);
  const [kpisExpanded, setKpisExpanded] = useState(false);
  const [vistaMode, setVistaMode] = useState<VistaMode>('tabla');
  const [pedidoSeleccionado, setPedidoSeleccionado] = useState<Pedido | null>(null);
  const [modalDetalle, setModalDetalle] = useState(false);
  const [pedidos, setPedidos] = useState<Pedido[]>([]);
  const [ultimaActualizacion, setUltimaActualizacion] = useState<Date>(new Date());
  
  // Filtros de columna
  const [filtrosColumna, setFiltrosColumna] = useState<FiltrosColumna>({
    numero: '',
    cliente: '',
    estados: [],
    origenes: [],
    totalMin: null,
    totalMax: null,
  });

  // Cargar pedidos al montar el componente
  useEffect(() => {
    cargarPedidos();
  }, [selectedContext]);

  // Auto-refresh cada 30 segundos
  useEffect(() => {
    const interval = setInterval(() => {
      cargarPedidos(true); // Silent refresh
    }, 30000);

    return () => clearInterval(interval);
  }, [selectedContext]);

  const cargarPedidos = (silent = false) => {
    try {
      // Construir filtros desde el contexto seleccionado
      const filtros: FiltrosPedidos = {};
      
      if (selectedContext.length > 0) {
        // Extraer IDs únicos de empresas, marcas y PDVs
        const empresaIds = [...new Set(selectedContext.map(ctx => ctx.empresa_id))];
        const marcaIds = [...new Set(selectedContext.filter(ctx => ctx.marca_id).map(ctx => ctx.marca_id!))];
        const puntoVentaIds = [...new Set(selectedContext.filter(ctx => ctx.punto_venta_id).map(ctx => ctx.punto_venta_id!))];
        
        if (empresaIds.length > 0) filtros.empresaIds = empresaIds;
        if (marcaIds.length > 0) filtros.marcaIds = marcaIds;
        if (puntoVentaIds.length > 0) filtros.puntoVentaIds = puntoVentaIds;
      }
      
      const pedidosCargados = obtenerPedidosFiltrados(filtros);
      setPedidos(pedidosCargados);
      setUltimaActualizacion(new Date());
      
      if (!silent) {
        toast.success('Pedidos actualizados', {
          description: `${pedidosCargados.length} pedidos encontrados`
        });
      }
    } catch (error) {
      console.error('Error al cargar pedidos:', error);
      toast.error('Error al cargar pedidos');
    }
  };

  // Filtrar pedidos según filtros de columna
  const pedidosFiltrados = useMemo(() => {
    return pedidos.filter(pedido => {
      // Filtro por número
      if (filtrosColumna.numero && !pedido.numero?.toLowerCase().includes(filtrosColumna.numero.toLowerCase())) {
        return false;
      }

      // Filtro por cliente
      if (filtrosColumna.cliente && 
          !pedido.cliente.nombre.toLowerCase().includes(filtrosColumna.cliente.toLowerCase()) &&
          !pedido.cliente.telefono.includes(filtrosColumna.cliente)) {
        return false;
      }

      // Filtro por estados
      if (filtrosColumna.estados.length > 0 && !filtrosColumna.estados.includes(pedido.estado)) {
        return false;
      }

      // Filtro por orígenes
      if (filtrosColumna.origenes.length > 0 && !filtrosColumna.origenes.includes(pedido.origenPedido)) {
        return false;
      }

      // Filtro por total mínimo
      if (filtrosColumna.totalMin !== null && pedido.total < filtrosColumna.totalMin) {
        return false;
      }

      // Filtro por total máximo
      if (filtrosColumna.totalMax !== null && pedido.total > filtrosColumna.totalMax) {
        return false;
      }

      return true;
    });
  }, [pedidos, filtrosColumna]);

  // Contar filtros activos
  const filtrosActivos = useMemo(() => {
    let count = 0;
    if (filtrosColumna.numero) count++;
    if (filtrosColumna.cliente) count++;
    if (filtrosColumna.estados.length > 0) count++;
    if (filtrosColumna.origenes.length > 0) count++;
    if (filtrosColumna.totalMin !== null || filtrosColumna.totalMax !== null) count++;
    return count;
  }, [filtrosColumna]);

  // Estadísticas
  const stats = useMemo(() => {
    const activos = pedidosFiltrados.filter(p => 
      p.estado !== 'entregado' && p.estado !== 'cancelado'
    );
    
    const totalVentas = pedidosFiltrados
      .filter(p => p.estado === 'entregado')
      .reduce((sum, p) => sum + p.total, 0);

    // ⭐ NUEVO: Canales individuales (incluyendo WEB)
    const porOrigen = {
      app: pedidosFiltrados.filter(p => p.origenPedido === 'app').length,
      web: pedidosFiltrados.filter(p => p.origenPedido === 'web').length,
      tpv: pedidosFiltrados.filter(p => p.origenPedido === 'tpv').length,
      glovo: pedidosFiltrados.filter(p => p.origenPedido === 'glovo').length,
      justeat: pedidosFiltrados.filter(p => p.origenPedido === 'justeat').length,
      ubereats: pedidosFiltrados.filter(p => p.origenPedido === 'ubereats').length,
      deliveroo: pedidosFiltrados.filter(p => p.origenPedido === 'deliveroo').length,
    };

    // ⭐ NUEVO: Agrupaciones para KPIs
    const digital = porOrigen.app + porOrigen.web;
    const delivery = porOrigen.glovo + porOrigen.justeat + porOrigen.ubereats + porOrigen.deliveroo;
    const presencial = porOrigen.tpv;

    return {
      total: pedidosFiltrados.length,
      activos: activos.length,
      entregados: pedidosFiltrados.filter(p => p.estado === 'entregado').length,
      cancelados: pedidosFiltrados.filter(p => p.estado === 'cancelado').length,
      totalVentas,
      porOrigen,
      // Agrupaciones
      digital,
      delivery,
      presencial,
    };
  }, [pedidosFiltrados]);

  const handleVerDetalle = (pedido: Pedido) => {
    setPedidoSeleccionado(pedido);
    setModalDetalle(true);
  };

  const handleCerrarModal = () => {
    setModalDetalle(false);
    setPedidoSeleccionado(null);
    cargarPedidos(true);
  };

  const handleExportar = () => {
    toast.success('Exportando pedidos...');
    // TODO: Implementar exportación a Excel/CSV
  };

  const limpiarFiltros = () => {
    setFiltrosColumna({
      numero: '',
      cliente: '',
      estados: [],
      origenes: [],
      totalMin: null,
      totalMax: null,
    });
  };

  const toggleEstado = (estado: EstadoPedido) => {
    setFiltrosColumna(prev => ({
      ...prev,
      estados: prev.estados.includes(estado)
        ? prev.estados.filter(e => e !== estado)
        : [...prev.estados, estado]
    }));
  };

  const toggleOrigen = (origen: OrigenPedido) => {
    setFiltrosColumna(prev => ({
      ...prev,
      origenes: prev.origenes.includes(origen)
        ? prev.origenes.filter(o => o !== origen)
        : [...prev.origenes, origen]
    }));
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* HEADER COMPACTO CON ACCIONES */}
      <Card>
        <CardHeader className="pb-3 sm:pb-4">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-base sm:text-lg" style={{ fontFamily: 'Poppins, sans-serif' }}>
              <Package className="w-5 h-5" />
              <span className="hidden sm:inline">Pedidos Multicanal</span>
              <span className="sm:hidden">Pedidos</span>
            </CardTitle>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => cargarPedidos()}
                className="h-8 w-8"
              >
                <RefreshCw className="w-4 h-4" />
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <MoreVertical className="w-4 h-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>Acciones</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleExportar}>
                    <Download className="w-4 h-4 mr-2" />
                    Exportar a Excel
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Settings className="w-4 h-4 mr-2" />
                    Configurar columnas
                  </DropdownMenuItem>
                  {filtrosActivos > 0 && (
                    <>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={limpiarFiltros} className="text-red-600">
                        <X className="w-4 h-4 mr-2" />
                        Limpiar filtros ({filtrosActivos})
                      </DropdownMenuItem>
                    </>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* KPIs Principales - Acordeón Colapsable */}
      <Collapsible
        open={kpisExpanded}
        onOpenChange={setKpisExpanded}
      >
        <Card>
          <CollapsibleTrigger asChild>
            <CardHeader className="cursor-pointer hover:bg-gray-50 transition-colors border-b pb-3 sm:pb-4">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2 text-base sm:text-lg" style={{ fontFamily: 'Poppins, sans-serif' }}>
                  <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 text-teal-600" />
                  KPIs de Pedidos
                </CardTitle>
                {kpisExpanded ? (
                  <ChevronUp className="w-5 h-5 text-gray-400" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-gray-400" />
                )}
              </div>
            </CardHeader>
          </CollapsibleTrigger>
          
          <CollapsibleContent>
            <CardContent className="pt-4 sm:pt-6 space-y-4">
              {/* KPIs Principales */}
              <div className="grid gap-3 sm:gap-4 grid-cols-2 md:grid-cols-3 lg:grid-cols-5">
                <Card>
                  <CardContent className="pt-4 sm:pt-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs sm:text-sm text-gray-600">Total Pedidos</p>
                        <p className="text-xl sm:text-2xl font-bold text-gray-900">{stats.total}</p>
                      </div>
                      <Package className="w-6 h-6 sm:w-8 sm:h-8 text-blue-600" />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="pt-4 sm:pt-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs sm:text-sm text-gray-600">Activos</p>
                        <p className="text-xl sm:text-2xl font-bold text-orange-600">{stats.activos}</p>
                      </div>
                      <Clock className="w-6 h-6 sm:w-8 sm:h-8 text-orange-600" />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="pt-4 sm:pt-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs sm:text-sm text-gray-600">Entregados</p>
                        <p className="text-xl sm:text-2xl font-bold text-green-600">{stats.entregados}</p>
                      </div>
                      <CheckCircle className="w-6 h-6 sm:w-8 sm:h-8 text-green-600" />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="pt-4 sm:pt-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs sm:text-sm text-gray-600">Cancelados</p>
                        <p className="text-xl sm:text-2xl font-bold text-red-600">{stats.cancelados}</p>
                      </div>
                      <AlertCircle className="w-6 h-6 sm:w-8 sm:h-8 text-red-600" />
                    </div>
                  </CardContent>
                </Card>

                <Card className="col-span-2 md:col-span-1">
                  <CardContent className="pt-4 sm:pt-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs sm:text-sm text-gray-600">Ventas Totales</p>
                        <p className="text-xl sm:text-2xl font-bold text-teal-600">€{stats.totalVentas.toFixed(2)}</p>
                      </div>
                      <DollarSign className="w-6 h-6 sm:w-8 sm:h-8 text-teal-600" />
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* KPIs por Origen */}
              <div>
                <h4 className="text-xs sm:text-sm font-medium text-gray-700 mb-3">Pedidos por Origen</h4>
                <div className="grid gap-3 sm:gap-4 grid-cols-2 sm:grid-cols-3 md:grid-cols-5">
                  <Card className="bg-gradient-to-br from-blue-50 to-white border-blue-200">
                    <CardContent className="pt-4 sm:pt-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-xs sm:text-sm text-gray-600">App Móvil</p>
                          <p className="text-lg sm:text-xl font-bold text-blue-600">{stats.porOrigen.app}</p>
                        </div>
                        <Smartphone className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" />
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-gradient-to-br from-purple-50 to-white border-purple-200">
                    <CardContent className="pt-4 sm:pt-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-xs sm:text-sm text-gray-600">TPV</p>
                          <p className="text-lg sm:text-xl font-bold text-purple-600">{stats.porOrigen.tpv}</p>
                        </div>
                        <Store className="w-5 h-5 sm:w-6 sm:h-6 text-purple-600" />
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-gradient-to-br from-yellow-50 to-white border-yellow-200">
                    <CardContent className="pt-4 sm:pt-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-xs sm:text-sm text-gray-600">Glovo</p>
                          <p className="text-lg sm:text-xl font-bold text-yellow-600">{stats.porOrigen.glovo}</p>
                        </div>
                        <Truck className="w-5 h-5 sm:w-6 sm:h-6 text-yellow-600" />
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-gradient-to-br from-red-50 to-white border-red-200">
                    <CardContent className="pt-4 sm:pt-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-xs sm:text-sm text-gray-600">Just Eat</p>
                          <p className="text-lg sm:text-xl font-bold text-red-600">{stats.porOrigen.justeat}</p>
                        </div>
                        <ShoppingCart className="w-5 h-5 sm:w-6 sm:h-6 text-red-600" />
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-gradient-to-br from-green-50 to-white border-green-200">
                    <CardContent className="pt-4 sm:pt-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-xs sm:text-sm text-gray-600">Uber Eats</p>
                          <p className="text-lg sm:text-xl font-bold text-green-600">{stats.porOrigen.ubereats}</p>
                        </div>
                        <Bike className="w-5 h-5 sm:w-6 sm:h-6 text-green-600" />
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-gradient-to-br from-cyan-50 to-white border-cyan-200">
                    <CardContent className="pt-4 sm:pt-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-xs sm:text-sm text-gray-600">Web</p>
                          <p className="text-lg sm:text-xl font-bold text-cyan-600">{stats.porOrigen.web}</p>
                        </div>
                        <Globe className="w-5 h-5 sm:w-6 sm:h-6 text-cyan-600" />
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-gradient-to-br from-teal-50 to-white border-teal-200">
                    <CardContent className="pt-4 sm:pt-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-xs sm:text-sm text-gray-600">Deliveroo</p>
                          <p className="text-lg sm:text-xl font-bold text-teal-600">{stats.porOrigen.deliveroo}</p>
                        </div>
                        <Bike className="w-5 h-5 sm:w-6 sm:h-6 text-teal-600" />
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>

              {/* ⭐ NUEVO: KPIs Agrupados (Digital, Delivery, Presencial) */}
              <div>
                <h4 className="text-xs sm:text-sm font-medium text-gray-700 mb-3">Agrupación por Canal</h4>
                <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-3">
                  <Card className="bg-gradient-to-br from-indigo-50 to-white border-indigo-300 border-2">
                    <CardContent className="pt-4 sm:pt-6">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <p className="text-xs sm:text-sm text-gray-600 font-medium">💻 Digital (App + Web)</p>
                          <p className="text-2xl sm:text-3xl font-bold text-indigo-600">{stats.digital}</p>
                          <div className="flex gap-2 mt-2 text-xs text-gray-500">
                            <span>App: {stats.porOrigen.app}</span>
                            <span>•</span>
                            <span>Web: {stats.porOrigen.web}</span>
                          </div>
                        </div>
                        <div className="flex flex-col gap-1">
                          <Smartphone className="w-5 h-5 text-indigo-500" />
                          <Globe className="w-5 h-5 text-indigo-500" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-gradient-to-br from-amber-50 to-white border-amber-300 border-2">
                    <CardContent className="pt-4 sm:pt-6">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <p className="text-xs sm:text-sm text-gray-600 font-medium">🚴 Delivery Externo</p>
                          <p className="text-2xl sm:text-3xl font-bold text-amber-600">{stats.delivery}</p>
                          <div className="flex flex-wrap gap-1 mt-2 text-xs text-gray-500">
                            <span>Glovo: {stats.porOrigen.glovo}</span>
                            <span>•</span>
                            <span>JE: {stats.porOrigen.justeat}</span>
                            <span>•</span>
                            <span>UE: {stats.porOrigen.ubereats}</span>
                            <span>•</span>
                            <span>Del: {stats.porOrigen.deliveroo}</span>
                          </div>
                        </div>
                        <Truck className="w-8 h-8 text-amber-600" />
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-gradient-to-br from-violet-50 to-white border-violet-300 border-2">
                    <CardContent className="pt-4 sm:pt-6">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <p className="text-xs sm:text-sm text-gray-600 font-medium">🏪 Presencial (TPV)</p>
                          <p className="text-2xl sm:text-3xl font-bold text-violet-600">{stats.presencial}</p>
                          <div className="flex gap-2 mt-2 text-xs text-gray-500">
                            <span>Terminal POS</span>
                          </div>
                        </div>
                        <Store className="w-8 h-8 text-violet-600" />
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </CardContent>
          </CollapsibleContent>
        </Card>
      </Collapsible>

      {/* Filtros principales */}
      <Card>
        <CardContent className="pt-4 sm:pt-6">
          <div className="space-y-3 sm:space-y-4">
            {/* Filtro jerárquico */}
            <div>
              <FiltroContextoJerarquico
                selectedContext={selectedContext}
                onChange={setSelectedContext}
              />
            </div>

            {/* Vista */}
            <div>
              <Label className="text-xs text-gray-600 mb-2 block">Vista</Label>
              <div className="flex gap-2">
                <Button
                  variant={vistaMode === 'tabla' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setVistaMode('tabla')}
                  className={`flex-1 ${vistaMode === 'tabla' ? 'bg-teal-600 hover:bg-teal-700' : ''}`}
                >
                  <LayoutList className="w-4 h-4 mr-2" />
                  <span className="hidden sm:inline">Tabla</span>
                </Button>
                <Button
                  variant={vistaMode === 'tarjetas' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setVistaMode('tarjetas')}
                  className={`flex-1 ${vistaMode === 'tarjetas' ? 'bg-teal-600 hover:bg-teal-700' : ''}`}
                >
                  <LayoutGrid className="w-4 h-4 mr-2" />
                  <span className="hidden sm:inline">Tarjetas</span>
                </Button>
              </div>
            </div>

            {/* Badges de filtros activos */}
            {filtrosActivos > 0 && (
              <div className="flex flex-wrap items-center gap-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <span className="text-xs font-medium text-blue-900">Filtros activos:</span>
                {filtrosColumna.numero && (
                  <Badge variant="secondary" className="gap-1">
                    Nº: {filtrosColumna.numero}
                    <X 
                      className="w-3 h-3 cursor-pointer" 
                      onClick={() => setFiltrosColumna(prev => ({ ...prev, numero: '' }))}
                    />
                  </Badge>
                )}
                {filtrosColumna.cliente && (
                  <Badge variant="secondary" className="gap-1">
                    Cliente: {filtrosColumna.cliente}
                    <X 
                      className="w-3 h-3 cursor-pointer" 
                      onClick={() => setFiltrosColumna(prev => ({ ...prev, cliente: '' }))}
                    />
                  </Badge>
                )}
                {filtrosColumna.estados.length > 0 && (
                  <Badge variant="secondary" className="gap-1">
                    Estado: {filtrosColumna.estados.length}
                    <X 
                      className="w-3 h-3 cursor-pointer" 
                      onClick={() => setFiltrosColumna(prev => ({ ...prev, estados: [] }))}
                    />
                  </Badge>
                )}
                {filtrosColumna.origenes.length > 0 && (
                  <Badge variant="secondary" className="gap-1">
                    Origen: {filtrosColumna.origenes.length}
                    <X 
                      className="w-3 h-3 cursor-pointer" 
                      onClick={() => setFiltrosColumna(prev => ({ ...prev, origenes: [] }))}
                    />
                  </Badge>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={limpiarFiltros}
                  className="h-6 text-xs text-blue-700 hover:text-blue-900"
                >
                  Limpiar todos
                </Button>
              </div>
            )}

            <p className="text-xs text-gray-500">
              Última actualización: {ultimaActualizacion.toLocaleTimeString('es-ES')} • 
              Mostrando {pedidosFiltrados.length} de {pedidos.length} pedidos
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Vista de tabla con filtros por columna */}
      {vistaMode === 'tabla' && (
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              {pedidosFiltrados.length === 0 ? (
                <div className="p-6">
                  <EmptyState
                    icon={Package}
                    title="No hay pedidos"
                    description="No se encontraron pedidos con los filtros seleccionados"
                  />
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      {/* Columna Número con filtro */}
                      <TableHead>
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button variant="ghost" size="sm" className="h-8 gap-1 px-2">
                              # Pedido
                              <Filter className={`w-3 h-3 ${filtrosColumna.numero ? 'text-blue-600' : 'text-gray-400'}`} />
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-64" align="start">
                            <div className="space-y-2">
                              <Label className="text-xs">Buscar por número</Label>
                              <Input
                                placeholder="Ej: 1234"
                                value={filtrosColumna.numero}
                                onChange={(e) => setFiltrosColumna(prev => ({ ...prev, numero: e.target.value }))}
                                className="h-8 text-sm"
                              />
                            </div>
                          </PopoverContent>
                        </Popover>
                      </TableHead>

                      {/* Columna Cliente con filtro */}
                      <TableHead>
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button variant="ghost" size="sm" className="h-8 gap-1 px-2">
                              Cliente
                              <Filter className={`w-3 h-3 ${filtrosColumna.cliente ? 'text-blue-600' : 'text-gray-400'}`} />
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-64" align="start">
                            <div className="space-y-2">
                              <Label className="text-xs">Buscar por nombre o teléfono</Label>
                              <Input
                                placeholder="Ej: Juan, 666..."
                                value={filtrosColumna.cliente}
                                onChange={(e) => setFiltrosColumna(prev => ({ ...prev, cliente: e.target.value }))}
                                className="h-8 text-sm"
                              />
                            </div>
                          </PopoverContent>
                        </Popover>
                      </TableHead>

                      <TableHead className="hidden lg:table-cell">Empresa/Marca</TableHead>
                      <TableHead className="hidden md:table-cell">PDV</TableHead>

                      {/* Columna Origen con filtro */}
                      <TableHead>
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button variant="ghost" size="sm" className="h-8 gap-1 px-2">
                              Origen
                              <Filter className={`w-3 h-3 ${filtrosColumna.origenes.length > 0 ? 'text-blue-600' : 'text-gray-400'}`} />
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-56" align="start">
                            <div className="space-y-2">
                              <Label className="text-xs">Filtrar por origen</Label>
                              <div className="space-y-2">
                                {(['app', 'tpv', 'glovo', 'justeat', 'ubereats'] as OrigenPedido[]).map((origen) => (
                                  <div key={origen} className="flex items-center space-x-2">
                                    <Checkbox
                                      id={`origen-${origen}`}
                                      checked={filtrosColumna.origenes.includes(origen)}
                                      onCheckedChange={() => toggleOrigen(origen)}
                                    />
                                    <label
                                      htmlFor={`origen-${origen}`}
                                      className="text-sm cursor-pointer flex-1"
                                    >
                                      {origen === 'app' && 'App Móvil'}
                                      {origen === 'tpv' && 'TPV'}
                                      {origen === 'glovo' && 'Glovo'}
                                      {origen === 'justeat' && 'Just Eat'}
                                      {origen === 'ubereats' && 'Uber Eats'}
                                    </label>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </PopoverContent>
                        </Popover>
                      </TableHead>

                      {/* Columna Estado con filtro */}
                      <TableHead>
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button variant="ghost" size="sm" className="h-8 gap-1 px-2">
                              Estado
                              <Filter className={`w-3 h-3 ${filtrosColumna.estados.length > 0 ? 'text-blue-600' : 'text-gray-400'}`} />
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-56" align="start">
                            <div className="space-y-2">
                              <Label className="text-xs">Filtrar por estado</Label>
                              <div className="space-y-2">
                                {(['pendiente', 'pagado', 'en_preparacion', 'listo', 'entregado', 'cancelado'] as EstadoPedido[]).map((estado) => (
                                  <div key={estado} className="flex items-center space-x-2">
                                    <Checkbox
                                      id={`estado-${estado}`}
                                      checked={filtrosColumna.estados.includes(estado)}
                                      onCheckedChange={() => toggleEstado(estado)}
                                    />
                                    <label
                                      htmlFor={`estado-${estado}`}
                                      className="text-sm cursor-pointer flex-1"
                                    >
                                      {estado === 'pendiente' && 'Pendiente'}
                                      {estado === 'pagado' && 'Pagado'}
                                      {estado === 'en_preparacion' && 'En preparación'}
                                      {estado === 'listo' && 'Listo'}
                                      {estado === 'entregado' && 'Entregado'}
                                      {estado === 'cancelado' && 'Cancelado'}
                                    </label>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </PopoverContent>
                        </Popover>
                      </TableHead>

                      {/* Columna Total con filtro */}
                      <TableHead>
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button variant="ghost" size="sm" className="h-8 gap-1 px-2">
                              Total
                              <Filter className={`w-3 h-3 ${(filtrosColumna.totalMin !== null || filtrosColumna.totalMax !== null) ? 'text-blue-600' : 'text-gray-400'}`} />
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-64" align="start">
                            <div className="space-y-3">
                              <Label className="text-xs">Rango de importe</Label>
                              <div className="space-y-2">
                                <div>
                                  <Label className="text-xs text-gray-600">Mínimo (€)</Label>
                                  <Input
                                    type="number"
                                    placeholder="0"
                                    value={filtrosColumna.totalMin || ''}
                                    onChange={(e) => setFiltrosColumna(prev => ({ 
                                      ...prev, 
                                      totalMin: e.target.value ? parseFloat(e.target.value) : null 
                                    }))}
                                    className="h-8 text-sm"
                                  />
                                </div>
                                <div>
                                  <Label className="text-xs text-gray-600">Máximo (€)</Label>
                                  <Input
                                    type="number"
                                    placeholder="999"
                                    value={filtrosColumna.totalMax || ''}
                                    onChange={(e) => setFiltrosColumna(prev => ({ 
                                      ...prev, 
                                      totalMax: e.target.value ? parseFloat(e.target.value) : null 
                                    }))}
                                    className="h-8 text-sm"
                                  />
                                </div>
                              </div>
                            </div>
                          </PopoverContent>
                        </Popover>
                      </TableHead>

                      <TableHead className="hidden xl:table-cell">Fecha</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {pedidosFiltrados.map((pedido) => (
                      <TableRow 
                        key={pedido.id}
                        onClick={() => handleVerDetalle(pedido)}
                        className="cursor-pointer hover:bg-gray-50 transition-colors"
                      >
                        <TableCell className="font-mono text-sm">{pedido.numero}</TableCell>
                        <TableCell>
                          <div>
                            <p className="font-medium text-sm">{pedido.cliente.nombre}</p>
                            <p className="text-xs text-gray-500">{pedido.cliente.telefono}</p>
                          </div>
                        </TableCell>
                        <TableCell className="hidden lg:table-cell">
                          <div>
                            <p className="text-sm font-medium">{pedido.marcaNombre}</p>
                            <p className="text-xs text-gray-500">{pedido.empresaNombre}</p>
                          </div>
                        </TableCell>
                        <TableCell className="hidden md:table-cell">
                          <div className="flex items-center gap-1">
                            <MapPin className="w-3 h-3 text-gray-400" />
                            <span className="text-sm">{pedido.puntoVentaNombre}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <BadgeOrigen origen={pedido.origenPedido} />
                        </TableCell>
                        <TableCell>
                          <BadgeEstado estado={pedido.estado} />
                        </TableCell>
                        <TableCell className="font-medium text-sm">
                          €{pedido.total.toFixed(2)}
                        </TableCell>
                        <TableCell className="text-sm text-gray-600 hidden xl:table-cell">
                          {new Date(pedido.fecha).toLocaleDateString('es-ES', {
                            day: '2-digit',
                            month: '2-digit',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Vista de tarjetas */}
      {vistaMode === 'tarjetas' && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {pedidosFiltrados.length === 0 ? (
            <div className="col-span-full">
              <Card>
                <CardContent className="p-6">
                  <EmptyState
                    icon={Package}
                    title="No hay pedidos"
                    description="No se encontraron pedidos con los filtros seleccionados"
                  />
                </CardContent>
              </Card>
            </div>
          ) : (
            pedidosFiltrados.map((pedido) => (
              <Card key={pedido.id} className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => handleVerDetalle(pedido)}>
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-mono text-sm text-gray-600">{pedido.numero}</p>
                      <p className="font-medium">{pedido.cliente.nombre}</p>
                    </div>
                    <BadgeOrigen origen={pedido.origenPedido} />
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Estado:</span>
                    <BadgeEstado estado={pedido.estado} />
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Total:</span>
                    <span className="font-bold text-teal-600">€{pedido.total.toFixed(2)}</span>
                  </div>
                  <div className="flex items-center gap-1 text-xs text-gray-500">
                    <MapPin className="w-3 h-3" />
                    {pedido.marcaNombre} - {pedido.puntoVentaNombre}
                  </div>
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <span>{new Date(pedido.fecha).toLocaleDateString('es-ES')}</span>
                    <span>{new Date(pedido.fecha).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      )}

      {/* Modal de detalle */}
      {pedidoSeleccionado && (
        <ModalDetallePedido
          open={modalDetalle}
          onOpenChange={setModalDetalle}
          pedido={pedidoSeleccionado}
          onCerrar={handleCerrarModal}
          permisos={{
            puedeMarcarEnPreparacion: true,
            puedeMarcarListo: true,
            puedeMarcarEntregado: true,
            puedeCancelar: true,
            puedeConfirmarPago: true,
            esGerente: true
          }}
        />
      )}
    </div>
  );
}

// ============================================================================
// COMPONENTES AUXILIARES
// ============================================================================

function BadgeOrigen({ origen }: { origen: OrigenPedido }) {
  const config = {
    app: { label: 'App', color: 'bg-blue-100 text-blue-700 border-blue-200', icon: Smartphone },
    web: { label: 'Web', color: 'bg-cyan-100 text-cyan-700 border-cyan-200', icon: Globe },
    tpv: { label: 'TPV', color: 'bg-purple-100 text-purple-700 border-purple-200', icon: Store },
    glovo: { label: 'Glovo', color: 'bg-yellow-100 text-yellow-700 border-yellow-200', icon: Truck },
    justeat: { label: 'Just Eat', color: 'bg-red-100 text-red-700 border-red-200', icon: ShoppingCart },
    ubereats: { label: 'Uber Eats', color: 'bg-green-100 text-green-700 border-green-200', icon: Bike },
    deliveroo: { label: 'Deliveroo', color: 'bg-teal-100 text-teal-700 border-teal-200', icon: Bike },
  };

  const { label, color, icon: Icon } = config[origen] || config.app;

  return (
    <Badge variant="outline" className={`${color} gap-1 border text-xs`}>
      <Icon className="w-3 h-3" />
      <span className="hidden sm:inline">{label}</span>
    </Badge>
  );
}

function BadgeEstado({ estado }: { estado: EstadoPedido }) {
  const config = {
    pendiente: { label: 'Pendiente', color: 'bg-gray-100 text-gray-700 border-gray-200' },
    pagado: { label: 'Pagado', color: 'bg-blue-100 text-blue-700 border-blue-200' },
    en_preparacion: { label: 'En prep.', labelFull: 'En preparación', color: 'bg-orange-100 text-orange-700 border-orange-200' },
    listo: { label: 'Listo', color: 'bg-teal-100 text-teal-700 border-teal-200' },
    entregado: { label: 'Entregado', color: 'bg-green-100 text-green-700 border-green-200' },
    cancelado: { label: 'Cancelado', color: 'bg-red-100 text-red-700 border-red-200' },
  };

  const { label, color } = config[estado] || config.pendiente;

  return (
    <Badge variant="outline" className={`${color} border text-xs whitespace-nowrap`}>
      {label}
    </Badge>
  );
}