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
            <div className="py-20 bg-base-100">
                <div className="container mx-auto px-4">
                    <div className="max-w-7xl mx-auto">
                        <div className="alert alert-error">
                            <i className="fa-duotone fa-regular fa-triangle-exclamation"></i>
                            <div>
                                <h3 className="font-bold">
                                    Unable to Load Pricing
                                </h3>
                                <div className="text-xs">{error}</div>
                            </div>
                        </div>

                        {/* Fallback content - basic pricing info */}
                        <div className="mt-8 text-center">
                            <p className="text-base-content/70 mb-4">
                                We're experiencing issues loading our current
                                pricing. Here's our standard pricing structure:
                            </p>
                            <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto text-sm">
                                <div className="card bg-base-200 shadow">
                                    <div className="card-body p-4">
                                        <h4 className="font-bold">Starter</h4>
                                        <div className="text-lg font-bold">
                                            Free
                                        </div>
                                        <p className="text-base-content/70 text-xs">
                                            Perfect for getting started
                                        </p>
                                    </div>
                                </div>
                                <div className="card bg-primary text-primary-content shadow">
                                    <div className="card-body p-4">
                                        <h4 className="font-bold">Pro</h4>
                                        <div className="text-lg font-bold">
                                            $99/month
                                        </div>
                                        <p className="opacity-80 text-xs">
                                            For serious recruiters
                                        </p>
                                    </div>
                                </div>
                                <div className="card bg-base-200 shadow">
                                    <div className="card-body p-4">
                                        <h4 className="font-bold">Partner</h4>
                                        <div className="text-lg font-bold">
                                            $249/month
                                        </div>
                                        <p className="text-base-content/70 text-xs">
                                            For firms and power users
                                        </p>
                                    </div>
                                </div>
                            </div>
                            <div className="mt-6">
                                <a href="/sign-up" className="btn btn-primary">
                                    Get Started
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="py-20 bg-base-100">
            <div className="container mx-auto px-4">
                <div className="max-w-7xl mx-auto">
                    {/* Billing Toggle */}
                    {showBillingToggle &&
                        plans.some(
                            (plan) =>
                                plan.price_annual &&
                                plan.price_annual !== plan.price_monthly * 12,
                        ) && (
                            <div className="text-center mb-12">
                                <div className="tabs tabs-box inline-flex">
                                    <button
                                        className={`tab ${!isAnnual ? "tab-active" : ""}`}
                                        onClick={() => setIsAnnual(false)}
                                    >
                                        Monthly
                                    </button>
                                    <button
                                        className={`tab ${isAnnual ? "tab-active" : ""}`}
                                        onClick={() => setIsAnnual(true)}
                                    >
                                        Annual
                                        {plans.some((plan) => {
                                            const monthlyTotal =
                                                plan.price_monthly * 12;
                                            return (
                                                plan.price_annual > 0 &&
                                                plan.price_annual < monthlyTotal
                                            );
                                        }) && (
                                            <span className="badge badge-success badge-sm ml-2">
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

                    {/* Global Disclaimer */}
                    {!loading && plans.length > 0 && (
                        <div className="text-center mt-12 text-base-content/60 text-sm max-w-3xl mx-auto">
                            <p>
                                Splits Network does not guarantee placements,
                                income, or role availability. All payouts are
                                finalized at hire time based on participation,
                                role, and subscription tier.
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
