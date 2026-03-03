"use client";

import type { PublicFirm } from "../types";
import type { FirmRecentPlacement } from "../types";
import { AboutTab } from "./tabs/about-tab";
import { SpecialtiesTab } from "./tabs/specialties-tab";
import TeamTab from "./team-tab";
import { ReviewsTab } from "./tabs/reviews-tab";

export type TabKey = "about" | "specialties" | "team" | "reviews";

interface ContentTabsProps {
    firm: PublicFirm;
    activeTab: TabKey;
    recentPlacements?: FirmRecentPlacement[];
}

export default function ContentTabs({ firm, activeTab, recentPlacements = [] }: ContentTabsProps) {
    return (
        <>
            {activeTab === "about" && (
                <AboutTab firm={firm} recentPlacements={recentPlacements} />
            )}
            {activeTab === "specialties" && <SpecialtiesTab firm={firm} />}
            {activeTab === "team" && <TeamTab firm={firm} />}
            {activeTab === "reviews" && <ReviewsTab />}
        </>
    );
}
