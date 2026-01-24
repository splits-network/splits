'use client';

import { useState } from 'react';
import { Plan, COMMISSION_RATES, PLAN_DISPLAY_CONFIG, PlanSlug } from '../types';

interface PlanCardProps {
    plan: Plan;
    currentPlanId?: string;
    onSelect: (planId: string) => void;
    processing?: boolean;
    showCommissionComparison?: boolean;
    compact?: boolean;
}

/**
 * PlanCard - Displays a subscription plan with features, commission rates, and CTA
 * 
 * Features:
 * - Shows plan details (name, price, features)
 * - Highlights commission rates vs other tiers
 * - Real Stripe checkout integration via onSelect callback
 * - Current plan indicator
 * - Popular/Best Value badges
 */
export function PlanCard({
    plan,
    currentPlanId,
    onSelect,
    processing = false,
    showCommissionComparison = true,
    compact = false,
}: PlanCardProps) {
    const slug = plan.slug as PlanSlug;
    const config = PLAN_DISPLAY_CONFIG[slug];
    const commissionRates = COMMISSION_RATES[slug];
    const isCurrentPlan = plan.id === currentPlanId;
    const isFree = plan.price_cents === 0;
    const isPopular = slug === 'pro';
    const isPremium = slug === 'partner';

    // Determine card styling based on plan type
    const cardClasses = [
        'card card-border h-full transition-all duration-200',
        isCurrentPlan ? 'border-success bg-success/5 ring-2 ring-success/20' :
        isPopular ? 'border-primary bg-primary/5 ring-2 ring-primary/20 md:scale-[1.02]' :
        isPremium ? 'border-secondary bg-secondary/5' : 'border-base-300',
        !compact && 'hover:shadow-lg'
    ].filter(Boolean).join(' ');

    const getFeatureValue = (key: string): string | boolean | number => {
        const features = plan.features as Record<string, any>;
        return features[key];
    };

    const applicationLimit = getFeatureValue('applications_per_month');
    const applicationText = applicationLimit === -1 ? 'Unlimited' : `${applicationLimit}/month`;

    return (
        <div className={cardClasses}>
            <div className={`card-body ${compact ? 'p-4' : 'p-6'} flex flex-col h-full`}>
                {/* Badges */}
                <div className="flex justify-between items-start mb-2">
                    <div className="flex gap-2">
                        {config.badge && (
                            <span className={`badge badge-${isPopular ? 'primary' : 'secondary'} badge-sm`}>
                                {config.badge}
                            </span>
                        )}
                        {isCurrentPlan && (
                            <span className="badge badge-success badge-sm">
                                <i className="fa-duotone fa-regular fa-check mr-1"></i>
                                Current
                            </span>
                        )}
                    </div>
                    <div className={`w-10 h-10 rounded-xl bg-${config.color}/10 flex items-center justify-center`}>
                        <i className={`fa-duotone fa-regular ${config.icon} text-${config.color} text-lg`}></i>
                    </div>
                </div>

                {/* Plan Name & Description */}
                <div className="mb-4">
                    <h3 className="text-xl font-bold capitalize">{plan.name}</h3>
                    <p className="text-sm text-base-content/60">{config.description}</p>
                </div>

                {/* Price */}
                <div className="mb-4">
                    <div className="flex items-baseline gap-1">
                        <span className={`${compact ? 'text-3xl' : 'text-4xl'} font-bold`}>
                            {isFree ? 'Free' : `$${(plan.price_cents / 100).toFixed(0)}`}
                        </span>
                        {!isFree && (
                            <span className="text-base-content/60">/month</span>
                        )}
                    </div>
                    {!isFree && (
                        <p className="text-xs text-base-content/50 mt-1">
                            Billed monthly, cancel anytime
                        </p>
                    )}
                </div>

                {/* Commission Rates - Key differentiator */}
                {showCommissionComparison && (
                    <div className="bg-base-200/50 rounded-xl p-4 mb-4">
                        <div className="flex items-center gap-2 mb-3">
                            <i className="fa-duotone fa-regular fa-percentage text-success"></i>
                            <span className="font-semibold text-sm">Your Commission Rates</span>
                        </div>
                        <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                                <span className="text-base-content/70">As Closer</span>
                                <span className="font-semibold text-success">{commissionRates.candidate_recruiter}%</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-base-content/70">As Job Owner</span>
                                <span className="font-semibold">{commissionRates.job_owner}%</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-base-content/70">As Client Rep</span>
                                <span className="font-semibold">{commissionRates.company_recruiter}%</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-base-content/70">Sourcing Bonus</span>
                                <span className="font-semibold text-info">{commissionRates.sourcer}%</span>
                            </div>
                        </div>
                    </div>
                )}

                {/* Features List */}
                <div className="flex-1 mb-6">
                    <div className="space-y-2">
                        <FeatureItem
                            icon="fa-paper-plane"
                            text={`${applicationText} applications`}
                        />
                        {getFeatureValue('candidate_submissions') && (
                            <FeatureItem icon="fa-users" text="Submit candidates" />
                        )}
                        {getFeatureValue('basic_analytics') && (
                            <FeatureItem icon="fa-chart-simple" text="Basic analytics" />
                        )}
                        {getFeatureValue('advanced_analytics') && (
                            <FeatureItem icon="fa-chart-pie" text="Advanced analytics" highlight />
                        )}
                        {getFeatureValue('ai_matching') && (
                            <FeatureItem icon="fa-robot" text="AI-powered matching" highlight />
                        )}
                        {getFeatureValue('priority_support') && (
                            <FeatureItem icon="fa-headset" text="Priority support" highlight />
                        )}
                        {getFeatureValue('api_access') && (
                            <FeatureItem icon="fa-code" text="API access" highlight />
                        )}
                    </div>
                </div>

                {/* CTA Button */}
                <button
                    onClick={() => onSelect(plan.id)}
                    disabled={processing || isCurrentPlan}
                    className={`btn w-full ${
                        isCurrentPlan 
                            ? 'btn-success btn-outline cursor-default' 
                            : isPopular 
                            ? 'btn-primary' 
                            : isPremium
                            ? 'btn-secondary'
                            : 'btn-outline'
                    }`}
                >
                    {processing ? (
                        <>
                            <span className="loading loading-spinner loading-sm"></span>
                            Processing...
                        </>
                    ) : isCurrentPlan ? (
                        <>
                            <i className="fa-duotone fa-regular fa-check"></i>
                            Current Plan
                        </>
                    ) : isFree ? (
                        'Downgrade to Free'
                    ) : (
                        <>
                            {currentPlanId ? 'Upgrade' : 'Get Started'}
                            <i className="fa-duotone fa-regular fa-arrow-right"></i>
                        </>
                    )}
                </button>
            </div>
        </div>
    );
}

