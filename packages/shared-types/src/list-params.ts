export interface StandardListParams {
    page?: number;
    limit?: number;
    search?: string;
    filters?: Record<string, any>;
    include?: string;
    sort_by?: string;
    sort_order?: 'asc' | 'desc';
}

export function parseFilters(filtersStr: string | undefined): Record<string, any> | {} {
    if (!filtersStr) {
        return {};
    }
    let filters: Record<string, any> = {};
    try {
        if (typeof filtersStr === 'string') {
            filters = JSON.parse(filtersStr);
        } else {
            filters = filtersStr;
        }
    } catch (error) {
        filters = {};
    }
    return filters;
}