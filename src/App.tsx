import React, { useState, useEffect, lazy, Suspense } from 'react';
import { SplashScreen } from './components/mobile/SplashScreen';
import { Onboarding } from './components/mobile/Onboarding';
import { PermissionsRequest } from './components/mobile/PermissionsRequest';
import { LoginViewMobile } from './components/LoginViewMobile';
import { LoadingFallback } from './components/LoadingFallback';
import { Toaster } from 'sonner@2.0.3';
import { APP_CONFIG, validateConfig } from './config/app.config';
import { ConnectionIndicator } from './components/mobile/ConnectionIndicator';
import { initOfflineService } from './services/offline.service';
import { initPushNotifications, initLocalNotifications } from './services/push-notifications.service';
import { useDeepLinks } from './hooks/useDeepLinks';
import { useLockPortrait } from './hooks/useOrientation';
import { useAppUpdate } from './hooks/useAppUpdate';
import { UpdateModal } from './components/mobile/UpdateModal';
import { analytics } from './services/analytics.service';
import { useTenant } from './hooks/useTenant';
import { CartProvider } from './contexts/CartContext';
import { ConfiguracionChatsProvider } from './contexts/ConfiguracionChatsContext';
import { StockProvider } from './contexts/StockContext';
import { ProductosProvider } from './contexts/ProductosContext';
import { CitasProvider } from './contexts/CitasContext';
import { CuponesProvider } from './contexts/CuponesContext';
import { PedidosProvider } from './contexts/PedidosContext';
import { inicializarPedidosDemo } from './data/pedidos-demo';
import { ErrorBoundary } from './components/ErrorBoundary';
import { initWebVitals } from './lib/web-vitals';
import { inicializarCronJobs } from './services/cron-jobs';
import { getConfig } from './config/white-label.config';
import { inicializarMarcasDefault } from './utils/marcasHelper';
import { SupabaseTest } from './components/SupabaseTest';

// Lazy Loading de componentes pesados
const ClienteDashboard = lazy(() => import('./components/ClienteDashboard').then(m => ({ default: m.ClienteDashboard })));
const TrabajadorDashboard = lazy(() => import('./components/TrabajadorDashboard').then(m => ({ default: m.TrabajadorDashboard })));
const GerenteDashboard = lazy(() => import('./components/GerenteDashboard').then(m => ({ default: m.GerenteDashboard })));

export type UserRole = 'cliente' | 'trabajador' | 'gerente' | null;

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
}

type AppState = 'splash' | 'onboarding' | 'login' | 'permissions' | 'app';

