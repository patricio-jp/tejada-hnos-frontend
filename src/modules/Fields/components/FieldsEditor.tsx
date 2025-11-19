// src/modules/Fields/components/FieldsEditor.tsx

import { useCallback, useState, useMemo, useEffect, useRef } from "react";
import { useNavigate } from "react-router";
import type { Field } from "@/lib/map-types";
import type { FeatureCollection, Feature, Polygon } from "geojson";
import InteractiveMap from "@/common/components/InteractiveMap";
import { fieldsToFeatureCollection, featureCollectionToFields, calculateCenter } from "@/common/utils/map-utils";
import { hexToRGBA } from "@/common/utils/color-utils";
import { FieldDetailsSheet } from "./FieldDetailsSheet";
import { FieldDialog } from "./FieldDialog";
import { Button } from "@/components/ui/button";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { PenTool, Loader2 } from "lucide-react";
import { useFields } from "../hooks/useFields";
import type { CreateFieldDto, UpdateFieldDto } from "../utils/field-api";
import { usePlots } from "@/modules/Plots/hooks/usePlots";
// 1. NUEVO IMPORT
import { useUsers } from "../hooks/useUsers";

interface FieldsEditorProps {
  fields: Field[];
  onFieldsChange: (updater: (current: Field[]) => Field[]) => void;
}

