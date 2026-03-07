"use client";

import { useState } from "react";
import { BaselTabBar } from "@splits-network/basel-ui";
import { SubscriptionTab } from "./subscription-tab";
import { PayoutsTab } from "./payouts-tab";

/* ─── Types ──────────────────────────────────────────────────────────────── */

type BillingTab = "subscription" | "payouts";

interface BillingSectionProps {
    initialTab?: BillingTab;
    onTabChange?: (tab: BillingTab) => void;
}

const TABS: { key: BillingTab; label: string; icon: string }[] = [
    { key: "subscription", label: "Subscription", icon: "fa-duotone fa-regular fa-box" },
    { key: "payouts", label: "Payouts", icon: "fa-duotone fa-regular fa-money-bill-transfer" },
];

/* ─── Component ──────────────────────────────────────────────────────────── */

export function BillingSection({ initialTab = "subscription", onTabChange }: BillingSectionProps) {
    const [activeTab, setActiveTab] = useState<BillingTab>(initialTab);

    const handleTabChange = (tab: BillingTab) => {
        if (tab === activeTab) return;
        setActiveTab(tab);
        onTabChange?.(tab);
    };

    return (
        <div>
            {/* Tab bar */}
            <BaselTabBar
                tabs={TABS.map(t => ({ label: t.label, value: t.key, icon: t.icon }))}
                active={activeTab}
                onChange={(v) => handleTabChange(v as BillingTab)}
                className="mb-8"
            />

            {/* Tab content */}
            <div className="transition-opacity duration-300">
                {activeTab === "subscription" && <SubscriptionTab />}
                {activeTab === "payouts" && <PayoutsTab />}
            </div>
        </div>
    );
}
