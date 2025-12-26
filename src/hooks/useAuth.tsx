import { useState, useEffect } from 'react';
import { authAPI } from '../services/api';
import { getSupabaseClient } from '../utils/supabase/client';

interface User {
  id: string;
  email: string;
  nombre: string;
  rol: 'cliente' | 'trabajador' | 'gerente';
  marcaId: string;
  activo: boolean;
}

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [accessToken, setAccessToken] = useState<string | null>(null);

  useEffect(() => {
    // Verificar si hay una sesión activa al cargar
    checkSession();

    // Escuchar cambios en la autenticación
    const supabase = getSupabaseClient();
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event);
        
        if (session?.access_token) {
          setAccessToken(session.access_token);
          await loadUserData();
        } else {
          setUser(null);
          setAccessToken(null);
        }
        
        setLoading(false);
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  async function checkSession() {
    try {
      const { data: { session } } = await authAPI.getSession();
      
      if (session?.access_token) {
        setAccessToken(session.access_token);
        await loadUserData();
      }
    } catch (error) {
      console.error('Error al verificar sesión:', error);
    } finally {
      setLoading(false);
    }
  }

  async function loadUserData() {
    try {
      const { data: { user: authUser } } = await authAPI.getUser();
      
      if (authUser) {
        // Construir objeto de usuario desde metadata
        const userData: User = {
          id: authUser.id,
          email: authUser.email || '',
          nombre: authUser.user_metadata?.nombre || '',
          rol: authUser.user_metadata?.rol || 'cliente',
          marcaId: authUser.user_metadata?.marcaId || '',
          activo: true,
        };
        
        setUser(userData);
      }
    } catch (error) {
      console.error('Error al cargar datos de usuario:', error);
    }
  }

  async function signup(
    email: string,
    password: string,
    nombre: string,
    rol: 'cliente' | 'trabajador' | 'gerente',
    marcaId: string
  ) {
    try {
      setLoading(true);
      const response = await authAPI.signup(email, password, nombre, rol, marcaId);
      
      if (response.success) {
        // Ahora hacer login automáticamente
        await login(email, password);
        return { success: true };
      }
      
      return response;
    } catch (error: any) {
      console.error('Error en signup:', error);
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  }

  async function login(email: string, password: string) {
    try {
      setLoading(true);
      const response = await authAPI.login(email, password);
      
      if (response.success) {
        setAccessToken(response.accessToken);
        setUser(response.user);
        return { success: true, user: response.user };
      }
      
      return response;
    } catch (error: any) {
      console.error('Error en login:', error);
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  }

  async function logout() {
    try {
      setLoading(true);
      await authAPI.logout();
      setUser(null);
      setAccessToken(null);
      return { success: true };
    } catch (error: any) {
      console.error('Error en logout:', error);
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  }

  return {
    user,
    accessToken,
    loading,
    isAuthenticated: !!user,
    signup,
    login,
    logout,
  };
}
