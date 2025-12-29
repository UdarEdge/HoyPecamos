# 📥 SISTEMA DE IMPORTACIÓN DE PRODUCTOS - IMPLEMENTADO

## 📝 RESUMEN

Sistema completo de importación masiva de productos mediante archivos CSV o Excel, con validación previa, preview de datos y confirmación de importación.

---

## 🎯 CARACTERÍSTICAS IMPLEMENTADAS

### **1. ✅ Modal de Importación en 3 Pasos**

```
Paso 1: SUBIR ARCHIVO
  ↓
Paso 2: PREVIEW Y VALIDACIÓN
  ↓
Paso 3: CONFIRMACIÓN
```

---

## 📊 PASO 1: SUBIR ARCHIVO

### **Botón de Acceso**
**Ubicación:** Header de "Catálogo de Productos", junto al botón Exportar

```jsx
<Button 
  variant="default"
  className="bg-teal-600 hover:bg-teal-700"
  onClick={() => setModalImportarProductos(true)}
>
  <Upload /> Importar
</Button>
```

### **Estructura del Modal - Paso 1**

#### **1. Advertencia Importante (Estilo Naranja)**
```jsx
<div className="bg-amber-50 border border-amber-200">
  <AlertTriangle />
  <h4>Importante antes de importar</h4>
  <ul>
    ✓ Asegúrate de que tus archivos siguen el formato correcto
    ✓ Descarga las plantillas de ejemplo antes de importar
    ✓ Los campos marcados con * son obligatorios
    ✓ Revisa el preview antes de confirmar
  </ul>
</div>
```

**Características:**
- ✅ Fondo amber-50 (naranja suave)
- ✅ Icono AlertTriangle en naranja
- ✅ Lista de bullets con recomendaciones
- ✅ Siguiendo exactamente el diseño de la imagen de referencia

---

#### **2. Sección "Catálogo de Productos"**
```jsx
<div className="border rounded-lg p-6 bg-gray-50">
  {/* Header con icono */}
  <div className="flex items-center gap-3">
    <div className="w-10 h-10 bg-teal-100 rounded-lg">
      <Package className="text-teal-600" />
    </div>
    <div>
      <h3>Catálogo de Productos</h3>
      <p>Importar productos con todos sus detalles</p>
    </div>
  </div>

  {/* Botón Descargar Plantilla */}
  <Button onClick={descargarPlantillaCSV}>
    <Download /> Descargar Plantilla CSV
  </Button>

  {/* Información de campos */}
  <div className="text-xs bg-white rounded p-3 border">
    <p>Campos obligatorios (*):</p>
    • id_producto, nombre, categoria, pvp_base...
  </div>
</div>
```

**Características:**
- ✅ Icono Package en círculo teal
- ✅ Título y descripción
- ✅ Botón para descargar plantilla CSV
- ✅ Recuadro blanco con campos obligatorios

---

#### **3. Plantilla CSV - Campos Incluidos**

**Archivo generado:** `plantilla_productos_udar.csv`

| Campo | Tipo | Obligatorio | Ejemplo |
|-------|------|-------------|---------|
| `id_producto` | string | ✅ SÍ | PRD-001 |
| `nombre` | string | ✅ SÍ | Croissant Mantequilla |
| `descripcion_corta` | string | ⚪ No | Delicioso croissant francés |
| `descripcion_larga` | text | ⚪ No | Croissant elaborado con... |
| `categoria` | string | ✅ SÍ | Bollería |
| `subcategoria` | string | ⚪ No | Pastelería Francesa |
| `pvp_base` | number | ✅ SÍ | 2.50 |
| `iva` | number | ✅ SÍ | 10 |
| `escandallo_unitario` | number | ✅ SÍ | 0.85 |
| `alergenos` | string | ⚪ No | gluten,lactosa |
| `etiquetas` | string | ⚪ No | premium,artesanal |
| `vida_util_horas` | number | ⚪ No | 48 |
| `submarcas` | string | ✅ SÍ | modomio,blackburger |
| `precios_submarca` | string | ⚪ No | 2.50,2.50 |
| `activo_global` | boolean | ⚪ No | true |
| `visible_tpv` | boolean | ⚪ No | true |
| `visible_app` | boolean | ⚪ No | true |
| `imagen_url` | string | ⚪ No | https://... |

