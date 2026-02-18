"use client";

import { useId } from "react";
import { useCalculator } from "./use-calculator";
import { ROLE_META } from "./commission-rates";
import { AnimatedPayout } from "./animated-payout";
import type { RecruiterRole } from "./types";

// ─── Helpers ─────────────────────────────────────────────────────────────────

const fmt = (value: number) =>
    new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(value);

// ─── Component ───────────────────────────────────────────────────────────────

interface MemphisCalculatorProps {
    /** Optional class for the outer wrapper */
    className?: string;
}

export function MemphisCalculator({ className = "" }: MemphisCalculatorProps) {
    const salaryId = useId();
    const feeId = useId();

    const {
        state,
        effectiveFee,
        payouts,
        upgradeValue,
        setSalary,
        setFeePercentage,
        toggleRole,
    } = useCalculator();

    const freePayout = payouts.find((p) => p.tier === "free");
    const paidPayout = payouts.find((p) => p.tier === "paid");
    const premiumPayout = payouts.find((p) => p.tier === "premium");

    return (
        <div className={className}>
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* ═══ INPUT PANEL ═══════════════════════════════════════════════ */}
                <div className="calc-input-panel lg:col-span-5 space-y-6 opacity-0">
                    {/* Salary + Fee Inputs */}
                    <div className="p-6 md:p-8 border-4 border-teal bg-cream/[0.03]">
                        <h3 className="flex items-center gap-3 font-black text-lg uppercase tracking-wide mb-6 text-cream">
                            <div className="w-10 h-10 flex items-center justify-center bg-teal flex-shrink-0">
                                <i className="fa-duotone fa-regular fa-calculator text-dark"></i>
                            </div>
                            Calculate Your Earnings
                        </h3>

                        <div className="grid grid-cols-2 gap-4 mb-4">
                            <fieldset className="w-full">
                                <label
                                    htmlFor={salaryId}
                                    className="flex items-center gap-1 text-xs font-black uppercase tracking-[0.15em] text-cream/70 mb-2"
                                >
                                    Annual Salary
                                </label>
                                <label className="input input-teal input-lg w-full bg-dark text-cream">
                                    <span className="text-cream/50 font-bold">$</span>
                                    <input
                                        id={salaryId}
                                        type="number"
                                        placeholder="100000"
                                        value={state.salary || ""}
                                        onChange={(e) => setSalary(Number(e.target.value))}
                                        min={0}
                                        step={5000}
                                    />
                                </label>
                            </fieldset>
                            <fieldset className="w-full">
                                <label
                                    htmlFor={feeId}
                                    className="flex items-center gap-1 text-xs font-black uppercase tracking-[0.15em] text-cream/70 mb-2"
                                >
                                    Fee %
                                </label>
                                <label className="input input-teal input-lg w-full bg-dark text-cream">
                                    <input
                                        id={feeId}
                                        type="number"
                                        placeholder="20"
                                        value={state.feePercentage || ""}
                                        onChange={(e) => setFeePercentage(Number(e.target.value))}
                                        min={0}
                                        max={100}
                                        step={1}
                                    />
                                    <span className="text-cream/50 font-bold">%</span>
                                </label>
                            </fieldset>
                        </div>

                        {/* Placement fee display */}
                        <div className="flex items-center justify-between p-3 border-4 border-teal/30 bg-teal/10">
                            <span className="text-xs font-bold uppercase tracking-wider text-cream/60">
                                Placement Fee
                            </span>
                            <span className="text-lg font-black text-teal">
                                {fmt(effectiveFee)}
                            </span>
                        </div>
                    </div>

                    {/* Role Selector */}
                    <div className="p-6 md:p-8 border-4 border-coral bg-cream/[0.03]">
                        <h3 className="flex items-center gap-3 font-black text-lg uppercase tracking-wide mb-2 text-cream">
                            <div className="w-10 h-10 flex items-center justify-center bg-coral flex-shrink-0">
                                <i className="fa-duotone fa-regular fa-users text-cream"></i>
                            </div>
                            Your Role(s)
                        </h3>
                        <p className="text-xs text-cream/50 mb-4 ml-[52px]">
                            Select the roles you hold in this placement
                        </p>

                        <div className="space-y-2">
                            {ROLE_META.map((role) => {
                                const isSelected = state.selectedRoles.includes(role.id);
                                const colors: Record<RecruiterRole, { border: string; bg: string }> = {
                                    candidate_recruiter: { border: "border-coral", bg: "bg-coral" },
                                    job_owner: { border: "border-teal", bg: "bg-teal" },
                                    company_recruiter: { border: "border-yellow", bg: "bg-yellow" },
                                    candidate_sourcer: { border: "border-purple", bg: "bg-purple" },
                                    company_sourcer: { border: "border-teal", bg: "bg-teal" },
                                };
                                const c = colors[role.id];

                                return (
                                    <label
                                        key={role.id}
                                        className={`flex items-start gap-3 p-3 cursor-pointer transition-all border-4 ${
                                            isSelected
                                                ? `${c.border} bg-cream/[0.06]`
                                                : "border-cream/10 hover:border-cream/25"
                                        }`}
                                    >
                                        <div
                                            className={`mt-0.5 w-5 h-5 flex-shrink-0 flex items-center justify-center border-4 transition-colors ${
                                                isSelected
                                                    ? `${c.border} ${c.bg}`
                                                    : "border-cream/30"
                                            }`}
                                        >
                                            {isSelected && (
                                                <i className="fa-solid fa-check text-[8px] text-cream"></i>
                                            )}
                                        </div>
                                        <input
                                            type="checkbox"
                                            className="sr-only"
                                            checked={isSelected}
                                            onChange={() => toggleRole(role.id)}
                                        />
                                        <div>
                                            <div className="font-bold text-sm uppercase tracking-wide text-cream">
                                                {role.label}
                                            </div>
                                            <div className="text-xs text-cream/50">
                                                {role.description}
                                            </div>
                                        </div>
                                    </label>
                                );
                            })}
                        </div>

                        {state.selectedRoles.length === 0 && (
                            <div className="mt-3 p-3 border-4 border-yellow/50 bg-yellow/10 text-xs font-bold uppercase tracking-wider text-yellow">
                                <i className="fa-duotone fa-regular fa-triangle-exclamation mr-1"></i>
                                Select at least one role
                            </div>
                        )}
                    </div>
                </div>

                {/* ═══ RESULTS PANEL ═════════════════════════════════════════════ */}
                <div className="calc-results-panel lg:col-span-7 space-y-6 opacity-0">
                    {/* Tier Payout Cards */}
                    <div className="grid grid-cols-3 gap-3">
                        {/* Starter */}
                        {freePayout && (
                            <div className="calc-tier-card p-4 md:p-6 border-4 border-teal bg-cream/[0.03] text-center opacity-0">
                                <span className="inline-block px-3 py-0.5 text-[10px] font-bold uppercase tracking-[0.15em] mb-3 bg-teal text-dark">
                                    {freePayout.tierName}
                                </span>
                                <div className="text-xs font-bold text-cream/50 mb-1">
                                    {fmt(freePayout.monthlyPrice)}/mo
                                </div>
                                <div className="text-2xl md:text-3xl font-black text-cream my-2">
                                    <AnimatedPayout value={freePayout.payout} highlightChange />
                                </div>
                                <div className="text-[10px] font-bold uppercase tracking-wider text-cream/40">
                                    Your Payout
                                </div>
                            </div>
                        )}

                        {/* Pro — highlighted */}
                        {paidPayout && (
                            <div className="calc-tier-card p-4 md:p-6 border-4 border-coral bg-coral text-center opacity-0">
                                <span className="inline-block px-3 py-0.5 text-[10px] font-bold uppercase tracking-[0.15em] mb-3 bg-dark text-coral">
                                    {paidPayout.tierName}
                                </span>
                                <div className="text-xs font-bold text-cream/70 mb-1">
                                    {fmt(paidPayout.monthlyPrice)}/mo
                                </div>
                                <div className="text-2xl md:text-3xl font-black text-cream my-2">
                                    <AnimatedPayout value={paidPayout.payout} highlightChange />
                                </div>
                                <div className="text-[10px] font-bold uppercase tracking-wider text-cream/60">
                                    Your Payout
                                </div>
                                {upgradeValue.paidVsFree > 0 && (
                                    <div className="mt-3 pt-3 border-t-[3px] border-cream/20">
                                        <span className="inline-block px-2 py-0.5 text-[10px] font-black uppercase bg-yellow text-dark">
                                            <i className="fa-duotone fa-regular fa-arrow-up mr-1"></i>
                                            +{fmt(upgradeValue.paidVsFree)}
                                        </span>
                                        <div className="text-[10px] text-cream/50 mt-1">
                                            vs. Starter
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Partner */}
                        {premiumPayout && (
                            <div className="calc-tier-card p-4 md:p-6 border-4 border-yellow bg-cream/[0.03] text-center opacity-0">
                                <span className="inline-block px-3 py-0.5 text-[10px] font-bold uppercase tracking-[0.15em] mb-3 bg-yellow text-dark">
                                    {premiumPayout.tierName}
                                </span>
                                <div className="text-xs font-bold text-cream/50 mb-1">
                                    {fmt(premiumPayout.monthlyPrice)}/mo
                                </div>
                                <div className="text-2xl md:text-3xl font-black text-cream my-2">
                                    <AnimatedPayout value={premiumPayout.payout} highlightChange />
                                </div>
                                <div className="text-[10px] font-bold uppercase tracking-wider text-cream/40">
                                    Your Payout
                                </div>
                                {upgradeValue.premiumVsFree > 0 && (
                                    <div className="mt-3 pt-3 border-t-[3px] border-yellow/30">
                                        <span className="inline-block px-2 py-0.5 text-[10px] font-black uppercase bg-yellow text-dark">
                                            <i className="fa-duotone fa-regular fa-arrow-up mr-1"></i>
                                            +{fmt(upgradeValue.premiumVsFree)}
                                        </span>
                                        <div className="text-[10px] text-cream/50 mt-1">
                                            vs. Starter
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    {/* ROI Callout */}
                    {effectiveFee > 0 && upgradeValue.premiumVsFree > 0 && (
                        <div className="calc-roi-callout relative p-6 border-4 border-yellow bg-yellow/10 opacity-0">
                            <div className="absolute top-0 right-0 w-8 h-8 bg-yellow" />
                            <div className="flex items-start gap-4">
                                <div className="w-12 h-12 flex items-center justify-center flex-shrink-0 bg-yellow">
                                    <i className="fa-duotone fa-regular fa-lightbulb text-xl text-dark"></i>
                                </div>
                                <div>
                                    <div className="font-black text-sm uppercase tracking-wide mb-1 text-cream">
                                        One Placement Pays for Your Upgrade
                                    </div>
                                    <div className="text-sm leading-relaxed text-cream/70">
                                        On a {fmt(effectiveFee)} placement, upgrading to Partner earns you{" "}
                                        <span className="font-black text-yellow">
                                            {fmt(upgradeValue.premiumVsFree)} more
                                        </span>{" "}
                                        — that&apos;s{" "}
                                        {((upgradeValue.premiumVsFree / 249) * 100).toFixed(0)}% of the
                                        monthly cost recovered in one deal.
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Breakdown Table */}
                    <div className="calc-breakdown p-6 border-4 border-cream/10 opacity-0">
                        <h4 className="font-black text-xs uppercase tracking-[0.15em] mb-4 text-cream/60">
                            Detailed Breakdown
                        </h4>
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b-4 border-cream/10">
                                        <th className="text-left py-2 text-xs font-black uppercase tracking-wider text-cream/50">
                                            Tier
                                        </th>
                                        <th className="text-right py-2 text-xs font-black uppercase tracking-wider text-cream/50">
                                            Your Rate
                                        </th>
                                        <th className="text-right py-2 text-xs font-black uppercase tracking-wider text-cream/50">
                                            Your Payout
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {payouts.map((payout) => {
                                        const tierColors: Record<string, string> = {
                                            free: "text-teal",
                                            paid: "text-coral",
                                            premium: "text-yellow",
                                        };
                                        return (
                                            <tr key={payout.tier} className="border-b border-cream/5">
                                                <td className={`py-3 font-bold text-sm ${tierColors[payout.tier]}`}>
                                                    {payout.tierName}
                                                </td>
                                                <td className="py-3 text-right text-sm text-cream/50">
                                                    {effectiveFee > 0
                                                        ? `${((payout.payout / effectiveFee) * 100).toFixed(0)}%`
                                                        : "—"}
                                                </td>
                                                <td className="py-3 text-right text-sm font-black text-cream">
                                                    {fmt(payout.payout)}
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}