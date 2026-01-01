import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../ui/dialog';
import { Card, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { CalendarDays, Users, Clock, TrendingUp } from 'lucide-react';

interface GestionHorariosRapidaProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

export function GestionHorariosRapida({ isOpen, onOpenChange }: GestionHorariosRapidaProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl flex items-center gap-2">
            <CalendarDays className="w-6 h-6 text-blue-600" />
            Gestión de Horarios
          </DialogTitle>
          <DialogDescription>
            Planifica turnos semanales y asigna empleados a puntos de venta
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 mt-4">
          {/* KPIs de la semana */}
          <div className="grid grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Total Horas</p>
                    <p className="text-2xl font-bold">280h</p>
                  </div>
                  <Clock className="w-8 h-8 text-blue-500" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Empleados</p>
                    <p className="text-2xl font-bold">12</p>
                  </div>
                  <Users className="w-8 h-8 text-green-500" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Coste Estimado</p>
                    <p className="text-2xl font-bold">4.2k€</p>
                  </div>
                  <TrendingUp className="w-8 h-8 text-orange-500" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Estado</p>
                    <Badge className="bg-orange-600">Borrador</Badge>
                  </div>
                  <CalendarDays className="w-8 h-8 text-purple-500" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Calendario Semanal */}
          <Card>
            <CardContent className="p-6">
              <div className="text-center py-12">
                <CalendarDays className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                <p className="text-gray-500 mb-4">Calendario de planificación de turnos</p>
                <p className="text-sm text-gray-400">
                  Esta funcionalidad ya existe en tu componente original.
                  <br />
                  Se puede integrar el modal completo de Gestión de Turnos aquí.
                </p>
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button className="bg-blue-600 hover:bg-blue-700">
              Publicar Horarios
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