**Formato CSV:**
```csv
id_producto*,nombre*,descripcion_corta,categoria*,pvp_base*,iva*,escandallo_unitario*,submarcas*,precios_submarca
PRD-001,Croissant Mantequilla,Delicioso croissant francés,Bollería,2.50,10,0.85,modomio;blackburger,2.50;2.50
PRD-002,Café Espresso,Café italiano intenso,Bebidas,1.50,10,0.35,modomio,1.50
```

**Notas importantes:**
- ✅ Separador de columnas: `,` (coma)
- ✅ Separador de submarcas: `,` (dentro del campo)
- ✅ Formato booleanos: `true` / `false`
- ✅ Encoding: UTF-8
- ✅ Primera fila: headers

---

#### **4. Zona de Subida de Archivo (Drag & Drop)**
```jsx
<div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-teal-500">
  <input
    type="file"
    accept=".csv,.xlsx,.xls"
    onChange={handleFileUpload}
    id="file-upload"
    className="hidden"
  />
  <label htmlFor="file-upload" className="cursor-pointer">
    <Upload className="w-12 h-12 text-gray-400 mx-auto" />
    <p>Selecciona o arrastra un archivo</p>
    <p className="text-sm">CSV, XLSX, XLS (máx. 10MB)</p>
  </label>
</div>
```

**Características:**
- ✅ Borde punteado (border-dashed)
- ✅ Hover effect (verde teal)
- ✅ Input oculto con label clickeable
- ✅ Icono Upload grande (48px)
- ✅ Formatos: .csv, .xlsx, .xls
- ✅ Tamaño máximo: 10MB

**Estados visuales:**
```
SIN ARCHIVO:
  "Selecciona o arrastra un archivo"
  
CON ARCHIVO:
  "plantilla_productos_udar.csv"
  
ERROR:
  Recuadro rojo con mensaje de error
```

---

#### **5. Validación de Errores**
```jsx
{errorImportacion && (
  <div className="bg-red-50 border border-red-200 rounded-lg p-4">
    <AlertTriangle className="text-red-600" />
    <h4>Error en el archivo</h4>
    <p>{errorImportacion}</p>
  </div>
)}
```

**Errores comunes detectados:**
- ❌ Archivo vacío
- ❌ Formato incorrecto (no CSV/Excel)
- ❌ Campos obligatorios faltantes
- ❌ Valores inválidos (precio negativo, IVA > 100%)
- ❌ ID duplicados
- ❌ Submarcas no existentes

---

#### **6. Botones de Acción**
```jsx
<div className="flex justify-between">
  <Button variant="ghost" onClick={cerrar}>
    Cancelar
  </Button>
  <Button 
    onClick={validarYPrevisualizar}
    disabled={!archivoImportacion}
    className="bg-teal-600"
  >
    Validar y Previsualizar
    <ArrowRight />
  </Button>
</div>
```

---

## 📋 PASO 2: PREVIEW Y VALIDACIÓN

### **Estructura**

#### **1. Banner Informativo (Azul)**
```jsx
<div className="bg-blue-50 border border-blue-200">
  <Info />
  <h4>Vista previa de los datos</h4>
  <p>Se importarán <strong>3 productos</strong></p>
</div>
```

---

#### **2. Tabla de Preview**
```jsx
<table className="w-full">
  <thead className="bg-gray-100 sticky top-0">
    <tr>
      <th>Estado</th>
      <th>ID Producto</th>
      <th>Nombre</th>
      <th>PVP</th>
      <th>Submarcas</th>
    </tr>
  </thead>
  <tbody>
    {datosPreview.map(producto => (
      <tr>
        <td>
          <Badge className={válido ? 'green' : 'red'}>
            {válido ? <CheckCircle /> : <AlertTriangle />}
            {producto.estado}
          </Badge>
        </td>
        <td className="font-mono">{producto.id_producto}</td>
        <td className="font-medium">{producto.nombre}</td>
        <td className="text-teal-600">€{producto.pvp_base}</td>
        <td>{producto.submarcas}</td>
      </tr>
    ))}
  </tbody>
</table>
```

