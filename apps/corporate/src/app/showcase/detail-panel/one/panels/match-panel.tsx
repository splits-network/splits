"use client";

import {
    data as d,
    FACTOR_CHECKS,
    CANDIDATE_ROWS,
    JOB_ROWS,
} from "./match-data";
import { PanelHeader, PanelTabs } from "./panel-header";
export function MatchPanel() {
    return (
        <div>
            <PanelHeader
                kicker={d.companyName}
                badges={[
                    { label: "Excellent Match", className: "badge-success" },
                    { label: "True Score", className: "badge-primary" },
                    { label: "Active", className: "badge-info" },
                ]}
                avatar={{ initials: d.candidateInitials }}
                title={d.candidateName}
                subtitle={d.jobTitle}
                meta={[
                    {
                        icon: "fa-duotone fa-regular fa-building",
                        text: d.companyName,
                    },
                    {
                        icon: "fa-duotone fa-regular fa-location-dot",
                        text: "Remote",
                    },
                    {
                        icon: "fa-duotone fa-regular fa-calendar",
                        text: d.generatedAgo,
                    },
                ]}
                stats={d.stats}
                actions={[
                    {
                        icon: "fa-duotone fa-regular fa-paper-plane",
                        label: "Submit",
                        className: "btn-primary btn-sm",
                    },
                    {
                        icon: "fa-duotone fa-regular fa-xmark",
                        label: "Dismiss",
                        className: "btn-error btn-outline btn-sm",
                    },
                    {
                        icon: "fa-duotone fa-regular fa-arrow-up-right-from-square",
                        label: "Profile",
                    },
                ]}
            />
            <PanelTabs
                tabs={[
                    {
                        label: "Factors",
                        value: "factors",
                        icon: "fa-duotone fa-regular fa-list-check",
                    },
                    {
                        label: "Skills",
                        value: "skills",
                        icon: "fa-duotone fa-regular fa-code",
                    },
                    {
                        label: "AI Analysis",
                        value: "ai",
                        icon: "fa-duotone fa-regular fa-brain",
                    },
                    {
                        label: "Details",
                        value: "details",
                        icon: "fa-duotone fa-regular fa-circle-info",
                    },
                ]}
            >
                {(tab) => {
                    if (tab === "factors") return <FactorsTab />;
                    if (tab === "skills") return <SkillsTab />;
                    if (tab === "ai") return <AITab />;
                    return <DetailsTab />;
                }}
            </PanelTabs>
        </div>
    );
}

function FactorsTab() {
    return (
        <div className="space-y-8 p-6">
            <div>
                <p className="text-xs font-bold uppercase tracking-[0.22em] text-base-content/30 mb-4">
                    Match Factors
                </p>
                {FACTOR_CHECKS.map((f) => {
                    const passed = d.factors[
                        f.key as keyof typeof d.factors
                    ] as boolean;
                    return (
                        <div
                            key={f.key}
                            className="flex items-center justify-between py-1.5"
                        >
                            <div className="flex items-center gap-2">
                                <i
                                    className={`fa-duotone fa-regular ${passed ? "fa-circle-check text-success" : "fa-circle-xmark text-error"}`}
                                />
                                <span className="text-sm">{f.label}</span>
                            </div>
                            <span className="text-sm text-base-content/40">
                                {f.detail}
                            </span>
                        </div>
                    );
                })}
            </div>
            <div className="border-l-4 border-l-primary pl-6">
                <p className="text-xs font-bold uppercase tracking-[0.22em] text-base-content/30 mb-3">
                    Score Breakdown
                </p>
                {[
                    { label: "Rule Score", value: d.ruleScore },
                    { label: "Skills Score", value: d.skillsScore },
                    { label: "AI Score", value: d.aiScore },
                ].map((s) => (
                    <div key={s.label} className="mb-3">
                        <div className="flex items-center justify-between mb-1">
                            <span className="text-sm text-base-content/60">
                                {s.label}
                            </span>
                            <span className="text-sm font-bold">{s.value}</span>
                        </div>
                        <div className="h-2 bg-base-300 w-full">
                            <div
                                className="h-full bg-primary"
                                style={{ width: `${s.value}%` }}
                            />
                        </div>
                    </div>
                ))}
                <div className="border-t border-base-300 pt-3 flex items-center justify-between">
                    <span className="text-sm font-bold">Overall</span>
                    <span className="text-lg font-black text-primary">
                        {d.matchScore}
                    </span>
                </div>
            </div>
        </div>
    );
}

