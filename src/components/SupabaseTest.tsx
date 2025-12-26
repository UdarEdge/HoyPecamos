import { useState } from 'react';
import { healthAPI, marcasAPI, testAPI } from '../services/api';
import { useProductos } from '../contexts/ProductosContext';

export function SupabaseTest() {
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const { productos } = useProductos();

  async function testConnection() {
    try {
      setLoading(true);
      const response = await healthAPI.check();
      setResult({ success: true, message: 'Conexión exitosa', data: response });
    } catch (error: any) {
      setResult({ success: false, error: error.message });
    } finally {
      setLoading(false);
    }
  }

  async function testCreateMarca() {
    try {
      setLoading(true);
      const response = await testAPI.createMarca({
        nombre: 'HoyPecamos Test',
        descripcion: 'Marca de prueba',
        activo: true,
        colorPrimario: '#000000',
        colorSecundario: '#ED1C24',
      });
      setResult({ success: true, message: 'Marca creada', data: response });
    } catch (error: any) {
      setResult({ success: false, error: error.message });
    } finally {
      setLoading(false);
    }
  }

  async function testGetMarcas() {
    try {
      setLoading(true);
      const response = await marcasAPI.getAll();
      setResult({ success: true, message: 'Marcas obtenidas', data: response });
    } catch (error: any) {
      setResult({ success: false, error: error.message });
    } finally {
      setLoading(false);
    }
  }

  async function migrarProductos() {
    try {
      setLoading(true);
      const response = await testAPI.migrarProductos(productos);
      setResult({ 
        success: true, 
        message: 'Productos migrados', 
        data: response 
      });
    } catch (error: any) {
      setResult({ success: false, error: error.message });
    } finally {
      setLoading(false);
    }
  }

  const [minimizado, setMinimizado] = useState(false);

  if (minimizado) {
    return (
      <button
        onClick={() => setMinimizado(false)}
        className="fixed bottom-4 right-4 bg-red-600 text-white p-3 rounded-full shadow-2xl hover:bg-red-700 z-50"
        title="Abrir Panel de Pruebas"
      >
        🧪
      </button>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 bg-white p-6 rounded-lg shadow-2xl border-2 border-red-500 z-50 max-w-md">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-red-600">🔴 Panel de Pruebas Supabase</h3>
        <button
          onClick={() => setMinimizado(true)}
          className="text-gray-400 hover:text-gray-600"
        >
          ✕
        </button>
      </div>
      
      <div className="space-y-2 mb-4">
        <button
          onClick={testConnection}
          disabled={loading}
          className="w-full px-4 py-2 bg-black text-white rounded hover:bg-gray-800 disabled:opacity-50"
        >
          Test Conexión
        </button>
        
        <button
          onClick={testCreateMarca}
          disabled={loading}
          className="w-full px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50"
        >
          Crear Marca Test
        </button>
        
        <button
          onClick={testGetMarcas}
          disabled={loading}
          className="w-full px-4 py-2 bg-black text-white rounded hover:bg-gray-800 disabled:opacity-50"
        >
          Obtener Marcas
        </button>
        
        <button
          onClick={migrarProductos}
          disabled={loading}
          className="w-full px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50"
        >
          Migrar {productos.length} Productos
        </button>
      </div>

      {loading && (
        <div className="text-center py-4 text-gray-600">
          Cargando...
        </div>
      )}

      {result && (
        <div className={`p-4 rounded ${result.success ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
          <p className={result.success ? 'text-green-800' : 'text-red-800'}>
            {result.success ? '✅ ' : '❌ '}
            {result.message || result.error}
          </p>
          
          {result.data && (
            <pre className="mt-2 text-xs overflow-auto max-h-48 bg-white p-2 rounded">
              {JSON.stringify(result.data, null, 2)}
            </pre>
          )}
        </div>
      )}
    </div>
  );
}