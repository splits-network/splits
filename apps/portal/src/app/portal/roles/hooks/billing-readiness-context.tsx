"use client";

import { createContext, useContext, type ReactNode } from "react";
import type { Job } from "../types";
import { useJobBillingReadiness } from "./use-job-billing-readiness";

interface BillingReadinessContextValue {
    isBillingReady: (job: Job) => boolean;
    hasUnreadyBilling: boolean;
    loading: boolean;
}

const BillingReadinessContext = createContext<BillingReadinessContextValue>({
    isBillingReady: () => true,
    hasUnreadyBilling: false,
    loading: false,
});

export function useBillingReadiness() {
    return useContext(BillingReadinessContext);
}

export function BillingReadinessProvider({
    jobs,
    children,
    checkCompanyBilling,
    ownFirmIds,
}: {
    jobs: Job[];
    children: ReactNode;
    checkCompanyBilling?: boolean;
    ownFirmIds?: string[];
}) {
    const value = useJobBillingReadiness(jobs, { checkCompanyBilling, ownFirmIds });
    return (
        <BillingReadinessContext.Provider value={value}>
            {children}
        </BillingReadinessContext.Provider>
    );
}
