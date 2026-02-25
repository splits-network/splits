'use client';

interface CompanyReputationBadgeProps {
    reputation: {
        company_id?: string;
        total_applications_received: number;
        total_hires: number;
        total_placements?: number;
        completed_placements?: number;
        failed_placements?: number;
        hire_rate: number | null;
        completion_rate: number | null;
        avg_review_time_hours?: number | null;
        avg_feedback_time_hours?: number | null;
        total_expired_in_company_stages?: number;
        expiration_rate?: number | null;
        reputation_score?: number | null;
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
    const safeScore = score ?? 50;

    if (safeScore >= 90) {
        return { tier: 'Elite', color: 'badge-success', icon: 'fa-building-flag' };
    }
    if (safeScore >= 70) {
        return { tier: 'Pro', color: 'badge-primary', icon: 'fa-building' };
    }
    if (safeScore >= 40) {
        return { tier: 'Active', color: 'badge-secondary', icon: 'fa-building-columns' };
    }
    return { tier: 'New', color: 'badge-ghost', icon: 'fa-building-circle-arrow-right' };
}

export default function CompanyReputationBadge({
    reputation,
    showDetails = false,
    compact = false,
}: CompanyReputationBadgeProps) {
    const tier = getTierFromScore(reputation.reputation_score);
    const hireRate = reputation.hire_rate ?? 0;
    const completionRate = reputation.completion_rate ?? 0;
    const score = reputation.reputation_score;
    const completions = reputation.completed_placements ?? 0;
    const failures = reputation.failed_placements ?? 0;
    const expirationRate = reputation.expiration_rate;

    if (compact) {
        return (
            <div className={`badge ${tier.color} gap-1`} title={`${tier.tier} Company`}>
                <i className={`fa-duotone fa-regular ${tier.icon}`} />
                {tier.tier}
            </div>
        );
    }

    if (!showDetails) {
        return (
            <div className={`badge ${tier.color} gap-2 px-3 py-3`}>
                <i className={`fa-duotone fa-regular ${tier.icon} text-sm`} />
                <div className="text-left">
                    <div className="font-semibold">{tier.tier} Company</div>
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
                        <i className={`fa-duotone fa-regular ${tier.icon} text-white text-xl`} />
                    </div>
                    <div className="flex-1">
                        <div className="flex items-center gap-2">
                            <span className="font-bold text-lg">{tier.tier} Company</span>
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
                            {reputation.total_hires} of {reputation.total_applications_received}
                        </div>
                    </div>

                    <div className="stat bg-base-200 rounded-lg p-3">
                        <div className="stat-title text-xs">Completion Rate</div>
                        <div className="stat-value text-2xl">{completionRate.toFixed(1)}%</div>
                        <div className="stat-desc text-xs">
                            {completions} completed
                        </div>
                    </div>

                    {reputation.avg_review_time_hours !== undefined && reputation.avg_review_time_hours !== null && (
                        <div className="stat bg-base-200 rounded-lg p-3">
                            <div className="stat-title text-xs">Avg Review Time</div>
                            <div className="stat-value text-2xl">{reputation.avg_review_time_hours.toFixed(0)}</div>
                            <div className="stat-desc text-xs">hours</div>
                        </div>
                    )}

                    {reputation.avg_feedback_time_hours !== undefined && reputation.avg_feedback_time_hours !== null && (
                        <div className="stat bg-base-200 rounded-lg p-3">
                            <div className="stat-title text-xs">Avg Feedback Time</div>
                            <div className="stat-value text-2xl">{reputation.avg_feedback_time_hours.toFixed(0)}</div>
                            <div className="stat-desc text-xs">hours</div>
                        </div>
                    )}
                </div>

                {expirationRate !== undefined && expirationRate !== null && expirationRate > 10 && (
                    <div className="alert alert-warning py-2 mt-3">
                        <i className="fa-duotone fa-regular fa-triangle-exclamation" />
                        <span className="text-xs">
                            {expirationRate.toFixed(0)}% of applications expire in company-owned stages
                        </span>
                    </div>
                )}

                {failures > 0 && (
                    <div className="alert alert-warning py-2 mt-3">
                        <i className="fa-duotone fa-regular fa-triangle-exclamation" />
                        <span className="text-xs">
                            {failures} placement{failures !== 1 ? 's' : ''} failed
                        </span>
                    </div>
                )}

                <div className="text-xs text-base-content/60 mt-3 text-center">
                    Based on {reputation.total_applications_received} total applications received
                </div>
            </div>
        </div>
    );
}

export { getTierFromScore };
export type { ReputationTier };
