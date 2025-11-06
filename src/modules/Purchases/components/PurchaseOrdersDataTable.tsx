// src/modules/Purchases/components/PurchaseOrdersDataTable.tsx

import { useState } from "react";
import type {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  VisibilityState,
} from "@tanstack/react-table";
import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { StatusBadge } from "./StatusBadge";
import type { PurchaseOrder } from "../types";
import { PurchaseOrderStatus } from "../types";
import {
  Eye,
  Edit,
  Trash2,
  PackageCheck,
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { NativeSelect } from "@/components/ui/native-select";

interface PurchaseOrdersDataTableProps {
  data: PurchaseOrder[];
  onView: (order: PurchaseOrder) => void;
  onEdit: (order: PurchaseOrder) => void;
  onDelete: (order: PurchaseOrder) => void;
  onReceive?: (order: PurchaseOrder) => void;
}

export function PurchaseOrdersDataTable({
  data,
  onView,
  onEdit,
  onDelete,
  onReceive,
}: PurchaseOrdersDataTableProps) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [globalFilter, setGlobalFilter] = useState("");

  const columns: ColumnDef<PurchaseOrder>[] = [
    {
      accessorKey: "code",
      header: ({ column }: any) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Código
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        );
      },
      cell: ({ row }: any) => {
        const code = row.getValue("code") as string;
        return <div className="font-medium">{code || `#${row.original.id?.substring(0, 8)}`}</div>;
      },
    },
    {
      accessorKey: "createdAt",
      header: ({ column }: any) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Fecha
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        );
      },
      cell: ({ row }: any) => {
        const date = row.getValue("createdAt") as string;
        return date ? new Date(date).toLocaleDateString("es-ES") : "N/A";
      },
    },
    {
      accessorKey: "supplier.name",
      header: ({ column }: any) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Proveedor
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        );
      },
      cell: ({ row }: any) => {
        return <div>{row.original.supplier?.name || "N/A"}</div>;
      },
    },
    {
      accessorKey: "status",
      header: "Estado",
      cell: ({ row }: any) => {
        return <StatusBadge status={row.getValue("status")} />;
      },
      filterFn: (row: any, id: any, value: any) => {
        return value === "" || value === row.getValue(id);
      },
    },
    {
      id: "items",
      header: "Items",
      cell: ({ row }: any) => {
        const totalItems = row.original.details?.length || 0;
        return <div className="text-center">{totalItems}</div>;
      },
    },
    {
      accessorKey: "expectedDeliveryDate",
      header: "Entrega estimada",
      cell: ({ row }: any) => {
        const date = row.getValue("expectedDeliveryDate") as string;
        return date ? new Date(date).toLocaleDateString("es-ES") : "N/A";
      },
    },
    {
      accessorKey: "createdByName",
      header: "Creado por",
      cell: ({ row }: any) => {
        return row.getValue("createdByName") || "N/A";
      },
    },
    {
      id: "actions",
      header: "Acciones",
      enableHiding: false,
      cell: ({ row }: any) => {
        const order = row.original;
        const canReceive =
          order.status === PurchaseOrderStatus.APROBADA ||
          order.status === PurchaseOrderStatus.RECIBIDA_PARCIAL;
        const canEdit = order.status === PurchaseOrderStatus.PENDIENTE;

        return (
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => onView(order)}
              title="Ver detalles"
            >
              <Eye className="h-4 w-4" />
            </Button>
            
            {canEdit && (
              <>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => onEdit(order)}
                  title="Editar"
                >
                  <Edit className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-destructive hover:text-destructive"
                  onClick={() => onDelete(order)}
                  title="Eliminar"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </>
            )}
            
            {canReceive && onReceive && (
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-green-600 hover:text-green-700"
                onClick={() => onReceive(order)}
                title="Recibir mercancía"
              >
                <PackageCheck className="h-4 w-4" />
              </Button>
            )}
          </div>
        );
      },
    },
  ];

  const table = useReactTable({
    data,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onGlobalFilterChange: setGlobalFilter,
    globalFilterFn: "includesString",
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      globalFilter,
    },
  });

  return (
    <div className="w-full space-y-4">
      {/* Filtros */}
      <div className="flex items-center gap-4">
        <Input
          placeholder="Buscar por código, proveedor..."
          value={globalFilter ?? ""}
          onChange={(event) => setGlobalFilter(event.target.value)}
          className="max-w-sm"
        />
        <NativeSelect
          value={(table.getColumn("status")?.getFilterValue() as string) ?? ""}
          onChange={(event) =>
            table.getColumn("status")?.setFilterValue(event.target.value)
          }
        >
          <option value="">Todos los estados</option>
          <option value={PurchaseOrderStatus.PENDIENTE}>Pendiente</option>
          <option value={PurchaseOrderStatus.APROBADA}>Aprobada</option>
          <option value={PurchaseOrderStatus.RECIBIDA}>Recibida</option>
          <option value={PurchaseOrderStatus.RECIBIDA_PARCIAL}>
            Recibida Parcial
          </option>
          <option value={PurchaseOrderStatus.CERRADA}>Cerrada</option>
          <option value={PurchaseOrderStatus.CANCELADA}>Cancelada</option>
        </NativeSelect>
      </div>

      {/* Tabla */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup: any) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header: any) => {
                  return (
                    <TableHead key={header.id}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row: any) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                >
                  {row.getVisibleCells().map((cell: any) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  No se encontraron resultados.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Paginación */}
      <div className="flex items-center justify-between px-2">
        <div className="flex-1 text-sm text-muted-foreground">
          {table.getFilteredRowModel().rows.length} orden(es) en total.
        </div>
        <div className="flex items-center space-x-6 lg:space-x-8">
          <div className="flex items-center space-x-2">
            <p className="text-sm font-medium">Filas por página</p>
            <NativeSelect
              value={`${table.getState().pagination.pageSize}`}
              onChange={(e) => {
                table.setPageSize(Number(e.target.value));
              }}
            >
              {[10, 20, 30, 40, 50].map((pageSize) => (
                <option key={pageSize} value={pageSize}>
                  {pageSize}
                </option>
              ))}
            </NativeSelect>
          </div>
          <div className="flex w-[100px] items-center justify-center text-sm font-medium">
            Página {table.getState().pagination.pageIndex + 1} de{" "}
            {table.getPageCount()}
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              className="h-8 w-8 p-0"
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
            >
              <span className="sr-only">Anterior</span>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              className="h-8 w-8 p-0"
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
            >
              <span className="sr-only">Siguiente</span>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
