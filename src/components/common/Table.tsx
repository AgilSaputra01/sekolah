import React from 'react';
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';

export interface Column<T> {
  header: string;
  accessor?: keyof T | string;
  render?: (item: T, index: number) => React.ReactNode;
  width?: string;
  align?: 'left' | 'center' | 'right';
}

interface TableProps<T> {
  columns: Column<T>[];
  data: T[];
  loading?: boolean;
  emptyState?: React.ReactNode;
  keyExtractor: (item: T) => string;
}

export function Table<T>({
  columns,
  data,
  loading = false,
  emptyState,
  keyExtractor,
}: TableProps<T>) {
  if (loading) {
    return (
      <div className="table-responsive">
        <table className="table">
          <thead>
            <tr>
              {columns.map((col, idx) => (
                <th key={idx} style={{ width: col.width, textAlign: col.align || 'left' }}>
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {[1, 2, 3, 4, 5].map((row) => (
              <tr key={row}>
                {columns.map((_, colIdx) => (
                  <td key={colIdx}>
                    <div
                      className="skeleton"
                      style={{
                        height: '18px',
                        width: colIdx === 0 ? '70%' : '50%',
                        borderRadius: '4px',
                      }}
                    />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="table-responsive">
        <table className="table">
          <thead>
            <tr>
              {columns.map((col, idx) => (
                <th key={idx} style={{ width: col.width, textAlign: col.align || 'left' }}>
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
        </table>
        {emptyState}
      </div>
    );
  }

  return (
    <div className="table-responsive">
      <table className="table">
        <thead>
          <tr>
            {columns.map((col, idx) => (
              <th key={idx} style={{ width: col.width, textAlign: col.align || 'left' }}>
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((item, index) => (
            <tr key={keyExtractor(item)}>
              {columns.map((col, colIdx) => (
                <td key={colIdx} style={{ textAlign: col.align || 'left' }}>
                  {col.render
                    ? col.render(item, index)
                    : col.accessor
                    ? String((item as any)[col.accessor] ?? '-')
                    : '-'}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  onPageSizeChange?: (size: number) => void;
}

export const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  totalItems,
  pageSize,
  onPageChange,
  onPageSizeChange,
}) => {
  const startItem = totalItems === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const endItem = Math.min(currentPage * pageSize, totalItems);

  return (
    <div className="pagination-container">
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <span>
          Menampilkan <strong>{startItem}</strong> - <strong>{endItem}</strong> dari{' '}
          <strong>{totalItems}</strong> data
        </span>
        {onPageSizeChange && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Baris:</span>
            <select
              value={pageSize}
              onChange={(e) => onPageSizeChange(Number(e.target.value))}
              className="filter-select"
              style={{ padding: '3px 8px', fontSize: '0.78rem' }}
            >
              <option value={5}>5</option>
              <option value={10}>10</option>
              <option value={20}>20</option>
            </select>
          </div>
        )}
      </div>

      <div className="pagination-controls">
        <button
          className="pagination-btn"
          onClick={() => onPageChange(1)}
          disabled={currentPage <= 1}
          title="Halaman Pertama"
        >
          <ChevronsLeft size={16} />
        </button>
        <button
          className="pagination-btn"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage <= 1}
          title="Halaman Sebelumnya"
        >
          <ChevronLeft size={16} />
        </button>

        {Array.from({ length: totalPages }, (_, i) => i + 1)
          .filter((p) => p === 1 || p === totalPages || Math.abs(p - currentPage) <= 1)
          .map((page, index, arr) => {
            const prev = arr[index - 1];
            return (
              <React.Fragment key={page}>
                {prev && page - prev > 1 && (
                  <span style={{ padding: '0 4px', color: 'var(--text-muted)' }}>...</span>
                )}
                <button
                  className={`pagination-btn ${currentPage === page ? 'active' : ''}`}
                  onClick={() => onPageChange(page)}
                >
                  {page}
                </button>
              </React.Fragment>
            );
          })}

        <button
          className="pagination-btn"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage >= totalPages || totalPages === 0}
          title="Halaman Berikutnya"
        >
          <ChevronRight size={16} />
        </button>
        <button
          className="pagination-btn"
          onClick={() => onPageChange(totalPages)}
          disabled={currentPage >= totalPages || totalPages === 0}
          title="Halaman Terakhir"
        >
          <ChevronsRight size={16} />
        </button>
      </div>
    </div>
  );
};
