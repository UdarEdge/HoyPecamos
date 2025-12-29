/**
 * 🤖 PROCESADOR AUTOMÁTICO DE PEDIDOS DE CANALES
 * 
 * Componente invisible que:
 * 1. Escucha webhooks del backend
 * 2. Procesa mensajes de WhatsApp y emails automáticamente
 * 3. Crea pedidos en el sistema
 * 4. Notifica al gerente en tiempo real
 * 
 * IMPORTANTE: Este componente debe estar montado en el layout principal
 * para que funcione en segundo plano.
 */

import { useEffect, useRef, useState } from 'react';
import { toast } from 'sonner@2.0.3';
import { usePedidos } from '../../contexts/PedidosContext';
import { useProductos } from '../../contexts/ProductosContext';
import { projectId, publicAnonKey } from '../../utils/supabase/info';
import { 
  procesarWebhookCanal, 
  type ResultadoProcesamiento,
  type WebhookPayload 
} from '../../services/pedidos-canal-unificado.service';
import { Bell } from 'lucide-react';

export function ProcesadorPedidosCanales() {
  const { crearPedido } = usePedidos();
  const { productos } = useProductos();
  const [procesando, setProcesando] = useState(false);
  const lastCheckRef = useRef<Date>(new Date());
  const pollIntervalRef = useRef<NodeJS.Timeout | null>(null);

  /**
   * Convierte PedidoDelivery a formato de PedidosContext
   */
  const convertirParaContexto = (pedido: any, canalOrigen: string) => {
    return {
      clienteNombre: pedido.cliente?.nombre || 'Cliente Canal',
      clienteEmail: pedido.cliente?.email || '',
      clienteTelefono: pedido.cliente?.telefono || '',
      items: pedido.items || [],
      tipoEntrega: pedido.tipoEntrega || 'domicilio',
      direccionEntrega: pedido.cliente?.direccion || pedido.direccionEntrega,
      metodoPago: pedido.metodoPago || 'pendiente',
      observaciones: pedido.observaciones || '',
      marcaId: 'marca-default', // Se puede configurar
      puntoVentaId: 'pv-default',
      // Metadata del canal
      metadata: {
        canalOrigen,
        idAgregadorExterno: pedido.idAgregadorExterno,
        agregador: pedido.agregador
      }
    };
  };

  /**
   * Procesa un webhook recibido
   */
  const procesarWebhook = async (webhook: any) => {
    try {
      setProcesando(true);

      console.log('🔄 Procesando webhook:', webhook);

      // Determinar el canal del webhook
      const canal = webhook.detalles?.canal || 'desconocido';
      
      // Crear payload para el procesador
      const payload: WebhookPayload = {
        canal: canal as any,
        integracionId: webhook.integracion_id,
        datos: webhook.detalles?.payload || webhook.detalles,
        timestamp: new Date(webhook.timestamp)
      };

      // PROCESAR con el servicio unificado
      const resultado: ResultadoProcesamiento = await procesarWebhookCanal(
        payload,
        productos as any
      );

      console.log('📊 Resultado procesamiento:', resultado);

      // Si fue exitoso, crear el pedido
      if (resultado.exito && resultado.pedido) {
        
        // Convertir al formato del contexto
        const datosNuevoPedido = convertirParaContexto(resultado.pedido, resultado.canal);
        
        // Crear el pedido en el sistema
        const pedidoCreado = await crearPedido(datosNuevoPedido);
        
        console.log('✅ Pedido creado:', pedidoCreado);

        // Notificar según la confianza
        if (resultado.requiereConfirmacionManual) {
          toast.warning(
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Bell className="size-4" />
                <span>Nuevo pedido desde {getEmojiCanal(resultado.canal)} {getNombreCanal(resultado.canal)}</span>
              </div>
              <div className="text-sm opacity-90">
                ⚠️ Requiere confirmación manual (confianza: {Math.round((resultado.confianza || 0) * 100)}%)
              </div>
            </div>,
            { duration: 10000 }
          );
        } else {
          toast.success(
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Bell className="size-4" />
                <span>✅ Pedido automático desde {getEmojiCanal(resultado.canal)} {getNombreCanal(resultado.canal)}</span>
              </div>
              <div className="text-sm opacity-90">
                Cliente: {resultado.pedido.cliente.nombre}
              </div>
              <div className="text-sm opacity-90">
                Total: {resultado.pedido.total.toFixed(2)}€
              </div>
            </div>,
            { 
              duration: 8000,
              action: {
                label: 'Ver pedido',
                onClick: () => {
                  // Navegar al pedido
                  window.location.hash = `#pedido-${pedidoCreado.id}`;
                }
              }
            }
          );
        }

        // Sonido de notificación (opcional)
        if (window.AudioContext || (window as any).webkitAudioContext) {
          playNotificationSound();
        }

      } else {
        // Error en el procesamiento
        console.error('❌ Error procesando webhook:', resultado.error);
        
        toast.error(
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Bell className="size-4" />
              <span>Error procesando pedido desde {getNombreCanal(resultado.canal)}</span>
            </div>
            <div className="text-sm opacity-90">
              {resultado.error || 'Error desconocido'}
            </div>
          </div>,
          { duration: 6000 }
        );
      }

    } catch (error: any) {
      console.error('❌ Error fatal procesando webhook:', error);
      toast.error(`Error procesando pedido: ${error.message}`);
    } finally {
      setProcesando(false);
    }
  };

  /**
   * Polling para buscar nuevos webhooks
   * (En producción, esto sería con WebSockets o Server-Sent Events)
   */
  const checkNuevosWebhooks = async () => {
    try {
      // Obtener logs desde la última verificación
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-ae2ba659/logs/pendientes?desde=${lastCheckRef.current.toISOString()}`,
        {
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (!response.ok) {
        // Si la ruta no existe todavía, no mostrar error
        if (response.status === 404) return;
        throw new Error(`HTTP ${response.status}`);
      }

      const data = await response.json();

      if (data.success && data.data && data.data.length > 0) {
        console.log(`📥 ${data.data.length} webhooks pendientes de procesar`);

        // Procesar cada webhook
        for (const webhook of data.data) {
          await procesarWebhook(webhook);
        }

        // Actualizar timestamp
        lastCheckRef.current = new Date();
      }

    } catch (error: any) {
      // Solo loguear, no mostrar toast para no molestar
      if (error.message !== 'HTTP 404') {
        console.warn('Error verificando webhooks:', error.message);
      }
    }
  };

  /**
   * Iniciar polling al montar el componente
   */
  useEffect(() => {
    console.log('🤖 Procesador de pedidos canales iniciado');

    // Verificar cada 10 segundos
    pollIntervalRef.current = setInterval(checkNuevosWebhooks, 10000);

    // Verificar inmediatamente
    checkNuevosWebhooks();

    // Cleanup
    return () => {
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current);
      }
      console.log('🤖 Procesador de pedidos canales detenido');
    };
  }, [productos]);

  // Componente invisible
  return null;
}

// ============================================================================
// FUNCIONES DE UTILIDAD
// ============================================================================

function getNombreCanal(canal: string): string {
  const nombres: Record<string, string> = {
    whatsapp: 'WhatsApp',
    email: 'Email',
    glovo: 'Glovo',
    uber_eats: 'Uber Eats',
    justeat: 'Just Eat',
    deliveroo: 'Deliveroo',
    telefonico: 'Teléfono',
    tpv: 'TPV',
    online: 'Online'
  };
  return nombres[canal] || canal;
}

function getEmojiCanal(canal: string): string {
  const emojis: Record<string, string> = {
    whatsapp: '📱',
    email: '📧',
    glovo: '🛵',
    uber_eats: '🚗',
    justeat: '🍔',
    deliveroo: '🏍️',
    telefonico: '☎️',
    tpv: '🏪',
    online: '🌐'
  };
  return emojis[canal] || '📦';
}

/**
 * Reproduce sonido de notificación
 */
function playNotificationSound() {
  try {
    const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
    const audioContext = new AudioContext();
    
    // Crear tono de notificación (dos beeps)
    const playBeep = (frequency: number, startTime: number, duration: number) => {
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      oscillator.frequency.value = frequency;
      oscillator.type = 'sine';
      
      gainNode.gain.setValueAtTime(0.3, startTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, startTime + duration);
      
      oscillator.start(startTime);
      oscillator.stop(startTime + duration);
    };
    
    const now = audioContext.currentTime;
    playBeep(800, now, 0.1);
    playBeep(1000, now + 0.15, 0.1);
    
  } catch (error) {
    // Silenciar error si no hay soporte de audio
  }
}
