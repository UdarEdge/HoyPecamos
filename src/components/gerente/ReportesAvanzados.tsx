import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { ClipboardList, Percent, Euro, AlertCircle, TrendingDown, TrendingUp } from 'lucide-react';
import { Badge } from '../ui/badge';

interface ReportesAvanzadosProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ReportesAvanzados({ isOpen, onOpenChange }: ReportesAvanzadosProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl flex items-center gap-2">
            <ClipboardList className="w-6 h-6 text-purple-600" />
            Reportes Avanzados
          </DialogTitle>
          <DialogDescription>
            Análisis de absentismo, centros de costes y consumos internos
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="absentismo" className="w-full mt-4">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="absentismo">
              <AlertCircle className="w-4 h-4 mr-2" />
              Absentismo
            </TabsTrigger>
            <TabsTrigger value="costes">
              <Percent className="w-4 h-4 mr-2" />
              Centros de Costes
            </TabsTrigger>
            <TabsTrigger value="consumos">
              <Euro className="w-4 h-4 mr-2" />
              Consumos Internos
            </TabsTrigger>
          </TabsList>

          {/* TAB: ABSENTISMO */}
          <TabsContent value="absentismo" className="space-y-4 mt-4">
            <div className="grid grid-cols-3 gap-4">
              <Card className="border-l-4 border-l-red-500">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Tasa de Absentismo</p>
                      <p className="text-3xl font-bold text-red-700">8.5%</p>
                      <p className="text-xs text-gray-500 flex items-center gap-1 mt-1">
                        <TrendingUp className="w-3 h-3 text-red-500" />
                        +2.1% vs mes anterior
                      </p>
                    </div>
                    <AlertCircle className="w-10 h-10 text-red-500" />
                  </div>
                </CardContent>
              </Card>

              <Card className="border-l-4 border-l-orange-500">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Ausencias este mes</p>
                      <p className="text-3xl font-bold text-orange-700">12</p>
                      <p className="text-xs text-gray-500 mt-1">3 empleados afectados</p>
                    </div>
                    <AlertCircle className="w-10 h-10 text-orange-500" />
                  </div>
                </CardContent>
              </Card>

              <Card className="border-l-4 border-l-yellow-500">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Horas perdidas</p>
                      <p className="text-3xl font-bold text-yellow-700">68h</p>
                      <p className="text-xs text-gray-500 mt-1">Equivalente a 8.5 días</p>
                    </div>
                    <AlertCircle className="w-10 h-10 text-yellow-500" />
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Empleados con Mayor Absentismo</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {[
                    { nombre: 'Pedro Sánchez', ausencias: 4, porcentaje: 15.2 },
                    { nombre: 'Laura Fernández', ausencias: 3, porcentaje: 12.8 },
                    { nombre: 'David Martín', ausencias: 3, porcentaje: 11.5 },
                  ].map((emp, idx) => (
                    <div key={idx} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <p className="font-medium">{emp.nombre}</p>
                        <p className="text-sm text-gray-500">{emp.ausencias} ausencias</p>
                      </div>
                      <Badge className="bg-red-600">{emp.porcentaje}%</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* TAB: CENTROS DE COSTES */}
          <TabsContent value="costes" className="space-y-4 mt-4">
            <Card>
              <CardHeader>
                <CardTitle>Distribución por Punto de Venta</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    { pdv: 'Tiana', porcentaje: 45, coste: 19800 },
                    { pdv: 'Montgat', porcentaje: 35, coste: 15400 },
                    { pdv: 'Badalona', porcentaje: 20, coste: 8800 },
                  ].map((centro, idx) => (
                    <div key={idx} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">{centro.pdv}</p>
                          <p className="text-sm text-gray-500">{centro.coste.toLocaleString()}€/mes</p>
                        </div>
                        <Badge variant="outline">{centro.porcentaje}%</Badge>
                      </div>
                      <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-blue-600"
                          style={{ width: `${centro.porcentaje}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* TAB: CONSUMOS INTERNOS */}
          <TabsContent value="consumos" className="space-y-4 mt-4">
            <div className="grid grid-cols-2 gap-4">
              <Card className="border-l-4 border-l-purple-500">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Total Consumos</p>
                      <p className="text-3xl font-bold text-purple-700">1,250€</p>
                      <p className="text-xs text-gray-500 flex items-center gap-1 mt-1">
                        <TrendingDown className="w-3 h-3 text-green-500" />
                        -5.2% vs mes anterior
                      </p>
                    </div>
                    <Euro className="w-10 h-10 text-purple-500" />
                  </div>
                </CardContent>
              </Card>

              <Card className="border-l-4 border-l-green-500">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Solicitudes Pendientes</p>
                      <p className="text-3xl font-bold text-green-700">3</p>
                      <p className="text-xs text-gray-500 mt-1">285€ por aprobar</p>
                    </div>
                    <ClipboardList className="w-10 h-10 text-green-500" />
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Solicitudes Recientes</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-gray-500">
                  <Euro className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>Esta funcionalidad ya existe en tu componente original</p>
                  <p className="text-sm mt-1">Se puede integrar la sección de "Consumos Internos"</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
