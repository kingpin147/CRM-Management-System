'use client'

import * as React from 'react'
import {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  flexRender,
  createFilteredRowModel,
  createPaginatedRowModel,
  createSortedRowModel,
  useTable,
  tableFeatures,
  stockFeatures,
  filterFn_includesString,
  filterFns,
} from '@tanstack/react-table'

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

interface DataTableProps<TData extends Record<string, any>> {
  columns: ColumnDef<any, TData, any>[]
  data: TData[]
  searchKey: string
  searchPlaceholder?: string
}

export function DataTable<TData extends Record<string, any>>({
  columns,
  data,
  searchKey,
  searchPlaceholder = 'Search...',
}: DataTableProps<TData>) {
  const [sorting, setSorting] = React.useState<SortingState>([])
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([])
  const [searchValue, setSearchValue] = React.useState<string>('')

  // Filter data across all properties and nested objects
  const filteredData = React.useMemo(() => {
    if (!searchValue.trim()) return data
    const query = searchValue.toLowerCase().trim()

    return data.filter((item) => {
      // Check searchKey first
      if (searchKey && item[searchKey] && String(item[searchKey]).toLowerCase().includes(query)) {
        return true
      }
      // Check entire object JSON values for universal matching (Name, City, Code, Ticket ID, Description, Phone, etc.)
      const flatValues = Object.values(item)
        .map((v) => (typeof v === 'object' && v !== null ? JSON.stringify(v) : String(v ?? '')))
        .join(' ')
        .toLowerCase()
      return flatValues.includes(query)
    })
  }, [data, searchValue, searchKey])

  const features = tableFeatures({
    ...stockFeatures,
    filterFns: {
      ...filterFns,
      includesString: filterFn_includesString,
    },
    filteredRowModel: createFilteredRowModel(),
    sortedRowModel: createSortedRowModel(),
    paginatedRowModel: createPaginatedRowModel(),
  })

  const table = useTable({
    data: filteredData,
    columns,
    features,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    state: {
      sorting,
      columnFilters,
    },
  })

  return (
    <div className="min-w-0 w-full">
      <div className="flex items-center py-4">
        <Input
          placeholder={searchPlaceholder}
          value={searchValue}
          onChange={(event) => setSearchValue(event.target.value)}
          className="max-w-sm border-[var(--color-line)] focus-visible:ring-[var(--color-amber)]"
        />
      </div>
      <div className="rounded-md border border-[var(--color-line)] bg-white overflow-hidden shadow-sm">
        <Table>
          <TableHeader className="bg-[var(--color-paper)]">
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id} className="text-[var(--color-graphite)] font-semibold">
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </TableHead>
                  )
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected?.() && "selected"}
                  className="hover:bg-[var(--color-paper)]/50"
                >
                  {(row.getVisibleCells?.() ?? row.getAllCells?.() ?? []).map((cell: any) => (
                    <TableCell key={cell.id}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center text-[var(--color-slate-custom)]">
                  No results found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <div className="flex items-center justify-end space-x-2 py-4">
        <Button
          variant="outline"
          size="sm"
          onClick={() => table.previousPage()}
          disabled={!table.getCanPreviousPage()}
          className="border-[var(--color-line)] text-[var(--color-ink)]"
        >
          Previous
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => table.nextPage()}
          disabled={!table.getCanNextPage()}
          className="border-[var(--color-line)] text-[var(--color-ink)]"
        >
          Next
        </Button>
      </div>
    </div>
  )
}
