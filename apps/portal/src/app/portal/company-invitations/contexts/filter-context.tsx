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
import { RecruiterCompanyRelationship, ConnectionFilters } from "../types";

const STATS_VISIBLE_KEY = "companyInvitationsStatsVisible";

interface ConnectionFilterContextValue
    extends UseStandardListReturn<RecruiterCompanyRelationship, ConnectionFilters> {
    showStats: boolean;
    setShowStats: (show: boolean) => void;
}

const ConnectionFilterContext =
    createContext<ConnectionFilterContextValue | null>(null);

interface ConnectionFilterProviderProps {
    children: ReactNode;
}

export function ConnectionFilterProvider({
    children,
}: ConnectionFilterProviderProps) {
    const [showStats, setShowStatsState] = useState(true);
    const [statsLoaded, setStatsLoaded] = useState(false);

    useEffect(() => {
        if (typeof window !== "undefined") {
            const stored = localStorage.getItem(STATS_VISIBLE_KEY);
            if (stored !== null) {
                setShowStatsState(stored === "true");
            }
            setStatsLoaded(true);
        }
    }, []);

    const setShowStats = useCallback((show: boolean) => {
        setShowStatsState(show);
        if (typeof window !== "undefined") {
            localStorage.setItem(STATS_VISIBLE_KEY, String(show));
        }
    }, []);

    const defaultFilters = useMemo<ConnectionFilters>(
        () => ({
            status: undefined,
        }),
        [],
    );

    const listState = useStandardList<RecruiterCompanyRelationship, ConnectionFilters>({
        endpoint: "/recruiter-companies",
        defaultFilters,
        defaultSortBy: "created_at",
        defaultSortOrder: "desc",
        defaultLimit: 25,
        syncToUrl: true,
    });

    const contextValue: ConnectionFilterContextValue = {
        ...listState,
        showStats: statsLoaded ? showStats : true,
        setShowStats,
    };

    return (
        <ConnectionFilterContext.Provider value={contextValue}>
            {children}
        </ConnectionFilterContext.Provider>
    );
}

export function useConnectionFilter() {
    const context = useContext(ConnectionFilterContext);
    if (!context) {
        throw new Error(
            "useConnectionFilter must be used within ConnectionFilterProvider",
        );
    }
    return context;
}

export function useConnectionFilterOptional() {
    return useContext(ConnectionFilterContext);
}