**Características:**
- ✅ Scroll vertical (max-h-96)
- ✅ Header sticky
- ✅ Estados con badges de color
  - 🟢 Verde: Válido
  - 🔴 Rojo: Error
- ✅ Hover effect en filas

**Ejemplo de datos en preview:**
| Estado | ID | Nombre | PVP | Submarcas |
|--------|-------|---------|-----|-----------|
| ✅ Válido | PRD-001 | Croissant | €2.50 | modomio,blackburger |
| ✅ Válido | PRD-002 | Café | €1.50 | modomio |
| ❌ Error | PRD-003 | Pizza | - | ERROR: precio vacío |

---

#### **3. Resumen en Cards (Grid 3 Columnas)**
```jsx
<div className="grid grid-cols-3 gap-4">
  {/* Válidos */}
  <div className="bg-green-50 border border-green-200">
    <CheckCircle className="text-green-600" />
    <p className="text-2xl font-bold">3</p>
    <p>Productos válidos</p>
  </div>

  {/* Con errores */}
  <div className="bg-red-50 border border-red-200">
    <AlertTriangle className="text-red-600" />
    <p className="text-2xl font-bold">0</p>
    <p>Con errores</p>
  </div>

  {/* Total */}
  <div className="bg-blue-50 border border-blue-200">
    <Package className="text-blue-600" />
    <p className="text-2xl font-bold">3</p>
    <p>Total a importar</p>
  </div>
</div>
```

**Métricas mostradas:**
- 🟢 **Productos válidos:** Listos para importar
- 🔴 **Con errores:** Filas con problemas
- 🔵 **Total:** Cantidad en el archivo

---

#### **4. Botones de Acción**
```jsx
<div className="flex justify-between">
  <Button variant="ghost" onClick={volver}>
    <ArrowLeft /> Volver
  </Button>
  <Button 
    onClick={confirmarImportacion}
    disabled={importando || válidos === 0}
    className="bg-teal-600"
  >
    {importando ? (
      <>
        <RefreshCw className="animate-spin" />
        Importando...
      </>
    ) : (
      <>
        Confirmar Importación
        <Check />
      </>
    )}
  </Button>
</div>
```

**Estados del botón:**
- ⚪ Normal: "Confirmar Importación"
- 🔄 Cargando: "Importando..." (spinner)
- ❌ Deshabilitado: Si hay 0 productos válidos

---

## ✅ PASO 3: CONFIRMACIÓN

### **Estructura**

```jsx
<div className="text-center py-8">
  {/* Icono de éxito */}
  <div className="w-16 h-16 bg-green-100 rounded-full mx-auto">
    <CheckCircle className="w-10 h-10 text-green-600" />
  </div>

  {/* Mensaje principal */}
  <h3 className="text-2xl font-bold">¡Importación completada!</h3>
  <p>Se han importado <strong>3 productos</strong> correctamente.</p>

  {/* Resumen en card */}
  <div className="bg-gray-50 border rounded-lg p-6">
    <div className="space-y-3">
      <div className="flex justify-between">
        <span>Productos importados:</span>
        <span className="font-semibold">3</span>
      </div>
      <div className="flex justify-between">
        <span>Submarcas asignadas:</span>
        <span className="font-semibold">Automático</span>
      </div>
      <div className="flex justify-between">
        <span>Estado:</span>
        <Badge className="bg-green-100">
          <CheckCircle /> Activos
        </Badge>
      </div>
    </div>
  </div>
</div>

{/* Botón finalizar */}
<Button onClick={finalizar} className="bg-teal-600">
  Finalizar
</Button>
```

