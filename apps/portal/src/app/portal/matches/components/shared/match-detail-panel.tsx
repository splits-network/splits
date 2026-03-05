"use client";

import { useState } from "react";
import { BaselTabBar } from "@splits-network/basel-ui";
import type { EnrichedMatch } from "../../types";
import {
    candidateDisplayName,
    jobDisplayTitle,
    companyDisplayName,
    formatMatchDate,
    tierLabel,
} from "../../types";
import { MatchPanelHeader } from "./match-panel-header";
import { FactorsTab } from "./match-panel-tabs/factors-tab";
import { SkillsTab } from "./match-panel-tabs/skills-tab";
import { AITab } from "./match-panel-tabs/ai-tab";

type MatchDetailTab = "factors" | "skills" | "ai" | "details";

const TABS = [
    { label: "Factors", value: "factors", icon: "fa-duotone fa-regular fa-list-check" },
    { label: "Skills", value: "skills", icon: "fa-duotone fa-regular fa-code" },
    { label: "AI Analysis", value: "ai", icon: "fa-duotone fa-regular fa-brain" },
    { label: "Details", value: "details", icon: "fa-duotone fa-regular fa-circle-info" },
];

interface MatchDetailPanelProps {
    match: EnrichedMatch;
    isPartner: boolean;
    onClose?: () => void;
    onDismiss?: (id: string) => void;
    dismissing?: boolean;
}

export function MatchDetailPanel({
    match,
    isPartner,
    onClose,
    onDismiss,
    dismissing,
}: MatchDetailPanelProps) {
    const [activeTab, setActiveTab] = useState<MatchDetailTab>("factors");

    return (
        <div className="h-full overflow-y-auto">
            <MatchPanelHeader
                match={match}
                isPartner={isPartner}
                onClose={onClose}
                onDismiss={onDismiss}
                dismissing={dismissing}
            />
            <BaselTabBar
                tabs={TABS}
                active={activeTab}
                onChange={(v) => setActiveTab(v as MatchDetailTab)}
                className="bg-base-100 border-b border-base-300"
            />
            {activeTab === "factors" && <FactorsTab match={match} isPartner={isPartner} />}
            {activeTab === "skills" && <SkillsTab match={match} />}
            {activeTab === "ai" && <AITab match={match} isPartner={isPartner} />}
            {activeTab === "details" && <DetailsTab match={match} />}
        </div>
    );
}

/* ─── Details Tab (inline — small enough to stay in shell) ────────── */

function DetailsTab({ match }: { match: EnrichedMatch }) {
    const candidateRows = [
        { icon: "fa-duotone fa-regular fa-user", label: "Full Name", value: candidateDisplayName(match) },
    ];

    const jobRows = [
        { icon: "fa-duotone fa-regular fa-briefcase", label: "Job Title", value: jobDisplayTitle(match) },
        { icon: "fa-duotone fa-regular fa-building", label: "Company", value: companyDisplayName(match) },
        { icon: "fa-duotone fa-regular fa-location-dot", label: "Location", value: match.job?.location ?? "Remote" },
        { icon: "fa-duotone fa-regular fa-clock", label: "Employment", value: match.job?.employment_type ?? "N/A" },
        { icon: "fa-duotone fa-regular fa-user-tie", label: "Level", value: match.job?.job_level ?? "N/A" },
        ...(match.job?.salary_min != null && match.job?.salary_max != null
            ? [{ icon: "fa-duotone fa-regular fa-dollar-sign", label: "Salary Range", value: `$${match.job.salary_min.toLocaleString()} – $${match.job.salary_max.toLocaleString()}` }]
            : []),
    ];

    return (
        <div className="space-y-8 p-6">
            <DetailCard title="Candidate" rows={candidateRows} />
            <DetailCard title="Job" rows={jobRows} />
            <p className="text-sm text-base-content/30 text-center">
                Generated {formatMatchDate(match.generated_at)} via{" "}
                {tierLabel(match.match_tier)} engine
            </p>
        </div>
    );
}

function DetailCard({
    title,
    rows,
}: {
    title: string;
    rows: { icon: string; label: string; value: string }[];
}) {
    return (
        <div className="bg-base-200 border border-base-300 border-l-4 border-l-primary">
            <div className="px-6 py-4 border-b border-base-300">
                <p className="text-xs font-bold uppercase tracking-[0.22em] text-base-content/40">
                    {title}
                </p>
            </div>
            <div className="divide-y divide-base-300">
                {rows.map((r) => (
                    <div key={r.label} className="flex items-center gap-4 px-6 py-3">
                        <div className="w-8 h-8 bg-primary/10 flex items-center justify-center shrink-0">
                            <i className={`${r.icon} text-primary text-sm`} />
                        </div>
                        <div className="min-w-0 flex-1">
                            <p className="text-xs font-bold uppercase tracking-[0.18em] text-base-content/30 mb-0.5">
                                {r.label}
                            </p>
                            <p className="text-sm font-semibold text-base-content truncate">
                                {r.value}
                            </p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
