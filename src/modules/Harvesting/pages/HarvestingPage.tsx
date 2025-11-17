import { useMemo, useState } from 'react'
import type { FormEvent } from 'react'
import { Plus, Wheat } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { NativeSelect } from '@/components/ui/native-select'
import useAuth from '@/modules/Auth/hooks/useAuth'

type HarvestLotStatus = 'PENDIENTE_PROCESO' | 'EN_STOCK' | 'AGOTADO'
type Caliber = 'SMALL' | 'MEDIUM' | 'LARGE'

type HarvestLot = {
  id: string
  parcelId: string
  parcelName: string
  status: HarvestLotStatus
  grossWeight: number
  netWeight?: number
  caliber?: Caliber
  createdAt: string
}

type RegisterFormState = {
  parcelId: string
  grossWeight: string
}

type ProcessFormState = {
  netWeight: string
  caliber: Caliber | ''
}

const PARCEL_OPTIONS = [
  { id: 'parcel-01', name: 'Lote Norte - Campo 12' },
  { id: 'parcel-02', name: 'La Esperanza - Cuadro A' },
  { id: 'parcel-03', name: 'Finca Sur - Cuadro 3' },
]

const CALIBER_OPTIONS: { value: Caliber; label: string }[] = [
  { value: 'SMALL', label: 'Small' },
  { value: 'MEDIUM', label: 'Medium' },
  { value: 'LARGE', label: 'Large' },
]

const INITIAL_LOTS: HarvestLot[] = [
  {
    id: 'lot-001',
    parcelId: 'parcel-01',
    parcelName: 'Lote Norte - Campo 12',
    status: 'EN_STOCK',
    grossWeight: 6200,
    netWeight: 4100,
    caliber: 'MEDIUM',
    createdAt: '2025-02-12T10:30:00-03:00',
  },
  {
    id: 'lot-002',
    parcelId: 'parcel-02',
    parcelName: 'La Esperanza - Cuadro A',
    status: 'PENDIENTE_PROCESO',
    grossWeight: 5400,
    createdAt: '2025-02-14T08:15:00-03:00',
  },
]

const weightFormatter = new Intl.NumberFormat('es-AR', {
  maximumFractionDigits: 0,
})

const statusStyles: Record<HarvestLotStatus, { label: string; variant: 'warning' | 'secondary' | 'destructive' }> = {
  PENDIENTE_PROCESO: { label: 'Pendiente', variant: 'warning' },
  EN_STOCK: { label: 'En stock', variant: 'secondary' },
  AGOTADO: { label: 'Agotado', variant: 'destructive' },
}