**Características:**
- ✅ Icono grande de éxito (CheckCircle 64px)
- ✅ Mensaje de confirmación con número de productos
- ✅ Card con resumen de la importación
- ✅ Toast de éxito al finalizar

---

## 🔧 LÓGICA BACKEND (A IMPLEMENTAR)

### **1. Validación de Archivo**
```typescript
function validarArchivoCSV(archivo: File): ValidacionResult {
  // 1. Verificar extensión
  if (!archivo.name.match(/\.(csv|xlsx|xls)$/)) {
    return { valido: false, error: 'Formato no soportado' };
  }

  // 2. Verificar tamaño (máx 10MB)
  if (archivo.size > 10 * 1024 * 1024) {
    return { valido: false, error: 'Archivo demasiado grande (máx. 10MB)' };
  }

  return { valido: true };
}
```

### **2. Parseo de CSV/Excel**
```typescript
// Usar librería: Papa Parse (CSV) o XLSX (Excel)
import Papa from 'papaparse';
import * as XLSX from 'xlsx';

function parsearCSV(archivo: File): Promise<any[]> {
  return new Promise((resolve, reject) => {
    Papa.parse(archivo, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        resolve(results.data);
      },
      error: (error) => {
        reject(error);
      }
    });
  });
}

function parsearExcel(archivo: File): Promise<any[]> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const data = new Uint8Array(e.target.result as ArrayBuffer);
      const workbook = XLSX.read(data, { type: 'array' });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const json = XLSX.utils.sheet_to_json(worksheet);
      resolve(json);
    };
    reader.onerror = reject;
    reader.readAsArrayBuffer(archivo);
  });
}
```

### **3. Validación de Datos**
```typescript
function validarProducto(producto: any): ProductoValidado {
  const errores: string[] = [];

  // Campos obligatorios
  if (!producto.id_producto) errores.push('ID producto requerido');
  if (!producto.nombre) errores.push('Nombre requerido');
  if (!producto.categoria) errores.push('Categoría requerida');
  if (!producto.pvp_base) errores.push('PVP requerido');
  if (!producto.iva) errores.push('IVA requerido');
  if (!producto.escandallo_unitario) errores.push('Escandallo requerido');
  if (!producto.submarcas) errores.push('Submarcas requeridas');

  // Validaciones de formato
  if (producto.pvp_base && producto.pvp_base <= 0) {
    errores.push('PVP debe ser mayor a 0');
  }
  if (producto.iva && (producto.iva < 0 || producto.iva > 100)) {
    errores.push('IVA debe estar entre 0 y 100');
  }

  // Validar submarcas existen
  const submarcasValidas = ['modomio', 'blackburger'];
  const submarcasProducto = producto.submarcas.split(',');
  const submarcasInvalidas = submarcasProducto.filter(
    s => !submarcasValidas.includes(s.trim().toLowerCase())
  );
  if (submarcasInvalidas.length > 0) {
    errores.push(`Submarcas inválidas: ${submarcasInvalidas.join(', ')}`);
  }

  return {
    ...producto,
    estado: errores.length === 0 ? 'válido' : 'error',
    errores: errores
  };
}
```

