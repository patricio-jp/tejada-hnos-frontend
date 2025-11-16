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
import { useWorkOrderActions } from "../hooks/useWorkOrderActions";
import { WorkOrderActionDialog } from "../components/WorkOrderActionDialog";
import type { WorkOrderStatus } from "@/types";

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
  const [selectedAction, setSelectedAction] = useState<{
    label: string;
    nextStatus: WorkOrderStatus;
    description: string;
    variant?: 'default' | 'destructive' | 'outline' | 'secondary';
  } | null>(null);

  // Hook para manejar las acciones de estado
  const workOrderActions = useWorkOrderActions({
    workOrder: workOrder ? {
      id: workOrder.id,
      status: workOrder.status,
      assignedToId: workOrder.assignedToId,
    } : { id: '', status: 'PENDING' as WorkOrderStatus, assignedToId: null },
    onSuccess: refetch,
  });

  // Calcular advertencia de fecha (no mostrar en UNDER_REVIEW porque ya está esperando aprobación)
  const dateWarning = workOrder && workOrder.status !== 'COMPLETED' && workOrder.status !== 'CANCELLED' && workOrder.status !== 'UNDER_REVIEW'
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
    <div className="container mx-auto p-4 md:p-6">
      <div className="space-y-4 md:space-y-6">
        {/* Header con botón volver */}
        <div className="flex items-center gap-3 md:gap-4">
          <Button
            variant="outline"
            size="icon"
            onClick={() => navigate("/work-orders/my-tasks")}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div className="flex-1 min-w-0">
            <h1 className="text-xl md:text-3xl font-bold tracking-tight break-words">{workOrder.title}</h1>
            <p className="text-muted-foreground mt-1 text-sm md:text-base line-clamp-2 md:line-clamp-none">{workOrder.description}</p>
          </div>
        </div>

        <div className="grid gap-4 md:gap-6 lg:grid-cols-[70%_30%]">
          {/* Columna principal (70%) - Detalles y Actividades */}
          <div className="space-y-4 md:space-y-6">
            {/* Información general */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg md:text-xl">Información General</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 md:space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4">
                  <div>
                    <p className="text-xs md:text-sm font-medium text-muted-foreground mb-1">Fecha Programada</p>
                    <div className="flex items-center gap-2">
                      <Calendar className="h-3 w-3 md:h-4 md:w-4 text-muted-foreground flex-shrink-0" />
                      <p className="text-xs md:text-sm">
                        {format(new Date(workOrder.scheduledDate), "dd 'de' MMMM, yyyy", { locale: es })}
                      </p>
                    </div>
                  </div>
                  <div>
                    <p className="text-xs md:text-sm font-medium text-muted-foreground mb-1">Fecha Límite</p>
                    <div className="flex items-center gap-2">
                      <Calendar className="h-3 w-3 md:h-4 md:w-4 text-muted-foreground flex-shrink-0" />
                      <p className="text-xs md:text-sm">
                        {format(new Date(workOrder.dueDate), "dd 'de' MMMM, yyyy", { locale: es })}
                      </p>
                    </div>
                  </div>
                </div>

                {workOrder.assignedTo && (
                  <div>
                    <p className="text-xs md:text-sm font-medium text-muted-foreground mb-1">Asignado a</p>
                    <div className="flex items-center gap-2">
                      <User className="h-3 w-3 md:h-4 md:w-4 text-muted-foreground flex-shrink-0" />
                      <p className="text-xs md:text-sm">{workOrder.assignedTo.name}</p>
                    </div>
                  </div>
                )}

                {workOrder.completedDate && (
                  <div>
                    <p className="text-xs md:text-sm font-medium text-muted-foreground mb-1">Fecha de Completado</p>
                    <p className="text-xs md:text-sm">
                      {format(new Date(workOrder.completedDate), "dd 'de' MMMM, yyyy", { locale: es })}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Estado y Acciones */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg md:text-xl">Estado de la Orden</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 md:space-y-4">
                <div>
                  <p className="text-xs md:text-sm font-medium text-muted-foreground mb-2">Estado Actual</p>
                  <WorkOrderStatusBadge status={workOrder.status} />
                </div>

                {/* Advertencia de fecha si aplica */}
                {dateWarning && (
                  <div className={`flex items-center gap-2 p-3 rounded-lg border-l-4 ${
                    dateWarning.status === 'overdue'
                      ? 'border-l-red-500/70 bg-red-50/30 dark:bg-red-900/10 border-red-200/50 dark:border-red-800/30'
                      : 'border-l-yellow-500/70 bg-yellow-50/30 dark:bg-yellow-900/10 border-yellow-200/50 dark:border-yellow-800/30'
                  }`}>
                    {dateWarning.status === 'overdue' ? (
                      <AlertTriangle className="h-4 w-4 text-red-600 dark:text-red-500 flex-shrink-0" />
                    ) : (
                      <Clock className="h-4 w-4 text-yellow-600 dark:text-yellow-500 flex-shrink-0" />
                    )}
                    <p className={`text-xs md:text-sm font-medium ${
                      dateWarning.status === 'overdue' ? 'text-red-700 dark:text-red-400' : 'text-yellow-700 dark:text-yellow-400'
                    }`}>
                      {dateWarning.message}
                    </p>
                  </div>
                )}

                {/* Acciones disponibles */}
                {workOrderActions.availableActions.length > 0 && (
                  <div className="pt-3 border-t">
                    <p className="text-xs md:text-sm font-medium text-muted-foreground mb-2">Acciones Disponibles</p>
                    <div className="flex flex-wrap gap-2">
                      {workOrderActions.availableActions.map((action) => (
                        <Button
                          key={action.nextStatus}
                          variant={action.variant || 'default'}
                          size="sm"
                          onClick={() => setSelectedAction(action)}
                          disabled={workOrderActions.loading}
                          className="text-xs md:text-sm"
                        >
                          {action.label}
                        </Button>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <div className="flex flex-col gap-2">
                  <div className="flex items-start sm:items-center justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <CardTitle className="text-lg md:text-xl">Actividades</CardTitle>
                      <CardDescription className="mt-1.5 text-xs md:text-sm">
                        {workOrder.activities?.length || 0} registradas
                      </CardDescription>
                    </div>
                    <Button
                      size="sm"
                      onClick={() => setShowAddActivityDialog(true)}
                      disabled={workOrder.status !== 'IN_PROGRESS'}
                      className="flex-shrink-0"
                    >
                      <Plus className="h-4 w-4 sm:mr-2" />
                      <span className="hidden sm:inline">Agregar</span>
                    </Button>
                  </div>
                  {workOrder.status !== 'IN_PROGRESS' && (
                    <div className="flex items-start gap-2 p-2 rounded-lg bg-muted/50 border">
                      <AlertCircle className="h-4 w-4 text-muted-foreground flex-shrink-0 mt-0.5" />
                      <p className="text-xs text-muted-foreground">
                        {workOrder.status === 'PENDING' && 'La orden debe estar "En Progreso" para agregar actividades.'}
                        {workOrder.status === 'UNDER_REVIEW' && 'La orden está en revisión. No se pueden agregar más actividades hasta que sea reabierta.'}
                        {workOrder.status === 'COMPLETED' && 'La orden está completada. No se pueden agregar actividades.'}
                        {workOrder.status === 'CANCELLED' && 'La orden está cancelada. No se pueden agregar actividades.'}
                      </p>
                    </div>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                {workOrder.activities && workOrder.activities.length > 0 ? (
                  <div className="space-y-2 md:space-y-3">
                    {workOrder.activities.map((activity) => (
                      <div
                        key={activity.id}
                        className="p-2 md:p-3 border rounded-lg space-y-2"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-xs md:text-sm">
                              {ACTIVITY_TYPE_LABELS[activity.type] || activity.type}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {format(new Date(activity.executionDate), "dd MMM yyyy", { locale: es })}
                            </p>
                          </div>
                          <div className="flex-shrink-0">
                            <ActivityStatusBadge status={activity.status} />
                          </div>
                        </div>

                        <div className="flex items-center gap-3 md:gap-4 text-xs text-muted-foreground flex-wrap">
                          <div className="flex items-center gap-1">
                            <FileText className="h-3 w-3 flex-shrink-0" />
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
                              <div key={usage.id} className="flex justify-between gap-2 text-xs">
                                <span className="truncate">{usage.input?.name || 'Insumo desconocido'}</span>
                                <span className="text-muted-foreground flex-shrink-0">
                                  {usage.quantityUsed} {usage.input?.unit || ''}
                                </span>
                              </div>
                            ))}
                          </div>
                        )}

                        {activity.details && typeof activity.details === 'string' && (
                          <p className="text-xs text-muted-foreground border-t pt-2 break-words">
                            {activity.details}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-6 md:py-8">
                    <FileText className="h-10 w-10 md:h-12 md:w-12 mx-auto text-muted-foreground mb-2" />
                    <p className="text-xs md:text-sm text-muted-foreground">
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

          {/* Columna lateral (30%) - Parcelas y Mapa */}
          <div className="space-y-4 md:space-y-6">
            {/* Parcelas asignadas */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg md:text-xl">Parcelas Asignadas</CardTitle>
                <CardDescription className="text-xs md:text-sm">
                  {workOrder.plots?.length || 0} {workOrder.plots?.length === 1 ? 'parcela' : 'parcelas'}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {workOrder.plots && workOrder.plots.length > 0 ? (
                  <div className="space-y-2">
                    {workOrder.plots.map((plot) => (
                      <div
                        key={plot.id}
                        className="flex items-start gap-2 p-2 md:p-3 border rounded-lg"
                      >
                        <MapPin className="h-4 w-4 text-muted-foreground flex-shrink-0 mt-0.5" />
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm md:text-base truncate">{plot.name}</p>
                          <p className="text-xs md:text-sm text-muted-foreground">
                            Área: {plot.area} ha
                            {plot.field && (
                              <span className="block sm:inline sm:before:content-['•'] sm:before:mx-1">
                                Campo: {plot.field.name}
                              </span>
                            )}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs md:text-sm text-muted-foreground text-center py-4">
                    No hay parcelas asignadas a esta orden de trabajo
                  </p>
                )}
              </CardContent>
            </Card>

            {/* Mapa de parcelas */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg md:text-xl">Ubicación</CardTitle>
                <CardDescription className="text-xs md:text-sm">
                  Mapa de las parcelas asignadas
                </CardDescription>
              </CardHeader>
              <CardContent>
                {workOrder.plots && workOrder.plots.length > 0 && plotsGeoJSON.features.length > 0 ? (
                  <div className="h-[250px] md:h-[400px] rounded-lg overflow-hidden">
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
                  <div className="bg-muted rounded-lg h-[150px] md:h-[200px] flex items-center justify-center">
                    <div className="text-center text-muted-foreground px-4">
                      <MapPin className="h-6 w-6 md:h-8 md:w-8 mx-auto mb-2" />
                      <p className="text-xs md:text-sm">
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
        </div>
      </div>

      {/* Dialog para agregar actividad */}
      <AddActivityDialog
        open={showAddActivityDialog}
        onOpenChange={setShowAddActivityDialog}
        workOrderId={workOrder.id}
        onActivityCreated={refetch}
      />

      {/* Dialog para confirmar acciones de estado */}
      {selectedAction && (
        <WorkOrderActionDialog
          open={!!selectedAction}
          onOpenChange={(open) => !open && setSelectedAction(null)}
          action={selectedAction}
          onConfirm={workOrderActions.updateStatus}
          loading={workOrderActions.loading}
          error={workOrderActions.error}
        />
      )}
    </div>
  );
}
