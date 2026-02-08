"use client";

import { useState, useCallback } from "react";
import { useUserProfile } from "@/contexts";
import { redirect } from "next/navigation";
import { PageTitle } from "@/components/page-title";
import {
    ContentCard,
    DataList,
    DataRow,
    EmptyState,
} from "@/components/ui/cards";
import CompanySettingsForm from "./settings-form";
import { useCompanyBillingStatus } from "@/hooks/use-company-billing-status";
import CompanyPaymentMethodSection from "@/app/portal/billing/components/company-payment-method-section";
import CompanyInvoiceSection from "@/app/portal/billing/components/company-invoice-section";
import CompanyBillingSetupWizard from "@/app/portal/billing/components/company-billing-setup-wizard";
import { ActionRow } from "@/components/ui/cards/action-row";

interface CompanySettingsContentProps {
    company: any;
}

export default function CompanySettingsContent({
    company,
}: CompanySettingsContentProps) {
    const { profile, isLoading, isCompanyUser } = useUserProfile();
    const [setupDrawerOpen, setSetupDrawerOpen] = useState(false);

    const {
        loading: billingLoading,
        profile: billingProfile,
        readiness,
        status: billingStatus,
        refresh: refreshBilling,
    } = useCompanyBillingStatus(company?.id || null);

    const handleSetupComplete = useCallback(() => {
        setSetupDrawerOpen(false);
        refreshBilling();
    }, [refreshBilling]);

    if (isLoading) {
        return (
            <div className="p-6">
                <div className="flex items-center justify-center min-h-[400px]">
                    <span className="loading loading-spinner loading-lg"></span>
                </div>
            </div>
        );
    }

    if (
        !isCompanyUser ||
        !profile?.organization_ids ||
        profile.organization_ids.length === 0
    ) {
        redirect("/portal/dashboard");
        return null;
    }

    const billingTermsLabel: Record<string, string> = {
        immediate: "Immediate",
        net_30: "Net 30",
        net_60: "Net 60",
        net_90: "Net 90",
    };

    return (
        <>
            <PageTitle
                title="Company Settings"
                subtitle="Manage your company profile, billing, and preferences"
            ></PageTitle>

            <div className="">
                <div className="flex flex-col lg:flex-row gap-6">
                    {/* Main Column */}
                    <div className="lg:basis-2/3 space-y-6">
                        <CompanySettingsForm
                            company={company}
                            organizationId={profile.organization_ids[0]}
                            onBillingProfileSaved={refreshBilling}
                        />

                        {/* Invoices */}
                        {company?.id && billingStatus !== "not_started" && (
                            <CompanyInvoiceSection companyId={company.id} />
                        )}
                    </div>

                    {/* Sidebar */}
                    <div className="lg:basis-1/3 space-y-6">
                        {/* Company Summary */}
                        <ContentCard
                            title={company?.name || "Company"}
                            icon="fa-building"
                            subtitle={company?.industry || undefined}
                            elevatedHeader={true}
                        >
                            <DataList compact>
                                <DataRow
                                    value={company.headquarters_location}
                                    label="Headquarters"
                                    icon="fa-duotone fa-regular fa-location-dot"
                                />
                                <DataRow
                                    value={
                                        company.company_size
                                            ? `${company.company_size} employees`
                                            : "Not set"
                                    }
                                    label="Company Size"
                                    icon="fa-duotone fa-regular fa-users"
                                />
                                {company.website ? (
                                    <ActionRow
                                        label="Website"
                                        icon="fa-globe"
                                        actionLabel={company.website.replace(
                                            /^https?:\/\//,
                                            "",
                                        )}
                                        href={company.website}
                                        external
                                    />
                                ) : (
                                    <DataRow
                                        label="Website"
                                        icon="fa-globe"
                                        value="Not set"
                                    />
                                )}
                            </DataList>
                            <div className="mt-4">
                                <a
                                    href="/portal/company/team"
                                    className="btn btn-outline btn-sm w-full"
                                >
                                    <i className="fa-duotone fa-regular fa-users"></i>
                                    Manage Team
                                </a>
                            </div>
                        </ContentCard>

                        {/* Billing Status */}
                        {company?.id && !billingLoading && (
                            <ContentCard
                                title="Billing Status"
                                icon="fa-file-invoice-dollar"
                            >
                                {billingStatus === "not_started" ? (
                                    <div className="space-y-4">
                                        <EmptyState
                                            icon="fa-credit-card"
                                            title="Billing not configured"
                                            description="Set up billing to enable placement invoicing."
                                            size="sm"
                                        />
                                        <button
                                            className="btn btn-primary btn-sm w-full"
                                            onClick={() =>
                                                setSetupDrawerOpen(true)
                                            }
                                        >
                                            <i className="fa-duotone fa-regular fa-rocket"></i>
                                            Set Up Billing
                                        </button>
                                    </div>
                                ) : (
                                    <>
                                        <div className="card bg-base-100 mb-4 shadow-lg -mx-4">
                                            <div className="card-body">
                                                <div className="flex flex-col items-center gap-4">
                                                    <div className="flex items-center justify-between w-full">
                                                        <span className="text-sm text-base-content/70">
                                                            Status
                                                        </span>
                                                        <span
                                                            className={`badge badge-sm ${billingStatus === "ready" ? "badge-success" : "badge-warning"}`}
                                                        >
                                                            {billingStatus ===
                                                            "ready"
                                                                ? "Ready"
                                                                : "Incomplete"}
                                                        </span>
                                                    </div>
                                                    <div className="flex items-center justify-between w-full">
                                                        <span className="text-sm text-base-content/70">
                                                            Payment Method
                                                        </span>
                                                        <span className="text-sm font-medium">
                                                            {readiness?.has_payment_method ? (
                                                                <span className="text-success flex items-center gap-1">
                                                                    <i className="fa-duotone fa-regular fa-check-circle text-xs"></i>
                                                                    On file
                                                                </span>
                                                            ) : (
                                                                <span className="text-base-content/50">
                                                                    Not set
                                                                </span>
                                                            )}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                            {billingStatus === "incomplete" && (
                                                <button
                                                    className="btn btn-warning btn-sm w-full mt-2"
                                                    onClick={() =>
                                                        setSetupDrawerOpen(true)
                                                    }
                                                >
                                                    Complete Setup
                                                </button>
                                            )}
                                        </div>
                                        <DataList compact>
                                            <DataRow
                                                icon="fa-solid fa-calendar-days"
                                                label="Billing Cycle"
                                                value={
                                                    billingProfile?.billing_terms ||
                                                    "Not set"
                                                }
                                            />
                                            <DataRow
                                                icon="fa-solid fa-envelope"
                                                label="Billing Email"
                                                value={
                                                    billingProfile?.billing_email ||
                                                    "Not set"
                                                }
                                            />
                                        </DataList>

                                        <div className="divider my-2"></div>
                                        <div className="mt-4">
                                            {/* Payment Method */}
                                            {company?.id && (
                                                <CompanyPaymentMethodSection
                                                    companyId={company.id}
                                                    billingTerms={
                                                        billingProfile?.billing_terms
                                                    }
                                                    onPaymentMethodUpdated={
                                                        refreshBilling
                                                    }
                                                />
                                            )}
                                        </div>
                                    </>
                                )}
                            </ContentCard>
                        )}
                    </div>
                </div>
            </div>

            {/* Setup Wizard Drawer */}
            {company?.id && (
                <CompanyBillingSetupWizard
                    open={setupDrawerOpen}
                    companyId={company.id}
                    existingProfile={billingProfile}
                    onComplete={handleSetupComplete}
                    onClose={() => setSetupDrawerOpen(false)}
                />
            )}
        </>
    );
}