export function FieldsEditor({ fields }: FieldsEditorProps) {
  const { createField, updateField, deleteField, loading: apiLoading } = useFields();
  
  // 2. OBTENER USUARIOS PARA RESOLVER NOMBRES EN EL MAPA
  const { users } = useUsers();

  const [selectedFieldIdForPlots, setSelectedFieldIdForPlots] = useState<string | null>(null);
  const { plots: selectedFieldPlots } = usePlots(selectedFieldIdForPlots || '');
  
  // Estado local del mapa
  const [localFields, setLocalFields] = useState<Field[]>(fields);
  const [selectedField, setSelectedField] = useState<Field | null>(null);
  const [editingField, setEditingField] = useState<Field | null>(null);
  const [deletingField, setDeletingField] = useState<Field | null>(null);
  const [mapMode, setMapMode] = useState<'view' | 'drawPolygon' | 'select' | 'edit'>('select');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [newFieldLocation, setNewFieldLocation] = useState<any>(null);
  const [fieldCountBeforeDrawing, setFieldCountBeforeDrawing] = useState<number>(0);
  const wasSuccessfulCreation = useRef(false);
  const [editingGeometryFieldId, setEditingGeometryFieldId] = useState<string | null>(null);
  const originalGeometryBeforeEdit = useRef<any>(null);
  const [isSavingGeometry, setIsSavingGeometry] = useState(false);
  const [showSaveGeometryConfirm, setShowSaveGeometryConfirm] = useState(false);
  
  const navigate = useNavigate();

  useEffect(() => {
    setLocalFields(fields);
  }, [fields]);

  // Integración de plots al seleccionar un campo
  useEffect(() => {
    if (selectedField && selectedFieldPlots && selectedFieldPlots.length > 0) {
      const filteredPlots = selectedFieldPlots.filter((plot: any) => {
        if (plot.fieldId && plot.fieldId !== selectedField.id) {
          return false;
        }
        return true;
      });
      setSelectedField(prev => prev ? { ...prev, plots: filteredPlots as any } : null);
    }
  }, [selectedFieldPlots, selectedField?.id]);

  // 3. PASAR LA LISTA DE USUARIOS AL CONVERTIDOR DEL MAPA
  // Esto permite que map-utils encuentre el nombre del manager por su ID
  const mapData = useMemo(() => 
    fieldsToFeatureCollection(localFields, users), 
  [localFields, users]);

  const initialViewState = useMemo(() => 
    localFields.length > 0 ? calculateCenter(mapData) : undefined,
    [localFields.length, mapData]
  );

  const handleNewPolygonCreated = useCallback((feature: Feature<Polygon>) => {
    console.log("🎨 Nuevo polígono recibido del mapa:", feature);

    const tempId = (feature.id as string) || `temp-${Date.now()}`;
    
    const tempField: Field = {
      id: tempId,
      name: 'Nuevo Campo',
      address: '',
      area: 0,
      boundary: {
        type: 'Feature',
        id: tempId,
        geometry: feature.geometry,
        properties: {
          name: 'Nuevo Campo',
          color: '#3b82f6',
          type: 'field-boundary',
          isNewPolygon: true
        } as any
      },
      plots: []
    };

    setLocalFields(prev => [...prev, tempField]);
    setNewFieldLocation(feature.geometry);
    setDialogOpen(true);
    setMapMode('select');
  }, []);

  // Handler para cuando cambia la data del mapa (con fusión inteligente)
  const handleMapDataChange = useCallback((featureCollection: FeatureCollection) => {
    const fieldsFromMap = featureCollectionToFields(featureCollection);
    
    const mergedFields = fieldsFromMap.map(mapField => {
      const originalField = localFields.find(f => f.id === mapField.id);

      if (originalField) {
        return {
          ...originalField, 
          boundary: mapField.boundary,
          location: mapField.boundary?.geometry || mapField.location,
          plots: originalField.plots 
        };
      }
      return mapField;
    });
    
    if (mergedFields.length > localFields.length && !editingGeometryFieldId) {
      const newField = mergedFields[mergedFields.length - 1];
      setNewFieldLocation(newField.location || newField.boundary?.geometry);
      setDialogOpen(true);
      setMapMode('select');
    }
    
    if (editingGeometryFieldId && mergedFields.length === localFields.length) {
      setShowSaveGeometryConfirm(true);
    }
    
    if (!newFieldLocation) {
        setLocalFields(mergedFields);
    }
  }, [localFields, editingGeometryFieldId, newFieldLocation]);

  const handleFeatureSelect = useCallback((feature: Feature | null, index: number | null) => {
    if (feature && index !== null) {
      const fieldId = feature.properties?.fieldId || feature.id;
      const field = localFields.find(f => f.id === fieldId);
      
      if (field) {
        setSelectedField(field);
        setSelectedFieldIdForPlots(field.id);
      }
    } else {
      setSelectedField(null);
      setSelectedFieldIdForPlots(null);
    }
  }, [localFields]);
  
  const handleCloseSheet = useCallback(() => setSelectedField(null), []);
  
  const handleDeleteField = useCallback((field: Field) => setDeletingField(field), []);

  const confirmDelete = useCallback(async () => {
    if (!deletingField) return;
    try {
      await deleteField(deletingField.id);
      setLocalFields(prev => prev.filter((f) => f.id !== deletingField.id));
      setSelectedField(null);
      setDeletingField(null);
    } catch (error) {
      console.error('Error al eliminar campo:', error);
    }
  }, [deletingField, deleteField]);

  const handleEditGeometry = useCallback((field: Field) => {
    setSelectedField(null);
    setEditingGeometryFieldId(field.id);
    originalGeometryBeforeEdit.current = field.boundary?.geometry || field.location;
    setMapMode('edit');
  }, []);

  const handleSaveGeometry = useCallback(async () => {
    if (!editingGeometryFieldId) return;
    const editedField = localFields.find(f => f.id === editingGeometryFieldId);
    if (!editedField) return;
    setIsSavingGeometry(true);
    setShowSaveGeometryConfirm(false);

    try {
      const updatedLocation = editedField.boundary?.geometry || editedField.location;
      if (!updatedLocation) return;

      await updateField(editedField.id, {
        name: editedField.name || editedField.boundary?.properties?.name || '',
        address: editedField.address || '',
        area: editedField.area || 0,
        location: updatedLocation,
        managerId: editedField.managerId || null,
      });

      setEditingGeometryFieldId(null);
      originalGeometryBeforeEdit.current = null;
      setMapMode('select');
    } catch (error) {
      console.error('Error al guardar geometría:', error);
    } finally {
      setIsSavingGeometry(false);
    }
  }, [editingGeometryFieldId, localFields, updateField]);

  const handleCancelGeometryEdit = useCallback(() => {
    if (editingGeometryFieldId && originalGeometryBeforeEdit.current) {
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
    setShowSaveGeometryConfirm(false);
  }, [editingGeometryFieldId]);

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

  const handleCreateField = useCallback(async (data: CreateFieldDto | UpdateFieldDto) => {
    const createData = data as CreateFieldDto;
    try {
      const newField = await createField(createData);
      
      setLocalFields((current) => {
        const clean = current.filter(f => !f.id.toString().startsWith('temp-'));
        
        return [
          ...clean,
          {
            id: newField.id,
            name: newField.name || '',
            boundary: {
              type: 'Feature' as const,
              id: newField.id,
              geometry: newField.location,
              properties: {
                name: newField.name || '',
                color: '#' + Math.floor(Math.random()*16777215).toString(16),
                type: 'field-boundary'
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

      wasSuccessfulCreation.current = true;
      setNewFieldLocation(null);
      setMapMode('select');
    } catch (error) {
      console.error('Error al crear campo:', error);
      throw error;
    }
  }, [createField]);

  const getFieldColor = useCallback((feature: Feature, isSelected: boolean): [number, number, number, number] => {
    if (isSelected) return [255, 100, 100, 120];
    if (feature.properties?.color) return hexToRGBA(feature.properties.color, 100);
    return [0, 100, 255, 100];
  }, []);

  const handleModeChange = useCallback((newMode: 'view' | 'drawPolygon' | 'select' | 'edit') => {
    setMapMode(newMode);
  }, []);

  const handleCloseEditDialog = useCallback(() => {
    if (!editingField && newFieldLocation && !wasSuccessfulCreation.current) {
      setLocalFields(prev => prev.filter(f => !f.id.toString().startsWith('temp-')));
    }
    setEditingField(null);
    setDialogOpen(false);
    setNewFieldLocation(null);
    setMapMode('select');
    wasSuccessfulCreation.current = false;
  }, [editingField, newFieldLocation]);

  const handleStartCreate = useCallback(() => {
    setFieldCountBeforeDrawing(localFields.length);
    setMapMode('drawPolygon');
  }, [localFields.length]);

  return (
    <div className="grid gap-4">
      <div className="flex items-center justify-between">
        <div className="text-sm text-muted-foreground">
          {editingGeometryFieldId 
            ? '📝 Editando geometría...'
            : 'Dibuja campos en el mapa...'}
        </div>
        
        {editingGeometryFieldId ? (
          <Button onClick={handleCancelGeometryEdit} variant="outline">Cancelar Edición</Button>
        ) : (
          <Button onClick={handleStartCreate} variant={mapMode === 'drawPolygon' ? 'default' : 'outline'} disabled={apiLoading}>
            {apiLoading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Procesando...</> : 
             <><PenTool className="mr-2 h-4 w-4" />{mapMode === 'drawPolygon' ? 'Dibujando...' : 'Crear Nuevo Campo'}</>}
          </Button>
        )}
      </div>

      <InteractiveMap
        initialData={mapData}
        onDataChange={handleMapDataChange}
        onNewPolygonCreated={handleNewPolygonCreated}
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
        onEdit={(field) => { setEditingField({ ...field }); setDialogOpen(true); setSelectedField(null); }}
        onDelete={handleDeleteField}
        onEditGeometry={handleEditGeometry}
        onManagePlots={(field) => navigate(`/fields/${field.id}`)}
      />

      <FieldDialog
        open={dialogOpen}
        onOpenChange={(open) => { if (!open) handleCloseEditDialog(); }}
        field={editingField || undefined}
        onSubmit={editingField ? handleSaveFieldDetails : handleCreateField}
        initialLocation={newFieldLocation}
      />
      
      <AlertDialog open={Boolean(deletingField)} onOpenChange={() => setDeletingField(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>¿Mover campo a la papelera?</AlertDialogTitle>
              <AlertDialogDescription>El campo "{deletingField?.boundary?.properties?.name}" dejará de ser visible en el mapa principal, 
              pero podrás restaurarlo más adelante si lo necesitas.</AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancelar</AlertDialogCancel>
              <AlertDialogAction onClick={confirmDelete} className="bg-orange-600 hover:bg-orange-700 text-white">
                Eliminar
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={showSaveGeometryConfirm} onOpenChange={setShowSaveGeometryConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Guardar cambios?</AlertDialogTitle>
            <AlertDialogDescription>¿Deseas guardar los cambios de geometría?</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={handleCancelGeometryEdit}>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleSaveGeometry} disabled={isSavingGeometry}>Guardar</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

export default FieldsEditor;