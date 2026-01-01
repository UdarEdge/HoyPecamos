import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../ui/dialog';
import { DashboardOnboarding } from './DashboardOnboarding';

interface ModalGestionOnboardingProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  enOnboarding: number;
  progresoPromedioOnboarding: number;
}

export function ModalGestionOnboarding({ 
  isOpen, 
  onOpenChange,
  enOnboarding,
  progresoPromedioOnboarding 
}: ModalGestionOnboardingProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[95vw] lg:max-w-7xl max-h-[95vh] overflow-y-auto">
        <DialogHeader className="sr-only">
          <DialogTitle>Gestión de Onboarding</DialogTitle>
          <DialogDescription>
            Panel de control para gestionar procesos de incorporación de nuevos empleados
          </DialogDescription>
        </DialogHeader>
        
        {/* Dashboard Onboarding completo */}
        <DashboardOnboarding 
          empresaId="EMPRESA-001"
          gerenteId="GERENTE-001"
        />
      </DialogContent>
    </Dialog>
  );
}
