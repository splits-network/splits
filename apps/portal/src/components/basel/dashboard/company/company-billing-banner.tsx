"use client";

import { BaselAlertBox } from "@splits-network/basel-ui";

interface CompanyBillingBannerProps {
    companyId: string | null;
    billingStatus: string;
    billingLoading: boolean;
}

export function CompanyBillingBanner({
    companyId,
    billingStatus,
    billingLoading,
}: CompanyBillingBannerProps) {
    if (billingLoading || !companyId || billingStatus === "ready") return null;

    return (
        <section className="px-4 lg:px-6 pb-2">
            <BaselAlertBox
                variant="warning"
                title="Complete Your Payment Setup"
            >
                <p className="mb-2">
                    Your company&apos;s billing profile is not yet configured.
                    You&apos;ll need to set up your payment method before any
                    roles can go live.
                </p>
                <p className="mb-3">
                    Splits Network only charges placement fees when a recruiter
                    successfully fills your role — there are no upfront costs or
                    subscriptions.
                </p>
                <a
                    href="/portal/company/settings?tab=billing"
                    className="btn btn-warning btn-sm"
                >
                    <i className="fa-duotone fa-regular fa-credit-card mr-1" />
                    Complete Billing Setup
                </a>
            </BaselAlertBox>
        </section>
    );
}
