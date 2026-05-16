export type PaginationParams = {
  page: number;
  limit: number;
  from: number;
  to: number;
};

export function getPagination(searchParams: URLSearchParams): PaginationParams {
  const page = Math.max(Number(searchParams.get("page") ?? "1") || 1, 1);
  const requestedLimit = Number(searchParams.get("limit") ?? "20") || 20;
  const limit = Math.min(Math.max(requestedLimit, 1), 100);
  const from = (page - 1) * limit;
  const to = from + limit - 1;

  return { page, limit, from, to };
}

export function paginatedResult<T>(
  items: T[],
  count: number | null,
  pagination: PaginationParams
  ) {
  return {
    items,
    pagination: {
      page: pagination.page,
      limit: pagination.limit,
      total: count ?? 0,
      totalPages: count ? Math.ceil(count / pagination.limit) : 0,
    },
  };
}
