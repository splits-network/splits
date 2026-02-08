"use client";

interface RecruiterReputationProps {
    reputationScore: number | null | undefined;
    totalPlacements?: number;
    variant?: "compact" | "full";
}

type ReputationTier = {
    tier: "Elite" | "Pro" | "Active" | "New";
    color: string;
    icon: string;
    bgColor: string;
};

/**
 * Get tier from reputation score (0-100).
 * Tier thresholds: Elite (90+), Pro (70-89), Active (40-69), New (<40)
 */
function getTierFromScore(score: number | null | undefined): ReputationTier {
    const safeScore = score ?? 50;

    if (safeScore >= 90) {
        return {
            tier: "Elite",
            color: "text-success",
            icon: "fa-crown",
            bgColor: "bg-success/10",
        };
    }
    if (safeScore >= 70) {
        return {
            tier: "Pro",
            color: "text-primary",
            icon: "fa-star",
            bgColor: "bg-primary/10",
        };
    }
    if (safeScore >= 40) {
        return {
            tier: "Active",
            color: "text-base-content/70",
            icon: "fa-circle-check",
            bgColor: "bg-base-300",
        };
    }
    return {
        tier: "New",
        color: "text-base-content/50",
        icon: "fa-seedling",
        bgColor: "bg-base-200",
    };
}

/**
 * Convert score to 5-star rating (0-100 -> 0-5)
 */
function scoreToStars(score: number | null | undefined): number {
    if (score === null || score === undefined) return 2.5;
    return Math.round((score / 20) * 2) / 2; // Round to nearest 0.5
}

/**
 * Recruiter reputation display for candidate marketplace.
 * Shows 5-star rating and tier badge.
 */
export default function RecruiterReputation({
    reputationScore,
    totalPlacements = 0,
    variant = "compact",
}: RecruiterReputationProps) {
    const tier = getTierFromScore(reputationScore);
    const stars = scoreToStars(reputationScore);
    const fullStars = Math.floor(stars);
    const hasHalfStar = stars % 1 !== 0;

    if (variant === "compact") {
        return (
            <div className="flex items-center gap-2">
                {/* Star rating */}
                <div className="flex items-center gap-0.5">
                    {[...Array(5)].map((_, i) => {
                        if (i < fullStars) {
                            return (
                                <i
                                    key={i}
                                    className="fa-duotone fa-regular fa-star text-warning text-xs"
                                />
                            );
                        }
                        if (i === fullStars && hasHalfStar) {
                            return (
                                <i
                                    key={i}
                                    className="fa-duotone fa-star-half-stroke text-warning text-xs"
                                />
                            );
                        }
                        return (
                            <i
                                key={i}
                                className="fa-duotone fa-regular fa-star text-base-300 text-xs"
                            />
                        );
                    })}
                </div>

                {/* Tier badge */}
                <span
                    className={`badge badge-xs gap-1 ${tier.bgColor} ${tier.color} border-0`}
                >
                    <i
                        className={`fa-duotone fa-regular ${tier.icon} text-[8px]`}
                    />
                    {tier.tier}
                </span>
            </div>
        );
    }

    // Full variant
    return (
        <div className="card bg-base-100 border border-base-300">
            <div className="card-body p-4">
                {/* Tier header */}
                <div className="flex items-center gap-3 mb-3">
                    <div
                        className={`w-12 h-12 rounded-full ${tier.bgColor} flex items-center justify-center`}
                    >
                        <i
                            className={`fa-duotone fa-regular ${tier.icon} ${tier.color} text-xl`}
                        />
                    </div>
                    <div>
                        <div className="font-bold text-lg">
                            {tier.tier} Recruiter
                        </div>
                        <div className="text-sm text-base-content/60">
                            {reputationScore !== null &&
                            reputationScore !== undefined
                                ? `${reputationScore.toFixed(0)} reputation`
                                : "Building reputation"}
                        </div>
                    </div>
                </div>

                {/* Star rating */}
                <div className="flex items-center gap-2 mb-2">
                    <div className="flex items-center gap-1">
                        {[...Array(5)].map((_, i) => {
                            if (i < fullStars) {
                                return (
                                    <i
                                        key={i}
                                        className="fa-duotone fa-regular fa-star text-warning text-lg"
                                    />
                                );
                            }
                            if (i === fullStars && hasHalfStar) {
                                return (
                                    <i
                                        key={i}
                                        className="fa-duotone fa-star-half-stroke text-warning text-lg"
                                    />
                                );
                            }
                            return (
                                <i
                                    key={i}
                                    className="fa-duotone fa-regular fa-star text-base-300 text-lg"
                                />
                            );
                        })}
                    </div>
                    <span className="text-lg font-semibold">
                        {stars.toFixed(1)}
                    </span>
                </div>

                {/* Placement count */}
                {totalPlacements > 0 && (
                    <div className="text-sm text-base-content/60">
                        <i className="fa-duotone fa-regular fa-handshake mr-1" />
                        {totalPlacements} successful placement
                        {totalPlacements !== 1 ? "s" : ""}
                    </div>
                )}
            </div>
        </div>
    );
}

export { getTierFromScore, scoreToStars };
