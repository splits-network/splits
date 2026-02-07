"use client";

import { createContext, useContext, useMemo, ReactNode } from "react";
import {
    useStandardList,
    UseStandardListReturn,
} from "@/hooks/use-standard-list";
import { CompanyRelationship, CompanyFilters } from "../types";

type MyCompaniesContextValue = UseStandardListReturn<
    CompanyRelationship,
    CompanyFilters
>;

const MyCompaniesContext = createContext<MyCompaniesContextValue | null>(null);

export function MyCompaniesProvider({ children }: { children: ReactNode }) {
    const defaultFilters = useMemo<CompanyFilters>(
        () => ({ status: "active" }),
        [],
    );

    const listState = useStandardList<CompanyRelationship, CompanyFilters>({
        endpoint: "/recruiter-companies",
        defaultFilters,
        defaultSortBy: "created_at",
        defaultSortOrder: "desc",
        defaultLimit: 25,
        syncToUrl: false,
    });

    return (
        <MyCompaniesContext.Provider value={listState}>
            {children}
        </MyCompaniesContext.Provider>
    );
}

export function useMyCompanies() {
    const context = useContext(MyCompaniesContext);
    if (!context) {
        throw new Error(
            "useMyCompanies must be used within MyCompaniesProvider",
        );
    }
    return context;
}
