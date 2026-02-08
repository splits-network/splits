'use client';

interface RecruiterReputationBadgeProps {
    reputation: {
        recruiter_user_id?: string;
        recruiter_id?: string;
        total_submissions: number;
        total_hires: number;
        total_completions?: number;
        completed_placements?: number;
        total_failures?: number;
        failed_placements?: number;
        hire_rate: number | null;
        completion_rate: number | null;
        reputation_score?: number | null;
        avg_time_to_hire_days?: number;
        avg_response_time_hours?: number | null;
        quality_score?: number;
    };
    showDetails?: boolean;
    compact?: boolean;
}

type ReputationTier = {
    tier: 'Elite' | 'Pro' | 'Active' | 'New';
    color: string;
    icon: string;
};

/**
 * Get tier from reputation score (0-100).
 * Tier thresholds: Elite (90+), Pro (70-89), Active (40-69), New (<40)
 */
function getTierFromScore(score: number | null | undefined): ReputationTier {
    const safeScore = score ?? 50; // Default neutral score for new recruiters

    if (safeScore >= 90) {
        return { tier: 'Elite', color: 'badge-success', icon: 'fa-crown' };
    }
    if (safeScore >= 70) {
        return { tier: 'Pro', color: 'badge-primary', icon: 'fa-star' };
    }
    if (safeScore >= 40) {
        return { tier: 'Active', color: 'badge-secondary', icon: 'fa-circle-check' };
    }
    return { tier: 'New', color: 'badge-ghost', icon: 'fa-seedling' };
}

/**
 * Legacy fallback: Get tier from hire_rate and completion_rate.
 * Used when reputation_score is not available.
 */
function getTierFromRates(hireRate: number | null, completionRate: number | null): ReputationTier {
    const avgRate = ((hireRate ?? 0) + (completionRate ?? 0)) / 2;

    if (avgRate >= 75) {
        return { tier: 'Elite', color: 'badge-success', icon: 'fa-crown' };
    }
    if (avgRate >= 50) {
        return { tier: 'Pro', color: 'badge-primary', icon: 'fa-star' };
    }
    if (avgRate >= 25) {
        return { tier: 'Active', color: 'badge-secondary', icon: 'fa-circle-check' };
    }
    return { tier: 'New', color: 'badge-ghost', icon: 'fa-seedling' };
}

export default function RecruiterReputationBadge({
    reputation,
    showDetails = false,
    compact = false
}: RecruiterReputationBadgeProps) {
    // Use reputation_score for tier if available, otherwise fallback to rates
    const tier = reputation.reputation_score !== undefined && reputation.reputation_score !== null
        ? getTierFromScore(reputation.reputation_score)
        : getTierFromRates(reputation.hire_rate, reputation.completion_rate);

    // Normalize field names (support both naming conventions)
    const completions = reputation.total_completions ?? reputation.completed_placements ?? 0;
    const failures = reputation.total_failures ?? reputation.failed_placements ?? 0;
    const hireRate = reputation.hire_rate ?? 0;
    const completionRate = reputation.completion_rate ?? 0;
    const score = reputation.reputation_score ?? reputation.quality_score;

    if (compact) {
        return (
            <div className={`badge ${tier.color} gap-1`} title={`${tier.tier} Recruiter`}>
                <i className={`fa-duotone fa-regular ${tier.icon}`}></i>
                {tier.tier}
            </div>
        );
    }

    if (!showDetails) {
        return (
            <div className={`badge ${tier.color} gap-2 px-3 py-3`}>
                <i className={`fa-duotone fa-regular ${tier.icon} text-sm`}></i>
                <div className="text-left">
                    <div className="font-semibold">{tier.tier} Recruiter</div>
                    <div className="text-xs opacity-70">
                        {score !== undefined && score !== null
                            ? `${score.toFixed(0)} reputation`
                            : `${hireRate.toFixed(0)}% hire rate`}
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="card bg-base-100 border border-base-300">
            <div className="card-body p-4">
                <div className="flex items-start gap-3 mb-3">
                    <div className={`w-12 h-12 rounded-full ${tier.color.replace('badge-', 'bg-')} flex items-center justify-center`}>
                        <i className={`fa-duotone fa-regular ${tier.icon} text-white text-xl`}></i>
                    </div>
                    <div className="flex-1">
                        <div className="flex items-center gap-2">
                            <span className="font-bold text-lg">{tier.tier} Recruiter</span>
                            <span className={`badge ${tier.color} badge-sm`}>{tier.tier.toUpperCase()}</span>
                        </div>
                        <p className="text-sm text-base-content/60 mt-1">
                            {score !== undefined && score !== null
                                ? `Reputation Score: ${score.toFixed(1)}`
                                : 'Building reputation...'}
                        </p>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                    <div className="stat bg-base-200 rounded-lg p-3">
                        <div className="stat-title text-xs">Hire Rate</div>
                        <div className="stat-value text-2xl">{hireRate.toFixed(1)}%</div>
                        <div className="stat-desc text-xs">
                            {reputation.total_hires} of {reputation.total_submissions}
                        </div>
                    </div>

                    <div className="stat bg-base-200 rounded-lg p-3">
                        <div className="stat-title text-xs">Completion Rate</div>
                        <div className="stat-value text-2xl">{completionRate.toFixed(1)}%</div>
                        <div className="stat-desc text-xs">
                            {completions} completed
                        </div>
                    </div>

                    {reputation.avg_time_to_hire_days !== undefined && (
                        <div className="stat bg-base-200 rounded-lg p-3">
                            <div className="stat-title text-xs">Avg Time to Hire</div>
                            <div className="stat-value text-2xl">{reputation.avg_time_to_hire_days.toFixed(0)}</div>
                            <div className="stat-desc text-xs">days</div>
                        </div>
                    )}

                    {reputation.avg_response_time_hours !== undefined && reputation.avg_response_time_hours !== null && (
                        <div className="stat bg-base-200 rounded-lg p-3">
                            <div className="stat-title text-xs">Response Time</div>
                            <div className="stat-value text-2xl">{reputation.avg_response_time_hours.toFixed(0)}</div>
                            <div className="stat-desc text-xs">hours avg</div>
                        </div>
                    )}
                </div>

                {failures > 0 && (
                    <div className="alert alert-warning py-2 mt-3">
                        <i className="fa-duotone fa-regular fa-triangle-exclamation"></i>
                        <span className="text-xs">
                            {failures} placement{failures !== 1 ? 's' : ''} failed
                        </span>
                    </div>
                )}

                <div className="text-xs text-base-content/60 mt-3 text-center">
                    Based on {reputation.total_submissions} total submissions
                </div>
            </div>
        </div>
    );
}

// Export tier function for use in other components
export { getTierFromScore, getTierFromRates };
export type { ReputationTier };
