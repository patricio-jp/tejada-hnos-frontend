// src/modules/Fields/components/FieldsEditor.tsx

import { useCallback, useState } from "react";
import { useNavigate } from "react-router";
import type { Field } from "@/lib/map-types";
import type { FeatureCollection } from "geojson";
import InteractiveMap from "@/common/components/InteractiveMap";
import { fieldsToFeatureCollection, featureCollectionToFields } from "@/common/utils/field-map-utils";
import { calculateCenter } from "@/common/utils/map-utils";
import { FieldDetailsSheet } from "./FieldDetailsSheet";
import { FieldEditDialog } from "./FieldEditDialog";

interface FieldsEditorProps {
  fields: Field[];
  onFieldsChange: (updater: (current: Field[]) => Field[]) => void;
}

export function FieldsEditor({ fields, onFieldsChange }: FieldsEditorProps) {
  const [selectedField, setSelectedField] = useState<Field | null>(null);
  const [editingField, setEditingField] = useState<Field | null>(null);
  const navigate = useNavigate();

  // Convertir fields a FeatureCollection para el mapa
  const mapData = fieldsToFeatureCollection(fields);
  const initialViewState = fields.length > 0 ? calculateCenter(mapData) : undefined;

  // Handler para cuando cambia la data del mapa
  const handleMapDataChange = useCallback((featureCollection: FeatureCollection) => {
    const updatedFields = featureCollectionToFields(featureCollection, fields);
    onFieldsChange(() => updatedFields);
  }, [fields, onFieldsChange]);

  // Handler para eliminar un campo
  const handleDeleteField = useCallback((field: Field) => {
    onFieldsChange((current) => current.filter((f) => f.id !== field.id));
    setSelectedField(null);
    setEditingField(null);
  }, [onFieldsChange]);

  // Handler para guardar detalles del campo editado
  const handleSaveFieldDetails = useCallback(() => {
    if (!editingField) return;

    onFieldsChange((current) =>
      current.map((field) =>
        field.id === editingField.id
          ? {
              ...editingField,
              boundary: {
                ...editingField.boundary,
                id: editingField.id,
              },
            }
          : field
      )
    );

    setSelectedField(editingField);
    setEditingField(null);
  }, [editingField, onFieldsChange]);

  return (
    <div className="grid gap-4">
      <div className="flex items-center justify-between">
        <div className="text-sm text-muted-foreground">
          Dibuja campos en el mapa usando el modo de dibujo, o selecciona uno existente para ver sus detalles.
        </div>
      </div>

      <InteractiveMap
        initialData={mapData}
        onDataChange={handleMapDataChange}
        editable={true}
        initialViewState={initialViewState}
      />

      <FieldDetailsSheet
        field={selectedField}
        open={Boolean(selectedField)}
        onClose={() => setSelectedField(null)}
        onEdit={(field) => {
          setEditingField({ ...field });
          setSelectedField(null);
        }}
        onDelete={handleDeleteField}
        onEditGeometry={() => {
          // La edición de geometría ahora se maneja directamente en el mapa
          setSelectedField(null);
        }}
        onManagePlots={(field) => navigate(`/fields/${field.id}`)}
      />

      <FieldEditDialog
        field={editingField}
        onUpdate={(field) => setEditingField(field)}
        onClose={() => setEditingField(null)}
        onSave={handleSaveFieldDetails}
        onEditGeometry={() => {
          // La edición de geometría ahora se maneja directamente en el mapa
          setEditingField(null);
        }}
      />
    </div>
  );
}

export default FieldsEditor;
