import { PaginatedResponse, PaginationMeta } from '../types';

export interface PaginationParams {
  page?: number | string;
  pageSize?: number | string;
  limit?: number | string;
}

/**
 * Parses and sanitizes pagination query parameters with fallback defaults.
 */
export function parsePaginationParams(
  query: PaginationParams = {},
  defaultPageSize = 10,
  maxPageSize = 100
): { page: number; pageSize: number; offset: number } {
  const pageNumber = Math.max(1, parseInt(String(query.page || 1), 10) || 1);
  const rawSize = parseInt(String(query.pageSize || query.limit || defaultPageSize), 10) || defaultPageSize;
  const pageSize = Math.min(Math.max(1, rawSize), maxPageSize);
  const offset = (pageNumber - 1) * pageSize;

  return {
    page: pageNumber,
    pageSize,
    offset,
  };
}

/**
 * Builds standard PaginationMeta from counts and page indices.
 */
export function buildPaginationMeta(
  totalItems: number,
  currentPage: number,
  pageSize: number
): PaginationMeta {
  const safeTotalItems = Math.max(0, totalItems);
  const safePageSize = Math.max(1, pageSize);
  const safeCurrentPage = Math.max(1, currentPage);
  const totalPages = Math.ceil(safeTotalItems / safePageSize) || 1;

  return {
    totalItems: safeTotalItems,
    totalPages,
    currentPage: safeCurrentPage,
    pageSize: safePageSize,
    hasNextPage: safeCurrentPage < totalPages,
    hasPreviousPage: safeCurrentPage > 1,
  };
}

/**
 * Wraps fetched entity rows and total count into a typed PaginatedResponse<T>.
 */
export function createPaginatedResponse<T>(
  data: T[],
  totalItems: number,
  currentPage: number,
  pageSize: number
): PaginatedResponse<T> {
  return {
    data,
    meta: buildPaginationMeta(totalItems, currentPage, pageSize),
  };
}

/**
 * Paginates an in-memory array of items.
 */
export function paginateArray<T>(
  items: T[],
  page = 1,
  pageSize = 10
): PaginatedResponse<T> {
  const { page: safePage, pageSize: safeSize, offset } = parsePaginationParams({ page, pageSize }, pageSize);
  const slicedData = items.slice(offset, offset + safeSize);

  return createPaginatedResponse(slicedData, items.length, safePage, safeSize);
}
