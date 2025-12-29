/**
 * 🚀 SELECTOR RÁPIDO DE PERFILES
 * Botón flotante para cambiar entre Cliente, Trabajador y Gerente
 */

import { useState } from 'react';
import { User, ShoppingBag, Briefcase, Crown, X, ChevronRight } from 'lucide-react';
import { Button } from './ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from './ui/dialog';
import { UserRole } from '../App';

// ============================================================================
// TIPOS
// ============================================================================

interface Props {
  currentRole: UserRole;
  onCambiarRol: (nuevoRol: 'cliente' | 'trabajador' | 'gerente') => void;
  branding?: {
    primaryColor?: string;
    secondaryColor?: string;
  };
  // ⭐ NUEVO: Modo login rápido para onboarding/desarrollo
  modoLoginRapido?: boolean;
  onLoginRapido?: (rol: 'cliente' | 'trabajador' | 'gerente') => void;
}

interface PerfilOpcion {
  id: 'cliente' | 'trabajador' | 'gerente';
  nombre: string;
  descripcion: string;
  icono: React.ReactNode;
  color: string;
  colorHover: string;
  colorBg: string;
  badge?: string;
}

// ============================================================================
// COMPONENTE PRINCIPAL
// ============================================================================

export function SelectorRapidoPerfiles({ currentRole, onCambiarRol, branding, modoLoginRapido, onLoginRapido }: Props) {
  const [isOpen, setIsOpen] = useState(false);

  // Colores del tenant (HoyPecamos: negro y rojo)
  const primaryColor = branding?.primaryColor || '#ED1C24';
  const secondaryColor = branding?.secondaryColor || '#000000';

  // ============================================================================
  // DEFINICIÓN DE PERFILES
  // ============================================================================

  const perfiles: PerfilOpcion[] = [
    {
      id: 'cliente',
      nombre: 'Cliente',
      descripcion: 'Explora productos, haz pedidos y gestiona tus favoritos',
      icono: <ShoppingBag className="w-8 h-8" />,
      color: 'text-blue-600',
      colorHover: 'hover:bg-blue-50 hover:border-blue-300',
      colorBg: 'bg-blue-50/50',
      badge: '🛒'
    },
    {
      id: 'trabajador',
      nombre: 'Trabajador',
      descripcion: 'Gestiona pedidos, stock y operaciones diarias',
      icono: <Briefcase className="w-8 h-8" />,
      color: 'text-green-600',
      colorHover: 'hover:bg-green-50 hover:border-green-300',
      colorBg: 'bg-green-50/50',
      badge: '👨‍💼'
    },
    {
      id: 'gerente',
      nombre: 'Gerente',
      descripcion: 'Dashboards, métricas, análisis y configuración',
      icono: <Crown className="w-8 h-8" />,
      color: 'text-purple-600',
      colorHover: 'hover:bg-purple-50 hover:border-purple-300',
      colorBg: 'bg-purple-50/50',
      badge: '👑'
    }
  ];

  // ============================================================================
  // HANDLERS
  // ============================================================================

  const handleSeleccionarPerfil = (perfil: 'cliente' | 'trabajador' | 'gerente') => {
    console.log('🎯 SELECTOR RAPIDO: Seleccionado perfil:', perfil, 'Modo login rápido:', modoLoginRapido);
    
    // ⭐ MODO LOGIN RÁPIDO: Para onboarding/desarrollo sin usuario logueado
    if (modoLoginRapido && onLoginRapido) {
      console.log('✅ EJECUTANDO LOGIN RÁPIDO:', perfil);
      onLoginRapido(perfil);
      setIsOpen(false);
      return;
    }
    
    // Modo normal: Cambiar rol del usuario actual
    if (perfil !== currentRole) {
      console.log('✅ CAMBIANDO ROL:', currentRole, '→', perfil);
      onCambiarRol(perfil);
      setIsOpen(false);
    }
  };

  const obtenerPerfilActual = () => {
    return perfiles.find(p => p.id === currentRole);
  };

  const perfilActual = obtenerPerfilActual();

  // ============================================================================
  // RENDER
  // ============================================================================

  return (
    <>
      {/* BOTÓN FLOTANTE */}
      <div className="fixed bottom-6 right-6 z-[9999]">
        <Button
          onClick={() => {
            console.log('🔴 CLICK EN BOTÓN FLOTANTE');
            setIsOpen(true);
          }}
          className="h-14 w-14 rounded-full shadow-2xl transition-all duration-300 hover:scale-110 hover:shadow-3xl animate-pulse-subtle pointer-events-auto"
          style={{
            backgroundColor: primaryColor,
            border: `2px solid ${secondaryColor}`
          }}
          title="Cambiar perfil rápidamente"
        >
          <User className="w-6 h-6 text-white" />
        </Button>

        {/* Indicador de perfil actual */}
        {perfilActual && (
          <div className="absolute -top-2 -left-2 w-8 h-8 rounded-full bg-white shadow-lg flex items-center justify-center text-lg animate-bounce">
            {perfilActual.badge}
          </div>
        )}
      </div>

      {/* MODAL DE SELECCIÓN */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-[500px] p-0 overflow-hidden">
          {/* Header con gradiente */}
          <div 
            className="p-6 text-white"
            style={{
              background: `linear-gradient(135deg, ${primaryColor} 0%, ${secondaryColor} 100%)`
            }}
          >
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold text-white flex items-center gap-3">
                <User className="w-7 h-7" />
                Selector de Perfil
              </DialogTitle>
              <DialogDescription className="text-white/90 mt-2">
                Cambia rápidamente entre los diferentes roles de la aplicación
              </DialogDescription>
            </DialogHeader>
          </div>

          {/* Lista de perfiles */}
          <div className="p-6 space-y-3">
            {perfiles.map((perfil) => {
              const esActivo = !modoLoginRapido && perfil.id === currentRole;

              return (
                <button
                  key={perfil.id}
                  onClick={() => handleSeleccionarPerfil(perfil.id)}
                  disabled={esActivo}
                  className={`
                    w-full p-4 rounded-xl border-2 transition-all duration-200
                    ${esActivo 
                      ? `${perfil.colorBg} border-current ring-2 ring-offset-2 ${perfil.color.replace('text-', 'ring-')}` 
                      : `border-gray-200 ${perfil.colorHover}`
                    }
                    ${esActivo ? 'cursor-default' : 'cursor-pointer'}
                    flex items-start gap-4 relative
                  `}
                >
                  {/* Icono */}
                  <div className={`
                    ${esActivo ? perfil.color : 'text-gray-400'}
                    transition-colors duration-200
                  `}>
                    {perfil.icono}
                  </div>

                  {/* Contenido */}
                  <div className="flex-1 text-left">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-lg font-semibold text-gray-900">
                        {perfil.nombre}
                      </span>
                      <span className="text-2xl">{perfil.badge}</span>
                      {esActivo && (
                        <span 
                          className="ml-auto text-xs px-2 py-1 rounded-full text-white font-medium"
                          style={{ backgroundColor: primaryColor }}
                        >
                          Activo
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-600">
                      {perfil.descripcion}
                    </p>
                  </div>

                  {/* Flecha (solo si no está activo) */}
                  {!esActivo && (
                    <ChevronRight className="w-5 h-5 text-gray-400 mt-2" />
                  )}
                </button>
              );
            })}
          </div>

          {/* Footer */}
          <div className="px-6 pb-6 flex justify-between items-center">
            <p className="text-xs text-gray-500">
              Perfil actual: <span className="font-semibold text-gray-700">{perfilActual?.nombre}</span>
            </p>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsOpen(false)}
              className="gap-2"
            >
              <X className="w-4 h-4" />
              Cerrar
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Estilos adicionales para sombra 3xl */}
      <style>{`
        .shadow-3xl {
          box-shadow: 0 20px 50px -12px rgba(0, 0, 0, 0.35);
        }
      `}</style>
    </>
  );
}