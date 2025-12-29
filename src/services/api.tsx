import { fetchAPI, getSupabaseClient } from '../utils/supabase/client.tsx';

// ==================== AUTENTICACIÓN ====================

export const authAPI = {
  async signup(email: string, password: string, nombre: string, rol: string, marcaId: string) {
    return fetchAPI('/auth/signup', {
      method: 'POST',
      body: JSON.stringify({ email, password, nombre, rol, marcaId }),
    });
  },

  async login(email: string, password: string) {
    return fetchAPI('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  },

  async logout() {
    const supabase = getSupabaseClient();
    return supabase.auth.signOut();
  },

  async getSession() {
    const supabase = getSupabaseClient();
    return supabase.auth.getSession();
  },

  async getUser() {
    const supabase = getSupabaseClient();
    return supabase.auth.getUser();
  },
};

// ==================== MARCAS/EMPRESAS ====================

export const marcasAPI = {
  async create(marcaData: any) {
    return fetchAPI('/marcas', {
      method: 'POST',
      body: JSON.stringify(marcaData),
    });
  },

  async getById(id: string) {
    return fetchAPI(`/marcas/${id}`);
  },

  async getAll() {
    return fetchAPI('/marcas');
  },

  async update(id: string, updates: any) {
    return fetchAPI(`/marcas/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  },
};

// ==================== PRODUCTOS ====================

export const productosAPI = {
  async create(productoData: any) {
    return fetchAPI('/productos', {
      method: 'POST',
      body: JSON.stringify(productoData),
    });
  },

  async getById(id: string) {
    return fetchAPI(`/productos/${id}`);
  },

  async getByMarca(marcaId: string) {
    return fetchAPI(`/productos/marca/${marcaId}`);
  },

  async update(id: string, updates: any) {
    return fetchAPI(`/productos/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  },

  async delete(id: string) {
    return fetchAPI(`/productos/${id}`, {
      method: 'DELETE',
    });
  },
};

// ==================== PEDIDOS ====================

export const pedidosAPI = {
  async create(pedidoData: any) {
    return fetchAPI('/pedidos', {
      method: 'POST',
      body: JSON.stringify(pedidoData),
    });
  },

  async getByUsuario(userId: string) {
    return fetchAPI(`/pedidos/usuario/${userId}`);
  },

  async getByMarca(marcaId: string) {
    return fetchAPI(`/pedidos/marca/${marcaId}`);
  },

  async update(id: string, updates: any) {
    return fetchAPI(`/pedidos/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  },
};

// ==================== PROVEEDORES ====================

export const proveedoresAPI = {
  async create(proveedorData: any) {
    return fetchAPI('/proveedores', {
      method: 'POST',
      body: JSON.stringify(proveedorData),
    });
  },

  async getByMarca(marcaId: string) {
    return fetchAPI(`/proveedores/marca/${marcaId}`);
  },

  async update(id: string, updates: any) {
    return fetchAPI(`/proveedores/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  },
};

// ==================== PLANES ====================

export const planesAPI = {
  async create(planData: any) {
    return fetchAPI('/planes', {
      method: 'POST',
      body: JSON.stringify(planData),
    });
  },

  async getByMarca(marcaId: string) {
    return fetchAPI(`/planes/marca/${marcaId}`);
  },
};

// ==================== CONFIGURACIÓN WHITE LABEL ====================

export const configAPI = {
  async save(marcaId: string, configData: any) {
    return fetchAPI(`/config/${marcaId}`, {
      method: 'POST',
      body: JSON.stringify(configData),
    });
  },

  async get(marcaId: string) {
    return fetchAPI(`/config/${marcaId}`);
  },
};

// ==================== HEALTH CHECK ====================

export const healthAPI = {
  async check() {
    return fetchAPI('/health');
  },
};

// ==================== DEBUG/TEST ENDPOINTS ====================

export const testAPI = {
  async createMarca(marcaData: any) {
    return fetchAPI('/test/marcas', {
      method: 'POST',
      body: JSON.stringify(marcaData),
    });
  },

  async migrarProductos(productos: any[]) {
    return fetchAPI('/test/productos/batch', {
      method: 'POST',
      body: JSON.stringify({ productos }),
    });
  },
};