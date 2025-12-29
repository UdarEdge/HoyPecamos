/**
 * 🧪 SIMULADOR DE WEBHOOKS
 * 
 * Herramienta de testing para simular webhooks de WhatsApp, Email y Marketplaces
 * sin necesidad de configurar las APIs reales.
 * 
 * Permite probar:
 * - Parseo de mensajes de WhatsApp
 * - Parseo de emails
 * - Webhooks de Glovo/Uber Eats
 * - Creación automática de pedidos
 */

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { toast } from 'sonner@2.0.3';
import { Send, Loader2, Check, AlertCircle } from 'lucide-react';
import { projectId, publicAnonKey } from '../../utils/supabase/info';

export function SimuladorWebhooks() {
  const [loading, setLoading] = useState(false);
  const [resultado, setResultado] = useState<any>(null);

  // Templates predefinidos
  const TEMPLATES = {
    whatsapp: {
      nombre: 'WhatsApp - Pedido Simple',
      payload: JSON.stringify({
        id: `wa-sim-${Date.now()}`,
        from: '+34612345678',
        timestamp: new Date().toISOString(),
        text: 'Quiero 2 pizzas margarita y 1 coca-cola',
        contact: {
          name: 'Cliente Simulado'
        }
      }, null, 2)
    },
    whatsappComplejo: {
      nombre: 'WhatsApp - Pedido Complejo',
      payload: JSON.stringify({
        id: `wa-sim-${Date.now()}`,
        from: '+34655123456',
        timestamp: new Date().toISOString(),
        text: 'Hola, necesito:\n• 3 hamburguesas completas\n• 2 pizzas pepperoni\n• 4 coca-colas\nSin cebolla en las hamburguesas por favor',
        contact: {
          name: 'María García'
        }
      }, null, 2)
    },
    email: {
      nombre: 'Email - Pedido con Tabla',
      payload: JSON.stringify({
        id: `email-sim-${Date.now()}`,
        from: 'cliente@example.com',
        subject: 'Pedido para HoyPecamos',
        timestamp: new Date().toISOString(),
        body: `
          <h2>Pedido</h2>
          <table>
            <tr><th>Cantidad</th><th>Producto</th><th>Precio</th></tr>
            <tr><td>2</td><td>Pizza Margarita</td><td>9.00€</td></tr>
            <tr><td>1</td><td>Coca-Cola</td><td>2.50€</td></tr>
          </table>
          <p>Dirección: Calle Mayor 123, 28001 Madrid</p>
          <p>Teléfono: 612 345 678</p>
          <p>Notas: Sin aceitunas</p>
        `,
        bodyText: `
          Pedido
          
          • 2 Pizza Margarita - 9.00€
          • 1 Coca-Cola - 2.50€
          
          Dirección: Calle Mayor 123, 28001 Madrid
          Teléfono: 612 345 678
          Notas: Sin aceitunas
        `
      }, null, 2)
    },
    glovo: {
      nombre: 'Glovo - Nuevo Pedido',
      payload: JSON.stringify({
        order_id: 'GLOVO-123456',
        event_type: 'order.created',
        created_at: new Date().toISOString(),
        customer: {
          name: 'Carlos Ruiz',
          phone: '+34677888999',
          email: 'carlos@example.com'
        },
        delivery: {
          address: 'Avenida Principal 456',
          postal_code: '28002',
          city: 'Madrid',
          notes: 'Timbre 2B'
        },
        items: [
          { name: 'Hamburguesa Completa', quantity: 1, price: 12.00 },
          { name: 'Patatas Fritas', quantity: 1, price: 3.50 }
        ],
        totals: {
          subtotal: 15.50,
          delivery_fee: 2.50,
          total: 18.00
        }
      }, null, 2)
    },
    uberEats: {
      nombre: 'Uber Eats - Nuevo Pedido',
      payload: JSON.stringify({
        id: `UE-${Date.now()}`,
        type: 'ORDER_CREATED',
        order: {
          id: 'UBER-789012',
          placed_at: new Date().toISOString(),
          eater: {
            first_name: 'Ana',
            last_name: 'López',
            phone: '+34611222333'
          },
          cart: {
            items: [
              { title: 'Pizza Pepperoni', quantity: 2, price: 10.50 },
              { title: 'Refresco', quantity: 2, price: 2.00 }
            ]
          },
          payment: {
            total: 25.00
          }
        }
      }, null, 2)
    }
  };

  const [payloadWhatsApp, setPayloadWhatsApp] = useState(TEMPLATES.whatsapp.payload);
  const [payloadEmail, setPayloadEmail] = useState(TEMPLATES.email.payload);
  const [payloadGlovo, setPayloadGlovo] = useState(TEMPLATES.glovo.payload);
  const [payloadUberEats, setPayloadUberEats] = useState(TEMPLATES.uberEats.payload);

  const enviarWebhookSimulado = async (canal: string, payload: string) => {
    setLoading(true);
    setResultado(null);

    try {
      // Parsear el payload
      const payloadObj = JSON.parse(payload);

      // Determinar el ID del canal e integración según el tipo
      let canalId = '';
      let integracionId = '';

      switch (canal) {
        case 'whatsapp':
          canalId = 'canal-whatsapp';
          integracionId = 'int-whatsapp-sim';
          break;
        case 'email':
          canalId = 'canal-email';
          integracionId = 'int-email-sim';
          break;
        case 'glovo':
          canalId = 'canal-marketplace';
          integracionId = 'int-glovo-sim';
          break;
        case 'uber_eats':
          canalId = 'canal-marketplace';
          integracionId = 'int-ubereats-sim';
          break;
      }

      // Enviar al backend
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-ae2ba659/webhooks/${canalId}/${integracionId}`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(payloadObj)
        }
      );

      const data = await response.json();

      if (data.success) {
        setResultado({
          tipo: 'exito',
          mensaje: data.message,
          datos: data.data
        });

        toast.success(
          <div>
            <div className="font-semibold mb-1">✅ Webhook enviado correctamente</div>
            <div className="text-sm opacity-90">
              El pedido se procesará automáticamente en unos segundos
            </div>
          </div>,
          { duration: 5000 }
        );
      } else {
        throw new Error(data.error || 'Error desconocido');
      }

    } catch (error: any) {
      console.error('Error enviando webhook simulado:', error);
      
      setResultado({
        tipo: 'error',
        mensaje: error.message,
        error: error
      });

      toast.error(
        <div>
          <div className="font-semibold mb-1">❌ Error al enviar webhook</div>
          <div className="text-sm opacity-90">{error.message}</div>
        </div>
      );
    } finally {
      setLoading(false);
    }
  };

  const cargarTemplate = (template: keyof typeof TEMPLATES, setter: (value: string) => void) => {
    setter(TEMPLATES[template].payload);
    toast.info(`Plantilla "${TEMPLATES[template].nombre}" cargada`);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          🧪 Simulador de Webhooks
        </CardTitle>
        <CardDescription>
          Simula webhooks de WhatsApp, Email y Marketplaces para probar el sistema sin APIs reales
        </CardDescription>
      </CardHeader>

      <CardContent>
        <Tabs defaultValue="whatsapp">
          <TabsList className="grid grid-cols-4 mb-6">
            <TabsTrigger value="whatsapp">📱 WhatsApp</TabsTrigger>
            <TabsTrigger value="email">📧 Email</TabsTrigger>
            <TabsTrigger value="glovo">🛵 Glovo</TabsTrigger>
            <TabsTrigger value="ubereats">🚗 Uber Eats</TabsTrigger>
          </TabsList>

          {/* WhatsApp */}
          <TabsContent value="whatsapp" className="space-y-4">
            <div className="flex gap-2 mb-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => cargarTemplate('whatsapp', setPayloadWhatsApp)}
              >
                Pedido Simple
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => cargarTemplate('whatsappComplejo', setPayloadWhatsApp)}
              >
                Pedido Complejo
              </Button>
            </div>

            <div>
              <Label>Payload JSON del Mensaje de WhatsApp</Label>
              <Textarea
                value={payloadWhatsApp}
                onChange={(e) => setPayloadWhatsApp(e.target.value)}
                rows={15}
                className="font-mono text-sm mt-2"
                placeholder='{"id": "wa-123", "from": "+34612345678", ...}'
              />
            </div>

            <Button
              onClick={() => enviarWebhookSimulado('whatsapp', payloadWhatsApp)}
              disabled={loading}
              className="w-full"
            >
              {loading ? (
                <>
                  <Loader2 className="size-4 mr-2 animate-spin" />
                  Enviando...
                </>
              ) : (
                <>
                  <Send className="size-4 mr-2" />
                  Enviar Webhook WhatsApp
                </>
              )}
            </Button>
          </TabsContent>

          {/* Email */}
          <TabsContent value="email" className="space-y-4">
            <div className="flex gap-2 mb-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => cargarTemplate('email', setPayloadEmail)}
              >
                Pedido con Tabla
              </Button>
            </div>

            <div>
              <Label>Payload JSON del Email</Label>
              <Textarea
                value={payloadEmail}
                onChange={(e) => setPayloadEmail(e.target.value)}
                rows={15}
                className="font-mono text-sm mt-2"
                placeholder='{"from": "cliente@example.com", "subject": "Pedido", ...}'
              />
            </div>

            <Button
              onClick={() => enviarWebhookSimulado('email', payloadEmail)}
              disabled={loading}
              className="w-full"
            >
              {loading ? (
                <>
                  <Loader2 className="size-4 mr-2 animate-spin" />
                  Enviando...
                </>
              ) : (
                <>
                  <Send className="size-4 mr-2" />
                  Enviar Webhook Email
                </>
              )}
            </Button>
          </TabsContent>

          {/* Glovo */}
          <TabsContent value="glovo" className="space-y-4">
            <div className="flex gap-2 mb-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => cargarTemplate('glovo', setPayloadGlovo)}
              >
                Nuevo Pedido
              </Button>
            </div>

            <div>
              <Label>Payload JSON de Glovo</Label>
              <Textarea
                value={payloadGlovo}
                onChange={(e) => setPayloadGlovo(e.target.value)}
                rows={15}
                className="font-mono text-sm mt-2"
                placeholder='{"order_id": "GLOVO-123", "event_type": "order.created", ...}'
              />
            </div>

            <Button
              onClick={() => enviarWebhookSimulado('glovo', payloadGlovo)}
              disabled={loading}
              className="w-full"
            >
              {loading ? (
                <>
                  <Loader2 className="size-4 mr-2 animate-spin" />
                  Enviando...
                </>
              ) : (
                <>
                  <Send className="size-4 mr-2" />
                  Enviar Webhook Glovo
                </>
              )}
            </Button>
          </TabsContent>

          {/* Uber Eats */}
          <TabsContent value="ubereats" className="space-y-4">
            <div className="flex gap-2 mb-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => cargarTemplate('uberEats', setPayloadUberEats)}
              >
                Nuevo Pedido
              </Button>
            </div>

            <div>
              <Label>Payload JSON de Uber Eats</Label>
              <Textarea
                value={payloadUberEats}
                onChange={(e) => setPayloadUberEats(e.target.value)}
                rows={15}
                className="font-mono text-sm mt-2"
                placeholder='{"id": "UE-123", "type": "ORDER_CREATED", ...}'
              />
            </div>

            <Button
              onClick={() => enviarWebhookSimulado('uber_eats', payloadUberEats)}
              disabled={loading}
              className="w-full"
            >
              {loading ? (
                <>
                  <Loader2 className="size-4 mr-2 animate-spin" />
                  Enviando...
                </>
              ) : (
                <>
                  <Send className="size-4 mr-2" />
                  Enviar Webhook Uber Eats
                </>
              )}
            </Button>
          </TabsContent>
        </Tabs>

        {/* Resultado */}
        {resultado && (
          <Card className={`mt-6 ${resultado.tipo === 'exito' ? 'border-green-500' : 'border-red-500'}`}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                {resultado.tipo === 'exito' ? (
                  <>
                    <Check className="size-5 text-green-600" />
                    <span>Webhook Enviado</span>
                  </>
                ) : (
                  <>
                    <AlertCircle className="size-5 text-red-600" />
                    <span>Error</span>
                  </>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div>
                  <span className="font-medium">Mensaje:</span> {resultado.mensaje}
                </div>
                {resultado.datos && (
                  <div>
                    <span className="font-medium">Detalles:</span>
                    <pre className="mt-2 p-3 bg-muted rounded text-xs overflow-auto">
                      {JSON.stringify(resultado.datos, null, 2)}
                    </pre>
                  </div>
                )}
              </div>

              {resultado.tipo === 'exito' && (
                <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded text-sm">
                  <p className="font-medium mb-1">ℹ️ Próximos pasos:</p>
                  <ol className="list-decimal list-inside space-y-1 text-sm">
                    <li>El webhook ha sido registrado en el backend</li>
                    <li>El procesador automático lo detectará en ~10 segundos</li>
                    <li>Se parseará el contenido y creará un pedido</li>
                    <li>Verás una notificación cuando el pedido esté creado</li>
                    <li>El pedido aparecerá en el dashboard con el badge del canal</li>
                  </ol>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </CardContent>
    </Card>
  );
}
