"use client";

import { BaselAlertBox } from "@splits-network/basel-ui";
import { useCompanyBillingStatus } from "@/hooks/use-company-billing-status";
import { ReadinessChecklist, OrientationStrip } from "./billing/billing-orientation";
import { BillingProfileCard } from "./billing/billing-profile-card";
import { BaselInvoiceSection } from "./billing/invoice-section";
import type { Company } from "@/app/portal/company/settings/types";

interface BillingTabProps {
    company: Company | null;
}

export function BillingTab({ company }: BillingTabProps) {
    const {
        loading: billingLoading,
        profile: billingProfile,
        readiness,
        status: billingStatus,
        refresh: refreshBilling,
    } = useCompanyBillingStatus(company?.id || null);

    if (!company) {
        return (
            <div className="bg-warning/5 border border-warning/20 p-6">
                <p className="text-sm font-semibold text-base-content flex items-center gap-2">
                    <i className="fa-duotone fa-regular fa-circle-info text-warning" />
                    Save your company profile first to configure billing.
                </p>
            </div>
        );
    }

    if (billingLoading) {
        return (
            <div className="flex items-center justify-center py-12">
                <span className="loading loading-spinner loading-md" />
            </div>
        );
    }

    const profileConfigured = billingStatus !== "not_started" && !!billingProfile;
    const paymentMethodConfigured = readiness?.has_payment_method ?? false;
    const bothConfigured = profileConfigured && paymentMethodConfigured;

    return (
        <div className="space-y-4">
            {/* Contextual explanation — always visible */}
            <BaselAlertBox variant="info" title="How placement billing works">
                Splits Network is commission-based — you only pay when a recruiter successfully fills
                one of your roles. There are no upfront fees or subscriptions. Your billing profile and
                payment method are used to process placement invoices when a hire is confirmed.
            </BaselAlertBox>

            {/* Action-required warning — shown when billing is incomplete */}
            {!bothConfigured && (
                <BaselAlertBox variant="warning" title="Billing setup required to post live roles">
                    Your roles cannot go live until billing setup is complete. Complete the steps below
                    to start receiving candidates from recruiters on the platform.
                </BaselAlertBox>
            )}

            <ReadinessChecklist
                profileConfigured={profileConfigured}
                paymentMethodConfigured={paymentMethodConfigured}
            />

            {!bothConfigured && <OrientationStrip />}

            <BillingProfileCard
                companyId={company.id}
                profile={billingProfile}
                status={billingStatus}
                onRefresh={refreshBilling}
            />

            {/* Invoices */}
            <div className="bg-base-100 border border-base-300 border-t-[3px] border-t-primary">
                <div className="p-5 pb-4">
                    <p className="text-sm font-semibold uppercase tracking-[0.2em] text-primary mb-1">
                        Invoices
                    </p>
                    <h3 className="text-lg font-bold mb-1">Payment History</h3>
                    <p className="text-sm text-base-content/60">
                        Invoices are created automatically when placements are confirmed.
                        View status, download PDFs, or access the hosted invoice page.
                    </p>
                </div>
                <div className="px-5 pb-5">
                    <BaselInvoiceSection companyId={company.id} />
                </div>
            </div>
        </div>
    );
}
