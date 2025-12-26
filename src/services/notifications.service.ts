/**
 * SERVICIO DE NOTIFICACIONES - Udar Edge
 * API Service listo para conectar con backend real
 */

import type {
  Notification,
  NotificationPreferences,
  NotificationStats,
  GetNotificationsRequest,
  GetNotificationsResponse,
  MarkAsReadRequest,
  MarkAsReadResponse,
  UpdatePreferencesRequest,
  UpdatePreferencesResponse,
  CreateNotificationRequest,
  CreateNotificationResponse,
  NotificationEvent
} from '../types/notifications.types';

// ==================== CONFIGURACIÓN ====================

const API_BASE_URL = '/api';
const NOTIFICATIONS_ENDPOINT = `${API_BASE_URL}/notifications`;

// ==================== MOCK DATA (Temporal - Para desarrollo) ====================

const MOCK_NOTIFICATIONS: Notification[] = [
  {
    id: 'not-001',
    tipo: 'pedido',
    titulo: 'Nuevo pedido recibido',
    mensaje: 'Pedido #1234 de Juan Pérez por 45.50€',
    descripcion: 'Mesa 5 - 3 platos principales, 2 postres',
    fecha: new Date(),
    status: 'sin_leer',
    prioridad: 'alta',
    usuarioId: 'usr-001',
    empresaId: 'emp-001',
    puntoVentaId: 'ptv-001',
    relacionId: 'ped-1234',
    relacionTipo: 'pedido',
    urlAccion: '/pedidos/ped-1234',
    accionTexto: 'Ver pedido',
    canales: ['push', 'in_app'],
    creadoEn: new Date(),
  },
  {
    id: 'not-002',
    tipo: 'stock',
    titulo: 'Stock bajo',
    mensaje: 'Harina de Trigo - Solo quedan 5 kg',
    descripcion: 'El stock está por debajo del mínimo configurado (10 kg)',
    fecha: new Date(Date.now() - 3600000),
    status: 'sin_leer',
    prioridad: 'urgente',
    usuarioId: 'usr-001',
    empresaId: 'emp-001',
    puntoVentaId: 'ptv-001',
    relacionId: 'art-045',
    relacionTipo: 'articulo',
    urlAccion: '/inventario/art-045',
    accionTexto: 'Ver inventario',
    canales: ['push', 'in_app', 'email'],
    creadoEn: new Date(Date.now() - 3600000),
  }
];

const MOCK_PREFERENCES: NotificationPreferences = {
  usuarioId: 'usr-001',
  canalesActivos: {
    email: true,
    push: true,
    sms: false,
    in_app: true,
  },
  preferencias: {
    pedido: {
      activo: true,
      canales: ['push', 'in_app'],
      sonido: true,
    },
    stock: {
      activo: true,
      canales: ['push', 'in_app', 'email'],
      sonido: true,
    },
    cita: {
      activo: true,
      canales: ['push', 'in_app', 'sms'],
      sonido: true,
    },
    promocion: {
      activo: true,
      canales: ['push', 'in_app'],
      sonido: false,
    },
    sistema: {
      activo: true,
      canales: ['in_app'],
      sonido: false,
    },
    pago: {
      activo: true,
      canales: ['push', 'in_app', 'email'],
      sonido: true,
    },
    alerta: {
      activo: true,
      canales: ['push', 'in_app', 'sms', 'email'],
      sonido: true,
    },
    mensaje: {
      activo: true,
      canales: ['push', 'in_app'],
      sonido: true,
    },
    rrhh: {
      activo: true,
      canales: ['push', 'in_app', 'email'],
      sonido: true,
    },
    invitacion: {
      activo: true,
      canales: ['push', 'in_app', 'email'],
      sonido: true,
    },
    fichaje: {
      activo: true,
      canales: ['push', 'in_app'],
      sonido: true,
    },
    nomina: {
      activo: true,
      canales: ['push', 'in_app', 'email'],
      sonido: true,
    },
    vacaciones: {
      activo: true,
      canales: ['push', 'in_app', 'email'],
      sonido: true,
    },
    formacion: {
      activo: true,
      canales: ['push', 'in_app'],
      sonido: false,
    },
  },
  horarioSilencioso: {
    activo: false,
    inicio: '22:00',
    fin: '08:00',
  },
  frecuenciaEmail: 'inmediato',
  agruparNotificaciones: true,
  actualizadoEn: new Date(),
};

// ==================== SERVICIO DE API ====================

class NotificationsService {
  private useMock = true; // Cambiar a false cuando el backend esté listo
  private listeners: ((event: NotificationEvent) => void)[] = [];
  
