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
import { useAuth } from "@clerk/nextjs";
import { useUserProfile } from "@/contexts";
import { createAuthenticatedClient } from "@/lib/api-client";
import type { Company, CompanyRecruiterRelationship } from "../types";

interface CompanyContextValue {
    companies: Company[];
    companyIds: string[];
    canInvite: boolean;
    recruiterRelationships: Map<string, CompanyRecruiterRelationship>;
    refreshRelationships: () => void;
}

const CompanyContext = createContext<CompanyContextValue | null>(null);

export function CompanyProvider({ children }: { children: ReactNode }) {
    const { getToken } = useAuth();
    const { isCompanyUser, isAdmin, profile } = useUserProfile();

    const [companies, setCompanies] = useState<Company[]>([]);
    const [recruiterRelationships, setRecruiterRelationships] = useState<
        Map<string, CompanyRecruiterRelationship>
    >(new Map());

    useEffect(() => {
        const loadCompanies = async () => {
            if (!isCompanyUser && !isAdmin) return;
            if (!profile?.organization_ids?.length) return;

            try {
                const token = await getToken();
                if (!token) return;

                const client = createAuthenticatedClient(token);
                const response: any = await client.get("/companies", {
                    params: { limit: 100 },
                });
                const allCompanies = response?.data || [];
                setCompanies(allCompanies);
            } catch (err) {
                console.error("Failed to load companies:", err);
            }
        };

        loadCompanies();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isCompanyUser, isAdmin, profile?.organization_ids]);

    const companyIds = useMemo(() => companies.map((c) => c.id), [companies]);
    const canInvite = (isCompanyUser || isAdmin) && companies.length > 0;

    const loadRelationships = useCallback(async () => {
        if (!companies.length) return;

        try {
            const token = await getToken();
            if (!token) return;

            const client = createAuthenticatedClient(token);
            const companyIds = companies.map((c) => c.id);

            const allRelationships: CompanyRecruiterRelationship[] = [];
            for (const companyId of companyIds) {
                try {
                    const response: any = await client.get(
                        "/recruiter-companies",
                        {
                            params: {
                                company_id: companyId,
                                status: "active",
                                limit: 100,
                            },
                        },
                    );
                    const rels = response?.data || [];
                    allRelationships.push(...rels);
                } catch {
                    // Skip failed company lookups
                }
            }

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

    return (
        <CompanyContext value={{
            companies,
            companyIds,
            canInvite,
            recruiterRelationships,
            refreshRelationships: loadRelationships,
        }}>
            {children}
        </CompanyContext>
    );
}

const EMPTY_CONTEXT: CompanyContextValue = {
    companies: [],
    companyIds: [],
    canInvite: false,
    recruiterRelationships: new Map(),
    refreshRelationships: () => {},
};

export function useCompanyContext(): CompanyContextValue {
    const context = useContext(CompanyContext);
    return context ?? EMPTY_CONTEXT;
}
