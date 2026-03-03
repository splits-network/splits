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
    page?: number | string,
    limit?: number | string
): { page: number; limit: number } {
    const p = Number(page);
    const l = Number(limit);
    return {
        page: p && p > 0 ? p : 1,
        limit: l && l > 0 && l <= 100 ? l : 25,
    };
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
