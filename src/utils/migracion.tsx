import { productosAPI, marcasAPI, planesAPI, testAPI } from '../services/api';

/**
 * Script de migración de LocalStorage a Supabase
 * Ejecutar una sola vez para migrar los datos existentes
 */

export async function migrarDatos() {
  console.log('🚀 Iniciando migración de datos a Supabase...');
  
  try {
    // 1. Migrar Marcas
    console.log('📦 Migrando marcas...');
    const marcasExistentes = [
      {
        id: 'MRC-001',
        nombre: 'Modommio',
        descripcion: 'Pizzería artesanal',
        activo: true,
        colorPrimario: '#000000',
        colorSecundario: '#ED1C24',
      },
      {
        id: 'MRC-002',
        nombre: 'HoyPecamos',
        descripcion: 'Fast food premium',
        activo: true,
        colorPrimario: '#000000',
        colorSecundario: '#ED1C24',
      }
    ];

    for (const marca of marcasExistentes) {
      try {
        await marcasAPI.create(marca);
        console.log(`✅ Marca ${marca.nombre} migrada`);
      } catch (error) {
        console.log(`⚠️ Error al migrar marca ${marca.nombre}:`, error);
      }
    }

    // 2. Migrar Productos desde ProductosContext
    console.log('🍕 Migrando productos...');
    
    // Obtener productos del contexto (simulación, deberás ajustar según tu contexto)
    const productosStorage = localStorage.getItem('productos');
    if (productosStorage) {
      const productos = JSON.parse(productosStorage);
      
      for (const producto of productos) {
        try {
          await productosAPI.create(producto);
          console.log(`✅ Producto ${producto.nombre} migrado`);
        } catch (error) {
          console.log(`⚠️ Error al migrar producto ${producto.nombre}:`, error);
        }
      }
    }

    // 3. Migrar Planes (si existen)
    console.log('💳 Migrando planes de suscripción...');
    const planesStorage = localStorage.getItem('planes');
    if (planesStorage) {
      const planes = JSON.parse(planesStorage);
      
      for (const plan of planes) {
        try {
          await planesAPI.create(plan);
          console.log(`✅ Plan ${plan.nombre} migrado`);
        } catch (error) {
          console.log(`⚠️ Error al migrar plan ${plan.nombre}:`, error);
        }
      }
    }

    console.log('✅ ¡Migración completada!');
    return { success: true, message: 'Datos migrados correctamente' };
    
  } catch (error) {
    console.error('❌ Error en la migración:', error);
    return { success: false, error };
  }
}

/**
 * Migrar productos desde el contexto actual
 */
export async function migrarProductosDesdeContexto(productos: any[]) {
  console.log(`🍕 Migrando ${productos.length} productos a Supabase...`);
  
  try {
    // Usar endpoint de batch para migrar todos de una vez
    const response = await testAPI.migrarProductos(productos);
    
    console.log(`\n📊 Resumen:`);
    console.log(`   ✅ Migrados: ${response.productosIds?.length || 0}`);
    console.log(`   📦 Total: ${productos.length}`);
    console.log(`   🎉 ${response.message}`);

    return { 
      migrados: response.productosIds?.length || 0, 
      errores: 0, 
      total: productos.length,
      message: response.message 
    };
  } catch (error) {
    console.error(`❌ Error en migración:`, error);
    return { migrados: 0, errores: productos.length, total: productos.length };
  }
}

/**
 * Limpiar LocalStorage después de migración exitosa
 */
export function limpiarLocalStorage() {
  const confirmacion = confirm(
    '⚠️ ¿Estás seguro de que quieres limpiar LocalStorage?\n\n' +
    'Esta acción eliminará todos los datos locales.\n' +
    'Asegúrate de que la migración fue exitosa antes de continuar.'
  );

  if (confirmacion) {
    localStorage.clear();
    console.log('✅ LocalStorage limpiado');
    return true;
  }

  return false;
}
