"use client";

import {
    createContext,
    useContext,
    useState,
    useEffect,
    useCallback,
    useMemo,
    ReactNode,
} from "react";
import {
    useStandardList,
    UseStandardListReturn,
} from "@/hooks/use-standard-list";
import { Candidate, CandidateFilters, CandidateScope } from "../types";

const STATS_VISIBLE_KEY = "candidatesNewStatsVisible";
const SCOPE_KEY = "candidatesNewScope";

interface FilterContextValue extends UseStandardListReturn<Candidate, CandidateFilters> {
    showStats: boolean;
    setShowStats: (show: boolean) => void;
    scope: CandidateScope;
    setScope: (scope: CandidateScope) => void;
}

const FilterContext = createContext<FilterContextValue | null>(null);

export function FilterProvider({ children }: { children: ReactNode }) {
    const [showStats, setShowStatsState] = useState(true);
    const [statsLoaded, setStatsLoaded] = useState(false);

    const [scope, setScopeState] = useState<CandidateScope>("mine");
    const [scopeLoaded, setScopeLoaded] = useState(false);

    useEffect(() => {
        if (typeof window !== "undefined") {
            const savedStats = localStorage.getItem(STATS_VISIBLE_KEY);
            if (savedStats !== null) setShowStatsState(savedStats === "true");
            setStatsLoaded(true);

            const savedScope = localStorage.getItem(SCOPE_KEY) as CandidateScope | null;
            if (savedScope === "mine" || savedScope === "all") {
                setScopeState(savedScope);
            }
            setScopeLoaded(true);
        }
    }, []);

    const setShowStats = useCallback((show: boolean) => {
        setShowStatsState(show);
        if (typeof window !== "undefined") {
            localStorage.setItem(STATS_VISIBLE_KEY, String(show));
        }
    }, []);

    const setScope = useCallback((newScope: CandidateScope) => {
        setScopeState(newScope);
        if (typeof window !== "undefined") {
            localStorage.setItem(SCOPE_KEY, newScope);
        }
    }, []);

    const defaultFilters = useMemo<CandidateFilters>(
        () => ({
            scope: scopeLoaded ? scope : "mine",
        }),
        [scope, scopeLoaded],
    );

    const listState = useStandardList<Candidate, CandidateFilters>({
        endpoint: "/candidates",
        defaultFilters,
        defaultSortBy: "created_at",
        defaultSortOrder: "desc",
        defaultLimit: 25,
        syncToUrl: true,
    });

    // Sync scope changes into the filter
    useEffect(() => {
        if (scopeLoaded) {
            listState.setFilter("scope", scope);
        }
    }, [scope, scopeLoaded]);

    const contextValue: FilterContextValue = {
        ...listState,
        showStats: statsLoaded ? showStats : true,
        setShowStats,
        scope: scopeLoaded ? scope : "mine",
        setScope,
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
