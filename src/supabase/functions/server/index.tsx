import { Hono } from 'npm:hono';
import { cors } from 'npm:hono/cors';
import { logger } from 'npm:hono/logger';
import { createClient } from 'npm:@supabase/supabase-js@2';
import * as kv from './kv_store.tsx';
import * as submarcasRoutes from './submarcas_routes.tsx';  // ⭐ NUEVO
import canalesVentaRoutes from './canales-venta.ts';  // 🎯 CANALES DE VENTA

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

// ==================== EMPRESAS ====================

// Crear empresa
app.post('/make-server-ae2ba659/empresas', async (c) => {
  try {
    const user = await verifyAuth(c.req.header('Authorization'));
    if (!user) return c.json({ error: 'No autorizado' }, 401);

    const empresaData = await c.req.json();
    const empresaId = `EMP-${Date.now()}`;
    
    const empresa = {
      id: empresaId,
      ...empresaData,
      createdBy: user.id,
      activo: true,
      createdAt: new Date().toISOString()
    };

    await kv.set(`empresa:${empresaId}`, empresa);
    
    // Indexar por gerente
    await kv.set(`empresa:gerente:${user.id}:${empresaId}`, empresaId);
    
    return c.json({ success: true, empresa });
  } catch (error) {
    console.log('Error al crear empresa:', error);
    return c.json({ error: `Error al crear empresa: ${error.message}` }, 500);
  }
});

// Listar todas las empresas
app.get('/make-server-ae2ba659/empresas', async (c) => {
  try {
    const empresasKeys = await kv.getByPrefix('empresa:EMP-');
    return c.json({ success: true, empresas: empresasKeys });
  } catch (error) {
    console.log('Error al listar empresas:', error);
    return c.json({ error: `Error al listar empresas: ${error.message}` }, 500);
  }
});

// Obtener empresa por ID
app.get('/make-server-ae2ba659/empresas/:id', async (c) => {
  try {
    const empresaId = c.req.param('id');
    const empresa = await kv.get(`empresa:${empresaId}`);
    
    if (!empresa) {
      return c.json({ error: 'Empresa no encontrada' }, 404);
    }
    
    return c.json({ success: true, empresa });
  } catch (error) {
    console.log('Error al obtener empresa:', error);
    return c.json({ error: `Error al obtener empresa: ${error.message}` }, 500);
  }
});

// Obtener empresas de un gerente
app.get('/make-server-ae2ba659/empresas/gerente/:gerenteId', async (c) => {
  try {
    const user = await verifyAuth(c.req.header('Authorization'));
    if (!user) return c.json({ error: 'No autorizado' }, 401);

    const gerenteId = c.req.param('gerenteId');
    const empresasIds = await kv.getByPrefix(`empresa:gerente:${gerenteId}:`);
    
    const empresas = [];
    for (const id of empresasIds) {
      const empresa = await kv.get(`empresa:${id}`);
      if (empresa) empresas.push(empresa);
    }
    
    return c.json({ success: true, empresas });
  } catch (error) {
    console.log('Error al obtener empresas del gerente:', error);
    return c.json({ error: `Error al obtener empresas: ${error.message}` }, 500);
  }
});

// Actualizar empresa
app.put('/make-server-ae2ba659/empresas/:id', async (c) => {
  try {
    const user = await verifyAuth(c.req.header('Authorization'));
    if (!user) return c.json({ error: 'No autorizado' }, 401);

    const empresaId = c.req.param('id');
    const updates = await c.req.json();
    
    const empresaActual = await kv.get(`empresa:${empresaId}`);
    if (!empresaActual) {
      return c.json({ error: 'Empresa no encontrada' }, 404);
    }
    
    const empresaActualizada = {
      ...empresaActual,
      ...updates,
      updatedAt: new Date().toISOString()
    };
    
    await kv.set(`empresa:${empresaId}`, empresaActualizada);
    
    return c.json({ success: true, empresa: empresaActualizada });
  } catch (error) {
    console.log('Error al actualizar empresa:', error);
    return c.json({ error: `Error al actualizar empresa: ${error.message}` }, 500);
  }
});

// Eliminar empresa (soft delete)
app.delete('/make-server-ae2ba659/empresas/:id', async (c) => {
  try {
    const user = await verifyAuth(c.req.header('Authorization'));
    if (!user) return c.json({ error: 'No autorizado' }, 401);

    const empresaId = c.req.param('id');
    const empresa = await kv.get(`empresa:${empresaId}`);
    
    if (!empresa) {
      return c.json({ error: 'Empresa no encontrada' }, 404);
    }
    
    // Soft delete
    const empresaActualizada = {
      ...empresa,
      activo: false,
      deletedAt: new Date().toISOString()
    };
    
    await kv.set(`empresa:${empresaId}`, empresaActualizada);
    
    return c.json({ success: true, message: 'Empresa desactivada' });
  } catch (error) {
    console.log('Error al eliminar empresa:', error);
    return c.json({ error: `Error al eliminar empresa: ${error.message}` }, 500);
  }
});

// ==================== PUNTOS DE VENTA (PDVs) ====================

// Crear PDV
app.post('/make-server-ae2ba659/pdvs', async (c) => {
  try {
    const user = await verifyAuth(c.req.header('Authorization'));
    if (!user) return c.json({ error: 'No autorizado' }, 401);

    const pdvData = await c.req.json();
    const pdvId = `PDV-${Date.now()}`;
    
    const pdv = {
      id: pdvId,
      ...pdvData,
      activo: true,
      createdAt: new Date().toISOString()
    };

    await kv.set(`pdv:${pdvId}`, pdv);
    
    // Indexar por empresa
    if (pdv.empresaId) {
      await kv.set(`pdv:empresa:${pdv.empresaId}:${pdvId}`, pdvId);
    }
    
    return c.json({ success: true, pdv });
  } catch (error) {
    console.log('Error al crear PDV:', error);
    return c.json({ error: `Error al crear PDV: ${error.message}` }, 500);
  }
});

// Listar PDVs de una empresa
app.get('/make-server-ae2ba659/pdvs/empresa/:empresaId', async (c) => {
  try {
    const empresaId = c.req.param('empresaId');
    const pdvsIds = await kv.getByPrefix(`pdv:empresa:${empresaId}:`);
    
    const pdvs = [];
    for (const id of pdvsIds) {
      const pdv = await kv.get(`pdv:${id}`);
      if (pdv && pdv.activo) pdvs.push(pdv);
    }
    
    return c.json({ success: true, pdvs });
  } catch (error) {
    console.log('Error al obtener PDVs:', error);
    return c.json({ error: `Error al obtener PDVs: ${error.message}` }, 500);
  }
});

// Obtener PDV por ID
app.get('/make-server-ae2ba659/pdvs/:id', async (c) => {
  try {
    const pdvId = c.req.param('id');
    const pdv = await kv.get(`pdv:${pdvId}`);
    
    if (!pdv) {
      return c.json({ error: 'PDV no encontrado' }, 404);
    }
    
    return c.json({ success: true, pdv });
  } catch (error) {
    console.log('Error al obtener PDV:', error);
    return c.json({ error: `Error al obtener PDV: ${error.message}` }, 500);
  }
});

