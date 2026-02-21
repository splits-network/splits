'use client';

import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useAuth } from '@clerk/nextjs';
import { useSearchParams, useRouter } from 'next/navigation';
import { createAuthenticatedClient } from '@/lib/api-client';
import type {
  SearchResult,
  SearchableEntityType,
  FullSearchResponse,
  SearchPagination,
  SearchFilters,
} from '@/types/search';

/* ─── Constants ──────────────────────────────────────────────────────────── */

const DEBOUNCE_DELAY = 300;
const MIN_QUERY_LENGTH = 2;
const PER_PAGE_OPTIONS = [10, 25, 50, 100] as const;
const DEFAULT_PER_PAGE = 25;
const SAVED_SEARCHES_KEY = 'candidate:saved-searches';
const RECENT_SEARCHES_KEY = 'candidate:recent-searches';
const MAX_RECENT = 8;

export type SortOption = 'newest' | 'oldest' | 'az' | 'za' | 'type';
export type PerPage = (typeof PER_PAGE_OPTIONS)[number];

export const SORT_OPTIONS: { value: SortOption; label: string }[] = [
  { value: 'newest', label: 'Newest First' },
  { value: 'oldest', label: 'Oldest First' },
  { value: 'az', label: 'A → Z' },
  { value: 'za', label: 'Z → A' },
  { value: 'type', label: 'Entity Type' },
];

export { PER_PAGE_OPTIONS };

/* ─── Saved search type ──────────────────────────────────────────────────── */

export interface SavedSearch {
  id: string;
  name: string;
  query: string;
  entityTypes: SearchableEntityType[];
  createdAt: number;
}

/* ─── Return type ────────────────────────────────────────────────────────── */

export interface UseFullSearchReturn {
  // Query
  query: string;
  setQuery: (q: string) => void;

  // Results
  results: SearchResult[];
  pagination: SearchPagination | null;
  isLoading: boolean;
  isEmpty: boolean;

  // Multi-entity type filter (checkboxes)
  selectedEntityTypes: SearchableEntityType[];
  toggleEntityType: (type: SearchableEntityType) => void;
  clearEntityTypes: () => void;
  setSelectedEntityTypes: (types: SearchableEntityType[]) => void;

  // Sort
  sortBy: SortOption;
  setSortBy: (sort: SortOption) => void;

  // Per-page
  perPage: PerPage;
  setPerPage: (n: PerPage) => void;

  // Pagination
  page: number;
  setPage: (page: number) => void;

  // Saved searches
  savedSearches: SavedSearch[];
  saveCurrentSearch: (name: string) => void;
  removeSavedSearch: (id: string) => void;
  loadSavedSearch: (search: SavedSearch) => void;
  isCurrentSearchSaved: boolean;

  // Recent searches
  recentSearches: string[];
  addRecentSearch: (query: string) => void;
  clearRecentSearches: () => void;

  // Advanced filters
  filters: SearchFilters;
  setFilter: <K extends keyof SearchFilters>(key: K, value: SearchFilters[K]) => void;
  removeFilter: (key: keyof SearchFilters) => void;
  clearAllFilters: () => void;
  activeFilterCount: number;

  // Execute immediate search (for search button / Enter)
  executeSearch: () => void;
}

/* ─── Sort comparators ───────────────────────────────────────────────────── */

function sortResults(results: SearchResult[], sortBy: SortOption): SearchResult[] {
  const sorted = [...results];
  switch (sortBy) {
    case 'az':
      return sorted.sort((a, b) => a.title.localeCompare(b.title));
    case 'za':
      return sorted.sort((a, b) => b.title.localeCompare(a.title));
    case 'type':
      return sorted.sort((a, b) => a.entity_type.localeCompare(b.entity_type));
    case 'oldest':
      return sorted.reverse();
    case 'newest':
    default:
      return sorted;
  }
}

/* ─── localStorage helpers ───────────────────────────────────────────────── */

function loadFromStorage<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined') return fallback;
  try {
    const stored = localStorage.getItem(key);
    return stored ? JSON.parse(stored) : fallback;
  } catch {
    return fallback;
  }
}

function saveToStorage(key: string, value: unknown): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Quota exceeded — silently fail
  }
}

/* ─── Hook ───────────────────────────────────────────────────────────────── */

