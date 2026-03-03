import { BaselTabBar } from "@splits-network/basel-ui";

export type EntityType = "recruiter" | "candidate" | "company";
export type Period = "weekly" | "monthly" | "quarterly" | "all_time";
export type Metric = "total_xp" | "placements" | "hire_rate";

export const ENTITY_TABS: { key: EntityType; label: string; icon: string }[] = [
    { key: "recruiter", label: "Recruiters", icon: "fa-duotone fa-regular fa-user-tie" },
    { key: "candidate", label: "Candidates", icon: "fa-duotone fa-regular fa-user" },
    { key: "company", label: "Companies", icon: "fa-duotone fa-regular fa-building" },
];

export const PERIOD_OPTIONS: { key: Period; label: string }[] = [
    { key: "weekly", label: "This Week" },
    { key: "monthly", label: "This Month" },
    { key: "quarterly", label: "This Quarter" },
    { key: "all_time", label: "All Time" },
];

export const METRIC_OPTIONS: { key: Metric; label: string }[] = [
    { key: "total_xp", label: "Total XP" },
    { key: "placements", label: "Placements" },
    { key: "hire_rate", label: "Hire Rate" },
];

export const HERO_COPY: Record<EntityType, { title: string; subtitle: string }> = {
    recruiter: {
        title: "Who's Closing.",
        subtitle: "Every placement counted. Every hire rate earned. This is where the best prove it.",
    },
    candidate: {
        title: "Show Your Range.",
        subtitle: "Recruiters are watching. Your XP reflects how you engage and how serious you are.",
    },
    company: {
        title: "The Firms That Get It Done.",
        subtitle: "Hiring isn't passive. The companies ranked here move fast and close.",
    },
};

interface LeaderboardFilterBarProps {
    entityType: EntityType;
    period: Period;
    metric: Metric;
    onEntityTypeChange: (v: EntityType) => void;
    onPeriodChange: (v: Period) => void;
    onMetricChange: (v: Metric) => void;
}

export function LeaderboardFilterBar({
    entityType,
    period,
    metric,
    onEntityTypeChange,
    onPeriodChange,
    onMetricChange,
}: LeaderboardFilterBarProps) {
    return (
        <div className="max-w-7xl mx-auto mb-8">
            <BaselTabBar
                tabs={ENTITY_TABS.map((t) => ({ label: t.label, value: t.key, icon: t.icon }))}
                active={entityType}
                onChange={(v) => onEntityTypeChange(v as EntityType)}
            />

            <div className="sticky top-0 z-10 backdrop-blur-md bg-base-100/90 border-b border-base-300 py-4 flex flex-wrap gap-6 mt-4">
                <fieldset className="fieldset">
                    <label className="label text-xs font-bold uppercase tracking-widest text-base-content/40">
                        Period
                    </label>
                    <select
                        className="select select-sm rounded-none"
                        value={period}
                        onChange={(e) => onPeriodChange(e.target.value as Period)}
                    >
                        {PERIOD_OPTIONS.map((opt) => (
                            <option key={opt.key} value={opt.key}>{opt.label}</option>
                        ))}
                    </select>
                </fieldset>

                <fieldset className="fieldset">
                    <label className="label text-xs font-bold uppercase tracking-widest text-base-content/40">
                        Metric
                    </label>
                    <select
                        className="select select-sm rounded-none"
                        value={metric}
                        onChange={(e) => onMetricChange(e.target.value as Metric)}
                    >
                        {METRIC_OPTIONS.map((opt) => (
                            <option key={opt.key} value={opt.key}>{opt.label}</option>
                        ))}
                    </select>
                </fieldset>
            </div>
        </div>
    );
}