function FeatureItem({ icon, text, highlight = false }: { icon: string; text: string; highlight?: boolean }) {
    return (
        <div className="flex items-center gap-2">
            <i className={`fa-duotone fa-regular ${icon} text-sm ${highlight ? 'text-primary' : 'text-success'}`}></i>
            <span className={`text-sm ${highlight ? 'font-medium' : ''}`}>{text}</span>
        </div>
    );
}

/**
 * PlanCardGrid - Grid layout for plan cards
 */
export function PlanCardGrid({ children }: { children: React.ReactNode }) {
    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch">
            {children}
        </div>
    );
}

/**
 * CommissionComparisonTable - Detailed comparison of commission rates across tiers
 */
export function CommissionComparisonTable() {
    const tiers: PlanSlug[] = ['free', 'pro', 'partner'];
    const roles = [
        { key: 'candidate_recruiter', label: 'Closer (Candidate Rep)', description: 'Representing the candidate' },
        { key: 'job_owner', label: 'Job Owner (Specs)', description: 'Creating job postings' },
        { key: 'company_recruiter', label: 'Client Rep', description: 'Representing the company' },
        { key: 'sourcer', label: 'Sourcer Bonus', description: 'First to bring candidate/company' },
    ];

    return (
        <div className="card bg-base-100 shadow-sm border border-base-200">
            <div className="card-body">
                <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-xl bg-success/10 flex items-center justify-center">
                        <i className="fa-duotone fa-regular fa-percent text-success"></i>
                    </div>
                    <div>
                        <h3 className="font-bold text-lg">Commission Rate Comparison</h3>
                        <p className="text-sm text-base-content/60">See how your earnings grow with each tier</p>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="table table-zebra">
                        <thead>
                            <tr>
                                <th>Role</th>
                                {tiers.map(tier => (
                                    <th key={tier} className="text-center capitalize">{tier}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {roles.map(role => (
                                <tr key={role.key}>
                                    <td>
                                        <div className="font-medium">{role.label}</div>
                                        <div className="text-xs text-base-content/50">{role.description}</div>
                                    </td>
                                    {tiers.map(tier => {
                                        const rate = COMMISSION_RATES[tier][role.key as keyof typeof COMMISSION_RATES['free']];
                                        const maxRate = Math.max(...tiers.map(t => 
                                            COMMISSION_RATES[t][role.key as keyof typeof COMMISSION_RATES['free']]
                                        ));
                                        const isMax = rate === maxRate;
                                        return (
                                            <td key={tier} className="text-center">
                                                <span className={`text-lg font-bold ${isMax ? 'text-success' : ''}`}>
                                                    {rate}%
                                                </span>
                                            </td>
                                        );
                                    })}
                                </tr>
                            ))}
                            <tr className="border-t-2 border-base-300">
                                <td>
                                    <div className="font-bold">Example Payout</div>
                                    <div className="text-xs text-base-content/50">$20k placement as Closer</div>
                                </td>
                                {tiers.map(tier => {
                                    const rate = COMMISSION_RATES[tier].candidate_recruiter;
                                    const payout = 20000 * (rate / 100);
                                    return (
                                        <td key={tier} className="text-center">
                                            <span className="text-lg font-bold text-success">
                                                ${payout.toLocaleString()}
                                            </span>
                                        </td>
                                    );
                                })}
                            </tr>
                        </tbody>
                    </table>
                </div>

                <div className="alert alert-info mt-4">
                    <i className="fa-duotone fa-regular fa-info-circle"></i>
                    <div>
                        <span className="font-medium">Pro Tip:</span> Commission rates are snapshotted at the time of hire. 
                        Upgrade before your next placement to lock in higher rates!
                    </div>
                </div>
            </div>
        </div>
    );
}
