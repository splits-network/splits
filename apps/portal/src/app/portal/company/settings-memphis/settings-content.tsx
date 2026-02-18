"use client";

import { useState, useEffect, useRef } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { useUserProfile } from "@/contexts";
import { redirect } from "next/navigation";
import { SettingsNav } from "@splits-network/memphis-ui";
import { LoadingState } from "@splits-network/shared-ui";
import { SettingsAnimator } from "./settings-animator";
import { HeaderSection } from "./components/header-section";
import { CompanyTab } from "./components/company-tab";
import { BillingTab } from "./components/billing-tab";
import { TeamTab } from "./components/team-tab";
import type { SettingsTab, Company } from "./types";

const NAV_ITEMS = [
    {
        key: "company" as const,
        label: "Company",
        icon: "fa-duotone fa-regular fa-building",
        accent: "coral" as const,
    },
    {
        key: "billing" as const,
        label: "Billing",
        icon: "fa-duotone fa-regular fa-credit-card",
        accent: "purple" as const,
    },
    {
        key: "team" as const,
        label: "Team",
        icon: "fa-duotone fa-regular fa-users",
        accent: "teal" as const,
    },
];

const VALID_TABS = new Set<string>(["company", "billing", "team"]);

interface SettingsContentProps {
    company: Company | null;
    companyId: string | null;
    organizationId: string | null;
}

export default function SettingsContent({
    company,
    companyId,
    organizationId,
}: SettingsContentProps) {
    const { profile, isLoading, isCompanyUser } = useUserProfile();
    const searchParams = useSearchParams();
    const router = useRouter();
    const pathname = usePathname();

    const [activeTab, setActiveTab] = useState<SettingsTab>(() => {
        const tab = searchParams.get("tab");
        return tab && VALID_TABS.has(tab) ? (tab as SettingsTab) : "company";
    });

    // Sync tab to URL
    const searchParamsRef = useRef(searchParams);
    searchParamsRef.current = searchParams;

    useEffect(() => {
        const params = new URLSearchParams(searchParamsRef.current.toString());

        if (activeTab !== "company") {
            params.set("tab", activeTab);
        } else {
            params.delete("tab");
        }

        const queryString = params.toString();
        const newUrl = queryString ? `${pathname}?${queryString}` : pathname;
        const currentQuery = searchParamsRef.current.toString();
        const currentUrl = currentQuery
            ? `${pathname}?${currentQuery}`
            : pathname;

        if (newUrl !== currentUrl) {
            router.replace(newUrl, { scroll: false });
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [activeTab, pathname, router]);

    if (isLoading) {
        return <LoadingState message="Loading settings..." />;
    }

    if (
        !isCompanyUser ||
        !profile?.organization_ids ||
        profile.organization_ids.length === 0
    ) {
        redirect("/portal/dashboard");
        return null;
    }

    const resolvedOrgId = organizationId || profile.organization_ids[0];

    return (
        <SettingsAnimator>
            <HeaderSection />

            <section className="min-h-screen bg-cream">
                <div className="py-8 px-4 lg:px-8">
                    <div className="max-w-6xl mx-auto grid lg:grid-cols-4 gap-8">
                        {/* Sidebar */}
                        <div className="settings-sidebar lg:col-span-1 opacity-0">
                            <SettingsNav
                                items={NAV_ITEMS}
                                active={activeTab}
                                onChange={(key) =>
                                    setActiveTab(key as SettingsTab)
                                }
                            />
                        </div>

                        {/* Content */}
                        <div className="settings-content lg:col-span-3 opacity-0">
                            {activeTab === "company" && (
                                <CompanyTab
                                    company={company}
                                    organizationId={resolvedOrgId}
                                />
                            )}

                            {activeTab === "billing" && (
                                <BillingTab company={company} />
                            )}

                            {activeTab === "team" && companyId && (
                                <TeamTab
                                    organizationId={resolvedOrgId}
                                    companyId={companyId}
                                />
                            )}

                            {activeTab === "team" && !companyId && (
                                <div className="border-4 border-yellow bg-yellow-light p-6">
                                    <p className="text-sm font-bold text-dark">
                                        <i className="fa-duotone fa-regular fa-circle-info text-yellow mr-2" />
                                        Save your company profile first to
                                        manage team members.
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </section>
        </SettingsAnimator>
    );
}
