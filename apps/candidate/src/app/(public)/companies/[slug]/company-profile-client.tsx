"use client";

import { useState, useRef, useEffect } from "react";
import { useScrollReveal, BaselTabBar } from "@splits-network/basel-ui";
import { apiClient } from "@/lib/api-client";
import type { PublicCompany, PublicCompanyProfile } from "../types";
import HeroSection from "./hero-section";
import { HeroStats } from "./hero-stats";
import ContentTabs, { type TabKey } from "./content-tabs";
import Sidebar from "./sidebar";

const TABS: { key: TabKey; label: string; icon: string }[] = [
    {
        key: "about",
        label: "About",
        icon: "fa-duotone fa-regular fa-building",
    },
    {
        key: "open-jobs",
        label: "Open Jobs",
        icon: "fa-duotone fa-regular fa-briefcase",
    },
    {
        key: "culture",
        label: "Culture & Perks",
        icon: "fa-duotone fa-regular fa-heart",
    },
];

interface CompanyProfileClientProps {
    company: PublicCompany;
}

export default function CompanyProfileClient({
    company,
}: CompanyProfileClientProps) {
    const [activeTab, setActiveTab] = useState<TabKey>("about");
    const [profile, setProfile] = useState<PublicCompanyProfile | null>(null);
    const pageRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        let cancelled = false;
        apiClient
            .get<{ data: PublicCompanyProfile }>(
                `/public/companies/${company.slug}/profile`,
            )
            .then((res) => {
                if (!cancelled && res.data) setProfile(res.data);
            })
            .catch(() => {});
        return () => {
            cancelled = true;
        };
    }, [company.slug]);

    useScrollReveal(pageRef);

    return (
        <div ref={pageRef} className="min-h-screen bg-base-100">
            <HeroSection company={company} />

            <BaselTabBar
                tabs={TABS.map((t) => ({
                    label: t.label,
                    value: t.key,
                    icon: t.icon,
                }))}
                active={activeTab}
                onChange={(v) => setActiveTab(v as TabKey)}
                className="bg-base-100 border-b border-base-300 mx-auto px-8"
            />

            <div className="mx-auto px-8 py-12">
                <div className="grid lg:grid-cols-5 gap-12 lg:gap-16">
                    <div className="lg:col-span-3">
                        <ContentTabs
                            company={company}
                            profile={profile}
                            activeTab={activeTab}
                        />
                    </div>
                    <div className="lg:col-span-2">
                        <Sidebar company={company} profile={profile} />
                    </div>
                </div>
            </div>
        </div>
    );
}
