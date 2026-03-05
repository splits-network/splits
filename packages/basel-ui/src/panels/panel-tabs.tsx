"use client";

import { useState, type ReactNode } from "react";
import { BaselTabBar } from "../display/basel-tab-bar";

/* ─── Types ──────────────────────────────────────────────────────────── */

export interface PanelTab {
    label: string;
    value: string;
    icon?: string;
    count?: number;
}

export interface PanelTabsProps {
    tabs: PanelTab[];
    defaultTab?: string;
    children: (activeTab: string) => ReactNode;
}

/* ─── Component ──────────────────────────────────────────────────────── */

export function PanelTabs({ tabs, defaultTab, children }: PanelTabsProps) {
    const [activeTab, setActiveTab] = useState(defaultTab || tabs[0]?.value);

    return (
        <>
            <BaselTabBar
                tabs={tabs}
                active={activeTab}
                onChange={setActiveTab}
                className="bg-base-100 border-b border-base-300"
            />
            {children(activeTab)}
        </>
    );
}