// Actualizar PDV
app.put('/make-server-ae2ba659/pdvs/:id', async (c) => {
  try {
    const user = await verifyAuth(c.req.header('Authorization'));
    if (!user) return c.json({ error: 'No autorizado' }, 401);

    const pdvId = c.req.param('id');
    const updates = await c.req.json();
    
    const pdvActual = await kv.get(`pdv:${pdvId}`);
    if (!pdvActual) {
      return c.json({ error: 'PDV no encontrado' }, 404);
    }
    
    const pdvActualizado = {
      ...pdvActual,
      ...updates,
      updatedAt: new Date().toISOString()
    };
    
    await kv.set(`pdv:${pdvId}`, pdvActualizado);
    
    return c.json({ success: true, pdv: pdvActualizado });
  } catch (error) {
    console.log('Error al actualizar PDV:', error);
    return c.json({ error: `Error al actualizar PDV: ${error.message}` }, 500);
  }
});

// Eliminar PDV (soft delete)
app.delete('/make-server-ae2ba659/pdvs/:id', async (c) => {
  try {
    const user = await verifyAuth(c.req.header('Authorization'));
    if (!user) return c.json({ error: 'No autorizado' }, 401);

    const pdvId = c.req.param('id');
    const pdv = await kv.get(`pdv:${pdvId}`);
    
    if (!pdv) {
      return c.json({ error: 'PDV no encontrado' }, 404);
    }
    
    const pdvActualizado = {
      ...pdv,
      activo: false,
      deletedAt: new Date().toISOString()
    };
    
    await kv.set(`pdv:${pdvId}`, pdvActualizado);
    
    return c.json({ success: true, message: 'PDV desactivado' });
  } catch (error) {
    console.log('Error al eliminar PDV:', error);
    return c.json({ error: `Error al eliminar PDV: ${error.message}` }, 500);
  }
});

// ==================== SUBMARCAS ====================

// Crear submarca
app.post('/make-server-ae2ba659/submarcas', async (c) => {
  try {
    const user = await verifyAuth(c.req.header('Authorization'));
    if (!user) return c.json({ error: 'No autorizado' }, 401);

    const submarcaData = await c.req.json();
    const submarcaId = `SUBM-${Date.now()}`;
    
    const submarca = {
      id: submarcaId,
      ...submarcaData,
      activo: true,
      createdAt: new Date().toISOString()
    };

    await kv.set(`submarca:${submarcaId}`, submarca);
    
    // Indexar por marca
    if (submarca.marcaId) {
      await kv.set(`submarca:marca:${submarca.marcaId}:${submarcaId}`, submarcaId);
    }
    
    return c.json({ success: true, submarca });
  } catch (error) {
    console.log('Error al crear submarca:', error);
    return c.json({ error: `Error al crear submarca: ${error.message}` }, 500);
  }
});

// Listar todas las submarcas
app.get('/make-server-ae2ba659/submarcas', async (c) => {
  try {
    const submarcasKeys = await kv.getByPrefix('submarca:SUBM-');
    return c.json({ success: true, submarcas: submarcasKeys });
  } catch (error) {
    console.log('Error al listar submarcas:', error);
    return c.json({ error: `Error al listar submarcas: ${error.message}` }, 500);
  }
});

// Obtener submarca por ID
app.get('/make-server-ae2ba659/submarcas/:id', async (c) => {
  try {
    const submarcaId = c.req.param('id');
    const submarca = await kv.get(`submarca:${submarcaId}`);
    
    if (!submarca) {
      return c.json({ error: 'Submarca no encontrada' }, 404);
    }
    
    return c.json({ success: true, submarca });
  } catch (error) {
    console.log('Error al obtener submarca:', error);
    return c.json({ error: `Error al obtener submarca: ${error.message}` }, 500);
  }
});

// Obtener submarcas de una marca
app.get('/make-server-ae2ba659/submarcas/marca/:marcaId', async (c) => {
  try {
    const marcaId = c.req.param('marcaId');
    const submarcasIds = await kv.getByPrefix(`submarca:marca:${marcaId}:`);
    
    const submarcas = [];
    for (const id of submarcasIds) {
      const submarca = await kv.get(`submarca:${id}`);
      if (submarca) submarcas.push(submarca);
    }
    
    return c.json({ success: true, submarcas });
  } catch (error) {
    console.log('Error al obtener submarcas de la marca:', error);
    return c.json({ error: `Error al obtener submarcas: ${error.message}` }, 500);
  }
});

// Actualizar submarca
app.put('/make-server-ae2ba659/submarcas/:id', async (c) => {
  try {
    const user = await verifyAuth(c.req.header('Authorization'));
    if (!user) return c.json({ error: 'No autorizado' }, 401);

    const submarcaId = c.req.param('id');
    const updates = await c.req.json();
    
    const submarcaActual = await kv.get(`submarca:${submarcaId}`);
    if (!submarcaActual) {
      return c.json({ error: 'Submarca no encontrada' }, 404);
    }
    
    const submarcaActualizada = {
      ...submarcaActual,
      ...updates,
      updatedAt: new Date().toISOString()
    };
    
    await kv.set(`submarca:${submarcaId}`, submarcaActualizada);
    
    return c.json({ success: true, submarca: submarcaActualizada });
  } catch (error) {
    console.log('Error al actualizar submarca:', error);
    return c.json({ error: `Error al actualizar submarca: ${error.message}` }, 500);
  }
});

// Eliminar submarca (soft delete)
app.delete('/make-server-ae2ba659/submarcas/:id', async (c) => {
  try {
    const user = await verifyAuth(c.req.header('Authorization'));
    if (!user) return c.json({ error: 'No autorizado' }, 401);

    const submarcaId = c.req.param('id');
    const submarca = await kv.get(`submarca:${submarcaId}`);
    
    if (!submarca) {
      return c.json({ error: 'Submarca no encontrada' }, 404);
    }
    
    // Soft delete
    const submarcaActualizada = {
      ...submarca,
      activo: false,
      deletedAt: new Date().toISOString()
    };
    
    await kv.set(`submarca:${submarcaId}`, submarcaActualizada);
    
    return c.json({ success: true, message: 'Submarca desactivada' });
  } catch (error) {
    console.log('Error al eliminar submarca:', error);
    return c.json({ error: `Error al eliminar submarca: ${error.message}` }, 500);
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
    
    // ⭐ CAMBIO: Indexar por SUBMARCA (no por marca)
    if (producto.submarcaId) {
      await kv.set(`producto:submarca:${producto.submarcaId}:${productoId}`, productoId);
    }
    
    return c.json({ success: true, producto });
  } catch (error) {
    console.log('Error al crear producto:', error);
    return c.json({ error: `Error al crear producto: ${error.message}` }, 500);
  }
});

