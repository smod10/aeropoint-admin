export interface PaginationResult<T> {
  items: T[];
  totalCount: number;
  pageCount: number;
  currentPage: number;
  pageSize: number;
}

export function paginate<T>(
  items: T[],
  currentPage: number,
  pageSize: number
): PaginationResult<T> {
  const totalCount = items.length;
  const pageCount = Math.ceil(totalCount / pageSize) || 1;
  const validPage = Math.min(Math.max(1, currentPage), pageCount);
  const startIndex = (validPage - 1) * pageSize;
  const endIndex = startIndex + pageSize;

  return {
    items: items.slice(startIndex, endIndex),
    totalCount,
    pageCount,
    currentPage: validPage,
    pageSize,
  };
}
