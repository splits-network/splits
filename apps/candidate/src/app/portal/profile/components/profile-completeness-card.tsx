import { useMemo } from "react";
import {
    calculateProfileCompleteness,
    TIER_CONFIG,
} from "@/lib/utils/profile-completeness";
import { CandidateSettings } from "./types";

interface ProfileCompletenessCardProps {
    settings: CandidateSettings | null;
}

export function ProfileCompletenessCard({
    settings,
}: ProfileCompletenessCardProps) {
    const completeness = useMemo(() => {
        if (!settings)
            return {
                percentage: 0,
                tier: "incomplete" as const,
                completedFields: [],
                missingFields: [],
            };
        return calculateProfileCompleteness(settings);
    }, [settings]);

    const tierConfig = useMemo(
        () => TIER_CONFIG[completeness.tier],
        [completeness.tier],
    );

    const topPriorities = useMemo(
        () => completeness.missingFields.slice(0, 3),
        [completeness.missingFields],
    );

    const incentives = useMemo(
        () => tierConfig.benefits || [],
        [tierConfig.benefits],
    );

    const tierIcon =
        completeness.tier === "complete" ? "fa-check-circle" : "fa-star";

    return (
        <div className="bg-base-200 border border-base-300 p-4 lg:p-5">
            {/* Progress Ring + Title */}
            <div className="flex flex-col items-center text-center mb-4 pb-4 border-b border-base-300">
                <div
                    className="radial-progress text-primary mb-3"
                    style={
                        {
                            "--value": completeness.percentage,
                            "--size": "4.5rem",
                            "--thickness": "0.35rem",
                        } as React.CSSProperties
                    }
                >
                    <div className="text-center">
                        <div className="text-lg font-black">
                            {completeness.percentage}%
                        </div>
                    </div>
                </div>
                <h3 className="font-bold text-sm">Profile Strength</h3>
                <span
                    className={`badge badge-${tierConfig.color} badge-sm gap-1 mt-1`}
                >
                    <i className={`fa-duotone fa-regular ${tierIcon}`} />
                    {tierConfig.title}
                </span>
            </div>

            {/* Top Priorities */}
            {topPriorities.length > 0 && (
                <div className="mb-4">
                    <p className="text-xs font-semibold uppercase tracking-wider text-base-content/40 mb-2">
                        Top Priorities
                    </p>
                    <div className="space-y-1.5">
                        {topPriorities.map((field) => (
                            <div
                                key={field.name}
                                className="flex items-baseline justify-between gap-2 text-sm"
                            >
                                <span className="text-base-content/70 leading-tight">
                                    {field.label}
                                </span>
                                <span className="text-xs font-semibold text-primary whitespace-nowrap">
                                    +{field.weight}pts
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Incentives */}
            {incentives.length > 0 && (
                <div>
                    <p className="text-xs font-semibold uppercase tracking-widest text-base-content/40 mb-2">
                        Benefits
                    </p>
                    <div className="space-y-1">
                        {incentives.slice(0, 3).map((incentive, idx) => (
                            <div
                                key={idx}
                                className="flex items-start gap-2 text-sm text-base-content/60"
                            >
                                <i
                                    className={`fa-duotone fa-regular ${tierIcon} text-xs mt-0.5`}
                                />
                                <span>{incentive}</span>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
