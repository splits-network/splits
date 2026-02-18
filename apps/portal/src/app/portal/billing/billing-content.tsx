"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { useUserProfile } from "@/contexts";
import { SettingsNav } from "@splits-network/memphis-ui";
import { LoadingState } from "@splits-network/shared-ui";
import { BillingAnimator } from "./billing-animator";
import { HeaderSection } from "./components/header-section";
import SubscriptionSection from "./components/subscription-section";
import PaymentSection from "./components/payment-section";
import HistorySection from "./components/history-section";
import PayoutSection from "./components/payout-section";
import CompanyBillingSection from "./components/company-billing-section";
import type { BillingTab } from "./components/accent";

const VALID_TABS = new Set<string>([
    "subscription",
    "payment",
    "history",
    "payouts",
    "company",
]);

export default function BillingContent() {
    const { isLoading, isRecruiter, isCompanyUser } = useUserProfile();
    const searchParams = useSearchParams();
    const router = useRouter();
    const pathname = usePathname();

    const [activeTab, setActiveTab] = useState<BillingTab>(() => {
        const tab = searchParams.get("tab");
        return tab && VALID_TABS.has(tab)
            ? (tab as BillingTab)
            : "subscription";
    });

    const [headerStats, setHeaderStats] = useState({
        planName: "\u2014",
        status: "\u2014",
        nextRenewal: "\u2014",
        monthlyCost: "\u2014",
    });

    // Sync tab to URL
    const searchParamsRef = useRef(searchParams);
    searchParamsRef.current = searchParams;

    useEffect(() => {
        const params = new URLSearchParams(searchParamsRef.current.toString());

        if (activeTab !== "subscription") {
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

    const handleStatsChange = useCallback(
        (stats: {
            planName: string;
            status: string;
            nextRenewal: string;
            monthlyCost: string;
        }) => {
            setHeaderStats(stats);
        },
        [],
    );

    // Build nav items based on user role
    const navItems = [];

    // Recruiter tabs
    if (isRecruiter || (!isRecruiter && !isCompanyUser)) {
        navItems.push(
            {
                key: "subscription" as const,
                label: "Subscription",
                icon: "fa-duotone fa-regular fa-box",
                accent: "coral" as const,
            },
            {
                key: "payment" as const,
                label: "Payment",
                icon: "fa-duotone fa-regular fa-wallet",
                accent: "teal" as const,
            },
            {
                key: "history" as const,
                label: "History",
                icon: "fa-duotone fa-regular fa-receipt",
                accent: "yellow" as const,
            },
        );
    }

    // Payout tab (recruiter only)
    if (isRecruiter) {
        navItems.push({
            key: "payouts" as const,
            label: "Payouts",
            icon: "fa-duotone fa-regular fa-money-bill-transfer",
            accent: "purple" as const,
        });
    }

    // Company billing tab
    if (isCompanyUser) {
        navItems.push({
            key: "company" as const,
            label: "Company",
            icon: "fa-duotone fa-regular fa-building",
            accent: "coral" as const,
        });
    }

    if (isLoading) {
        return <LoadingState message="Loading billing..." />;
    }

    return (
        <BillingAnimator>
            <HeaderSection stats={headerStats} />

            <section className="min-h-screen bg-cream">
                <div className="py-8 px-4 lg:px-8">
                    <div className="max-w-6xl mx-auto grid lg:grid-cols-4 gap-8">
                        {/* Sidebar */}
                        <div className="settings-sidebar lg:col-span-1 opacity-0">
                            <SettingsNav
                                items={navItems}
                                active={activeTab}
                                onChange={(key) =>
                                    setActiveTab(key as BillingTab)
                                }
                            />
                        </div>

                        {/* Content */}
                        <div className="settings-content lg:col-span-3 opacity-0">
                            {activeTab === "subscription" && (
                                <SubscriptionSection
                                    onStatsChange={handleStatsChange}
                                />
                            )}

                            {activeTab === "payment" && <PaymentSection />}

                            {activeTab === "history" && <HistorySection />}

                            {activeTab === "payouts" && isRecruiter && (
                                <PayoutSection />
                            )}

                            {activeTab === "company" && isCompanyUser && (
                                <CompanyBillingSection />
                            )}
                        </div>
                    </div>
                </div>
            </section>
        </BillingAnimator>
    );
}
