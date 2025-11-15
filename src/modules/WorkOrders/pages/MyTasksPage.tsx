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
    <div className="container mx-auto p-4 md:p-6">
      <div className="space-y-4 md:space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex-1 min-w-0">
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Mis Tareas</h1>
            <p className="text-muted-foreground mt-1 md:mt-2 text-sm md:text-base">
              Órdenes de trabajo asignadas a ti
            </p>
          </div>
          <Badge variant="outline" className="h-fit self-start sm:self-auto">
            Operario
          </Badge>
        </div>

        {/* Resumen de tareas */}
        <div className="grid gap-2 grid-cols-3 md:gap-4">
          <Card>
            <CardHeader className="flex flex-col items-center space-y-1 pb-2 p-2 md:p-6 md:pb-3">
              <div className="flex items-center gap-1 w-full justify-between">
                <CardTitle className="text-[10px] md:text-sm font-medium leading-tight truncate flex-1">
                  Pendientes
                </CardTitle>
                <Clock className="h-3 w-3 md:h-4 md:w-4 text-yellow-600 flex-shrink-0" />
              </div>
            </CardHeader>
            <CardContent className="p-2 pt-0 md:p-6 md:pt-0">
              {loading ? (
                <Skeleton className="h-6 md:h-8 w-8 md:w-16" />
              ) : (
                <>
                  <div className="text-xl md:text-2xl font-bold">{stats.pending}</div>
                  <p className="text-[10px] md:text-xs text-muted-foreground mt-0.5 md:mt-1 hidden sm:block">
                    Por iniciar
                  </p>
                </>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-col items-center space-y-1 pb-2 p-2 md:p-6 md:pb-3">
              <div className="flex items-center gap-1 w-full justify-between">
                <CardTitle className="text-[10px] md:text-sm font-medium leading-tight truncate flex-1">
                  En Curso
                </CardTitle>
                <AlertCircle className="h-3 w-3 md:h-4 md:w-4 text-blue-600 flex-shrink-0" />
              </div>
            </CardHeader>
            <CardContent className="p-2 pt-0 md:p-6 md:pt-0">
              {loading ? (
                <Skeleton className="h-6 md:h-8 w-8 md:w-16" />
              ) : (
                <>
                  <div className="text-xl md:text-2xl font-bold">{stats.inProgress}</div>
                  <p className="text-[10px] md:text-xs text-muted-foreground mt-0.5 md:mt-1 hidden sm:block">
                    Activas
                  </p>
                </>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-col items-center space-y-1 pb-2 p-2 md:p-6 md:pb-3">
              <div className="flex items-center gap-1 w-full justify-between">
                <CardTitle className="text-[10px] md:text-sm font-medium leading-tight truncate flex-1">
                  Hechas
                </CardTitle>
                <CheckCircle2 className="h-3 w-3 md:h-4 md:w-4 text-green-600 flex-shrink-0" />
              </div>
            </CardHeader>
            <CardContent className="p-2 pt-0 md:p-6 md:pt-0">
              {loading ? (
                <Skeleton className="h-6 md:h-8 w-8 md:w-16" />
              ) : (
                <>
                  <div className="text-xl md:text-2xl font-bold">{stats.completed}</div>
                  <p className="text-[10px] md:text-xs text-muted-foreground mt-0.5 md:mt-1 hidden sm:block">
                    Este mes
                  </p>
                </>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Listado de tareas */}
        <Card>
          <CardHeader className="p-4 md:p-6">
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1 min-w-0">
                <CardTitle className="text-lg md:text-xl">Órdenes Asignadas</CardTitle>
                <CardDescription className="mt-1.5 text-xs md:text-sm">
                  Revisa y actualiza el estado de tus tareas
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-4 pt-0 md:p-6 md:pt-0">
            {loading ? (
              <div className="space-y-3 md:space-y-4">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-24 md:h-32 w-full" />
                ))}
              </div>
            ) : workOrders.length === 0 ? (
              /* Estado vacío */
              <div className="flex flex-col items-center justify-center py-8 md:py-12 text-center px-4">
                <div className="rounded-full bg-muted p-4 md:p-6 mb-3 md:mb-4">
                  <ClipboardList className="h-8 w-8 md:h-12 md:w-12 text-muted-foreground" />
                </div>
                <h3 className="text-base md:text-lg font-semibold mb-2">
                  No tienes tareas asignadas
                </h3>
                <p className="text-xs md:text-sm text-muted-foreground max-w-sm">
                  Las órdenes de trabajo asignadas por tu supervisor aparecerán aquí.
                  Podrás ver los detalles y registrar actividades realizadas.
                </p>
              </div>
            ) : (
              /* Listado de órdenes de trabajo */
              <div className="grid gap-3 md:gap-4 sm:grid-cols-2 lg:grid-cols-3">
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
