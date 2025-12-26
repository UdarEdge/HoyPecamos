import { Hono } from 'npm:hono';
import { cors } from 'npm:hono/cors';
import { logger } from 'npm:hono/logger';
import { createClient } from 'npm:@supabase/supabase-js@2';
import * as kv from './kv_store.tsx';

const app = new Hono();

// Middleware
app.use('*', cors());
app.use('*', logger(console.log));

// Supabase client
const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
);

// Helper: Verificar autenticación
async function verifyAuth(authHeader: string | null) {
  if (!authHeader) return null;
  const token = authHeader.split(' ')[1];
  const { data: { user }, error } = await supabase.auth.getUser(token);
  if (error || !user) return null;
  return user;
}

// ==================== AUTENTICACIÓN ====================

// Registro de usuario
app.post('/make-server-ae2ba659/auth/signup', async (c) => {
  try {
    const { email, password, nombre, rol, marcaId } = await c.req.json();
    
    const { data, error } = await supabase.auth.admin.createUser({
      email,
      password,
      user_metadata: { nombre, rol, marcaId },
      email_confirm: true // Auto-confirmar email (no hay servidor de email configurado)
    });

    if (error) throw error;

    // Guardar datos adicionales del usuario según su rol
    const userId = data.user.id;
    const userData = {
      id: userId,
      email,
      nombre,
      rol, // 'cliente', 'trabajador', 'gerente'
      marcaId,
      activo: true,
      createdAt: new Date().toISOString()
    };

    await kv.set(`usuario:${userId}`, userData);
    
    // Indexar por marca y rol
    await kv.set(`usuario:marca:${marcaId}:${userId}`, userId);
    await kv.set(`usuario:rol:${rol}:${userId}`, userId);

    return c.json({ success: true, userId, user: userData });
  } catch (error) {
    console.log('Error en signup:', error);
    return c.json({ error: `Error al registrar usuario: ${error.message}` }, 500);
  }
});

// Login
app.post('/make-server-ae2ba659/auth/login', async (c) => {
  try {
    const { email, password } = await c.req.json();
    
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (error) throw error;

    const userId = data.user.id;
    const userData = await kv.get(`usuario:${userId}`);

    return c.json({ 
      success: true, 
      accessToken: data.session.access_token,
      user: userData 
    });
  } catch (error) {
    console.log('Error en login:', error);
    return c.json({ error: `Error al iniciar sesión: ${error.message}` }, 401);
  }
});

// ==================== MARCAS/EMPRESAS ====================

// Crear marca
app.post('/make-server-ae2ba659/marcas', async (c) => {
  try {
    const user = await verifyAuth(c.req.header('Authorization'));
    if (!user) return c.json({ error: 'No autorizado' }, 401);

    const marcaData = await c.req.json();
    const marcaId = `MRC-${Date.now()}`;
    
    const marca = {
      id: marcaId,
      ...marcaData,
      createdAt: new Date().toISOString()
    };

    await kv.set(`marca:${marcaId}`, marca);
    
    return c.json({ success: true, marca });
  } catch (error) {
    console.log('Error al crear marca:', error);
    return c.json({ error: `Error al crear marca: ${error.message}` }, 500);
  }
});

// Obtener marca por ID
app.get('/make-server-ae2ba659/marcas/:id', async (c) => {
  try {
    const marcaId = c.req.param('id');
    const marca = await kv.get(`marca:${marcaId}`);
    
    if (!marca) {
      return c.json({ error: 'Marca no encontrada' }, 404);
    }
    
    return c.json({ success: true, marca });
  } catch (error) {
    console.log('Error al obtener marca:', error);
    return c.json({ error: `Error al obtener marca: ${error.message}` }, 500);
  }
});

// Listar todas las marcas
app.get('/make-server-ae2ba659/marcas', async (c) => {
  try {
    const marcasKeys = await kv.getByPrefix('marca:MRC-');
    return c.json({ success: true, marcas: marcasKeys });
  } catch (error) {
    console.log('Error al listar marcas:', error);
    return c.json({ error: `Error al listar marcas: ${error.message}` }, 500);
  }
});

