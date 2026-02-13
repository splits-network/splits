'use client';

import { useState, useEffect, useRef, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useGlobalSearch } from '@/hooks/use-global-search';
import { SearchResultItem } from './search-result-item';
import { ENTITY_TYPE_CONFIG } from '@/types/search';
import type { SearchResult } from '@/types/search';

export function GlobalSearchBar() {
  const router = useRouter();
  const {
    query,
    setQuery,
    clearQuery,
    groups,
    hasResults,
    isEmpty,
    isLoading,
    isOpen,
    setIsOpen,
    recentSearches,
    addRecentSearch,
    clearRecentSearches,
    getEntityUrl,
  } = useGlobalSearch();

  const [activeIndex, setActiveIndex] = useState(-1);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Flatten all results for keyboard navigation
  const allResults = useMemo(() => {
    return groups.flatMap((group) => group.results);
  }, [groups]);

  // Reset active index when results change
  useEffect(() => {
    setActiveIndex(-1);
  }, [groups]);

  // Cmd+K / Ctrl+K shortcut to focus search
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key === 'k') {
        event.preventDefault();
        inputRef.current?.focus();
        setIsOpen(true);
        setIsMobileOpen(true);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [setIsOpen]);

  // Click outside to close
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [setIsOpen]);

  // Keyboard navigation
  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'ArrowDown') {
      event.preventDefault();
      setActiveIndex((prev) => {
        if (allResults.length === 0) return -1;
        return prev < allResults.length - 1 ? prev + 1 : 0;
      });
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      setActiveIndex((prev) => {
        if (allResults.length === 0) return -1;
        return prev > 0 ? prev - 1 : allResults.length - 1;
      });
    } else if (event.key === 'Enter') {
      event.preventDefault();
      if (activeIndex >= 0 && allResults[activeIndex]) {
        handleResultClick(allResults[activeIndex]);
      }
      // Note: Phase 4 will add navigation to full search page when activeIndex is -1
    } else if (event.key === 'Escape') {
      event.preventDefault();
      setIsOpen(false);
      inputRef.current?.blur();
    }
  };

  const handleResultClick = (result: SearchResult) => {
    const url = getEntityUrl(result.entity_type, result.entity_id);
    addRecentSearch(query);
    setIsOpen(false);
    clearQuery();
    setIsMobileOpen(false);
    router.push(url);
  };

  const handleRecentSearchClick = (searchQuery: string) => {
    setQuery(searchQuery);
    inputRef.current?.focus();
  };

  const handleClearClick = () => {
    clearQuery();
    setIsOpen(false);
    inputRef.current?.focus();
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(e.target.value);
    setIsOpen(true);
  };

  const handleInputFocus = () => {
    setIsOpen(true);
  };

  // Determine if dropdown should be visible
  const showDropdown =
    isOpen &&
    (isLoading || hasResults || isEmpty || (query === '' && recentSearches.length > 0));

  return (
    <div ref={containerRef} className="relative">
      {/* Mobile: compact search button */}
      <div className="lg:hidden">
        {!isMobileOpen ? (
          <button
            type="button"
            className="btn btn-ghost btn-circle"
            onClick={() => {
              setIsMobileOpen(true);
              setTimeout(() => inputRef.current?.focus(), 100);
            }}
            aria-label="Search"
          >
            <i className="fa-duotone fa-regular fa-magnifying-glass text-lg"></i>
          </button>
        ) : (
          <div className="flex items-center gap-2 w-full">
            <label className="input input-sm flex-1">
              <i className="fa-duotone fa-regular fa-magnifying-glass opacity-50"></i>
              <input
                ref={inputRef}
                type="search"
                className="grow"
                placeholder="Search..."
                value={query}
                onChange={handleInputChange}
                onFocus={handleInputFocus}
                onKeyDown={handleKeyDown}
              />
              {query && (
                <button
                  type="button"
                  className="btn btn-ghost btn-xs btn-circle"
                  onClick={handleClearClick}
                  aria-label="Clear search"
                >
                  <i className="fa-duotone fa-regular fa-xmark text-sm"></i>
                </button>
              )}
            </label>
            <button
              type="button"
              className="btn btn-ghost btn-sm btn-circle"
              onClick={() => {
                setIsMobileOpen(false);
                clearQuery();
                setIsOpen(false);
              }}
              aria-label="Close search"
            >
              <i className="fa-duotone fa-regular fa-xmark"></i>
            </button>
          </div>
        )}
      </div>

      {/* Desktop: full search input */}
      <div className="hidden lg:block">
        <label className="input input-sm w-full">
          <i className="fa-duotone fa-regular fa-magnifying-glass opacity-50"></i>
          <input
            ref={inputRef}
            type="search"
            className="grow"
            placeholder="Search... (Cmd+K)"
            value={query}
            onChange={handleInputChange}
            onFocus={handleInputFocus}
            onKeyDown={handleKeyDown}
          />
          {query && (
            <button
              type="button"
              className="btn btn-ghost btn-xs btn-circle"
              onClick={handleClearClick}
              aria-label="Clear search"
            >
              <i className="fa-duotone fa-regular fa-xmark text-sm"></i>
            </button>
          )}
          {!query && (
            <kbd className="kbd kbd-sm">Ctrl+K</kbd>
          )}
        </label>
      </div>

      {/* Dropdown */}
      {showDropdown && (
        <div
          className="absolute top-full left-0 right-0 mt-1 bg-base-100 shadow-lg border border-base-300 rounded-box z-50 max-h-96 overflow-y-auto"
          onMouseDown={(e) => e.preventDefault()} // Prevent blur when clicking dropdown
        >
          {/* Loading state */}
          {isLoading && (
            <div className="flex flex-col items-center justify-center py-8 text-base-content/60">
              <span className="loading loading-spinner loading-sm mb-2"></span>
              <span className="text-sm">Searching...</span>
            </div>
          )}

          {/* Results */}
          {!isLoading && hasResults && (
            <div>
              {groups.map((group) => {
                if (group.results.length === 0) return null;

                const config = ENTITY_TYPE_CONFIG[group.entity_type];
                const groupStartIndex = allResults.findIndex(
                  (r) => r.entity_type === group.entity_type
                );

                return (
                  <div key={group.entity_type}>
                    {/* Group header */}
                    <div className="sticky top-0 bg-base-100 text-xs font-semibold uppercase tracking-wider text-base-content/60 px-3 py-1.5 border-b border-base-200 flex items-center gap-2">
                      <i className={`fa-duotone fa-regular ${config.icon}`}></i>
                      <span>
                        {config.label} ({group.results.length})
                      </span>
                    </div>

                    {/* Results */}
                    {group.results.map((result, localIndex) => {
                      const globalIndex = groupStartIndex + localIndex;
                      return (
                        <SearchResultItem
                          key={result.entity_id}
                          result={result}
                          query={query}
                          isActive={activeIndex === globalIndex}
                          onClick={() => handleResultClick(result)}
                        />
                      );
                    })}
                  </div>
                );
              })}
            </div>
          )}

          {/* Empty state */}
          {!isLoading && isEmpty && (
            <div className="flex flex-col items-center justify-center py-8 text-base-content/60">
              <i className="fa-duotone fa-regular fa-face-thinking text-3xl mb-2"></i>
              <p className="text-sm">No results found for &quot;{query}&quot;</p>
            </div>
          )}

          {/* Recent searches */}
          {!isLoading && query === '' && recentSearches.length > 0 && (
            <div>
              {/* Header */}
              <div className="flex items-center justify-between px-3 py-2 border-b border-base-200">
                <span className="text-xs font-semibold uppercase tracking-wider text-base-content/60">
                  Recent Searches
                </span>
                <button
                  type="button"
                  className="btn btn-ghost btn-xs"
                  onClick={clearRecentSearches}
                >
                  Clear
                </button>
              </div>

              {/* List */}
              <div>
                {recentSearches.map((search, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-3 px-3 py-2.5 cursor-pointer hover:bg-base-200 transition-colors"
                    onClick={() => handleRecentSearchClick(search)}
                  >
                    <i className="fa-duotone fa-regular fa-clock-rotate-left text-base-content/50"></i>
                    <span className="text-sm">{search}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
