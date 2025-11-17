import { useMemo, useState } from 'react'
import type { FormEvent } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { cn } from '@/lib/utils'

const currencyFormatter = new Intl.NumberFormat('es-AR', {
  style: 'currency',
  currency: 'ARS',
  minimumFractionDigits: 0,
  maximumFractionDigits: 2,
})

type InputItem = {
  id: string
  name: string
  unit: string
  stock: number
  costPerUnit: number
}

const INITIAL_INPUTS: InputItem[] = [
  {
    id: 'starter-1',
    name: 'Glifosato',
    unit: 'L',
    stock: 180,
    costPerUnit: 12_500,
  },
  {
    id: 'starter-2',
    name: 'Urea granulada',
    unit: 'KG',
    stock: 45,
    costPerUnit: 9_800,
  },
]

export default function InputsInventoryPage() {
  const [items, setItems] = useState<InputItem[]>(INITIAL_INPUTS)
  const [name, setName] = useState('')
  const [unit, setUnit] = useState('')
  const [error, setError] = useState<string | null>(null)

  const totalItems = useMemo(() => items.length, [items])

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!name.trim() || !unit.trim()) {
      setError('Completá el nombre y la unidad del insumo.')
      return
    }

    const generatedId =
      typeof crypto !== 'undefined' && crypto.randomUUID
        ? crypto.randomUUID()
        : Date.now().toString()

    setItems((previous) => [
      {
        id: generatedId,
        name: name.trim(),
        unit: unit.trim().toUpperCase(),
        stock: 0,
        costPerUnit: 0,
      },
      ...previous,
    ])

    setName('')
    setUnit('')
    setError(null)
  }

  return (
    <div className="container mx-auto flex flex-col gap-6 py-10">
      <header className="flex flex-col gap-2">
        <p className="text-sm font-medium text-muted-foreground">Inventario</p>
        <h1 className="text-3xl font-bold">Bodega de insumos</h1>
        <p className="text-muted-foreground">
          Registrá nuevos insumos y consultá su stock y costo de referencia.
        </p>
      </header>

      <Card>
        <CardHeader>
          <CardTitle>Nuevo insumo</CardTitle>
          <CardDescription>Solo necesitamos el nombre y la unidad.</CardDescription>
        </CardHeader>
        <CardContent>
          <form
            className="flex flex-col gap-4 md:flex-row"
            onSubmit={handleSubmit}
            noValidate
          >
            <div className="flex-1 space-y-2">
              <Label htmlFor="input-name" className="block">
                Nombre
              </Label>
              <Input
                id="input-name"
                placeholder="Ej: Urea"
                value={name}
                onChange={(event) => setName(event.target.value)}
              />
            </div>
            <div className="w-full space-y-2 md:w-40">
              <Label htmlFor="input-unit" className="block">
                Unidad
              </Label>
              <Input
                id="input-unit"
                placeholder="Kg, L, Lts"
                value={unit}
                onChange={(event) => setUnit(event.target.value)}
              />
            </div>
            <div className="flex items-end">
              <Button type="submit" className="w-full md:w-auto">
                Guardar insumo
              </Button>
            </div>
          </form>
          {error ? (
            <p className="mt-2 text-sm text-destructive">{error}</p>
          ) : null}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Listado de insumos</CardTitle>
          <CardDescription>
            {totalItems === 0
              ? 'Todavía no hay insumos cargados.'
              : `${totalItems} insumo${totalItems === 1 ? '' : 's'} registrados.`}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nombre</TableHead>
                <TableHead>Unidad</TableHead>
                <TableHead>Stock</TableHead>
                <TableHead>Costo por unidad</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center text-muted-foreground">
                    No hay insumos cargados. Usá el formulario para crear el primero.
                  </TableCell>
                </TableRow>
              ) : (
                items.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="font-medium">{item.name}</TableCell>
                    <TableCell>{item.unit}</TableCell>
                    <TableCell>
                      <span className={cn('font-semibold', item.stock === 0 && 'text-muted-foreground')}>
                        {item.stock}
                      </span>
                    </TableCell>
                    <TableCell>{currencyFormatter.format(item.costPerUnit)}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