function SkillsTab() {
    const { skills_matched: matched, skills_missing: missing } = d.factors;
    const pct = Math.round(
        (matched.length / (matched.length + missing.length)) * 100,
    );
    return (
        <div className="space-y-8 p-6">
            <div className="bg-base-200 border border-base-300 p-4 text-center">
                <p className="text-4xl font-black text-primary">{pct}%</p>
                <p className="text-sm text-base-content/50 mt-1">
                    {matched.length} of {matched.length + missing.length}{" "}
                    required skills matched
                </p>
            </div>
            {[
                {
                    label: "Matched Skills",
                    items: matched,
                    cls: "badge-success badge-outline",
                },
                {
                    label: "Missing Skills",
                    items: missing,
                    cls: "badge-error badge-outline",
                },
            ].map((g) => (
                <div key={g.label}>
                    <p className="text-xs font-bold uppercase tracking-[0.22em] text-base-content/30 mb-4">
                        {g.label}
                    </p>
                    <div className="flex flex-wrap gap-2">
                        {g.items.map((s) => (
                            <span key={s} className={`badge ${g.cls}`}>
                                {s}
                            </span>
                        ))}
                    </div>
                </div>
            ))}
            <div className="border-l-4 border-l-primary pl-6">
                <p className="text-xs font-bold uppercase tracking-[0.22em] text-base-content/30 mb-2">
                    Cosine Similarity
                </p>
                <p className="text-sm text-base-content/60">
                    Embedding distance:{" "}
                    <span className="font-bold text-base-content">
                        {d.factors.cosine_similarity}
                    </span>
                </p>
            </div>
        </div>
    );
}

function AITab() {
    return (
        <div className="space-y-8 p-6">
            <div className="bg-primary/5 border-l-4 border-l-primary p-4">
                <div className="flex items-center gap-2 mb-2">
                    <i className="fa-duotone fa-regular fa-brain text-primary" />
                    <span className="text-sm font-bold text-primary">
                        AI Score: {d.aiScore}
                    </span>
                    <span className="badge badge-primary badge-sm ml-auto">
                        True Score
                    </span>
                </div>
                <p className="text-sm text-base-content/70 leading-relaxed">
                    {d.factors.ai_summary}
                </p>
            </div>
            <div className="border-l-4 border-l-success pl-6">
                <p className="text-xs font-bold uppercase tracking-[0.22em] text-base-content/30 mb-3">
                    Strengths
                </p>
                <ul className="space-y-2">
                    {d.strengths.map((s) => (
                        <li
                            key={s}
                            className="flex items-start gap-2 text-sm text-base-content/70"
                        >
                            <i className="fa-duotone fa-regular fa-circle-check text-success mt-0.5" />
                            {s}
                        </li>
                    ))}
                </ul>
            </div>
            <div className="border-l-4 border-l-warning pl-6">
                <p className="text-xs font-bold uppercase tracking-[0.22em] text-base-content/30 mb-3">
                    Concerns
                </p>
                <ul className="space-y-2">
                    {d.concerns.map((c) => (
                        <li
                            key={c}
                            className="flex items-start gap-2 text-sm text-base-content/70"
                        >
                            <i className="fa-duotone fa-regular fa-triangle-exclamation text-warning mt-0.5" />
                            {c}
                        </li>
                    ))}
                </ul>
            </div>
            <div className="relative overflow-hidden border border-base-300 p-4">
                <div className="blur-sm select-none pointer-events-none">
                    <p className="text-sm text-base-content/60">
                        Career trajectory scoring, culture fit deep-dive,
                        retention risk...
                    </p>
                </div>
                <div className="">
                    <i className="fa-duotone fa-regular fa-lock text-2xl text-primary mb-2" />
                    <p className="font-semibold mb-1">Unlock Full AI Report</p>
                    <p className="text-sm text-base-content/50">
                        Upgrade to Partner for deeper insights
                    </p>
                </div>
            </div>
        </div>
    );
}

function DetailsTab() {
    const renderCard = (
        title: string,
        rows: { icon: string; label: string; value: string }[],
    ) => (
        <div className="bg-base-200 border border-base-300 border-l-4 border-l-primary">
            <div className="px-6 py-4 border-b border-base-300">
                <p className="text-xs font-bold uppercase tracking-[0.22em] text-base-content/40">
                    {title}
                </p>
            </div>
            <div className="divide-y divide-base-300">
                {rows.map((r) => (
                    <div
                        key={r.label}
                        className="flex items-center gap-4 px-6 py-3"
                    >
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
    return (
        <div className="space-y-8 p-6">
            {renderCard("Candidate", CANDIDATE_ROWS)}
            {renderCard("Job", JOB_ROWS)}
            <p className="text-sm text-base-content/30 text-center">
                Generated {d.generatedAt} via{" "}
                {d.matchTier === "true" ? "True Score" : "Standard"} engine
            </p>
        </div>
    );
}
