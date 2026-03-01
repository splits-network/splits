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

export interface UpdateFirmDetailsPayload {
    company_name?: string;
    company_phone?: string;
    company_tax_id?: string;
    first_name: string;
    last_name: string;
    email: string;
    phone?: string;
    dob: { day: number; month: number; year: number };
    ssn_last_4?: string;
    address: {
        line1: string;
        line2?: string;
        city: string;
        state: string;
        postal_code: string;
    };
}

export interface AddFirmBankAccountPayload {
    token: string;
}

export interface FirmConnectStatusState {
    loading: boolean;
    error: string | null;
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
    needsIdentityVerification: boolean;
    bankAccount: { bank_name: string; last4: string; account_type: string } | null;
    payoutSchedule: { interval: string; weekly_anchor?: string; monthly_anchor?: number; delay_days?: number } | null;
    pendingBalance: number;
    status: FirmConnectStatus;
    refresh: () => Promise<void>;
    createAccount: () => Promise<void>;
    updateDetails: (data: UpdateFirmDetailsPayload) => Promise<void>;
    addBankAccount: (data: AddFirmBankAccountPayload) => Promise<void>;
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
        bankAccount: null,
        payoutSchedule: null,
        pendingBalance: 0,
    });

    const fetchStatus = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);

            const token = await getToken();
            if (!token) return;

            const api = createAuthenticatedClient(token);
            const response: any = await api.get(
                `/firm-stripe-connect/${firmId}/account`
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
                    pendingVerification: requirements.pending_verification || [],
                    disabledReason: requirements.disabled_reason || null,
                    bankAccount: data.bank_account || null,
                    payoutSchedule: data.payout_schedule || null,
                    pendingBalance: data.pending_balance || 0,
                });
            }
        } catch (err: any) {
            if (err?.message?.includes("not found") || err?.status === 404) {
                setAccountData((prev) => ({
                    ...prev,
                    hasAccount: false,
                    accountId: null,
                }));
            } else {
                setError(err?.message || "Failed to load payout status");
            }
        } finally {
            setLoading(false);
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [firmId]);

    const createAccount = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);

            const token = await getToken();
            if (!token) return;

            const api = createAuthenticatedClient(token);
            await api.post(`/firm-stripe-connect/${firmId}/account`);
            await fetchStatus();
        } catch (err: any) {
            setError(err?.message || "Failed to create payout account");
            setLoading(false);
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [firmId, fetchStatus]);

    const updateDetails = useCallback(async (data: UpdateFirmDetailsPayload) => {
        const token = await getToken();
        if (!token) throw new Error("Not authenticated");

        const api = createAuthenticatedClient(token);
        await api.patch(`/firm-stripe-connect/${firmId}/account`, data);
        await fetchStatus();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [firmId, fetchStatus]);

    const addBankAccount = useCallback(async (data: AddFirmBankAccountPayload) => {
        const token = await getToken();
        if (!token) throw new Error("Not authenticated");

        const api = createAuthenticatedClient(token);
        await api.post(`/firm-stripe-connect/${firmId}/bank-account`, data);
        await fetchStatus();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [firmId, fetchStatus]);

    const acceptTos = useCallback(async (): Promise<{ needs_identity_verification: boolean }> => {
        const token = await getToken();
        if (!token) throw new Error("Not authenticated");

        const api = createAuthenticatedClient(token);
        const response: any = await api.post(`/firm-stripe-connect/${firmId}/accept-tos`);
        await fetchStatus();
        return {
            needs_identity_verification: !!response?.data?.needs_identity_verification,
        };
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [firmId, fetchStatus]);

    const createVerificationSession = useCallback(async (): Promise<{ client_secret: string }> => {
        const token = await getToken();
        if (!token) throw new Error("Not authenticated");

        const api = createAuthenticatedClient(token);
        const response: any = await api.post(`/firm-stripe-connect/${firmId}/verification-session`);
        return { client_secret: response?.data?.client_secret };
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [firmId]);

    useEffect(() => {
        fetchStatus();
    }, [fetchStatus]);

    const status = deriveStatus(accountData);

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