export function useFullSearch(): UseFullSearchReturn {
  const { getToken } = useAuth();
  const searchParams = useSearchParams();
  const router = useRouter();

  // Parse initial URL params
  const initialQuery = searchParams.get('q') ?? '';
  const initialTypes = (searchParams.get('types')?.split(',').filter(Boolean) ?? []) as SearchableEntityType[];
  const initialPage = Number(searchParams.get('page')) || 1;
  const initialSort = (searchParams.get('sort') as SortOption) || 'newest';
  const initialPerPage = (Number(searchParams.get('limit')) || DEFAULT_PER_PAGE) as PerPage;
  const initialFilters: SearchFilters = (() => {
    try {
      const raw = searchParams.get('filters');
      return raw ? JSON.parse(raw) : {};
    } catch {
      return {};
    }
  })();

  // Core state
  const [query, setQueryState] = useState(initialQuery);
  const [selectedEntityTypes, setSelectedEntityTypesState] = useState<SearchableEntityType[]>(initialTypes);
  const [page, setPageState] = useState(initialPage);
  const [sortBy, setSortByState] = useState<SortOption>(initialSort);
  const [perPage, setPerPageState] = useState<PerPage>(
    PER_PAGE_OPTIONS.includes(initialPerPage as any) ? initialPerPage : DEFAULT_PER_PAGE,
  );
  const [filters, setFiltersState] = useState<SearchFilters>(initialFilters);

  // Results
  const [rawResults, setRawResults] = useState<SearchResult[]>([]);
  const [pagination, setPagination] = useState<SearchPagination | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Saved + recent searches
  const [savedSearches, setSavedSearches] = useState<SavedSearch[]>(() =>
    loadFromStorage(SAVED_SEARCHES_KEY, []),
  );
  const [recentSearches, setRecentSearches] = useState<string[]>(() =>
    loadFromStorage(RECENT_SEARCHES_KEY, []),
  );

  // Refs
  const debounceTimeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);
  const abortControllerRef = useRef<AbortController | undefined>(undefined);

  // Sorted results (client-side sort)
  const results = useMemo(() => sortResults(rawResults, sortBy), [rawResults, sortBy]);

  // Check if current search is saved
  const isCurrentSearchSaved = useMemo(
    () =>
      savedSearches.some(
        (s) =>
          s.query === query &&
          JSON.stringify(s.entityTypes.sort()) === JSON.stringify([...selectedEntityTypes].sort()),
      ),
    [savedSearches, query, selectedEntityTypes],
  );

  /* ─── URL sync ──────────────────────────────────────────────────── */

  const syncUrl = useCallback(
    (q: string, types: SearchableEntityType[], p: number, sort: SortOption, limit: PerPage, f: SearchFilters) => {
      const params = new URLSearchParams();
      if (q) params.set('q', q);
      if (types.length > 0) params.set('types', types.join(','));
      if (p > 1) params.set('page', String(p));
      if (sort !== 'newest') params.set('sort', sort);
      if (limit !== DEFAULT_PER_PAGE) params.set('limit', String(limit));
      if (Object.keys(f).length > 0) params.set('filters', JSON.stringify(f));
      const qs = params.toString();
      router.replace(`/portal/search${qs ? `?${qs}` : ''}`, { scroll: false });
    },
    [router],
  );

  /* ─── API fetch ─────────────────────────────────────────────────── */

  const fetchResults = useCallback(
    async (
      searchQuery: string,
      types: SearchableEntityType[],
      p: number,
      limit: PerPage,
      f: SearchFilters = {},
    ) => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }

      if (!searchQuery || searchQuery.trim().length < MIN_QUERY_LENGTH) {
        setRawResults([]);
        setPagination(null);
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        const abortController = new AbortController();
        abortControllerRef.current = abortController;

        const token = await getToken();
        if (!token) {
          setRawResults([]);
          setPagination(null);
          setIsLoading(false);
          return;
        }

        const client = createAuthenticatedClient(token);
        const hasFilters = Object.keys(f).length > 0;

        if (types.length <= 1) {
          const params: Record<string, any> = {
            q: searchQuery.trim(),
            mode: 'full',
            page: p,
            limit,
          };
          if (types.length === 1) params.entity_type = types[0];
          if (hasFilters) params.filters = JSON.stringify(f);

          const response = await client.get<{ data: FullSearchResponse }>('/search', { params });
          if (abortController.signal.aborted) return;

          // Filter to only candidate-relevant entity types
          const filtered = response.data.data.filter(
            (r: SearchResult) => r.entity_type === 'job' || r.entity_type === 'company' || r.entity_type === 'recruiter',
          );

          setRawResults(filtered);
          setPagination(response.data.pagination);
        } else {
          // Parallel fetch for each selected entity type
          const promises = types.map((type) => {
            const typeParams: Record<string, any> = {
              q: searchQuery.trim(),
              mode: 'full',
              page: 1,
              limit: 100,
              entity_type: type,
            };
            if (hasFilters) typeParams.filters = JSON.stringify(f);
            return client.get<{ data: FullSearchResponse }>('/search', { params: typeParams });
          });

          const responses = await Promise.all(promises);
          if (abortController.signal.aborted) return;

          const allResults = responses.flatMap((r) => r.data.data);
          const totalCount = responses.reduce((sum, r) => sum + r.data.pagination.total, 0);

          const start = (p - 1) * limit;
          const pageResults = allResults.slice(start, start + limit);

          setRawResults(pageResults);
          setPagination({
            total: totalCount,
            page: p,
            limit,
            total_pages: Math.ceil(totalCount / limit),
          });
        }
      } catch (err: any) {
        if (err.name === 'AbortError') return;
        console.error('Full search error:', err);
        setRawResults([]);
        setPagination(null);
      } finally {
        if (!abortControllerRef.current?.signal.aborted) {
          setIsLoading(false);
        }
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [], // getToken intentionally omitted — unstable ref
  );

  /* ─── Actions ───────────────────────────────────────────────────── */

  const triggerSearch = useCallback(
    (q: string, types: SearchableEntityType[], p: number, sort: SortOption, limit: PerPage, f: SearchFilters = {}) => {
      syncUrl(q, types, p, sort, limit, f);
      fetchResults(q, types, p, limit, f);
    },
    [fetchResults, syncUrl],
  );

  const setQuery = useCallback(
    (value: string) => {
      setQueryState(value);
      setPageState(1);
      if (debounceTimeoutRef.current) clearTimeout(debounceTimeoutRef.current);
      debounceTimeoutRef.current = setTimeout(() => {
        triggerSearch(value, selectedEntityTypes, 1, sortBy, perPage, filters);
      }, DEBOUNCE_DELAY);
    },
    [selectedEntityTypes, sortBy, perPage, filters, triggerSearch],
  );

  const executeSearch = useCallback(() => {
    if (debounceTimeoutRef.current) clearTimeout(debounceTimeoutRef.current);
    setPageState(1);
    triggerSearch(query, selectedEntityTypes, 1, sortBy, perPage, filters);
  }, [query, selectedEntityTypes, sortBy, perPage, filters, triggerSearch]);

  const toggleEntityType = useCallback(
    (type: SearchableEntityType) => {
      const next = selectedEntityTypes.includes(type)
        ? selectedEntityTypes.filter((t) => t !== type)
        : [...selectedEntityTypes, type];
      setSelectedEntityTypesState(next);
      setPageState(1);
      triggerSearch(query, next, 1, sortBy, perPage, filters);
    },
    [query, selectedEntityTypes, sortBy, perPage, filters, triggerSearch],
  );

  const clearEntityTypes = useCallback(() => {
    setSelectedEntityTypesState([]);
    setPageState(1);
    triggerSearch(query, [], 1, sortBy, perPage, filters);
  }, [query, sortBy, perPage, filters, triggerSearch]);

  const setSelectedEntityTypes = useCallback(
    (types: SearchableEntityType[]) => {
      setSelectedEntityTypesState(types);
      setPageState(1);
      triggerSearch(query, types, 1, sortBy, perPage, filters);
    },
    [query, sortBy, perPage, filters, triggerSearch],
  );

  const setSortBy = useCallback(
    (sort: SortOption) => {
      setSortByState(sort);
      syncUrl(query, selectedEntityTypes, page, sort, perPage, filters);
    },
    [query, selectedEntityTypes, page, perPage, filters, syncUrl],
  );

  const setPerPage = useCallback(
    (limit: PerPage) => {
      setPerPageState(limit);
      setPageState(1);
      triggerSearch(query, selectedEntityTypes, 1, sortBy, limit, filters);
    },
    [query, selectedEntityTypes, sortBy, filters, triggerSearch],
  );

  const setPage = useCallback(
    (p: number) => {
      setPageState(p);
      triggerSearch(query, selectedEntityTypes, p, sortBy, perPage, filters);
    },
    [query, selectedEntityTypes, sortBy, perPage, filters, triggerSearch],
  );

  /* ─── Advanced Filters ───────────────────────────────────────────── */

  const activeFilterCount = useMemo(
    () => Object.keys(filters).length,
    [filters],
  );

  const setFilter = useCallback(
    <K extends keyof SearchFilters>(key: K, value: SearchFilters[K]) => {
      const next = { ...filters, [key]: value };
      setFiltersState(next);
      setPageState(1);
      triggerSearch(query, selectedEntityTypes, 1, sortBy, perPage, next);
    },
    [query, selectedEntityTypes, sortBy, perPage, filters, triggerSearch],
  );

  const removeFilter = useCallback(
    (key: keyof SearchFilters) => {
      const next = { ...filters };
      delete next[key];
      setFiltersState(next);
      setPageState(1);
      triggerSearch(query, selectedEntityTypes, 1, sortBy, perPage, next);
    },
    [query, selectedEntityTypes, sortBy, perPage, filters, triggerSearch],
  );

  const clearAllFilters = useCallback(() => {
    setFiltersState({});
    setPageState(1);
    triggerSearch(query, selectedEntityTypes, 1, sortBy, perPage, {});
  }, [query, selectedEntityTypes, sortBy, perPage, triggerSearch]);

  /* ─── Saved searches ────────────────────────────────────────────── */

  const saveCurrentSearch = useCallback(
    (name: string) => {
      const search: SavedSearch = {
        id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        name,
        query,
        entityTypes: selectedEntityTypes,
        createdAt: Date.now(),
      };
      setSavedSearches((prev) => {
        const next = [search, ...prev];
        saveToStorage(SAVED_SEARCHES_KEY, next);
        return next;
      });
    },
    [query, selectedEntityTypes],
  );

  const removeSavedSearch = useCallback((id: string) => {
    setSavedSearches((prev) => {
      const next = prev.filter((s) => s.id !== id);
      saveToStorage(SAVED_SEARCHES_KEY, next);
      return next;
    });
  }, []);

  const loadSavedSearch = useCallback(
    (search: SavedSearch) => {
      setQueryState(search.query);
      setSelectedEntityTypesState(search.entityTypes);
      setFiltersState({});
      setPageState(1);
      triggerSearch(search.query, search.entityTypes, 1, sortBy, perPage, {});
    },
    [sortBy, perPage, triggerSearch],
  );

  /* ─── Recent searches ───────────────────────────────────────────── */

  const addRecentSearch = useCallback((searchQuery: string) => {
    const trimmed = searchQuery.trim();
    if (!trimmed || trimmed.length < MIN_QUERY_LENGTH) return;
    setRecentSearches((prev) => {
      const next = [trimmed, ...prev.filter((s) => s !== trimmed)].slice(0, MAX_RECENT);
      saveToStorage(RECENT_SEARCHES_KEY, next);
      return next;
    });
  }, []);

  const clearRecentSearches = useCallback(() => {
    setRecentSearches([]);
    if (typeof window !== 'undefined') localStorage.removeItem(RECENT_SEARCHES_KEY);
  }, []);

  /* ─── Lifecycle ─────────────────────────────────────────────────── */

  useEffect(() => {
    if (initialQuery.trim().length >= MIN_QUERY_LENGTH) {
      fetchResults(initialQuery, initialTypes, initialPage, initialPerPage, initialFilters);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    return () => {
      if (debounceTimeoutRef.current) clearTimeout(debounceTimeoutRef.current);
      if (abortControllerRef.current) abortControllerRef.current.abort();
    };
  }, []);

  /* ─── Derived ───────────────────────────────────────────────────── */

  const isEmpty =
    query.trim().length >= MIN_QUERY_LENGTH && results.length === 0 && !isLoading;

  return {
    query,
    setQuery,
    results,
    pagination,
    isLoading,
    isEmpty,
    selectedEntityTypes,
    toggleEntityType,
    clearEntityTypes,
    setSelectedEntityTypes,
    sortBy,
    setSortBy,
    perPage,
    setPerPage,
    page,
    setPage,
    savedSearches,
    saveCurrentSearch,
    removeSavedSearch,
    loadSavedSearch,
    isCurrentSearchSaved,
    recentSearches,
    addRecentSearch,
    clearRecentSearches,
    filters,
    setFilter,
    removeFilter,
    clearAllFilters,
    activeFilterCount,
    executeSearch,
  };
}