// Actualizar marca
app.put('/make-server-ae2ba659/marcas/:id', async (c) => {
  try {
    const user = await verifyAuth(c.req.header('Authorization'));
    if (!user) return c.json({ error: 'No autorizado' }, 401);

    const marcaId = c.req.param('id');
    const updates = await c.req.json();
    
    const marcaActual = await kv.get(`marca:${marcaId}`);
    if (!marcaActual) {
      return c.json({ error: 'Marca no encontrada' }, 404);
    }
    
    const marcaActualizada = {
      ...marcaActual,
      ...updates,
      updatedAt: new Date().toISOString()
    };
    
    await kv.set(`marca:${marcaId}`, marcaActualizada);
    
    return c.json({ success: true, marca: marcaActualizada });
  } catch (error) {
    console.log('Error al actualizar marca:', error);
    return c.json({ error: `Error al actualizar marca: ${error.message}` }, 500);
  }
});

// ==================== PRODUCTOS ====================

// Crear producto
app.post('/make-server-ae2ba659/productos', async (c) => {
  try {
    const user = await verifyAuth(c.req.header('Authorization'));
    if (!user) return c.json({ error: 'No autorizado' }, 401);

    const productoData = await c.req.json();
    const productoId = productoData.id || `PROD-${Date.now()}`;
    
    const producto = {
      ...productoData,
      id: productoId,
      createdAt: new Date().toISOString()
    };

    await kv.set(`producto:${productoId}`, producto);
    
    // Indexar por marca
    if (producto.marcas_ids && Array.isArray(producto.marcas_ids)) {
      for (const marcaId of producto.marcas_ids) {
        await kv.set(`producto:marca:${marcaId}:${productoId}`, productoId);
      }
    }
    
    return c.json({ success: true, producto });
  } catch (error) {
    console.log('Error al crear producto:', error);
    return c.json({ error: `Error al crear producto: ${error.message}` }, 500);
  }
});

// Obtener productos por marca
app.get('/make-server-ae2ba659/productos/marca/:marcaId', async (c) => {
  try {
    const marcaId = c.req.param('marcaId');
    const productosIds = await kv.getByPrefix(`producto:marca:${marcaId}:`);
    
    const productos = [];
    for (const id of productosIds) {
      const producto = await kv.get(`producto:${id}`);
      if (producto) productos.push(producto);
    }
    
    return c.json({ success: true, productos });
  } catch (error) {
    console.log('Error al obtener productos:', error);
    return c.json({ error: `Error al obtener productos: ${error.message}` }, 500);
  }
});

// Obtener producto por ID
app.get('/make-server-ae2ba659/productos/:id', async (c) => {
  try {
    const productoId = c.req.param('id');
    const producto = await kv.get(`producto:${productoId}`);
    
    if (!producto) {
      return c.json({ error: 'Producto no encontrado' }, 404);
    }
    
    return c.json({ success: true, producto });
  } catch (error) {
    console.log('Error al obtener producto:', error);
    return c.json({ error: `Error al obtener producto: ${error.message}` }, 500);
  }
});

// Actualizar producto
app.put('/make-server-ae2ba659/productos/:id', async (c) => {
  try {
    const user = await verifyAuth(c.req.header('Authorization'));
    if (!user) return c.json({ error: 'No autorizado' }, 401);

    const productoId = c.req.param('id');
    const updates = await c.req.json();
    
    const productoActual = await kv.get(`producto:${productoId}`);
    if (!productoActual) {
      return c.json({ error: 'Producto no encontrado' }, 404);
    }
    
    const productoActualizado = {
      ...productoActual,
      ...updates,
      updatedAt: new Date().toISOString()
    };
    
    await kv.set(`producto:${productoId}`, productoActualizado);
    
    return c.json({ success: true, producto: productoActualizado });
  } catch (error) {
    console.log('Error al actualizar producto:', error);
    return c.json({ error: `Error al actualizar producto: ${error.message}` }, 500);
  }
});

