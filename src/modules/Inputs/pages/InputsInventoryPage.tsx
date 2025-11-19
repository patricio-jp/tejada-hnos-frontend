import { useMemo, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import InputFormDialog from '../components/InputFormDialog'
import { toast } from 'sonner'
import { InputUnitLabels } from '@/types'
import { AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogAction, AlertDialogCancel } from '@/components/ui/alert-dialog'
import { Pencil, Trash2, Plus } from 'lucide-react'
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
import useInputs from '../hooks/useInputs'

const currencyFormatter = new Intl.NumberFormat('es-AR', {
  style: 'currency',
  currency: 'ARS',
  minimumFractionDigits: 0,
  maximumFractionDigits: 2,
})

export default function InputsInventoryPage() {
  const { inputs: items, loading, error: fetchError, createInput, updateInput, deleteInput } = useInputs()
  const [searchTerm, setSearchTerm] = useState('')
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editing, setEditing] = useState<any | null>(null)
  const [itemToDelete, setItemToDelete] = useState<any | null>(null)

  const totalItems = useMemo(() => items.length, [items])

  const handleCreate = async (data: any) => {
    try {
      await createInput(data)
    } catch (err) {
      // error handled inside hook, but surface if needed
      console.error(err)
    }
  }

  const handleUpdate = async (id: string, data: any) => {
    try {
      await updateInput(id, data)
    } catch (err) {
      console.error(err)
    }
  }

  const handleDelete = async (id: string) => {
    try {
      await deleteInput(id)
      setItemToDelete(null)
      toast.success('Insumo eliminado')
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Error al eliminar insumo'
      toast.error(msg)
      console.error(err)
    }
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
          <div className="flex items-center justify-between w-full">
            <div>
              <CardTitle>Insumos</CardTitle>
              <CardDescription>Buscá o agregá un nuevo insumo.</CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-64">
                <Label htmlFor="search" className="sr-only">Buscar</Label>
                <Input id="search" placeholder="Buscar por nombre o unidad" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
              </div>
              <InputFormDialog
                trigger={
                  <Button variant="default" size="sm" onClick={() => { setEditing(null); setDialogOpen(true) }}>
                    <Plus className="mr-2" /> Nuevo
                  </Button>
                }
                open={dialogOpen}
                onOpenChange={(v) => setDialogOpen(v)}
                initial={editing}
                onSubmit={async (payload) => {
                  if (editing) {
                    await handleUpdate(editing.id, payload)
                  } else {
                    await handleCreate(payload)
                  }
                }}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {fetchError ? (
            <p className="mb-4 text-sm text-destructive">{fetchError}</p>
          ) : null}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Listado de insumos</CardTitle>
            <CardDescription>
              {loading
                ? 'Cargando insumos...'
                : totalItems === 0
                ? 'Todavía no hay insumos cargados.'
                : `${totalItems} insumo${totalItems === 1 ? '' : 's'} registrados.`}
            </CardDescription>
        </CardHeader>
        <CardContent>
          {fetchError ? (
            <p className="mb-4 text-sm text-destructive">{fetchError}</p>
          ) : null}
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nombre</TableHead>
                <TableHead>Unidad</TableHead>
                <TableHead>Stock</TableHead>
                <TableHead>Costo por unidad</TableHead>
                <TableHead>Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {
                // apply client-side search filter
              }
              {items.filter(i => {
                const term = searchTerm.trim().toLowerCase()
                if (!term) return true
                return i.name.toLowerCase().includes(term) || String(i.unit).toLowerCase().includes(term)
              }).length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-muted-foreground">
                    {loading ? 'Cargando...' : 'No hay insumos que coincidan.'}
                  </TableCell>
                </TableRow>
              ) : (
                items.filter(i => {
                  const term = searchTerm.trim().toLowerCase()
                  if (!term) return true
                  return i.name.toLowerCase().includes(term) || String(i.unit).toLowerCase().includes(term)
                }).map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="font-medium">{item.name}</TableCell>
                    <TableCell>{(item.unit && (InputUnitLabels as any)[item.unit]) || item.unit}</TableCell>
                    <TableCell>
                      <span className={cn('font-semibold', item.stock === 0 && 'text-muted-foreground')}>
                        {item.stock ?? '-'}
                      </span>
                    </TableCell>
                    <TableCell>{
                      item.costPerUnit !== undefined && item.costPerUnit !== null
                        ? currencyFormatter.format(item.costPerUnit)
                        : '-'
                    }</TableCell>
                            <TableCell>
                              <div className="flex gap-2">
                                <Button variant="outline" size="sm" onClick={() => { setEditing(item); setDialogOpen(true) }}>
                                  <Pencil className="h-4 w-4" />
                                </Button>

                                <Button variant="outline" size="sm" onClick={() => setItemToDelete(item)}>
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
                  {/* Delete confirmation dialog (single instance) */}
                  <AlertDialog open={!!itemToDelete} onOpenChange={(v) => { if (!v) setItemToDelete(null) }}>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
                        <AlertDialogDescription>Se eliminará el insumo "{itemToDelete?.name}" y esta acción no se puede deshacer.</AlertDialogDescription>
                      </AlertDialogHeader>
                      <div className="flex justify-end gap-2">
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction onClick={() => itemToDelete && handleDelete(itemToDelete.id)}>Eliminar</AlertDialogAction>
                      </div>
                    </AlertDialogContent>
                  </AlertDialog>
        </CardContent>
      </Card>
    </div>
  )
}
