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
import { useAuth } from "@clerk/nextjs";
import {
    useStandardList,
    UseStandardListReturn,
} from "@/hooks/use-standard-list";
import { useUserProfile } from "@/contexts";
import { createAuthenticatedClient } from "@/lib/api-client";
import { RecruiterWithUser, MarketplaceFilters, Company, CompanyRecruiterRelationship } from "../types";

const STATS_VISIBLE_KEY = "recruiterMarketplaceStatsVisible";

interface FilterContextValue
    extends UseStandardListReturn<RecruiterWithUser, MarketplaceFilters> {
    showStats: boolean;
    setShowStats: (show: boolean) => void;
    companies: Company[];
    canInvite: boolean;
    recruiterRelationships: Map<string, CompanyRecruiterRelationship>;
    refreshRelationships: () => void;
}

const FilterContext = createContext<FilterContextValue | null>(null);

export function FilterProvider({ children }: { children: ReactNode }) {
    const { getToken } = useAuth();
    const { isCompanyUser, isAdmin, profile } = useUserProfile();

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

    // Default filters: only active marketplace-enabled recruiters
    const defaultFilters = useMemo<MarketplaceFilters>(
        () => ({
            status: "active",
            marketplace_enabled: true,
        }),
        [],
    );

    const listState = useStandardList<RecruiterWithUser, MarketplaceFilters>({
        endpoint: "/recruiters",
        include: "user,reputation",
        defaultFilters,
        defaultSortBy: "created_at",
        defaultSortOrder: "desc",
        defaultLimit: 25,
        syncToUrl: true,
    });

    // Load companies for invite modal
    const [companies, setCompanies] = useState<Company[]>([]);

    useEffect(() => {
        const loadCompanies = async () => {
            if (!isCompanyUser && !isAdmin) return;
            if (!profile?.organization_ids?.length) return;

            try {
                const token = await getToken();
                if (!token) return;

                const client = createAuthenticatedClient(token);
                const response: any = await client.get("/companies");
                const allCompanies = response?.data || [];

                const userCompanies = allCompanies.filter((c: Company) =>
                    profile.organization_ids.includes(
                        c.identity_organization_id || "",
                    ),
                );
                setCompanies(userCompanies);
            } catch (err) {
                console.error("Failed to load companies:", err);
            }
        };

        loadCompanies();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isCompanyUser, isAdmin, profile?.organization_ids]);

    const canInvite = (isCompanyUser || isAdmin) && companies.length > 0;

    // Load recruiter-company relationships for company users (enables terminate flow)
    const [recruiterRelationships, setRecruiterRelationships] = useState<Map<string, CompanyRecruiterRelationship>>(new Map());

    const loadRelationships = useCallback(async () => {
        if (!companies.length) return;

        try {
            const token = await getToken();
            if (!token) return;

            const client = createAuthenticatedClient(token);
            const companyIds = companies.map((c) => c.id);

            // Load active relationships for all user's companies
            const allRelationships: CompanyRecruiterRelationship[] = [];
            for (const companyId of companyIds) {
                try {
                    const response: any = await client.get("/recruiter-companies", {
                        params: { company_id: companyId, status: "active", limit: 100 },
                    });
                    const rels = response?.data || [];
                    allRelationships.push(...rels);
                } catch {
                    // Skip failed company lookups
                }
            }

            // Build map: recruiter_id → relationship
            const relMap = new Map<string, CompanyRecruiterRelationship>();
            allRelationships.forEach((rel) => {
                relMap.set(rel.recruiter_id, rel);
            });
            setRecruiterRelationships(relMap);
        } catch (err) {
            console.error("Failed to load recruiter relationships:", err);
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [companies]);

    useEffect(() => {
        if (companies.length > 0 && (isCompanyUser || isAdmin)) {
            loadRelationships();
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [companies]);

    const contextValue: FilterContextValue = {
        ...listState,
        showStats: statsLoaded ? showStats : true,
        setShowStats,
        companies,
        canInvite,
        recruiterRelationships,
        refreshRelationships: loadRelationships,
    };

    return (
        <FilterContext.Provider value={contextValue}>
            {children}
        </FilterContext.Provider>
    );
}

export function useRecruiterFilter() {
    const context = useContext(FilterContext);
    if (!context) {
        throw new Error(
            "useRecruiterFilter must be used within FilterProvider",
        );
    }
    return context;
}
