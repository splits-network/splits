import type { MatchFactors } from "@splits-network/shared-types";

interface MatchFactorsSummaryProps {
    factors: MatchFactors;
}

function FactorIndicator({ passed, label }: { passed: boolean; label: string }) {
    return (
        <div className="flex items-center gap-1.5">
            <i
                className={`fa-duotone fa-regular ${
                    passed ? "fa-circle-check text-success" : "fa-circle-xmark text-error"
                }`}
            ></i>
            <span className="text-sm">{label}</span>
        </div>
    );
}

export function MatchFactorsSummary({ factors }: MatchFactorsSummaryProps) {
    return (
        <div className="space-y-3">
            <div className="grid grid-cols-2 gap-2">
                <FactorIndicator passed={factors.salary_overlap} label="Salary overlap" />
                <FactorIndicator passed={factors.employment_type_match} label="Employment type" />
                <FactorIndicator passed={factors.job_level_match} label="Job level" />
                <FactorIndicator passed={factors.location_compatible} label="Location" />
                <FactorIndicator passed={factors.commute_compatible} label="Commute" />
                <FactorIndicator passed={factors.availability_compatible} label="Availability" />
            </div>

            {/* Skills summary */}
            <div className="flex items-center gap-2">
                <i className="fa-duotone fa-regular fa-code text-base-content/60"></i>
                <span className="text-sm">
                    Skills: {factors.skills_matched.length} matched
                    {factors.skills_missing.length > 0 && (
                        <span className="text-error"> / {factors.skills_missing.length} missing</span>
                    )}
                    <span className="text-base-content/50 ml-1">
                        ({Math.round(factors.skills_match_pct)}%)
                    </span>
                </span>
            </div>
        </div>
    );
}
