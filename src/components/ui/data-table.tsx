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
import { useState } from 'react'
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

  return (
    <div className="space-y-6">
      {/* Table Controls */}
      <div className="flex items-center justify-between bg-white/50 backdrop-blur-sm rounded-xl p-4 border border-white/30">
        <div className="flex items-center space-x-3">
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
                className="pl-12 pr-4 py-3 bg-white/80 backdrop-blur-sm border-white/30 rounded-xl shadow-sm hover:shadow-md transition-all duration-200 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500/50 max-w-sm"
              />
            </div>
          )}
        </div>
        
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg px-3 py-2 border border-blue-200/50">
            <SlidersHorizontal className="h-4 w-4 text-blue-600" />
            <span className="text-sm font-medium text-blue-800">
              {table.getFilteredRowModel().rows.length} résultat{table.getFilteredRowModel().rows.length !== 1 ? 's' : ''}
            </span>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="rounded-2xl border border-white/30 bg-white/70 backdrop-blur-sm shadow-lg overflow-hidden">
        <table className="w-full">
          <thead>
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id} className="border-b border-gray-200/50 bg-gradient-to-r from-gray-50/80 to-blue-50/80">
                {headerGroup.headers.map((header) => (
                  <th key={header.id} className="h-14 px-6 text-left align-middle font-semibold text-gray-700 text-sm uppercase tracking-wider">
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
                  className={`border-b border-gray-100/50 transition-all duration-200 hover:bg-gradient-to-r hover:from-blue-50/40 hover:to-indigo-50/40 hover:shadow-sm data-[state=selected]:bg-blue-50/60 ${
                    index % 2 === 0 ? 'bg-white/30' : 'bg-gray-50/20'
                  }`}
                >
                  {row.getVisibleCells().map((cell) => (
                    <td key={cell.id} className="p-4 align-middle text-gray-700">
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
                    <div className="w-12 h-12 bg-gradient-to-r from-gray-400 to-gray-500 rounded-full flex items-center justify-center">
                      <Search className="h-6 w-6 text-white" />
                    </div>
                    <p className="text-gray-500 font-medium">Aucun résultat trouvé</p>
                    <p className="text-gray-400 text-sm">Essayez de modifier vos critères de recherche</p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between bg-white/50 backdrop-blur-sm rounded-xl p-4 border border-white/30 shadow-sm">
        <div className="flex items-center space-x-3">
          <span className="text-sm font-medium text-gray-700">Lignes par page</span>
          <select
            value={table.getState().pagination.pageSize}
            onChange={(e) => {
              table.setPageSize(Number(e.target.value))
            }}
            className="h-9 w-16 rounded-lg border border-white/40 bg-white/80 backdrop-blur-sm px-2 text-sm font-medium text-gray-700 shadow-sm hover:shadow-md transition-all duration-200 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500/50"
          >
            {[10, 20, 30, 40, 50].map((pageSize) => (
              <option key={pageSize} value={pageSize}>
                {pageSize}
              </option>
            ))}
          </select>
        </div>
        
        <div className="flex items-center space-x-6 lg:space-x-8">
          <div className="flex items-center justify-center bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg px-4 py-2 border border-blue-200/50">
            <span className="text-sm font-semibold text-blue-800">
              Page {table.getState().pagination.pageIndex + 1} sur {table.getPageCount()}
            </span>
          </div>
          
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              className="hidden h-9 w-9 p-0 lg:flex bg-white/80 backdrop-blur-sm border-white/40 hover:bg-blue-50 hover:border-blue-300/50 transition-all duration-200 shadow-sm hover:shadow-md"
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
              className="hidden h-9 w-9 p-0 lg:flex bg-white/80 backdrop-blur-sm border-white/40 hover:bg-blue-50 hover:border-blue-300/50 transition-all duration-200 shadow-sm hover:shadow-md"
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