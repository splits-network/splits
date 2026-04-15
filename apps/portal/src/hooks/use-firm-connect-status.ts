"use client";

import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@clerk/nextjs";
import { createAuthenticatedClient } from "@/lib/api-client";

export type FirmConnectStatus =
    | "not_started"
    | "incomplete"
    | "pending_verification"
    | "action_required"
    | "ready";

export interface FirmConnectStatusState {
    loading: boolean;
    error: string | null;
    hasAccount: boolean;
    accountId: string | null;
    onboarded: boolean;
    bankAccount: { bank_name: string; last4: string; account_type: string } | null;
    payoutSchedule: { interval: string; weekly_anchor?: string; monthly_anchor?: number; delay_days?: number } | null;
    pendingBalance: number;
    status: FirmConnectStatus;
    refresh: () => Promise<void>;
    createAccountAndRedirect: () => Promise<void>;
    openStripeOnboarding: () => Promise<void>;
}

function deriveStatus(data: {
    hasAccount: boolean;
    detailsSubmitted: boolean;
    onboarded: boolean;
    currentlyDue: string[];
    pastDue: string[];
    pendingVerification: string[];
}): FirmConnectStatus {
    if (!data.hasAccount) return "not_started";
    if (data.onboarded) return "ready";
    if (data.detailsSubmitted && data.pendingVerification.length > 0)
        return "pending_verification";
    if (data.currentlyDue.length > 0 || data.pastDue.length > 0)
        return "action_required";
    if (!data.detailsSubmitted) return "incomplete";
    return "incomplete";
}

export function useFirmConnectStatus(firmId: string): FirmConnectStatusState {
    const { getToken } = useAuth();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [accountData, setAccountData] = useState<{
        hasAccount: boolean;
        accountId: string | null;
        onboarded: boolean;
        detailsSubmitted: boolean;
        currentlyDue: string[];
        pastDue: string[];
        pendingVerification: string[];
        bankAccount: { bank_name: string; last4: string; account_type: string } | null;
        payoutSchedule: { interval: string; weekly_anchor?: string; monthly_anchor?: number; delay_days?: number } | null;
        pendingBalance: number;
    }>({
        hasAccount: false,
        accountId: null,
        onboarded: false,
        detailsSubmitted: false,
        currentlyDue: [],
        pastDue: [],
        pendingVerification: [],
        bankAccount: null,
        payoutSchedule: null,
        pendingBalance: 0,
    });

    const fetchStatus = useCallback(async (silent = false) => {
        try {
            if (!silent) setLoading(true);
            setError(null);

            const token = await getToken();
            if (!token) return;

            const api = createAuthenticatedClient(token);
            const response: any = await api.get(
                `/stripe/firm-connect/${firmId}/account`
            );
            const data = response?.data;

            if (data) {
                const requirements = data.requirements || {};
                setAccountData({
                    hasAccount: !!data.account_id,
                    accountId: data.account_id,
                    onboarded: !!data.onboarded,
                    detailsSubmitted: !!data.details_submitted,
                    currentlyDue: requirements.currently_due || [],
                    pastDue: requirements.past_due || [],
                    pendingVerification: requirements.pending_verification || [],
                    bankAccount: data.bank_account || null,
                    payoutSchedule: data.payout_schedule || null,
                    pendingBalance: data.pending_balance || 0,
                });
            }
        } catch (err: any) {
            setError(err?.message || "Failed to load payout status");
        } finally {
            if (!silent) setLoading(false);
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [firmId]);

    const getReturnUrl = () => {
        if (typeof window === "undefined") return "";
        return `${window.location.origin}/portal/firms?firmId=${firmId}&tab=billing`;
    };

    const createAccountAndRedirect = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);

            const token = await getToken();
            if (!token) return;

            const api = createAuthenticatedClient(token);
            await api.post(`/stripe/firm-connect/${firmId}/account`);
            const returnUrl = getReturnUrl();
            const response: any = await api.post(`/stripe/firm-connect/${firmId}/onboarding-link`, {
                return_url: returnUrl,
                refresh_url: returnUrl,
            });
            if (response?.data?.url) {
                window.open(response.data.url, "_blank");
            }
            await fetchStatus();
        } catch (err: any) {
            setError(err?.message || "Failed to create payout account");
        } finally {
            setLoading(false);
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [firmId, fetchStatus]);

    const openStripeOnboarding = useCallback(async () => {
        try {
            const token = await getToken();
            if (!token) return;

            const api = createAuthenticatedClient(token);
            const returnUrl = getReturnUrl();
            const response: any = await api.post(`/stripe/firm-connect/${firmId}/onboarding-link`, {
                return_url: returnUrl,
                refresh_url: returnUrl,
            });
            if (response?.data?.url) {
                window.open(response.data.url, "_blank");
            }
        } catch (err: any) {
            setError(err?.message || "Failed to open Stripe onboarding");
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [firmId]);

    useEffect(() => {
        fetchStatus();
    }, [fetchStatus]);

    const status = deriveStatus(accountData);

    return {
        loading,
        error,
        hasAccount: accountData.hasAccount,
        accountId: accountData.accountId,
        onboarded: accountData.onboarded,
        bankAccount: accountData.bankAccount,
        payoutSchedule: accountData.payoutSchedule,
        pendingBalance: accountData.pendingBalance,
        status,
        refresh: fetchStatus,
        createAccountAndRedirect,
        openStripeOnboarding,
    };
}
