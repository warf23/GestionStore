'use client'

import {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  VisibilityState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from '@tanstack/react-table'
import { useMemo, useState } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { 
  ChevronDown, 
  ChevronLeft, 
  ChevronRight, 
  ChevronsLeft, 
  ChevronsRight,
  Search,
  SlidersHorizontal
} from 'lucide-react'

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[]
  data: TData[]
  searchKey?: string
  searchPlaceholder?: string
}

export function DataTable<TData, TValue>({
  columns,
  data,
  searchKey,
  searchPlaceholder = "Rechercher...",
}: DataTableProps<TData, TValue>) {
  const [sorting, setSorting] = useState<SortingState>([])
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({})
  const [rowSelection, setRowSelection] = useState({})

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
    onRowSelectionChange: setRowSelection,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
    },
  })

  const isLoadingLike = table.getState().pagination.pageSize === 0

  return (
    <div className="space-y-6">
      {/* Table Controls */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between rounded-xl border bg-card p-4 shadow-sm">
        <div className="flex items-center space-x-3 w-full sm:w-auto">
          {searchKey && (
            <div className="relative">
              <div className="absolute left-3 top-1/2 -translate-y-1/2 p-1 bg-blue-500 rounded-md">
                <Search className="h-3 w-3 text-white" />
              </div>
              <Input
                placeholder={searchPlaceholder}
                value={(table.getColumn(searchKey)?.getFilterValue() as string) ?? ""}
                onChange={(event) =>
                  table.getColumn(searchKey)?.setFilterValue(event.target.value)
                }
                className="pl-12 pr-4 py-3 bg-white/80 backdrop-blur-sm border-white/30 rounded-xl shadow-sm hover:shadow-md transition-all duration-200 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500/50 w-full sm:max-w-sm"
              />
            </div>
          )}
        </div>
        
        <div className="flex items-center space-x-4 text-sm text-muted-foreground">
          <SlidersHorizontal className="h-4 w-4" />
          <span>
            {table.getFilteredRowModel().rows.length} résultat{table.getFilteredRowModel().rows.length !== 1 ? 's' : ''}
          </span>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-xl border bg-card shadow-sm">
        <table className="w-full min-w-[640px] sm:min-w-full">
          <thead>
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id} className="border-b bg-muted/40">
                {headerGroup.headers.map((header) => (
                  <th key={header.id} className="h-12 px-6 text-left align-middle text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row, index) => (
                <tr
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                  className="border-b transition-colors hover:bg-muted/40"
                >
                  {row.getVisibleCells().map((cell) => (
                    <td key={cell.id} className="p-4 align-middle">
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </td>
                  ))}
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan={columns.length}
                  className="h-32 text-center"
                >
                  <div className="flex flex-col items-center justify-center space-y-3">
                    <Search className="h-6 w-6 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">Aucun résultat trouvé</p>
                    <p className="text-xs text-muted-foreground">Essayez de modifier vos critères de recherche</p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between rounded-xl border bg-card p-4 shadow-sm">
        <div className="flex items-center space-x-3">
          <span className="text-sm font-medium text-gray-700">Lignes par page</span>
          <select
            value={table.getState().pagination.pageSize}
            onChange={(e) => {
              table.setPageSize(Number(e.target.value))
            }}
            className="h-9 w-20 rounded-md border bg-background px-2 text-sm"
          >
            {[10, 20, 30, 40, 50].map((pageSize) => (
              <option key={pageSize} value={pageSize}>
                {pageSize}
              </option>
            ))}
          </select>
        </div>
        
        <div className="flex items-center space-x-4 sm:space-x-6 lg:space-x-8">
          <div className="hidden sm:flex items-center justify-center rounded-md border px-3 sm:px-4 py-2 text-xs sm:text-sm text-muted-foreground">
            Page {table.getState().pagination.pageIndex + 1} sur {table.getPageCount()}
          </div>
          
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              className="hidden h-9 w-9 p-0 sm:flex bg-white/80 backdrop-blur-sm border-white/40 hover:bg-blue-50 hover:border-blue-300/50 transition-all duration-200 shadow-sm hover:shadow-md"
              onClick={() => table.setPageIndex(0)}
              disabled={!table.getCanPreviousPage()}
            >
              <ChevronsLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              className="h-9 w-9 p-0 bg-white/80 backdrop-blur-sm border-white/40 hover:bg-blue-50 hover:border-blue-300/50 transition-all duration-200 shadow-sm hover:shadow-md"
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              className="h-9 w-9 p-0 bg-white/80 backdrop-blur-sm border-white/40 hover:bg-blue-50 hover:border-blue-300/50 transition-all duration-200 shadow-sm hover:shadow-md"
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              className="hidden h-9 w-9 p-0 sm:flex bg-white/80 backdrop-blur-sm border-white/40 hover:bg-blue-50 hover:border-blue-300/50 transition-all duration-200 shadow-sm hover:shadow-md"
              onClick={() => table.setPageIndex(table.getPageCount() - 1)}
              disabled={!table.getCanNextPage()}
            >
              <ChevronsRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}