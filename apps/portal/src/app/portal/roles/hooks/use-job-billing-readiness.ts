"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { useAuth } from "@clerk/nextjs";
import { createAuthenticatedClient } from "@/lib/api-client";
import type { Job } from "../types";

type BillingStatus = "not_started" | "incomplete" | "ready";

/**
 * Batch-fetches billing readiness for all unique company/firm IDs
 * across the current page of jobs. Returns a per-job checker.
 *
 * When checkCompanyBilling is false (default for recruiters), company
 * billing is skipped — recruiters have no access to company billing
 * endpoints and are not responsible for company billing setup.
 */
export function useJobBillingReadiness(jobs: Job[], options?: {
    /** Check company billing readiness (false for recruiters who can't access company billing) */
    checkCompanyBilling?: boolean;
    /** Only check these firm IDs (recruiter's own firms). If omitted, checks all firm IDs in jobs. */
    ownFirmIds?: string[];
}) {
    const { getToken } = useAuth();
    const [statusMap, setStatusMap] = useState<Record<string, BillingStatus>>({});
    const [loading, setLoading] = useState(true);
    const checkCompanyBilling = options?.checkCompanyBilling ?? true;
    const ownFirmIds = options?.ownFirmIds;

    // Extract unique company and firm IDs
    const { companyIds, firmIds } = useMemo(() => {
        const cIds = new Set<string>();
        const fIds = new Set<string>();
        const ownFirmSet = ownFirmIds ? new Set(ownFirmIds) : null;
        for (const job of jobs) {
            if (checkCompanyBilling && job.company_id) cIds.add(job.company_id);
            if (job.source_firm_id && !job.company_id) {
                // If ownFirmIds provided, only check billing for the user's own firms
                if (!ownFirmSet || ownFirmSet.has(job.source_firm_id)) {
                    fIds.add(job.source_firm_id);
                }
            }
        }
        return { companyIds: [...cIds], firmIds: [...fIds] };
    }, [jobs, checkCompanyBilling, ownFirmIds]);

    const fetchReadiness = useCallback(async () => {
        if (companyIds.length === 0 && firmIds.length === 0) {
            setStatusMap({});
            setLoading(false);
            return;
        }

        try {
            setLoading(true);
            const token = await getToken();
            if (!token) return;
            const client = createAuthenticatedClient(token);

            const results: Record<string, BillingStatus> = {};

            // Fetch company billing readiness in parallel
            const companyPromises = companyIds.map(async (id) => {
                try {
                    const res = await client.get(`/company-billing/${id}/readiness`);
                    results[`company:${id}`] = res?.data?.status ?? "not_started";
                } catch {
                    results[`company:${id}`] = "not_started";
                }
            });

            // Fetch firm billing readiness in parallel
            const firmPromises = firmIds.map(async (id) => {
                try {
                    const res = await client.get(`/firm-billing-profiles/${id}/readiness`);
                    results[`firm:${id}`] = res?.data?.status ?? "not_started";
                } catch {
                    results[`firm:${id}`] = "not_started";
                }
            });

            await Promise.all([...companyPromises, ...firmPromises]);
            setStatusMap(results);
        } catch (err) {
            console.error("Failed to fetch billing readiness:", err);
        } finally {
            setLoading(false);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [companyIds.join(","), firmIds.join(",")]);

    useEffect(() => {
        fetchReadiness();
    }, [fetchReadiness]);

    /** Check if a specific job's owner entity has billing ready */
    const isBillingReady = useCallback(
        (job: Job): boolean => {
            if (job.source_firm_id && !job.company_id) {
                return statusMap[`firm:${job.source_firm_id}`] === "ready";
            }
            if (job.company_id) {
                return statusMap[`company:${job.company_id}`] === "ready";
            }
            // No company or firm — shouldn't happen, but allow
            return true;
        },
        [statusMap],
    );

    /** Whether ANY entity in the current job set has billing not ready */
    const hasUnreadyBilling = useMemo(() => {
        return Object.values(statusMap).some((s) => s !== "ready");
    }, [statusMap]);

    return { isBillingReady, hasUnreadyBilling, loading };
}
