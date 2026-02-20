"use client";

import { useState, useEffect } from "react";
import { BaselPricingCardGrid } from "./basel-pricing-card-grid";
import { BaselBillingToggle } from "./basel-billing-toggle";
import type { Plan } from "@/components/pricing/types";

interface BaselDynamicPricingSectionProps {
    showBillingToggle?: boolean;
    defaultAnnual?: boolean;
    selectable?: boolean;
    onPlanSelect?: (plan: Plan) => void;
    selectedPlanId?: string | null;
}

export function BaselDynamicPricingSection({
    showBillingToggle = true,
    defaultAnnual = false,
    selectable = false,
    onPlanSelect,
    selectedPlanId,
}: BaselDynamicPricingSectionProps) {
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

                const response = await fetch(
                    "/api/v2/plans?status=active&limit=50",
                    {
                        method: "GET",
                        headers: {
                            "Content-Type": "application/json",
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
                setPlans([]);
            } finally {
                setLoading(false);
            }
        };

        fetchPlans();
    }, []);

    // Determine if annual pricing differs from monthly*12
    const hasAnnualSavings = plans.some(
        (plan) =>
            plan.price_annual &&
            plan.price_annual !== plan.price_monthly * 12,
    );

    const showSavingsBadge = plans.some((plan) => {
        const monthlyTotal = plan.price_monthly * 12;
        return plan.price_annual > 0 && plan.price_annual < monthlyTotal;
    });

    // Error state
    if (error && !loading && plans.length === 0) {
        return (
            <div className="text-center">
                <div className="p-6 border border-error/30 bg-error/10">
                    <i className="fa-duotone fa-regular fa-triangle-exclamation text-error text-3xl mb-3" />
                    <h3 className="font-black uppercase tracking-wider mb-2 text-base-content">
                        Unable to Load Pricing
                    </h3>
                    <div className="text-xs text-error">{error}</div>
                </div>
            </div>
        );
    }

    return (
        <div>
            {/* Billing Toggle */}
            {showBillingToggle && hasAnnualSavings && (
                <div className="text-center mb-12">
                    <BaselBillingToggle
                        isAnnual={isAnnual}
                        onToggle={setIsAnnual}
                        showSavingsBadge={showSavingsBadge}
                    />
                </div>
            )}

            {/* Pricing Cards */}
            <BaselPricingCardGrid
                plans={plans}
                selectedPlanId={selectedPlanId}
                onSelectPlan={selectable ? onPlanSelect : undefined}
                isAnnual={isAnnual}
                loading={loading}
            />
        </div>
    );
}
