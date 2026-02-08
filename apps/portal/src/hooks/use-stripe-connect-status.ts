"use client";

import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@clerk/nextjs";
import { createAuthenticatedClient } from "@/lib/api-client";

export type ConnectStatus =
    | "not_started"
    | "incomplete"
    | "pending_verification"
    | "action_required"
    | "ready";

export interface StripeConnectStatusState {
    loading: boolean;
    error: string | null;

    // Account existence
    hasAccount: boolean;
    accountId: string | null;

    // Onboarding flags
    chargesEnabled: boolean;
    payoutsEnabled: boolean;
    detailsSubmitted: boolean;
    onboarded: boolean;

    // Requirements
    currentlyDue: string[];
    eventuallyDue: string[];
    pastDue: string[];
    pendingVerification: string[];
    disabledReason: string | null;

    // Computed state for UI
    status: ConnectStatus;

    // Actions
    refresh: () => Promise<void>;
    createAccount: () => Promise<void>;
    openDashboard: () => Promise<void>;
}

function deriveStatus(data: {
    hasAccount: boolean;
    detailsSubmitted: boolean;
    onboarded: boolean;
    currentlyDue: string[];
    pastDue: string[];
    pendingVerification: string[];
}): ConnectStatus {
    if (!data.hasAccount) return "not_started";
    if (data.onboarded) return "ready";
    if (
        data.detailsSubmitted &&
        data.pendingVerification.length > 0
    )
        return "pending_verification";
    if (data.currentlyDue.length > 0 || data.pastDue.length > 0)
        return "action_required";
    if (!data.detailsSubmitted) return "incomplete";
    return "incomplete";
}

export function useStripeConnectStatus(): StripeConnectStatusState {
    const { getToken } = useAuth();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [accountData, setAccountData] = useState<{
        hasAccount: boolean;
        accountId: string | null;
        chargesEnabled: boolean;
        payoutsEnabled: boolean;
        detailsSubmitted: boolean;
        onboarded: boolean;
        currentlyDue: string[];
        eventuallyDue: string[];
        pastDue: string[];
        pendingVerification: string[];
        disabledReason: string | null;
    }>({
        hasAccount: false,
        accountId: null,
        chargesEnabled: false,
        payoutsEnabled: false,
        detailsSubmitted: false,
        onboarded: false,
        currentlyDue: [],
        eventuallyDue: [],
        pastDue: [],
        pendingVerification: [],
        disabledReason: null,
    });

    const fetchStatus = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);

            const token = await getToken();
            if (!token) return;

            const api = createAuthenticatedClient(token);
            const response: any = await api.get(
                "/stripe/connect/account"
            );
            const data = response?.data;

            if (data) {
                const requirements = data.requirements || {};
                setAccountData({
                    hasAccount: true,
                    accountId: data.account_id,
                    chargesEnabled: !!data.charges_enabled,
                    payoutsEnabled: !!data.payouts_enabled,
                    detailsSubmitted: !!data.details_submitted,
                    onboarded: !!data.onboarded,
                    currentlyDue: requirements.currently_due || [],
                    eventuallyDue: requirements.eventually_due || [],
                    pastDue: requirements.past_due || [],
                    pendingVerification:
                        requirements.pending_verification || [],
                    disabledReason:
                        requirements.disabled_reason || null,
                });
            }
        } catch (err: any) {
            // 400 with "Stripe Connect account not found" means no account yet
            if (
                err?.message?.includes("not found") ||
                err?.status === 404
            ) {
                setAccountData((prev) => ({
                    ...prev,
                    hasAccount: false,
                    accountId: null,
                }));
            } else {
                setError(
                    err?.message || "Failed to load payout status"
                );
            }
        } finally {
            setLoading(false);
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const createAccount = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);

            const token = await getToken();
            if (!token) return;

            const api = createAuthenticatedClient(token);
            await api.post("/stripe/connect/account");
            await fetchStatus();
        } catch (err: any) {
            setError(
                err?.message || "Failed to create payout account"
            );
            setLoading(false);
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [fetchStatus]);

    const openDashboard = useCallback(async () => {
        try {
            const token = await getToken();
            if (!token) return;

            const api = createAuthenticatedClient(token);
            const response: any = await api.post(
                "/stripe/connect/dashboard-link"
            );
            const url = response?.data?.url;
            if (url) {
                window.open(url, "_blank", "noopener,noreferrer");
            }
        } catch (err: any) {
            setError(
                err?.message || "Failed to open Stripe dashboard"
            );
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        fetchStatus();
    }, [fetchStatus]);

    const status = deriveStatus(accountData);

    return {
        loading,
        error,
        ...accountData,
        status,
        refresh: fetchStatus,
        createAccount,
        openDashboard,
    };
}
