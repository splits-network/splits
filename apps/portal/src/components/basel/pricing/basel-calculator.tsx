"use client";

import { useRef, useId } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { useCalculator } from "@/components/calculator/use-calculator";
import { ROLE_META } from "@/components/calculator/commission-rates";
import { AnimatedPayout } from "@/components/calculator/animated-payout";
import type { Tier, RecruiterRole } from "@/components/calculator/types";

if (typeof window !== "undefined") {
    gsap.registerPlugin(ScrollTrigger);
}

/* ─── Helpers ─────────────────────────────────────────────────────────────── */

const fmt = (value: number) =>
    new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(value);

/* ─── Types ───────────────────────────────────────────────────────────────── */

interface BaselCalculatorProps {
    variant: "page" | "compact";
    initialSalary?: number;
    initialFeePercentage?: number;
    lockFee?: boolean;
    currentTier?: Tier;
    animate?: boolean;
    className?: string;
}

/* ─── Component ───────────────────────────────────────────────────────────── */

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
    const salaryId = useId();
    const feeId = useId();
    const shouldAnimate = animate ?? variant === "page";

    const initialState: Record<string, number> = {};
    if (initialSalary !== undefined) initialState.salary = initialSalary;
    if (initialFeePercentage !== undefined)
        initialState.feePercentage = initialFeePercentage;

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

    const freePayout = payouts.find((p) => p.tier === "free");
    const paidPayout = payouts.find((p) => p.tier === "paid");
    const premiumPayout = payouts.find((p) => p.tier === "premium");

    useGSAP(
        () => {
            if (!shouldAnimate || !containerRef.current || !contentRef.current)
                return;
            if (
                window.matchMedia("(prefers-reduced-motion: reduce)").matches
            ) {
                gsap.set(contentRef.current, { opacity: 1 });
                return;
            }
            gsap.fromTo(
                contentRef.current,
                { opacity: 0, y: 40 },
                {
                    opacity: 1,
                    y: 0,
                    duration: 0.6,
                    ease: "power3.out",
                    scrollTrigger: {
                        trigger: containerRef.current,
                        start: "top 80%",
                    },
                },
            );
        },
        { scope: containerRef, dependencies: [shouldAnimate] },
    );

    /* ── Shared sub-sections ──────────────────────────────────────────────── */

    const feeInputSection = (
        <div className="space-y-4">
            <div className="grid grid-cols-2 gap-6">
                <fieldset className="form-control">
                    <label htmlFor={salaryId} className="label">
                        <span className="label-text text-xs font-bold uppercase tracking-[0.2em]">
                            Annual Salary
                        </span>
                    </label>
                    <label className="input rounded-none w-full flex items-center gap-2">
                        <span className="text-base-content/60">$</span>
                        <input
                            id={salaryId}
                            type="number"
                            className="grow"
                            placeholder="100000"
                            value={state.salary || ""}
                            onChange={(e) =>
                                setSalary(Number(e.target.value))
                            }
                            min={0}
                            step={5000}
                        />
                    </label>
                </fieldset>
                <fieldset className="form-control">
                    <label htmlFor={feeId} className="label">
                        <span className="label-text text-xs font-bold uppercase tracking-[0.2em]">
                            Fee %
                        </span>
                    </label>
                    <label
                        className={`input rounded-none w-full flex items-center gap-2 ${lockFee ? "bg-base-200 cursor-not-allowed" : ""}`}
                    >
                        <input
                            id={feeId}
                            type="number"
                            className={`grow ${lockFee ? "cursor-not-allowed" : ""}`}
                            placeholder="20"
                            value={state.feePercentage || ""}
                            onChange={(e) =>
                                !lockFee &&
                                setFeePercentage(Number(e.target.value))
                            }
                            readOnly={lockFee}
                            tabIndex={lockFee ? -1 : undefined}
                            min={0}
                            max={100}
                            step={1}
                        />
                        <span className="text-base-content/60">%</span>
                    </label>
                </fieldset>
            </div>

            <div className="pt-4 border-t border-base-300 flex justify-between items-baseline">
                <span className="text-xs font-bold uppercase tracking-[0.2em] text-base-content/50">
                    Placement Fee
                </span>
                <span className="text-xl font-black text-base-content">
                    {fmt(effectiveFee)}
                </span>
            </div>
        </div>
    );

    const roleSelectorSection = (
        <div className="space-y-3">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-base-content/50 mb-1">
                Your Roles
            </p>
            <p className="text-sm text-base-content/70 mb-4">
                Select all roles you hold in the deal
            </p>
            <div className="grid gap-3">
                {ROLE_META.map((role) => {
                    const isSelected = state.selectedRoles.includes(
                        role.id as RecruiterRole,
                    );
                    return (
                        <label
                            key={role.id}
                            className={`flex items-start gap-3 py-4 px-5 rounded-none cursor-pointer transition-all ${
                                isSelected
                                    ? "bg-base-100 border-l-4 border-primary shadow-sm"
                                    : "bg-base-200 border-l-4 border-base-300 hover:border-primary/40"
                            }`}
                        >
                            <input
                                type="checkbox"
                                className="checkbox checkbox-primary rounded-none mt-0.5"
                                checked={isSelected}
                                onChange={() =>
                                    toggleRole(role.id as RecruiterRole)
                                }
                            />
                            <div>
                                <div className="font-bold text-sm">
                                    {role.label}
                                </div>
                                <div className="text-sm text-base-content/60">
                                    {role.description}
                                </div>
                            </div>
                        </label>
                    );
                })}
            </div>
            {state.selectedRoles.length === 0 && (
                <div className="border-l-4 border-warning bg-warning/10 rounded-none p-4 text-sm text-warning">
                    <i className="fa-duotone fa-regular fa-triangle-exclamation mr-1" />
                    Select at least one role to see your payout
                </div>
            )}
        </div>
    );

    const tierComparisonSection = (
        <div className="space-y-6">
            {/* Tier panels */}
            <div className="grid grid-cols-3 gap-4">
                {/* Starter */}
                {freePayout && (
                    <div
                        className={`bg-base-200 border-l-4 border-base-300 rounded-none shadow-sm p-6 ${currentTier === "free" ? "ring-2 ring-primary" : ""}`}
                    >
                        <p className="text-xs font-bold uppercase tracking-[0.2em] text-base-content/50 mb-1">
                            {freePayout.tierName}
                        </p>
                        <p className="text-xs text-base-content/60 mb-3">
                            {fmt(freePayout.monthlyPrice)}/mo
                        </p>
                        <p className="text-3xl font-black text-base-content mb-1">
                            <AnimatedPayout
                                value={freePayout.payout}
                                highlightChange
                            />
                        </p>
                        <p className="text-xs font-bold uppercase tracking-[0.2em] text-base-content/40">
                            Your Payout
                        </p>
                        {currentTier === "free" && (
                            <p className="mt-3 text-xs font-bold uppercase tracking-[0.2em] text-primary">
                                Current Plan
                            </p>
                        )}
                    </div>
                )}

                {/* Pro — highlighted */}
                {paidPayout && (
                    <div
                        className={`bg-primary text-primary-content border-l-4 border-primary rounded-none shadow-md p-6 ${currentTier === "paid" ? "ring-2 ring-accent ring-offset-2" : ""}`}
                    >
                        <p className="text-xs font-bold uppercase tracking-[0.2em] text-primary-content/70 mb-1">
                            {paidPayout.tierName}
                        </p>
                        <p className="text-xs text-primary-content/60 mb-3">
                            {fmt(paidPayout.monthlyPrice)}/mo
                        </p>
                        <p className="text-3xl font-black text-primary-content mb-1">
                            <AnimatedPayout
                                value={paidPayout.payout}
                            />
                        </p>
                        <p className="text-xs font-bold uppercase tracking-[0.2em] text-primary-content/50">
                            Your Payout
                        </p>
                        {upgradeValue.paidVsFree > 0 && (
                            <div className="mt-3 pt-3 border-t border-primary-content/20">
                                <span className="inline-block px-2 py-0.5 text-xs font-black uppercase bg-success text-success-content">
                                    <i className="fa-duotone fa-regular fa-arrow-up mr-1 text-[10px]" />
                                    +{fmt(upgradeValue.paidVsFree)}
                                </span>
                                <p className="text-xs text-primary-content/50 mt-1">
                                    vs. Starter
                                </p>
                            </div>
                        )}
                        {currentTier === "paid" && (
                            <p className="mt-3 text-xs font-bold uppercase tracking-[0.2em] text-primary-content">
                                Current Plan
                            </p>
                        )}
                    </div>
                )}

                {/* Partner */}
                {premiumPayout && (
                    <div
                        className={`bg-base-200 border-l-4 border-warning rounded-none shadow-sm p-6 ${currentTier === "premium" ? "ring-2 ring-primary" : ""}`}
                    >
                        <p className="text-xs font-bold uppercase tracking-[0.2em] text-base-content/50 mb-1">
                            {premiumPayout.tierName}
                        </p>
                        <p className="text-xs text-base-content/60 mb-3">
                            {fmt(premiumPayout.monthlyPrice)}/mo
                        </p>
                        <p className="text-3xl font-black text-base-content mb-1">
                            <AnimatedPayout
                                value={premiumPayout.payout}
                                highlightChange
                            />
                        </p>
                        <p className="text-xs font-bold uppercase tracking-[0.2em] text-base-content/40">
                            Your Payout
                        </p>
                        {upgradeValue.premiumVsFree > 0 && (
                            <div className="mt-3 pt-3 border-t border-base-300">
                                <span className="inline-block px-2 py-0.5 text-xs font-black uppercase bg-success text-success-content">
                                    <i className="fa-duotone fa-regular fa-arrow-up mr-1 text-[10px]" />
                                    +{fmt(upgradeValue.premiumVsFree)}
                                </span>
                                <p className="text-xs text-base-content/50 mt-1">
                                    vs. Starter
                                </p>
                            </div>
                        )}
                        {currentTier === "premium" && (
                            <p className="mt-3 text-xs font-bold uppercase tracking-[0.2em] text-primary">
                                Current Plan
                            </p>
                        )}
                    </div>
                )}
            </div>

            {/* ROI summary */}
            {effectiveFee > 0 && upgradeValue.premiumVsFree > 0 && (
                <div className="bg-success/10 border-l-4 border-success rounded-none p-6">
                    <div className="flex items-start gap-4">
                        <i className="fa-duotone fa-regular fa-lightbulb text-success text-lg mt-0.5 flex-shrink-0" />
                        <div>
                            <p className="font-black text-sm uppercase tracking-wide mb-1 text-base-content">
                                One placement pays for your upgrade
                            </p>
                            <p className="text-sm leading-relaxed text-base-content/70">
                                On a {fmt(effectiveFee)} placement, upgrading to
                                Partner earns you{" "}
                                <span className="font-black text-success">
                                    {fmt(upgradeValue.premiumVsFree)} more
                                </span>{" "}
                                &mdash; that&apos;s{" "}
                                {(
                                    (upgradeValue.premiumVsFree / 249) *
                                    100
                                ).toFixed(0)}
                                % of the monthly cost recovered in one deal.
                            </p>
                        </div>
                    </div>
                </div>
            )}

            {/* Breakdown table */}
            <div className="bg-base-200 rounded-none p-6">
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-base-content/50 mb-4">
                    Detailed Breakdown
                </p>
                <div className="overflow-x-auto">
                    <table className="table table-sm">
                        <thead>
                            <tr className="bg-base-300">
                                <th className="text-xs font-bold uppercase tracking-[0.2em] text-base-content/60">
                                    Tier
                                </th>
                                <th className="text-right text-xs font-bold uppercase tracking-[0.2em] text-base-content/60">
                                    Your Rate
                                </th>
                                <th className="text-right text-xs font-bold uppercase tracking-[0.2em] text-base-content/60">
                                    Your Payout
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {payouts.map((payout) => (
                                <tr
                                    key={payout.tier}
                                    className={
                                        currentTier === payout.tier
                                            ? "bg-primary/10 font-semibold"
                                            : ""
                                    }
                                >
                                    <td className="font-bold text-sm">
                                        {payout.tierName}
                                        {currentTier === payout.tier && (
                                            <span className="ml-2 text-xs font-bold uppercase tracking-[0.2em] text-primary">
                                                Current
                                            </span>
                                        )}
                                    </td>
                                    <td className="text-right text-sm text-base-content/60">
                                        {effectiveFee > 0
                                            ? `${((payout.payout / effectiveFee) * 100).toFixed(0)}%`
                                            : "\u2014"}
                                    </td>
                                    <td className="text-right text-sm font-black">
                                        {fmt(payout.payout)}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );

    /* ── Compact variant ──────────────────────────────────────────────────── */

    if (variant === "compact") {
        return (
            <div className={className}>
                <div className="space-y-6">
                    <div className="bg-base-200 rounded-none p-5">
                        {feeInputSection}
                    </div>
                    <div className="border-t border-base-300" />
                    <div className="bg-base-200 rounded-none p-5">
                        {roleSelectorSection}
                    </div>
                    <div className="border-t border-base-300" />
                    {tierComparisonSection}
                    <p className="text-sm text-base-content/40">
                        <i className="fa-duotone fa-regular fa-info-circle mr-1" />
                        Illustrative payouts based on current rates.
                    </p>
                </div>
            </div>
        );
    }

    /* ── Page variant ─────────────────────────────────────────────────────── */

    return (
        <div ref={containerRef} className={className}>
            <div
                ref={contentRef}
                className={shouldAnimate ? "opacity-0" : ""}
            >
                <div className="grid grid-cols-1 lg:grid-cols-5 gap-10">
                    {/* Input panel — 2 of 5 cols */}
                    <div className="lg:col-span-2 space-y-6">
                        <div className="bg-base-100 border-l-4 border-primary shadow-sm rounded-none p-8">
                            <p className="text-xs font-bold uppercase tracking-[0.2em] text-primary mb-2">
                                <i className="fa-duotone fa-regular fa-calculator mr-2" />
                                Calculator
                            </p>
                            <h3 className="text-2xl font-black text-base-content mb-6">
                                Calculate Your Earnings
                            </h3>
                            {feeInputSection}
                            <div className="border-t border-base-300 my-6" />
                            {roleSelectorSection}
                        </div>
                    </div>

                    {/* Results panel — 3 of 5 cols */}
                    <div className="lg:col-span-3">
                        <div className="bg-base-100 border-l-4 border-secondary shadow-sm rounded-none p-8 h-full">
                            <p className="text-xs font-bold uppercase tracking-[0.2em] text-secondary mb-2">
                                <i className="fa-duotone fa-regular fa-chart-column mr-2" />
                                Payout Projection
                            </p>
                            <h3 className="text-2xl font-black text-base-content mb-6">
                                Your Payout by Tier
                            </h3>
                            {tierComparisonSection}
                        </div>
                    </div>
                </div>

                <p className="mt-8 text-sm text-base-content/50">
                    <i className="fa-duotone fa-regular fa-info-circle mr-1" />
                    Payouts are illustrative and based on current commission
                    rates. Actual payouts are finalized at hire time.
                </p>
            </div>
        </div>
    );
}
