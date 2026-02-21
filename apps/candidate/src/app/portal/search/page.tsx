"use client";

import { useRef, useState, Suspense } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { BaselEmptyState } from "@splits-network/basel-ui";
import { useFullSearch, SORT_OPTIONS, PER_PAGE_OPTIONS } from "@/hooks/use-full-search";
import type { SortOption, PerPage } from "@/hooks/use-full-search";
import { ENTITY_TYPE_CONFIG, FILTER_LABELS } from "@/types/search";
import type { SearchableEntityType, SearchFilters } from "@/types/search";
import { SearchResultCard } from "@/components/basel/search/search-result-card";
import { SearchPagination } from "@/components/basel/search/search-pagination";
import { SearchFilterPanel } from "@/components/basel/search/search-filter-panel";

/* ─── Entity filter list ─────────────────────────────────────────────────── */

const ENTITY_FILTERS: {
    type: SearchableEntityType;
    label: string;
    icon: string;
}[] = [
    { type: "job", label: "Roles", icon: ENTITY_TYPE_CONFIG.job.icon },
    { type: "company", label: "Companies", icon: ENTITY_TYPE_CONFIG.company.icon },
    { type: "recruiter", label: "Recruiters", icon: ENTITY_TYPE_CONFIG.recruiter.icon },
];

/* ─── Animation constants ────────────────────────────────────────────────── */

const D = { fast: 0.4, normal: 0.6, slow: 0.9 };
const E = { editorial: "power3.out" };

/* ─── Inner page ─────────────────────────────────────────────────────────── */

