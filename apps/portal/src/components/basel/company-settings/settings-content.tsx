"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { useUserProfile } from "@/contexts";
import { redirect } from "next/navigation";
import { LoadingState } from "@splits-network/shared-ui";
import { BaselVerticalTabBar, useScrollReveal } from "@splits-network/basel-ui";
import {
    MiniLeaderboard,
    AchievementsSection,
} from "@splits-network/shared-gamification";
import { useAuth } from "@clerk/nextjs";
import {
    createUnauthenticatedClient,
    createAuthenticatedClient,
} from "@/lib/api-client";
import { CompanyTab } from "./company-tab";
import { CultureTab } from "./culture-tab";
import { BillingTab } from "./billing-tab";
import { TeamTab } from "./team-tab";
import type { SettingsTab, Company } from "@/app/portal/company/settings/types";

const NAV_ITEMS = [
    {
        value: "profile",
        label: "Profile",
        icon: "fa-duotone fa-regular fa-building",
    },
    {
        value: "culture",
        label: "Culture",
        icon: "fa-duotone fa-regular fa-sparkles",
    },
    {
        value: "billing",
        label: "Billing",
        icon: "fa-duotone fa-regular fa-credit-card",
    },
    {
        value: "team",
        label: "Team",
        icon: "fa-duotone fa-regular fa-users",
    },
    {
        value: "achievements",
        label: "Achievements",
        icon: "fa-duotone fa-regular fa-trophy",
    },
];

const VALID_TABS = new Set<string>([
    "profile",
    "culture",
    "billing",
    "team",
    "achievements",
]);

interface SettingsContentProps {
    company: Company | null;
    companyId: string | null;
    organizationId: string | null;
}

export default function BaselSettingsContent({
    company,
    companyId,
    organizationId,
}: SettingsContentProps) {
    const { getToken } = useAuth();
    const { profile, isLoading, isCompanyUser, hasRole } = useUserProfile();
    const searchParams = useSearchParams();
    const router = useRouter();
    const pathname = usePathname();
    const mainRef = useRef<HTMLElement>(null);

    const publicClient = useMemo(() => createUnauthenticatedClient(), []);

    const [activeTab, setActiveTab] = useState<SettingsTab>(() => {
        const tab = searchParams.get("tab");
        return tab && VALID_TABS.has(tab) ? (tab as SettingsTab) : "profile";
    });

    // Sync tab to URL
    const searchParamsRef = useRef(searchParams);
    searchParamsRef.current = searchParams;

    useEffect(() => {
        const params = new URLSearchParams(searchParamsRef.current.toString());

        if (activeTab !== "profile") {
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

    useScrollReveal(mainRef);

    /* ── Guards ───────────────────────────────────────────────────────────── */
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
        <main ref={mainRef} className="min-h-screen bg-base-100">
            {/* ── Header ─────────────────────────────────────────────────── */}
            <section className="relative bg-base-300 text-base-content py-16 lg:py-20">
                <div
                    className="absolute top-0 right-0 w-2/5 h-full bg-primary/10"
                    style={{
                        clipPath: "polygon(15% 0,100% 0,100% 100%,0% 100%)",
                    }}
                />
                <div className="relative  container mx-auto px-6 lg:px-12">
                    <div className="max-w-3xl">
                        <p className="scroll-reveal fade-up text-sm font-semibold uppercase tracking-[0.2em] text-secondary mb-4">
                            Company
                        </p>
                        <h1 className="text-4xl md:text-5xl lg:text-6xl font-black leading-[0.92] tracking-tight mb-4">
                            <span className="scroll-reveal fade-up inline-block">
                                Company
                            </span>{" "}
                            <span className="scroll-reveal fade-up inline-block text-primary">
                                settings.
                            </span>
                        </h1>
                        <p className="scroll-reveal fade-up text-base text-base-content/50 max-w-xl">
                            Manage your company profile, billing configuration,
                            and team members in one place.
                        </p>
                    </div>
                </div>
            </section>

            {/* ── Body ───────────────────────────────────────────────────── */}
            <section className="scroll-reveal fade-up container mx-auto px-6 lg:px-12 py-10 lg:py-14">
                <div className="grid lg:grid-cols-5 gap-10 lg:gap-14">
                    {/* Sidebar Nav */}
                    <div className="lg:col-span-1">
                        <BaselVerticalTabBar
                            tabs={NAV_ITEMS}
                            active={activeTab}
                            onChange={(v) => setActiveTab(v as SettingsTab)}
                        />
                    </div>

                    {/* Main Panel */}
                    <div className="lg:col-span-4">
                        {activeTab === "profile" && (
                            <CompanyTab
                                company={company}
                                organizationId={resolvedOrgId}
                            />
                        )}

                        {activeTab === "culture" && companyId && (
                            <CultureTab companyId={companyId} />
                        )}

                        {activeTab === "culture" && !companyId && (
                            <div className="bg-warning/5 border border-warning/20 p-6">
                                <p className="text-sm font-semibold text-base-content flex items-center gap-2">
                                    <i className="fa-duotone fa-regular fa-circle-info text-warning" />
                                    Save your company profile first to manage
                                    culture and tech stack.
                                </p>
                            </div>
                        )}

                        {activeTab === "billing" && (
                            <BillingTab company={company} />
                        )}

                        {activeTab === "team" && companyId && (
                            <TeamTab
                                organizationId={resolvedOrgId}
                                companyId={companyId}
                                isCompanyAdmin={hasRole("company_admin")}
                            />
                        )}

                        {activeTab === "team" && !companyId && (
                            <div className="bg-warning/5 border border-warning/20 p-6">
                                <p className="text-sm font-semibold text-base-content flex items-center gap-2">
                                    <i className="fa-duotone fa-regular fa-circle-info text-warning" />
                                    Save your company profile first to manage
                                    team members.
                                </p>
                            </div>
                        )}

                        {activeTab === "achievements" && companyId && (
                            <>
                                <div className="mb-8">
                                    <MiniLeaderboard
                                        entityType="company"
                                        entityId={companyId}
                                        client={publicClient}
                                        showToggle={false}
                                        title="Company Rankings"
                                        fullLeaderboardHref="/portal/leaderboard"
                                    />
                                </div>
                                <AchievementsSection
                                    entityId={companyId}
                                    entityType="company"
                                    getToken={getToken}
                                    createClient={createAuthenticatedClient}
                                />
                            </>
                        )}

                        {activeTab === "achievements" && !companyId && (
                            <div className="bg-warning/5 border border-warning/20 p-6">
                                <p className="text-sm font-semibold text-base-content flex items-center gap-2">
                                    <i className="fa-duotone fa-regular fa-circle-info text-warning" />
                                    Save your company profile first to view
                                    achievements.
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </section>
        </main>
    );
}
