import { useEffect, useMemo, useState } from 'react'
import type { ReactElement } from 'react'
import { useParams } from 'react-router'
import { Pie, PieChart, ResponsiveContainer, Cell, Tooltip as RechartsTooltip } from 'recharts'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Skeleton } from '@/components/ui/skeleton'
import { Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'

interface PlotReportData {
  plotName: string
  totalCosts: number
  totalRevenue: number
  margin: number
  costsBreakdown: {
    labor: number
    inputs: number
  }
  activities: {
    id: string
    date: string
    type: string
    description: string
    cost: number
  }[]
}

const MOCK_PLOT_REPORT: PlotReportData = {
  plotName: 'Parcela Los Robles',
  totalCosts: 185_000,
  totalRevenue: 265_000,
  margin: 80_000,
  costsBreakdown: {
    labor: 92_000,
    inputs: 93_000,
  },
  activities: [
    {
      id: 'act-01',
      date: '2025-10-02',
      type: 'Cosecha',
      description: 'Cosecha manual del lote norte',
      cost: 28_000,
    },
    {
      id: 'act-02',
      date: '2025-09-26',
      type: 'Aplicación',
      description: 'Aplicación de fertilizante nitrogenado',
      cost: 19_500,
    },
    {
      id: 'act-03',
      date: '2025-09-12',
      type: 'Riego',
      description: 'Riego por goteo - turno nocturno',
      cost: 6_800,
    },
    {
      id: 'act-04',
      date: '2025-08-30',
      type: 'Labranza',
      description: 'Labranza liviana para control de malezas',
      cost: 12_400,
    },
  ],
}

const piePalette = ['#0ea5e9', '#f97316']
const currency = new Intl.NumberFormat('es-AR', {
  style: 'currency',
  currency: 'ARS',
  maximumFractionDigits: 0,
})

interface PieTooltipProps {
  active?: boolean
  payload?: Array<{ name?: string; value?: number }>
}

function PieTooltip({ active, payload }: PieTooltipProps): ReactElement | null {
  if (!active || !payload?.length) return null
  const dataPoint = payload[0]

  return (
    <div className="rounded-2xl bg-slate-950/90 px-4 py-3 text-white shadow-xl ring-1 ring-white/15">
      <p className="text-xs uppercase tracking-wide text-slate-300">{dataPoint.name}</p>
      <p className="text-lg font-semibold">{currency.format(Number(dataPoint.value) || 0)}</p>
    </div>
  )
}

function StatCard({
  title,
  value,
  description,
  trend,
}: {
  title: string
  value: string
  description: string
  trend?: 'positive' | 'negative'
}): ReactElement {
  return (
    <Card>
      <CardHeader className="space-y-1">
        <CardDescription>{title}</CardDescription>
        <CardTitle className="text-3xl font-semibold">{value}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className={cn('text-sm text-muted-foreground', trend === 'positive' && 'text-green-600 dark:text-green-400', trend === 'negative' && 'text-red-600 dark:text-red-400')}>
          {description}
        </p>
      </CardContent>
    </Card>
  )
}

export default function PlotReportPage() {
  const { id } = useParams<{ id: string }>()
  const [report, setReport] = useState<PlotReportData | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    setIsLoading(true)
    const timeout = setTimeout(() => {
      setReport(MOCK_PLOT_REPORT)
      setIsLoading(false)
    }, 800)
    return () => clearTimeout(timeout)
  }, [id])

  const pieData = useMemo(() => {
    if (!report) return []
    return [
      { name: 'Mano de obra', value: report.costsBreakdown.labor },
      { name: 'Insumos', value: report.costsBreakdown.inputs },
    ]
  }, [report])

  if (isLoading || !report) {
    return (
      <div className="container mx-auto space-y-6 py-10">
        <Skeleton className="h-10 w-64" />
        <div className="grid gap-4 md:grid-cols-3">
          <Skeleton className="h-28 w-full" />
          <Skeleton className="h-28 w-full" />
          <Skeleton className="h-28 w-full" />
        </div>
        <Card className="flex h-72 items-center justify-center">
          <div className="flex flex-col items-center gap-3 text-center">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            <p className="text-sm text-muted-foreground">Cargando datos financieros…</p>
          </div>
        </Card>
        <Skeleton className="h-32 w-full" />
      </div>
    )
  }

  return (
    <div className="container mx-auto flex flex-col gap-6 py-10">
      <header className="flex flex-col gap-1">
        <p className="text-sm text-muted-foreground">Reporte financiero</p>
        <h1 className="text-3xl font-bold">{report.plotName}</h1>
        <p className="text-muted-foreground">
          Información consolidada de ingresos, costos y actividades recientes.
        </p>
      </header>

      <section className="grid gap-4 md:grid-cols-3">
        <StatCard
          title="Costo total"
          value={currency.format(report.totalCosts)}
          description="Suma de mano de obra e insumos"
        />
        <StatCard
          title="Ingreso total"
          value={currency.format(report.totalRevenue)}
          description="Ingresos contabilizados en el periodo"
        />
        <StatCard
          title="Margen"
          value={currency.format(report.margin)}
          description={report.margin >= 0 ? 'Margen positivo' : 'Margen negativo'}
          trend={report.margin >= 0 ? 'positive' : 'negative'}
        />
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <Card className="border-0 bg-card/70 shadow-none backdrop-blur">
          <CardHeader>
            <CardTitle>Distribución de costos</CardTitle>
            <CardDescription>Comparativa entre mano de obra e insumos.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="relative mx-auto h-64 w-full max-w-[320px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    innerRadius={88}
                    outerRadius={118}
                    paddingAngle={0}
                    cornerRadius={0}
                    stroke="transparent"
                    strokeWidth={0}
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={entry.name} fill={piePalette[index % piePalette.length]} />
                    ))}
                  </Pie>
                  <RechartsTooltip content={<PieTooltip />} />
                </PieChart>
              </ResponsiveContainer>
              <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center text-center">
                <span className="text-xs uppercase tracking-wide text-muted-foreground">Costo total</span>
                <span className="text-2xl font-semibold">{currency.format(report.totalCosts)}</span>
              </div>
            </div>
            <div className="grid gap-3 text-sm sm:grid-cols-2">
              {pieData.map((slice, index) => (
                <div
                  key={slice.name}
                  className="flex items-center justify-between rounded-lg bg-background/40 px-3 py-2"
                >
                  <div className="flex items-center gap-2">
                    <span
                      className="h-2.5 w-2.5 rounded-full"
                      style={{ backgroundColor: piePalette[index % piePalette.length] }}
                    />
                    <span className="font-medium">{slice.name}</span>
                  </div>
                  <span className="font-semibold">{currency.format(slice.value)}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Resumen financiero</CardTitle>
            <CardDescription>
              Rentabilidad actual vs. objetivo estimado de {currency.format(report.totalRevenue * 0.25)}.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <dl className="grid gap-4 text-sm">
              <div className="space-y-1">
                <dt className="text-muted-foreground">Margen / Costos</dt>
                <dd className="text-lg font-semibold">
                  {((report.margin / report.totalCosts) * 100).toFixed(1)}%
                </dd>
              </div>
              <div className="space-y-1">
                <dt className="text-muted-foreground">Costo promedio por actividad</dt>
                <dd className="text-lg font-semibold">
                  {currency.format(report.totalCosts / report.activities.length)}
                </dd>
              </div>
              <div className="space-y-1">
                <dt className="text-muted-foreground">Actividad más costosa</dt>
                <dd className="text-lg font-semibold">
                  {currency.format(Math.max(...report.activities.map((activity) => activity.cost)))}
                </dd>
              </div>
            </dl>
          </CardContent>
        </Card>
      </section>

      <Card>
        <CardHeader>
          <CardTitle>Historial de actividades</CardTitle>
          <CardDescription>Últimas intervenciones registradas en la parcela.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Fecha</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Descripción</TableHead>
                  <TableHead className="text-right">Costo</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {report.activities.map((activity) => (
                  <TableRow key={activity.id}>
                    <TableCell>{new Date(activity.date).toLocaleDateString('es-AR')}</TableCell>
                    <TableCell>{activity.type}</TableCell>
                    <TableCell>{activity.description}</TableCell>
                    <TableCell className="text-right">{currency.format(activity.cost)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