// Eliminar producto
app.delete('/make-server-ae2ba659/productos/:id', async (c) => {
  try {
    const user = await verifyAuth(c.req.header('Authorization'));
    if (!user) return c.json({ error: 'No autorizado' }, 401);

    const productoId = c.req.param('id');
    const producto = await kv.get(`producto:${productoId}`);
    
    if (!producto) {
      return c.json({ error: 'Producto no encontrado' }, 404);
    }
    
    await kv.del(`producto:${productoId}`);
    
    // Eliminar índices
    if (producto.marcas_ids && Array.isArray(producto.marcas_ids)) {
      for (const marcaId of producto.marcas_ids) {
        await kv.del(`producto:marca:${marcaId}:${productoId}`);
      }
    }
    
    return c.json({ success: true, message: 'Producto eliminado' });
  } catch (error) {
    console.log('Error al eliminar producto:', error);
    return c.json({ error: `Error al eliminar producto: ${error.message}` }, 500);
  }
});

// ==================== PEDIDOS ====================

// Crear pedido
app.post('/make-server-ae2ba659/pedidos', async (c) => {
  try {
    const user = await verifyAuth(c.req.header('Authorization'));
    if (!user) return c.json({ error: 'No autorizado' }, 401);

    const pedidoData = await c.req.json();
    const pedidoId = `PED-${Date.now()}`;
    
    const pedido = {
      ...pedidoData,
      id: pedidoId,
      userId: user.id,
      estado: 'pendiente',
      createdAt: new Date().toISOString()
    };

    await kv.set(`pedido:${pedidoId}`, pedido);
    
    // Indexar por usuario y marca
    await kv.set(`pedido:usuario:${user.id}:${pedidoId}`, pedidoId);
    if (pedido.marcaId) {
      await kv.set(`pedido:marca:${pedido.marcaId}:${pedidoId}`, pedidoId);
    }
    
    return c.json({ success: true, pedido });
  } catch (error) {
    console.log('Error al crear pedido:', error);
    return c.json({ error: `Error al crear pedido: ${error.message}` }, 500);
  }
});

// Obtener pedidos por usuario
app.get('/make-server-ae2ba659/pedidos/usuario/:userId', async (c) => {
  try {
    const user = await verifyAuth(c.req.header('Authorization'));
    if (!user) return c.json({ error: 'No autorizado' }, 401);

    const userId = c.req.param('userId');
    const pedidosIds = await kv.getByPrefix(`pedido:usuario:${userId}:`);
    
    const pedidos = [];
    for (const id of pedidosIds) {
      const pedido = await kv.get(`pedido:${id}`);
      if (pedido) pedidos.push(pedido);
    }
    
    return c.json({ success: true, pedidos });
  } catch (error) {
    console.log('Error al obtener pedidos:', error);
    return c.json({ error: `Error al obtener pedidos: ${error.message}` }, 500);
  }
});

// Obtener pedidos por marca
app.get('/make-server-ae2ba659/pedidos/marca/:marcaId', async (c) => {
  try {
    const user = await verifyAuth(c.req.header('Authorization'));
    if (!user) return c.json({ error: 'No autorizado' }, 401);

    const marcaId = c.req.param('marcaId');
    const pedidosIds = await kv.getByPrefix(`pedido:marca:${marcaId}:`);
    
    const pedidos = [];
    for (const id of pedidosIds) {
      const pedido = await kv.get(`pedido:${id}`);
      if (pedido) pedidos.push(pedido);
    }
    
    return c.json({ success: true, pedidos });
  } catch (error) {
    console.log('Error al obtener pedidos:', error);
    return c.json({ error: `Error al obtener pedidos: ${error.message}` }, 500);
  }
});

