"use client";

import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@clerk/nextjs";
import { createAuthenticatedClient } from "@/lib/api-client";

interface PaymentMethodDetails {
    id: string;
    type: string;
    card?: { brand: string; last4: string; exp_month: number; exp_year: number };
    us_bank_account?: { bank_name: string; last4: string };
}

interface FirmBillingProfile {
    id: string;
    firm_id: string;
    billing_terms: string;
    billing_email: string;
    invoice_delivery_method: string;
    stripe_customer_id: string | null;
    stripe_default_payment_method_id: string | null;
    stripe_tax_id: string | null;
    billing_contact_name: string | null;
    billing_address: Record<string, any> | null;
    created_at: string;
    updated_at: string;
}

interface FirmBillingReadiness {
    status: "not_started" | "incomplete" | "ready";
    has_billing_profile: boolean;
    has_billing_email: boolean;
    has_billing_terms: boolean;
    has_stripe_customer: boolean;
    has_payment_method: boolean;
    has_billing_contact: boolean;
    has_billing_address: boolean;
    requires_payment_method: boolean;
    billing_terms: string | null;
}

export interface FirmBillingStatusState {
    loading: boolean;
    error: string | null;

    profile: FirmBillingProfile | null;
    hasProfile: boolean;

    hasPaymentMethod: boolean;
    paymentMethod: PaymentMethodDetails | null;

    readiness: FirmBillingReadiness | null;
    status: "not_started" | "incomplete" | "ready";

    refresh: () => Promise<void>;
}

export function useFirmBillingStatus(
    firmId: string | null
): FirmBillingStatusState {
    const { getToken } = useAuth();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [profile, setProfile] = useState<FirmBillingProfile | null>(null);
    const [paymentMethod, setPaymentMethod] =
        useState<PaymentMethodDetails | null>(null);
    const [readiness, setReadiness] = useState<FirmBillingReadiness | null>(
        null
    );

    const fetchAll = useCallback(async () => {
        if (!firmId) {
            setLoading(false);
            return;
        }

        try {
            setLoading(true);
            setError(null);

            const token = await getToken();
            if (!token) return;

            const client = createAuthenticatedClient(token);

            const [profileRes, pmRes, readinessRes] = await Promise.allSettled([
                client.get(`/firm-billing-profiles/${firmId}`),
                client.get(`/firm-billing-profiles/${firmId}/payment-method`),
                client.get(`/firm-billing-profiles/${firmId}/billing-readiness`),
            ]);

            if (profileRes.status === "fulfilled") {
                setProfile(profileRes.value?.data || null);
            } else {
                setProfile(null);
            }

            if (pmRes.status === "fulfilled") {
                const pmData = pmRes.value?.data;
                setPaymentMethod(pmData?.default_payment_method ?? pmData ?? null);
            } else {
                setPaymentMethod(null);
            }

            if (readinessRes.status === "fulfilled") {
                setReadiness(readinessRes.value?.data || null);
            } else {
                setReadiness(null);
            }
        } catch (err: any) {
            console.error("Failed to fetch firm billing status:", err);
            setError(err.message || "Failed to load billing status");
        } finally {
            setLoading(false);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [firmId]);

    useEffect(() => {
        fetchAll();
    }, [fetchAll]);

    return {
        loading,
        error,
        profile,
        hasProfile: !!profile,
        hasPaymentMethod: readiness?.has_payment_method ?? false,
        paymentMethod,
        readiness,
        status: readiness?.status ?? "not_started",
        refresh: fetchAll,
    };
}
