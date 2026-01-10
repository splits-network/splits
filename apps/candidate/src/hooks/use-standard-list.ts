'use client';

import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@clerk/nextjs';
import { createAuthenticatedClient } from '@/lib/api-client';
import type { StandardListParams, StandardListResponse, PaginationResponse } from '@splits-network/shared-types';

// Re-export UI components for convenience
export { SearchInput } from '@/components/standard-lists/search-input';
export { PaginationControls } from '@/components/standard-lists/pagination-controls';
export { EmptyState } from '@/components/standard-lists/empty-state';
export { LoadingState } from '@/components/standard-lists/loading-state';
export { ErrorState } from '@/components/standard-lists/error-state';
export { ViewModeToggle } from '@/components/standard-lists/view-mode-toggle';

// ===== TYPES =====

export interface FetchParams<F = Record<string, any>> {
    page: number;
    limit: number;
    search?: string;
    sort_by?: string;
    sort_order?: 'asc' | 'desc';
    filters?: F;
}

export interface FetchResponse<T> {
    data: T[];
    pagination: PaginationResponse;
}

export interface UseStandardListOptions<T, F extends Record<string, any> = Record<string, any>> {
    /** API endpoint to fetch from (e.g., '/candidates', '/jobs') - used with built-in fetching */
    endpoint?: string;
    /** Custom fetch function - alternative to endpoint */
    fetchFn?: (params: FetchParams<F>) => Promise<FetchResponse<T>>;
    /** Default filters to apply */
    defaultFilters?: F;
    /** Default sort field */
    defaultSortBy?: string;
    /** Default sort order */
    defaultSortOrder?: 'asc' | 'desc';
    /** Default page size */
    defaultLimit?: number;
    /** Include related data (comma-separated) */
    include?: string;
    /** Transform response data after fetching */
    transformData?: (data: any[]) => T[];
    /** Sync state to URL query params */
    syncToUrl?: boolean;
    /** Storage key for view mode preference */
    viewModeKey?: string;
    /** @deprecated Use `viewModeKey` instead */
    storageKey?: string;
    /** Fields that can be searched */
    searchableFields?: string[];
    /** Fields that can be sorted */
    sortableFields?: string[];
    /** Auto-fetch on mount */
    autoFetch?: boolean;
}

export interface UseStandardListReturn<T, F extends Record<string, any> = Record<string, any>> {
    // Data
    data: T[];
    /** @deprecated Use `data` instead */
    items: T[];
    pagination: PaginationResponse;

    // Loading/Error state
    loading: boolean;
    error: string | null;

    // Search
    searchInput: string;
    /** @deprecated Use `searchInput` instead */
    search: string;
    /** @deprecated Use `searchInput` instead */
    searchTerm: string;
    searchQuery: string;
    setSearchInput: (value: string) => void;
    /** @deprecated Use `setSearchInput` instead */
    setSearch: (value: string) => void;
    /** @deprecated Use `setSearchInput` instead */
    setSearchTerm: (value: string) => void;
    clearSearch: () => void;

    // Filters
    filters: F;
    setFilters: (filters: F) => void;
    setFilter: <K extends keyof F>(key: K, value: F[K]) => void;
    clearFilters: () => void;

    // Sorting
    sortBy: string;
    sortOrder: 'asc' | 'desc';
    handleSort: (field: string) => void;
    getSortIcon: (field: string) => string;

    // Pagination
    page: number;
    limit: number;
    totalPages: number;
    total: number;
    goToPage: (page: number) => void;
    /** @deprecated Use `goToPage` instead */
    setPage: (page: number) => void;
    nextPage: () => void;
    prevPage: () => void;
    setLimit: (limit: number) => void;

    // View mode
    viewMode: 'grid' | 'table';
    setViewMode: (mode: 'grid' | 'table') => void;

    // Actions
    refresh: () => Promise<void>;
    /** @deprecated Use `refresh` instead */
    refetch: () => Promise<void>;
    reset: () => void;
}

// ===== CONSTANTS =====

