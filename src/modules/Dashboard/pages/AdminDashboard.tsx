import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { BarChart3, ShoppingCart, TrendingUp, Users } from "lucide-react"

/**
 * Dashboard para usuarios con rol ADMIN
 * 
 * Muestra métricas y estadísticas globales de:
 * - Todos los campos
 * - Órdenes de trabajo
 * - Compras
 * - Ventas
 */
export default function AdminDashboard() {
  return (
    <div className="container mx-auto p-6">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Dashboard Administrativo</h1>
            <p className="text-muted-foreground mt-2">
              Vista global de todas las operaciones
            </p>
          </div>
          <Badge variant="outline" className="h-fit">
            Administrador
          </Badge>
        </div>

        {/* Métricas principales */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Campos</CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">--</div>
              <p className="text-xs text-muted-foreground mt-1">
                Hectáreas totales
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
                En curso este mes
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Compras</CardTitle>
              <ShoppingCart className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">--</div>
              <p className="text-xs text-muted-foreground mt-1">
                Órdenes pendientes
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Ventas</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">--</div>
              <p className="text-xs text-muted-foreground mt-1">
                Total este mes
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Sección de gráficos (placeholder) */}
        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Producción por Campo</CardTitle>
              <CardDescription>
                Rendimiento de los últimos 6 meses
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
              <CardTitle>Resumen Financiero</CardTitle>
              <CardDescription>
                Compras vs Ventas mensuales
              </CardDescription>
            </CardHeader>
            <CardContent className="h-[300px] flex items-center justify-center">
              <p className="text-sm text-muted-foreground">
                Gráfico se implementará próximamente
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Actividades recientes */}
        <Card>
          <CardHeader>
            <CardTitle>Actividades Recientes</CardTitle>
            <CardDescription>
              Últimas operaciones registradas en el sistema
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
