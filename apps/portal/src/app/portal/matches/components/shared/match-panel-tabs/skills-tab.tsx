import type { EnrichedMatch } from "../../../types";

interface SkillsTabProps {
    match: EnrichedMatch;
}

export function SkillsTab({ match }: SkillsTabProps) {
    const { skills_matched: matched, skills_missing: missing } = match.match_factors;
    const total = matched.length + missing.length;
    const pct = total > 0 ? Math.round((matched.length / total) * 100) : 0;

    return (
        <div className="space-y-8 p-6">
            <div className="bg-base-200 border border-base-300 p-4 text-center">
                <p className="text-4xl font-black text-primary">{pct}%</p>
                <p className="text-sm text-base-content/50 mt-1">
                    {matched.length} of {total} required skills matched
                </p>
            </div>

            {matched.length > 0 && (
                <div>
                    <p className="text-xs font-bold uppercase tracking-[0.22em] text-base-content/30 mb-4">
                        Matched Skills
                    </p>
                    <div className="flex flex-wrap gap-2">
                        {matched.map((s) => (
                            <span key={s} className="badge badge-success badge-outline">
                                {s}
                            </span>
                        ))}
                    </div>
                </div>
            )}

            {missing.length > 0 && (
                <div>
                    <p className="text-xs font-bold uppercase tracking-[0.22em] text-base-content/30 mb-4">
                        Missing Skills
                    </p>
                    <div className="flex flex-wrap gap-2">
                        {missing.map((s) => (
                            <span key={s} className="badge badge-error badge-outline">
                                {s}
                            </span>
                        ))}
                    </div>
                </div>
            )}

            {match.match_factors.cosine_similarity !== undefined && (
                <div className="border-l-4 border-l-primary pl-6">
                    <p className="text-xs font-bold uppercase tracking-[0.22em] text-base-content/30 mb-2">
                        Cosine Similarity
                    </p>
                    <p className="text-sm text-base-content/60">
                        Embedding distance:{" "}
                        <span className="font-bold text-base-content">
                            {match.match_factors.cosine_similarity}
                        </span>
                    </p>
                </div>
            )}
        </div>
    );
}