// Actualizar estado de pedido
app.put('/make-server-ae2ba659/pedidos/:id', async (c) => {
  try {
    const user = await verifyAuth(c.req.header('Authorization'));
    if (!user) return c.json({ error: 'No autorizado' }, 401);

    const pedidoId = c.req.param('id');
    const updates = await c.req.json();
    
    const pedidoActual = await kv.get(`pedido:${pedidoId}`);
    if (!pedidoActual) {
      return c.json({ error: 'Pedido no encontrado' }, 404);
    }
    
    const pedidoActualizado = {
      ...pedidoActual,
      ...updates,
      updatedAt: new Date().toISOString()
    };
    
    await kv.set(`pedido:${pedidoId}`, pedidoActualizado);
    
    return c.json({ success: true, pedido: pedidoActualizado });
  } catch (error) {
    console.log('Error al actualizar pedido:', error);
    return c.json({ error: `Error al actualizar pedido: ${error.message}` }, 500);
  }
});

// ==================== PROVEEDORES ====================

// Crear proveedor
app.post('/make-server-ae2ba659/proveedores', async (c) => {
  try {
    const user = await verifyAuth(c.req.header('Authorization'));
    if (!user) return c.json({ error: 'No autorizado' }, 401);

    const proveedorData = await c.req.json();
    const proveedorId = `PROV-${Date.now()}`;
    
    const proveedor = {
      ...proveedorData,
      id: proveedorId,
      createdAt: new Date().toISOString()
    };

    await kv.set(`proveedor:${proveedorId}`, proveedor);
    
    // Indexar por marca
    if (proveedor.marcaId) {
      await kv.set(`proveedor:marca:${proveedor.marcaId}:${proveedorId}`, proveedorId);
    }
    
    return c.json({ success: true, proveedor });
  } catch (error) {
    console.log('Error al crear proveedor:', error);
    return c.json({ error: `Error al crear proveedor: ${error.message}` }, 500);
  }
});

// Obtener proveedores por marca
app.get('/make-server-ae2ba659/proveedores/marca/:marcaId', async (c) => {
  try {
    const user = await verifyAuth(c.req.header('Authorization'));
    if (!user) return c.json({ error: 'No autorizado' }, 401);

    const marcaId = c.req.param('marcaId');
    const proveedoresIds = await kv.getByPrefix(`proveedor:marca:${marcaId}:`);
    
    const proveedores = [];
    for (const id of proveedoresIds) {
      const proveedor = await kv.get(`proveedor:${id}`);
      if (proveedor) proveedores.push(proveedor);
    }
    
    return c.json({ success: true, proveedores });
  } catch (error) {
    console.log('Error al obtener proveedores:', error);
    return c.json({ error: `Error al obtener proveedores: ${error.message}` }, 500);
  }
});

// Actualizar proveedor
app.put('/make-server-ae2ba659/proveedores/:id', async (c) => {
  try {
    const user = await verifyAuth(c.req.header('Authorization'));
    if (!user) return c.json({ error: 'No autorizado' }, 401);

    const proveedorId = c.req.param('id');
    const updates = await c.req.json();
    
    const proveedorActual = await kv.get(`proveedor:${proveedorId}`);
    if (!proveedorActual) {
      return c.json({ error: 'Proveedor no encontrado' }, 404);
    }
    
    const proveedorActualizado = {
      ...proveedorActual,
      ...updates,
      updatedAt: new Date().toISOString()
    };
    
    await kv.set(`proveedor:${proveedorId}`, proveedorActualizado);
    
    return c.json({ success: true, proveedor: proveedorActualizado });
  } catch (error) {
    console.log('Error al actualizar proveedor:', error);
    return c.json({ error: `Error al actualizar proveedor: ${error.message}` }, 500);
  }
});

// ==================== PLANES DE SUSCRIPCIÓN ====================

// Crear plan
app.post('/make-server-ae2ba659/planes', async (c) => {
  try {
    const user = await verifyAuth(c.req.header('Authorization'));
    if (!user) return c.json({ error: 'No autorizado' }, 401);

    const planData = await c.req.json();
    const planId = `PLAN-${Date.now()}`;
    
    const plan = {
      ...planData,
      id: planId,
      createdAt: new Date().toISOString()
    };

    await kv.set(`plan:${planId}`, plan);
    
    // Indexar por marca
    if (plan.marcaId) {
      await kv.set(`plan:marca:${plan.marcaId}:${planId}`, planId);
    }
    
    return c.json({ success: true, plan });
  } catch (error) {
    console.log('Error al crear plan:', error);
    return c.json({ error: `Error al crear plan: ${error.message}` }, 500);
  }
});

