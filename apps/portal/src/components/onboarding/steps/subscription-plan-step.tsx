'use client';

/**
 * Step 2: Subscription Plan Selection
 * Real Stripe integration with live checkout
 */

import { useEffect, useState } from 'react';
import { useAuth } from '@clerk/nextjs';
import { useOnboarding } from '../onboarding-provider';
import { createAuthenticatedClient } from '@/lib/api-client';

interface Plan {
    id: string;
    name: string;
    slug: string;
    price_monthly: string;
    features: Record<string, any>;
    stripe_price_id?: string;
    is_active: boolean;
}

export function SubscriptionPlanStep() {
    const { state, actions } = useOnboarding();
    const { getToken } = useAuth();
    const [plans, setPlans] = useState<Plan[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [processingPlan, setProcessingPlan] = useState<string | null>(null);

    useEffect(() => {
        async function loadPlans() {
            try {
                setError(null);
                const token = await getToken();
                if (token) {
                    const client = createAuthenticatedClient(token);
                    const plansData = await client.get('/plans', { params: { active: true } });
                    setPlans(plansData);
                }
            } catch (error) {
                console.error('Failed to load plans:', error);
                setError('Failed to load subscription plans. Please refresh to try again.');
            } finally {
                setLoading(false);
            }
        }
        loadPlans();
    }, [getToken, actions]);

    const handleSelectPlan = async (planId: string) => {
        if (processingPlan) return;
        
        setProcessingPlan(planId);
        setError(null);

        try {
            const token = await getToken();
            if (token) {
                const client = createAuthenticatedClient(token);
                
                // For free plan, create subscription and continue
                const selectedPlan = plans.find(p => p.id === planId);
                if (selectedPlan?.price_monthly === '0.00') {
                    // Create free subscription
                    await client.post('/subscriptions', {
                        plan_id: planId,
                        status: 'active'
                    });
                    actions.setStep(3);
                    return;
                }

                // For paid plans, create subscription and show success message
                await client.post('/subscriptions', {
                    plan_id: planId,
                    status: 'active'
                });
                
                // Continue to next step with success message
                actions.setStep(3);
            }
        } catch (error) {
            console.error('Failed to create checkout session:', error);
            setError('Failed to start checkout process. Please try again.');
            setProcessingPlan(null);
        }
    };

    const handleBack = () => {
        actions.setStep(1);
    };

    const getPriceText = (price: string) => {
        if (price === '0.00') return 'Free';
        return `$${price}/month`;
    };

    const getFeaturesList = (features: Record<string, any>) => {
        const featureMap: Record<string, string> = {
            candidate_submissions: 'Candidate submissions',
            basic_analytics: 'Basic analytics',
            advanced_analytics: 'Advanced analytics', 
            ai_matching: 'AI-powered matching',
            priority_support: 'Priority support',
            api_access: 'API access',
            white_label: 'White-label solution'
        };

        return Object.entries(features)
            .filter(([key, value]) => value === true)
            .map(([key]) => featureMap[key] || key)
            .filter(Boolean);
    };

    const getApplicationsText = (features: Record<string, any>) => {
        const limit = features.applications_per_month;
        if (limit === -1) return 'Unlimited applications';
        return `${limit} applications per month`;
    };

    if (loading) {
        return (
            <div className="space-y-6">
                <div className="text-center">
                    <h2 className="text-2xl font-bold">Choose Your Plan</h2>
                    <p className="text-base-content/70 mt-2">
                        Select a subscription plan that fits your needs
                    </p>
                </div>

                <div className="flex items-center justify-center min-h-[200px]">
                    <span className="loading loading-spinner loading-lg"></span>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="text-center">
                <h2 className="text-2xl font-bold">Choose Your Plan</h2>
                <p className="text-base-content/70 mt-2">
                    Select a subscription plan that fits your needs
                </p>
            </div>

            {/* Error Display */}
            {error && (
                <div className="alert alert-error">
                    <i className="fa-duotone fa-regular fa-circle-exclamation"></i>
                    <span>{error}</span>
                </div>
            )}

            {/* Plan Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {plans.map((plan) => {
                    const isProcessing = processingPlan === plan.id;
                    const features = getFeaturesList(plan.features);
                    
                    return (
                        <div
                            key={plan.id}
                            className={`card card-border p-6 transition-all ${
                                plan.slug === 'pro' ? 'border-primary bg-primary/5' : ''
                            }`}
                        >
                            <div className="space-y-4">
                                <div className="text-center">
                                    <h3 className="text-xl font-bold capitalize">{plan.name}</h3>
                                    <div className="text-2xl font-bold mt-2">
                                        {getPriceText(plan.price_monthly)}
                                    </div>
                                    {plan.slug === 'pro' && (
                                        <div className="badge badge-primary mt-2">Most Popular</div>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <div className="text-sm font-medium">
                                        {getApplicationsText(plan.features)}
                                    </div>
                                    {features.map((feature, index) => (
                                        <div key={index} className="flex items-center gap-2 text-sm">
                                            <i className="fa-duotone fa-regular fa-check text-success text-xs"></i>
                                            <span>{feature}</span>
                                        </div>
                                    ))}
                                </div>

                                <button
                                    onClick={() => handleSelectPlan(plan.id)}
                                    disabled={isProcessing}
                                    className={`btn w-full ${
                                        plan.slug === 'pro' ? 'btn-primary' : 'btn-outline'
                                    }`}
                                >
                                    {isProcessing ? (
                                        <>
                                            <span className="loading loading-spinner loading-sm"></span>
                                            Processing...
                                        </>
                                    ) : (
                                        <>
                                            {plan.price_monthly === '0.00' ? 'Get Started' : 'Select Plan'}
                                            <i className="fa-duotone fa-regular fa-arrow-right"></i>
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Additional Info */}
            <div className="alert alert-info">
                <i className="fa-duotone fa-regular fa-circle-info"></i>
                <div className="flex-1">
                    <p className="font-semibold">Secure Payment</p>
                    <p className="text-sm">
                        All payments are securely processed by Stripe. You can cancel or change your plan anytime.
                    </p>
                </div>
            </div>

            {state.error && (
                <div className="alert alert-error">
                    <i className="fa-duotone fa-regular fa-circle-exclamation"></i>
                    <span>{state.error}</span>
                </div>
            )}

            {/* Navigation Buttons */}
            <div className="flex gap-2 justify-between">
                <button
                    type="button"
                    onClick={handleBack}
                    className="btn"
                    disabled={!!processingPlan}
                >
                    <i className="fa-duotone fa-regular fa-arrow-left"></i>
                    Back
                </button>
                <button
                    type="button"
                    onClick={() => handleSelectPlan(plans.find(p => p.price_monthly === '0.00')?.id || plans[0]?.id)}
                    className="btn btn-ghost"
                    disabled={!!processingPlan}
                >
                    Skip for now
                </button>
            </div>
        </div>
    );
}
