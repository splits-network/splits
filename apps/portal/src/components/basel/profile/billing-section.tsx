"use client";

import { useState, useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
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
    const contentRef = useRef<HTMLDivElement>(null);

    const handleTabChange = (tab: BillingTab) => {
        if (tab === activeTab) return;
        setActiveTab(tab);
        onTabChange?.(tab);
    };

    /* ── GSAP: tab content transition ─────────────────────────────────────── */

    useGSAP(
        () => {
            if (!contentRef.current) return;
            if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
            gsap.fromTo(
                contentRef.current,
                { opacity: 0, y: 12 },
                { opacity: 1, y: 0, duration: 0.3, ease: "power2.out" },
            );
        },
        { dependencies: [activeTab], scope: contentRef },
    );

    return (
        <div>
            {/* Tab bar */}
            <div role="tablist" className="tabs tabs-bordered mb-8">
                {TABS.map((tab) => (
                    <button
                        key={tab.key}
                        role="tab"
                        className={`tab gap-2 font-bold ${activeTab === tab.key ? "tab-active" : ""}`}
                        onClick={() => handleTabChange(tab.key)}
                    >
                        <i className={tab.icon} />
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* Tab content */}
            <div ref={contentRef}>
                {activeTab === "subscription" && <SubscriptionTab />}
                {activeTab === "payouts" && <PayoutsTab />}
            </div>
        </div>
    );
}
