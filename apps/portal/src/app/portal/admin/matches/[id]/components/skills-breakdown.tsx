interface SkillsBreakdownProps {
    matched: string[];
    missing: string[];
    matchPct: number;
}

export function SkillsBreakdown({ matched, missing, matchPct }: SkillsBreakdownProps) {
    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <h3 className="font-semibold">Skills alignment</h3>
                <span className="text-sm text-base-content/60">
                    {Math.round(matchPct)}% coverage
                </span>
            </div>

            {/* Matched skills */}
            {matched.length > 0 && (
                <div>
                    <p className="text-sm text-base-content/60 mb-2">
                        <i className="fa-duotone fa-regular fa-circle-check text-success mr-1"></i>
                        Matched ({matched.length})
                    </p>
                    <div className="flex flex-wrap gap-2">
                        {matched.map((skill) => (
                            <span key={skill} className="badge badge-success badge-outline badge-sm">
                                {skill}
                            </span>
                        ))}
                    </div>
                </div>
            )}

            {/* Missing skills */}
            {missing.length > 0 && (
                <div>
                    <p className="text-sm text-base-content/60 mb-2">
                        <i className="fa-duotone fa-regular fa-circle-xmark text-error mr-1"></i>
                        Missing ({missing.length})
                    </p>
                    <div className="flex flex-wrap gap-2">
                        {missing.map((skill) => (
                            <span key={skill} className="badge badge-error badge-outline badge-sm">
                                {skill}
                            </span>
                        ))}
                    </div>
                </div>
            )}

            {matched.length === 0 && missing.length === 0 && (
                <p className="text-sm text-base-content/50">No skills data available for this match. Skills are compared when both the candidate profile and role requirements include them.</p>
            )}
        </div>
    );
}
