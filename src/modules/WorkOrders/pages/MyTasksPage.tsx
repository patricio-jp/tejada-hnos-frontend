import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { ClipboardList, Clock, CheckCircle2, AlertCircle } from "lucide-react"
import { useWorkOrders } from "../hooks/useWorkOrders"
import { WorkOrderCard } from "../components/WorkOrderCard"
import { useMemo } from "react"

/**
 * Vista de tareas asignadas para usuarios con rol OPERARIO
 * 
 * Muestra el listado de órdenes de trabajo asignadas al operario logueado
 */
export default function MyTasksPage() {
  const { workOrders, loading, error } = useWorkOrders();

  const stats = useMemo(() => {
    const pending = workOrders.filter(wo => wo.status === 'PENDING').length;
    const inProgress = workOrders.filter(wo => wo.status === 'IN_PROGRESS').length;
    const completed = workOrders.filter(wo => wo.status === 'COMPLETED').length;
    
    return { pending, inProgress, completed };
  }, [workOrders]);

  if (error) {
    return (
      <div className="container mx-auto p-6">
        <Card className="border-destructive">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 text-destructive">
              <AlertCircle className="h-5 w-5" />
              <p>Error al cargar las tareas: {error}</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Mis Tareas</h1>
            <p className="text-muted-foreground mt-2">
              Órdenes de trabajo asignadas a ti
            </p>
          </div>
          <Badge variant="outline" className="h-fit">
            Operario
          </Badge>
        </div>

        {/* Resumen de tareas */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pendientes</CardTitle>
              <Clock className="h-4 w-4 text-yellow-600" />
            </CardHeader>
            <CardContent>
              {loading ? (
                <Skeleton className="h-8 w-16" />
              ) : (
                <>
                  <div className="text-2xl font-bold">{stats.pending}</div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Tareas por iniciar
                  </p>
                </>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">En Progreso</CardTitle>
              <AlertCircle className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              {loading ? (
                <Skeleton className="h-8 w-16" />
              ) : (
                <>
                  <div className="text-2xl font-bold">{stats.inProgress}</div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Tareas activas
                  </p>
                </>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Completadas</CardTitle>
              <CheckCircle2 className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              {loading ? (
                <Skeleton className="h-8 w-16" />
              ) : (
                <>
                  <div className="text-2xl font-bold">{stats.completed}</div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Este mes
                  </p>
                </>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Listado de tareas */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Órdenes Asignadas</CardTitle>
                <CardDescription className="mt-1.5">
                  Revisa y actualiza el estado de tus tareas
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-32 w-full" />
                ))}
              </div>
            ) : workOrders.length === 0 ? (
              /* Estado vacío */
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <div className="rounded-full bg-muted p-6 mb-4">
                  <ClipboardList className="h-12 w-12 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-semibold mb-2">
                  No tienes tareas asignadas
                </h3>
                <p className="text-sm text-muted-foreground max-w-sm">
                  Las órdenes de trabajo asignadas por tu supervisor aparecerán aquí.
                  Podrás ver los detalles y registrar actividades realizadas.
                </p>
              </div>
            ) : (
              /* Listado de órdenes de trabajo */
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {workOrders.map((workOrder) => (
                  <WorkOrderCard key={workOrder.id} workOrder={workOrder} />
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
