"use client";

import {
    createContext,
    useContext,
    useState,
    useEffect,
    useCallback,
    ReactNode,
} from "react";
import { UseStandardListReturn } from "@/hooks/use-standard-list";
import { MarketplaceProvider, useMarketplace } from "./marketplace-context";
import { MyCompaniesProvider, useMyCompanies } from "./my-companies-context";
import {
    Company,
    CompanyRelationship,
    CompanyFilters,
    CompanyTab,
} from "../types";

const STATS_VISIBLE_KEY = "companiesStatsVisible";
const ACTIVE_TAB_KEY = "companiesActiveTab";

interface FilterContextValue {
    activeTab: CompanyTab;
    setActiveTab: (tab: CompanyTab) => void;
    showStats: boolean;
    setShowStats: (show: boolean) => void;
    marketplaceContext: UseStandardListReturn<Company, CompanyFilters>;
    myCompaniesContext: UseStandardListReturn<
        CompanyRelationship,
        CompanyFilters
    >;
}

const FilterContext = createContext<FilterContextValue | null>(null);

function FilterProviderInner({ children }: { children: ReactNode }) {
    const marketplaceContext = useMarketplace();
    const myCompaniesContext = useMyCompanies();

    const [activeTab, setActiveTabState] = useState<CompanyTab>("marketplace");
    const [tabLoaded, setTabLoaded] = useState(false);

    const [showStats, setShowStatsState] = useState(true);
    const [statsLoaded, setStatsLoaded] = useState(false);

    useEffect(() => {
        if (typeof window !== "undefined") {
            const savedTab = localStorage.getItem(
                ACTIVE_TAB_KEY,
            ) as CompanyTab | null;
            if (savedTab === "marketplace" || savedTab === "my-companies") {
                setActiveTabState(savedTab);
            }
            setTabLoaded(true);

            const savedStats = localStorage.getItem(STATS_VISIBLE_KEY);
            if (savedStats !== null) {
                setShowStatsState(savedStats === "true");
            }
            setStatsLoaded(true);
        }
    }, []);

    const setActiveTab = useCallback((tab: CompanyTab) => {
        setActiveTabState(tab);
        if (typeof window !== "undefined") {
            localStorage.setItem(ACTIVE_TAB_KEY, tab);
        }
    }, []);

    const setShowStats = useCallback((show: boolean) => {
        setShowStatsState(show);
        if (typeof window !== "undefined") {
            localStorage.setItem(STATS_VISIBLE_KEY, String(show));
        }
    }, []);

    const contextValue: FilterContextValue = {
        activeTab: tabLoaded ? activeTab : "marketplace",
        setActiveTab,
        showStats: statsLoaded ? showStats : true,
        setShowStats,
        marketplaceContext,
        myCompaniesContext,
    };

    return (
        <FilterContext.Provider value={contextValue}>
            {children}
        </FilterContext.Provider>
    );
}

export function FilterProvider({ children }: { children: ReactNode }) {
    return (
        <MarketplaceProvider>
            <MyCompaniesProvider>
                <FilterProviderInner>{children}</FilterProviderInner>
            </MyCompaniesProvider>
        </MarketplaceProvider>
    );
}

export function useFilter() {
    const context = useContext(FilterContext);
    if (!context) {
        throw new Error("useFilter must be used within FilterProvider");
    }
    return context;
}

export function useActiveContext() {
    const { activeTab, marketplaceContext, myCompaniesContext } = useFilter();
    return activeTab === "marketplace" ? marketplaceContext : myCompaniesContext;
}