function SearchPageInner() {
    const mainRef = useRef<HTMLElement>(null);
    const [saveDialogOpen, setSaveDialogOpen] = useState(false);
    const [saveName, setSaveName] = useState("");
    const [showSavedPanel, setShowSavedPanel] = useState(false);

    const {
        query,
        setQuery,
        results,
        pagination,
        isLoading,
        isEmpty,
        selectedEntityTypes,
        toggleEntityType,
        clearEntityTypes,
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
    } = useFullSearch();

    /* ─── GSAP ─────────────────────────────────────────────────────── */

    useGSAP(
        () => {
            if (!mainRef.current) return;
            if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
                gsap.set(
                    mainRef.current.querySelectorAll("[class*='opacity-0']"),
                    { opacity: 1 },
                );
                return;
            }

            const $ = (sel: string) => mainRef.current!.querySelectorAll(sel);
            const $1 = (sel: string) => mainRef.current!.querySelector(sel);
            const tl = gsap.timeline({ defaults: { ease: E.editorial } });

            const kicker = $1(".search-kicker");
            if (kicker)
                tl.fromTo(kicker, { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: D.fast });

            const words = $(".search-title-word");
            if (words.length)
                tl.fromTo(
                    words,
                    { opacity: 0, y: 60, rotateX: 30 },
                    { opacity: 1, y: 0, rotateX: 0, duration: D.slow, stagger: 0.1 },
                    "-=0.2",
                );

            const searchBar = $1(".search-bar-main");
            if (searchBar)
                tl.fromTo(
                    searchBar,
                    { opacity: 0, y: 20 },
                    { opacity: 1, y: 0, duration: D.fast },
                    "-=0.3",
                );

            const content = $1(".search-content");
            if (content)
                tl.fromTo(
                    content,
                    { opacity: 0, y: 30 },
                    { opacity: 1, y: 0, duration: D.normal },
                    "-=0.2",
                );
        },
        { scope: mainRef },
    );

    /* ─── Handlers ─────────────────────────────────────────────────── */

    const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Enter") {
            e.preventDefault();
            addRecentSearch(query);
            executeSearch();
        }
    };

    const handleSaveSearch = () => {
        if (!saveName.trim()) return;
        saveCurrentSearch(saveName.trim());
        setSaveName("");
        setSaveDialogOpen(false);
    };

    /* ─── Derived ──────────────────────────────────────────────────── */

    const hasResults = results.length > 0;
    const showInitial = !query || query.trim().length < 2;
    const hasActiveFilters = selectedEntityTypes.length > 0 || activeFilterCount > 0;

    /* ─── Active filter pills ──────────────────────────────────────── */

    const entityPills = selectedEntityTypes.map((type) => ({
        key: `type-${type}`,
        label: "Type",
        value: ENTITY_TYPE_CONFIG[type].label,
        onRemove: () => toggleEntityType(type),
    }));

    const fieldPills = Object.entries(filters)
        .filter(([, v]) => v !== undefined && v !== "")
        .map(([key, value]) => {
            const filterKey = key as keyof SearchFilters;
            const label = FILTER_LABELS[filterKey] || key;
            let display: string;
            if (typeof value === "boolean") {
                display = "Yes";
            } else if (Array.isArray(value)) {
                display = value.join(", ");
            } else if (typeof value === "number") {
                display = `$${value.toLocaleString()}`;
            } else {
                display = String(value);
            }
            return {
                key: `filter-${key}`,
                label,
                value: display,
                onRemove: () => removeFilter(filterKey),
            };
        });

    const allPills = [...entityPills, ...fieldPills];

    return (
        <main ref={mainRef} className="min-h-screen bg-base-100">
            {/* ══════════════════════════════════════════════════════════
                HEADER
               ══════════════════════════════════════════════════════════ */}
            <section className="relative bg-neutral text-neutral-content py-14 lg:py-18">
                <div
                    className="absolute top-0 right-0 w-1/3 h-full bg-primary/10"
                    style={{ clipPath: "polygon(20% 0,100% 0,100% 100%,0% 100%)" }}
                />
                <div className="relative z-10 container mx-auto px-6 lg:px-12">
                    <p className="search-kicker text-sm font-semibold uppercase tracking-[0.2em] text-secondary mb-4 opacity-0">
                        Discover Opportunities
                    </p>
                    <h1 className="text-4xl md:text-5xl font-black leading-[0.92] tracking-tight mb-6">
                        <span className="search-title-word inline-block opacity-0">
                            Find your
                        </span>{" "}
                        <span className="search-title-word inline-block opacity-0 text-primary">
                            next opportunity.
                        </span>
                    </h1>

                    {/* Search bar */}
                    <div className="search-bar-main opacity-0 max-w-2xl">
                        <div className="relative">
                            <i className="fa-duotone fa-regular fa-magnifying-glass absolute left-4 top-1/2 -translate-y-1/2 text-neutral-content/40" />
                            <input
                                type="text"
                                value={query}
                                onChange={(e) => setQuery(e.target.value)}
                                onKeyDown={handleSearchKeyDown}
                                placeholder="Search roles, companies, recruiters..."
                                className="input w-full pl-12 pr-24 bg-neutral-content/10 border-neutral-content/10 text-neutral-content placeholder:text-neutral-content/30 focus:border-primary focus:outline-none h-14 text-lg"
                                autoFocus
                            />
                            <button
                                onClick={() => {
                                    addRecentSearch(query);
                                    executeSearch();
                                }}
                                className="btn btn-primary absolute right-1.5 top-1/2 -translate-y-1/2"
                            >
                                Search
                            </button>
                        </div>
                    </div>
                </div>
            </section>

            {/* ══════════════════════════════════════════════════════════
                ACTIVE FILTERS BAR
               ══════════════════════════════════════════════════════════ */}
            {hasActiveFilters && (
                <section className="bg-base-200 border-b border-base-300 py-3">
                    <div className="container mx-auto px-6 lg:px-12">
                        <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-sm font-semibold text-base-content/40 uppercase tracking-wider">
                                Active:
                            </span>
                            {allPills.map((pill) => (
                                <button
                                    key={pill.key}
                                    onClick={pill.onRemove}
                                    className="flex items-center gap-1.5 px-3 py-1 bg-primary text-primary-content text-sm font-semibold"
                                >
                                    <span className="opacity-70">{pill.label}:</span>{" "}
                                    {pill.value}
                                    <i className="fa-solid fa-xmark text-[9px] ml-1 hover:opacity-70" />
                                </button>
                            ))}
                            <button
                                onClick={() => {
                                    clearEntityTypes();
                                    clearAllFilters();
                                }}
                                className="text-sm text-error font-semibold hover:underline ml-2"
                            >
                                Clear all
                            </button>
                        </div>
                    </div>
                </section>
            )}

            {/* ══════════════════════════════════════════════════════════
                CONTENT
               ══════════════════════════════════════════════════════════ */}
            <section className="search-content opacity-0 container mx-auto px-6 lg:px-12 py-8 lg:py-12">
                <div className="grid lg:grid-cols-5 gap-8">
                    {/* ──────────────────────────────────────────────────
                        SIDEBAR
                       ────────────────────────────────────────────────── */}
                    <div className="lg:col-span-1">
                        <div className="space-y-6">
                            {/* Entity Type Filters */}
                            <div>
                                <h3 className="text-sm font-semibold uppercase tracking-[0.2em] text-base-content/40 mb-3">
                                    Search In
                                </h3>
                                <div className="space-y-1.5">
                                    {ENTITY_FILTERS.map((f) => (
                                        <label
                                            key={f.type}
                                            className={`flex items-center gap-2 p-2 cursor-pointer transition-all text-sm ${
                                                selectedEntityTypes.includes(f.type)
                                                    ? "bg-primary/5 text-base-content font-semibold"
                                                    : "text-base-content/60 hover:bg-base-200"
                                            }`}
                                        >
                                            <input
                                                type="checkbox"
                                                checked={selectedEntityTypes.includes(f.type)}
                                                onChange={() => toggleEntityType(f.type)}
                                                className="checkbox checkbox-primary checkbox-xs"
                                            />
                                            <i
                                                className={`fa-duotone fa-regular ${f.icon} text-sm w-4 text-center`}
                                            />
                                            {f.label}
                                        </label>
                                    ))}
                                </div>
                            </div>

                            {/* Sort */}
                            <div>
                                <h3 className="text-sm font-semibold uppercase tracking-[0.2em] text-base-content/40 mb-3">
                                    Sort By
                                </h3>
                                <select
                                    value={sortBy}
                                    onChange={(e) => setSortBy(e.target.value as SortOption)}
                                    className="select select-sm w-full bg-base-200 border-base-300 text-sm"
                                >
                                    {SORT_OPTIONS.map((o) => (
                                        <option key={o.value} value={o.value}>
                                            {o.label}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* Results Per Page */}
                            <div>
                                <h3 className="text-sm font-semibold uppercase tracking-[0.2em] text-base-content/40 mb-3">
                                    Per Page
                                </h3>
                                <div className="flex gap-1.5">
                                    {PER_PAGE_OPTIONS.map((n) => (
                                        <button
                                            key={n}
                                            onClick={() => setPerPage(n as PerPage)}
                                            className={`btn btn-xs ${
                                                perPage === n ? "btn-primary" : "btn-ghost"
                                            }`}
                                        >
                                            {n}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Saved Searches */}
                            <div>
                                <div className="flex items-center justify-between mb-3">
                                    <h3 className="text-sm font-semibold uppercase tracking-[0.2em] text-base-content/40">
                                        Saved Searches
                                    </h3>
                                    {savedSearches.length > 0 && (
                                        <button
                                            onClick={() => setShowSavedPanel(!showSavedPanel)}
                                            className="text-sm text-primary font-semibold"
                                        >
                                            {showSavedPanel ? "Hide" : `Show (${savedSearches.length})`}
                                        </button>
                                    )}
                                </div>

                                {/* Save current */}
                                {query.trim().length >= 2 && !isCurrentSearchSaved && (
                                    <>
                                        {!saveDialogOpen ? (
                                            <button
                                                onClick={() => setSaveDialogOpen(true)}
                                                className="btn btn-sm btn-ghost w-full justify-start gap-2 text-sm"
                                            >
                                                <i className="fa-regular fa-bookmark text-sm" />
                                                Save current search
                                            </button>
                                        ) : (
                                            <div className="flex gap-1.5">
                                                <input
                                                    type="text"
                                                    value={saveName}
                                                    onChange={(e) => setSaveName(e.target.value)}
                                                    onKeyDown={(e) => {
                                                        if (e.key === "Enter") handleSaveSearch();
                                                        if (e.key === "Escape") setSaveDialogOpen(false);
                                                    }}
                                                    placeholder="Name this search..."
                                                    className="input input-sm flex-1 bg-base-200 border-base-300"
                                                    autoFocus
                                                />
                                                <button
                                                    onClick={handleSaveSearch}
                                                    className="btn btn-sm btn-primary"
                                                >
                                                    <i className="fa-solid fa-check text-sm" />
                                                </button>
                                            </div>
                                        )}
                                    </>
                                )}

                                {isCurrentSearchSaved && query.trim().length >= 2 && (
                                    <div className="flex items-center gap-2 text-sm text-success font-semibold p-2">
                                        <i className="fa-solid fa-bookmark text-sm" />
                                        Search saved
                                    </div>
                                )}

                                {/* Saved list */}
                                {showSavedPanel && savedSearches.length > 0 && (
                                    <div className="mt-2 space-y-1">
                                        {savedSearches.map((s) => (
                                            <div
                                                key={s.id}
                                                className="flex items-center justify-between p-2 bg-base-200 group"
                                            >
                                                <button
                                                    onClick={() => loadSavedSearch(s)}
                                                    className="flex-1 text-left text-sm font-semibold truncate hover:text-primary transition-colors"
                                                >
                                                    {s.name}
                                                    <span className="block text-sm text-base-content/40 font-normal truncate">
                                                        &quot;{s.query}&quot;
                                                        {s.entityTypes.length > 0 && (
                                                            <> &middot; {s.entityTypes.length} filter{s.entityTypes.length !== 1 && "s"}</>
                                                        )}
                                                    </span>
                                                </button>
                                                <button
                                                    onClick={() => removeSavedSearch(s.id)}
                                                    className="btn btn-ghost btn-xs opacity-0 group-hover:opacity-100 transition-opacity"
                                                >
                                                    <i className="fa-solid fa-xmark text-sm" />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                )}

                                {savedSearches.length === 0 && (
                                    <p className="text-sm text-base-content/30">
                                        No saved searches yet
                                    </p>
                                )}
                            </div>

                            {/* ── Field-Level Filters ───────────────── */}
                            <SearchFilterPanel
                                filters={filters}
                                setFilter={setFilter}
                                removeFilter={removeFilter}
                                clearAllFilters={clearAllFilters}
                                activeFilterCount={activeFilterCount}
                                selectedEntityTypes={selectedEntityTypes}
                            />

                            {/* Recent Searches */}
                            <div>
                                <div className="flex items-center justify-between mb-3">
                                    <h3 className="text-sm font-semibold uppercase tracking-[0.2em] text-base-content/40">
                                        Recent
                                    </h3>
                                    {recentSearches.length > 0 && (
                                        <button
                                            onClick={clearRecentSearches}
                                            className="text-sm text-base-content/40 hover:text-error transition-colors"
                                        >
                                            Clear
                                        </button>
                                    )}
                                </div>
                                {recentSearches.length > 0 ? (
                                    <div className="space-y-0.5">
                                        {recentSearches.map((search, idx) => (
                                            <button
                                                key={idx}
                                                onClick={() => setQuery(search)}
                                                className="flex items-center gap-2 w-full text-left p-1.5 text-sm text-base-content/60 hover:text-base-content hover:bg-base-200 transition-colors"
                                            >
                                                <i className="fa-duotone fa-regular fa-clock-rotate-left text-sm" />
                                                <span className="truncate">{search}</span>
                                            </button>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="text-sm text-base-content/30">
                                        No recent searches
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* ──────────────────────────────────────────────────
                        RESULTS AREA
                       ────────────────────────────────────────────────── */}
                    <div className="lg:col-span-4">
                        {/* Results header bar */}
                        {!showInitial && (
                            <div className="flex items-center justify-between mb-6">
                                <span className="text-sm text-base-content/50">
                                    {isLoading ? (
                                        <span className="flex items-center gap-2">
                                            <span className="loading loading-spinner loading-xs" />
                                            Searching...
                                        </span>
                                    ) : pagination ? (
                                        <>
                                            <strong className="text-base-content">
                                                {pagination.total}
                                            </strong>{" "}
                                            {pagination.total === 1 ? "result" : "results"}
                                            {selectedEntityTypes.length > 0 && (
                                                <span className="text-base-content/30">
                                                    {" "}
                                                    in{" "}
                                                    {selectedEntityTypes
                                                        .map((t) => ENTITY_TYPE_CONFIG[t].label.toLowerCase())
                                                        .join(", ")}
                                                </span>
                                            )}
                                        </>
                                    ) : null}
                                </span>

                                {/* Mobile sort */}
                                <div className="lg:hidden">
                                    <select
                                        value={sortBy}
                                        onChange={(e) => setSortBy(e.target.value as SortOption)}
                                        className="select select-sm bg-base-200 border-base-300 text-sm"
                                    >
                                        {SORT_OPTIONS.map((o) => (
                                            <option key={o.value} value={o.value}>
                                                {o.label}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                        )}

                        {/* Loading skeleton */}
                        {isLoading && (
                            <div className="space-y-3">
                                {Array.from({ length: 5 }).map((_, i) => (
                                    <div
                                        key={i}
                                        className="p-5 bg-base-200 border border-base-300 animate-pulse"
                                    >
                                        <div className="flex items-start gap-4">
                                            <div className="w-11 h-11 bg-base-300" />
                                            <div className="flex-1 space-y-2">
                                                <div className="h-4 bg-base-300 w-1/3" />
                                                <div className="h-3 bg-base-300 w-1/2" />
                                                <div className="flex gap-3">
                                                    <div className="h-3 bg-base-300 w-20" />
                                                    <div className="h-3 bg-base-300 w-24" />
                                                    <div className="h-3 bg-base-300 w-16" />
                                                </div>
                                            </div>
                                            <div className="h-5 bg-base-300 w-16" />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* Results */}
                        {!isLoading && hasResults && (
                            <>
                                <div className="space-y-3">
                                    {results.map((result, idx) => (
                                        <SearchResultCard
                                            key={`${result.entity_type}-${result.entity_id}`}
                                            result={result}
                                            query={query}
                                            isTopResult={idx === 0 && page === 1}
                                        />
                                    ))}
                                </div>

                                {pagination && pagination.total_pages > 1 && (
                                    <SearchPagination
                                        pagination={pagination}
                                        onPageChange={setPage}
                                    />
                                )}
                            </>
                        )}

                        {/* Empty state — no results */}
                        {isEmpty && (
                            <BaselEmptyState
                                icon="fa-duotone fa-regular fa-magnifying-glass"
                                title="No results found"
                                subtitle={`Nothing matched "${query}"`}
                                description="Try adjusting your search terms or removing filters to find what you're looking for."
                                suggestions={[
                                    "Check for typos in your search",
                                    "Try broader or different keywords",
                                    "Remove filters to search all types",
                                    "Use quotes for exact phrase matching",
                                ]}
                            />
                        )}

                        {/* Initial state — no query */}
                        {showInitial && !isLoading && (
                            <BaselEmptyState
                                icon="fa-duotone fa-regular fa-telescope"
                                iconColor="text-secondary"
                                iconBg="bg-secondary/10"
                                title="Discover opportunities"
                                description="Search across roles, companies, and recruiters to find the perfect match for your career. Use the sidebar filters to narrow results by type, salary, location preference, and more."
                                suggestions={[
                                    "Search by job title, company name, or keyword",
                                    "Filter by employment type, salary range, or commute",
                                    "Find recruiters specializing in your industry",
                                    "Save frequent searches for quick access",
                                ]}
                            />
                        )}
                    </div>
                </div>
            </section>
        </main>
    );
}

/* ─── Page export ────────────────────────────────────────────────────────── */

export default function SearchPage() {
    return (
        <Suspense
            fallback={
                <main className="min-h-screen bg-base-100">
                    <section className="bg-neutral text-neutral-content py-14 lg:py-18">
                        <div className="container mx-auto px-6 lg:px-12">
                            <div className="h-6 w-32 bg-neutral-content/10 mb-4 animate-pulse" />
                            <div className="h-12 w-64 bg-neutral-content/10 mb-6 animate-pulse" />
                            <div className="h-14 max-w-2xl bg-neutral-content/10 animate-pulse" />
                        </div>
                    </section>
                </main>
            }
        >
            <SearchPageInner />
        </Suspense>
    );
}
