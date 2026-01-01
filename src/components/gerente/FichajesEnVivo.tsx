import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../ui/dialog';
import { Card, CardContent } from '../ui/card';
import { Badge } from '../ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { Activity, Clock, CheckCircle, AlertCircle, Users } from 'lucide-react';

interface FichajesEnVivoProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

export function FichajesEnVivo({ isOpen, onOpenChange }: FichajesEnVivoProps) {
  const fichadosAhora = [
    { id: '1', nombre: 'Carlos Méndez', puesto: 'Panadero', pdv: 'Tiana', entrada: '06:05', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Carlos' },
    { id: '2', nombre: 'María González', puesto: 'Bollería', pdv: 'Montgat', entrada: '07:15', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Maria' },
    { id: '3', nombre: 'Laura Martínez', puesto: 'Dependienta', pdv: 'Montgat', entrada: '09:00', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Laura' },
  ];

  const noFichados = [
    { id: '4', nombre: 'Ana Rodríguez', puesto: 'Encargada', pdv: 'Montgat', horaEsperada: '08:00', retraso: 25 },
    { id: '5', nombre: 'Pedro Sánchez', puesto: 'Auxiliar', pdv: 'Tiana', horaEsperada: '10:00', retraso: 0 },
  ];

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl flex items-center gap-2">
            <Activity className="w-6 h-6 text-green-600 animate-pulse" />
            Fichajes en Tiempo Real
          </DialogTitle>
          <DialogDescription>
            Monitorización de entradas, salidas y estado actual del equipo
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 mt-4">
          {/* Resumen */}
          <div className="grid grid-cols-3 gap-4">
            <Card className="border-l-4 border-l-green-500">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Fichados Ahora</p>
                    <p className="text-3xl font-bold text-green-700">{fichadosAhora.length}</p>
                  </div>
                  <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
                    <CheckCircle className="w-6 h-6 text-green-700" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-l-red-500">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Retrasos</p>
                    <p className="text-3xl font-bold text-red-700">1</p>
                  </div>
                  <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center">
                    <AlertCircle className="w-6 h-6 text-red-700" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-l-blue-500">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Pendientes</p>
                    <p className="text-3xl font-bold text-blue-700">
                      {noFichados.filter(e => e.retraso === 0).length}
                    </p>
                  </div>
                  <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
                    <Clock className="w-6 h-6 text-blue-700" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Fichados Actualmente */}
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <h3 className="text-lg font-semibold">Actualmente Fichados ({fichadosAhora.length})</h3>
              </div>
              <div className="space-y-3">
                {fichadosAhora.map((emp) => (
                  <div key={emp.id} className="flex items-center justify-between p-4 border rounded-lg bg-green-50 border-green-200">
                    <div className="flex items-center gap-3">
                      <Avatar className="w-12 h-12 border-2 border-green-500">
                        <AvatarImage src={emp.avatar} />
                        <AvatarFallback>{emp.nombre.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-semibold">{emp.nombre}</p>
                        <p className="text-sm text-gray-600">{emp.puesto} • {emp.pdv}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge className="bg-green-600 mb-1">Fichado</Badge>
                      <p className="text-sm text-gray-600">Entrada: {emp.entrada}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Pendientes de Fichar */}
          <Card>
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold mb-4">Pendientes de Fichar ({noFichados.length})</h3>
              <div className="space-y-3">
                {noFichados.map((emp) => (
                  <div key={emp.id} className={`flex items-center justify-between p-4 border rounded-lg ${
                    emp.retraso > 0 ? 'bg-red-50 border-red-200' : 'bg-gray-50'
                  }`}>
                    <div className="flex items-center gap-3">
                      <Avatar className="w-12 h-12">
                        <AvatarFallback>{emp.nombre.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-semibold">{emp.nombre}</p>
                        <p className="text-sm text-gray-600">{emp.puesto} • {emp.pdv}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      {emp.retraso > 0 ? (
                        <>
                          <Badge className="bg-red-600 mb-1">Retraso {emp.retraso}min</Badge>
                          <p className="text-sm text-gray-600">Esperado: {emp.horaEsperada}</p>
                        </>
                      ) : (
                        <>
                          <Badge variant="outline" className="mb-1">Pendiente</Badge>
                          <p className="text-sm text-gray-600">Esperado: {emp.horaEsperada}</p>
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
}
