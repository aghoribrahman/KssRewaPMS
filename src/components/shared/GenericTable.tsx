import * as React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';
import { Pagination } from './Pagination';

export interface Column<T> {
  header: string;
  accessor: keyof T | ((item: T) => React.ReactNode);
  className?: string;
  headerClassName?: string;
}

interface GenericTableProps<T> {
  title: string;
  description?: string;
  data: T[];
  columns: Column<T>[];
  searchQuery?: string;
  onSearchChange?: (val: string) => void;
  searchPlaceholder?: string;
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  itemsPerPage: number;
  totalItems: number;
  onRowClick?: (item: T) => void;
  emptyState?: React.ReactNode;
}

export function GenericTable<T extends { id: string }>({
  title,
  description,
  data,
  columns,
  searchQuery,
  onSearchChange,
  searchPlaceholder,
  currentPage,
  totalPages,
  onPageChange,
  itemsPerPage,
  totalItems,
  onRowClick,
  emptyState,
}: GenericTableProps<T>) {
  return (
    <Card className="rounded-[2.5rem] border-none premium-shadow overflow-hidden bg-white/50 backdrop-blur-md">
      <CardHeader className="p-8 pb-4 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="space-y-1">
          <CardTitle className="text-lg font-black text-neutral-900">{title}</CardTitle>
          {description && (
            <CardDescription className="text-neutral-500 text-xs font-medium">
              {description}
            </CardDescription>
          )}
        </div>

        {onSearchChange && (
          <div className="flex items-center gap-4 w-full md:w-auto">
            <div className="relative w-full md:w-80 group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400 group-focus-within:text-primary transition-colors" />
              <Input
                placeholder={searchPlaceholder || "Search..."}
                className="pl-12 pr-4 rounded-2xl border-neutral-100 bg-neutral-100/50 focus:bg-white focus:ring-4 focus:ring-primary/10 h-12 text-sm font-medium transition-all"
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
              />
            </div>
          </div>
        )}
      </CardHeader>
      
      <CardContent className="p-4 pt-0">
        <div className="overflow-x-auto">
          <Table className="min-w-[900px]">
            <TableHeader>
              <TableRow className="border-none hover:bg-transparent">
                {columns.map((col, i) => (
                  <TableHead 
                    key={i} 
                    className={`py-6 text-neutral-400 font-bold uppercase tracking-wider text-[10px] ${i === 0 ? 'pl-8' : ''} ${i === columns.length - 1 ? 'pr-8 text-right' : ''} ${col.headerClassName || ''}`}
                  >
                    {col.header}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.map((item) => (
                <TableRow 
                  key={item.id} 
                  className={`group border-none hover:bg-neutral-50 transition-colors duration-200 ${onRowClick ? 'cursor-pointer' : ''}`}
                  onClick={() => onRowClick?.(item)}
                >
                  {columns.map((col, i) => (
                    <TableCell 
                      key={i} 
                      className={`py-5 ${i === 0 ? 'pl-8' : ''} ${i === columns.length - 1 ? 'pr-8 text-right' : ''} ${col.className || ''}`}
                    >
                      {typeof col.accessor === 'function' ? col.accessor(item) : (item[col.accessor] as React.ReactNode)}
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {data.length === 0 && emptyState}

        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={onPageChange}
          totalItems={totalItems}
          itemsPerPage={itemsPerPage}
          className="mt-8"
        />
      </CardContent>
    </Card>
  );
}
