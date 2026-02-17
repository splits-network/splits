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
            <div className="grid md:grid-cols-3 gap-8">
                {[1, 2, 3].map((i) => (
                    <div key={i} className="relative p-8 border-4 border-dark/20 bg-white">
                        <div className="absolute top-0 right-0 w-10 h-10 bg-dark/20" />
                        <div className="h-6 w-24 mb-4 bg-dark/10"></div>
                        <div className="h-10 w-32 mb-2 bg-dark/10"></div>
                        <div className="h-4 w-full mb-4 bg-dark/10"></div>
                        <div className="w-full h-1 my-6 bg-dark/10" />
                        <div className="space-y-3">
                            <div className="h-4 w-full bg-dark/10"></div>
                            <div className="h-4 w-full bg-dark/10"></div>
                            <div className="h-4 w-3/4 bg-dark/10"></div>
                            <div className="h-4 w-full bg-dark/10"></div>
                            <div className="h-4 w-full bg-dark/10"></div>
                        </div>
                        <div className="h-10 w-full mt-8 bg-dark/10"></div>
                    </div>
                ))}
            </div>
        );
    }

    if (plans.length === 0) {
        return (
            <div className="p-6 border-4 border-yellow bg-cream text-center">
                <i className="fa-duotone fa-regular fa-triangle-exclamation text-yellow text-2xl mb-2"></i>
                <p className="font-bold uppercase tracking-wider text-dark">No pricing plans available at this time.</p>
            </div>
        );
    }

    return (
        <div className="grid md:grid-cols-3 gap-8">
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
