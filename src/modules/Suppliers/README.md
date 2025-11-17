# Módulo Suppliers (Proveedores)

Este módulo gestiona los proveedores del sistema.

## Estructura

```
Suppliers/
├── components/
│   ├── SuppliersTable.tsx    # Tabla para mostrar proveedores
│   ├── SupplierForm.tsx      # Formulario de creación/edición
│   └── SupplierDialog.tsx    # Modal con el formulario
├── hooks/
│   └── useSuppliers.ts       # Hook personalizado para operaciones CRUD
├── pages/
│   └── SuppliersPage.tsx     # Página principal del módulo
└── utils/
    └── supplier-api.ts       # Funciones para llamadas a la API
```

## Funcionalidades

- ✅ Listar proveedores
- ✅ Crear nuevo proveedor
- ✅ Editar proveedor existente
- ✅ Eliminar proveedor (soft delete)
- ✅ Validación de formularios
- ✅ Manejo de errores

## Uso

La página principal está disponible en `/suppliers` y requiere autenticación.
