'use client';

import { useState, useMemo } from 'react';
import { ArrowUpDown, ChevronLeft, ChevronRight, Download } from 'lucide-react';
import { cn } from '../../lib/utils';
import { Button } from './Button';
import { Skeleton } from './Skeleton';

export interface Column<T> {
  key: keyof T | string;
  header: string;
  sortable?: boolean;
  render?: (row: T) => React.ReactNode;
}

export interface DataTableProps<T> {
  data: T[];
  columns: Column<T>[];
  loading?: boolean;
  defaultSortKey?: string;
  searchPlaceholder?: string;
}

export function DataTable<T extends Record<string, any>>({
  data,
  columns,
  loading = false,
  defaultSortKey = '',
  searchPlaceholder = 'Search...'
}: DataTableProps<T>): JSX.Element {
  const [sortKey, setSortKey] = useState<string>(defaultSortKey);
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');

  const itemsPerPage = 10;

  // Search logic
  const filteredData = useMemo(() => {
    if (!searchQuery) return data;
    return data.filter((row) =>
      Object.values(row).some((val) => {
        if (typeof val === 'string' || typeof val === 'number') {
          return val.toString().toLowerCase().includes(searchQuery.toLowerCase());
        }
        if (typeof val === 'object' && val !== null && 'name' in val) {
          return (val as { name: string }).name.toLowerCase().includes(searchQuery.toLowerCase());
        }
        return false;
      })
    );
  }, [data, searchQuery]);

  // Sort logic
  const sortedData = useMemo(() => {
    if (!sortKey) return filteredData;
    const sorted = [...filteredData];
    sorted.sort((a, b) => {
      let valA = a[sortKey];
      let valB = b[sortKey];

      // Handle user name nested sort
      if (sortKey === 'user' && typeof valA === 'object') valA = valA.name;
      if (sortKey === 'user' && typeof valB === 'object') valB = valB.name;

      if (valA === undefined || valA === null) return 1;
      if (valB === undefined || valB === null) return -1;

      if (typeof valA === 'string') {
        return sortOrder === 'asc' ? valA.localeCompare(valB) : valB.localeCompare(valA);
      }
      return sortOrder === 'asc' ? valA - valB : valB - valA;
    });
    return sorted;
  }, [filteredData, sortKey, sortOrder]);

  // Paginated logic
  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return sortedData.slice(start, start + itemsPerPage);
  }, [sortedData, currentPage]);

  const totalPages = Math.ceil(sortedData.length / itemsPerPage);

  const handleSort = (key: string) => {
    if (sortKey === key) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortKey(key);
      setSortOrder('asc');
    }
    setCurrentPage(1);
  };

  const handleExportCSV = () => {
    const csvRows = [];
    // Get headers
    const headers = columns.map((col) => col.header);
    csvRows.push(headers.join(','));

    // Get row data
    for (const row of sortedData) {
      const values = columns.map((col) => {
        let val = row[col.key as string];
        if (col.key === 'user' && typeof val === 'object') {
          val = val.name;
        }
        const escaped = ('' + val).replace(/"/g, '\\"');
        return `"${escaped}"`;
      });
      csvRows.push(values.join(','));
    }

    const csvContent = 'data:text/csv;charset=utf-8,' + csvRows.join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', 'recent_activity.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-4">
      {/* Table Actions Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <input
          type="text"
          placeholder={searchPlaceholder}
          value={searchQuery}
          onChange={(e) => {
            setSearchQuery(e.target.value);
            setCurrentPage(1);
          }}
          className="w-full sm:max-w-xs rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-surface-card-dark px-4 py-2.5 text-sm text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/50 transition duration-150"
        />
        <Button
          variant="outline"
          size="sm"
          onClick={handleExportCSV}
          disabled={data.length === 0}
          leftIcon={<Download className="h-4 w-4" />}
          className="w-fit"
        >
          Export CSV
        </Button>
      </div>

      {/* Table Body Card */}
      <div className="overflow-x-auto rounded-2xl border border-slate-200/80 dark:border-white/5 bg-white dark:bg-surface-card-dark shadow-sm">
        <table className="w-full border-collapse text-left text-sm text-slate-500 dark:text-slate-400">
          <thead className="bg-slate-50 dark:bg-slate-900/50 text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider border-b border-slate-100 dark:border-white/5">
            <tr>
              {columns.map((col) => (
                <th key={col.header} className="px-6 py-4 font-semibold select-none">
                  {col.sortable ? (
                    <button
                      onClick={() => handleSort(col.key as string)}
                      className="flex items-center gap-1.5 hover:text-slate-800 dark:hover:text-slate-100 transition-colors"
                    >
                      {col.header}
                      <ArrowUpDown className="h-3.5 w-3.5" />
                    </button>
                  ) : (
                    col.header
                  )}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-white/5">
            {loading ? (
              // Skeleton rows
              Array.from({ length: 5 }).map((_, rIndex) => (
                <tr key={rIndex}>
                  {columns.map((col, cIndex) => (
                    <td key={cIndex} className="px-6 py-4.5">
                      <Skeleton className="h-5 w-full max-w-[120px]" />
                    </td>
                  ))}
                </tr>
              ))
            ) : paginatedData.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="px-6 py-10 text-center text-slate-400">
                  No records found
                </td>
              </tr>
            ) : (
              paginatedData.map((row, rIndex) => (
                <tr
                  key={row.id || rIndex}
                  className="hover:bg-slate-50/50 dark:hover:bg-white/5 transition-colors duration-150"
                >
                  {columns.map((col) => (
                    <td key={col.header} className="px-6 py-4.5 text-slate-700 dark:text-slate-350">
                      {col.render ? col.render(row) : row[col.key as string]}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination controls */}
      {!loading && totalPages > 1 && (
        <div className="flex items-center justify-between px-2">
          <p className="text-xs font-semibold text-slate-450 dark:text-slate-500">
            Showing <span className="font-mono text-slate-700 dark:text-slate-300">{(currentPage - 1) * itemsPerPage + 1}</span> to{' '}
            <span className="font-mono text-slate-700 dark:text-slate-300">
              {Math.min(currentPage * itemsPerPage, sortedData.length)}
            </span>{' '}
            of <span className="font-mono text-slate-700 dark:text-slate-300">{sortedData.length}</span> entries
          </p>
          <div className="flex items-center gap-1.5">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
              disabled={currentPage === 1}
              className="h-8.5 w-8.5 p-0"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="text-xs font-mono font-bold text-slate-700 dark:text-slate-300 px-2 select-none">
              {currentPage} / {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="h-8.5 w-8.5 p-0"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