// Obtener planes por marca
app.get('/make-server-ae2ba659/planes/marca/:marcaId', async (c) => {
  try {
    const marcaId = c.req.param('marcaId');
    const planesIds = await kv.getByPrefix(`plan:marca:${marcaId}:`);
    
    const planes = [];
    for (const id of planesIds) {
      const plan = await kv.get(`plan:${id}`);
      if (plan) planes.push(plan);
    }
    
    return c.json({ success: true, planes });
  } catch (error) {
    console.log('Error al obtener planes:', error);
    return c.json({ error: `Error al obtener planes: ${error.message}` }, 500);
  }
});

// ==================== CONFIGURACIÓN WHITE LABEL ====================

// Guardar configuración
app.post('/make-server-ae2ba659/config/:marcaId', async (c) => {
  try {
    const user = await verifyAuth(c.req.header('Authorization'));
    if (!user) return c.json({ error: 'No autorizado' }, 401);

    const marcaId = c.req.param('marcaId');
    const configData = await c.req.json();
    
    const config = {
      marcaId,
      ...configData,
      updatedAt: new Date().toISOString()
    };

    await kv.set(`config:${marcaId}`, config);
    
    return c.json({ success: true, config });
  } catch (error) {
    console.log('Error al guardar configuración:', error);
    return c.json({ error: `Error al guardar configuración: ${error.message}` }, 500);
  }
});

// Obtener configuración
app.get('/make-server-ae2ba659/config/:marcaId', async (c) => {
  try {
    const marcaId = c.req.param('marcaId');
    const config = await kv.get(`config:${marcaId}`);
    
    if (!config) {
      return c.json({ error: 'Configuración no encontrada' }, 404);
    }
    
    return c.json({ success: true, config });
  } catch (error) {
    console.log('Error al obtener configuración:', error);
    return c.json({ error: `Error al obtener configuración: ${error.message}` }, 500);
  }
});

// ==================== HEALTH CHECK ====================

app.get('/make-server-ae2ba659/health', (c) => {
  return c.json({ status: 'ok', message: 'Udar Edge API funcionando correctamente' });
});

// ==================== DEBUG/TEST ENDPOINTS (SIN AUTENTICACIÓN) ====================

// Test: Crear marca sin autenticación
app.post('/make-server-ae2ba659/test/marcas', async (c) => {
  try {
    const marcaData = await c.req.json();
    const marcaId = `MRC-${Date.now()}`;
    
    const marca = {
      id: marcaId,
      ...marcaData,
      createdAt: new Date().toISOString()
    };

    await kv.set(`marca:${marcaId}`, marca);
    
    return c.json({ success: true, marca });
  } catch (error) {
    console.log('Error al crear marca (test):', error);
    return c.json({ error: `Error al crear marca: ${error.message}` }, 500);
  }
});

// Test: Crear múltiples productos sin autenticación (para migración)
app.post('/make-server-ae2ba659/test/productos/batch', async (c) => {
  try {
    const { productos } = await c.req.json();
    const resultados = [];
    
    for (const productoData of productos) {
      const productoId = productoData.id || `PROD-${Date.now()}-${Math.random()}`;
      
      const producto = {
        ...productoData,
        id: productoId,
        createdAt: new Date().toISOString()
      };

      await kv.set(`producto:${productoId}`, producto);
      
      // Indexar por marca
      if (producto.marcas_ids && Array.isArray(producto.marcas_ids)) {
        for (const marcaId of producto.marcas_ids) {
          await kv.set(`producto:marca:${marcaId}:${productoId}`, productoId);
        }
      }
      
      resultados.push(productoId);
    }
    
    return c.json({ 
      success: true, 
      message: `${resultados.length} productos migrados`,
      productosIds: resultados 
    });
  } catch (error) {
    console.log('Error al migrar productos:', error);
    return c.json({ error: `Error al migrar productos: ${error.message}` }, 500);
  }
});

// Iniciar servidor
Deno.serve(app.fetch);