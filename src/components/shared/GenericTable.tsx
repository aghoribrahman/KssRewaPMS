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
    <Card className="rounded-2xl border-none premium-shadow overflow-hidden bg-white/50 backdrop-blur-md">
      <CardHeader className="p-4 pb-2 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="space-y-0.5">
          <CardTitle className="text-sm font-black text-neutral-900">{title}</CardTitle>
          {description && (
            <CardDescription className="text-neutral-500 text-[10px] font-medium">
              {description}
            </CardDescription>
          )}
        </div>

        {onSearchChange && (
          <div className="flex items-center gap-3 w-full md:w-auto">
            <div className="relative w-full md:w-64 group">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-neutral-400 group-focus-within:text-primary transition-colors" />
              <input
                placeholder={searchPlaceholder || "Search..."}
                className="w-full pl-9 pr-3 rounded-lg border border-neutral-100 bg-neutral-100/50 focus:bg-white focus:ring-4 focus:ring-primary/10 h-9 text-[11px] font-medium transition-all outline-none"
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
              />
            </div>
          </div>
        )}
      </CardHeader>
      
      <CardContent className="p-0 sm:p-4 pt-0">
        {/* Desktop Table View */}
        <div className="hidden md:block overflow-x-auto">
          <Table className="min-w-[900px]">
            <TableHeader>
              <TableRow className="border-none hover:bg-transparent">
                {columns.map((col, i) => (
                  <TableHead 
                    key={i} 
                    className={`py-3 text-neutral-400 font-bold uppercase tracking-wider text-[9px] ${i === 0 ? 'pl-4' : ''} ${i === columns.length - 1 ? 'pr-4 text-right' : ''} ${col.headerClassName || ''}`}
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
                  className={`group border-none hover:bg-neutral-50 transition-colors duration-100 ${onRowClick ? 'cursor-pointer' : ''}`}
                  onClick={() => onRowClick?.(item)}
                >
                  {columns.map((col, i) => (
                    <TableCell 
                      key={i} 
                      className={`py-2.5 ${i === 0 ? 'pl-4' : ''} ${i === columns.length - 1 ? 'pr-4 text-right' : ''} ${col.className || ''}`}
                    >
                      {typeof col.accessor === 'function' ? col.accessor(item) : (item[col.accessor] as React.ReactNode)}
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {/* Mobile Card View */}
        <div className="md:hidden space-y-3 p-4">
          {data.map((item) => (
            <div 
              key={item.id} 
              className="bg-white rounded-2xl p-4 shadow-sm border border-neutral-100 space-y-3 active:scale-[0.98] transition-transform duration-100"
              onClick={() => onRowClick?.(item)}
            >
              {columns.map((col, i) => {
                if (col.header === 'Actions' || col.header === 'Action' || col.header === 'Media' || col.header === 'Progress') {
                   return (
                     <div key={i} className="flex justify-between items-center pt-2 border-t border-neutral-50">
                        <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest">{col.header}</span>
                        <div>{typeof col.accessor === 'function' ? col.accessor(item) : (item[col.accessor] as React.ReactNode)}</div>
                     </div>
                   );
                }
                if (i === 0) {
                  return (
                    <div key={i} className="flex justify-between items-start">
                      <div className="text-sm font-bold text-neutral-900">
                        {typeof col.accessor === 'function' ? col.accessor(item) : (item[col.accessor] as React.ReactNode)}
                      </div>
                    </div>
                  );
                }
                return (
                  <div key={i} className="flex justify-between items-center text-xs">
                    <span className="text-neutral-500 font-medium">{col.header}</span>
                    <div className="font-semibold text-neutral-900">
                      {typeof col.accessor === 'function' ? col.accessor(item) : (item[col.accessor] as React.ReactNode)}
                    </div>
                  </div>
                );
              })}
            </div>
          ))}
        </div>

        {data.length === 0 && (
          <div className="p-8 text-center">
            {emptyState || <p className="text-neutral-400 text-xs italic">No records found</p>}
          </div>
        )}

        <div className="p-4 pt-0">
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={onPageChange}
            totalItems={totalItems}
            itemsPerPage={itemsPerPage}
            className="mt-4 md:mt-8"
          />
        </div>
      </CardContent>
    </Card>
  );
}
