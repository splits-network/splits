"use client";

/**
 * Dynamic Pricing Section Component
 * Fetches pricing plans from the database and displays them using PricingCardGrid
 * Used on public pricing page to show live pricing data
 */

import { useState, useEffect } from "react";
import { PricingCardGrid } from "./pricing-card-grid";
import type { Plan } from "./types";

interface DynamicPricingSectionProps {
    /** Whether to show billing toggle (monthly/annual) */
    showBillingToggle?: boolean;
    /** Initial billing period */
    defaultAnnual?: boolean;
    /** Variant for card display */
    variant?: "default" | "compact";
    /** Whether this is for selection (adds select handlers) */
    selectable?: boolean;
    /** Callback when a plan is selected (only used if selectable=true) */
    onPlanSelect?: (plan: Plan) => void;
    /** Currently selected plan ID */
    selectedPlanId?: string | null;
}

export function DynamicPricingSection({
    showBillingToggle = true,
    defaultAnnual = false,
    variant = "default",
    selectable = false,
    onPlanSelect,
    selectedPlanId,
}: DynamicPricingSectionProps) {
    // State management
    const [plans, setPlans] = useState<Plan[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isAnnual, setIsAnnual] = useState(defaultAnnual);

    // Fetch plans from API
    useEffect(() => {
        const fetchPlans = async () => {
            try {
                setLoading(true);
                setError(null);

                // Make direct public request without any auth token
                const response = await fetch(
                    "/api/v2/plans?status=active&limit=50",
                    {
                        method: "GET",
                        headers: {
                            "Content-Type": "application/json",
                            // No Authorization header - this is a public endpoint
                        },
                    },
                );

                if (!response.ok) {
                    throw new Error(
                        `Failed to fetch plans: ${response.status} ${response.statusText}`,
                    );
                }

                const result = await response.json();

                if (result?.data) {
                    // Filter to only active plans and sort by price
                    const activePlans = (result.data || [])
                        .filter((plan: Plan) => plan.is_active !== false)
                        .sort(
                            (a: Plan, b: Plan) =>
                                (a.price_monthly || 0) - (b.price_monthly || 0),
                        );

                    setPlans(activePlans);
                } else {
                    throw new Error("No plans data received");
                }
            } catch (err: any) {
                console.error("Failed to fetch plans:", err);
                setError(err.message || "Failed to load pricing plans");

                // Fallback to empty array to prevent crashes
                setPlans([]);
            } finally {
                setLoading(false);
            }
        };

        fetchPlans();
    }, []);

    // Error state
    if (error && !loading && plans.length === 0) {
        return (
            <div className="text-center">
                <div className="p-6 border-4 border-coral bg-cream/50 mb-8">
                    <i className="fa-duotone fa-regular fa-triangle-exclamation text-coral text-3xl mb-3"></i>
                    <h3 className="font-black uppercase tracking-wider mb-2 text-dark">
                        Unable to Load Pricing
                    </h3>
                    <div className="text-xs text-dark/70">{error}</div>
                </div>

                {/* Fallback content - basic pricing info */}
                <p className="text-dark/70 mb-8">
                    We're experiencing issues loading our current pricing. Here's our standard pricing structure:
                </p>
                <div className="grid md:grid-cols-3 gap-6 mb-8">
                    <div className="p-6 border-4 border-teal bg-white">
                        <div className="absolute top-0 right-0 w-10 h-10 bg-teal" />
                        <h4 className="font-black uppercase tracking-wider mb-2 text-dark">Starter</h4>
                        <div className="text-2xl font-black mb-2 text-dark">Free</div>
                        <p className="text-dark/70 text-sm">Perfect for getting started</p>
                    </div>
                    <div className="p-6 border-4 border-coral bg-dark">
                        <div className="absolute top-0 right-0 w-10 h-10 bg-coral" />
                        <h4 className="font-black uppercase tracking-wider mb-2 text-cream">Pro</h4>
                        <div className="text-2xl font-black mb-2 text-cream">$99/month</div>
                        <p className="text-cream/70 text-sm">For serious recruiters</p>
                    </div>
                    <div className="p-6 border-4 border-purple bg-white">
                        <div className="absolute top-0 right-0 w-10 h-10 bg-purple" />
                        <h4 className="font-black uppercase tracking-wider mb-2 text-dark">Partner</h4>
                        <div className="text-2xl font-black mb-2 text-dark">$249/month</div>
                        <p className="text-dark/70 text-sm">For firms and power users</p>
                    </div>
                </div>
                <a href="/sign-up" className="inline-block px-8 py-4 font-bold uppercase tracking-wider border-4 border-coral bg-coral text-cream transition-transform hover:-translate-y-1">
                    Get Started
                </a>
            </div>
        );
    }

    return (
        <div>
            {/* Billing Toggle */}
            {showBillingToggle &&
                plans.some(
                    (plan) =>
                        plan.price_annual &&
                        plan.price_annual !== plan.price_monthly * 12,
                ) && (
                    <div className="text-center mb-12">
                        <div className="inline-flex border-4 border-dark">
                            <button
                                className={`px-6 py-3 font-bold uppercase tracking-wider text-sm transition-colors ${!isAnnual ? "bg-dark text-cream" : "bg-white text-dark"}`}
                                onClick={() => setIsAnnual(false)}
                            >
                                Monthly
                            </button>
                            <button
                                className={`px-6 py-3 font-bold uppercase tracking-wider text-sm transition-colors ${isAnnual ? "bg-dark text-cream" : "bg-white text-dark"}`}
                                onClick={() => setIsAnnual(true)}
                            >
                                Annual
                                {plans.some((plan) => {
                                    const monthlyTotal = plan.price_monthly * 12;
                                    return (
                                        plan.price_annual > 0 &&
                                        plan.price_annual < monthlyTotal
                                    );
                                }) && (
                                    <span className="ml-2 px-2 py-0.5 text-xs font-black bg-yellow text-dark">
                                        Save 20%
                                    </span>
                                )}
                            </button>
                        </div>
                    </div>
                )}

            {/* Pricing Cards */}
            <PricingCardGrid
                plans={plans}
                selectedPlanId={selectedPlanId}
                onSelectPlan={selectable ? onPlanSelect : undefined}
                isAnnual={isAnnual}
                variant={variant}
                loading={loading}
            />
        </div>
    );
}
