import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Calendar } from '../ui/calendar';
import { Checkbox } from '../ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';
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
  FileText,
  Plus,
  Download,
  Upload,
  Eye,
  Trash2,
  AlertCircle,
  CheckCircle2,
  Building2,
  Users,
  Scale,
  Receipt,
  CalendarDays,
  Euro,
  Car,
  Filter,
  Camera,
  Scan,
  Link,
  ShieldCheck,
  FileBadge,
  FolderOpen,
  Loader2,
  Sparkles
} from 'lucide-react';
import { toast } from 'sonner@2.0.3';
import { EMPRESAS, PUNTOS_VENTA, getNombreEmpresa, getNombrePDV } from '../../constants/empresaConfig';

interface Documento {
  id: string;
  nombre: string;
  categoria: string;
  tipo: string; // Nuevo campo
  fechaSubida: string;
  fechaVencimiento?: string;
  estado: 'vigente' | 'proximo-vencer' | 'vencido' | 'archivado'; // Añadido 'archivado'
  tamaño: string;
  responsable: string;
}

// ========== NUEVAS INTERFACES PARA BBDD ==========

interface DocumentoBBDD {
  doc_id: string; // ID interno único, ej: DOC-001
  empresa_id: string;
  punto_venta_id: string | null;
  categoria_documental: 'sociedad' | 'vehiculos' | 'contratos' | 'licencias' | 'fiscalidad' | 'otros';
  tipo_documento: string; // Legal, Vehículo/Técnico, Permisos, Fiscal, Contrato, General
  nombre_documento: string;
  codigo_referencia: string; // DOC-020
  fecha_subida: Date;
  fecha_vencimiento: Date | null;
  estado: 'vigente' | 'proximo_vencer' | 'caducado' | 'archivado';
  tamano_archivo: number; // en KB
  url_archivo: string;
  responsable: string;
}

interface GastoBBDD {
  gasto_id: string; // GAS-001
  empresa_id: string;
  punto_venta_id: string | null;
  concepto: string;
  proveedor_nombre: string;
  importe: number; // 2 decimales
  fecha_gasto: Date;
  categoria: string; // Suministros, Mantenimiento, Servicios, etc.
  subtipo: string; // Papel, Material oficina, Limpieza, Tecnología
  metodo_pago: 'efectivo' | 'tarjeta' | 'transferencia' | 'otros';
  centro_coste: string;
  estado: 'registrado' | 'vinculado_evento' | 'contabilizado';
  // Campos nuevos contabilidad
  num_factura: string; // obligatorio
  nif_proveedor: string; // opcional
  // Adjuntos y relaciones
  ticket_url: string;
  evento_id: string | null;
}

interface PagoCalendarioBBDD {
  evento_id: string; // PAG-001
  empresa_id: string;
  punto_venta_id: string | null;
  concepto: string;
  categoria: string; // Alquiler, Nóminas, Seguridad Social
  monto: number;
  fecha: Date;
  estado_pago: 'pendiente' | 'pagado';
  recurrente: boolean;
  frecuencia: string | null; // mensual, anual, etc.
  metodo_pago: 'efectivo' | 'tarjeta' | 'transferencia' | 'otros';
  gasto_id: string | null; // vinculación a gasto real
}

interface DatosOCR {
  ocr_proveedor_nombre: string;
  ocr_nif_proveedor: string;
  ocr_fecha: string;
  ocr_importe: string;
  ocr_categoria_sugerida: string;
  ocr_num_factura: string;
  ticket_url: string;
}

interface Pago {
  id: string;
  concepto: string;
  categoria: string;
  monto: string;
  fecha: string;
  estado: 'pendiente' | 'pagado' | 'vencido';
  recurrente: boolean;
}

interface Gasto {
  id: string;
  concepto: string;
  proveedor: string;
  importe: string;
  fecha: string;
  categoria: string;
  accionAsociada?: string;
  adjunto: string;
}

