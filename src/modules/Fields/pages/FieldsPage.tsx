// src/modules/Fields/pages/FieldsPage.tsx
import { useCallback, useEffect, useMemo } from "react";
import type { Field as MapField } from "@/lib/map-types";
import type { Field as ApiField } from "@/types/fields";
import { FieldsEditor } from "../components/FieldsEditor";
import { ensureFieldColors } from "../utils/colors";
import { useFields } from "../hooks/useFields";
import { Loader2 } from "lucide-react";

/**
 * Convierte campos del API al formato del mapa
 */
function convertApiFieldsToMapFields(apiFields: ApiField[]): MapField[] {
  return apiFields.map(field => ({
    id: field.id,
    name: field.name,
    address: field.address,
    area: field.area,
    location: field.location,
    managerId: field.managerId,
    deletedAt: field.deletedAt,
    boundary: field.location ? {
      type: 'Feature' as const,
      id: field.id,
      geometry: field.location,
      properties: {
        name: field.name || 'Campo sin nombre',
        color: '#' + Math.floor(Math.random()*16777215).toString(16),
      }
    } : undefined,
    plots: [],
  })) as MapField[];
}

export default function CamposPage() {
  const { fields: apiFields, loading, error, fetchFields, setFields: setFieldsState } = useFields();

  // Convertir campos del API al formato del mapa
  const fields = useMemo(() => ensureFieldColors(convertApiFieldsToMapFields(apiFields)), [apiFields]);

  useEffect(() => {
    fetchFields();
  }, [fetchFields]);

  const handleFieldsChange = useCallback((updater: (current: MapField[]) => MapField[]) => {
    // Esta función actualiza el estado local del mapa
    // No afecta directamente el estado del hook useFields
    // Los cambios se sincronizan a través de las operaciones CRUD
  }, []);

  if (loading) {
    return (
      <div className="container mx-auto py-4">
        <h1 className="text-3xl font-bold mb-4">Gestión de Campos</h1>
        <div className="flex items-center justify-center h-96">
          <div className="flex flex-col items-center gap-2">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="text-sm text-muted-foreground">Cargando campos...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto py-4">
        <h1 className="text-3xl font-bold mb-4">Gestión de Campos</h1>
        <div className="flex items-center justify-center h-96">
          <div className="flex flex-col items-center gap-2 max-w-md text-center">
            <p className="text-lg font-semibold text-destructive">Error al cargar campos</p>
            <p className="text-sm text-muted-foreground">{error}</p>
            <button 
              onClick={fetchFields}
              className="mt-4 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
            >
              Reintentar
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-4">
      <h1 className="text-3xl font-bold mb-4">Gestión de Campos</h1>
      <FieldsEditor fields={fields} onFieldsChange={handleFieldsChange} />
    </div>
  );
}
