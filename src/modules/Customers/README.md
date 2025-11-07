# Módulo Customers (Clientes)

Este módulo gestiona los clientes del sistema.

## Estructura

```
Customers/
├── components/
│   ├── CustomersTable.tsx    # Tabla para mostrar clientes
│   ├── CustomerForm.tsx      # Formulario de creación/edición
│   └── CustomerDialog.tsx    # Modal con el formulario
├── hooks/
│   └── useCustomers.ts       # Hook personalizado para operaciones CRUD
├── pages/
│   └── CustomersPage.tsx     # Página principal del módulo
├── types/
│   └── customer.ts           # Tipos TypeScript
└── utils/
    └── customer-api.ts       # Funciones para llamadas a la API
```

## Funcionalidades

- ✅ Listar clientes
- ✅ Crear nuevo cliente
- ✅ Editar cliente existente
- ✅ Eliminar cliente (soft delete)
- ✅ Validación de formularios
- ✅ Manejo de errores

## Uso

La página principal está disponible en `/customers` y requiere autenticación.
