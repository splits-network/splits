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
import { CompanyInvitation, InvitationFilters } from "../types";

const STATS_VISIBLE_KEY = "inviteCompaniesStatsVisible";

interface InvitationFilterContextValue
    extends UseStandardListReturn<CompanyInvitation, InvitationFilters> {
    showStats: boolean;
    setShowStats: (show: boolean) => void;
}

const InvitationFilterContext =
    createContext<InvitationFilterContextValue | null>(null);

interface InvitationFilterProviderProps {
    children: ReactNode;
}

export function InvitationFilterProvider({
    children,
}: InvitationFilterProviderProps) {
    // Stats visibility state with localStorage persistence
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

    const defaultFilters = useMemo<InvitationFilters>(
        () => ({
            status: undefined,
        }),
        [],
    );

    const listState = useStandardList<CompanyInvitation, InvitationFilters>({
        endpoint: "/company-invitations",
        defaultFilters,
        defaultSortBy: "created_at",
        defaultSortOrder: "desc",
        defaultLimit: 25,
        syncToUrl: true,
    });

    const contextValue: InvitationFilterContextValue = {
        ...listState,
        showStats: statsLoaded ? showStats : true,
        setShowStats,
    };

    return (
        <InvitationFilterContext.Provider value={contextValue}>
            {children}
        </InvitationFilterContext.Provider>
    );
}

export function useInvitationFilter() {
    const context = useContext(InvitationFilterContext);
    if (!context) {
        throw new Error(
            "useInvitationFilter must be used within InvitationFilterProvider",
        );
    }
    return context;
}
