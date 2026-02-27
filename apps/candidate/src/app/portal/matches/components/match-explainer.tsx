"use client";

import type { MatchFactors } from "@splits-network/shared-types";

interface MatchExplainerProps {
    factors: MatchFactors;
}

function FactorRow({
    label,
    passed,
    detail,
}: {
    label: string;
    passed: boolean;
    detail?: string;
}) {
    return (
        <div className="flex items-center gap-2 py-1">
            <i
                className={`fa-duotone fa-regular ${
                    passed ? "fa-circle-check text-success" : "fa-circle-xmark text-error/50"
                } text-sm`}
            />
            <span className="text-sm text-base-content/70">{label}</span>
            {detail && (
                <span className="text-sm text-base-content/40 ml-auto">
                    {detail}
                </span>
            )}
        </div>
    );
}

export default function MatchExplainer({ factors }: MatchExplainerProps) {
    return (
        <div className="space-y-3 pt-2">
            <FactorRow
                label="Salary alignment"
                passed={factors.salary_overlap}
                detail={`${Math.round(factors.salary_overlap_pct)}%`}
            />
            <FactorRow
                label="Employment type"
                passed={factors.employment_type_match}
            />
            <FactorRow
                label="Commute"
                passed={factors.commute_compatible}
            />
            <FactorRow
                label="Location"
                passed={factors.location_compatible}
            />
            <FactorRow
                label="Seniority level"
                passed={factors.job_level_match}
            />

            {/* Skills breakdown */}
            {(factors.skills_matched.length > 0 ||
                factors.skills_missing.length > 0) && (
                <div className="pt-2 border-t border-base-200">
                    <p className="text-sm font-semibold text-base-content/70 mb-2">
                        Skills ({Math.round(factors.skills_match_pct)}% coverage)
                    </p>
                    {factors.skills_matched.length > 0 && (
                        <div className="flex flex-wrap gap-1 mb-2">
                            {factors.skills_matched.map((skill) => (
                                <span
                                    key={skill}
                                    className="badge badge-sm badge-success badge-outline"
                                >
                                    {skill}
                                </span>
                            ))}
                        </div>
                    )}
                    {factors.skills_missing.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                            {factors.skills_missing.map((skill) => (
                                <span
                                    key={skill}
                                    className="badge badge-sm badge-error badge-outline"
                                >
                                    {skill}
                                </span>
                            ))}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