function App() {
  const [appState, setAppState] = useState<AppState>('splash');
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [showUpdateModal, setShowUpdateModal] = useState(false);

  const config = getConfig();

  // Sistema Multi-Tenant / White-Label
  const { tenant, branding, texts } = useTenant();

  // Activar Deep Links (solo funciona en nativo, ignorado en web)
  useDeepLinks();

  // Bloquear orientación en portrait (vertical)
  useLockPortrait();

  // Verificar actualizaciones
  const { versionInfo, goToStore } = useAppUpdate();

  // Configuración PWA/Mobile y validación
  useEffect(() => {
    // Validar configuración
    validateConfig();

    // Inicializar Analytics
    analytics.initialize();

    // Inicializar Web Vitals monitoring
    initWebVitals();
    
    // Inicializar Sistema de Marcas MADRE
    inicializarMarcasDefault();

    // Inicializar datos de demostración (pedidos)
    inicializarPedidosDemo();

    // Inicializar cron jobs
    inicializarCronJobs();

    // Cargar test helpers para Caja Rápida
    import('./utils/test-helpers-caja-rapida').catch(() => {
      // Ignorar errores si no se puede cargar
    });

    // Configurar viewport para mobile
    const viewport = document.querySelector('meta[name=viewport]');
    if (viewport) {
      viewport.setAttribute('content', 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no');
    }

    // Prevenir pull-to-refresh nativo (lo manejamos nosotros)
    document.body.style.overscrollBehavior = 'none';

    // Inicializar servicios offline y notificaciones
    initOfflineService().catch(() => {
      // Error handler - logged internamente
    });
    initPushNotifications().catch(() => {
      // Error handler - logged internamente
    });
    initLocalNotifications().catch(() => {
      // Error handler - logged internamente
    });

    // Log app info en desarrollo
    if (APP_CONFIG.features.debug) {
      console.info(`🚀 ${APP_CONFIG.app.name} v${APP_CONFIG.app.version}`);
    }

    // FLUJO DE INICIO: Splash → Onboarding → Login
    setTimeout(() => {
      if (config.onboarding.enabled) {
        setAppState('onboarding');
      } else {
        setAppState('login');
      }
    }, 2000); // 2 segundos de splash
  }, []);

  // Mostrar modal de actualización si hay nueva versión
  useEffect(() => {
    if (versionInfo?.updateAvailable) {
      setShowUpdateModal(true);
    }
  }, [versionInfo]);

  const handleLogin = (user: User) => {
    setCurrentUser(user);
    setAppState('permissions');
    // Analytics: Login
    analytics.setUserId(user.id);
    analytics.logLogin('email');
    analytics.logScreenView('Dashboard', user.role);
  };

  const handleLogout = () => {
    // Limpiar localStorage para asegurar que se recarga el usuario correctamente
    localStorage.removeItem('user');
    localStorage.removeItem('currentUser');
    setCurrentUser(null);
    setAppState('login');
  };

  const handleCambiarRol = (nuevoRol: 'cliente' | 'trabajador' | 'gerente') => {
    if (currentUser) {
      setCurrentUser({
        ...currentUser,
        role: nuevoRol
      });
    }
  };

  const handleOnboardingFinish = () => {
    setAppState('login');
  };

  const handleOnboardingSkip = () => {
    setAppState('login');
  };

  const handlePermissionsFinish = () => {
    setAppState('app');
  };

  // ============================================================================
  // RENDER POR ESTADOS
  // ============================================================================

  const OptimizedToaster = () => (
    <Toaster 
      position="top-center" 
      richColors
      expand={false}
      visibleToasts={1}
      duration={1500}
      closeButton
      gap={8}
      offset={16}
      toastOptions={{
        style: {
          pointerEvents: 'auto',
        },
        classNames: {
          toast: 'group-[.toaster]:shadow-lg group-[.toaster]:animate-in group-[.toaster]:slide-in-from-top-2',
          title: 'group-[.toast]:text-sm group-[.toast]:font-medium',
          description: 'group-[.toast]:text-xs',
          actionButton: 'group-[.toast]:bg-teal-600',
          cancelButton: 'group-[.toast]:bg-gray-200',
          closeButton: 'group-[.toast]:bg-white group-[.toast]:border group-[.toast]:border-gray-200',
        },
      }}
    />
  );

  // SPLASH SCREEN
  if (appState === 'splash') {
    return (
      <ErrorBoundary>
        <SplashScreen onFinish={() => {}} />
        <ConnectionIndicator />
        <OptimizedToaster />
      </ErrorBoundary>
    );
  }

  // ONBOARDING
  if (appState === 'onboarding') {
    return (
      <ErrorBoundary>
        <Onboarding 
          onFinish={handleOnboardingFinish}
          onSkip={handleOnboardingSkip}
        />
        <ConnectionIndicator />
        <OptimizedToaster />
      </ErrorBoundary>
    );
  }

  // LOGIN
  if (appState === 'login') {
    return (
      <ErrorBoundary>
        <ProductosProvider>
          <LoginViewMobile onLogin={handleLogin} />
          <SupabaseTest />
          <ConnectionIndicator />
          <OptimizedToaster />
        </ProductosProvider>
      </ErrorBoundary>
    );
  }

  // PERMISOS
  if (appState === 'permissions') {
    return (
      <ErrorBoundary>
        <PermissionsRequest 
          onFinish={handlePermissionsFinish}
          onSkip={handlePermissionsFinish}
        />
        <ConnectionIndicator />
        <OptimizedToaster />
      </ErrorBoundary>
    );
  }

  // APP PRINCIPAL
  if (appState === 'app' && currentUser) {
    return (
      <ErrorBoundary>
        <StockProvider>
          <ProductosProvider>
            <PedidosProvider> {/* Contexto de Pedidos */}
              <ConfiguracionChatsProvider>
                <CitasProvider>
                  <CuponesProvider>
                    <CartProvider>
                      {currentUser.role === 'cliente' && (
                        <Suspense fallback={<LoadingFallback />}>
                          <ClienteDashboard user={currentUser} onLogout={handleLogout} onCambiarRol={handleCambiarRol} />
                        </Suspense>
                      )}
                      {currentUser.role === 'trabajador' && (
                        <Suspense fallback={<LoadingFallback />}>
                          <TrabajadorDashboard user={currentUser} onLogout={handleLogout} onCambiarRol={handleCambiarRol} />
                        </Suspense>
                      )}
                      {currentUser.role === 'gerente' && (
                        <Suspense fallback={<LoadingFallback />}>
                          <GerenteDashboard user={currentUser} onLogout={handleLogout} onCambiarRol={handleCambiarRol} />
                        </Suspense>
                      )}
                    
                      <ConnectionIndicator />
                      
                      {/* Modal de actualización */}
                      <UpdateModal
                        isOpen={showUpdateModal}
                        onClose={() => setShowUpdateModal(false)}
                        currentVersion={versionInfo?.current || '1.0.0'}
                        latestVersion={versionInfo?.latest || '1.0.0'}
                        changelog={versionInfo?.changelog}
                        isRequired={versionInfo?.updateRequired || false}
                        onUpdate={goToStore}
                      />
                      
                      <OptimizedToaster />
                    </CartProvider>
                  </CuponesProvider>
                </CitasProvider>
              </ConfiguracionChatsProvider>
            </PedidosProvider> {/* FIN PedidosProvider */}
          </ProductosProvider>
        </StockProvider>
      </ErrorBoundary>
    );
  }

  // FALLBACK
  return null;
}

export default App;