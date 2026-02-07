"use client";

import { createContext, useContext, useMemo, ReactNode } from "react";
import {
    useStandardList,
    UseStandardListReturn,
} from "@/hooks/use-standard-list";
import { Company, CompanyFilters } from "../types";

type MarketplaceContextValue = UseStandardListReturn<Company, CompanyFilters>;

const MarketplaceContext = createContext<MarketplaceContextValue | null>(null);

export function MarketplaceProvider({ children }: { children: ReactNode }) {
    const defaultFilters = useMemo<CompanyFilters>(() => ({ browse_all: "true" }), []);

    const listState = useStandardList<Company, CompanyFilters>({
        endpoint: "/companies",
        defaultFilters,
        defaultSortBy: "name",
        defaultSortOrder: "asc",
        defaultLimit: 25,
        syncToUrl: true,
    });

    return (
        <MarketplaceContext.Provider value={listState}>
            {children}
        </MarketplaceContext.Provider>
    );
}

export function useMarketplace() {
    const context = useContext(MarketplaceContext);
    if (!context) {
        throw new Error("useMarketplace must be used within MarketplaceProvider");
    }
    return context;
}
