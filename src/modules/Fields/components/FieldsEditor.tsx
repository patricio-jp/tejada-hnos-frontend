// src/modules/Fields/components/FieldsEditor.tsx

import { useCallback, useState, useMemo, useEffect, useRef } from "react";
import { useNavigate } from "react-router";
import type { Field } from "@/lib/map-types";
import type { FeatureCollection, Feature } from "geojson";
import InteractiveMap from "@/common/components/InteractiveMap";
import { fieldsToFeatureCollection, featureCollectionToFields } from "@/common/utils/field-map-utils";
import { calculateCenter } from "@/common/utils/map-utils";
import { hexToRGBA } from "@/common/utils/color-utils";
import { FieldDetailsSheet } from "./FieldDetailsSheet";
import { FieldDialog } from "./FieldDialog";
import { Button } from "@/components/ui/button";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { PenTool, Loader2 } from "lucide-react";
import { useFields } from "../hooks/useFields";
import type { CreateFieldDto, UpdateFieldDto } from "../utils/field-api";
import { usePlots } from "@/modules/Plots/hooks/usePlots";

interface FieldsEditorProps {
  fields: Field[];
  onFieldsChange: (updater: (current: Field[]) => Field[]) => void;
}

export function FieldsEditor({ fields }: FieldsEditorProps) {
  const { createField, updateField, deleteField, loading: apiLoading } = useFields();
  const [selectedFieldIdForPlots, setSelectedFieldIdForPlots] = useState<string | null>(null);
  const { plots: selectedFieldPlots } = usePlots(selectedFieldIdForPlots || '');
  
  // Estado local del mapa (para ediciones temporales)
  const [localFields, setLocalFields] = useState<Field[]>(fields);
  const [selectedField, setSelectedField] = useState<Field | null>(null);
  const [editingField, setEditingField] = useState<Field | null>(null);
  const [deletingField, setDeletingField] = useState<Field | null>(null);
  const [mapMode, setMapMode] = useState<'view' | 'drawPolygon' | 'select' | 'edit'>('select');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [newFieldLocation, setNewFieldLocation] = useState<any>(null);
  const [fieldCountBeforeDrawing, setFieldCountBeforeDrawing] = useState<number>(0);
  const wasSuccessfulCreation = useRef(false); // Ref para detectar creación exitosa
  const [editingGeometryFieldId, setEditingGeometryFieldId] = useState<string | null>(null);
  const originalGeometryBeforeEdit = useRef<any>(null); // Guardar geometría original antes de editar
  const [isSavingGeometry, setIsSavingGeometry] = useState(false);
  const [showSaveGeometryConfirm, setShowSaveGeometryConfirm] = useState(false);
  
  const navigate = useNavigate();

  // Sincronizar localFields con fields cuando cambien desde el backend
  useEffect(() => {
    setLocalFields(fields);
  }, [fields]);

  // Actualizar selectedField con los plots cargados
  useEffect(() => {
    if (selectedField && selectedFieldPlots && selectedFieldPlots.length > 0) {
      setSelectedField(prev => prev ? { ...prev, plots: selectedFieldPlots as any } : null);
    }
  }, [selectedFieldPlots]);

  // Convertir fields a FeatureCollection para el mapa (memoizado para evitar recreaciones innecesarias)
  const mapData = useMemo(() => fieldsToFeatureCollection(localFields), [localFields]);
  const initialViewState = useMemo(() => 
    localFields.length > 0 ? calculateCenter(mapData) : undefined,
    [localFields.length, mapData]
  );

  // Handler para cuando cambia la data del mapa
  const handleMapDataChange = useCallback((featureCollection: FeatureCollection) => {
    const updatedFields = featureCollectionToFields(featureCollection, localFields);
    
    // Si hay un nuevo campo (más features que antes), abrir el diálogo
    if (updatedFields.length > localFields.length && !editingGeometryFieldId) {
      const newField = updatedFields[updatedFields.length - 1];
      setNewFieldLocation(newField.location || newField.boundary?.geometry);
      setDialogOpen(true);
      setMapMode('select'); // Volver al modo selección
    }
    
    // Si estamos editando geometría y cambió la data, mostrar confirmación
    if (editingGeometryFieldId && updatedFields.length === localFields.length) {
      setShowSaveGeometryConfirm(true);
    }
    
    setLocalFields(updatedFields);
  }, [localFields, editingGeometryFieldId]);

  // Handler para cuando se selecciona un campo en el mapa
  const handleFeatureSelect = useCallback((feature: Feature | null, index: number | null) => {
    if (feature && index !== null) {
      // Encontrar el campo correspondiente
      const field = localFields[index];
      if (field) {
        setSelectedField(field);
        // Cargar plots de este campo
        setSelectedFieldIdForPlots(field.id);
        const fieldName = field.name || field.boundary?.properties?.name || field.id;
        console.log('Campo seleccionado:', fieldName);
      }
    } else {
      setSelectedField(null);
      setSelectedFieldIdForPlots(null);
    }
  }, [localFields]);

  // Handler para cerrar el sheet (deseleccionar manualmente)
  const handleCloseSheet = useCallback(() => {
    setSelectedField(null);
  }, []);

  // Handler para eliminar un campo
  const handleDeleteField = useCallback((field: Field) => {
    setDeletingField(field);
  }, []);

  const confirmDelete = useCallback(async () => {
    if (!deletingField) return;

    try {
      // Usar hard delete (eliminación permanente) en lugar de soft delete
      await deleteField(deletingField.id);
      setLocalFields(prev => prev.filter((f) => f.id !== deletingField.id));
      setSelectedField(null);
      setDeletingField(null);
    } catch (error) {
      console.error('Error al eliminar campo:', error);
    }
  }, [deletingField, deleteField]);

  // Handler para iniciar edición de geometría
  const handleEditGeometry = useCallback((field: Field) => {
    setSelectedField(null); // Cerrar el sheet
    setEditingGeometryFieldId(field.id); // Marcar qué campo está siendo editado
    // Guardar geometría original antes de editar (para poder revertir)
    originalGeometryBeforeEdit.current = field.boundary?.geometry || field.location;
    setMapMode('edit'); // Activar modo de edición en el mapa
  }, []);

  // Handler para guardar la geometría editada
  const handleSaveGeometry = useCallback(async () => {
    if (!editingGeometryFieldId) return;

    const editedField = localFields.find(f => f.id === editingGeometryFieldId);
    if (!editedField) return;

    setIsSavingGeometry(true);
    setShowSaveGeometryConfirm(false); // Cerrar diálogo de confirmación

    try {
      // Obtener la geometría actualizada del campo editado
      const updatedLocation = editedField.boundary?.geometry || editedField.location;
      
      if (!updatedLocation) {
        console.error('No se encontró la geometría del campo');
        return;
      }

      // Actualizar en el backend
      await updateField(editedField.id, {
        name: editedField.name || editedField.boundary?.properties?.name || '',
        address: editedField.address || '',
        area: editedField.area || 0,
        location: updatedLocation,
        managerId: editedField.managerId || null,
      });

      // Limpiar estado de edición
      setEditingGeometryFieldId(null);
      originalGeometryBeforeEdit.current = null;
      setMapMode('select');
      
      console.log('✅ Geometría guardada exitosamente');
    } catch (error) {
      console.error('❌ Error al guardar geometría:', error);
    } finally {
      setIsSavingGeometry(false);
    }
  }, [editingGeometryFieldId, localFields, updateField]);

  // Handler para cancelar edición de geometría
  const handleCancelGeometryEdit = useCallback(() => {
    if (editingGeometryFieldId && originalGeometryBeforeEdit.current) {
      // Restaurar la geometría original del campo editado
      setLocalFields((current) =>
        current.map((field) =>
          field.id === editingGeometryFieldId
            ? {
                ...field,
                location: originalGeometryBeforeEdit.current,
                boundary: field.boundary ? {
                  ...field.boundary,
                  geometry: originalGeometryBeforeEdit.current,
                } : undefined,
              }
            : field
        )
      );
    }
    
    setEditingGeometryFieldId(null);
    originalGeometryBeforeEdit.current = null;
    setMapMode('select');
    setShowSaveGeometryConfirm(false); // Cerrar diálogo si está abierto
  }, [editingGeometryFieldId]);

  // Handler para guardar detalles del campo editado
  const handleSaveFieldDetails = useCallback(async (data: UpdateFieldDto) => {
    if (!editingField) return;

    try {
      const updatedField = await updateField(editingField.id, data);
      
      setLocalFields((current) =>
        current.map((field) =>
          field.id === editingField.id
            ? {
                ...field,
                name: updatedField.name,
                boundary: field.boundary ? {
                  ...field.boundary,
                  properties: {
                    ...field.boundary.properties,
                    name: updatedField.name || field.boundary.properties.name,
                  },
                } : undefined,
                address: updatedField.address,
                area: updatedField.area,
                managerId: updatedField.managerId,
              }
            : field
        )
      );

      setEditingField(null);
      setDialogOpen(false);
    } catch (error) {
      console.error('Error al actualizar campo:', error);
      throw error;
    }
  }, [editingField, updateField]);

  // Handler para crear nuevo campo
  const handleCreateField = useCallback(async (data: CreateFieldDto | UpdateFieldDto) => {
    const createData = data as CreateFieldDto;
    try {
      const newField = await createField(createData);
      
      // Reemplazar el campo temporal con el campo guardado del backend
      setLocalFields((current) => {
        // Remover el campo temporal (último dibujado)
        const withoutTemp = current.slice(0, fieldCountBeforeDrawing);
        
        // Agregar el campo guardado
        return [
          ...withoutTemp,
          {
            id: newField.id,
            name: newField.name || '',
            boundary: {
              type: 'Feature' as const,
              id: newField.id,
              geometry: newField.location,
              properties: {
                name: newField.name || '',
                color: '#' + Math.floor(Math.random()*16777215).toString(16), // Color aleatorio
              },
            },
            location: newField.location,
            address: newField.address || '',
            area: newField.area || 0,
            managerId: newField.managerId,
            plots: [],
            deletedAt: null,
          } as Field,
        ];
      });

      // Limpiar las flags ANTES de que el diálogo se cierre
      // Esto evita que handleCloseEditDialog elimine el campo
      wasSuccessfulCreation.current = true; // Marcar que fue exitoso
      setNewFieldLocation(null);
      setMapMode('select');
      
      // NO llamar a setDialogOpen(false) aquí - el FieldDialog lo hace automáticamente
    } catch (error) {
      console.error('Error al crear campo:', error);
      throw error;
    }
  }, [createField, fieldCountBeforeDrawing, localFields.length]);

  // Función para obtener el color del polígono
  const getFieldColor = useCallback((feature: Feature, isSelected: boolean): [number, number, number, number] => {
    // Si está seleccionado, usar color rojo semi-transparente
    if (isSelected) {
      return [255, 100, 100, 120];
    }
    
    // Si el feature tiene un color personalizado, usarlo
    if (feature.properties?.color) {
      return hexToRGBA(feature.properties.color, 100);
    }
    
    // Color por defecto (azul)
    return [0, 100, 255, 100];
  }, []);

  // Handler para cuando cambia el modo del mapa
  const handleModeChange = useCallback((newMode: 'view' | 'drawPolygon' | 'select' | 'edit') => {
    setMapMode(newMode);
  }, []);

  // Handler para cuando se cierra el diálogo de edición (para deseleccionar)
  const handleCloseEditDialog = useCallback(() => {
    // Si se está cancelando la creación de un nuevo campo (no editando uno existente)
    // Detectamos cancelación si NO fue una creación exitosa
    if (!editingField && newFieldLocation && !wasSuccessfulCreation.current) {
      // Revertir al estado anterior al dibujo (eliminar el polígono temporal)
      setLocalFields(prev => prev.slice(0, fieldCountBeforeDrawing));
    }
    
    // Limpiar todo
    setEditingField(null);
    setDialogOpen(false);
    setNewFieldLocation(null);
    setMapMode('select');
    wasSuccessfulCreation.current = false;
  }, [editingField, newFieldLocation, fieldCountBeforeDrawing]);

  // Handler para iniciar creación de nuevo campo
  const handleStartCreate = useCallback(() => {
    // Guardar el conteo actual de campos antes de empezar a dibujar
    setFieldCountBeforeDrawing(localFields.length);
    setMapMode('drawPolygon');
  }, [localFields.length]);

  return (
    <div className="grid gap-4">
      <div className="flex items-center justify-between">
        <div className="text-sm text-muted-foreground">
          {editingGeometryFieldId 
            ? '📝 Editando geometría: mueve los vértices del polígono. Los cambios se guardarán automáticamente.'
            : 'Dibuja campos en el mapa usando el modo de dibujo, o selecciona uno existente para ver sus detalles.'}
        </div>
        
        {editingGeometryFieldId ? (
          <Button
            onClick={handleCancelGeometryEdit}
            variant="outline"
          >
            Cancelar Edición
          </Button>
        ) : (
          <Button
            onClick={handleStartCreate}
            variant={mapMode === 'drawPolygon' ? 'default' : 'outline'}
            disabled={apiLoading}
          >
            {apiLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Procesando...
              </>
            ) : (
              <>
                <PenTool className="mr-2 h-4 w-4" />
                {mapMode === 'drawPolygon' ? 'Dibujando...' : 'Crear Nuevo Campo'}
              </>
            )}
          </Button>
        )}
      </div>

      <InteractiveMap
        initialData={mapData}
        onDataChange={handleMapDataChange}
        onFeatureSelect={handleFeatureSelect}
        getPolygonColor={getFieldColor}
        availableModes={['view', 'drawPolygon', 'select', 'edit']}
        visibleButtons={['view', 'select']}
        mode={mapMode}
        onModeChange={handleModeChange}
        editable={true}
        initialViewState={initialViewState}
      />

      <FieldDetailsSheet
        field={selectedField}
        open={Boolean(selectedField)}
        onClose={handleCloseSheet}
        onEdit={(field) => {
          setEditingField({ ...field });
          setDialogOpen(true);
          setSelectedField(null);
        }}
        onDelete={handleDeleteField}
        onEditGeometry={handleEditGeometry}
        onManagePlots={(field) => navigate(`/fields/${field.id}`)}
      />

      <FieldDialog
        open={dialogOpen}
        onOpenChange={(open) => {
          if (!open) {
            handleCloseEditDialog();
          }
        }}
        field={editingField || undefined}
        onSubmit={editingField ? handleSaveFieldDetails : handleCreateField}
        initialLocation={newFieldLocation}
      />

      <AlertDialog open={Boolean(deletingField)} onOpenChange={() => setDeletingField(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar campo?</AlertDialogTitle>
            <AlertDialogDescription>
              Estás a punto de eliminar el campo "{deletingField?.boundary?.properties?.name}". 
              Esta acción no se puede deshacer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={showSaveGeometryConfirm} onOpenChange={setShowSaveGeometryConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Guardar cambios en la geometría?</AlertDialogTitle>
            <AlertDialogDescription>
              Has modificado el polígono del campo. ¿Deseas guardar estos cambios permanentemente?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={handleCancelGeometryEdit}>
              Cancelar cambios
            </AlertDialogCancel>
            <AlertDialogAction onClick={handleSaveGeometry} disabled={isSavingGeometry}>
              {isSavingGeometry ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Guardando...
                </>
              ) : (
                'Guardar Geometría'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

export default FieldsEditor;
