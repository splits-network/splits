"use client";

import type { PublicCompany, PublicCompanyProfile } from "../types";
import { AboutTab } from "./tabs/about-tab";
import { OpenJobsTab } from "./tabs/open-jobs-tab";
import { CultureTab } from "./tabs/culture-tab";

export type TabKey = "about" | "open-jobs" | "culture";

interface ContentTabsProps {
    company: PublicCompany;
    profile: PublicCompanyProfile | null;
    activeTab: TabKey;
}

export default function ContentTabs({
    company,
    profile,
    activeTab,
}: ContentTabsProps) {
    return (
        <>
            {activeTab === "about" && <AboutTab company={company} />}
            {activeTab === "open-jobs" && (
                <OpenJobsTab company={company} />
            )}
            {activeTab === "culture" && (
                <CultureTab profile={profile} />
            )}
        </>
    );
}
