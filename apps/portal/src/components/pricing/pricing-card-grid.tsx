"use client";

/**
 * PricingCardGrid Component
 * Grid layout wrapper for pricing cards
 */

import { PricingCard } from "./pricing-card";
import { PricingCardGridProps, Plan } from "./types";

export function PricingCardGrid({
    plans,
    selectedPlanId,
    onSelectPlan,
    isAnnual = false,
    variant = "default",
    loading = false,
}: PricingCardGridProps) {
    const isCompact = variant === "compact";

    if (loading) {
        return (
            <div
                className={`grid ${isCompact ? "grid-cols-1 md:grid-cols-3 gap-3" : "md:grid-cols-3 gap-6"}`}
            >
                {[1, 2, 3].map((i) => (
                    <div key={i} className="card bg-base-200 shadow">
                        <div className={`card-body ${isCompact ? "p-4" : ""}`}>
                            <div className="skeleton h-6 w-24 mb-4"></div>
                            <div className="skeleton h-10 w-32 mb-2"></div>
                            <div className="skeleton h-4 w-full mb-4"></div>
                            <div className="divider my-2"></div>
                            <div className="space-y-2">
                                <div className="skeleton h-4 w-full"></div>
                                <div className="skeleton h-4 w-full"></div>
                                <div className="skeleton h-4 w-3/4"></div>
                                <div className="skeleton h-4 w-full"></div>
                                <div className="skeleton h-4 w-full"></div>
                                <div className="skeleton h-4 w-3/4"></div>
                                <div className="skeleton h-4 w-full"></div>
                                <div className="skeleton h-4 w-full"></div>
                                <div className="skeleton h-4 w-3/4"></div>
                            </div>
                            <div className="h-20 w-full mt-4"></div>
                            <div className="skeleton h-10 w-full mt-4"></div>
                        </div>
                    </div>
                ))}
            </div>
        );
    }

    if (plans.length === 0) {
        return (
            <div className="alert alert-warning">
                <i className="fa-duotone fa-regular fa-triangle-exclamation"></i>
                <span>No pricing plans available at this time.</span>
            </div>
        );
    }

    return (
        <div
            className={`grid ${isCompact ? "grid-cols-1 md:grid-cols-3 gap-3" : "md:grid-cols-3 gap-6"}`}
        >
            {plans
                .sort((a, b) => a.price_monthly - b.price_monthly)
                .map((plan) => (
                    <PricingCard
                        key={plan.id}
                        plan={plan}
                        isSelected={selectedPlanId === plan.id}
                        onSelect={onSelectPlan}
                        isAnnual={isAnnual}
                        variant={variant}
                    />
                ))}
        </div>
    );
}
