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

export type ConnectAccountType = "express" | "custom" | null;

export interface UpdateDetailsPayload {
    first_name: string;
    last_name: string;
    email: string;
    phone: string;
    dob: { day: number; month: number; year: number };
    ssn_last_4: string;
    address: {
        line1: string;
        city: string;
        state: string;
        postal_code: string;
    };
}

export interface AddBankAccountPayload {
    token: string; // Stripe.js bank_account token (btok_xxx)
}

export interface StripeConnectStatusState {
    loading: boolean;
    error: string | null;

    // Account existence
    hasAccount: boolean;
    accountId: string | null;
    accountType: ConnectAccountType;

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

    // Identity verification
    needsIdentityVerification: boolean;

    // Bank account & payout details
    bankAccount: { bank_name: string; last4: string; account_type: string } | null;
    payoutSchedule: { interval: string; weekly_anchor?: string; monthly_anchor?: number; delay_days?: number } | null;
    pendingBalance: number;

    // Individual details (for pre-populating edit form)
    individual: {
        first_name?: string;
        last_name?: string;
        email?: string;
        phone?: string;
        dob?: { day?: number; month?: number; year?: number };
        address?: { line1?: string; city?: string; state?: string; postal_code?: string };
        ssn_last_4_provided?: boolean;
    } | null;

    // Computed state for UI
    status: ConnectStatus;

    // Actions
    refresh: () => Promise<void>;
    createAccount: () => Promise<void>;
    updateDetails: (data: UpdateDetailsPayload) => Promise<void>;
    addBankAccount: (data: AddBankAccountPayload) => Promise<void>;
    acceptTos: () => Promise<{ needs_identity_verification: boolean }>;
    createVerificationSession: () => Promise<{ client_secret: string }>;
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
        accountType: ConnectAccountType;
        chargesEnabled: boolean;
        payoutsEnabled: boolean;
        detailsSubmitted: boolean;
        onboarded: boolean;
        currentlyDue: string[];
        eventuallyDue: string[];
        pastDue: string[];
        pendingVerification: string[];
        disabledReason: string | null;
        bankAccount: { bank_name: string; last4: string; account_type: string } | null;
        payoutSchedule: { interval: string; weekly_anchor?: string; monthly_anchor?: number; delay_days?: number } | null;
        pendingBalance: number;
        individual: {
            first_name?: string;
            last_name?: string;
            email?: string;
            phone?: string;
            dob?: { day?: number; month?: number; year?: number };
            address?: { line1?: string; city?: string; state?: string; postal_code?: string };
            ssn_last_4_provided?: boolean;
        } | null;
    }>({
        hasAccount: false,
        accountId: null,
        accountType: null,
        chargesEnabled: false,
        payoutsEnabled: false,
        detailsSubmitted: false,
        onboarded: false,
        currentlyDue: [],
        eventuallyDue: [],
        pastDue: [],
        pendingVerification: [],
        disabledReason: null,
        bankAccount: null,
        payoutSchedule: null,
        pendingBalance: 0,
        individual: null,
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
                    accountType: data.account_type || null,
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
                    bankAccount: data.bank_account || null,
                    payoutSchedule: data.payout_schedule || null,
                    pendingBalance: data.pending_balance || 0,
                    individual: data.individual || null,
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
                    accountType: null,
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

    const updateDetails = useCallback(async (data: UpdateDetailsPayload) => {
        const token = await getToken();
        if (!token) throw new Error("Not authenticated");

        const api = createAuthenticatedClient(token);
        await api.patch("/stripe/connect/account", data);
        await fetchStatus();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [fetchStatus]);

    const addBankAccount = useCallback(async (data: AddBankAccountPayload) => {
        const token = await getToken();
        if (!token) throw new Error("Not authenticated");

        const api = createAuthenticatedClient(token);
        await api.post("/stripe/connect/bank-account", data);
        await fetchStatus();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [fetchStatus]);

    const acceptTos = useCallback(async (): Promise<{ needs_identity_verification: boolean }> => {
        const token = await getToken();
        if (!token) throw new Error("Not authenticated");

        const api = createAuthenticatedClient(token);
        const response: any = await api.post("/stripe/connect/accept-tos");
        await fetchStatus();
        return {
            needs_identity_verification: !!response?.data?.needs_identity_verification,
        };
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [fetchStatus]);

    const createVerificationSession = useCallback(async (): Promise<{ client_secret: string }> => {
        const token = await getToken();
        if (!token) throw new Error("Not authenticated");

        const api = createAuthenticatedClient(token);
        const response: any = await api.post("/stripe/connect/verification-session");
        return { client_secret: response?.data?.client_secret };
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        fetchStatus();
    }, [fetchStatus]);

    const status = deriveStatus(accountData);

    // Check if identity verification is needed based on Stripe requirements
    const needsIdentityVerification =
        accountData.hasAccount &&
        !accountData.onboarded &&
        (accountData.currentlyDue.some((r) => r.includes("verification.document")) ||
         accountData.eventuallyDue.some((r) => r.includes("verification.document")));

    return {
        loading,
        error,
        ...accountData,
        needsIdentityVerification,
        status,
        refresh: fetchStatus,
        createAccount,
        updateDetails,
        addBankAccount,
        acceptTos,
        createVerificationSession,
    };
}