// ⭐ NUEVO: Obtener productos por submarca
app.get('/make-server-ae2ba659/productos/submarca/:submarcaId', async (c) => {
  try {
    const submarcaId = c.req.param('submarcaId');
    // ✅ CORREGIDO: Usar getByPrefix que devuelve los valores directamente
    const productosIndices = await kv.getByPrefix(`producto:submarca:${submarcaId}:`);
    
    const productos = [];
    for (const productoId of productosIndices) {
      // Los valores en el índice son los IDs de los productos
      const producto = await kv.get(`producto:${productoId}`);
      if (producto) productos.push(producto);
    }
    
    return c.json({ success: true, productos });
  } catch (error) {
    console.log('Error al obtener productos por submarca:', error);
    return c.json({ error: `Error al obtener productos: ${error.message}` }, 500);
  }
});

// Obtener productos por marca (retorna todos los productos de todas las submarcas de esa marca)
app.get('/make-server-ae2ba659/productos/marca/:marcaId', async (c) => {
  try {
    const marcaId = c.req.param('marcaId');
    
    // ✅ CORREGIDO: Usar getKeysByPrefix para obtener las claves
    const todosLosProductosKeys = await kv.getKeysByPrefix(`producto:`);
    const productos = [];
    
    for (const key of todosLosProductosKeys) {
      // Filtrar solo los keys que son productos directos (no índices)
      // Formato esperado: "producto:PROD-123" (2 partes separadas por :)
      if (key.split(':').length === 2) {
        const producto = await kv.get(key);
        if (producto && producto.submarcaId) {
          // Verificar si la submarca pertenece a esta marca
          // Por ahora, asumimos que marcaId está en el formato MRC-HOYPECAMOS
          // y submarcaId referencia a esa marca
          productos.push(producto);
        }
      }
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
    
    // 📝 GUARDAR HISTORIAL DE CAMBIOS
    const cambios = [];
    const camposImportantes = [
      'nombre', 'categoria', 'descripcion', 'precio', 'precioCoste', 
      'stock', 'stockMinimo', 'activo', 'alergenos', 'etiquetas',
      'iva', 'preciosPorSubmarca', 'preciosPorCanal'
    ];
    
    for (const campo of camposImportantes) {
      if (updates[campo] !== undefined && JSON.stringify(productoActual[campo]) !== JSON.stringify(updates[campo])) {
        cambios.push({
          campo,
          valorAnterior: productoActual[campo],
          valorNuevo: updates[campo]
        });
      }
    }
    
    // Si hay cambios, guardar en el historial
    if (cambios.length > 0) {
      const historialId = `HIST-${Date.now()}`;
      const registroHistorial = {
        id: historialId,
        productoId,
        productoNombre: productoActual.nombre,
        cambios,
        usuario: {
          id: user.id,
          email: user.email,
          nombre: user.user_metadata?.nombre || user.email
        },
        fecha: new Date().toISOString()
      };
      
      // Guardar registro de historial
      await kv.set(`historial:producto:${productoId}:${historialId}`, registroHistorial);
      
      // Crear índice para búsqueda rápida
      await kv.set(`historial:index:${productoId}:${historialId}`, historialId);
    }
    
    const productoActualizado = {
      ...productoActual,
      ...updates,
      updatedAt: new Date().toISOString(),
      updatedBy: user.id
    };
    
    await kv.set(`producto:${productoId}`, productoActualizado);
    
    return c.json({ success: true, producto: productoActualizado, cambiosRegistrados: cambios.length });
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
    
    // ⭐ CAMBIO: Eliminar índice de submarca (no de marcas)
    if (producto.submarcaId) {
      await kv.del(`producto:submarca:${producto.submarcaId}:${productoId}`);
    }
    
    return c.json({ success: true, message: 'Producto eliminado' });
  } catch (error) {
    console.log('Error al eliminar producto:', error);
    return c.json({ error: `Error al eliminar producto: ${error.message}` }, 500);
  }
});

// Obtener historial de cambios de un producto
app.get('/make-server-ae2ba659/productos/:id/historial', async (c) => {
  try {
    const productoId = c.req.param('id');
    
    // Obtener todos los registros de historial para este producto
    const historialKeys = await kv.getByPrefix(`historial:index:${productoId}:`);
    
    const historial = [];
    for (const historialId of historialKeys) {
      const registro = await kv.get(`historial:producto:${productoId}:${historialId}`);
      if (registro) historial.push(registro);
    }
    
    // Ordenar por fecha descendente (más reciente primero)
    historial.sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime());
    
    return c.json({ success: true, historial });
  } catch (error) {
    console.log('Error al obtener historial del producto:', error);
    return c.json({ error: `Error al obtener historial: ${error.message}` }, 500);
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

// ==================== ANÁLISIS DE SUBMARCAS ⭐ NUEVO ====================

// Obtener ventas por submarca
app.get('/make-server-ae2ba659/submarcas/ventas', submarcasRoutes.getVentasPorSubmarca);

// Obtener productos top por submarca
app.get('/make-server-ae2ba659/submarcas/productos-top', submarcasRoutes.getProductosTopPorSubmarca);

// Comparativa entre submarcas (Modomio vs BlackBurger)
app.get('/make-server-ae2ba659/submarcas/comparativa', submarcasRoutes.getComparativaSubmarcas);

// Métricas resumen de submarcas
app.get('/make-server-ae2ba659/submarcas/metricas-resumen', submarcasRoutes.getMetricasResumen);

// ==================== DASHBOARD VENTAS 360 ⭐ NUEVO ====================

// Obtener datos de ventas para Dashboard 360
app.get('/make-server-ae2ba659/dashboard/ventas', async (c) => {
  try {
    const { empresa_id, marca_id, submarca_id, punto_venta_id, fecha_inicio, fecha_fin, periodo_comparacion } = c.req.query();

    if (!empresa_id || !fecha_inicio || !fecha_fin) {
      return c.json({ 
        error: 'Parámetros requeridos: empresa_id, fecha_inicio, fecha_fin' 
      }, 400);
    }

    // 1. Obtener todos los pedidos de la empresa
    const pedidosKeys = await kv.getByPrefix(`pedido:empresa:${empresa_id}`);
    const pedidos = await Promise.all(
      pedidosKeys.map(async (key) => {
        const pedidoId = key.split(':').pop();
        return await kv.get(`pedido:${pedidoId}`);
      })
    );

    // 2. Filtrar pedidos por criterios
    const pedidosFiltrados = pedidos.filter(pedido => {
      if (!pedido) return false;
      
      // Filtrar por estado (solo completados y pendientes, no cancelados)
      if (pedido.estado === 'cancelado') return false;
      
      // Filtrar por fechas
      const fechaPedido = new Date(pedido.createdAt || pedido.fecha_pedido);
      const fechaIni = new Date(fecha_inicio);
      const fechaFin = new Date(fecha_fin);
      fechaFin.setHours(23, 59, 59, 999); // Incluir todo el día final
      
      if (fechaPedido < fechaIni || fechaPedido > fechaFin) return false;
      
      // Filtrar por marca
      if (marca_id && pedido.marca_id !== marca_id) return false;
      
      // Filtrar por submarca
      if (submarca_id && pedido.submarca_id !== submarca_id) return false;
      
      // Filtrar por punto de venta
      if (punto_venta_id && pedido.punto_venta_id !== punto_venta_id) return false;
      
      return true;
    });

    // 3. Calcular métricas por canal
    let ventasMostrador = 0;
    let pedidosMostrador = 0;
    let ventasAppWeb = 0;
    let pedidosAppWeb = 0;
    let ventasTerceros = 0;
    let pedidosTerceros = 0;
    let costesVariables = 0;

    for (const pedido of pedidosFiltrados) {
      const total = pedido.total || 0;
      const canal = (pedido.canal_venta || '').toLowerCase();
      
      // Clasificar por canal
      if (canal === 'mostrador' || canal === 'presencial') {
        ventasMostrador += total;
        pedidosMostrador++;
      } else if (canal === 'app' || canal === 'web' || canal === 'online') {
        ventasAppWeb += total;
        pedidosAppWeb++;
      } else if (canal.includes('uber') || canal.includes('glovo') || canal.includes('just_eat') || canal === 'terceros') {
        ventasTerceros += total;
        pedidosTerceros++;
      } else {
        // Por defecto, si no está especificado, asumimos mostrador
        ventasMostrador += total;
        pedidosMostrador++;
      }
      
      // Calcular costes variables (si hay items con coste)
      if (pedido.items && Array.isArray(pedido.items)) {
        for (const item of pedido.items) {
          const producto = await kv.get(`producto:${item.producto_id}`);
          if (producto?.coste_unitario) {
            costesVariables += producto.coste_unitario * (item.cantidad || 1);
          }
        }
      }
    }

    // 4. Calcular totales
    const ventasTotales = ventasMostrador + ventasAppWeb + ventasTerceros;
    const pedidosTotales = pedidosMostrador + pedidosAppWeb + pedidosTerceros;
    const ticketMedio = pedidosTotales > 0 ? ventasTotales / pedidosTotales : 0;

    // 5. Calcular comisiones reales
    const comisionesTpv = ventasMostrador * 0.025; // 2.5% TPV
    const comisionesPasarela = ventasAppWeb * 0.01; // 1% pasarela online
    const comisionesPlataformas = ventasTerceros * 0.05; // 5% Uber/Glovo

    // 6. Calcular costes fijos imputados (proporción del periodo)
    const diasPeriodo = Math.ceil((new Date(fecha_fin).getTime() - new Date(fecha_inicio).getTime()) / (1000 * 60 * 60 * 24)) + 1;
    const costesFijosMensuales = 12400; // Configuración default
    const costesFijosImputados = (costesFijosMensuales / 30) * diasPeriodo;

    // 7. Calcular márgenes
    const margenBruto = ventasTotales - costesVariables;
    const margenNeto = margenBruto - costesFijosImputados - comisionesTpv - comisionesPasarela - comisionesPlataformas;

    // 8. Calcular variaciones (comparar con periodo anterior si se solicita)
    let variacionVentas = 0;
    let variacionMargenNeto = 0;
    let variacionMostrador = 0;
    let variacionAppWeb = 0;
    let variacionTerceros = 0;

    if (periodo_comparacion) {
      // Calcular fechas del periodo anterior
      const diasDiff = Math.ceil((new Date(fecha_fin).getTime() - new Date(fecha_inicio).getTime()) / (1000 * 60 * 60 * 24));
      const fechaInicioAnterior = new Date(fecha_inicio);
      fechaInicioAnterior.setDate(fechaInicioAnterior.getDate() - diasDiff - 1);
      const fechaFinAnterior = new Date(fecha_inicio);
      fechaFinAnterior.setDate(fechaFinAnterior.getDate() - 1);

      const pedidosAnteriores = pedidos.filter(pedido => {
        if (!pedido || pedido.estado === 'cancelado') return false;
        const fechaPedido = new Date(pedido.createdAt || pedido.fecha_pedido);
        return fechaPedido >= fechaInicioAnterior && fechaPedido <= fechaFinAnterior;
      });

      let ventasAnteriores = 0;
      let mostradorAnterior = 0;
      let appWebAnterior = 0;
      let tercerosAnterior = 0;
      let costesVariablesAnteriores = 0;

      for (const pedido of pedidosAnteriores) {
        const total = pedido.total || 0;
        ventasAnteriores += total;
        const canal = (pedido.canal_venta || '').toLowerCase();
        
        if (canal === 'mostrador' || canal === 'presencial') {
          mostradorAnterior += total;
        } else if (canal === 'app' || canal === 'web' || canal === 'online') {
          appWebAnterior += total;
        } else if (canal.includes('uber') || canal.includes('glovo') || canal.includes('just_eat') || canal === 'terceros') {
          tercerosAnterior += total;
        } else {
          mostradorAnterior += total;
        }

        if (pedido.items && Array.isArray(pedido.items)) {
          for (const item of pedido.items) {
            const producto = await kv.get(`producto:${item.producto_id}`);
            if (producto?.coste_unitario) {
              costesVariablesAnteriores += producto.coste_unitario * (item.cantidad || 1);
            }
          }
        }
      }

      const margenNetoAnterior = ventasAnteriores - costesVariablesAnteriores - costesFijosImputados - 
                                 (mostradorAnterior * 0.025) - (appWebAnterior * 0.01) - (tercerosAnterior * 0.05);

      // Calcular variaciones porcentuales
      variacionVentas = ventasAnteriores > 0 ? ((ventasTotales - ventasAnteriores) / ventasAnteriores) * 100 : 0;
      variacionMargenNeto = margenNetoAnterior > 0 ? ((margenNeto - margenNetoAnterior) / margenNetoAnterior) * 100 : 0;
      variacionMostrador = mostradorAnterior > 0 ? ((ventasMostrador - mostradorAnterior) / mostradorAnterior) * 100 : 0;
      variacionAppWeb = appWebAnterior > 0 ? ((ventasAppWeb - appWebAnterior) / appWebAnterior) * 100 : 0;
      variacionTerceros = tercerosAnterior > 0 ? ((ventasTerceros - tercerosAnterior) / tercerosAnterior) * 100 : 0;
    }

    // 9. Calcular datos para gráficas (últimos 5 meses)
    const hoy = new Date();
    const ingresosUltimos5Meses = [];
    const gastosUltimos5Meses = [];
    const labelsUltimos5Meses = [];

    for (let i = 4; i >= 0; i--) {
      const fecha = new Date(hoy.getFullYear(), hoy.getMonth() - i, 1);
      const mes = fecha.toLocaleString('es-ES', { month: 'short' }).charAt(0).toUpperCase() + 
                  fecha.toLocaleString('es-ES', { month: 'short' }).slice(1);
      labelsUltimos5Meses.push(mes);

      const inicioMes = new Date(fecha.getFullYear(), fecha.getMonth(), 1);
      const finMes = new Date(fecha.getFullYear(), fecha.getMonth() + 1, 0);

      const pedidosMes = pedidos.filter(p => {
        if (!p || p.estado === 'cancelado') return false;
        const fechaP = new Date(p.createdAt || p.fecha_pedido);
        return fechaP >= inicioMes && fechaP <= finMes;
      });

      const ingresosMes = pedidosMes.reduce((sum, p) => sum + (p.total || 0), 0);
      let costosMes = 0;
      
      for (const pedido of pedidosMes) {
        if (pedido.items && Array.isArray(pedido.items)) {
          for (const item of pedido.items) {
            const producto = await kv.get(`producto:${item.producto_id}`);
            if (producto?.coste_unitario) {
              costosMes += producto.coste_unitario * (item.cantidad || 1);
            }
          }
        }
      }

      ingresosUltimos5Meses.push(Math.round(ingresosMes));
      gastosUltimos5Meses.push(Math.round(costosMes + (costesFijosMensuales / 12)));
    }

    // 10. Preparar respuesta
    const response = {
      // Metadatos
      empresa_id,
      marca_id: marca_id || 'todas',
      submarca_id: submarca_id || 'todas',
      punto_venta_id: punto_venta_id || 'todas',
      periodo_tipo: periodo_comparacion || 'personalizado',
      fecha_inicio,
      fecha_fin,
      
      // KPIs principales
      ventas_periodo: Math.round(ventasTotales * 100) / 100,
      pedidos_periodo: pedidosTotales,
      ticket_medio_periodo: Math.round(ticketMedio * 100) / 100,
      ticket_medio_producto: Math.round(ticketMedio * 100) / 100,
      
      // Ventas por canal
      ventas_mostrador: Math.round(ventasMostrador * 100) / 100,
      variacion_mostrador: Math.round(variacionMostrador * 10) / 10,
      pedidos_mostrador: pedidosMostrador,
      
      ventas_app_web: Math.round(ventasAppWeb * 100) / 100,
      variacion_app_web: Math.round(variacionAppWeb * 10) / 10,
      pedidos_app_web: pedidosAppWeb,
      
      ventas_terceros: Math.round(ventasTerceros * 100) / 100,
      variacion_terceros: Math.round(variacionTerceros * 10) / 10,
      pedidos_terceros: pedidosTerceros,
      
      ventas_efectivo: Math.round(ventasMostrador * 0.65 * 100) / 100, // Estimación
      variacion_efectivo: Math.round(variacionMostrador * 10) / 10,
      
      // Costes y comisiones REALES
      costes_variables_periodo: Math.round(costesVariables * 100) / 100,
      costes_fijos_imputados_periodo: Math.round(costesFijosImputados * 100) / 100,
      comisiones_tpv_periodo: Math.round(comisionesTpv * 100) / 100,
      comisiones_plataformas_periodo: Math.round(comisionesPlataformas * 100) / 100,
      comisiones_pasarela_periodo: Math.round(comisionesPasarela * 100) / 100,
      
      // Márgenes
      margen_neto_periodo: Math.round(margenNeto * 100) / 100,
      variacion_ventas_periodo: Math.round(variacionVentas * 10) / 10,
      variacion_margen_neto_periodo: Math.round(variacionMargenNeto * 10) / 10,
      
      // Gráficas
      ingresos_ultimos_5_meses: ingresosUltimos5Meses,
      gastos_ultimos_5_meses: gastosUltimos5Meses,
      labels_ultimos_5_meses: labelsUltimos5Meses,
      
      categorias_ingresos: ['Mostrador', 'App/Web', 'Terceros'],
      valores_ingresos_categorias: [
        Math.round((ventasMostrador / ventasTotales) * 100) || 0,
        Math.round((ventasAppWeb / ventasTotales) * 100) || 0,
        Math.round((ventasTerceros / ventasTotales) * 100) || 0
      ]
    };

    return c.json(response);
  } catch (error) {
    console.log('Error al obtener datos de ventas del dashboard:', error);
    return c.json({ error: `Error al obtener datos de ventas: ${error.message}` }, 500);
  }
});

// Obtener productos más vendidos
app.get('/make-server-ae2ba659/dashboard/productos-top', async (c) => {
  try {
    const { empresa_id, marca_id, submarca_id, punto_venta_id, fecha_inicio, fecha_fin, limit } = c.req.query();

    if (!empresa_id || !fecha_inicio || !fecha_fin) {
      return c.json({ 
        error: 'Parámetros requeridos: empresa_id, fecha_inicio, fecha_fin' 
      }, 400);
    }

    const limitNum = parseInt(limit || '10');

    // 1. Obtener pedidos
    const pedidosKeys = await kv.getByPrefix(`pedido:empresa:${empresa_id}`);
    const pedidos = await Promise.all(
      pedidosKeys.map(async (key) => {
        const pedidoId = key.split(':').pop();
        return await kv.get(`pedido:${pedidoId}`);
      })
    );

    // 2. Filtrar pedidos
    const pedidosFiltrados = pedidos.filter(pedido => {
      if (!pedido || pedido.estado === 'cancelado') return false;
      
      const fechaPedido = new Date(pedido.createdAt || pedido.fecha_pedido);
      const fechaIni = new Date(fecha_inicio);
      const fechaFin = new Date(fecha_fin);
      fechaFin.setHours(23, 59, 59, 999);
      
      if (fechaPedido < fechaIni || fechaPedido > fechaFin) return false;
      if (marca_id && pedido.marca_id !== marca_id) return false;
      if (submarca_id && pedido.submarca_id !== submarca_id) return false;
      if (punto_venta_id && pedido.punto_venta_id !== punto_venta_id) return false;
      
      return true;
    });

    // 3. Agrupar productos
    const productosMap = new Map();

    for (const pedido of pedidosFiltrados) {
      if (!pedido.items || !Array.isArray(pedido.items)) continue;

      for (const item of pedido.items) {
        const productoId = item.producto_id;
        
        if (!productosMap.has(productoId)) {
          productosMap.set(productoId, {
            producto_id: productoId,
            unidades_vendidas: 0,
            total_ingresos: 0,
            pedidos_count: 0
          });
        }

        const stats = productosMap.get(productoId);
        stats.unidades_vendidas += item.cantidad || 1;
        stats.total_ingresos += (item.precio || 0) * (item.cantidad || 1);
        stats.pedidos_count++;
      }
    }

    // 4. Obtener detalles de productos y calcular métricas
    const productosArray = [];
    const totalIngresos = Array.from(productosMap.values()).reduce((sum, p) => sum + p.total_ingresos, 0);

    for (const [productoId, stats] of productosMap.entries()) {
      const producto = await kv.get(`producto:${productoId}`);
      
      if (producto) {
        // Obtener submarca
        let submarcaNombre = 'Sin submarca';
        let submarcaIcono = '🍽️';
        
        if (producto.submarca_id) {
          const submarca = await kv.get(`submarca:${producto.submarca_id}`);
          if (submarca) {
            submarcaNombre = submarca.nombre;
            submarcaIcono = submarca.icono || '🍽️';
          }
        }

        productosArray.push({
          producto_id: productoId,
          producto_nombre: producto.nombre,
          producto_imagen: producto.imagen_url || '',
          categoria: producto.categoria || 'General',
          submarca_nombre: submarcaNombre,
          submarca_icono: submarcaIcono,
          unidades_vendidas: stats.unidades_vendidas,
          total_ingresos: Math.round(stats.total_ingresos * 100) / 100,
          precio_promedio: Math.round((stats.total_ingresos / stats.unidades_vendidas) * 100) / 100,
          porcentaje_ventas: totalIngresos > 0 ? Math.round((stats.total_ingresos / totalIngresos) * 1000) / 10 : 0,
          tendencia: 'estable',
          variacion_vs_anterior: 0 // TODO: Calcular vs periodo anterior
        });
      }
    }

    // 5. Ordenar por ingresos totales y limitar
    productosArray.sort((a, b) => b.total_ingresos - a.total_ingresos);
    const topProductos = productosArray.slice(0, limitNum);

    // 6. Preparar respuesta
    const response = {
      productos: topProductos,
      total_productos_unicos: productosMap.size,
      total_unidades_vendidas: Array.from(productosMap.values()).reduce((sum, p) => sum + p.unidades_vendidas, 0)
    };

    return c.json(response);
  } catch (error) {
    console.log('Error al obtener productos top:', error);
    return c.json({ error: `Error al obtener productos top: ${error.message}` }, 500);
  }
});

// Exportar datos de ventas a CSV
app.get('/make-server-ae2ba659/dashboard/ventas/export', async (c) => {
  try {
    const { empresa_id, marca_id, submarca_id, punto_venta_id, fecha_inicio, fecha_fin, format } = c.req.query();

    if (!empresa_id || !fecha_inicio || !fecha_fin) {
      return c.json({ 
        error: 'Parámetros requeridos: empresa_id, fecha_inicio, fecha_fin' 
      }, 400);
    }

    // Obtener datos de ventas
    const ventasResponse = await fetch(
      `http://localhost:54321/functions/v1/make-server-ae2ba659/dashboard/ventas?` +
      new URLSearchParams({ empresa_id, marca_id: marca_id || '', submarca_id: submarca_id || '', 
                           punto_venta_id: punto_venta_id || '', fecha_inicio, fecha_fin })
    );
    const datosVentas = await ventasResponse.json();

    // Obtener productos top
    const productosResponse = await fetch(
      `http://localhost:54321/functions/v1/make-server-ae2ba659/dashboard/productos-top?` +
      new URLSearchParams({ empresa_id, marca_id: marca_id || '', submarca_id: submarca_id || '', 
                           punto_venta_id: punto_venta_id || '', fecha_inicio, fecha_fin, limit: '20' })
    );
    const datosProductos = await productosResponse.json();

    // Generar CSV
    let csv = '';
    
    // Encabezado
    csv += `REPORTE DE VENTAS - ${fecha_inicio} a ${fecha_fin}\n`;
    csv += `Empresa: ${empresa_id}\n`;
    csv += `Marca: ${marca_id || 'Todas'}\n\n`;
    
    // KPIs principales
    csv += `RESUMEN GENERAL\n`;
    csv += `Métrica,Valor\n`;
    csv += `Ventas Totales,€${datosVentas.ventas_periodo}\n`;
    csv += `Pedidos Totales,${datosVentas.pedidos_periodo}\n`;
    csv += `Ticket Medio,€${datosVentas.ticket_medio_periodo}\n`;
    csv += `Margen Neto,€${datosVentas.margen_neto_periodo}\n\n`;
    
    // Ventas por canal
    csv += `VENTAS POR CANAL\n`;
    csv += `Canal,Ventas,Pedidos,Ticket Medio,Variación %\n`;
    csv += `Mostrador,€${datosVentas.ventas_mostrador},${datosVentas.pedidos_mostrador},€${(datosVentas.ventas_mostrador / datosVentas.pedidos_mostrador).toFixed(2)},${datosVentas.variacion_mostrador > 0 ? '+' : ''}${datosVentas.variacion_mostrador}%\n`;
    csv += `App/Web,€${datosVentas.ventas_app_web},${datosVentas.pedidos_app_web},€${(datosVentas.ventas_app_web / datosVentas.pedidos_app_web).toFixed(2)},${datosVentas.variacion_app_web > 0 ? '+' : ''}${datosVentas.variacion_app_web}%\n`;
    csv += `Terceros,€${datosVentas.ventas_terceros},${datosVentas.pedidos_terceros},€${(datosVentas.ventas_terceros / datosVentas.pedidos_terceros).toFixed(2)},${datosVentas.variacion_terceros > 0 ? '+' : ''}${datosVentas.variacion_terceros}%\n\n`;
    
    // Costes y comisiones
    csv += `COSTES Y COMISIONES\n`;
    csv += `Concepto,Importe\n`;
    csv += `Costes Variables,€${datosVentas.costes_variables_periodo}\n`;
    csv += `Costes Fijos Imputados,€${datosVentas.costes_fijos_imputados_periodo}\n`;
    csv += `Comisiones TPV,€${datosVentas.comisiones_tpv_periodo}\n`;
    csv += `Comisiones Plataformas,€${datosVentas.comisiones_plataformas_periodo}\n`;
    csv += `Comisiones Pasarela,€${datosVentas.comisiones_pasarela_periodo}\n\n`;
    
    // Productos más vendidos
    if (datosProductos.productos && datosProductos.productos.length > 0) {
      csv += `PRODUCTOS MÁS VENDIDOS\n`;
      csv += `Ranking,Producto,Categoría,Submarca,Unidades,Ingresos,% Total\n`;
      
      datosProductos.productos.forEach((producto, index) => {
        csv += `#${index + 1},${producto.producto_nombre},${producto.categoria},${producto.submarca_nombre},${producto.unidades_vendidas},€${producto.total_ingresos},${producto.porcentaje_ventas}%\n`;
      });
    }

    // Configurar headers para descarga
    c.header('Content-Type', 'text/csv; charset=utf-8');
    c.header('Content-Disposition', `attachment; filename="ventas_${fecha_inicio}_${fecha_fin}.csv"`);

    return c.text('\ufeff' + csv); // BOM para UTF-8
  } catch (error) {
    console.log('Error al exportar datos:', error);
    return c.json({ error: `Error al exportar datos: ${error.message}` }, 500);
  }
});

// ==================== RUTAS DE CANALES DE VENTA ====================
app.route('/make-server-ae2ba659', canalesVentaRoutes);

// ==================== ANALYTICS ====================

// Registrar evento de analytics
app.post('/make-server-ae2ba659/analytics/eventos', async (c) => {
  try {
    const evento = await c.req.json();
    
    // Generar ID único
    const timestamp = Date.now();
    const random = Math.random().toString(36).substr(2, 9);
    const idEvento = `evt-${timestamp}-${random}`;
    
    // Guardar evento completo
    const eventoCompleto = {
      id: idEvento,
      tipo_evento: evento.tipo_evento,
      id_producto: evento.id_producto || null,
      id_usuario: evento.id_usuario,
      tipo_usuario: evento.tipo_usuario,
      id_pdv: evento.id_pdv || null,
      metadata: evento.metadata || {},
      timestamp: evento.timestamp,
      device: evento.device,
      navegador: evento.navegador,
    };
    
    await kv.set(`evento:${idEvento}`, eventoCompleto);
    
    // Indexar por producto (para consultas rápidas)
    if (evento.id_producto) {
      const fecha = new Date(evento.timestamp).toISOString().split('T')[0];
      const keyProducto = `eventos:producto:${evento.id_producto}:${idEvento}`;
      await kv.set(keyProducto, eventoCompleto);
    }
    
    // Indexar por tipo de evento y fecha
    const fecha = new Date(evento.timestamp).toISOString().split('T')[0];
    const keyTipo = `eventos:tipo:${evento.tipo_evento}:${fecha}:${idEvento}`;
    await kv.set(keyTipo, eventoCompleto);
    
    return c.json({ success: true, id: idEvento });
  } catch (error) {
    console.log('Error al guardar evento de analytics:', error);
    return c.json({ error: `Error al guardar evento: ${error.message}` }, 500);
  }
});

// Obtener eventos de un producto específico
app.get('/make-server-ae2ba659/analytics/productos/:id/eventos', async (c) => {
  try {
    const idProducto = c.req.param('id');
    const limite = parseInt(c.req.query('limite') || '50');
    
    // Obtener todos los eventos del producto
    const prefix = `eventos:producto:${idProducto}:`;
    const eventos = await kv.getByPrefix(prefix);
    
    // Ordenar por timestamp descendente (más recientes primero)
    const eventosOrdenados = eventos
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, limite);
    
    return c.json({ 
      id_producto: idProducto,
      total: eventos.length,
      eventos: eventosOrdenados 
    });
  } catch (error) {
    console.log('Error al obtener eventos del producto:', error);
    return c.json({ error: `Error al obtener eventos: ${error.message}` }, 500);
  }
});

// Obtener estadísticas de un producto
app.get('/make-server-ae2ba659/analytics/productos/:id/estadisticas', async (c) => {
  try {
    const idProducto = c.req.param('id');
    
    // Obtener todos los eventos del producto
    const prefix = `eventos:producto:${idProducto}:`;
    const eventos = await kv.getByPrefix(prefix);
    
    // Calcular estadísticas
    const ahora = new Date();
    const hoy = new Date(ahora.getFullYear(), ahora.getMonth(), ahora.getDate());
    const semanaAtras = new Date(hoy.getTime() - 7 * 24 * 60 * 60 * 1000);
    
    let visualizacionesHoy = 0;
    let visualizacionesSemana = 0;
    let totalVisualizaciones = 0;
    let totalEscandallos = 0;
    let totalEdiciones = 0;
    const eventosPorTipo: Record<string, number> = {};
    const usuariosUnicos = new Set();
    
    eventos.forEach(evt => {
      const fechaEvento = new Date(evt.timestamp);
      
      // Contar por tipo
      eventosPorTipo[evt.tipo_evento] = (eventosPorTipo[evt.tipo_evento] || 0) + 1;
      
      // Usuarios únicos
      if (evt.id_usuario) {
        usuariosUnicos.add(evt.id_usuario);
      }
      
      // Visualizaciones
      if (evt.tipo_evento === 'PRODUCTO_VISUALIZADO') {
        totalVisualizaciones++;
        if (fechaEvento >= hoy) {
          visualizacionesHoy++;
        }
        if (fechaEvento >= semanaAtras) {
          visualizacionesSemana++;
        }
      }
      
      // Escandallos
      if (evt.tipo_evento === 'ESCANDALLO_VISUALIZADO') {
        totalEscandallos++;
      }
      
      // Ediciones
      if (evt.tipo_evento === 'PRODUCTO_EDITADO' || evt.tipo_evento === 'PRECIO_MODIFICADO' || evt.tipo_evento === 'STOCK_MODIFICADO') {
        totalEdiciones++;
      }
    });
    
    // Último evento
    const ultimoEvento = eventos.length > 0 
      ? eventos.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())[0]
      : null;
    
    return c.json({
      total_visualizaciones: totalVisualizaciones,
      visualizaciones_hoy: visualizacionesHoy,
      visualizaciones_semana: visualizacionesSemana,
      total_escandallos: totalEscandallos,
      total_ediciones: totalEdiciones,
      ultimo_evento: ultimoEvento,
      eventos_por_tipo: eventosPorTipo,
      usuarios_unicos: usuariosUnicos.size,
    });
  } catch (error) {
    console.log('Error al obtener estadísticas del producto:', error);
    return c.json({ error: `Error al obtener estadísticas: ${error.message}` }, 500);
  }
});

// Obtener productos más vistos
app.get('/make-server-ae2ba659/analytics/productos/mas-vistos', async (c) => {
  try {
    const limite = parseInt(c.req.query('limite') || '10');
    
    // Obtener todos los eventos de tipo PRODUCTO_VISUALIZADO
    const hoy = new Date().toISOString().split('T')[0];
    const prefix = `eventos:tipo:PRODUCTO_VISUALIZADO:${hoy}:`;
    const eventos = await kv.getByPrefix(prefix);
    
    // Contar por producto
    const conteo: Record<string, number> = {};
    eventos.forEach(evt => {
      if (evt.id_producto) {
        conteo[evt.id_producto] = (conteo[evt.id_producto] || 0) + 1;
      }
    });
    
    // Ordenar y limitar
    const ranking = Object.entries(conteo)
      .map(([id_producto, total_vistas]) => ({ id_producto, total_vistas }))
      .sort((a, b) => b.total_vistas - a.total_vistas)
      .slice(0, limite);
    
    return c.json({
      fecha: hoy,
      total_productos: ranking.length,
      productos: ranking
    });
  } catch (error) {
    console.log('Error al obtener productos más vistos:', error);
    return c.json({ error: `Error al obtener productos: ${error.message}` }, 500);
  }
});

// ==================== CLIENTES ====================

// Crear cliente
app.post('/make-server-ae2ba659/clientes', async (c) => {
  try {
    const clienteData = await c.req.json();
    const clienteId = `CLI-${Date.now()}`;
    
    const cliente = {
      ...clienteData,
      id: clienteId,
      createdAt: new Date().toISOString()
    };

    await kv.set(`cliente:${clienteId}`, cliente);
    
    // Indexar por marca/pdv
    if (cliente.marcaId) {
      await kv.set(`cliente:marca:${cliente.marcaId}:${clienteId}`, clienteId);
    }
    
    return c.json({ success: true, cliente });
  } catch (error) {
    console.log('Error al crear cliente:', error);
    return c.json({ error: `Error al crear cliente: ${error.message}` }, 500);
  }
});

// Obtener cliente por ID
app.get('/make-server-ae2ba659/clientes/:id', async (c) => {
  try {
    const clienteId = c.req.param('id');
    const cliente = await kv.get(`cliente:${clienteId}`);
    
    if (!cliente) {
      return c.json({ error: 'Cliente no encontrado' }, 404);
    }
    
    return c.json({ success: true, cliente });
  } catch (error) {
    console.log('Error al obtener cliente:', error);
    return c.json({ error: `Error al obtener cliente: ${error.message}` }, 500);
  }
});

// Buscar cliente por teléfono
app.get('/make-server-ae2ba659/clientes/telefono/:telefono', async (c) => {
  try {
    const telefono = c.req.param('telefono');
    const cliente = await kv.get(`cliente:telefono:${telefono}`);
    
    if (!cliente) {
      return c.json({ success: true, cliente: null });
    }
    
    return c.json({ success: true, cliente });
  } catch (error) {
    console.log('Error al buscar cliente por teléfono:', error);
    return c.json({ error: `Error al buscar cliente: ${error.message}` }, 500);
  }
});

// Obtener historial de pedidos de un cliente
app.get('/make-server-ae2ba659/clientes/:id/historial', async (c) => {
  try {
    const clienteId = c.req.param('id');
    
    // Obtener todos los pedidos del cliente
    const pedidosIds = await kv.getByPrefix(`pedido:cliente:${clienteId}:`);
    
    const pedidos = [];
    for (const id of pedidosIds) {
      const pedido = await kv.get(`pedido:${id}`);
      if (pedido) {
        // Obtener factura asociada si existe
        const factura = await kv.get(`factura:pedido:${id}`);
        pedidos.push({
          ...pedido,
          factura: factura || null
        });
      }
    }
    
    // Ordenar por fecha descendente
    pedidos.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    
    return c.json({ success: true, pedidos });
  } catch (error) {
    console.log('Error al obtener historial del cliente:', error);
    return c.json({ error: `Error al obtener historial: ${error.message}` }, 500);
  }
});

// Obtener promociones activas de un cliente
app.get('/make-server-ae2ba659/clientes/:id/promociones', async (c) => {
  try {
    const clienteId = c.req.param('id');
    
    // Obtener promociones activas
    const promocionesIds = await kv.getByPrefix(`promocion:cliente:${clienteId}:`);
    
    const promociones = [];
    for (const id of promocionesIds) {
      const promocion = await kv.get(`promocion:${id}`);
      if (promocion && promocion.activa) {
        promociones.push(promocion);
      }
    }
    
    return c.json({ success: true, promociones });
  } catch (error) {
    console.log('Error al obtener promociones del cliente:', error);
    return c.json({ error: `Error al obtener promociones: ${error.message}` }, 500);
  }
});

// Obtener productos favoritos de un cliente
app.get('/make-server-ae2ba659/clientes/:id/favoritos', async (c) => {
  try {
    const clienteId = c.req.param('id');
    
    // Obtener todos los pedidos del cliente para calcular favoritos
    const pedidosIds = await kv.getByPrefix(`pedido:cliente:${clienteId}:`);
    
    const conteoProductos: Record<string, number> = {};
    
    for (const pedidoId of pedidosIds) {
      const pedido = await kv.get(`pedido:${pedidoId}`);
      if (pedido && pedido.items) {
        for (const item of pedido.items) {
          const productoId = item.producto?.id || item.productoId;
          if (productoId) {
            conteoProductos[productoId] = (conteoProductos[productoId] || 0) + item.cantidad;
          }
        }
      }
    }
    
    // Ordenar por cantidad y obtener detalles
    const favoritosIds = Object.entries(conteoProductos)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([id]) => id);
    
    const favoritos = [];
    for (const productoId of favoritosIds) {
      const producto = await kv.get(`producto:${productoId}`);
      if (producto) {
        favoritos.push({
          ...producto,
          vecesPedido: conteoProductos[productoId]
        });
      }
    }
    
    return c.json({ success: true, favoritos });
  } catch (error) {
    console.log('Error al obtener favoritos del cliente:', error);
    return c.json({ error: `Error al obtener favoritos: ${error.message}` }, 500);
  }
});

