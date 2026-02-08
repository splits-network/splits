"use client";

import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@clerk/nextjs";
import { createAuthenticatedClient } from "@/lib/api-client";

interface PaymentMethodDetails {
    id: string;
    brand: string;
    last4: string;
    exp_month: number;
    exp_year: number;
}

interface PaymentMethodResponse {
    has_payment_method: boolean;
    default_payment_method: PaymentMethodDetails | null;
}

interface CompanyBillingProfile {
    id: string;
    company_id: string;
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

interface CompanyBillingReadiness {
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

export interface CompanyBillingStatusState {
    loading: boolean;
    error: string | null;

    profile: CompanyBillingProfile | null;
    hasProfile: boolean;

    hasPaymentMethod: boolean;
    paymentMethod: PaymentMethodDetails | null;

    readiness: CompanyBillingReadiness | null;
    status: "not_started" | "incomplete" | "ready";

    refresh: () => Promise<void>;
}

export function useCompanyBillingStatus(
    companyId: string | null
): CompanyBillingStatusState {
    const { getToken } = useAuth();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [profile, setProfile] = useState<CompanyBillingProfile | null>(null);
    const [paymentMethodData, setPaymentMethodData] =
        useState<PaymentMethodResponse | null>(null);
    const [readiness, setReadiness] = useState<CompanyBillingReadiness | null>(
        null
    );

    const fetchAll = useCallback(async () => {
        if (!companyId) {
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
                client.get(`/company-billing-profiles/${companyId}`),
                client.get(`/company-billing-profiles/${companyId}/payment-method`),
                client.get(`/company-billing-profiles/${companyId}/billing-readiness`),
            ]);

            if (profileRes.status === "fulfilled") {
                setProfile(profileRes.value?.data || null);
            } else {
                setProfile(null);
            }

            if (pmRes.status === "fulfilled") {
                setPaymentMethodData(pmRes.value?.data || null);
            } else {
                setPaymentMethodData(null);
            }

            if (readinessRes.status === "fulfilled") {
                setReadiness(readinessRes.value?.data || null);
            } else {
                setReadiness(null);
            }
        } catch (err: any) {
            console.error("Failed to fetch company billing status:", err);
            setError(err.message || "Failed to load billing status");
        } finally {
            setLoading(false);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [companyId]);

    useEffect(() => {
        fetchAll();
    }, [fetchAll]);

    return {
        loading,
        error,
        profile,
        hasProfile: !!profile,
        hasPaymentMethod: paymentMethodData?.has_payment_method ?? false,
        paymentMethod: paymentMethodData?.default_payment_method ?? null,
        readiness,
        status: readiness?.status ?? "not_started",
        refresh: fetchAll,
    };
}
