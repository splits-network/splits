"use client";

import { BaselPricingCard } from "./basel-pricing-card";
import type { PricingCardGridProps } from "@/components/pricing/types";

export function BaselPricingCardGrid({
    plans,
    selectedPlanId,
    onSelectPlan,
    isAnnual = false,
    loading = false,
}: PricingCardGridProps) {
    if (loading) {
        return (
            <div className="grid md:grid-cols-3 gap-8">
                {[1, 2, 3].map((i) => (
                    <div
                        key={i}
                        className="relative p-8 border-l-4 border-base-300 border bg-base-100"
                    >
                        <div className="h-6 w-24 mb-4 bg-base-content/10" />
                        <div className="h-10 w-32 mb-2 bg-base-content/10" />
                        <div className="h-4 w-full mb-4 bg-base-content/10" />
                        <div className="w-full h-1 my-6 bg-base-content/10" />
                        <div className="space-y-3">
                            <div className="h-4 w-full bg-base-content/10" />
                            <div className="h-4 w-full bg-base-content/10" />
                            <div className="h-4 w-3/4 bg-base-content/10" />
                            <div className="h-4 w-full bg-base-content/10" />
                            <div className="h-4 w-full bg-base-content/10" />
                        </div>
                        <div className="h-10 w-full mt-8 bg-base-content/10" />
                    </div>
                ))}
            </div>
        );
    }

    if (plans.length === 0) {
        return (
            <div className="p-6 border border-warning bg-warning/10 text-center">
                <i className="fa-duotone fa-regular fa-triangle-exclamation text-warning text-2xl mb-2" />
                <p className="font-bold uppercase tracking-wider text-base-content">
                    No pricing plans available at this time.
                </p>
            </div>
        );
    }

    return (
        <div className="grid md:grid-cols-3 gap-8">
            {plans
                .sort((a, b) => a.price_monthly - b.price_monthly)
                .map((plan) => (
                    <BaselPricingCard
                        key={plan.id}
                        plan={plan}
                        isSelected={selectedPlanId === plan.id}
                        onSelect={onSelectPlan}
                        isAnnual={isAnnual}
                    />
                ))}
        </div>
    );
}
