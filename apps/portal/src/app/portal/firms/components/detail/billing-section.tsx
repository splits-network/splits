"use client";

import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@clerk/nextjs";
import { useUserProfile } from "@/contexts";
import { createAuthenticatedClient } from "@/lib/api-client";
import { useFirmConnectStatus } from "@/hooks/use-firm-connect-status";
import type { Firm, FirmMember } from "../../types";
import { BaselAlertBox } from "@splits-network/basel-ui";
import { ReadinessChecklist, OrientationStrip } from "./billing-orientation";
import { BillingSendColumn } from "./billing-send-column";
import { BillingReceiveColumn } from "./billing-receive-column";

interface BillingProfile {
    id: string;
    firm_id: string;
    billing_terms: string;
    billing_email: string;
    billing_contact_name: string | null;
    billing_address: Record<string, any> | null;
    stripe_tax_id: string | null;
    stripe_customer_id: string | null;
    stripe_default_payment_method_id: string | null;
}

interface ConnectStatus {
    account_id: string;
    firm_id: string;
    charges_enabled: boolean;
    payouts_enabled: boolean;
    details_submitted: boolean;
    onboarded: boolean;
    bank_account: { bank_name: string; last4: string } | null;
    pending_balance: number;
}

interface PaymentMethod {
    id: string;
    type: string;
    card?: { brand: string; last4: string; exp_month: number; exp_year: number };
    us_bank_account?: { bank_name: string; last4: string };
}

interface BillingSectionProps {
    firm: Firm;
    members: FirmMember[];
}

export function BillingSection({ firm, members }: BillingSectionProps) {
    const { getToken } = useAuth();
    const { profile } = useUserProfile();
    const firmConnect = useFirmConnectStatus(firm.id);

    const [billingProfile, setBillingProfile] = useState<BillingProfile | null>(null);
    const [paymentMethod, setPaymentMethod] = useState<PaymentMethod | null>(null);
    const [loading, setLoading] = useState(true);

    const currentMember = members.find(
        (m) => m.recruiter?.user_id === profile?.id && m.status === "active",
    );
    const isAdmin = currentMember?.role === "owner" || currentMember?.role === "admin";

    // Build connectStatus from hook for BillingReceiveColumn
    const connectStatus: ConnectStatus | null = firmConnect.hasAccount ? {
        account_id: firmConnect.accountId || "",
        firm_id: firm.id,
        charges_enabled: firmConnect.onboarded,
        payouts_enabled: firmConnect.onboarded,
        details_submitted: firmConnect.onboarded,
        onboarded: firmConnect.onboarded,
        bank_account: firmConnect.bankAccount,
        pending_balance: firmConnect.pendingBalance,
    } : null;

    const loadBillingData = useCallback(async () => {
        try {
            setLoading(true);
            const token = await getToken();
            if (!token) return;

            const client = createAuthenticatedClient(token);

            const profileRes = await client
                .get(`/firm-billing-profiles/${firm.id}`)
                .catch(() => null);
            if (profileRes?.data) setBillingProfile(profileRes.data);

            if (profileRes?.data?.stripe_default_payment_method_id) {
                try {
                    const pmRes = await client.get(`/firm-billing-profiles/${firm.id}/payment-method`);
                    if (pmRes?.data) setPaymentMethod(pmRes.data);
                } catch {
                    // Payment method may not be retrievable
                }
            }
        } catch {
            // Billing may not be set up yet
        } finally {
            setLoading(false);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [firm.id]);

    useEffect(() => {
        if (isAdmin) {
            loadBillingData();
        } else {
            setLoading(false);
        }
    }, [isAdmin, loadBillingData]);

    if (!isAdmin) {
        return (
            <div className="bg-base-200 text-base-content/60 text-sm p-6 text-center">
                <i className="fa-duotone fa-regular fa-lock mr-2" />
                Billing management is only available to firm owners and admins.
            </div>
        );
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center py-12">
                <span className="loading loading-spinner loading-md" />
            </div>
        );
    }

    const billingConfigured = !!billingProfile;
    const paymentMethodConfigured = !!billingProfile?.stripe_default_payment_method_id;
    const payoutConfigured = !!connectStatus?.onboarded;
    const bothConfigured = billingConfigured && payoutConfigured;
    const billingReady = billingConfigured && paymentMethodConfigured;

    return (
        <div className="space-y-4">
            {/* Contextual explanation — always visible */}
            <BaselAlertBox variant="info" title="How firm billing works">
                Splits Network is commission-based — your firm only pays when a recruiter successfully
                fills a role you posted for an off-platform company. There are no upfront fees or subscriptions.
                Your billing profile and payment method are used to process placement invoices when a hire is confirmed.
            </BaselAlertBox>

            {/* Action-required warning — shown when billing is incomplete */}
            {!billingReady && (
                <BaselAlertBox variant="warning" title="Billing setup required to post live roles">
                    Your firm&apos;s roles cannot go live until billing setup is complete.
                    Configure your billing profile and payment method below to start posting
                    roles for your off-platform clients.
                </BaselAlertBox>
            )}

            <ReadinessChecklist
                billingConfigured={billingConfigured}
                payoutConfigured={payoutConfigured}
            />

            {!bothConfigured && <OrientationStrip />}

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <BillingSendColumn
                    firmId={firm.id}
                    profile={billingProfile}
                    paymentMethod={paymentMethod}
                    onRefresh={loadBillingData}
                />
                <BillingReceiveColumn
                    firmId={firm.id}
                    firmName={firm.name}
                    connectStatus={connectStatus}
                    onSetup={firmConnect.createAccountAndRedirect}
                    onManage={firmConnect.openStripeOnboarding}
                />
            </div>
        </div>
    );
}
