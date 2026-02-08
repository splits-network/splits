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
import type { Application, ApplicationFilters } from "../types";

const STATS_VISIBLE_KEY = "applicationsStatsVisible";

interface FilterContextValue
    extends UseStandardListReturn<Application, ApplicationFilters> {
    showStats: boolean;
    setShowStats: (show: boolean) => void;
}

const FilterContext = createContext<FilterContextValue | null>(null);

export function FilterProvider({ children }: { children: ReactNode }) {
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

    const defaultFilters = useMemo<ApplicationFilters>(
        () => ({ stage: undefined }),
        [],
    );

    const listState = useStandardList<Application, ApplicationFilters>({
        endpoint: "/applications",
        include: "job,recruiter,ai_review",
        defaultFilters,
        defaultSortBy: "created_at",
        defaultSortOrder: "desc",
        defaultLimit: 25,
        syncToUrl: true,
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