export function DocumentacionGerente() {
  const [filtroActivo, setFiltroActivo] = useState<'contratos' | 'vehiculos' | 'alquileres' | 'licencias' | 'fiscalidad' | 'otros' | 'gastos' | 'sociedad' | 'agenda'>('sociedad');
  const [modalDocumentoOpen, setModalDocumentoOpen] = useState(false);
  const [modalPagoOpen, setModalPagoOpen] = useState(false);
  const [modalGastoOpen, setModalGastoOpen] = useState(false);
  const [modalSeleccionGastoOpen, setModalSeleccionGastoOpen] = useState(false);
  
  // Estados para el formulario de documento
  const [pasoDocumento, setPasoDocumento] = useState<1 | 2>(1); // Nuevo: control de fases
  const [docNombre, setDocNombre] = useState('');
  const [docEmpresa, setDocEmpresa] = useState('');
  const [docPuntoVenta, setDocPuntoVenta] = useState('');
  const [docCategoria, setDocCategoria] = useState<'sociedad' | 'vehiculos' | 'contratos' | 'licencias' | 'fiscalidad' | 'otros'>('sociedad');
  const [docVencimiento, setDocVencimiento] = useState('');
  const [docCoste, setDocCoste] = useState('');
  const [docObservaciones, setDocObservaciones] = useState('');
  const [docCategoriaEBITDA, setDocCategoriaEBITDA] = useState<string>(''); // Nuevo: categoría para EBITDA
  const [leyendoDocumento, setLeyendoDocumento] = useState(false);
  const [archivoSeleccionado, setArchivoSeleccionado] = useState<File | null>(null);
  
  const [pasoGasto, setPasoGasto] = useState<'captura' | 'lectura' | 'confirmacion'>(('captura'));
  const [imagenGasto, setImagenGasto] = useState<string | null>(null);
  const [datosGastoLeidos, setDatosGastoLeidos] = useState<DatosOCR | null>(null); // Actualizado con interfaz DatosOCR
  const [accionAsociada, setAccionAsociada] = useState('');
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [todoDia, setTodoDia] = useState(false);
  const [metodoPago, setMetodoPago] = useState<'efectivo' | 'tarjeta'>('tarjeta');

  // ===== FUNCIONES DE IA PARA LECTURA DE DOCUMENTOS =====
  
  const leerDocumentoConIA = async (archivo: File, categoria: string) => {
    // 🔌 EVENTO: LECTURA_DOCUMENTO_IA
    console.log('🔌 EVENTO: LECTURA_DOCUMENTO_IA', {
      endpoint: 'POST /api/documentos/ocr',
      payload: {
        archivo: archivo.name,
        categoria,
        tipo_ocr: 'GPT-4-Vision / Azure Document Intelligence'
      },
      timestamp: new Date().toISOString()
    });

    setLeyendoDocumento(true);

    // Simular tiempo de procesamiento
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Datos extraídos según categoría
    let datosExtraidos: any = {};

    switch (categoria) {
      case 'vehiculos':
        datosExtraidos = {
          nombre: archivo.name.replace(/\.[^/.]+$/, ''),
          vencimiento: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 1 año
          coste: (Math.random() * 500 + 200).toFixed(2),
          observaciones: 'Seguro a todo riesgo con franquicia de 300€',
          categoriaEBITDA: 'seguros'
        };
        break;
      
      case 'contratos':
        datosExtraidos = {
          nombre: archivo.name.replace(/\.[^/.]+$/, ''),
          vencimiento: new Date(Date.now() + 730 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 2 años
          coste: (Math.random() * 2000 + 500).toFixed(2),
          observaciones: 'Renovación automática salvo notificación con 60 días de antelación',
          categoriaEBITDA: 'alquiler'
        };
        break;
      
      case 'licencias':
        datosExtraidos = {
          nombre: archivo.name.replace(/\.[^/.]+$/, ''),
          vencimiento: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          coste: (Math.random() * 300 + 50).toFixed(2),
          observaciones: 'Licencia anual, incluye 5 usuarios',
          categoriaEBITDA: 'tecnologia'
        };
        break;

      case 'fiscalidad':
        datosExtraidos = {
          nombre: archivo.name.replace(/\.[^/.]+$/, ''),
          vencimiento: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          coste: '',
          observaciones: 'Presentación trimestral - Modelo 303 IVA',
          categoriaEBITDA: 'asesoria'
        };
        break;

      case 'sociedad':
        datosExtraidos = {
          nombre: archivo.name.replace(/\.[^/.]+$/, ''),
          vencimiento: '',
          coste: '',
          observaciones: 'Escritura de constitución de la sociedad',
          categoriaEBITDA: 'no_aplica'
        };
        break;

      default:
        datosExtraidos = {
          nombre: archivo.name.replace(/\.[^/.]+$/, ''),
          vencimiento: '',
          coste: '',
          observaciones: '',
          categoriaEBITDA: ''
        };
    }

    // Auto-rellenar campos (NO rellenar docNombre ya que el usuario ya lo escribió en Fase 1)
    setDocVencimiento(datosExtraidos.vencimiento);
    setDocCoste(datosExtraidos.coste);
    setDocObservaciones(datosExtraidos.observaciones);
    setDocCategoriaEBITDA(datosExtraidos.categoriaEBITDA);

    setLeyendoDocumento(false);

    toast.success('Documento analizado con IA', {
      description: 'Los campos se han rellenado automáticamente'
    });
  };

  // ===== FUNCIONES DE EVENTOS PARA MAKE =====
  
  const handleEscanearTicket = () => {
    // 🔌 EVENTO: INICIAR_OCR_TICKET
    console.log('🔌 EVENTO: INICIAR_OCR_TICKET', {
      endpoint: 'POST /api/ocr/escanear-ticket',
      accion: 'Abrir cámara o subir imagen para OCR',
      timestamp: new Date().toISOString()
    });

    // Simular respuesta OCR (el programador debe reemplazar con API real)
    setTimeout(() => {
      const datosOCRSimulados: DatosOCR = {
        ocr_proveedor_nombre: 'Papelería Central S.L.',
        ocr_nif_proveedor: 'B12345678',
        ocr_fecha: '2024-11-26',
        ocr_importe: '156.50',
        ocr_categoria_sugerida: 'Suministros',
        ocr_num_factura: 'FAC-2024-1234',
        ticket_url: 'https://storage.udar.com/tickets/ticket_123456.jpg'
      };

      setDatosGastoLeidos(datosOCRSimulados);
      
      console.log('✅ OCR COMPLETADO', {
        datos_extraidos: datosOCRSimulados,
        timestamp: new Date().toISOString()
      });

      // Cerrar modal de selección y abrir formulario
      setModalSeleccionGastoOpen(false);
      setModalGastoOpen(true);
      
      toast.success('Ticket escaneado correctamente');
    }, 1500);
  };

  const handleCrearDocumento = (datos: Partial<DocumentoBBDD>) => {
    // 🔌 EVENTO: onDocumentoCreado
    console.log('🔌 EVENTO: onDocumentoCreado', {
      endpoint: 'POST /api/documentos',
      payload: datos,
      timestamp: new Date().toISOString()
    });
  };

  const handleActualizarDocumento = (docId: string, cambios: Partial<DocumentoBBDD>) => {
    // 🔌 EVENTO: onDocumentoActualizado
    console.log('🔌 EVENTO: onDocumentoActualizado', {
      endpoint: `PUT /api/documentos/${docId}`,
      payload: cambios,
      nota: cambios.estado === 'archivado' ? 'Documento archivado - conservar' : '',
      timestamp: new Date().toISOString()
    });
  };

  const handleCrearGasto = (datos: Partial<GastoBBDD>) => {
    // 🔌 EVENTO: onGastoCreado
    console.log('🔌 EVENTO: onGastoCreado', {
      endpoint: 'POST /api/gastos',
      payload: datos,
      acciones_make: {
        actualizar_kpis: true,
        vincular_evento: datos.evento_id ? true : false,
        notificar_contabilidad: true
      },
      timestamp: new Date().toISOString()
    });

    // Si tiene evento_id, actualizar el calendario
    if (datos.evento_id) {
      handleVincularGastoAEvento(datos.evento_id, datos.gasto_id!);
    }
  };

  const handleVincularGastoAEvento = (eventoId: string, gastoId: string) => {
    // 🔌 EVENTO: VINCULAR_GASTO_A_EVENTO
    console.log('🔌 EVENTO: VINCULAR_GASTO_A_EVENTO', {
      endpoint: `PUT /api/calendario/${eventoId}/vincular-gasto`,
      payload: { gasto_id: gastoId },
      timestamp: new Date().toISOString()
    });
  };

  const handleActualizarPagoCalendario = (eventoId: string, cambios: Partial<PagoCalendarioBBDD>) => {
    // 🔌 EVENTO: onPagoCalendarioActualizado
    console.log('🔌 EVENTO: onPagoCalendarioActualizado', {
      endpoint: `PUT /api/calendario/${eventoId}`,
      payload: cambios,
      acciones_make: {
        verificar_gasto_vinculado: cambios.estado_pago === 'pagado',
        sugerir_crear_gasto: cambios.estado_pago === 'pagado' && !cambios.gasto_id
      },
      timestamp: new Date().toISOString()
    });
  };

  const [documentos] = useState<Documento[]>([
    {
      id: 'DOC-001',
      nombre: 'Manual TPV 360',
      categoria: 'Punto de Venta',
      tipo: 'Manual', // Nuevo campo
      fechaSubida: '15/11/2025',
      estado: 'vigente',
      tamaño: '2.5 MB',
      responsable: 'Admin'
    },
    {
      id: 'DOC-002',
      nombre: 'Procedimientos Caja Registradora',
      categoria: 'Punto de Venta',
      tipo: 'Procedimiento', // Nuevo campo
      fechaSubida: '10/11/2025',
      estado: 'vigente',
      tamaño: '1.8 MB',
      responsable: 'Admin'
    },
    {
      id: 'DOC-003',
      nombre: 'Contrato Ana Rodríguez',
      categoria: 'Contratos Empleados',
      tipo: 'Contrato', // Añadido
      fechaSubida: '01/01/2024',
      fechaVencimiento: '31/12/2025',
      estado: 'proximo-vencer',
      tamaño: '450 KB',
      responsable: 'RRHH'
    },
    {
      id: 'DOC-004',
      nombre: 'Contrato Carlos Méndez',
      categoria: 'Contratos Empleados',
      tipo: 'Contrato', // Añadido
      fechaSubida: '15/03/2024',
      fechaVencimiento: '15/03/2026',
      estado: 'vigente',
      tamaño: '420 KB',
      responsable: 'RRHH'
    },
    {
      id: 'DOC-005',
      nombre: 'Contrato María García',
      categoria: 'Contratos Empleados',
      tipo: 'Contrato', // Añadido
      fechaSubida: '01/06/2024',
      fechaVencimiento: '01/06/2026',
      estado: 'vigente',
      tamaño: '435 KB',
      responsable: 'RRHH'
    },
    {
      id: 'DOC-015',
      nombre: 'ITV Mercedes-Benz Sprinter',
      categoria: 'Vehículos',
      tipo: 'Vehículo / Técnico', // Añadido
      fechaSubida: '10/01/2024',
      fechaVencimiento: '10/01/2026',
      estado: 'vigente',
      tamaño: '850 KB',
      responsable: 'Logística'
    },
    {
      id: 'DOC-016',
      nombre: 'Seguro Mapfre - Sprinter 1234 ABC',
      categoria: 'Vehículos',
      tipo: 'Vehículo / Técnico', // Añadido
      fechaSubida: '20/03/2024',
      fechaVencimiento: '20/03/2026',
      estado: 'vigente',
      tamaño: '720 KB',
      responsable: 'Logística'
    },
    {
      id: 'DOC-017',
      nombre: 'ITV Renault Kangoo',
      categoria: 'Vehículos',
      tipo: 'Vehículo / Técnico', // Añadido
      fechaSubida: '05/12/2023',
      fechaVencimiento: '05/12/2025',
      estado: 'proximo-vencer',
      tamaño: '780 KB',
      responsable: 'Logística'
    },
    {
      id: 'DOC-018',
      nombre: 'Permiso Circulación Ford Transit',
      categoria: 'Vehículos',
      tipo: 'Vehículo / Técnico', // Añadido
      fechaSubida: '15/01/2023',
      fechaVencimiento: '15/01/2027',
      estado: 'vigente',
      tamaño: '320 KB',
      responsable: 'Logística'
    },
    {
      id: 'DOC-019',
      nombre: 'Tarjeta Transporte Mercedes Sprinter',
      categoria: 'Vehículos',
      tipo: 'Vehículo / Técnico', // Añadido
      fechaSubida: '22/03/2024',
      fechaVencimiento: '22/03/2029',
      estado: 'vigente',
      tamaño: '540 KB',
      responsable: 'Logística'
    },
    {
      id: 'DOC-006',
      nombre: 'Arrendamiento Can Farines Centro',
      categoria: 'Contratos Alquiler',
      tipo: 'Contrato', // Añadido
      fechaSubida: '01/01/2020',
      fechaVencimiento: '31/12/2025',
      estado: 'proximo-vencer',
      tamaño: '3.2 MB',
      responsable: 'Gerencia'
    },
    {
      id: 'DOC-007',
      nombre: 'Arrendamiento Can Farines Llefià',
      categoria: 'Contratos Alquiler',
      tipo: 'Contrato', // Añadido
      fechaSubida: '01/07/2021',
      fechaVencimiento: '30/06/2026',
      estado: 'vigente',
      tamaño: '2.8 MB',
      responsable: 'Gerencia'
    },
    {
      id: 'DOC-008',
      nombre: 'Arrendamiento Can Farines Poblenou',
      categoria: 'Contratos Alquiler',
      tipo: 'Contrato', // Añadido
      fechaSubida: '15/09/2022',
      fechaVencimiento: '14/09/2027',
      estado: 'vigente',
      tamaño: '3.1 MB',
      responsable: 'Gerencia'
    },
    {
      id: 'DOC-009',
      nombre: 'Licencia Actividad Centro',
      categoria: 'Licencias',
      tipo: 'Permisos', // Añadido
      fechaSubida: '10/03/2020',
      fechaVencimiento: '10/03/2026',
      estado: 'vigente',
      tamaño: '1.5 MB',
      responsable: 'Legal'
    },
    {
      id: 'DOC-010',
      nombre: 'Licencia Sanitaria Centro',
      categoria: 'Licencias',
      tipo: 'Permisos', // Añadido
      fechaSubida: '15/03/2020',
      fechaVencimiento: '15/03/2026',
      estado: 'vigente',
      tamaño: '980 KB',
      responsable: 'Legal'
    },
    {
      id: 'DOC-011',
      nombre: 'Registro Sanitario Poblenou',
      categoria: 'Licencias',
      tipo: 'Permisos', // Añadido
      fechaSubida: '20/09/2022',
      fechaVencimiento: '20/09/2027',
      estado: 'vigente',
      tamaño: '1.1 MB',
      responsable: 'Legal'
    },
    {
      id: 'DOC-012',
      nombre: 'Declaración IVA Q3 2025',
      categoria: 'Fiscalidad',
      tipo: 'Fiscal', // Añadido
      fechaSubida: '20/10/2025',
      fechaVencimiento: '20/01/2026',
      estado: 'vigente',
      tamaño: '650 KB',
      responsable: 'Contabilidad'
    },
    {
      id: 'DOC-013',
      nombre: 'Modelo 303 IVA',
      categoria: 'Fiscalidad',
      tipo: 'Fiscal', // Añadido
      fechaSubida: '18/11/2025',
      estado: 'vigente',
      tamaño: '540 KB',
      responsable: 'Contabilidad'
    },
    {
      id: 'DOC-014',
      nombre: 'Impuesto Sociedades 2024',
      categoria: 'Fiscalidad',
      tipo: 'Fiscal', // Añadido
      fechaSubida: '15/07/2025',
      fechaVencimiento: '25/07/2026',
      estado: 'vigente',
      tamaño: '2.3 MB',
      responsable: 'Contabilidad'
    },
    {
      id: 'DOC-020',
      nombre: 'Estatutos Sociales Can Farines S.L.',
      categoria: 'Sociedad',
      tipo: 'Legal', // Añadido
      fechaSubida: '15/01/2019',
      estado: 'vigente',
      tamaño: '1.8 MB',
      responsable: 'Legal'
    },
    {
      id: 'DOC-021',
      nombre: 'IAE - Impuesto Actividades Económicas',
      categoria: 'Sociedad',
      tipo: 'Legal', // Añadido
      fechaSubida: '20/01/2025',
      fechaVencimiento: '20/01/2026',
      estado: 'vigente',
      tamaño: '320 KB',
      responsable: 'Contabilidad'
    },
    {
      id: 'DOC-022',
      nombre: 'CIF - Certificado Identificación Fiscal',
      categoria: 'Sociedad',
      tipo: 'Legal', // Añadido
      fechaSubida: '10/01/2019',
      estado: 'vigente',
      tamaño: '180 KB',
      responsable: 'Legal'
    },
    {
      id: 'DOC-023',
      nombre: 'Escritura de Constitución',
      categoria: 'Sociedad',
      tipo: 'Legal', // Añadido
      fechaSubida: '05/01/2019',
      estado: 'vigente',
      tamaño: '2.5 MB',
      responsable: 'Legal'
    },
    {
      id: 'DOC-024',
      nombre: 'Poderes Notariales Administrador',
      categoria: 'Sociedad',
      tipo: 'Legal', // Añadido
      fechaSubida: '15/01/2019',
      estado: 'vigente',
      tamaño: '1.2 MB',
      responsable: 'Legal'
    },
    {
      id: 'DOC-025',
      nombre: 'Manual de Procedimientos Internos',
      categoria: 'Otros',
      tipo: 'General',
      fechaSubida: '01/03/2024',
      estado: 'vigente',
      tamaño: '4.5 MB',
      responsable: 'Admin'
    },
    {
      id: 'DOC-026',
      nombre: 'Política de Privacidad y Protección de Datos',
      categoria: 'Otros',
      tipo: 'General',
      fechaSubida: '15/05/2024',
      fechaVencimiento: '15/05/2026',
      estado: 'vigente',
      tamaño: '850 KB',
      responsable: 'Legal'
    },
    {
      id: 'DOC-027',
      nombre: 'Certificado ISO 9001',
      categoria: 'Otros',
      tipo: 'General',
      fechaSubida: '20/08/2024',
      fechaVencimiento: '20/08/2027',
      estado: 'vigente',
      tamaño: '1.2 MB',
      responsable: 'Calidad'
    },
    {
      id: 'DOC-028',
      nombre: 'Acta Junta General Ordinaria 2024',
      categoria: 'Otros',
      tipo: 'General',
      fechaSubida: '30/06/2024',
      estado: 'vigente',
      tamaño: '620 KB',
      responsable: 'Gerencia'
    }
  ]);

  const [pagos] = useState<Pago[]>([
    {
      id: 'PAG-001',
      concepto: 'Alquiler Can Farines Centro',
      categoria: 'Alquiler',
      monto: '2.500,00 €',
      fecha: '2025-12-01',
      estado: 'pagado',
      recurrente: true
    },
    {
      id: 'PAG-002',
      concepto: 'Alquiler Can Farines Llefià',
      categoria: 'Alquiler',
      monto: '1.800,00 €',
      fecha: '2025-12-01',
      estado: 'pagado',
      recurrente: true
    },
    {
      id: 'PAG-003',
      concepto: 'Alquiler Can Farines Poblenou',
      categoria: 'Alquiler',
      monto: '2.200,00 €',
      fecha: '2025-12-01',
      estado: 'pagado',
      recurrente: true
    },
    {
      id: 'PAG-004',
      concepto: 'Alquiler Can Farines Gràcia',
      categoria: 'Alquiler',
      monto: '2.100,00 €',
      fecha: '2025-12-01',
      estado: 'pagado',
      recurrente: true
    },
    {
      id: 'PAG-005',
      concepto: 'Seguridad Social Noviembre',
      categoria: 'Nóminas',
      monto: '4.850,00 €',
      fecha: '2025-12-05',
      estado: 'pendiente',
      recurrente: true
    },
    {
      id: 'PAG-006',
      concepto: 'Nóminas Empleados Noviembre',
      categoria: 'Nóminas',
      monto: '12.450,00 €',
      fecha: '2025-11-30',
      estado: 'pagado',
      recurrente: true
    },
    {
      id: 'PAG-007',
      concepto: 'IVA Trimestral Q4',
      categoria: 'Impuestos',
      monto: '8.500,00 €',
      fecha: '2026-01-20',
      estado: 'pendiente',
      recurrente: true
    },
    {
      id: 'PAG-008',
      concepto: 'Proveedor Harinas del Norte',
      categoria: 'Proveedores',
      monto: '3.200,00 €',
      fecha: '2025-11-25',
      estado: 'pagado',
      recurrente: false
    },
    {
      id: 'PAG-009',
      concepto: 'Electricidad Can Farines Centro',
      categoria: 'Suministros',
      monto: '450,00 €',
      fecha: '2025-12-10',
      estado: 'pendiente',
      recurrente: true
    },
    {
      id: 'PAG-010',
      concepto: 'Seguro Flota Vehículos',
      categoria: 'Seguros',
      monto: '1.250,00 €',
      fecha: '2026-03-20',
      estado: 'pendiente',
      recurrente: true
    }
  ]);

  const [gastos] = useState<Gasto[]>([
    {
      id: 'GAS-001',
      concepto: 'Compra de Papel',
      proveedor: 'Papelera S.A.',
      importe: '150,00 €',
      fecha: '2025-11-15',
      categoria: 'Suministros',
      adjunto: 'factura_papelera.pdf'
    },
    {
      id: 'GAS-002',
      concepto: 'Mantenimiento de Caja Registradora',
      proveedor: 'Tech Solutions',
      importe: '300,00 €',
      fecha: '2025-12-01',
      categoria: 'Mantenimiento',
      adjunto: 'factura_tech_solutions.pdf'
    },
    {
      id: 'GAS-003',
      concepto: 'Reparación de Impresora',
      proveedor: 'Impresoras Ltd.',
      importe: '200,00 €',
      fecha: '2025-12-10',
      categoria: 'Reparaciones',
      adjunto: 'factura_impresoras_ltd.pdf'
    }
  ]);

  const documentosFiltrados = documentos.filter(d => {
    switch (filtroActivo) {
      case 'contratos':
        return d.categoria === 'Contratos Empleados';
      case 'vehiculos':
        return d.categoria === 'Vehículos';
      case 'alquileres':
        return d.categoria === 'Contratos Alquiler';
      case 'licencias':
        return d.categoria === 'Licencias';
      case 'fiscalidad':
        return d.categoria === 'Fiscalidad';
      case 'sociedad':
        return d.categoria === 'Sociedad';
      case 'otros':
        return d.categoria === 'Otros';
      default:
        return false;
    }
  });

  const getEstadoBadge = (estado: string) => {
    switch (estado) {
      case 'vigente':
        return (
          <Badge className="bg-green-100 text-green-700 border-green-200">
            <CheckCircle2 className="w-3 h-3 mr-1" />
            Vigente
          </Badge>
        );
      case 'proximo-vencer':
        return (
          <Badge variant="outline" className="bg-yellow-100 text-yellow-700 border-yellow-200">
            <AlertCircle className="w-3 h-3 mr-1" />
            Próximo a Vencer
          </Badge>
        );
      case 'vencido':
        return (
          <Badge variant="outline" className="bg-red-100 text-red-700 border-red-200">
            <AlertCircle className="w-3 h-3 mr-1" />
            Vencido
          </Badge>
        );
      case 'archivado':
        return (
          <Badge variant="outline" className="bg-gray-100 text-gray-700 border-gray-200">
            <FileBadge className="w-3 h-3 mr-1" />
            Archivado
          </Badge>
        );
      default:
        return null;
    }
  };

  const getEstadoPagoBadge = (estado: string) => {
    switch (estado) {
      case 'pagado':
        return (
          <Badge className="bg-green-100 text-green-700 border-green-200">
            Pagado
          </Badge>
        );
      case 'pendiente':
        return (
          <Badge variant="outline" className="bg-yellow-100 text-yellow-700 border-yellow-200">
            Pendiente
          </Badge>
        );
      case 'vencido':
        return (
          <Badge variant="outline" className="bg-red-100 text-red-700 border-red-200">
            Vencido
          </Badge>
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-gray-900" style={{ fontFamily: 'Poppins, sans-serif' }}>
            Gestión Documental
          </h1>
          <p className="text-gray-600 text-sm">
            Documentación legal y administrativa de Can Farines
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            onClick={() => setModalSeleccionGastoOpen(true)}
            variant="outline"
            className="border-teal-600 text-teal-600 hover:bg-teal-50"
          >
            <Euro className="w-4 h-4 mr-2" />
            Subir Gasto
          </Button>
          <Button
            onClick={() => setModalDocumentoOpen(true)}
            className="bg-teal-600 hover:bg-teal-700"
          >
            <Upload className="w-4 h-4 mr-2" />
            Subir Documento
          </Button>
        </div>
      </div>

      {/* Filtros */}
      <div className="flex flex-wrap gap-2">
        <Button
          onClick={() => setFiltroActivo('sociedad')}
          variant={filtroActivo === 'sociedad' ? 'default' : 'outline'}
          className={filtroActivo === 'sociedad' ? 'bg-teal-600 hover:bg-teal-700' : ''}
        >
          <Building2 className="w-4 h-4 mr-2" />
          Sociedad
        </Button>
        <Button
          onClick={() => setFiltroActivo('vehiculos')}
          variant={filtroActivo === 'vehiculos' ? 'default' : 'outline'}
          className={filtroActivo === 'vehiculos' ? 'bg-teal-600 hover:bg-teal-700' : ''}
        >
          <Car className="w-4 h-4 mr-2" />
          Vehículos
        </Button>
        <Button
          onClick={() => setFiltroActivo('alquileres')}
          variant={filtroActivo === 'alquileres' ? 'default' : 'outline'}
          className={filtroActivo === 'alquileres' ? 'bg-teal-600 hover:bg-teal-700' : ''}
        >
          <Building2 className="w-4 h-4 mr-2" />
          Contratos
        </Button>
        <Button
          onClick={() => setFiltroActivo('licencias')}
          variant={filtroActivo === 'licencias' ? 'default' : 'outline'}
          className={filtroActivo === 'licencias' ? 'bg-teal-600 hover:bg-teal-700' : ''}
        >
          <Scale className="w-4 h-4 mr-2" />
          Licencias
        </Button>
        <Button
          onClick={() => setFiltroActivo('fiscalidad')}
          variant={filtroActivo === 'fiscalidad' ? 'default' : 'outline'}
          className={filtroActivo === 'fiscalidad' ? 'bg-teal-600 hover:bg-teal-700' : ''}
        >
          <Receipt className="w-4 h-4 mr-2" />
          Fiscalidad
        </Button>
        <Button
          onClick={() => setFiltroActivo('otros')}
          variant={filtroActivo === 'otros' ? 'default' : 'outline'}
          className={filtroActivo === 'otros' ? 'bg-teal-600 hover:bg-teal-700' : ''}
        >
          <FolderOpen className="w-4 h-4 mr-2" />
          Otros
        </Button>
        <Button
          onClick={() => setFiltroActivo('gastos')}
          variant={filtroActivo === 'gastos' ? 'default' : 'outline'}
          className={filtroActivo === 'gastos' ? 'bg-teal-600 hover:bg-teal-700' : ''}
        >
          <Euro className="w-4 h-4 mr-2" />
          Gastos
        </Button>
        <Button
          onClick={() => setFiltroActivo('agenda')}
          variant={filtroActivo === 'agenda' ? 'default' : 'outline'}
          className={filtroActivo === 'agenda' ? 'bg-teal-600 hover:bg-teal-700' : ''}
        >
          <CalendarDays className="w-4 h-4 mr-2" />
          Calendario
        </Button>
      </div>

      {/* Barra de búsqueda */}
      <div className="flex items-center gap-2">
        <Button variant="outline" className="flex items-center gap-2 border-gray-300">
          <Filter className="w-4 h-4" />
          Filtros
        </Button>
        <div className="relative flex-1">
          <FileText className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            placeholder="Buscar documentos, contratos o pagos..."
            className="w-full pl-10"
          />
        </div>
      </div>

      {/* Tabla de Documentos */}
      {filtroActivo !== 'agenda' && filtroActivo !== 'gastos' && (
        <Card>
          <CardHeader>
            <CardTitle style={{ fontFamily: 'Poppins, sans-serif' }}>
              {filtroActivo === 'puntoVenta' && 'Documentación de Punto de Venta'}
              {filtroActivo === 'contratos' && 'Contratos de Empleados'}
              {filtroActivo === 'vehiculos' && 'Documentación de Vehículos'}
              {filtroActivo === 'alquileres' && 'Contratos y Alquileres'}
              {filtroActivo === 'licencias' && 'Licencias y Permisos'}
              {filtroActivo === 'fiscalidad' && 'Documentación Fiscal'}
              {filtroActivo === 'sociedad' && 'Documentación Societaria'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Documento</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Fecha Subida</TableHead>
                  {filtroActivo !== 'puntoVenta' && <TableHead>Vencimiento</TableHead>}
                  <TableHead>Estado</TableHead>
                  <TableHead>Tamaño</TableHead>
                  <TableHead>Responsable</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {documentosFiltrados.map((doc) => (
                  <TableRow key={doc.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-teal-50 flex items-center justify-center">
                          <FileText className="w-5 h-5 text-teal-600" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{doc.nombre}</p>
                          <p className="text-xs text-gray-500">{doc.id}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                        {doc.tipo}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <p className="text-sm text-gray-600">{doc.fechaSubida}</p>
                    </TableCell>
                    {filtroActivo !== 'puntoVenta' && (
                      <TableCell>
                        <p className="text-sm text-gray-600">
                          {doc.fechaVencimiento || 'N/A'}
                        </p>
                      </TableCell>
                    )}
                    <TableCell>{getEstadoBadge(doc.estado)}</TableCell>
                    <TableCell>
                      <p className="text-sm text-gray-600">{doc.tamaño}</p>
                    </TableCell>
                    <TableCell>
                      <p className="text-sm text-gray-600">{doc.responsable}</p>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center gap-2 justify-end">
                        {filtroActivo === 'vehiculos' ? (
                          <>
                            <Button
                              onClick={() => toast.info(`Ver ficha de ${doc.nombre}`)}
                              variant="outline"
                              size="sm"
                            >
                              <FileBadge className="w-3 h-3 mr-1" />
                              Ficha
                            </Button>
                            <Button
                              onClick={() => toast.info(`Ver documentación de ${doc.nombre}`)}
                              variant="outline"
                              size="sm"
                            >
                              <FolderOpen className="w-3 h-3 mr-1" />
                              Documentación
                            </Button>
                            <Button
                              onClick={() => toast.info(`Ver seguro de ${doc.nombre}`)}
                              variant="outline"
                              size="sm"
                            >
                              <ShieldCheck className="w-3 h-3 mr-1" />
                              Seguro
                            </Button>
                          </>
                        ) : (
                          <>
                            <Button
                              onClick={() => toast.success(`Descargando ${doc.nombre}`)}
                              variant="outline"
                              size="sm"
                            >
                              <Download className="w-3 h-3 mr-1" />
                              Descargar
                            </Button>
                            <Button
                              onClick={() => toast.info(`Ver ${doc.nombre}`)}
                              variant="outline"
                              size="sm"
                            >
                              <Eye className="w-3 h-3" />
                            </Button>
                            <Button
                              onClick={() => toast.error(`Documento ${doc.nombre} eliminado`)}
                              variant="ghost"
                              size="sm"
                              className="text-red-600 hover:text-red-700 hover:bg-red-50"
                            >
                              <Trash2 className="w-3 h-3" />
                            </Button>
                          </>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Tabla de Gastos */}
      {filtroActivo === 'gastos' && (
        <Card>
          <CardHeader>
            <CardTitle style={{ fontFamily: 'Poppins, sans-serif' }}>
              Gestión de Gastos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Concepto</TableHead>
                  <TableHead>Fecha Subida</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>PVP</TableHead>
                  <TableHead>Acción asociada</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {gastos.map((gasto) => (
                  <TableRow key={gasto.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-teal-50 flex items-center justify-center">
                          <Euro className="w-5 h-5 text-teal-600" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{gasto.concepto}</p>
                          <p className="text-xs text-gray-500">{gasto.id}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <p className="text-sm text-gray-600">
                        {new Date(gasto.fecha).toLocaleDateString('es-ES', {
                          day: '2-digit',
                          month: '2-digit',
                          year: 'numeric'
                        })}
                      </p>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center justify-center w-8 h-8 rounded-full bg-green-100">
                        <CheckCircle2 className="w-5 h-5 text-green-600" />
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Euro className="w-3 h-3 text-gray-500" />
                        <span className="font-medium">{gasto.importe}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <p className="text-sm text-gray-600">{gasto.accionAsociada || 'N/A'}</p>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center gap-2 justify-end">
                        <Button
                          onClick={() => toast.success(`Descargando ${gasto.adjunto}`)}
                          variant="outline"
                          size="sm"
                        >
                          <Download className="w-3 h-3 mr-1" />
                          Descargar
                        </Button>
                        <Button
                          onClick={() => toast.info(`Ver ${gasto.adjunto}`)}
                          variant="outline"
                          size="sm"
                        >
                          <Eye className="w-3 h-3" />
                        </Button>
                        <Button
                          onClick={() => toast.error(`Gasto ${gasto.concepto} eliminado`)}
                          variant="ghost"
                          size="sm"
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Agenda de Pagos */}
      {filtroActivo === 'agenda' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Calendario */}
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle style={{ fontFamily: 'Poppins, sans-serif' }}>
                Calendario
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={setSelectedDate}
                className="rounded-md border"
              />
              <div className="mt-4 space-y-2">
                <Button 
                  onClick={() => setModalPagoOpen(true)}
                  className="w-full bg-teal-600 hover:bg-teal-700"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Añadir Pago
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Tabla de Pagos */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle style={{ fontFamily: 'Poppins, sans-serif' }}>
                  Calendario de Acciones
                </CardTitle>
                <Button
                  onClick={() => setModalPagoOpen(true)}
                  className="bg-teal-600 hover:bg-teal-700"
                  size="sm"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  + Añadir Evento
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Concepto</TableHead>
                    <TableHead>Categoría</TableHead>
                    <TableHead>Monto</TableHead>
                    <TableHead>Fecha</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead>Recurrente</TableHead>
                    <TableHead className="text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {pagos.map((pago) => (
                    <TableRow key={pago.id}>
                      <TableCell>
                        <p className="font-medium text-gray-900">{pago.concepto}</p>
                        <p className="text-xs text-gray-500">{pago.id}</p>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{pago.categoria}</Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Euro className="w-3 h-3 text-gray-500" />
                          <span className="font-medium">{pago.monto}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <p className="text-sm text-gray-600">{pago.fecha}</p>
                      </TableCell>
                      <TableCell>{getEstadoPagoBadge(pago.estado)}</TableCell>
                      <TableCell>
                        {pago.recurrente ? (
                          <Badge className="bg-blue-100 text-blue-700">
                            Recurrente
                          </Badge>
                        ) : (
                          <Badge variant="outline">Único</Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center gap-2 justify-end">
                          <Button
                            onClick={() => toast.success(`Marcando ${pago.concepto} como pagado`)}
                            variant="outline"
                            size="sm"
                            disabled={pago.estado === 'pagado'}
                          >
                            {pago.estado === 'pagado' ? 'Pagado' : 'Marcar Pagado'}
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Modal para Subir Documento */}
      <Dialog open={modalDocumentoOpen} onOpenChange={(open) => {
        setModalDocumentoOpen(open);
        if (!open) {
          // Reset al cerrar
          setPasoDocumento(1);
          setDocNombre('');
          setDocEmpresa('');
          setDocPuntoVenta('');
          setDocCategoria('sociedad');
          setDocVencimiento('');
          setDocCoste('');
          setDocObservaciones('');
          setDocCategoriaEBITDA('');
          setArchivoSeleccionado(null);
        }
      }}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle style={{ fontFamily: 'Poppins, sans-serif' }} className="flex items-center gap-2">
              <Upload className="w-5 h-5" />
              Subir Documento - Paso {pasoDocumento} de 2
            </DialogTitle>
            <DialogDescription className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-teal-600" />
              {pasoDocumento === 1 
                ? 'Completa la información básica del documento'
                : 'La IA ha extraído información automáticamente. Revisa y confirma'
              }
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            {/* FASE 1: Información Básica */}
            {pasoDocumento === 1 && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="nombre">Nombre del Documento *</Label>
                  <Input 
                    id="nombre" 
                    placeholder="Ej: Alquiler local Tiana" 
                    value={docNombre}
                    onChange={(e) => setDocNombre(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="categoria">Categoría *</Label>
                  <Select 
                    value={docCategoria} 
                    onValueChange={(value: any) => setDocCategoria(value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecciona una categoría" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="sociedad">Sociedad</SelectItem>
                      <SelectItem value="vehiculos">Vehículos</SelectItem>
                      <SelectItem value="contratos">Contratos y Alquileres</SelectItem>
                      <SelectItem value="licencias">Licencias</SelectItem>
                      <SelectItem value="fiscalidad">Fiscalidad</SelectItem>
                      <SelectItem value="otros">Otros</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="empresa">Empresa *</Label>
                  <Select value={docEmpresa} onValueChange={setDocEmpresa}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecciona una empresa" />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.values(EMPRESAS).map(empresa => (
                        <SelectItem key={empresa.id} value={empresa.id}>
                          {getNombreEmpresa(empresa.id)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="pdv">Punto de Venta</Label>
                  <Select 
                    value={docPuntoVenta} 
                    onValueChange={setDocPuntoVenta}
                    disabled={!docEmpresa}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={docEmpresa ? "Selecciona un punto de venta" : "Primero selecciona una empresa"} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="todos">Todos los puntos de venta</SelectItem>
                      {docEmpresa && Object.values(PUNTOS_VENTA)
                        .filter(pdv => pdv.empresaId === docEmpresa)
                        .map(pdv => (
                          <SelectItem key={pdv.id} value={pdv.id}>
                            {getNombrePDV(pdv.id)}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="archivo">Archivo *</Label>
                  <Input 
                    id="archivo" 
                    type="file"
                    accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                    onChange={(e) => {
                      const archivo = e.target.files?.[0];
                      if (archivo) {
                        setArchivoSeleccionado(archivo);
                      }
                    }}
                  />
                  {archivoSeleccionado && (
                    <div className="flex items-center gap-2 text-xs text-green-600 bg-green-50 px-3 py-2 rounded-md">
                      <CheckCircle2 className="w-4 h-4" />
                      <span>{archivoSeleccionado.name}</span>
                    </div>
                  )}
                </div>
              </>
            )}

            {/* FASE 2: Información Extraída por IA */}
            {pasoDocumento === 2 && (
              <>
                <div className="flex items-center gap-2 p-3 bg-teal-50 border border-teal-200 rounded-md mb-4">
                  <Sparkles className="w-5 h-5 text-teal-600" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-teal-900">Documento analizado con IA</p>
                    <p className="text-xs text-teal-700">Revisa y modifica los campos detectados</p>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="vencimiento">Fecha de Vencimiento</Label>
                  <Input 
                    id="vencimiento" 
                    type="date"
                    value={docVencimiento}
                    onChange={(e) => setDocVencimiento(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="coste">Coste (€)</Label>
                  <Input 
                    id="coste" 
                    type="number"
                    step="0.01"
                    value={docCoste}
                    onChange={(e) => setDocCoste(e.target.value)}
                    placeholder="0.00"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="categoriaEBITDA">Categoría para EBITDA</Label>
                  <Select value={docCategoriaEBITDA} onValueChange={setDocCategoriaEBITDA}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecciona categoría de gasto" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="alquiler">Alquiler / Arrendamiento</SelectItem>
                      <SelectItem value="seguros">Seguros</SelectItem>
                      <SelectItem value="suministros">Suministros (Luz, Agua, Gas)</SelectItem>
                      <SelectItem value="personal">Gastos de Personal</SelectItem>
                      <SelectItem value="mantenimiento">Mantenimiento</SelectItem>
                      <SelectItem value="marketing">Marketing y Publicidad</SelectItem>
                      <SelectItem value="tecnologia">Tecnología y Software</SelectItem>
                      <SelectItem value="asesoria">Asesoría Legal/Fiscal</SelectItem>
                      <SelectItem value="financieros">Gastos Financieros</SelectItem>
                      <SelectItem value="otros">Otros Gastos Operativos</SelectItem>
                      <SelectItem value="no_aplica">No Aplica al EBITDA</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-gray-500 mt-1">
                    Esta categorización ayudará a automatizar el cálculo del EBITDA
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="observaciones">Observaciones</Label>
                  <Input 
                    id="observaciones"
                    value={docObservaciones}
                    onChange={(e) => setDocObservaciones(e.target.value)}
                    placeholder="Observaciones adicionales..."
                  />
                </div>
              </>
            )}
          </div>
          <DialogFooter>
            {pasoDocumento === 1 ? (
              <>
                <Button variant="outline" onClick={() => setModalDocumentoOpen(false)}>
                  Cancelar
                </Button>
                <Button 
                  onClick={async () => {
                    // Validar campos obligatorios
                    if (!docNombre || !docCategoria || !docEmpresa || !archivoSeleccionado) {
                      toast.error('Por favor completa todos los campos obligatorios');
                      return;
                    }
                    
                    // Leer documento con IA
                    await leerDocumentoConIA(archivoSeleccionado, docCategoria);
                    
                    // Pasar a la fase 2
                    setPasoDocumento(2);
                  }}
                  className="bg-teal-600 hover:bg-teal-700"
                  disabled={!docNombre || !docCategoria || !docEmpresa || !archivoSeleccionado || leyendoDocumento}
                >
                  {leyendoDocumento ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Analizando...
                    </>
                  ) : (
                    <>
                      Continuar
                      <Sparkles className="w-4 h-4 ml-2" />
                    </>
                  )}
                </Button>
              </>
            ) : (
              <>
                <Button variant="outline" onClick={() => setPasoDocumento(1)}>
                  Atrás
                </Button>
                <Button 
                  onClick={() => {
                    setModalDocumentoOpen(false);
                    toast.success('Documento subido correctamente', {
                      description: `${docNombre} - ${docCategoria.charAt(0).toUpperCase() + docCategoria.slice(1)}`
                    });
                    
                    // Limpiar formulario
                    setPasoDocumento(1);
                    setDocNombre('');
                    setDocEmpresa('');
                    setDocPuntoVenta('');
                    setDocCategoria('sociedad');
                    setDocVencimiento('');
                    setDocCoste('');
                    setDocObservaciones('');
                    setDocCategoriaEBITDA('');
                    setArchivoSeleccionado(null);
                  }}
                  className="bg-teal-600 hover:bg-teal-700"
                >
                  <Upload className="w-4 h-4 mr-2" />
                  Subir Documento
                </Button>
              </>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal para Añadir Pago */}
      <Dialog open={modalPagoOpen} onOpenChange={setModalPagoOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle style={{ fontFamily: 'Poppins, sans-serif' }}>
              + Añadir Evento
            </DialogTitle>
            <DialogDescription>
              Recordatorios, reuniones...
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="concepto">Concepto</Label>
              <Input id="concepto" placeholder="Ej: Alquiler Diciembre" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="categoria">Categoría</Label>
              <Input id="categoria" placeholder="Ej: Alquiler" />
            </div>
            <div className="space-y-2">
              <div className="flex items-center space-x-2 mb-3">
                <Checkbox 
                  id="todo-dia" 
                  checked={todoDia}
                  onCheckedChange={(checked) => setTodoDia(checked as boolean)}
                />
                <label
                  htmlFor="todo-dia"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  Todo el día
                </label>
              </div>
              {!todoDia && (
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="fecha-date">Fecha</Label>
                    <Input 
                      id="fecha-date" 
                      type="date" 
                      placeholder="dd/mm/aaaa"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="fecha-time">Hora</Label>
                    <Input 
                      id="fecha-time" 
                      type="time"
                    />
                  </div>
                </div>
              )}
              {todoDia && (
                <div className="space-y-2">
                  <Label htmlFor="fecha-solo">Fecha</Label>
                  <Input 
                    id="fecha-solo" 
                    type="date" 
                    placeholder="dd/mm/aaaa"
                  />
                </div>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="observaciones">Observaciones</Label>
              <Input id="observaciones" placeholder="Añadir observaciones..." />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setModalPagoOpen(false)}>
              Cancelar
            </Button>
            <Button 
              onClick={() => {
                setModalPagoOpen(false);
                toast.success('Acción registrada correctamente');
              }}
              className="bg-teal-600 hover:bg-teal-700"
            >
              + Añadir Evento
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal de Selección para Subir Gasto */}
      <Dialog open={modalSeleccionGastoOpen} onOpenChange={setModalSeleccionGastoOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle style={{ fontFamily: 'Poppins, sans-serif' }}>
              Subir Gasto
            </DialogTitle>
            <DialogDescription>
              Selecciona cómo quieres registrar el gasto
            </DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-4 py-6">
            <Button
              onClick={() => {
                setModalSeleccionGastoOpen(false);
                handleEscanearTicket();
              }}
              variant="outline"
              className="h-32 flex flex-col items-center justify-center gap-3 border-2 border-teal-200 hover:bg-teal-50"
            >
              <Scan className="w-10 h-10 text-teal-600" />
              <span className="font-medium">Escanear con móvil</span>
            </Button>
            <Button
              onClick={() => {
                setModalSeleccionGastoOpen(false);
                setModalGastoOpen(true);
              }}
              variant="outline"
              className="h-32 flex flex-col items-center justify-center gap-3 border-2 border-teal-200 hover:bg-teal-50"
            >
              <FileText className="w-10 h-10 text-teal-600" />
              <span className="font-medium">Añadir manual</span>
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Modal para Subir Gasto */}
      <Dialog open={modalGastoOpen} onOpenChange={setModalGastoOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <div className="flex items-start justify-between">
              <div>
                <DialogTitle style={{ fontFamily: 'Poppins, sans-serif' }}>
                  Subir Gasto
                </DialogTitle>
                <DialogDescription>
                  Registra un nuevo gasto adjuntando la factura o ticket
                </DialogDescription>
              </div>
              <div className="flex flex-col items-end gap-2">
                <Button
                  variant="outline"
                  className="bg-orange-50 border-orange-200 text-orange-600 hover:bg-orange-100 hover:text-orange-700"
                  size="sm"
                  onClick={() => toast.info('Selecciona el archivo de la factura o ticket')}
                >
                  <Upload className="w-4 h-4 mr-2" />
                  Adjuntar Ticket/Factura
                </Button>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setMetodoPago('efectivo')}
                    className={metodoPago === 'efectivo' 
                      ? 'bg-teal-600 text-white hover:bg-teal-700 border-teal-600' 
                      : 'border-gray-300 text-gray-600'
                    }
                  >
                    Efectivo
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setMetodoPago('tarjeta')}
                    className={metodoPago === 'tarjeta' 
                      ? 'bg-teal-600 text-white hover:bg-teal-700 border-teal-600' 
                      : 'border-gray-300 text-gray-600'
                    }
                  >
                    Con Tarjeta
                  </Button>
                </div>
              </div>
            </div>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="gasto-concepto">Concepto del Gasto</Label>
              <Input 
                id="gasto-concepto" 
                placeholder="Ej: Material de oficina"
                defaultValue={datosGastoLeidos?.ocr_proveedor_nombre ? '' : ''}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="gasto-proveedor">Proveedor</Label>
                <Input 
                  id="gasto-proveedor" 
                  placeholder="Ej: Papelería S.A."
                  defaultValue={datosGastoLeidos?.ocr_proveedor_nombre || ''}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="gasto-nif">NIF Proveedor (opcional)</Label>
                <Input 
                  id="gasto-nif" 
                  placeholder="Ej: B12345678"
                  defaultValue={datosGastoLeidos?.ocr_nif_proveedor || ''}
                />
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="gasto-importe">Importe (€)</Label>
                <Input 
                  id="gasto-importe" 
                  type="number" 
                  step="0.01" 
                  placeholder="150,00"
                  defaultValue={datosGastoLeidos?.ocr_importe || ''}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="gasto-fecha">Fecha</Label>
                <Input 
                  id="gasto-fecha" 
                  type="date"
                  defaultValue={datosGastoLeidos?.ocr_fecha || ''}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="gasto-num-factura">Nº de Factura *</Label>
                <Input 
                  id="gasto-num-factura" 
                  placeholder="FAC-2024-1234"
                  defaultValue={datosGastoLeidos?.ocr_num_factura || ''}
                  required
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="gasto-categoria">Categoría</Label>
                <Input 
                  id="gasto-categoria" 
                  placeholder="Ej: Suministros"
                  defaultValue={datosGastoLeidos?.ocr_categoria_sugerida || ''}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="gasto-subtipo">Subtipo</Label>
                <Input 
                  id="gasto-subtipo" 
                  placeholder="Ej: Papel, Limpieza..."
                />
                <p className="text-xs text-gray-500">
                  Depende de la categoría seleccionada
                </p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="gasto-centro-coste">Centro de Coste</Label>
                <Input id="gasto-centro-coste" placeholder="Ej: Can Farines Centro" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="gasto-accion">Asociar evento del Calendario</Label>
                <Input id="gasto-accion" placeholder="Seleccionar evento..." />
              </div>
            </div>
            {datosGastoLeidos && (
              <div className="bg-teal-50 border border-teal-200 rounded-md p-3">
                <p className="text-sm text-teal-800 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4" />
                  Datos extraídos del ticket escaneado. Puedes modificarlos antes de guardar.
                </p>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setModalGastoOpen(false);
              setDatosGastoLeidos(null); // Limpiar datos OCR
            }}>
              Cancelar
            </Button>
            <Button 
              onClick={() => {
                // Recoger todos los datos del formulario
                const concepto = (document.getElementById('gasto-concepto') as HTMLInputElement)?.value;
                const proveedor = (document.getElementById('gasto-proveedor') as HTMLInputElement)?.value;
                const nif_proveedor = (document.getElementById('gasto-nif') as HTMLInputElement)?.value;
                const importe = parseFloat((document.getElementById('gasto-importe') as HTMLInputElement)?.value || '0');
                const fecha = (document.getElementById('gasto-fecha') as HTMLInputElement)?.value;
                const num_factura = (document.getElementById('gasto-num-factura') as HTMLInputElement)?.value;
                const categoria = (document.getElementById('gasto-categoria') as HTMLInputElement)?.value;
                const subtipo = (document.getElementById('gasto-subtipo') as HTMLInputElement)?.value;
                const centro_coste = (document.getElementById('gasto-centro-coste') as HTMLInputElement)?.value;
                
                // Crear objeto de gasto
                const nuevoGasto: Partial<GastoBBDD> = {
                  gasto_id: `GAS-${Date.now()}`,
                  empresa_id: 'EMP-001', // Obtener del contexto
                  punto_venta_id: 'PDV-001', // Obtener del contexto
                  concepto,
                  proveedor_nombre: proveedor,
                  nif_proveedor,
                  importe,
                  fecha_gasto: new Date(fecha),
                  categoria,
                  subtipo,
                  num_factura,
                  metodo_pago: metodoPago,
                  centro_coste,
                  estado: 'registrado',
                  ticket_url: datosGastoLeidos?.ticket_url || '',
                  evento_id: null
                };

                handleCrearGasto(nuevoGasto);
                
                setModalGastoOpen(false);
                setDatosGastoLeidos(null);
                toast.success('Gasto registrado correctamente');
              }}
              className="bg-teal-600 hover:bg-teal-700"
            >
              <Euro className="w-4 h-4 mr-2" />
              Registrar Gasto
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}