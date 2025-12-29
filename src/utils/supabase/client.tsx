import { createClient } from '@supabase/supabase-js';
import { projectId, publicAnonKey } from './info';

/**
 * CLIENTE SUPABASE SINGLETON
 * ===========================
 * Este singleton evita crear múltiples instancias de GoTrueClient
 * que pueden causar warnings en la consola del navegador.
 * 
 * IMPORTANTE: Siempre usar getSupabaseClient() en lugar de crear
 * nuevas instancias con createClient().
 */
let supabaseClient: ReturnType<typeof createClient> | null = null;

export function getSupabaseClient() {
  if (!supabaseClient) {
    supabaseClient = createClient(
      `https://${projectId}.supabase.co`,
      publicAnonKey,
      {
        auth: {
          // Usar el mismo storage key para evitar múltiples instancias
          storageKey: 'sb-vpvbrnlpseqtzgpozfhp-auth-token',
          autoRefreshToken: true,
          persistSession: true,
        }
      }
    );
    console.log('✅ Supabase client singleton inicializado');
  }
  return supabaseClient;
}

// URL base del servidor
export const API_BASE_URL = `https://${projectId}.supabase.co/functions/v1/make-server-ae2ba659`;

// Helper para hacer peticiones autenticadas
export async function fetchAPI(
  endpoint: string,
  options: RequestInit = {}
) {
  const supabase = getSupabaseClient();
  const { data: { session } } = await supabase.auth.getSession();
  
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${session?.access_token || publicAnonKey}`,
    ...options.headers,
  };

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Error desconocido' }));
    throw new Error(error.error || `HTTP ${response.status}`);
  }

  return response.json();
}
