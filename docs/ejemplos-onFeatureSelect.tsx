// Ejemplos de Uso de InteractiveMap con onFeatureSelect

import { useState } from 'react';
import InteractiveMap from '@/common/components/InteractiveMap';
import type { FeatureCollection, Feature } from 'geojson';

// ============================================================
// Ejemplo 1: Uso básico con panel de información
// ============================================================

export function Example1_BasicUsage() {
  const [selectedFeature, setSelectedFeature] = useState<Feature | null>(null);
  const [mapData, setMapData] = useState<FeatureCollection>({
    type: 'FeatureCollection',
    features: []
  });

  return (
    <div className="flex gap-4">
      {/* Mapa */}
      <div className="flex-1">
        <InteractiveMap
          initialData={mapData}
          onDataChange={(newData) => {
            setMapData(newData);
            console.log('Datos actualizados:', newData);
          }}
          onFeatureSelect={(feature, index) => {
            setSelectedFeature(feature);
            if (feature) {
              console.log(`Feature ${index} seleccionado:`, feature.properties);
            }
          }}
          editable={true}
        />
      </div>

      {/* Panel lateral con información */}
      {selectedFeature && (
        <div className="w-80 p-4 bg-white rounded-lg shadow">
          <h3 className="font-bold mb-2">Feature Seleccionado</h3>
          <pre className="text-xs overflow-auto">
            {JSON.stringify(selectedFeature.properties, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
}

// ============================================================
// Ejemplo 2: FieldsEditor - Mostrar detalles al seleccionar
// ============================================================

export function Example2_FieldsWithDetails() {
  const [fields, setFields] = useState<Field[]>([]);
  const [selectedField, setSelectedField] = useState<Field | null>(null);
  const [fieldStats, setFieldStats] = useState<any>(null);

  const handleFeatureSelect = async (feature: Feature | null, index: number | null) => {
    if (feature && index !== null) {
      const field = fields[index];
      setSelectedField(field);
      
      // Cargar estadísticas del campo
      const stats = await fetchFieldStatistics(field.id);
      setFieldStats(stats);
    } else {
      setSelectedField(null);
      setFieldStats(null);
    }
  };

  return (
    <div className="grid gap-4">
      <InteractiveMap
        initialData={fieldsToFeatureCollection(fields)}
        onDataChange={(data) => {
          const updatedFields = featureCollectionToFields(data, fields);
          setFields(updatedFields);
        }}
        onFeatureSelect={handleFeatureSelect}
        editable={true}
      />

      {selectedField && (
        <div className="p-4 bg-white rounded-lg">
          <h2>{selectedField.boundary.properties?.name}</h2>
          {fieldStats && (
            <div className="mt-4">
              <p>Área: {fieldStats.area} ha</p>
              <p>Cultivo actual: {fieldStats.currentCrop}</p>
              <p>Última cosecha: {fieldStats.lastHarvest}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ============================================================
// Ejemplo 3: Validación de permisos antes de editar
// ============================================================

export function Example3_PermissionValidation() {
  const [fields, setFields] = useState<Field[]>([]);
  const [selectedField, setSelectedField] = useState<Field | null>(null);
  const [canEdit, setCanEdit] = useState(false);

  const handleFeatureSelect = (feature: Feature | null, index: number | null) => {
    if (feature && index !== null) {
      const field = fields[index];
      setSelectedField(field);
      
      // Verificar permisos
      const hasPermission = checkUserPermission(field.id, 'edit');
      setCanEdit(hasPermission);
      
      if (!hasPermission) {
        alert('No tienes permisos para editar este campo');
      }
    } else {
      setSelectedField(null);
      setCanEdit(false);
    }
  };

  return (
    <InteractiveMap
      initialData={fieldsToFeatureCollection(fields)}
      onDataChange={(data) => {
        if (!canEdit) {
          alert('No puedes editar este campo');
          return;
        }
        const updatedFields = featureCollectionToFields(data, fields);
        setFields(updatedFields);
      }}
      onFeatureSelect={handleFeatureSelect}
      editable={canEdit} // Solo editable si tiene permisos
    />
  );
}

// ============================================================
// Ejemplo 4: PlotsEditor - Proteger field boundary
// ============================================================

export function Example4_PlotsWithProtectedBoundary() {
  const [field] = useState<Field>(/* ... */);
  const [plots, setPlots] = useState<Plot[]>(field.plots);
  const [selectedPlot, setSelectedPlot] = useState<Plot | null>(null);

  // Combinar field boundary con plots
  const combinedData: FeatureCollection = {
    type: 'FeatureCollection',
    features: [
      // Feature del límite del campo (índice 0)
      {
        ...field.boundary,
        properties: {
          ...field.boundary.properties,
          isFieldBoundary: true, // Marcador especial
        }
      },
      // Features de las parcelas (índice 1+)
      ...plotsToFeatureCollection(plots).features
    ]
  };

  const handleFeatureSelect = (feature: Feature | null, index: number | null) => {
    if (feature && index !== null) {
      // Verificar si es el field boundary
      if (feature.properties?.isFieldBoundary) {
        console.log('⚠️ El límite del campo no se puede editar');
        setSelectedPlot(null);
        return;
      }
      
      // Es una parcela (ajustar índice)
      const plotIndex = index - 1; // Restar 1 porque el boundary está en índice 0
      if (plotIndex >= 0 && plotIndex < plots.length) {
        const plot = plots[plotIndex];
        setSelectedPlot(plot);
      }
    } else {
      setSelectedPlot(null);
    }
  };

  return (
    <InteractiveMap
      initialData={combinedData}
      onDataChange={(data) => {
        // Filtrar solo las parcelas (excluir field boundary)
        const plotFeatures = data.features.filter(
          f => !f.properties?.isFieldBoundary
        );
        const updatedPlots = featureCollectionToPlots(
          { type: 'FeatureCollection', features: plotFeatures },
          plots
        );
        setPlots(updatedPlots);
      }}
      onFeatureSelect={handleFeatureSelect}
      editable={true}
    />
  );
}

// ============================================================
// Ejemplo 5: Carga de datos relacionados
// ============================================================

export function Example5_LoadRelatedData() {
  const [fields, setFields] = useState<Field[]>([]);
  const [selectedField, setSelectedField] = useState<Field | null>(null);
  const [relatedData, setRelatedData] = useState({
    plots: [],
    cropHistory: [],
    soilAnalysis: null,
    weatherData: null
  });

  const handleFeatureSelect = async (feature: Feature | null, index: number | null) => {
    if (feature && index !== null) {
      const field = fields[index];
      setSelectedField(field);
      
      // Cargar todos los datos relacionados en paralelo
      const [plots, cropHistory, soilAnalysis, weatherData] = await Promise.all([
        fetchFieldPlots(field.id),
        fetchCropHistory(field.id),
        fetchSoilAnalysis(field.id),
        fetchWeatherData(field.boundary.geometry)
      ]);
      
      setRelatedData({ plots, cropHistory, soilAnalysis, weatherData });
    } else {
      setSelectedField(null);
      setRelatedData({ plots: [], cropHistory: [], soilAnalysis: null, weatherData: null });
    }
  };

  return (
    <div className="grid grid-cols-2 gap-4">
      <div>
        <InteractiveMap
          initialData={fieldsToFeatureCollection(fields)}
          onFeatureSelect={handleFeatureSelect}
          editable={true}
        />
      </div>

      <div className="grid gap-4">
        {selectedField && (
          <>
            <div className="p-4 bg-white rounded">
              <h3>Parcelas ({relatedData.plots.length})</h3>
              {/* Lista de parcelas */}
            </div>
            
            <div className="p-4 bg-white rounded">
              <h3>Historial de Cultivos</h3>
              {/* Gráfico de cultivos */}
            </div>
            
            <div className="p-4 bg-white rounded">
              <h3>Análisis de Suelo</h3>
              {relatedData.soilAnalysis && (
                <div>
                  <p>pH: {relatedData.soilAnalysis.ph}</p>
                  <p>N: {relatedData.soilAnalysis.nitrogen}</p>
                  <p>P: {relatedData.soilAnalysis.phosphorus}</p>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

// ============================================================
// Ejemplo 6: Sincronizar con lista
// ============================================================

export function Example6_SyncWithList() {
  const [fields, setFields] = useState<Field[]>([]);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  const handleFeatureSelect = (feature: Feature | null, index: number | null) => {
    setSelectedIndex(index);
    
    // Scroll a la lista
    if (index !== null) {
      document.getElementById(`field-item-${index}`)?.scrollIntoView({
        behavior: 'smooth',
        block: 'center'
      });
    }
  };

  const handleListItemClick = (index: number) => {
    setSelectedIndex(index);
    // Aquí podrías también hacer zoom al campo en el mapa
  };

  return (
    <div className="grid grid-cols-2 gap-4">
      <div>
        <InteractiveMap
          initialData={fieldsToFeatureCollection(fields)}
          onFeatureSelect={handleFeatureSelect}
          editable={true}
        />
      </div>

      <div className="overflow-y-auto max-h-[600px]">
        {fields.map((field, index) => (
          <div
            key={field.id}
            id={`field-item-${index}`}
            className={`p-4 mb-2 rounded cursor-pointer ${
              selectedIndex === index ? 'bg-blue-100' : 'bg-white'
            }`}
            onClick={() => handleListItemClick(index)}
          >
            <h3>{field.boundary.properties?.name}</h3>
            <p className="text-sm text-gray-600">
              Área: {field.boundary.properties?.area} ha
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

// ============================================================
// Funciones auxiliares (ejemplos)
// ============================================================

async function fetchFieldStatistics(fieldId: string) {
  // Simular llamada a API
  return {
    area: 125.5,
    currentCrop: 'Soja',
    lastHarvest: '2024-03-15'
  };
}

function checkUserPermission(fieldId: string, action: string): boolean {
  // Verificar permisos del usuario
  return true; // Simplificado
}

async function fetchFieldPlots(fieldId: string) {
  // Cargar parcelas del campo
  return [];
}

async function fetchCropHistory(fieldId: string) {
  // Cargar historial de cultivos
  return [];
}

async function fetchSoilAnalysis(fieldId: string) {
  // Cargar análisis de suelo
  return { ph: 6.5, nitrogen: 45, phosphorus: 32 };
}

async function fetchWeatherData(geometry: any) {
  // Cargar datos climáticos
  return {};
}
