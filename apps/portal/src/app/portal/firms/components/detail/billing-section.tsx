"use client";

import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@clerk/nextjs";
import { useUserProfile } from "@/contexts";
import { createAuthenticatedClient } from "@/lib/api-client";
import type { Firm, FirmMember } from "../../types";
import { FirmBillingSetupWizard } from "./firm-billing-setup-wizard";
import { FirmConnectModal } from "./firm-connect-modal";

interface BillingReadiness {
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

    const [readiness, setReadiness] = useState<BillingReadiness | null>(null);
    const [billingProfile, setBillingProfile] = useState<BillingProfile | null>(null);
    const [connectStatus, setConnectStatus] = useState<ConnectStatus | null>(null);
    const [paymentMethod, setPaymentMethod] = useState<PaymentMethod | null>(null);
    const [loading, setLoading] = useState(true);

    const currentMember = members.find(
        (m) => m.recruiter?.user_id === profile?.id && m.status === "active",
    );
    const isAdmin = currentMember?.role === "owner" || currentMember?.role === "admin";

    const loadBillingData = useCallback(async () => {
        try {
            setLoading(true);
            const token = await getToken();
            if (!token) return;

            const client = createAuthenticatedClient(token);

            const [readinessRes, profileRes] = await Promise.all([
                client.get(`/firm-billing-profiles/${firm.id}/billing-readiness`).catch(() => null),
                client.get(`/firm-billing-profiles/${firm.id}`).catch(() => null),
            ]);

            if (readinessRes?.data) setReadiness(readinessRes.data);
            if (profileRes?.data) setBillingProfile(profileRes.data);

            // Load payment method if profile has one
            if (profileRes?.data?.stripe_default_payment_method_id) {
                try {
                    const pmRes = await client.get(`/firm-billing-profiles/${firm.id}/payment-method`);
                    if (pmRes?.data) setPaymentMethod(pmRes.data);
                } catch {
                    // Payment method may not be retrievable
                }
            }

            // Load connect status (payout account)
            try {
                const connectRes = await client.get(`/firm-stripe-connect/${firm.id}/account`);
                if (connectRes?.data) setConnectStatus(connectRes.data);
            } catch {
                // Connect account may not exist yet
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

    return (
        <div className="space-y-8">
            <ReadinessIndicator readiness={readiness} />

            <BillingProfileSection
                firmId={firm.id}
                profile={billingProfile}
                paymentMethod={paymentMethod}
                onRefresh={loadBillingData}
            />

            <PayoutAccountSection
                firmId={firm.id}
                firmName={firm.name}
                connectStatus={connectStatus}
                onRefresh={loadBillingData}
            />
        </div>
    );
}

function ReadinessIndicator({ readiness }: { readiness: BillingReadiness | null }) {
    if (!readiness) return null;

    const statusConfig = {
        not_started: {
            label: "Not Started",
            color: "text-base-content/40 bg-base-200",
            icon: "fa-circle-dashed",
        },
        incomplete: {
            label: "Incomplete",
            color: "text-warning bg-warning/10",
            icon: "fa-circle-half-stroke",
        },
        ready: {
            label: "Ready",
            color: "text-success bg-success/10",
            icon: "fa-circle-check",
        },
    };

    const config = statusConfig[readiness.status];

    return (
        <div className={`p-4 flex items-center gap-3 ${config.color}`}>
            <i className={`fa-duotone fa-regular ${config.icon} text-lg`} />
            <div>
                <p className="font-bold text-sm">Billing Status: {config.label}</p>
                <p className="text-sm opacity-70">
                    {readiness.status === "not_started" &&
                        "Set up billing to enable invoicing for off-platform job commissions."}
                    {readiness.status === "incomplete" &&
                        "Complete your billing setup to enable all firm billing features."}
                    {readiness.status === "ready" &&
                        "Billing is fully configured and ready for invoicing."}
                </p>
            </div>
        </div>
    );
}

function BillingProfileSection({
    firmId,
    profile,
    paymentMethod,
    onRefresh,
}: {
    firmId: string;
    profile: BillingProfile | null;
    paymentMethod: PaymentMethod | null;
    onRefresh: () => void;
}) {
    const [showWizard, setShowWizard] = useState(false);

    const handleComplete = () => {
        setShowWizard(false);
        onRefresh();
    };

    return (
        <div>
            <h3 className="text-sm font-semibold uppercase tracking-[0.2em] text-base-content/40 mb-4">
                Billing Profile
            </h3>

            {!profile ? (
                <div className="bg-base-200 p-6">
                    <p className="text-sm text-base-content/60 mb-4">
                        Set up billing to pay placement commissions for off-platform jobs
                        posted by your firm.
                    </p>
                    <button
                        className="btn btn-sm btn-primary"
                        style={{ borderRadius: 0 }}
                        onClick={() => setShowWizard(true)}
                    >
                        <i className="fa-duotone fa-regular fa-credit-card mr-1" />
                        Set Up Billing
                    </button>
                </div>
            ) : (
                <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-[2px] bg-base-300">
                        <div className="bg-base-100 p-4">
                            <p className="text-sm uppercase tracking-[0.2em] text-base-content/40 mb-1">
                                Billing Email
                            </p>
                            <p className="text-sm font-bold">{profile.billing_email}</p>
                        </div>
                        <div className="bg-base-100 p-4">
                            <p className="text-sm uppercase tracking-[0.2em] text-base-content/40 mb-1">
                                Payment Terms
                            </p>
                            <p className="text-sm font-bold">
                                {profile.billing_terms === "immediate"
                                    ? "Immediate"
                                    : profile.billing_terms
                                          .replace("_", " ")
                                          .replace(/\b\w/g, (l) => l.toUpperCase())}
                            </p>
                        </div>
                        <div className="bg-base-100 p-4">
                            <p className="text-sm uppercase tracking-[0.2em] text-base-content/40 mb-1">
                                Payment Method
                            </p>
                            <p className="text-sm font-bold">
                                {paymentMethod ? (
                                    paymentMethod.card
                                        ? `${paymentMethod.card.brand} ···· ${paymentMethod.card.last4}`
                                        : paymentMethod.us_bank_account
                                          ? `${paymentMethod.us_bank_account.bank_name} ···· ${paymentMethod.us_bank_account.last4}`
                                          : "On file"
                                ) : (
                                    <span className="text-base-content/40">Not set</span>
                                )}
                            </p>
                        </div>
                    </div>

                    <button
                        className="btn btn-sm btn-ghost"
                        style={{ borderRadius: 0 }}
                        onClick={() => setShowWizard(true)}
                    >
                        <i className="fa-duotone fa-regular fa-pen mr-1" />
                        Edit Billing Settings
                    </button>
                </div>
            )}

            <FirmBillingSetupWizard
                open={showWizard}
                firmId={firmId}
                existingProfile={profile}
                onComplete={handleComplete}
                onClose={() => setShowWizard(false)}
            />
        </div>
    );
}

function PayoutAccountSection({
    firmId,
    firmName,
    connectStatus,
    onRefresh,
}: {
    firmId: string;
    firmName?: string;
    connectStatus: ConnectStatus | null;
    onRefresh: () => void;
}) {
    const [showModal, setShowModal] = useState(false);

    const handleCloseModal = () => {
        setShowModal(false);
        onRefresh();
    };

    return (
        <div>
            <h3 className="text-sm font-semibold uppercase tracking-[0.2em] text-base-content/40 mb-4">
                Payout Account (Stripe Connect)
            </h3>

            {!connectStatus ? (
                <div className="bg-base-200 p-6">
                    <p className="text-sm text-base-content/60 mb-4">
                        Set up a Stripe Connect account to receive admin take
                        payouts from firm member placements.
                    </p>
                    <button
                        className="btn btn-sm btn-primary"
                        style={{ borderRadius: 0 }}
                        onClick={() => setShowModal(true)}
                    >
                        <i className="fa-duotone fa-regular fa-building-columns mr-1" />
                        Set Up Payout Account
                    </button>
                </div>
            ) : (
                <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-[2px] bg-base-300">
                        <div className="bg-base-100 p-4">
                            <p className="text-sm uppercase tracking-[0.2em] text-base-content/40 mb-1">
                                Onboarded
                            </p>
                            <span className={`text-sm font-bold ${connectStatus.onboarded ? "text-success" : "text-warning"}`}>
                                {connectStatus.onboarded ? "Yes" : "Incomplete"}
                            </span>
                        </div>
                        <div className="bg-base-100 p-4">
                            <p className="text-sm uppercase tracking-[0.2em] text-base-content/40 mb-1">
                                Charges
                            </p>
                            <span className={`text-sm font-bold ${connectStatus.charges_enabled ? "text-success" : "text-base-content/40"}`}>
                                {connectStatus.charges_enabled ? "Enabled" : "Disabled"}
                            </span>
                        </div>
                        <div className="bg-base-100 p-4">
                            <p className="text-sm uppercase tracking-[0.2em] text-base-content/40 mb-1">
                                Payouts
                            </p>
                            <span className={`text-sm font-bold ${connectStatus.payouts_enabled ? "text-success" : "text-base-content/40"}`}>
                                {connectStatus.payouts_enabled ? "Enabled" : "Disabled"}
                            </span>
                        </div>
                    </div>

                    {connectStatus.bank_account && (
                        <div className="bg-base-100 border border-base-300 p-4">
                            <p className="text-sm text-base-content/40 mb-1">Bank Account</p>
                            <p className="text-sm font-bold">
                                {connectStatus.bank_account.bank_name} ···· {connectStatus.bank_account.last4}
                            </p>
                        </div>
                    )}

                    {!connectStatus.onboarded && (
                        <button
                            className="btn btn-sm btn-warning btn-outline"
                            style={{ borderRadius: 0 }}
                            onClick={() => setShowModal(true)}
                        >
                            <i className="fa-duotone fa-regular fa-arrow-right mr-1" />
                            Complete Onboarding
                        </button>
                    )}
                </div>
            )}

            <FirmConnectModal
                isOpen={showModal}
                onClose={handleCloseModal}
                firmId={firmId}
                firmName={firmName}
            />
        </div>
    );
}
