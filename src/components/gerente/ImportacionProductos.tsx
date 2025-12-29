/**
 * 📥 IMPORTACIÓN DE PRODUCTOS - PANEL GERENTE
 * Interface completa para importar productos desde JSON, CSV o formulario manual
 */

import React, { useState, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Badge } from '../ui/badge';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../ui/tabs';
import { 
  Upload, 
  Download, 
  FileJson, 
  FileText, 
  Plus, 
  Check, 
  X, 
  AlertCircle,
  PackagePlus,
  Eye,
  Save,
  Trash2,
  RefreshCw
} from 'lucide-react';
import { toast } from 'sonner@2.0.3';
import { useProductos } from '../../contexts/ProductosContext';
import { SUBMARCAS_ARRAY } from '../../constants/empresaConfig';
import type { Producto } from '../../types/producto.types';

interface ProductoImportacion {
  nombre: string;
  descripcion?: string;
  precio: number;
  precioOriginal?: number;
  tipoProducto: string;
  categoria?: string;
  submarcaId: string;
  imagen?: string;
  disponible?: boolean;
  esPromocion?: boolean;
  stock?: number;
  sku?: string;
}

export function ImportacionProductos() {
  const { agregarProducto } = useProductos();
  const [metodoImportacion, setMetodoImportacion] = useState<'json' | 'csv' | 'manual'>('json');
  const [jsonInput, setJsonInput] = useState('');
  const [productosPreview, setProductosPreview] = useState<ProductoImportacion[]>([]);
  const [importando, setImportando] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Estado para formulario manual
  const [formManual, setFormManual] = useState<ProductoImportacion>({
    nombre: '',
    descripcion: '',
    precio: 0,
    tipoProducto: 'pizzas',
    submarcaId: 'modommio',
    disponible: true,
    esPromocion: false,
  });

  // ============================================
  // VALIDAR PRODUCTOS
  // ============================================
  
  const validarProducto = (producto: any): string | null => {
    if (!producto.nombre || producto.nombre.trim() === '') {
      return 'El nombre es obligatorio';
    }
    if (!producto.precio || producto.precio <= 0) {
      return 'El precio debe ser mayor a 0';
    }
    if (!producto.submarcaId) {
      return 'Debe especificar una submarca';
    }
    if (!producto.tipoProducto) {
      return 'Debe especificar un tipo de producto';
    }
    return null;
  };

  // ============================================
  // IMPORTAR DESDE JSON
  // ============================================
  
  const procesarJSON = () => {
    try {
      const productos = JSON.parse(jsonInput);
      const productosArray = Array.isArray(productos) ? productos : [productos];
      
      // Validar todos los productos
      const errores: string[] = [];
      productosArray.forEach((prod, index) => {
        const error = validarProducto(prod);
        if (error) {
          errores.push(`Producto ${index + 1}: ${error}`);
        }
      });
      
      if (errores.length > 0) {
        toast.error('Errores de validación', {
          description: errores.join('\n'),
          duration: 5000,
        });
        return;
      }
      
      setProductosPreview(productosArray);
      toast.success(`${productosArray.length} productos listos para importar`);
    } catch (error) {
      toast.error('Error al procesar JSON', {
        description: 'Verifica que el formato JSON sea válido',
      });
    }
  };

  // ============================================
  // IMPORTAR DESDE CSV
  // ============================================
  
  const procesarCSV = (contenido: string) => {
    try {
      const lineas = contenido.split('\n').filter(l => l.trim());
      const headers = lineas[0].split(',').map(h => h.trim());
      
      const productos: ProductoImportacion[] = [];
      
      for (let i = 1; i < lineas.length; i++) {
        const valores = lineas[i].split(',').map(v => v.trim());
        const producto: any = {};
        
        headers.forEach((header, index) => {
          producto[header] = valores[index];
        });
        
        // Convertir tipos
        producto.precio = parseFloat(producto.precio);
        if (producto.precioOriginal) producto.precioOriginal = parseFloat(producto.precioOriginal);
        if (producto.stock) producto.stock = parseInt(producto.stock);
        producto.disponible = producto.disponible !== 'false';
        producto.esPromocion = producto.esPromocion === 'true';
        
        const error = validarProducto(producto);
        if (error) {
          toast.error(`Error en línea ${i + 1}: ${error}`);
          continue;
        }
        
        productos.push(producto);
      }
      
      setProductosPreview(productos);
      toast.success(`${productos.length} productos listos para importar`);
    } catch (error) {
      toast.error('Error al procesar CSV', {
        description: 'Verifica que el formato sea correcto',
      });
    }
  };

  // ============================================
  // MANEJAR ARCHIVO
  // ============================================
  
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (e) => {
      const contenido = e.target?.result as string;
      
      if (file.name.endsWith('.json')) {
        setJsonInput(contenido);
        setMetodoImportacion('json');
        try {
          JSON.parse(contenido);
          toast.success('Archivo JSON cargado correctamente');
        } catch {
          toast.error('El archivo JSON no es válido');
        }
      } else if (file.name.endsWith('.csv')) {
        procesarCSV(contenido);
        setMetodoImportacion('csv');
      }
    };
    reader.readAsText(file);
  };

  // ============================================
  // CONFIRMAR IMPORTACIÓN
  // ============================================
  
  const confirmarImportacion = async () => {
    setImportando(true);
    
    try {
      let productosImportados = 0;
      
      for (const prod of productosPreview) {
        const nuevoProducto: Producto = {
          id: `PROD-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          nombre: prod.nombre,
          descripcion: prod.descripcion || '',
          precio: prod.precio,
          precioOriginal: prod.precioOriginal,
          tipoProducto: prod.tipoProducto,
          categoria: prod.categoria || prod.tipoProducto,
          submarcaId: prod.submarcaId,
          imagen: prod.imagen || 'https://via.placeholder.com/300x200?text=Sin+Imagen',
          disponible: prod.disponible !== false,
          esPromocion: prod.esPromocion || false,
          destacado: false,
          vegano: false,
          vegetariano: false,
          sinGluten: false,
          nuevo: false,
          stock: prod.stock,
          sku: prod.sku,
          fechaCreacion: new Date().toISOString(),
        };
        
        await agregarProducto(nuevoProducto);
        productosImportados++;
      }
      
      toast.success(`✅ ${productosImportados} productos importados exitosamente`);
      setProductosPreview([]);
      setJsonInput('');
      
    } catch (error) {
      toast.error('Error al importar productos', {
        description: error instanceof Error ? error.message : 'Error desconocido',
      });
    } finally {
      setImportando(false);
    }
  };

  // ============================================
  // AGREGAR PRODUCTO MANUAL
  // ============================================
  
  const agregarProductoManual = async () => {
    const error = validarProducto(formManual);
    if (error) {
      toast.error(error);
      return;
    }
    
    try {
      const nuevoProducto: Producto = {
        id: `PROD-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        nombre: formManual.nombre,
        descripcion: formManual.descripcion || '',
        precio: formManual.precio,
        precioOriginal: formManual.precioOriginal,
        tipoProducto: formManual.tipoProducto,
        categoria: formManual.categoria || formManual.tipoProducto,
        submarcaId: formManual.submarcaId,
        imagen: formManual.imagen || 'https://via.placeholder.com/300x200?text=Sin+Imagen',
        disponible: formManual.disponible !== false,
        esPromocion: formManual.esPromocion || false,
        destacado: false,
        vegano: false,
        vegetariano: false,
        sinGluten: false,
        nuevo: false,
        stock: formManual.stock,
        sku: formManual.sku,
        fechaCreacion: new Date().toISOString(),
      };
      
      await agregarProducto(nuevoProducto);
      toast.success('✅ Producto agregado exitosamente');
      
      // Resetear formulario
      setFormManual({
        nombre: '',
        descripcion: '',
        precio: 0,
        tipoProducto: 'pizzas',
        submarcaId: 'modommio',
        disponible: true,
        esPromocion: false,
      });
      
    } catch (error) {
      toast.error('Error al agregar producto');
    }
  };

  // ============================================
  // DESCARGAR PLANTILLA
  // ============================================
  
  const descargarPlantillaJSON = () => {
    const plantilla = [
      {
        nombre: "Pizza Margarita",
        descripcion: "Tomate, mozzarella y albahaca fresca",
        precio: 12.50,
        precioOriginal: 15.00,
        tipoProducto: "pizzas",
        categoria: "pizzas",
        submarcaId: "modommio",
        imagen: "https://ejemplo.com/margarita.jpg",
        disponible: true,
        esPromocion: true,
        stock: 50,
        sku: "PIZZA-001"
      },
      {
        nombre: "Hamburguesa Black",
        descripcion: "Carne premium con pan negro",
        precio: 14.90,
        tipoProducto: "hamburguesas",
        categoria: "hamburguesas",
        submarcaId: "blackburger",
        disponible: true,
        esPromocion: false,
        stock: 30,
        sku: "BURGER-001"
      }
    ];
    
    const blob = new Blob([JSON.stringify(plantilla, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'plantilla-productos.json';
    a.click();
    URL.revokeObjectURL(url);
    
    toast.success('Plantilla JSON descargada');
  };

  const descargarPlantillaCSV = () => {
    const csv = `nombre,descripcion,precio,precioOriginal,tipoProducto,categoria,submarcaId,imagen,disponible,esPromocion,stock,sku
Pizza Margarita,Tomate mozzarella y albahaca fresca,12.50,15.00,pizzas,pizzas,modommio,https://ejemplo.com/margarita.jpg,true,true,50,PIZZA-001
Hamburguesa Black,Carne premium con pan negro,14.90,,hamburguesas,hamburguesas,blackburger,,true,false,30,BURGER-001`;
    
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'plantilla-productos.csv';
    a.click();
    URL.revokeObjectURL(url);
    
    toast.success('Plantilla CSV descargada');
  };

  // ============================================
  // RENDER
  // ============================================

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Importación de Productos</h2>
          <p className="text-sm text-gray-500 mt-1">
            Importa productos masivamente desde JSON, CSV o añádelos manualmente
          </p>
        </div>
        
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={descargarPlantillaJSON}
          >
            <Download className="w-4 h-4 mr-2" />
            Plantilla JSON
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={descargarPlantillaCSV}
          >
            <Download className="w-4 h-4 mr-2" />
            Plantilla CSV
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={metodoImportacion} onValueChange={(v: any) => setMetodoImportacion(v)}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="json">
            <FileJson className="w-4 h-4 mr-2" />
            JSON
          </TabsTrigger>
          <TabsTrigger value="csv">
            <FileText className="w-4 h-4 mr-2" />
            CSV
          </TabsTrigger>
          <TabsTrigger value="manual">
            <Plus className="w-4 h-4 mr-2" />
            Manual
          </TabsTrigger>
        </TabsList>

        {/* Tab: JSON */}
        <TabsContent value="json" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Pegar JSON o Cargar Archivo</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="json-input">Datos JSON</Label>
                <Textarea
                  id="json-input"
                  value={jsonInput}
                  onChange={(e) => setJsonInput(e.target.value)}
                  placeholder='[{"nombre": "Pizza Margarita", "precio": 12.50, "tipoProducto": "pizzas", "submarcaId": "modommio"}]'
                  className="min-h-[200px] font-mono text-sm"
                />
              </div>
              
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => fileInputRef.current?.click()}
                  className="flex-1"
                >
                  <Upload className="w-4 h-4 mr-2" />
                  Cargar archivo JSON
                </Button>
                <Button
                  onClick={procesarJSON}
                  disabled={!jsonInput.trim()}
                  className="flex-1 bg-teal-600 hover:bg-teal-700"
                >
                  <Eye className="w-4 h-4 mr-2" />
                  Vista Previa
                </Button>
              </div>
              
              <input
                ref={fileInputRef}
                type="file"
                accept=".json,.csv"
                onChange={handleFileUpload}
                className="hidden"
              />
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab: CSV */}
        <TabsContent value="csv" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Cargar archivo CSV</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm text-blue-900 font-medium mb-2">Formato CSV requerido:</p>
                <code className="text-xs text-blue-700 block whitespace-pre-wrap">
                  nombre,descripcion,precio,tipoProducto,submarcaId
                </code>
              </div>
              
              <Button
                onClick={() => fileInputRef.current?.click()}
                className="w-full bg-teal-600 hover:bg-teal-700"
              >
                <Upload className="w-4 h-4 mr-2" />
                Seleccionar archivo CSV
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab: Manual */}
        <TabsContent value="manual" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Agregar Producto Manualmente</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <Label htmlFor="nombre">Nombre *</Label>
                  <Input
                    id="nombre"
                    value={formManual.nombre}
                    onChange={(e) => setFormManual({...formManual, nombre: e.target.value})}
                    placeholder="Ej: Pizza Margarita"
                  />
                </div>
                
                <div className="col-span-2">
                  <Label htmlFor="descripcion">Descripción</Label>
                  <Textarea
                    id="descripcion"
                    value={formManual.descripcion}
                    onChange={(e) => setFormManual({...formManual, descripcion: e.target.value})}
                    placeholder="Descripción del producto..."
                    rows={2}
                  />
                </div>
                
                <div>
                  <Label htmlFor="precio">Precio (€) *</Label>
                  <Input
                    id="precio"
                    type="number"
                    step="0.01"
                    value={formManual.precio}
                    onChange={(e) => setFormManual({...formManual, precio: parseFloat(e.target.value) || 0})}
                  />
                </div>
                
                <div>
                  <Label htmlFor="precioOriginal">Precio Original (€)</Label>
                  <Input
                    id="precioOriginal"
                    type="number"
                    step="0.01"
                    value={formManual.precioOriginal || ''}
                    onChange={(e) => setFormManual({...formManual, precioOriginal: parseFloat(e.target.value) || undefined})}
                  />
                </div>
                
                <div>
                  <Label htmlFor="tipoProducto">Tipo de Producto *</Label>
                  <Input
                    id="tipoProducto"
                    value={formManual.tipoProducto}
                    onChange={(e) => setFormManual({...formManual, tipoProducto: e.target.value})}
                    placeholder="pizzas, hamburguesas, bebidas..."
                  />
                </div>
                
                <div>
                  <Label htmlFor="submarcaId">Submarca *</Label>
                  <select
                    id="submarcaId"
                    value={formManual.submarcaId}
                    onChange={(e) => setFormManual({...formManual, submarcaId: e.target.value})}
                    className="w-full h-10 px-3 border border-gray-300 rounded-md"
                  >
                    {SUBMARCAS_ARRAY.map(sub => (
                      <option key={sub.id} value={sub.id}>{sub.nombre}</option>
                    ))}
                  </select>
                </div>
                
                <div className="col-span-2">
                  <Label htmlFor="imagen">URL de Imagen</Label>
                  <Input
                    id="imagen"
                    value={formManual.imagen || ''}
                    onChange={(e) => setFormManual({...formManual, imagen: e.target.value})}
                    placeholder="https://ejemplo.com/imagen.jpg"
                  />
                </div>
                
                <div>
                  <Label htmlFor="stock">Stock</Label>
                  <Input
                    id="stock"
                    type="number"
                    value={formManual.stock || ''}
                    onChange={(e) => setFormManual({...formManual, stock: parseInt(e.target.value) || undefined})}
                  />
                </div>
                
                <div>
                  <Label htmlFor="sku">SKU</Label>
                  <Input
                    id="sku"
                    value={formManual.sku || ''}
                    onChange={(e) => setFormManual({...formManual, sku: e.target.value})}
                    placeholder="PROD-001"
                  />
                </div>
              </div>
              
              <Button
                onClick={agregarProductoManual}
                className="w-full bg-teal-600 hover:bg-teal-700"
              >
                <PackagePlus className="w-4 h-4 mr-2" />
                Agregar Producto
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Vista Previa */}
      {productosPreview.length > 0 && (
        <Card className="border-2 border-teal-200">
          <CardHeader className="bg-teal-50">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">
                Vista Previa - {productosPreview.length} productos
              </CardTitle>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setProductosPreview([])}
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Limpiar
                </Button>
                <Button
                  size="sm"
                  onClick={confirmarImportacion}
                  disabled={importando}
                  className="bg-teal-600 hover:bg-teal-700"
                >
                  {importando ? (
                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <Save className="w-4 h-4 mr-2" />
                  )}
                  {importando ? 'Importando...' : 'Confirmar Importación'}
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-4">
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {productosPreview.map((prod, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100"
                >
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">{prod.nombre}</p>
                    <div className="flex gap-2 mt-1">
                      <Badge variant="outline" className="text-xs">
                        {prod.tipoProducto}
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        {SUBMARCAS_ARRAY.find(s => s.id === prod.submarcaId)?.nombre}
                      </Badge>
                      <span className="text-sm text-teal-600 font-semibold">
                        {prod.precio.toFixed(2)}€
                      </span>
                    </div>
                  </div>
                  <Check className="w-5 h-5 text-green-600" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Info adicional */}
      <Card className="bg-amber-50 border-amber-200">
        <CardContent className="p-4 flex gap-3">
          <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-amber-900">Campos obligatorios</p>
            <p className="text-sm text-amber-700 mt-1">
              Nombre, Precio, TipoProducto y SubmarcaId son campos requeridos para importar productos.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
