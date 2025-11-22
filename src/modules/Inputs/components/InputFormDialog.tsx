import { useEffect, useState } from 'react'
import type { Input, CreateInputDto, UpdateInputDto } from '@/types'
import { InputUnit, InputUnitLabels } from '@/types'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input as TextInput } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { NativeSelect } from '@/components/ui/native-select'
import { toast } from 'sonner'

const currencyFormatter = new Intl.NumberFormat('es-AR', {
  style: 'currency',
  currency: 'ARS',
  minimumFractionDigits: 0,
  maximumFractionDigits: 2,
})

type Props = {
  trigger?: React.ReactNode
  open?: boolean
  onOpenChange?: (open: boolean) => void
  initial?: Input | null
  onSubmit: (data: CreateInputDto | UpdateInputDto) => Promise<any>
}

export default function InputFormDialog({ trigger, open, onOpenChange, initial = null, onSubmit }: Props) {
  const [localOpen, setLocalOpen] = useState<boolean>(!!open)
  const [name, setName] = useState(initial?.name ?? '')
  const [unit, setUnit] = useState<InputUnit>(initial?.unit ?? InputUnit.UNIDAD)
  const [stock, setStock] = useState<number>(initial?.stock ?? 0)
  const [costPerUnit, setCostPerUnit] = useState<number>(initial?.costPerUnit ?? 0)
  const [submitting, setSubmitting] = useState(false)
  const isEdit = !!initial
  const [localError, setLocalError] = useState<string | null>(null)

  useEffect(() => {
    if (typeof open === 'boolean') setLocalOpen(open)
  }, [open])

  useEffect(() => {
    setName(initial?.name ?? '')
    setUnit(initial?.unit ?? InputUnit.UNIDAD)
    setStock(initial?.stock ?? 0)
    setCostPerUnit(initial?.costPerUnit ?? 0)
  }, [initial])

  const handleClose = () => {
    setLocalOpen(false)
    onOpenChange?.(false)
  }

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault()
    setSubmitting(true)
    setLocalError(null)

    // validations
    if (!name.trim()) {
      setLocalError('El nombre es obligatorio')
      setSubmitting(false)
      return
    }

    if (!unit) {
      setLocalError('La unidad es obligatoria')
      setSubmitting(false)
      return
    }

    if (stock < 0) {
      setLocalError('El stock no puede ser negativo')
      setSubmitting(false)
      return
    }

    if (costPerUnit < 0) {
      setLocalError('El costo no puede ser negativo')
      setSubmitting(false)
      return
    }

    try {
      const payload: CreateInputDto | UpdateInputDto = {
        name: name.trim(),
        unit: unit,
      }

      await onSubmit(payload)
      toast.success(isEdit ? 'Insumo actualizado' : 'Insumo creado')
      handleClose()
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Error en la operación'
      setLocalError(msg)
      toast.error(msg)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Dialog open={localOpen} onOpenChange={(v) => { setLocalOpen(v); onOpenChange?.(v) }}>
      {trigger ? <DialogTrigger asChild>{trigger}</DialogTrigger> : null}

      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isEdit ? 'Editar insumo' : 'Nuevo insumo'}</DialogTitle>
          <DialogDescription>{isEdit ? 'Modificá los datos del insumo.' : 'Completa los datos para crear un nuevo insumo.'}</DialogDescription>
        </DialogHeader>

        <form className="grid gap-4 mt-4" onSubmit={handleSubmit}>
          <div className="space-y-1">
            <Label htmlFor="input-name" className="text-sm">Nombre</Label>
            <TextInput id="input-name" value={name} onChange={(e) => setName(e.target.value)} className="w-full" />
            <p className="text-xs text-muted-foreground">Nombre del insumo (ej.: Urea granulada).</p>
          </div>

          <div className="space-y-1">
            <Label htmlFor="input-unit" className="text-sm">Unidad</Label>
            <NativeSelect id="input-unit" value={unit} onChange={(e) => setUnit(e.target.value as InputUnit)} className="w-full">
              <option value="">Seleccionar unidad</option>
              {Object.entries(InputUnitLabels).map(([key, label]) => (
                <option key={key} value={key}>{label}</option>
              ))}
            </NativeSelect>
            <p className="text-xs text-muted-foreground">Unidad de medida que se utilizará para este insumo.</p>
          </div>

          {isEdit ? (
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div className="space-y-1">
                <Label htmlFor="input-stock" className="text-sm">Stock</Label>
                <TextInput id="input-stock" type="number" value={String(stock ?? 0)} disabled className="w-full" />
                <p className="text-xs text-muted-foreground">Cantidad disponible en bodega.</p>
              </div>

              <div className="space-y-1">
                <Label htmlFor="input-cost" className="text-sm">Costo por unidad</Label>
                <TextInput id="input-cost" type="text" value={currencyFormatter.format(costPerUnit ?? 0)} disabled className="w-full" />
                <p className="text-xs text-muted-foreground">Costo de referencia (gestionado desde Compras).</p>
              </div>
            </div>
          ) : (
            <div className="text-sm text-muted-foreground">El stock y el costo se gestionan desde el módulo de Compras.</div>
          )}

          {localError ? <p className="text-sm text-destructive">{localError}</p> : null}

          <div className="flex justify-end gap-2 mt-4">
            <Button type="button" variant="outline" onClick={handleClose}>Cancelar</Button>
            <Button type="submit" disabled={submitting}>{submitting ? 'Guardando...' : isEdit ? 'Guardar cambios' : 'Crear insumo'}</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
