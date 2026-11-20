import { ChevronLeft, ChevronRight } from 'lucide-react';

interface PaginationControlsProps {
  currentPage: number;
  pageCount: number;
  totalCount: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
  pageSizeOptions?: number[];
}

export default function PaginationControls({
  currentPage,
  pageCount,
  totalCount,
  pageSize,
  onPageChange,
  onPageSizeChange,
  pageSizeOptions = [10, 25, 50, 100],
}: PaginationControlsProps) {
  if (totalCount === 0) {
    return (
      <div className="flex flex-col gap-4 rounded-xl border border-gray-100 bg-white p-6 shadow-soft sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-gray-600">No deals match these filters.</p>
        <label className="text-sm font-medium text-gray-600">
          Rows per page
          <select
            value={pageSize}
            onChange={(event) => onPageSizeChange(Number(event.target.value))}
            className="ml-2 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-700 outline-none focus:border-primary-500"
            aria-label="Rows per page"
          >
            {pageSizeOptions.map((size) => (
              <option key={size} value={size}>
                {size}
              </option>
            ))}
          </select>
        </label>
      </div>
    );
  }

  const startItem = (currentPage - 1) * pageSize + 1;
  const endItem = Math.min(currentPage * pageSize, totalCount);

  return (
    <div className="flex flex-col gap-4 rounded-xl border border-gray-100 bg-white p-6 shadow-soft sm:flex-row sm:items-center sm:justify-between">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        <p className="text-sm text-gray-600">
          Showing {startItem} to {endItem} of {totalCount} results
        </p>

        <label className="text-sm font-medium text-gray-600">
          <select
            value={pageSize}
            onChange={(event) => onPageSizeChange(Number(event.target.value))}
            className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-700 outline-none focus:border-primary-500"
            aria-label="Rows per page"
          >
            {pageSizeOptions.map((size) => (
              <option key={size} value={size}>
                {size} per page
              </option>
            ))}
          </select>
        </label>
      </div>

      <nav aria-label="Pagination" className="flex items-center justify-end gap-3">
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          aria-label="Previous page"
          title="Previous page"
          className="inline-flex h-8 w-8 items-center justify-center text-gray-600 hover:text-gray-900 disabled:cursor-not-allowed disabled:opacity-50 focus:outline focus:outline-2 focus:outline-offset-2 focus:outline-primary-500"
        >
          <ChevronLeft size={20} />
        </button>

        <span className="text-sm font-medium text-gray-700" aria-live="polite">
          Page {currentPage} of {pageCount}
        </span>

        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === pageCount}
          aria-label="Next page"
          title="Next page"
          className="inline-flex h-8 w-8 items-center justify-center text-gray-600 hover:text-gray-900 disabled:cursor-not-allowed disabled:opacity-50 focus:outline focus:outline-2 focus:outline-offset-2 focus:outline-primary-500"
        >
          <ChevronRight size={20} />
        </button>
      </nav>
    </div>
  );
}
