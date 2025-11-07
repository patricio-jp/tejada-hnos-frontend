# Módulo Varieties (Variedades)

Este módulo gestiona las variedades de cultivos.

## Estructura

```
Varieties/
├── components/
│   ├── VarietiesTable.tsx    # Tabla para mostrar variedades
│   ├── VarietyForm.tsx       # Formulario de creación/edición
│   └── VarietyDialog.tsx     # Modal con el formulario
├── hooks/
│   └── useVarieties.ts       # Hook personalizado para operaciones CRUD
├── pages/
│   └── VarietiesPage.tsx     # Página principal del módulo
├── types/
│   └── variety.ts            # Tipos TypeScript
└── utils/
    └── variety-api.ts        # Funciones para llamadas a la API
```

## Funcionalidades

- ✅ Listar variedades
- ✅ Crear nueva variedad
- ✅ Editar variedad existente
- ✅ Eliminar variedad (hard delete - permanente)
- ✅ Validación de formularios
- ✅ Manejo de errores

## Nota Importante

⚠️ A diferencia de Suppliers y Customers, las Variedades usan **eliminación permanente** (hard delete). Una vez eliminada, una variedad no puede ser restaurada.

## Uso

La página principal está disponible en `/varieties` y requiere autenticación.
