import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { ClipboardList, Clock, CheckCircle2, AlertCircle, Calendar } from "lucide-react"

/**
 * Vista de tareas asignadas para usuarios con rol OPERARIO
 * 
 * Muestra el listado de órdenes de trabajo asignadas al operario logueado
 */
export default function MyTasksPage() {
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
              <div className="text-2xl font-bold">0</div>
              <p className="text-xs text-muted-foreground mt-1">
                Tareas por iniciar
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">En Progreso</CardTitle>
              <AlertCircle className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">0</div>
              <p className="text-xs text-muted-foreground mt-1">
                Tareas activas
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Completadas</CardTitle>
              <CheckCircle2 className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">0</div>
              <p className="text-xs text-muted-foreground mt-1">
                Esta semana
              </p>
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
              <Button variant="outline" size="sm">
                <Calendar className="h-4 w-4 mr-2" />
                Filtrar por fecha
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {/* Estado vacío */}
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="rounded-full bg-muted p-6 mb-4">
                <ClipboardList className="h-12 w-12 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold mb-2">
                No tienes tareas asignadas
              </h3>
              <p className="text-sm text-muted-foreground max-w-sm">
                Las órdenes de trabajo asignadas por tu supervisor aparecerán aquí.
                Podrás ver los detalles y actualizar su estado.
              </p>
            </div>

            <Separator className="my-4" />

            {/* Información adicional */}
            <div className="rounded-lg bg-muted p-4">
              <div className="flex gap-4 text-sm">
                <div className="flex items-start gap-2">
                  <Clock className="h-4 w-4 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="font-medium">¿Cuándo aparecerán las tareas?</p>
                    <p className="text-muted-foreground text-xs mt-1">
                      Cuando tu capataz o administrador te asigne una orden de trabajo
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Historial de tareas completadas */}
        <Card>
          <CardHeader>
            <CardTitle>Historial de Tareas</CardTitle>
            <CardDescription>
              Órdenes completadas en los últimos 30 días
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground text-center py-8">
              El historial de tareas se mostrará aquí cuando completes órdenes de trabajo
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
