'use client';

import { useState, useEffect, useMemo } from 'react';
import { createUnauthenticatedClient } from '@/lib/api-client';
import type { Tier, CommissionRates } from './types';

interface SplitsRateFromApi {
    id: string;
    plan_id: string;
    plan_tier: string;
    plan_name: string;
    candidate_recruiter_rate: number;
    job_owner_rate: number;
    company_recruiter_rate: number;
    candidate_sourcer_rate: number;
    company_sourcer_rate: number;
}

/** Map plan tier names (starter/pro/partner) to calculator tier keys (free/paid/premium) */
const PLAN_TIER_TO_CALC_TIER: Record<string, Tier> = {
    starter: 'free',
    pro: 'paid',
    partner: 'premium',
};

export interface SplitsRatesData {
    /** Commission rates by tier, in 0-1 decimal format for calculator use */
    rates: Record<Tier, CommissionRates> | null;
    /** Platform take by tier (computed as 1 - sum of role rates) */
    platformTake: Record<Tier, number> | null;
    /** Tier display info */
    tierInfo: Record<Tier, { name: string; monthlyPrice: number }> | null;
    loading: boolean;
    error: string | null;
}

/**
 * Fetches splits rates from the API and transforms them
 * into the format expected by the calculator.
 * Returns null rates on failure — consumers must handle the error state.
 */
export function useSplitsRates(): SplitsRatesData {
    const [apiRates, setApiRates] = useState<SplitsRateFromApi[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchRates = async () => {
            try {
                setLoading(true);
                setError(null);

                const client = createUnauthenticatedClient();
                const result = await client.get<{ data: SplitsRateFromApi[] }>('/splits-rates');
                const data = result?.data || [];

                if (data.length === 0) {
                    throw new Error('No splits rates configured');
                }

                setApiRates(data);
            } catch (err: any) {
                console.error('Failed to fetch splits rates:', err);
                setError(err.message || 'Failed to load rates');
            } finally {
                setLoading(false);
            }
        };

        fetchRates();
    }, []);

    const result = useMemo(() => {
        if (apiRates.length === 0) {
            return { rates: null, platformTake: null, tierInfo: null };
        }

        const ratesMap = {} as Record<Tier, CommissionRates>;
        const platformTakeMap = {} as Record<Tier, number>;
        const tierInfoMap = {} as Record<Tier, { name: string; monthlyPrice: number }>;

        // Monthly prices by tier (from plans table via plan_name)
        const monthlyPrices: Record<Tier, number> = { free: 0, paid: 99, premium: 249 };

        for (const apiRate of apiRates) {
            const calcTier = PLAN_TIER_TO_CALC_TIER[apiRate.plan_tier];
            if (!calcTier) continue;

            // Convert from 0-100 DB format to 0-1 decimal format
            ratesMap[calcTier] = {
                candidate_recruiter: apiRate.candidate_recruiter_rate / 100,
                job_owner: apiRate.job_owner_rate / 100,
                company_recruiter: apiRate.company_recruiter_rate / 100,
                candidate_sourcer: apiRate.candidate_sourcer_rate / 100,
                company_sourcer: apiRate.company_sourcer_rate / 100,
            };

            // Platform take = 1 - sum of all role rates
            const roleSum =
                apiRate.candidate_recruiter_rate +
                apiRate.job_owner_rate +
                apiRate.company_recruiter_rate +
                apiRate.candidate_sourcer_rate +
                apiRate.company_sourcer_rate;
            platformTakeMap[calcTier] = (100 - roleSum) / 100;

            tierInfoMap[calcTier] = {
                name: apiRate.plan_name,
                monthlyPrice: monthlyPrices[calcTier],
            };
        }

        return { rates: ratesMap, platformTake: platformTakeMap, tierInfo: tierInfoMap };
    }, [apiRates]);

    return { ...result, loading, error };
}
