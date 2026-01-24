'use client';

import Link from 'next/link';
import { StatCard, StatCardGrid, ContentCard } from '@/components/ui/cards';
import { TrendBadge } from '@/components/ui';
import { Subscription, BillingStats, COMMISSION_RATES, PlanSlug } from '../types';

interface BillingStatsProps {
    subscription: Subscription | null;
    stats: BillingStats | null;
    loading?: boolean;
}

/**
 * BillingStatsSection - Displays key billing metrics in a stat card grid
 * 
 * Shows:
 * - Current subscription status
 * - Earnings YTD
 * - Pending payouts
 * - Current commission rate
 */
export function BillingStatsSection({ subscription, stats, loading }: BillingStatsProps) {
    if (loading) {
        return (
            <StatCardGrid>
                {[1, 2, 3, 4].map((i) => (
                    <StatCard key={i} title="" value={0} icon="fa-spinner" loading />
                ))}
            </StatCardGrid>
        );
    }

    const planSlug = (subscription?.plan?.slug || 'free') as PlanSlug;
    const commissionRate = COMMISSION_RATES[planSlug]?.candidate_recruiter || 20;

    return (
        <StatCardGrid>
            <StatCard
                title="Subscription"
                value={subscription?.plan?.name || 'Free'}
                description={subscription?.status === 'active' ? 'Active' : subscription?.status || 'No subscription'}
                icon={subscription?.status === 'active' ? 'fa-check-circle' : 'fa-clock'}
                color={subscription?.status === 'active' ? 'success' : 'warning'}
                href="/portal/billing/plans"
            />
            <StatCard
                title="Earnings YTD"
                value={`$${((stats?.total_earnings_ytd || 0) / 100).toLocaleString()}`}
                description={`${stats?.placements_this_year || 0} placements`}
                icon="fa-sack-dollar"
                color="success"
                href="/portal/placements"
            />
            <StatCard
                title="Pending Payouts"
                value={`$${((stats?.pending_payouts || 0) / 100).toLocaleString()}`}
                description={`${stats?.completed_payouts_count || 0} completed`}
                icon="fa-money-bill-transfer"
                color="primary"
            />
            <StatCard
                title="Commission Rate"
                value={`${commissionRate}%`}
                description={`${planSlug.charAt(0).toUpperCase() + planSlug.slice(1)} tier`}
                icon="fa-percentage"
                color="info"
                href="/portal/billing/plans"
            />
        </StatCardGrid>
    );
}

interface SubscriptionCardProps {
    subscription: Subscription | null;
    onManage: () => void;
    onChangePlan: () => void;
    processing?: boolean;
}

/**
 * SubscriptionCard - Displays current subscription details with management actions
 */