### **4. Importación a Base de Datos**
```typescript
async function importarProductos(productos: ProductoValidado[]): Promise<void> {
  const productosValidos = productos.filter(p => p.estado === 'válido');

  for (const producto of productosValidos) {
    // 1. Insertar en tabla PRODUCTO
    await supabase.from('PRODUCTO').insert({
      id_producto: producto.id_producto,
      nombre: producto.nombre,
      descripcion_corta: producto.descripcion_corta,
      descripcion_larga: producto.descripcion_larga,
      categoria: producto.categoria,
      subcategoria: producto.subcategoria,
      pvp_base: parseFloat(producto.pvp_base),
      iva: parseFloat(producto.iva),
      escandallo_unitario: parseFloat(producto.escandallo_unitario),
      alergenos: producto.alergenos?.split(',') || [],
      etiquetas: producto.etiquetas?.split(',') || [],
      vida_util_horas: parseInt(producto.vida_util_horas) || null,
      activo_global: producto.activo_global === 'true',
      visible_tpv: producto.visible_tpv === 'true',
      visible_app: producto.visible_app === 'true',
      imagen_url: producto.imagen_url
    });

    // 2. Insertar en tabla PRODUCTO_SUBMARCA
    const submarcas = producto.submarcas.split(',');
    const precios = producto.precios_submarca?.split(',') || [];

    for (let i = 0; i < submarcas.length; i++) {
      const submarca = submarcas[i].trim();
      const precio = precios[i] ? parseFloat(precios[i]) : null;

      await supabase.from('PRODUCTO_SUBMARCA').insert({
        id_producto: producto.id_producto,
        id_submarca: getSubmarcaId(submarca), // modomio → SUB-001
        pvp_submarca: precio,
        activo_en_submarca: true,
        destacado: false,
        orden_menu: 999
      });
    }
  }
}

function getSubmarcaId(slug: string): string {
  const map = {
    'modomio': 'SUB-001',
    'blackburger': 'SUB-002'
  };
  return map[slug.toLowerCase()] || 'SUB-001';
}
```

---

## 🎨 ESTADOS VISUALES

### **Estados del Modal**
| Estado | Vista | Descripción |
|--------|-------|-------------|
| `subir` | Paso 1 | Advertencia + Plantilla + Zona upload |
| `preview` | Paso 2 | Tabla preview + Resumen + Validación |
| `confirmacion` | Paso 3 | Mensaje éxito + Resumen final |

### **Estados del Archivo**
| Estado | UI |
|--------|-----|
| Sin archivo | "Selecciona o arrastra..." |
| Con archivo | Nombre del archivo |
| Validando | Spinner + "Validando..." |
| Error | Banner rojo con mensaje |

### **Estados de Importación**
| Estado | Botón |
|--------|-------|
| Idle | "Confirmar Importación" |
| Importando | <RefreshCw spin /> "Importando..." |
| Completado | Paso 3 (confirmación) |

---

## 📱 RESPONSIVE

### **Desktop (≥ 768px)**
- ✅ Modal ancho: 896px (max-w-4xl)
- ✅ Grid resumen: 3 columnas
- ✅ Tabla: Ancho completo

### **Mobile (< 768px)**
- ✅ Modal: 100% ancho con padding
- ✅ Grid resumen: 1 columna (stack)
- ✅ Tabla: Scroll horizontal

---

## 🧪 EJEMPLO DE USO COMPLETO

### **1. Usuario hace click en "Importar"**
```
→ Se abre modal en Paso 1
→ Ve advertencia naranja
→ Ve botón "Descargar Plantilla"
```

### **2. Descarga plantilla CSV**
```
→ Click en "Descargar Plantilla CSV"
→ Se descarga: plantilla_productos_udar.csv
→ Contiene headers + 1 fila de ejemplo
```

### **3. Rellena plantilla en Excel**
```csv
id_producto,nombre,categoria,pvp_base,iva,escandallo_unitario,submarcas,precios_submarca
PRD-101,Pizza Margarita,Pizzas,9.50,10,3.20,modomio;blackburger,9.50;10.00
PRD-102,Burger Clásica,Burgers,8.50,10,2.80,blackburger,8.50
PRD-103,Coca-Cola 330ml,Bebidas,2.00,21,0.60,modomio;blackburger,2.00;2.50
```

### **4. Sube archivo**
```
→ Arrastra archivo a zona upload
→ Aparece nombre: "mis_productos.csv"
→ Click en "Validar y Previsualizar"
```

### **5. Revisa preview (Paso 2)**
```
→ Ve tabla con 3 productos
→ Resumen:
  • Válidos: 3
  • Errores: 0
  • Total: 3
→ Click en "Confirmar Importación"
```

### **6. Importación (Spinner 2 segundos)**
```
→ Botón: "Importando..." con spinner
→ Backend procesa archivo
→ Inserta en BD
```

