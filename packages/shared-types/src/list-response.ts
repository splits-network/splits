export interface StandardListResponse<T> {
    data: T[];
    pagination: PaginationResponse;
}

export interface PaginationResponse {
    total: number;
    page: number;
    limit: number;
    total_pages: number;
}

export function buildPaginationResponse(
    page: number,
    limit: number,
    total: number
): PaginationResponse {
    return {
        total,
        page,
        limit,
        total_pages: Math.ceil(total / limit),
    }
}