"use client";

import {
    createContext,
    useContext,
    useState,
    useEffect,
    useCallback,
    useMemo,
    type ReactNode,
} from "react";
import {
    useStandardList,
    type UseStandardListReturn,
} from "@/hooks/use-standard-list";
import type { PaginationResponse } from "@splits-network/shared-types";
import type { Job, JobFilters } from "../types";

const STATS_VISIBLE_KEY = "publicJobsStatsVisible";

interface FilterContextValue
    extends UseStandardListReturn<Job, JobFilters> {
    showStats: boolean;
    setShowStats: (show: boolean) => void;
}

const FilterContext = createContext<FilterContextValue | null>(null);

interface FilterProviderProps {
    children: ReactNode;
    initialData?: Job[];
    initialPagination?: PaginationResponse;
}

export function FilterProvider({
    children,
    initialData,
    initialPagination,
}: FilterProviderProps) {
    // Stats visibility with localStorage persistence
    const [showStats, setShowStatsState] = useState(true);
    const [statsLoaded, setStatsLoaded] = useState(false);

    useEffect(() => {
        if (typeof window !== "undefined") {
            const stored = localStorage.getItem(STATS_VISIBLE_KEY);
            if (stored !== null) setShowStatsState(stored === "true");
            setStatsLoaded(true);
        }
    }, []);

    const setShowStats = useCallback((show: boolean) => {
        setShowStatsState(show);
        if (typeof window !== "undefined") {
            localStorage.setItem(STATS_VISIBLE_KEY, String(show));
        }
    }, []);

    const defaultFilters = useMemo<JobFilters>(
        () => ({ employment_type: undefined }),
        [],
    );

    const listState = useStandardList<Job, JobFilters>({
        endpoint: "/jobs",
        defaultFilters,
        defaultSortBy: "updated_at",
        defaultSortOrder: "desc",
        defaultLimit: 24,
        syncToUrl: true,
        autoFetch: true,
        requireAuth: false,
        initialData,
        initialPagination,
    });

    const contextValue: FilterContextValue = {
        ...listState,
        showStats: statsLoaded ? showStats : true,
        setShowStats,
    };

    return (
        <FilterContext.Provider value={contextValue}>
            {children}
        </FilterContext.Provider>
    );
}

export function useFilter() {
    const context = useContext(FilterContext);
    if (!context) {
        throw new Error("useFilter must be used within FilterProvider");
    }
    return context;
}
