import { useParams, useNavigate } from "react-router";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  ArrowLeft, 
  Calendar, 
  MapPin, 
  User, 
  Plus,
  FileText,
  AlertCircle,
  AlertTriangle,
  Clock
} from "lucide-react";
import { useWorkOrder } from "../hooks/useWorkOrder";
import { WorkOrderStatusBadge } from "../components/WorkOrderStatusBadge";
import { ActivityStatusBadge } from "../components/ActivityStatusBadge";
import { AddActivityDialog } from "../components/AddActivityDialog";
import { useState, useMemo } from "react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import InteractiveMap from "@/common/components/InteractiveMap";
import type { FeatureCollection } from "geojson";
import { getDateWarning } from "../utils/date-helpers";

const ACTIVITY_TYPE_LABELS: Record<string, string> = {
  PODA: "Poda",
  RIEGO: "Riego",
  APLICACION: "Aplicación",
  COSECHA: "Cosecha",
  MANTENIMIENTO: "Mantenimiento",
  MONITOREO: "Monitoreo",
  OTRO: "Otro",
};

export default function WorkOrderDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { workOrder, loading, error, refetch } = useWorkOrder(id!);
  const [showAddActivityDialog, setShowAddActivityDialog] = useState(false);

  // Calcular advertencia de fecha
  const dateWarning = workOrder && workOrder.status !== 'COMPLETED' && workOrder.status !== 'CANCELLED'
    ? getDateWarning(workOrder.dueDate)
    : null;

  // Convertir las parcelas a formato GeoJSON para el mapa
  const plotsGeoJSON = useMemo<FeatureCollection>(() => {
    if (!workOrder?.plots) {
      return {
        type: 'FeatureCollection',
        features: [],
      };
    }

    return {
      type: 'FeatureCollection',
      features: workOrder.plots
        .filter(plot => plot.location) // Solo parcelas con geometría
        .map((plot) => ({
          type: 'Feature' as const,
          id: plot.id,
          geometry: plot.location,
          properties: {
            id: plot.id,
            name: plot.name,
            area: plot.area,
            fieldName: plot.field?.name || 'Sin campo',
            variety: plot.variety?.name || 'Sin variedad',
          },
        })),
    };
  }, [workOrder?.plots]);

  // Calcular el centro del mapa y zoom apropiado basado en las parcelas
  const mapCenter = useMemo(() => {
    if (!workOrder?.plots || workOrder.plots.length === 0) {
      return {
        longitude: -65.207,
        latitude: -26.832,
        zoom: 13,
      };
    }

    // Calcular el bounding box de todas las parcelas
    const coordinates = workOrder.plots
      .filter(plot => plot.location?.coordinates)
      .flatMap(plot => plot.location.coordinates[0]);

    if (coordinates.length === 0) {
      return {
        longitude: -65.207,
        latitude: -26.832,
        zoom: 13,
      };
    }

    const lons = coordinates.map(coord => coord[0]);
    const lats = coordinates.map(coord => coord[1]);
    
    const minLon = Math.min(...lons);
    const maxLon = Math.max(...lons);
    const minLat = Math.min(...lats);
    const maxLat = Math.max(...lats);
    
    // Centro del bounding box
    const centerLon = (minLon + maxLon) / 2;
    const centerLat = (minLat + maxLat) / 2;

    // Calcular el zoom apropiado basado en el tamaño del bounding box
    const lonDiff = maxLon - minLon;
    const latDiff = maxLat - minLat;
    
    // Fórmula aproximada para calcular zoom basado en el bounding box
    // zoom = log2(360 / longitudeDiff) ajustado por el tamaño del contenedor
    let zoom = 13; // zoom por defecto
    
    if (lonDiff > 0 && latDiff > 0) {
      // Calcular zoom basado en la dimensión más grande
      const lonZoom = Math.log2(360 / lonDiff) - 1;
      const latZoom = Math.log2(180 / latDiff) - 1;
      
      // Usar el menor zoom (más alejado) para que todo entre en la vista
      zoom = Math.min(lonZoom, latZoom);
      
      // Agregar un margen reduciendo el zoom en 0.5-1 niveles
      zoom = Math.max(zoom - 0.8, 10); // Mínimo zoom 10, máximo según cálculo
      zoom = Math.min(zoom, 18); // Máximo zoom 18
    }

    return {
      longitude: centerLon,
      latitude: centerLat,
      zoom: Math.round(zoom * 10) / 10, // Redondear a 1 decimal
    };
  }, [workOrder?.plots]);

  if (error) {
    return (
      <div className="container mx-auto p-6">
        <Card className="border-destructive">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 text-destructive">
              <AlertCircle className="h-5 w-5" />
              <p>Error al cargar la orden de trabajo: {error}</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (loading || !workOrder) {
    return (
      <div className="container mx-auto p-6">
        <div className="space-y-6">
          <Skeleton className="h-10 w-64" />
          <Skeleton className="h-96 w-full" />
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <div className="space-y-6">
        {/* Header con botón volver */}
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="icon"
            onClick={() => navigate("/work-orders/my-tasks")}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div className="flex-1">
            <h1 className="text-3xl font-bold tracking-tight">{workOrder.title}</h1>
            <p className="text-muted-foreground mt-1">{workOrder.description}</p>
          </div>
          <div className="flex flex-col gap-2 items-end">
            <WorkOrderStatusBadge status={workOrder.status} />
            {dateWarning && (
              <Badge 
                variant={dateWarning.status === 'overdue' ? 'destructive' : 'warning'}
                className="flex items-center gap-1"
              >
                {dateWarning.status === 'overdue' ? (
                  <AlertTriangle className="h-4 w-4" />
                ) : (
                  <Clock className="h-4 w-4" />
                )}
                {dateWarning.message}
              </Badge>
            )}
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Columna principal */}
          <div className="lg:col-span-2 space-y-6">
            {/* Información general */}
            <Card>
              <CardHeader>
                <CardTitle>Información General</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Fecha Programada</p>
                    <div className="flex items-center gap-2 mt-1">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <p className="text-sm">
                        {format(new Date(workOrder.scheduledDate), "dd 'de' MMMM, yyyy", { locale: es })}
                      </p>
                    </div>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Fecha Límite</p>
                    <div className="flex items-center gap-2 mt-1">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <p className="text-sm">
                        {format(new Date(workOrder.dueDate), "dd 'de' MMMM, yyyy", { locale: es })}
                      </p>
                    </div>
                  </div>
                </div>

                {workOrder.assignedTo && (
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Asignado a</p>
                    <div className="flex items-center gap-2 mt-1">
                      <User className="h-4 w-4 text-muted-foreground" />
                      <p className="text-sm">{workOrder.assignedTo.name}</p>
                    </div>
                  </div>
                )}

                {workOrder.completedDate && (
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Fecha de Completado</p>
                    <p className="text-sm mt-1">
                      {format(new Date(workOrder.completedDate), "dd 'de' MMMM, yyyy", { locale: es })}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Parcelas asignadas */}
            <Card>
              <CardHeader>
                <CardTitle>Parcelas Asignadas</CardTitle>
                <CardDescription>
                  {workOrder.plots?.length || 0} {workOrder.plots?.length === 1 ? 'parcela' : 'parcelas'}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {workOrder.plots && workOrder.plots.length > 0 ? (
                  <div className="space-y-2">
                    {workOrder.plots.map((plot) => (
                      <div
                        key={plot.id}
                        className="flex items-center justify-between p-3 border rounded-lg"
                      >
                        <div className="flex items-center gap-2">
                          <MapPin className="h-4 w-4 text-muted-foreground" />
                          <div>
                            <p className="font-medium">{plot.name}</p>
                            <p className="text-sm text-muted-foreground">
                              Área: {plot.area} ha
                              {plot.field && ` • Campo: ${plot.field.name}`}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    No hay parcelas asignadas a esta orden de trabajo
                  </p>
                )}
              </CardContent>
            </Card>

            {/* Mapa de parcelas */}
            <Card>
              <CardHeader>
                <CardTitle>Ubicación</CardTitle>
                <CardDescription>
                  Mapa de las parcelas asignadas
                </CardDescription>
              </CardHeader>
              <CardContent>
                {workOrder.plots && workOrder.plots.length > 0 && plotsGeoJSON.features.length > 0 ? (
                  <div className="h-[400px] rounded-lg overflow-hidden">
                    <InteractiveMap
                      initialData={plotsGeoJSON}
                      editable={false}
                      initialViewState={mapCenter}
                      showControls={false}
                      availableModes={['view']}
                      defaultMode="view"
                    />
                  </div>
                ) : (
                  <div className="bg-muted rounded-lg h-[200px] flex items-center justify-center">
                    <div className="text-center text-muted-foreground">
                      <MapPin className="h-8 w-8 mx-auto mb-2" />
                      <p className="text-sm">
                        {workOrder.plots && workOrder.plots.length > 0
                          ? "Las parcelas no tienen geometría definida"
                          : "No hay parcelas para mostrar en el mapa"}
                      </p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Columna lateral - Actividades */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Actividades</CardTitle>
                    <CardDescription className="mt-1.5">
                      {workOrder.activities?.length || 0} registradas
                    </CardDescription>
                  </div>
                  <Button
                    size="sm"
                    onClick={() => setShowAddActivityDialog(true)}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Agregar
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {workOrder.activities && workOrder.activities.length > 0 ? (
                  <div className="space-y-3">
                    {workOrder.activities.map((activity) => (
                      <div
                        key={activity.id}
                        className="p-3 border rounded-lg space-y-2"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <p className="font-medium text-sm">
                              {ACTIVITY_TYPE_LABELS[activity.type] || activity.type}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {format(new Date(activity.executionDate), "dd MMM yyyy", { locale: es })}
                            </p>
                          </div>
                          <ActivityStatusBadge status={activity.status} />
                        </div>

                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <FileText className="h-3 w-3" />
                            <span>{activity.hoursWorked}h</span>
                          </div>
                          {activity.inputsUsed && activity.inputsUsed.length > 0 && (
                            <Badge variant="outline" className="text-xs">
                              {activity.inputsUsed.length} {activity.inputsUsed.length === 1 ? 'insumo' : 'insumos'}
                            </Badge>
                          )}
                        </div>

                        {/* Detalles de insumos usados */}
                        {activity.inputsUsed && activity.inputsUsed.length > 0 && (
                          <div className="border-t pt-2 space-y-1">
                            <p className="text-xs font-medium text-muted-foreground">Insumos utilizados:</p>
                            {activity.inputsUsed.map((usage) => (
                              <div key={usage.id} className="flex justify-between text-xs">
                                <span>{usage.input?.name || 'Insumo desconocido'}</span>
                                <span className="text-muted-foreground">
                                  {usage.quantityUsed} {usage.input?.unit || ''}
                                </span>
                              </div>
                            ))}
                          </div>
                        )}

                        {activity.details && typeof activity.details === 'string' && (
                          <p className="text-xs text-muted-foreground border-t pt-2">
                            {activity.details}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-2" />
                    <p className="text-sm text-muted-foreground">
                      No hay actividades registradas
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Agrega tu primera actividad
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Dialog para agregar actividad */}
      <AddActivityDialog
        open={showAddActivityDialog}
        onOpenChange={setShowAddActivityDialog}
        workOrderId={workOrder.id}
        onActivityCreated={refetch}
      />
    </div>
  );
}
