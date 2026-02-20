"use client";

import { useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import {
    duration,
    easing,
    scrollTrigger as scrollTriggerPresets,
} from "@/components/landing/shared/animation-utils";
import { useCalculator } from "@/components/calculator/use-calculator";
import { FeeInput } from "@/components/calculator/fee-input";
import { RoleSelector } from "@/components/calculator/role-selector";
import { TierComparison } from "@/components/calculator/tier-comparison";
import type { Tier } from "@/components/calculator/types";

if (typeof window !== "undefined") {
    gsap.registerPlugin(ScrollTrigger);
}

interface BaselCalculatorProps {
    variant: "page" | "compact";
    initialSalary?: number;
    initialFeePercentage?: number;
    lockFee?: boolean;
    currentTier?: Tier;
    animate?: boolean;
    className?: string;
}

export function BaselCalculator({
    variant,
    initialSalary,
    initialFeePercentage,
    lockFee = false,
    currentTier,
    animate,
    className = "",
}: BaselCalculatorProps) {
    const containerRef = useRef<HTMLDivElement>(null);
    const contentRef = useRef<HTMLDivElement>(null);
    const shouldAnimate = animate ?? variant === "page";

    const initialState: Record<string, number> = {};
    if (initialSalary !== undefined) {
        initialState.salary = initialSalary;
    }
    if (initialFeePercentage !== undefined) {
        initialState.feePercentage = initialFeePercentage;
    }

    const {
        state,
        effectiveFee,
        payouts,
        upgradeValue,
        setSalary,
        setFeePercentage,
        toggleRole,
    } = useCalculator(
        Object.keys(initialState).length > 0 ? initialState : undefined,
    );

    useGSAP(
        () => {
            if (!shouldAnimate || !containerRef.current || !contentRef.current)
                return;

            const prefersReducedMotion = window.matchMedia(
                "(prefers-reduced-motion: reduce)",
            ).matches;
            if (prefersReducedMotion) {
                gsap.set(contentRef.current, { opacity: 1 });
                return;
            }

            gsap.fromTo(
                contentRef.current,
                { opacity: 0, y: 40 },
                {
                    opacity: 1,
                    y: 0,
                    duration: duration.normal,
                    ease: easing.strong,
                    scrollTrigger: {
                        trigger: containerRef.current,
                        ...scrollTriggerPresets.standard,
                    },
                },
            );
        },
        { scope: containerRef, dependencies: [shouldAnimate] },
    );

    if (variant === "compact") {
        return (
            <div className={className}>
                <div className="space-y-4">
                    <div className="bg-base-200 p-4">
                        <FeeInput
                            salary={state.salary}
                            feePercentage={state.feePercentage}
                            effectiveFee={effectiveFee}
                            onSalaryChange={setSalary}
                            onFeePercentageChange={setFeePercentage}
                            feeReadOnly={lockFee}
                        />
                    </div>
                    <div className="divider my-2" />
                    <div className="bg-base-200 p-4">
                        <RoleSelector
                            selectedRoles={state.selectedRoles}
                            onToggleRole={toggleRole}
                        />
                    </div>
                    <div className="divider my-2" />
                    <TierComparison
                        payouts={payouts}
                        upgradeValue={upgradeValue}
                        effectiveFee={effectiveFee}
                        currentTier={currentTier}
                    />
                    <div className="text-center text-xs text-base-content/40">
                        <i className="fa-duotone fa-regular fa-info-circle mr-1" />
                        Illustrative payouts based on current rates.
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div ref={containerRef} className={className}>
            <div
                ref={contentRef}
                className={shouldAnimate ? "opacity-0" : ""}
            >
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    <div className="lg:col-span-5 space-y-6">
                        <div className="card bg-base-100 shadow-lg">
                            <div className="card-body">
                                <h3 className="card-title text-lg mb-4">
                                    <i className="fa-duotone fa-regular fa-calculator text-primary" />
                                    Calculate Your Earnings
                                </h3>
                                <FeeInput
                                    salary={state.salary}
                                    feePercentage={state.feePercentage}
                                    effectiveFee={effectiveFee}
                                    onSalaryChange={setSalary}
                                    onFeePercentageChange={setFeePercentage}
                                    feeReadOnly={lockFee}
                                />
                                <div className="divider my-4" />
                                <RoleSelector
                                    selectedRoles={state.selectedRoles}
                                    onToggleRole={toggleRole}
                                />
                            </div>
                        </div>
                    </div>
                    <div className="lg:col-span-7">
                        <div className="card bg-base-100 shadow-lg h-full">
                            <div className="card-body">
                                <h3 className="card-title text-lg mb-4">
                                    <i className="fa-duotone fa-regular fa-chart-column text-secondary" />
                                    Your Payout by Tier
                                </h3>
                                <TierComparison
                                    payouts={payouts}
                                    upgradeValue={upgradeValue}
                                    effectiveFee={effectiveFee}
                                    currentTier={currentTier}
                                />
                            </div>
                        </div>
                    </div>
                </div>
                <div className="text-center mt-6 text-sm text-base-content/50">
                    <i className="fa-duotone fa-regular fa-info-circle mr-1" />
                    Payouts are illustrative and based on current commission
                    rates. Actual payouts are finalized at hire time.
                </div>
            </div>
        </div>
    );
}
