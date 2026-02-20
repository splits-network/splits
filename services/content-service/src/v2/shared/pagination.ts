/**
 * Pagination Types
 *
 * Shared pagination types used across all V2 endpoints.
 */

export interface PaginationParams {
    page?: number;
    limit?: number;
}

export interface SortParams {
    sort_by?: string;
    sort_order?: 'asc' | 'desc';
}

export interface PaginationResponse<T> {
    data: T[];
    pagination: {
        total: number;
        page: number;
        limit: number;
        total_pages: number;
    };
}

export function validatePaginationParams(
    page?: number,
    limit?: number
): { page: number; limit: number } {
    const validatedPage = page && page > 0 ? page : 1;
    const validatedLimit = limit && limit > 0 && limit <= 100 ? limit : 25;
    return { page: validatedPage, limit: validatedLimit };
}

export function buildPaginationResponse<T>(
    data: T[],
    total: number,
    page: number,
    limit: number
): PaginationResponse<T> {
    return {
        data,
        pagination: {
            total,
            page,
            limit,
            total_pages: Math.ceil(total / limit),
        },
    };
}