export default function HarvestingPage() {
  const auth = useAuth()
  const role = auth.accessPayload?.role?.toUpperCase() ?? 'INVITADO'
  const canRegister = role === 'ADMIN' || role === 'CAPATAZ'
  const canProcess = role === 'ADMIN'

  const [lots, setLots] = useState<HarvestLot[]>(INITIAL_LOTS)
  const [registerDialogOpen, setRegisterDialogOpen] = useState(false)
  const [processDialogOpen, setProcessDialogOpen] = useState(false)
  const [lotToProcess, setLotToProcess] = useState<HarvestLot | null>(null)

  const [registerForm, setRegisterForm] = useState<RegisterFormState>({ parcelId: '', grossWeight: '' })
  const [processForm, setProcessForm] = useState<ProcessFormState>({ netWeight: '', caliber: 'MEDIUM' })
  const [registerError, setRegisterError] = useState<string | null>(null)
  const [processError, setProcessError] = useState<string | null>(null)

  const totalPending = useMemo(() => lots.filter((lot) => lot.status === 'PENDIENTE_PROCESO').length, [lots])

  const handleOpenRegister = () => {
    setRegisterError(null)
    setRegisterForm({ parcelId: '', grossWeight: '' })
    setRegisterDialogOpen(true)
  }

  const handleRegisterSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const grossWeight = Number(registerForm.grossWeight)
    if (!registerForm.parcelId || !Number.isFinite(grossWeight) || grossWeight <= 0) {
      setRegisterError('Seleccioná la parcela e ingresá un peso bruto válido.')
      return
    }
    const parcel = PARCEL_OPTIONS.find((option) => option.id === registerForm.parcelId)
    const generatedId = typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `lot-${Date.now()}`

    const newLot: HarvestLot = {
      id: generatedId,
      parcelId: registerForm.parcelId,
      parcelName: parcel?.name ?? 'Parcela sin nombre',
      status: 'PENDIENTE_PROCESO',
      grossWeight,
      createdAt: new Date().toISOString(),
    }

    setLots((previous) => [newLot, ...previous])
    setRegisterDialogOpen(false)
    setRegisterForm({ parcelId: '', grossWeight: '' })
    setRegisterError(null)
  }

  const handleOpenProcess = (lot: HarvestLot) => {
    setLotToProcess(lot)
    setProcessForm({ netWeight: '', caliber: 'LARGE' })
    setProcessError(null)
    setProcessDialogOpen(true)
  }

  const handleProcessSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!lotToProcess) return

    const netWeight = Number(processForm.netWeight)
    if (!Number.isFinite(netWeight) || netWeight <= 0) {
      setProcessError('Ingresá un peso neto válido.')
      return
    }
    if (netWeight > lotToProcess.grossWeight) {
      setProcessError('El peso neto no puede superar al bruto registrado.')
      return
    }
    if (!processForm.caliber) {
      setProcessError('Seleccioná un calibre.')
      return
    }

    setLots((previous) =>
      previous.map((lot) =>
        lot.id === lotToProcess.id
          ? {
              ...lot,
              status: 'EN_STOCK',
              netWeight,
              caliber: processForm.caliber as Caliber,
            }
          : lot,
      ),
    )

    setProcessDialogOpen(false)
    setLotToProcess(null)
    setProcessError(null)
  }

  const formatWeight = (value?: number) =>
    typeof value === 'number' ? `${weightFormatter.format(value)} kg` : '—'

  const getCaliberLabel = (caliber?: Caliber) =>
    caliber ? CALIBER_OPTIONS.find((option) => option.value === caliber)?.label ?? caliber : '—'

  return (
    <div className="container mx-auto flex flex-col gap-6 py-10">
      <header className="flex flex-col gap-2">
        <p className="text-sm font-medium text-muted-foreground">Gestión de cosecha</p>
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold">Lotes de cosecha</h1>
            <p className="text-muted-foreground">
              Administrá los lotes que ingresan al acopio y procesalos cuando estén listos.
            </p>
          </div>
          {canRegister ? (
            <Button onClick={handleOpenRegister} className="gap-2">
              <Plus className="h-4 w-4" /> Registrar lote
            </Button>
          ) : null}
        </div>
        <div className="flex flex-wrap gap-2 text-sm text-muted-foreground">
          <span>Rol conectado: <strong>{role}</strong></span>
          <span className="inline-flex items-center gap-1">
            <Wheat className="h-3.5 w-3.5" /> {totalPending} lote(s) pendientes de proceso
          </span>
        </div>
      </header>

      <Card>
        <CardHeader>
          <CardTitle>Estado de lotes</CardTitle>
          <CardDescription>Seguimiento de cada lote desde el ingreso hasta que queda disponible para la venta.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Lote</TableHead>
                  <TableHead>Parcela</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Peso bruto</TableHead>
                  <TableHead>Peso neto</TableHead>
                  <TableHead>Disponible</TableHead>
                  <TableHead>Calibre</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {lots.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center text-muted-foreground">
                      Todavía no hay lotes registrados. Usá el botón “Registrar lote” para cargar el primero.
                    </TableCell>
                  </TableRow>
                ) : (
                  lots.map((lot) => (
                    <TableRow key={lot.id}>
                      <TableCell className="font-medium">{lot.id.slice(0, 8)}</TableCell>
                      <TableCell>{lot.parcelName}</TableCell>
                      <TableCell>
                        <Badge variant={statusStyles[lot.status].variant}>{statusStyles[lot.status].label}</Badge>
                      </TableCell>
                      <TableCell>{formatWeight(lot.grossWeight)}</TableCell>
                      <TableCell>{formatWeight(lot.netWeight)}</TableCell>
                      <TableCell>
                        {lot.status === 'EN_STOCK' ? (
                          <span className="font-semibold">{formatWeight(lot.netWeight)}</span>
                        ) : (
                          <span className="text-sm text-muted-foreground">—</span>
                        )}
                      </TableCell>
                      <TableCell>{getCaliberLabel(lot.caliber)}</TableCell>
                      <TableCell className="text-right">
                        {lot.status === 'PENDIENTE_PROCESO' && canProcess ? (
                          <Button size="sm" variant="secondary" onClick={() => handleOpenProcess(lot)}>
                            Procesar
                          </Button>
                        ) : (
                          <span className="text-sm text-muted-foreground">—</span>
                        )}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <Dialog
        open={registerDialogOpen}
        onOpenChange={(open) => {
          setRegisterDialogOpen(open)
          if (!open) {
            setRegisterError(null)
            setRegisterForm({ parcelId: '', grossWeight: '' })
          }
        }}
      >
        <DialogContent>
          <form className="space-y-4" onSubmit={handleRegisterSubmit}>
            <DialogHeader>
              <DialogTitle>Registrar lote</DialogTitle>
              <DialogDescription>Seleccioná la parcela e ingresá el peso bruto del camión.</DialogDescription>
            </DialogHeader>
            <div className="space-y-2">
              <Label htmlFor="parcel-select">Parcela</Label>
              <NativeSelect
                id="parcel-select"
                value={registerForm.parcelId}
                onChange={(event) => setRegisterForm((prev) => ({ ...prev, parcelId: event.target.value }))}
                required
              >
                <option value="" disabled>
                  Seleccioná una parcela
                </option>
                {PARCEL_OPTIONS.map((parcel) => (
                  <option key={parcel.id} value={parcel.id}>
                    {parcel.name}
                  </option>
                ))}
              </NativeSelect>
            </div>
            <div className="space-y-2">
              <Label htmlFor="gross-weight">Peso bruto (kg)</Label>
              <Input
                id="gross-weight"
                type="number"
                min={0}
                step={100}
                placeholder="Ej: 5000"
                value={registerForm.grossWeight}
                onChange={(event) => setRegisterForm((prev) => ({ ...prev, grossWeight: event.target.value }))}
                required
              />
            </div>
            {registerError ? <p className="text-sm text-destructive">{registerError}</p> : null}
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setRegisterDialogOpen(false)}>
                Cancelar
              </Button>
              <Button type="submit">Guardar lote</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog
        open={processDialogOpen}
        onOpenChange={(open) => {
          setProcessDialogOpen(open)
          if (!open) {
            setLotToProcess(null)
            setProcessError(null)
            setProcessForm({ netWeight: '', caliber: 'MEDIUM' })
          }
        }}
      >
        <DialogContent>
          <form className="space-y-4" onSubmit={handleProcessSubmit}>
            <DialogHeader>
              <DialogTitle>Procesar lote</DialogTitle>
              <DialogDescription>
                Ingresá el peso neto resultante y elegí el calibre para liberar el lote a stock.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-2">
              <Label htmlFor="net-weight">Peso neto (kg)</Label>
              <Input
                id="net-weight"
                type="number"
                min={0}
                step={100}
                placeholder="Ej: 2500"
                value={processForm.netWeight}
                onChange={(event) => setProcessForm((prev) => ({ ...prev, netWeight: event.target.value }))}
                required
              />
              {lotToProcess ? (
                <p className="text-xs text-muted-foreground">
                  Peso bruto registrado: {formatWeight(lotToProcess.grossWeight)}
                </p>
              ) : null}
            </div>
            <div className="space-y-2">
              <Label htmlFor="caliber-select">Calibre</Label>
              <NativeSelect
                id="caliber-select"
                value={processForm.caliber}
                onChange={(event) =>
                  setProcessForm((prev) => ({ ...prev, caliber: event.target.value as Caliber }))
                }
                required
              >
                {CALIBER_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </NativeSelect>
            </div>
            {processError ? <p className="text-sm text-destructive">{processError}</p> : null}
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setProcessDialogOpen(false)}>
                Cancelar
              </Button>
              <Button type="submit" disabled={!lotToProcess}>
                Confirmar proceso
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
