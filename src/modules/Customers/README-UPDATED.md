# Módulo de Clientes - Actualizado

Este módulo proporciona la funcionalidad completa de gestión de clientes (CRUD) en el sistema con características avanzadas de filtrado, soft delete y cálculo de totales.

## 🎯 Características Principales

### ✅ CRUD Completo
- **Crear** nuevos clientes con validación
- **Editar** clientes existentes
- **Eliminar** (soft delete) con opción de restaurar
- **Eliminar permanentemente** (hard delete) para registros soft-deleted

### ✅ Filtros Avanzados
- Búsqueda por nombre o CUIT/CUIL (búsqueda en tiempo real)
- Rango de total gastado (mínimo y máximo)
- Toggle para mostrar/ocultar clientes eliminados

### ✅ Visualización de Datos Calculados
- **Total gastado** por cliente (calculado en backend)
- **Contador de órdenes** de compra
- Formato de moneda en pesos argentinos (ARS)

### ✅ Gestión de Clientes Eliminados (Soft Delete)
- Visualización diferenciada con **fondo rojo claro** y texto rojo
- Indicador visual "(Eliminado)" en el nombre
- Botones específicos:
  - **Restaurar** (icono RotateCcw verde)
  - **Eliminar permanentemente** (icono Trash rojo)

### ✅ Acciones por Cliente
Para **clientes activos**:
- 🧮 **Recalcular** total gastado (actualiza datos desde backend)
- ✏️ **Editar** información
- 🗑️ **Eliminar** (soft delete)

Para **clientes eliminados**:
- 🔄 **Restaurar** cliente
- ⚠️ **Eliminar permanentemente** (irreversible)

## 📂 Estructura de Archivos

```
Customers/
├── components/
│   ├── CustomerDialog.tsx    # Formulario de creación/edición
│   ├── CustomerFilters.tsx   # 🆕 Componente de filtros avanzados
│   └── CustomersTable.tsx    # Tabla con estados visuales mejorados
├── hooks/
│   └── useCustomers.ts       # Hook con gestión de filtros
├── pages/
│   └── CustomersPage.tsx     # Página principal con múltiples diálogos
├── utils/
│   └── customer-api.ts       # Cliente API con endpoints completos
└── README.md
```

## 🔌 API Endpoints

```typescript
// Obtener clientes con filtros
GET /customers?searchTerm=&minTotalPurchases=&maxTotalPurchases=&withDeleted=

// Obtener por ID
GET /customers/:id

// Crear nuevo cliente
POST /customers

// Actualizar cliente
PUT /customers/:id

// Soft delete
DELETE /customers/:id

// 🆕 Restaurar cliente eliminado
PATCH /customers/:id/restore

// 🆕 Hard delete permanente
DELETE /customers/:id/permanent
```

## 📊 Tipos de Datos

```typescript
interface Customer {
  id: string;
  name: string;
  taxId?: string;
  address?: string;
  contactEmail?: string;
  phoneNumber?: string;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string | null;
  totalSpent?: number;      // 🆕 Calculado por backend
  totalOrders?: number;     // 🆕 Calculado por backend
}

interface CustomerFilters {
  searchTerm?: string;
  minTotalPurchases?: number;
  maxTotalPurchases?: number;
  withDeleted?: boolean;
}
```

## 🎨 Componentes Nuevos

### CustomerFilters
Panel de filtros avanzados con:
- Campo de búsqueda por texto
- Inputs numéricos para rango de total gastado
- Botones "Aplicar" y "Limpiar"
- Soporte para Enter en búsqueda rápida

### CustomersTable (Mejorada)
Tabla responsive que incluye:
- Columna **"Total Gastado"** con formato ARS
- Estados visuales diferenciados para eliminados (fondo y texto rojo)
- Tooltips en botones de acción
- Iconos específicos por acción:
  - 🧮 Calculator (recalcular)
  - ✏️ Pencil (editar)
  - 🗑️ Trash2 (soft delete)
  - 🔄 RotateCcw (restaurar)
  - ⚠️ Trash (hard delete)

## 🔄 Flujos de Usuario

### 1. Filtrar Clientes
1. Escribir en el campo de búsqueda o ingresar rangos de total
2. Hacer clic en "Aplicar" o presionar Enter
3. La tabla se actualiza automáticamente

### 2. Ver Clientes Eliminados
1. Hacer clic en botón "Ver Eliminados"
2. Los clientes soft-deleted aparecen con fondo rojo
3. Se muestran botones "Restaurar" y "Eliminar Permanentemente"

### 3. Eliminar Cliente (Soft Delete)
1. En cliente activo, hacer clic en icono de basura
2. Confirmar en diálogo
3. Cliente pasa a estado "eliminado" pero recuperable

### 4. Restaurar Cliente
1. Activar vista de eliminados
2. Hacer clic en icono de restaurar (🔄)
3. Confirmar en diálogo verde
4. Cliente vuelve a estado activo

### 5. Eliminar Permanentemente
1. En cliente eliminado, hacer clic en icono de basura permanente
2. Ver advertencia de acción irreversible
3. Confirmar en diálogo rojo
4. Cliente se elimina de la base de datos

### 6. Recalcular Total Gastado
1. Hacer clic en icono de calculadora (🧮)
2. Sistema consulta backend y actualiza total en tiempo real

## ⚙️ Configuración

### Variables de Entorno
```env
VITE_API_URL=http://localhost:3000
```

### Token de Autenticación
El módulo utiliza:
1. `localStorage.getItem('access_token')` (producción)
2. `MOCK_TOKEN` como fallback (desarrollo/testing)

## 📦 Dependencias

- **shadcn/ui**: `Button`, `Input`, `AlertDialog`
- **lucide-react**: `Plus`, `Eye`, `EyeOff`, `Search`, `X`, `Pencil`, `Trash2`, `RotateCcw`, `Trash`, `Calculator`, `Mail`, `Phone`
- **React hooks**: `useState`, `useEffect`, `useCallback`
- **Utilidades**: `cn` de `@/lib/utils`

## 📝 Notas Técnicas

- El backend calcula `totalSpent` sumando `unitPrice * quantityKg` de todas las órdenes
- Los filtros se aplican mediante query parameters en la URL
- El soft delete utiliza el campo `deletedAt` en la entidad
- Los diálogos de confirmación previenen acciones accidentales
- El formato de moneda usa `Intl.NumberFormat` con locale `es-AR`
- Los clientes eliminados solo son visibles cuando se activa "Ver Eliminados"

## 🚀 Uso

Accede al módulo en la ruta `/customers` de la aplicación.

Asegúrate de tener un token válido en localStorage o usa el MOCK_TOKEN para testing.
