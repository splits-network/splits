'use client';

import { useEffect, useState, useCallback } from 'react';
import { useAuth } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createAuthenticatedClient } from '@/lib/api-client';
import { PlanCard, PlanCardGrid, CommissionComparisonTable } from '../../components/plan-card';
import type { Plan, Subscription } from '../../types';

export default function PlansContent() {
    const { getToken } = useAuth();
    const router = useRouter();
    
    const [plans, setPlans] = useState<Plan[]>([]);
    const [subscription, setSubscription] = useState<Subscription | null>(null);
    const [loading, setLoading] = useState(true);
    const [processing, setProcessing] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    const loadData = useCallback(async () => {
        try {
            const token = await getToken();
            if (!token) {
                setError('Authentication required');
                return;
            }

            const client = createAuthenticatedClient(token);
            
            const [plansRes, subRes] = await Promise.all([
                client.get('/plans', { params: { active: true } }),
                client.get('/subscriptions/me').catch(() => ({ data: null })),
            ]);

            setPlans(plansRes.data || []);
            setSubscription(subRes.data);
        } catch (err) {
            console.error('Failed to load plans:', err);
            setError('Failed to load plans. Please refresh to try again.');
        } finally {
            setLoading(false);
        }
    }, [getToken]);

    useEffect(() => {
        loadData();
    }, [loadData]);

    const handleSelectPlan = async (planId: string) => {
        if (processing) return;

        // Check if selecting current plan
        if (subscription?.plan_id === planId) {
            setError('You are already on this plan.');
            return;
        }

        setProcessing(planId);
        setError(null);

        try {
            const token = await getToken();
            if (!token) throw new Error('Authentication required');

            const client = createAuthenticatedClient(token);
            const selectedPlan = plans.find(p => p.id === planId);

            if (!selectedPlan) {
                throw new Error('Plan not found');
            }

            // Handle free plan (downgrade)
            if (selectedPlan.price_cents === 0) {
                if (subscription?.id && !subscription.is_virtual) {
                    // Downgrade existing subscription
                    await client.patch(`/subscriptions/${subscription.id}`, {
                        plan_id: planId,
                        status: 'active'
                    });
                } else {
                    // Create new free subscription
                    await client.post('/subscriptions', {
                        plan_id: planId,
                        status: 'active'
                    });
                }
                router.push('/portal/billing?success=downgrade');
                return;
            }

            // For paid plans, redirect to Stripe Checkout
            const checkoutResponse = await client.post('/subscriptions/checkout-session', {
                plan_id: planId,
                success_url: `${window.location.origin}/portal/billing?success=upgrade`,
                cancel_url: `${window.location.origin}/portal/billing/plans`,
            });

            if (checkoutResponse.data?.checkout_url) {
                window.location.href = checkoutResponse.data.checkout_url;
            } else {
                throw new Error('Failed to create checkout session');
            }

        } catch (err) {
            console.error('Failed to process plan selection:', err);
            setError(err instanceof Error ? err.message : 'Failed to process your request. Please try again.');
        } finally {
            setProcessing(null);
        }
    };

    if (loading) {
        return (
            <div className="container mx-auto py-6 px-4">
                <div className="flex items-center justify-center min-h-[400px]">
                    <span className="loading loading-spinner loading-lg"></span>
                </div>
            </div>
        );
    }

    // Sort plans: free, pro, partner
    const sortedPlans = [...plans].sort((a, b) => {
        const order = { free: 0, pro: 1, partner: 2 };
        return (order[a.slug as keyof typeof order] ?? 99) - (order[b.slug as keyof typeof order] ?? 99);
    });

    return (
        <div className="container mx-auto py-6 px-4 max-w-7xl">
            {/* Header */}
            <div className="text-center mb-10">
                <h1 className="text-4xl font-bold mb-4">Choose Your Plan</h1>
                <p className="text-lg text-base-content/70 max-w-2xl mx-auto">
                    Upgrade your subscription to earn higher commission rates on every placement.
                    The higher your tier, the more you keep.
                </p>
                {subscription && (
                    <div className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-base-200 rounded-full">
                        <i className="fa-duotone fa-regular fa-check-circle text-success"></i>
                        <span className="text-sm">
                            Currently on: <span className="font-semibold">{subscription.plan?.name || 'Free'}</span>
                        </span>
                    </div>
                )}
            </div>

            {/* Error Alert */}
            {error && (
                <div className="alert alert-error mb-6 max-w-4xl mx-auto">
                    <i className="fa-duotone fa-regular fa-circle-exclamation"></i>
                    <span>{error}</span>
                    <button className="btn btn-sm btn-ghost" onClick={() => setError(null)}>
                        <i className="fa-duotone fa-regular fa-times"></i>
                    </button>
                </div>
            )}

            {/* Plan Cards */}
            <div className="mb-12">
                <PlanCardGrid>
                    {sortedPlans.map(plan => (
                        <PlanCard
                            key={plan.id}
                            plan={plan}
                            currentPlanId={subscription?.plan_id}
                            onSelect={handleSelectPlan}
                            processing={processing === plan.id}
                            showCommissionComparison
                        />
                    ))}
                </PlanCardGrid>
            </div>

            {/* Commission Comparison Table */}
            <div className="max-w-5xl mx-auto mb-12">
                <CommissionComparisonTable />
            </div>

            {/* Trust Badges */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto mb-12">
                <div className="card bg-base-100 border border-base-200">
                    <div className="card-body items-center text-center py-6">
                        <div className="w-12 h-12 rounded-xl bg-success/10 flex items-center justify-center mb-2">
                            <i className="fa-duotone fa-regular fa-shield-check text-success text-xl"></i>
                        </div>
                        <h3 className="font-semibold">Secure Payments</h3>
                        <p className="text-sm text-base-content/60">
                            All transactions processed via Stripe with bank-level security.
                        </p>
                    </div>
                </div>
                <div className="card bg-base-100 border border-base-200">
                    <div className="card-body items-center text-center py-6">
                        <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-2">
                            <i className="fa-duotone fa-regular fa-calendar-xmark text-primary text-xl"></i>
                        </div>
                        <h3 className="font-semibold">Cancel Anytime</h3>
                        <p className="text-sm text-base-content/60">
                            No long-term contracts. Downgrade or cancel whenever you want.
                        </p>
                    </div>
                </div>
                <div className="card bg-base-100 border border-base-200">
                    <div className="card-body items-center text-center py-6">
                        <div className="w-12 h-12 rounded-xl bg-info/10 flex items-center justify-center mb-2">
                            <i className="fa-duotone fa-regular fa-headset text-info text-xl"></i>
                        </div>
                        <h3 className="font-semibold">Priority Support</h3>
                        <p className="text-sm text-base-content/60">
                            Pro and Partner plans include dedicated support channels.
                        </p>
                    </div>
                </div>
            </div>

            {/* FAQ Snippet */}
            <div className="max-w-3xl mx-auto mb-8">
                <h2 className="text-2xl font-bold text-center mb-6">Frequently Asked Questions</h2>
                <div className="space-y-4">
                    <div className="collapse collapse-arrow bg-base-100 border border-base-200">
                        <input type="radio" name="faq" defaultChecked />
                        <div className="collapse-title font-semibold">
                            When does my new commission rate take effect?
                        </div>
                        <div className="collapse-content text-base-content/70">
                            <p>
                                Commission rates are snapshotted at the time of hire. This means you need to be on 
                                your upgraded plan when a placement is marked as hired to receive the higher rate. 
                                Upgrade before your next expected hire to maximize your earnings!
                            </p>
                        </div>
                    </div>
                    <div className="collapse collapse-arrow bg-base-100 border border-base-200">
                        <input type="radio" name="faq" />
                        <div className="collapse-title font-semibold">
                            What happens if I downgrade my plan?
                        </div>
                        <div className="collapse-content text-base-content/70">
                            <p>
                                If you downgrade, your current billing period remains active until renewal. 
                                New placements after downgrade will use the lower commission rates. 
                                Placements made before downgrade keep their original rates.
                            </p>
                        </div>
                    </div>
                    <div className="collapse collapse-arrow bg-base-100 border border-base-200">
                        <input type="radio" name="faq" />
                        <div className="collapse-title font-semibold">
                            Can I get a refund if I change my mind?
                        </div>
                        <div className="collapse-content text-base-content/70">
                            <p>
                                We offer a 14-day money-back guarantee for new paid subscriptions. 
                                Contact our support team if you'd like to request a refund within this period.
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Back to Billing */}
            <div className="text-center">
                <Link href="/portal/billing" className="btn btn-ghost">
                    <i className="fa-duotone fa-regular fa-arrow-left"></i>
                    Back to Billing
                </Link>
            </div>
        </div>
    );
}
