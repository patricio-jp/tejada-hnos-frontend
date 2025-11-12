import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { MapPin, Users, AlertCircle, CheckCircle2 } from "lucide-react"

/**
 * Dashboard para usuarios con rol CAPATAZ
 * 
 * Muestra métricas y estadísticas de:
 * - Solo los campos que el capataz administra
 * - Órdenes de trabajo de sus campos
 * - NO tiene acceso a información de ventas y compras
 */
export default function CapatazDashboard() {
  return (
    <div className="container mx-auto p-6">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Dashboard de Capataz</h1>
            <p className="text-muted-foreground mt-2">
              Gestión de tus campos asignados
            </p>
          </div>
          <Badge variant="outline" className="h-fit">
            Capataz
          </Badge>
        </div>

        {/* Métricas principales - solo de campos asignados */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Mis Campos</CardTitle>
              <MapPin className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">--</div>
              <p className="text-xs text-muted-foreground mt-1">
                Campos bajo tu supervisión
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Órdenes de Trabajo</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">--</div>
              <p className="text-xs text-muted-foreground mt-1">
                Activas en tus campos
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Tareas Pendientes</CardTitle>
              <AlertCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">--</div>
              <p className="text-xs text-muted-foreground mt-1">
                Requieren atención
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Estado de campos */}
        <Card>
          <CardHeader>
            <CardTitle>Estado de Campos</CardTitle>
            <CardDescription>
              Resumen de actividades en tus campos asignados
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                  <span className="text-sm">Campos activos</span>
                </div>
                <Badge variant="outline">--</Badge>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 text-yellow-600" />
                  <span className="text-sm">Campos con tareas pendientes</span>
                </div>
                <Badge variant="outline">--</Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Gráficos de tus campos */}
        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Rendimiento de Campos</CardTitle>
              <CardDescription>
                Producción de los últimos 3 meses
              </CardDescription>
            </CardHeader>
            <CardContent className="h-[300px] flex items-center justify-center">
              <p className="text-sm text-muted-foreground">
                Gráfico se implementará próximamente
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Actividades por Campo</CardTitle>
              <CardDescription>
                Distribución de órdenes de trabajo
              </CardDescription>
            </CardHeader>
            <CardContent className="h-[300px] flex items-center justify-center">
              <p className="text-sm text-muted-foreground">
                Gráfico se implementará próximamente
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Tareas recientes */}
        <Card>
          <CardHeader>
            <CardTitle>Actividades Recientes</CardTitle>
            <CardDescription>
              Últimas órdenes de trabajo en tus campos
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground text-center py-8">
              Lista de actividades se implementará próximamente
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