// Actualizar cliente
app.put('/make-server-ae2ba659/clientes/:id', async (c) => {
  try {
    const clienteId = c.req.param('id');
    const updates = await c.req.json();
    
    const clienteActual = await kv.get(`cliente:${clienteId}`);
    if (!clienteActual) {
      return c.json({ error: 'Cliente no encontrado' }, 404);
    }
    
    const clienteActualizado = {
      ...clienteActual,
      ...updates,
      updatedAt: new Date().toISOString()
    };
    
    await kv.set(`cliente:${clienteId}`, clienteActualizado);
    
    // Actualizar índice de teléfono si cambió
    if (updates.telefono && updates.telefono !== clienteActual.telefono) {
      await kv.del(`cliente:telefono:${clienteActual.telefono}`);
      await kv.set(`cliente:telefono:${updates.telefono}`, clienteActualizado);
    }
    
    return c.json({ success: true, cliente: clienteActualizado });
  } catch (error) {
    console.log('Error al actualizar cliente:', error);
    return c.json({ error: `Error al actualizar cliente: ${error.message}` }, 500);
  }
});

// ==================== FACTURAS ====================

// Crear factura
app.post('/make-server-ae2ba659/facturas', async (c) => {
  try {
    const facturaData = await c.req.json();
    const facturaId = `FACT-${new Date().getFullYear()}-${Date.now()}`;
    
    const factura = {
      ...facturaData,
      id: facturaId,
      createdAt: new Date().toISOString()
    };

    await kv.set(`factura:${facturaId}`, factura);
    
    // Indexar por cliente
    if (factura.clienteId) {
      await kv.set(`factura:cliente:${factura.clienteId}:${facturaId}`, facturaId);
    }
    
    // Indexar por pedido si existe
    if (factura.pedidoId) {
      await kv.set(`factura:pedido:${factura.pedidoId}`, factura);
    }
    
    return c.json({ success: true, factura });
  } catch (error) {
    console.log('Error al crear factura:', error);
    return c.json({ error: `Error al crear factura: ${error.message}` }, 500);
  }
});

