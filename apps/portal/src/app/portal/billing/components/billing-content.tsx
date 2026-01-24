'use client';

import { useEffect, useState, useCallback } from 'react';
import { useAuth } from '@clerk/nextjs';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { createAuthenticatedClient } from '@/lib/api-client';
import { useUserProfile } from '@/contexts';

// Components
import { 
    BillingStatsSection, 
    SubscriptionCard, 
    EarningsOverviewCard,
    PaymentMethodCard 
} from './billing-stats';
import { BillingHistorySection } from './payouts-list';
import { PlanCard, PlanCardGrid, CommissionComparisonTable } from './plan-card';

// Types
import type { Plan, Subscription, Payout, BillingStats } from '../types';

interface Invoice {
    id: string;
    number: string;
    amount_due: number;
    amount_paid: number;
    status: 'draft' | 'open' | 'paid' | 'uncollectible' | 'void';
    due_date?: string;
    paid_at?: string;
    created_at: string;
    invoice_pdf?: string;
    hosted_invoice_url?: string;
}

export default function BillingContent() {
    const { getToken } = useAuth();
    const { profile } = useUserProfile();
    const router = useRouter();
    const searchParams = useSearchParams();
    
    // State
    const [subscription, setSubscription] = useState<Subscription | null>(null);
    const [plans, setPlans] = useState<Plan[]>([]);
    const [payouts, setPayouts] = useState<Payout[]>([]);
    const [invoices, setInvoices] = useState<Invoice[]>([]);
    const [stats, setStats] = useState<BillingStats | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [processing, setProcessing] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);

    // Check URL params for success messages
    useEffect(() => {
        const success = searchParams.get('success');
        if (success) {
            switch (success) {
                case 'upgrade':
                    setSuccessMessage('🎉 Congratulations! Your subscription has been upgraded.');
                    break;
                case 'downgrade':
                    setSuccessMessage('Your plan has been changed successfully.');
                    break;
                case 'free':
                    setSuccessMessage('Welcome! You\'re now on the free plan.');
                    break;
            }
            // Clear params after showing message
            router.replace('/portal/billing', { scroll: false });
        }
    }, [searchParams, router]);

    // Load billing data
    const loadBillingData = useCallback(async () => {
        try {
            const token = await getToken();
            if (!token) {
                setError('Authentication required');
                return;
            }

            setLoading(true);
            setError(null);

            const client = createAuthenticatedClient(token);

            // Load all data in parallel
            const [subscriptionRes, plansRes, payoutsRes, statsRes] = await Promise.all([
                client.get('/subscriptions/me').catch((err) => {
                    console.warn('No subscription found:', err);
                    return { data: null };
                }),
                client.get('/plans', { params: { active: true } }).catch((err) => {
                    console.error('Failed to load plans:', err);
                    throw new Error('Failed to load subscription plans');
                }),
                client.get('/payouts', { params: { limit: 10 } }).catch(() => ({ data: [] })),
                client.get('/stats', { params: { scope: 'recruiter', range: 'ytd' } }).catch(() => ({ data: null })),
            ]);

            setSubscription(subscriptionRes.data);
            setPlans(plansRes.data || []);
            setPayouts(payoutsRes.data || []);
            setStats(statsRes.data?.metrics || statsRes.data || null);

        } catch (err) {
            console.error('Error loading billing data:', err);
            setError(err instanceof Error ? err.message : 'Failed to load billing information');
        } finally {
            setLoading(false);
        }
    }, [getToken]);

    useEffect(() => {
        loadBillingData();
    }, [loadBillingData]);

    // Handle Stripe checkout for plan upgrade/change
    const handlePlanSelect = async (planId: string) => {
        try {
            setProcessing(planId);
            setError(null);

            const selectedPlan = plans.find(p => p.id === planId);
            if (!selectedPlan) {
                throw new Error('Plan not found');
            }

            // Check if selecting current plan
            if (subscription?.plan_id === planId) {
                setError('You are already on this plan');
                return;
            }

            const token = await getToken();
            if (!token) throw new Error('Authentication required');

            const client = createAuthenticatedClient(token);

            // For free plan, handle differently
            if (selectedPlan.price_cents === 0) {
                // Downgrade to free via direct update
                if (subscription?.id && !subscription.is_virtual) {
                    await client.patch(`/subscriptions/${subscription.id}`, {
                        plan_id: planId,
                        status: 'active'
                    });
                    router.push('/portal/billing?success=downgrade');
                } else {
                    // Create free subscription
                    await client.post('/subscriptions', {
                        plan_id: planId,
                        status: 'active'
                    });
                    router.push('/portal/billing?success=free');
                }
                return;
            }

            // For paid plans, use Stripe Checkout
            const checkoutResponse = await client.post('/subscriptions/checkout-session', {
                plan_id: planId,
                success_url: `${window.location.origin}/portal/billing?success=upgrade`,
                cancel_url: `${window.location.origin}/portal/billing`,
            });

            // Redirect to Stripe Checkout
            if (checkoutResponse.data?.checkout_url) {
                window.location.href = checkoutResponse.data.checkout_url;
            } else {
                throw new Error('Failed to create checkout session');
            }

        } catch (err) {
            console.error('Error processing plan selection:', err);
            setError(err instanceof Error ? err.message : 'Failed to process your request');
        } finally {
            setProcessing(null);
        }
    };

    // Handle Stripe Customer Portal for managing subscription
    const handleManageBilling = async () => {
        try {
            setProcessing('portal');
            setError(null);

            const token = await getToken();
            if (!token) throw new Error('Authentication required');

            const client = createAuthenticatedClient(token);

            const portalResponse = await client.post('/subscriptions/portal-session', {
                return_url: `${window.location.origin}/portal/billing`,
            });

            if (portalResponse.data?.portal_url) {
                window.location.href = portalResponse.data.portal_url;
            } else {
                throw new Error('Failed to create billing portal session');
            }

        } catch (err) {
            console.error('Error opening billing portal:', err);
            setError(err instanceof Error ? err.message : 'Failed to open billing portal');
        } finally {
            setProcessing(null);
        }
    };

    // Loading state
    if (loading) {
        return (
            <div className="space-y-6 animate-fade-in">
                <BillingStatsSection subscription={null} stats={null} loading />
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="h-64 skeleton rounded-box"></div>
                    <div className="h-64 skeleton rounded-box"></div>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-fade-in">
            {/* Success Message */}
            {successMessage && (
                <div className="alert alert-success">
                    <i className="fa-duotone fa-regular fa-check-circle"></i>
                    <span>{successMessage}</span>
                    <button 
                        className="btn btn-sm btn-ghost"
                        onClick={() => setSuccessMessage(null)}
                    >
                        <i className="fa-duotone fa-regular fa-times"></i>
                    </button>
                </div>
            )}

            {/* Error Message */}
            {error && (
                <div className="alert alert-error">
                    <i className="fa-duotone fa-regular fa-circle-exclamation"></i>
                    <span>{error}</span>
                    <button 
                        className="btn btn-sm btn-ghost"
                        onClick={() => setError(null)}
                    >
                        Dismiss
                    </button>
                </div>
            )}

            {/* Key Stats */}
            <BillingStatsSection subscription={subscription} stats={stats} />

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left Column - Subscription & Earnings */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Current Subscription */}
                    <SubscriptionCard
                        subscription={subscription}
                        onManage={handleManageBilling}
                        onChangePlan={() => router.push('/portal/billing/plans')}
                        processing={processing === 'portal'}
                    />

                    {/* Earnings Overview */}
                    <EarningsOverviewCard stats={stats} />

                    {/* Commission Comparison - Encourage upgrades */}
                    {subscription?.plan?.slug !== 'partner' && (
                        <CommissionComparisonTable />
                    )}
                </div>

                {/* Right Column - Billing History */}
                <div className="space-y-6">
                    {/* Quick Plan Cards */}
                    <div className="card bg-base-100 shadow-sm border border-base-200">
                        <div className="card-body">
                            <h3 className="font-bold flex items-center gap-2">
                                <i className="fa-duotone fa-regular fa-sparkles text-primary"></i>
                                Quick Upgrade
                            </h3>
                            <div className="space-y-3 mt-2">
                                {plans
                                    .filter(p => p.id !== subscription?.plan_id && p.slug !== 'free')
                                    .slice(0, 2)
                                    .map(plan => (
                                        <button
                                            key={plan.id}
                                            onClick={() => handlePlanSelect(plan.id)}
                                            disabled={!!processing}
                                            className="w-full text-left p-3 rounded-lg border border-base-200 hover:border-primary hover:bg-primary/5 transition-colors"
                                        >
                                            <div className="flex justify-between items-center">
                                                <div>
                                                    <div className="font-semibold">{plan.name}</div>
                                                    <div className="text-sm text-base-content/60">
                                                        ${(plan.price_cents / 100).toFixed(0)}/mo
                                                    </div>
                                                </div>
                                                {processing === plan.id ? (
                                                    <span className="loading loading-spinner loading-sm"></span>
                                                ) : (
                                                    <i className="fa-duotone fa-regular fa-arrow-right text-primary"></i>
                                                )}
                                            </div>
                                        </button>
                                    ))}
                            </div>
                            <Link 
                                href="/portal/billing/plans" 
                                className="btn btn-outline btn-sm mt-2"
                            >
                                Compare All Plans
                            </Link>
                        </div>
                    </div>

                    {/* Billing History */}
                    <BillingHistorySection
                        payouts={payouts}
                        invoices={invoices}
                        onManageBilling={handleManageBilling}
                    />
                </div>
            </div>

            {/* Help Section */}
            <div className="card bg-base-200">
                <div className="card-body">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-xl bg-info/10 flex items-center justify-center">
                                <i className="fa-duotone fa-regular fa-headset text-info text-xl"></i>
                            </div>
                            <div>
                                <h4 className="font-semibold">Need help with billing?</h4>
                                <p className="text-sm text-base-content/60">
                                    Our support team is here to help with any billing questions.
                                </p>
                            </div>
                        </div>
                        <div className="flex gap-2">
                            <a 
                                href="mailto:support@splits.network" 
                                className="btn btn-outline btn-sm"
                            >
                                <i className="fa-duotone fa-regular fa-envelope"></i>
                                Contact Support
                            </a>
                            <button 
                                onClick={handleManageBilling}
                                disabled={processing === 'portal' || !subscription?.stripe_subscription_id}
                                className="btn btn-ghost btn-sm"
                            >
                                {processing === 'portal' ? (
                                    <span className="loading loading-spinner loading-xs"></span>
                                ) : (
                                    <i className="fa-duotone fa-regular fa-external-link"></i>
                                )}
                                Stripe Portal
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
