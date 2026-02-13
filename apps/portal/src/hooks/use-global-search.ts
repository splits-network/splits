'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useAuth } from '@clerk/nextjs';
import { createAuthenticatedClient } from '@/lib/api-client';
import type { TypeaheadGroup, TypeaheadResponse, SearchableEntityType } from '@/types/search';
import { getEntityUrl } from '@/types/search';

// ===== CONSTANTS =====

const DEBOUNCE_DELAY = 250; // Faster than standard list (300ms) for snappier typeahead
const MIN_QUERY_LENGTH = 2;
const MAX_RECENT_SEARCHES = 5;
const RECENT_SEARCHES_KEY = 'splits:recent-searches';

// ===== TYPES =====

export interface UseGlobalSearchReturn {
  // Input state
  query: string;
  setQuery: (q: string) => void;
  clearQuery: () => void;

  // Results
  groups: TypeaheadGroup[];
  hasResults: boolean;
  isEmpty: boolean; // true when query exists but no results

  // States
  isLoading: boolean;
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;

  // Recent searches
  recentSearches: string[];
  addRecentSearch: (query: string) => void;
  clearRecentSearches: () => void;

  // Navigation
  getEntityUrl: (entityType: SearchableEntityType, entityId: string) => string;
}

// ===== HOOK =====

export function useGlobalSearch(): UseGlobalSearchReturn {
  const { getToken } = useAuth();

  // State
  const [query, setQueryState] = useState('');
  const [groups, setGroups] = useState<TypeaheadGroup[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);

  // Refs for debouncing and cancellation
  const debounceTimeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);
  const abortControllerRef = useRef<AbortController | undefined>(undefined);

  // Load recent searches from localStorage on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem(RECENT_SEARCHES_KEY);
        if (stored) {
          const parsed = JSON.parse(stored);
          if (Array.isArray(parsed)) {
            setRecentSearches(parsed.slice(0, MAX_RECENT_SEARCHES));
          }
        }
      } catch (err) {
        console.error('Failed to load recent searches:', err);
      }
    }
  }, []);

  // Save recent searches to localStorage
  const saveRecentSearches = useCallback((searches: string[]) => {
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(searches));
      } catch (err) {
        console.error('Failed to save recent searches:', err);
      }
    }
  }, []);

  // Add to recent searches
  const addRecentSearch = useCallback((searchQuery: string) => {
    const trimmed = searchQuery.trim();
    if (!trimmed) return;

    setRecentSearches(prev => {
      // Deduplicate - remove if already exists
      const filtered = prev.filter(s => s !== trimmed);
      // Add to front
      const updated = [trimmed, ...filtered].slice(0, MAX_RECENT_SEARCHES);
      saveRecentSearches(updated);
      return updated;
    });
  }, [saveRecentSearches]);

  // Clear recent searches
  const clearRecentSearches = useCallback(() => {
    setRecentSearches([]);
    if (typeof window !== 'undefined') {
      localStorage.removeItem(RECENT_SEARCHES_KEY);
    }
  }, []);

  // Fetch search results
  const fetchResults = useCallback(async (searchQuery: string) => {
    // Abort any in-flight request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    // Empty query or too short - clear results
    if (!searchQuery || searchQuery.trim().length < MIN_QUERY_LENGTH) {
      setGroups([]);
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);

      // Create new AbortController for this request
      const abortController = new AbortController();
      abortControllerRef.current = abortController;

      // Get auth token
      const token = await getToken();
      if (!token) {
        console.error('No auth token available for search');
        setGroups([]);
        setIsLoading(false);
        return;
      }

      // Call search API
      const client = createAuthenticatedClient(token);
      const response = await client.get<{ data: TypeaheadResponse }>('/search', {
        params: {
          q: searchQuery.trim(),
          mode: 'typeahead',
        },
      });

      // Check if this request was aborted
      if (abortController.signal.aborted) {
        return;
      }

      // Update results
      setGroups(response.data.groups || []);
    } catch (err: any) {
      // Ignore abort errors (expected when user types quickly)
      if (err.name === 'AbortError') {
        return;
      }

      // Log other errors but don't show to user (graceful degradation for typeahead)
      console.error('Search error:', err);
      setGroups([]);
    } finally {
      // Only clear loading if this request wasn't aborted
      if (!abortControllerRef.current?.signal.aborted) {
        setIsLoading(false);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // getToken intentionally omitted - see MEMORY.md

  // Set query with debouncing
  const setQuery = useCallback((value: string) => {
    setQueryState(value);

    // Clear existing timeout
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }

    // Debounce the API call
    debounceTimeoutRef.current = setTimeout(() => {
      fetchResults(value);
    }, DEBOUNCE_DELAY);
  }, [fetchResults]);

  // Clear query and results
  const clearQuery = useCallback(() => {
    setQueryState('');
    setGroups([]);
    setIsLoading(false);

    // Clear any pending debounce
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }

    // Abort any in-flight request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  // Derived state
  const hasResults = groups.length > 0 && groups.some(g => g.results.length > 0);
  const isEmpty = query.trim().length >= MIN_QUERY_LENGTH && !hasResults && !isLoading;

  return {
    // Input state
    query,
    setQuery,
    clearQuery,

    // Results
    groups,
    hasResults,
    isEmpty,

    // States
    isLoading,
    isOpen,
    setIsOpen,

    // Recent searches
    recentSearches,
    addRecentSearch,
    clearRecentSearches,

    // Navigation
    getEntityUrl,
  };
}