### **7. Confirmación (Paso 3)**
```
→ ✅ "¡Importación completada!"
→ "3 productos importados correctamente"
→ Click en "Finalizar"
→ Modal se cierra
→ Toast: "3 productos importados correctamente"
```

---

## ✅ CHECKLIST DE IMPLEMENTACIÓN

### **UI/UX:**
- ✅ Botón "Importar" en header productos
- ✅ Modal en 3 pasos
- ✅ Advertencia naranja (estilo referencia)
- ✅ Sección "Catálogo de Productos" con icono
- ✅ Botón "Descargar Plantilla CSV"
- ✅ Información de campos obligatorios
- ✅ Zona drag & drop para archivo
- ✅ Validación visual (verde/rojo)
- ✅ Tabla de preview con scroll
- ✅ Resumen en cards (3 columnas)
- ✅ Estados de carga (spinner)
- ✅ Pantalla de confirmación
- ✅ Toasts de feedback

### **Funcionalidad:**
- ✅ Estados de paso (subir/preview/confirmacion)
- ✅ Generación de plantilla CSV
- ✅ Upload de archivo (.csv, .xlsx, .xls)
- ✅ Validación de formato
- ✅ Preview de datos simulado
- ✅ Contador de válidos/errores
- ✅ Simulación de importación
- ✅ Reset de estados al cerrar

### **Pendiente (Backend):**
- ⏳ Parseo real de CSV con Papa Parse
- ⏳ Parseo real de Excel con XLSX
- ⏳ Validación completa de datos
- ⏳ Inserción en tabla PRODUCTO
- ⏳ Inserción en tabla PRODUCTO_SUBMARCA
- ⏳ Manejo de errores robusto
- ⏳ Progreso de importación real
- ⏳ Rollback en caso de error

---

## 🎨 PALETA DE COLORES

### **Advertencia (Paso 1):**
- Fondo: `bg-amber-50`
- Borde: `border-amber-200`
- Texto: `text-amber-800` / `text-amber-900`
- Icono: `text-amber-600`

### **Información (Paso 2):**
- Fondo: `bg-blue-50`
- Borde: `border-blue-200`
- Texto: `text-blue-800` / `text-blue-900`
- Icono: `text-blue-600`

### **Éxito (Paso 3):**
- Fondo: `bg-green-50` / `bg-green-100`
- Borde: `border-green-200`
- Texto: `text-green-700` / `text-green-900`
- Icono: `text-green-600`

### **Error:**
- Fondo: `bg-red-50`
- Borde: `border-red-200`
- Texto: `text-red-800` / `text-red-900`
- Icono: `text-red-600`

### **Botones:**
- Principal: `bg-teal-600 hover:bg-teal-700`
- Secundario: `variant="outline"`
- Cancelar: `variant="ghost"`

---

## 🚀 SIGUIENTE PASO

**Integración con Backend:**
1. Instalar librerías:
   ```bash
   npm install papaparse xlsx
   npm install -D @types/papaparse
   ```

2. Implementar parseo real en `handleFileUpload`
3. Conectar validación con API
4. Insertar datos en Supabase
5. Añadir manejo de errores robusto
6. Implementar progreso de importación (barra %)

---

## 🎉 RESULTADO FINAL

✅ **Modal completo de importación** (3 pasos)
✅ **Advertencia estilo naranja** (siguiendo diseño de referencia)
✅ **Descarga de plantilla CSV** (con headers + ejemplo)
✅ **Upload de archivo** (drag & drop)
✅ **Preview de datos** (tabla con validación)
✅ **Resumen visual** (cards con métricas)
✅ **Confirmación de éxito** (pantalla final)
✅ **UX profesional** (spinners, toasts, estados visuales)

**Estado:** 🟢 **UI COMPLETA - LISTA PARA INTEGRACIÓN BACKEND**

---

**¿Quieres que implemente el backend de parseo CSV/Excel o ajustamos algo de la UI?** 😊