  // ==================== OBTENER NOTIFICACIONES ====================
  
  async getNotifications(request: GetNotificationsRequest): Promise<GetNotificationsResponse> {
    if (this.useMock) {
      return this.getMockNotifications(request);
    }
    
    try {
      const params = new URLSearchParams();
      params.append('usuarioId', request.usuarioId);
      if (request.empresaId) params.append('empresaId', request.empresaId);
      if (request.status) params.append('status', request.status.join(','));
      if (request.tipo) params.append('tipo', request.tipo.join(','));
      if (request.prioridad) params.append('prioridad', request.prioridad.join(','));
      if (request.desde) params.append('desde', request.desde.toISOString());
      if (request.hasta) params.append('hasta', request.hasta.toISOString());
      if (request.limit) params.append('limit', request.limit.toString());
      if (request.offset) params.append('offset', request.offset.toString());
      if (request.ordenarPor) params.append('ordenarPor', request.ordenarPor);
      if (request.ordenDir) params.append('ordenDir', request.ordenDir);
      
      const response = await fetch(`${NOTIFICATIONS_ENDPOINT}?${params.toString()}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.getToken()}`,
        },
      });
      
      if (!response.ok) {
        throw new Error(`Error al obtener notificaciones: ${response.statusText}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error en getNotifications:', error);
      throw error;
    }
  }
  
  // ==================== MARCAR COMO LEÍDA ====================
  
  async markAsRead(request: MarkAsReadRequest): Promise<MarkAsReadResponse> {
    if (this.useMock) {
      return this.mockMarkAsRead(request);
    }
    
    try {
      const response = await fetch(`${NOTIFICATIONS_ENDPOINT}/mark-read`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.getToken()}`,
        },
        body: JSON.stringify(request),
      });
      
      if (!response.ok) {
        throw new Error(`Error al marcar como leída: ${response.statusText}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error en markAsRead:', error);
      throw error;
    }
  }
  
  // ==================== MARCAR TODAS COMO LEÍDAS ====================
  
  async markAllAsRead(usuarioId: string): Promise<MarkAsReadResponse> {
    if (this.useMock) {
      return { success: true, actualizadas: MOCK_NOTIFICATIONS.length };
    }
    
    try {
      const response = await fetch(`${NOTIFICATIONS_ENDPOINT}/mark-all-read`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.getToken()}`,
        },
        body: JSON.stringify({ usuarioId }),
      });
      
      if (!response.ok) {
        throw new Error(`Error al marcar todas como leídas: ${response.statusText}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error en markAllAsRead:', error);
      throw error;
    }
  }
  
  // ==================== ARCHIVAR NOTIFICACIÓN ====================
  
  async archiveNotification(notificacionId: string, usuarioId: string): Promise<boolean> {
    if (this.useMock) {
      return true;
    }
    
    try {
      const response = await fetch(`${NOTIFICATIONS_ENDPOINT}/${notificacionId}/archive`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.getToken()}`,
        },
        body: JSON.stringify({ usuarioId }),
      });
      
      return response.ok;
    } catch (error) {
      console.error('Error en archiveNotification:', error);
      throw error;
    }
  }
  
  // ==================== ELIMINAR NOTIFICACIÓN ====================
  
  async deleteNotification(notificacionId: string, usuarioId: string): Promise<boolean> {
    if (this.useMock) {
      return true;
    }
    
    try {
      const response = await fetch(`${NOTIFICATIONS_ENDPOINT}/${notificacionId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.getToken()}`,
        },
        body: JSON.stringify({ usuarioId }),
      });
      
      return response.ok;
    } catch (error) {
      console.error('Error en deleteNotification:', error);
      throw error;
    }
  }
  
  // ==================== OBTENER PREFERENCIAS ====================
  
  async getPreferences(usuarioId: string): Promise<NotificationPreferences> {
    if (this.useMock) {
      return { ...MOCK_PREFERENCES, usuarioId };
    }
    
    try {
      const response = await fetch(`${NOTIFICATIONS_ENDPOINT}/preferences/${usuarioId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.getToken()}`,
        },
      });
      
      if (!response.ok) {
        throw new Error(`Error al obtener preferencias: ${response.statusText}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error en getPreferences:', error);
      throw error;
    }
  }
  
  // ==================== ACTUALIZAR PREFERENCIAS ====================
  
  async updatePreferences(request: UpdatePreferencesRequest): Promise<UpdatePreferencesResponse> {
    if (this.useMock) {
      return {
        success: true,
        preferencias: { ...MOCK_PREFERENCES, ...request.preferencias },
      };
    }
    
    try {
      const response = await fetch(`${NOTIFICATIONS_ENDPOINT}/preferences`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.getToken()}`,
        },
        body: JSON.stringify(request),
      });
      
      if (!response.ok) {
        throw new Error(`Error al actualizar preferencias: ${response.statusText}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error en updatePreferences:', error);
      throw error;
    }
  }
  
  // ==================== CREAR NOTIFICACIÓN ====================
  
  async createNotification(request: CreateNotificationRequest): Promise<CreateNotificationResponse> {
    if (this.useMock) {
      const newNotification: Notification = {
        id: `not-${Date.now()}`,
        ...request,
        fecha: new Date(),
        status: 'sin_leer',
        creadoEn: new Date(),
      };
      
      return {
        success: true,
        notificacion: newNotification,
      };
    }
    
    try {
      const response = await fetch(NOTIFICATIONS_ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.getToken()}`,
        },
        body: JSON.stringify(request),
      });
      
      if (!response.ok) {
        throw new Error(`Error al crear notificación: ${response.statusText}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error en createNotification:', error);
      throw error;
    }
  }
  
  // ==================== ESTADÍSTICAS ====================
  
  async getStats(usuarioId: string, empresaId?: string): Promise<NotificationStats> {
    if (this.useMock) {
      return this.getMockStats();
    }
    
    try {
      const params = new URLSearchParams();
      params.append('usuarioId', usuarioId);
      if (empresaId) params.append('empresaId', empresaId);
      
      const response = await fetch(`${NOTIFICATIONS_ENDPOINT}/stats?${params.toString()}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.getToken()}`,
        },
      });
      
      if (!response.ok) {
        throw new Error(`Error al obtener estadísticas: ${response.statusText}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error en getStats:', error);
      throw error;
    }
  }
  
  // ==================== EVENTOS EN TIEMPO REAL ====================
  
  subscribe(callback: (event: NotificationEvent) => void): () => void {
    this.listeners.push(callback);
    
    // En producción, aquí se establecería una conexión WebSocket
    // const ws = new WebSocket(`${WS_URL}/notifications`);
    // ws.onmessage = (event) => { callback(JSON.parse(event.data)); };
    
    return () => {
      this.listeners = this.listeners.filter(l => l !== callback);
    };
  }
  
  // ==================== HELPERS PRIVADOS ====================
  
  private getToken(): string {
    // Obtener token de autenticación (desde localStorage, cookie, etc.)
    return localStorage.getItem('auth_token') || '';
  }
  
  // ==================== MOCK IMPLEMENTATIONS ====================
  
  private getMockNotifications(request: GetNotificationsRequest): GetNotificationsResponse {
    let filtered = [...MOCK_NOTIFICATIONS];
    
    // Filtrar por status
    if (request.status && request.status.length > 0) {
      filtered = filtered.filter(n => request.status!.includes(n.status));
    }
    
    // Filtrar por tipo
    if (request.tipo && request.tipo.length > 0) {
      filtered = filtered.filter(n => request.tipo!.includes(n.tipo));
    }
    
    // Filtrar por prioridad
    if (request.prioridad && request.prioridad.length > 0) {
      filtered = filtered.filter(n => request.prioridad!.includes(n.prioridad));
    }
    
    // Ordenar
    if (request.ordenarPor === 'fecha') {
      filtered.sort((a, b) => {
        const diff = b.fecha.getTime() - a.fecha.getTime();
        return request.ordenDir === 'asc' ? -diff : diff;
      });
    }
    
    const sinLeer = filtered.filter(n => n.status === 'sin_leer').length;
    
    return {
      notificaciones: filtered,
      total: filtered.length,
      sinLeer,
      hasMore: false,
    };
  }
  
  private mockMarkAsRead(request: MarkAsReadRequest): MarkAsReadResponse {
    return {
      success: true,
      actualizadas: request.notificacionIds.length,
    };
  }
  
  private getMockStats(): NotificationStats {
    return {
      total: MOCK_NOTIFICATIONS.length,
      sinLeer: MOCK_NOTIFICATIONS.filter(n => n.status === 'sin_leer').length,
      leidas: MOCK_NOTIFICATIONS.filter(n => n.status === 'leida').length,
      archivadas: 0,
      porTipo: {
        pedido: 1,
        stock: 1,
        cita: 0,
        promocion: 0,
        sistema: 0,
        pago: 0,
        alerta: 0,
        mensaje: 0,
      },
      ultimaSemana: MOCK_NOTIFICATIONS.length,
      urgentes: MOCK_NOTIFICATIONS.filter(n => n.prioridad === 'urgente').length,
    };
  }
}

// ==================== EXPORT SINGLETON ====================

export const notificationsService = new NotificationsService();