// Obtener factura por ID
app.get('/make-server-ae2ba659/facturas/:id', async (c) => {
  try {
    const facturaId = c.req.param('id');
    const factura = await kv.get(`factura:${facturaId}`);
    
    if (!factura) {
      return c.json({ error: 'Factura no encontrada' }, 404);
    }
    
    return c.json({ success: true, factura });
  } catch (error) {
    console.log('Error al obtener factura:', error);
    return c.json({ error: `Error al obtener factura: ${error.message}` }, 500);
  }
});

// Obtener facturas de un cliente
app.get('/make-server-ae2ba659/facturas/cliente/:clienteId', async (c) => {
  try {
    const clienteId = c.req.param('clienteId');
    const facturasIds = await kv.getByPrefix(`factura:cliente:${clienteId}:`);
    
    const facturas = [];
    for (const id of facturasIds) {
      const factura = await kv.get(`factura:${id}`);
      if (factura) facturas.push(factura);
    }
    
    // Ordenar por fecha descendente
    facturas.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    
    return c.json({ success: true, facturas });
  } catch (error) {
    console.log('Error al obtener facturas del cliente:', error);
    return c.json({ error: `Error al obtener facturas: ${error.message}` }, 500);
  }
});

// Iniciar servidor
Deno.serve(app.fetch);