export function SubscriptionCard({ 
    subscription, 
    onManage, 
    onChangePlan, 
    processing 
}: SubscriptionCardProps) {
    const planSlug = (subscription?.plan?.slug || 'free') as PlanSlug;
    const commissionRate = COMMISSION_RATES[planSlug]?.candidate_recruiter || 20;
    const isActive = subscription?.status === 'active';
    const isFree = !subscription?.stripe_subscription_id;

    return (
        <ContentCard
            title="Current Subscription"
            icon="fa-crown"
            headerActions={
                <div className="flex gap-2">
                    {!isFree && (
                        <button
                            onClick={onManage}
                            disabled={processing}
                            className="btn btn-sm btn-ghost"
                        >
                            {processing ? (
                                <span className="loading loading-spinner loading-xs"></span>
                            ) : (
                                <>
                                    <i className="fa-duotone fa-regular fa-gear"></i>
                                    Manage
                                </>
                            )}
                        </button>
                    )}
                    <Link href="/portal/billing/plans" className="btn btn-sm btn-primary">
                        <i className="fa-duotone fa-regular fa-arrow-up"></i>
                        {isFree ? 'Upgrade' : 'Change Plan'}
                    </Link>
                </div>
            }
        >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Plan Details */}
                <div>
                    <div className="flex items-center gap-3 mb-4">
                        <div className={`badge badge-lg ${isActive ? 'badge-success' : 'badge-warning'}`}>
                            <i className={`fa-duotone fa-regular ${isActive ? 'fa-check' : 'fa-clock'} mr-1`}></i>
                            {subscription?.status || 'Free Tier'}
                        </div>
                        <h3 className="text-2xl font-bold">{subscription?.plan?.name || 'Free'}</h3>
                    </div>

                    <div className="space-y-3">
                        <div className="flex justify-between items-center py-2 border-b border-base-200">
                            <span className="text-base-content/70">Monthly Price</span>
                            <span className="font-semibold">
                                {subscription?.plan?.price_monthly || '$0'}/month
                            </span>
                        </div>
                        <div className="flex justify-between items-center py-2 border-b border-base-200">
                            <span className="text-base-content/70">Commission Rate</span>
                            <span className="font-semibold text-success">{commissionRate}%</span>
                        </div>
                        {subscription?.current_period_end && (
                            <div className="flex justify-between items-center py-2 border-b border-base-200">
                                <span className="text-base-content/70">Renews On</span>
                                <span className="font-semibold">
                                    {new Date(subscription.current_period_end).toLocaleDateString()}
                                </span>
                            </div>
                        )}
                    </div>
                </div>

                {/* Quick Upgrade Prompt */}
                {planSlug !== 'partner' && (
                    <div className="bg-gradient-to-br from-primary/10 to-secondary/10 rounded-xl p-4">
                        <div className="flex items-start gap-3">
                            <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center shrink-0">
                                <i className="fa-duotone fa-regular fa-rocket text-primary"></i>
                            </div>
                            <div>
                                <h4 className="font-semibold mb-1">
                                    {planSlug === 'free' ? 'Upgrade to Pro' : 'Go Partner'}
                                </h4>
                                <p className="text-sm text-base-content/70 mb-3">
                                    {planSlug === 'free' 
                                        ? 'Earn 30% commission instead of 20% on every placement.'
                                        : 'Maximize your earnings with 40% commission rates.'
                                    }
                                </p>
                                <Link 
                                    href="/portal/billing/plans" 
                                    className="btn btn-sm btn-primary"
                                >
                                    See Plans
                                    <i className="fa-duotone fa-regular fa-arrow-right"></i>
                                </Link>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </ContentCard>
    );
}

interface EarningsCardProps {
    stats: BillingStats | null;
    loading?: boolean;
}

/**
 * EarningsOverviewCard - Shows earnings breakdown and recent payouts
 */
export function EarningsOverviewCard({ stats, loading }: EarningsCardProps) {
    if (loading) {
        return (
            <ContentCard title="Earnings Overview" icon="fa-chart-line" loading>
                <div className="h-40"></div>
            </ContentCard>
        );
    }

    return (
        <ContentCard
            title="Earnings Overview"
            icon="fa-chart-line"
            headerActions={
                <Link href="/portal/placements" className="btn btn-sm btn-ghost text-success">
                    View All
                    <i className="fa-duotone fa-regular fa-arrow-right"></i>
                </Link>
            }
        >
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-4 bg-success/10 rounded-xl">
                    <div className="text-2xl font-bold text-success">
                        ${((stats?.total_earnings_ytd || 0) / 100).toLocaleString()}
                    </div>
                    <div className="text-sm text-base-content/60">Earnings YTD</div>
                </div>
                <div className="text-center p-4 bg-primary/10 rounded-xl">
                    <div className="text-2xl font-bold text-primary">
                        ${((stats?.pending_payouts || 0) / 100).toLocaleString()}
                    </div>
                    <div className="text-sm text-base-content/60">Pending</div>
                </div>
                <div className="text-center p-4 bg-secondary/10 rounded-xl">
                    <div className="text-2xl font-bold text-secondary">
                        {stats?.placements_this_year || 0}
                    </div>
                    <div className="text-sm text-base-content/60">Placements YTD</div>
                </div>
                <div className="text-center p-4 bg-info/10 rounded-xl">
                    <div className="text-2xl font-bold text-info">
                        {stats?.placements_this_month || 0}
                    </div>
                    <div className="text-sm text-base-content/60">This Month</div>
                </div>
            </div>

            <div className="mt-4 pt-4 border-t border-base-200">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-base-content/70">
                        <i className="fa-duotone fa-regular fa-shield-check"></i>
                        <span className="text-sm">All payments processed securely via Stripe</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <img src="/stripe-badge.svg" alt="Powered by Stripe" className="h-6" 
                             onError={(e) => { e.currentTarget.style.display = 'none'; }} />
                    </div>
                </div>
            </div>
        </ContentCard>
    );
}

interface PaymentMethodCardProps {
    hasPaymentMethod: boolean;
    lastFour?: string;
    brand?: string;
    onManage: () => void;
    processing?: boolean;
}

/**
 * PaymentMethodCard - Shows payment method info with management action
 */
export function PaymentMethodCard({ 
    hasPaymentMethod, 
    lastFour, 
    brand,
    onManage, 
    processing 
}: PaymentMethodCardProps) {
    return (
        <ContentCard
            title="Payment Method"
            icon="fa-credit-card"
            headerActions={
                <button
                    onClick={onManage}
                    disabled={processing}
                    className="btn btn-sm btn-ghost"
                >
                    {processing ? (
                        <span className="loading loading-spinner loading-xs"></span>
                    ) : (
                        <>
                            <i className="fa-duotone fa-regular fa-pen"></i>
                            {hasPaymentMethod ? 'Update' : 'Add'}
                        </>
                    )}
                </button>
            }
        >
            {hasPaymentMethod ? (
                <div className="flex items-center gap-4">
                    <div className="w-12 h-8 bg-base-200 rounded flex items-center justify-center">
                        <i className={`fa-brands fa-cc-${brand?.toLowerCase() || 'card'} text-2xl`}></i>
                    </div>
                    <div>
                        <div className="font-semibold capitalize">{brand || 'Card'} •••• {lastFour}</div>
                        <div className="text-sm text-base-content/60">Default payment method</div>
                    </div>
                </div>
            ) : (
                <div className="flex items-center gap-4 text-base-content/60">
                    <div className="w-12 h-8 bg-base-200 rounded flex items-center justify-center">
                        <i className="fa-duotone fa-regular fa-credit-card text-xl"></i>
                    </div>
                    <div>
                        <div className="font-medium">No payment method</div>
                        <div className="text-sm">Add a card to upgrade your plan</div>
                    </div>
                </div>
            )}
        </ContentCard>
    );
}