const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 25;
const DEBOUNCE_DELAY = 300;

// ===== HOOK =====

export function useStandardList<T = any, F extends Record<string, any> = Record<string, any>>(
    options: UseStandardListOptions<T, F>
): UseStandardListReturn<T, F> {
    const {
        endpoint,
        fetchFn,
        defaultFilters = {} as F,
        defaultSortBy = 'created_at',
        defaultSortOrder = 'desc',
        defaultLimit = DEFAULT_LIMIT,
        include,
        transformData,
        syncToUrl = true,
        viewModeKey,
        storageKey, // Deprecated alias for viewModeKey
        autoFetch = true,
    } = options;

    // Support deprecated storageKey as fallback
    const effectiveViewModeKey = viewModeKey ?? storageKey;

    // Router hooks for URL sync
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();

    // Auth
    const { getToken } = useAuth();

    // Initialize state from URL if syncing
    const getInitialState = useCallback(() => {
        if (syncToUrl && searchParams) {
            const urlPage = searchParams.get('page');
            const urlLimit = searchParams.get('limit');
            const urlSearch = searchParams.get('search');
            const urlSortBy = searchParams.get('sort_by');
            const urlSortOrder = searchParams.get('sort_order');
            const urlFilters = searchParams.get('filters');

            let parsedFilters = { ...defaultFilters };
            if (urlFilters) {
                try {
                    parsedFilters = { ...defaultFilters, ...JSON.parse(urlFilters) };
                } catch (e) {
                    // Invalid JSON, use defaults
                }
            }

            return {
                page: urlPage ? parseInt(urlPage, 10) : DEFAULT_PAGE,
                limit: urlLimit ? parseInt(urlLimit, 10) : defaultLimit,
                search: urlSearch || '',
                sortBy: urlSortBy || defaultSortBy,
                sortOrder: (urlSortOrder as 'asc' | 'desc') || defaultSortOrder,
                filters: parsedFilters as F,
            };
        }

        return {
            page: DEFAULT_PAGE,
            limit: defaultLimit,
            search: '',
            sortBy: defaultSortBy,
            sortOrder: defaultSortOrder,
            filters: defaultFilters as F,
        };
    }, [syncToUrl, searchParams, defaultFilters, defaultSortBy, defaultSortOrder, defaultLimit]);

    // Core state
    const [data, setData] = useState<T[]>([]);
    const [pagination, setPagination] = useState<PaginationResponse>({
        total: 0,
        page: DEFAULT_PAGE,
        limit: defaultLimit,
        total_pages: 0,
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Search state (separate input for controlled component)
    const initialState = getInitialState();
    const [searchInput, setSearchInputState] = useState(initialState.search);
    const [searchQuery, setSearchQuery] = useState(initialState.search);

    // Filter state
    const [filters, setFiltersState] = useState<F>(initialState.filters);

    // Sort state
    const [sortBy, setSortBy] = useState(initialState.sortBy);
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>(initialState.sortOrder);

    // Pagination state
    const [page, setPage] = useState(initialState.page);
    const [limit, setLimitState] = useState(initialState.limit);

    // View mode state (persisted to localStorage)
    // Always initialize with 'grid' to avoid hydration mismatch
    const [viewMode, setViewModeState] = useState<'grid' | 'table'>('grid');

    // Load view mode from localStorage after hydration
    useEffect(() => {
        if (effectiveViewModeKey && typeof window !== 'undefined') {
            const saved = localStorage.getItem(effectiveViewModeKey);
            if (saved === 'grid' || saved === 'table') {
                setViewModeState(saved);
            }
        }
    }, [effectiveViewModeKey]);

    // Refs for debouncing
    const searchTimeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);
    const isInitialMount = useRef(true);

    // Create stable keys for callback dependencies
    const filtersKey = useMemo(() => JSON.stringify(filters), [filters]);
    const defaultFiltersKey = useMemo(() => JSON.stringify(defaultFilters), [defaultFilters]);

    // Update URL when state changes
    const updateUrl = useCallback(() => {
        if (!syncToUrl) return;

        const params = new URLSearchParams();

        if (page !== DEFAULT_PAGE) params.set('page', String(page));
        if (limit !== defaultLimit) params.set('limit', String(limit));
        if (searchQuery) params.set('search', searchQuery);
        if (sortBy !== defaultSortBy) params.set('sort_by', sortBy);
        if (sortOrder !== defaultSortOrder) params.set('sort_order', sortOrder);

        // Only add filters if they differ from defaults
        const hasNonDefaultFilters = Object.keys(filters).some(
            key => filters[key] !== undefined && filters[key] !== defaultFilters[key]
        );
        if (hasNonDefaultFilters) {
            const activeFilters: Record<string, any> = {};
            Object.keys(filters).forEach(key => {
                if (filters[key] !== undefined && filters[key] !== defaultFilters[key]) {
                    activeFilters[key] = filters[key];
                }
            });
            if (Object.keys(activeFilters).length > 0) {
                params.set('filters', JSON.stringify(activeFilters));
            }
        }

        const queryString = params.toString();
        const newUrl = queryString ? `${pathname}?${queryString}` : pathname;

        // Use replace to avoid adding to history on every state change
        router.replace(newUrl, { scroll: false });
    }, [syncToUrl, pathname, router, page, limit, searchQuery, sortBy, sortOrder, filtersKey, defaultFiltersKey, defaultLimit, defaultSortBy, defaultSortOrder]);

    // Fetch data
    const fetchData = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);

            // Build params for fetching
            const activeFilters: Record<string, any> = {};
            Object.keys(filters).forEach(key => {
                if (filters[key] !== undefined && filters[key] !== null && filters[key] !== '') {
                    activeFilters[key] = filters[key];
                }
            });

            const fetchParams: FetchParams<F> = {
                page,
                limit,
                sort_by: sortBy,
                sort_order: sortOrder,
                ...(searchQuery && { search: searchQuery }),
                ...(Object.keys(activeFilters).length > 0 && { filters: activeFilters as F }),
            };

            let response: FetchResponse<T>;

            if (fetchFn) {
                // Use custom fetch function
                response = await fetchFn(fetchParams);
            } else if (endpoint) {
                // Use built-in fetch with endpoint
                const token = await getToken();
                if (!token) {
                    setError('Not authenticated');
                    return;
                }

                const client = createAuthenticatedClient(token);

                const params: StandardListParams = {
                    page,
                    limit,
                    sort_by: sortBy,
                    sort_order: sortOrder,
                };

                if (searchQuery) {
                    params.search = searchQuery;
                }

                if (include) {
                    params.include = include;
                }

                if (Object.keys(activeFilters).length > 0) {
                    params.filters = activeFilters;
                }

                response = await client.get<StandardListResponse<T>>(endpoint, { params });
            } else {
                throw new Error('Either endpoint or fetchFn must be provided');
            }

            let items = response.data || [];
            if (transformData) {
                items = transformData(items);
            }

            setData(items);
            if (response.pagination) {
                setPagination(response.pagination);
            }
        } catch (err: any) {
            console.error(`Failed to fetch:`, err);
            setError(err.message || `Failed to load data`);
        } finally {
            setLoading(false);
        }
    }, [getToken, endpoint, fetchFn, page, limit, searchQuery, sortBy, sortOrder, filters, include, transformData]);

    // Debounced search
    const setSearchInput = useCallback((value: string) => {
        setSearchInputState(value);

        if (searchTimeoutRef.current) {
            clearTimeout(searchTimeoutRef.current);
        }

        searchTimeoutRef.current = setTimeout(() => {
            setSearchQuery(value);
            setPage(DEFAULT_PAGE); // Reset to first page on search
        }, DEBOUNCE_DELAY);
    }, []);

    const clearSearch = useCallback(() => {
        setSearchInputState('');
        setSearchQuery('');
        setPage(DEFAULT_PAGE);
    }, []);

    // Filter handlers
    const setFilters = useCallback((newFilters: F) => {
        setFiltersState(newFilters);
        setPage(DEFAULT_PAGE); // Reset to first page on filter change
    }, []);

    const setFilter = useCallback(<K extends keyof F>(key: K, value: F[K]) => {
        setFiltersState(prev => ({ ...prev, [key]: value }));
        setPage(DEFAULT_PAGE);
    }, []);

    const clearFilters = useCallback(() => {
        setFiltersState(defaultFilters as F);
        setPage(DEFAULT_PAGE);
    }, [defaultFilters]);

    // Sort handlers
    const handleSort = useCallback((field: string) => {
        if (sortBy === field) {
            setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc');
        } else {
            setSortBy(field);
            setSortOrder('desc');
        }
        setPage(DEFAULT_PAGE);
    }, [sortBy]);

    const getSortIcon = useCallback((field: string) => {
        if (sortBy !== field) return 'fa-sort';
        return sortOrder === 'asc' ? 'fa-sort-up' : 'fa-sort-down';
    }, [sortBy, sortOrder]);

    // Pagination handlers
    const goToPage = useCallback((newPage: number) => {
        if (newPage >= 1 && newPage <= pagination.total_pages) {
            setPage(newPage);
        }
    }, [pagination.total_pages]);

    const nextPage = useCallback(() => {
        goToPage(page + 1);
    }, [page, goToPage]);

    const prevPage = useCallback(() => {
        goToPage(page - 1);
    }, [page, goToPage]);

    const setLimit = useCallback((newLimit: number) => {
        setLimitState(newLimit);
        setPage(DEFAULT_PAGE);
    }, []);

    // View mode handler (with localStorage persistence)
    const setViewMode = useCallback((mode: 'grid' | 'table') => {
        setViewModeState(mode);
        if (typeof window !== 'undefined' && effectiveViewModeKey) {
            localStorage.setItem(effectiveViewModeKey, mode);
        }
    }, [effectiveViewModeKey]);

    // Reset to defaults
    const reset = useCallback(() => {
        setSearchInputState('');
        setSearchQuery('');
        setFiltersState(defaultFilters as F);
        setSortBy(defaultSortBy);
        setSortOrder(defaultSortOrder);
        setPage(DEFAULT_PAGE);
        setLimitState(defaultLimit);
    }, [defaultFilters, defaultSortBy, defaultSortOrder, defaultLimit]);

    // Cleanup timeout on unmount
    useEffect(() => {
        return () => {
            if (searchTimeoutRef.current) {
                clearTimeout(searchTimeoutRef.current);
            }
        };
    }, []);

    // Fetch data when dependencies change
    useEffect(() => {
        if (autoFetch) {
            fetchData();
        }
    }, [fetchData, autoFetch]);

    // Update URL when state changes (after initial mount)
    useEffect(() => {
        if (isInitialMount.current) {
            isInitialMount.current = false;
            return;
        }
        updateUrl();
    }, [updateUrl]);

    return {
        // Data
        data,
        items: data, // Alias for backward compatibility
        pagination,

        // Loading/Error
        loading,
        error,

        // Search
        searchInput,
        search: searchInput, // Alias for backward compatibility
        searchTerm: searchInput, // Alias for backward compatibility
        searchQuery,
        setSearchInput,
        setSearch: setSearchInput, // Alias for backward compatibility
        setSearchTerm: setSearchInput, // Alias for backward compatibility
        clearSearch,

        // Filters
        filters,
        setFilters,
        setFilter,
        clearFilters,

        // Sorting
        sortBy,
        sortOrder,
        handleSort,
        getSortIcon,

        // Pagination
        page,
        limit,
        totalPages: pagination.total_pages,
        total: pagination.total,
        goToPage,
        setPage: goToPage, // Alias for backward compatibility
        nextPage,
        prevPage,
        setLimit,

        // View mode
        viewMode,
        setViewMode,

        // Actions
        refresh: fetchData,
        refetch: fetchData, // Alias for backward compatibility
        reset,
    };
}
