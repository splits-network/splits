"use client";

import { formatAmount } from "./billing-utils";

/* ─── Types ──────────────────────────────────────────────────────────────── */

interface PayoutAccountCardProps {
    bankAccount: {
        bank_name: string;
        last4: string;
        account_type: string;
    };
    payoutSchedule: {
        interval: string;
        weekly_anchor?: string;
        monthly_anchor?: number;
        delay_days?: number;
    } | null;
    pendingBalance: number;
}

/* ─── Helpers ────────────────────────────────────────────────────────────── */

function formatSchedule(schedule: PayoutAccountCardProps["payoutSchedule"]): string {
    if (!schedule) return "Standard";
    const { interval, weekly_anchor, monthly_anchor, delay_days } = schedule;

    if (interval === "daily") return `Daily (${delay_days || 2}-day delay)`;
    if (interval === "weekly" && weekly_anchor) {
        return `Weekly on ${weekly_anchor.charAt(0).toUpperCase() + weekly_anchor.slice(1)}s`;
    }
    if (interval === "monthly" && monthly_anchor) {
        const suffix = monthly_anchor === 1 ? "st" : monthly_anchor === 2 ? "nd" : monthly_anchor === 3 ? "rd" : "th";
        return `Monthly on the ${monthly_anchor}${suffix}`;
    }
    return interval.charAt(0).toUpperCase() + interval.slice(1);
}

/* ─── Component ──────────────────────────────────────────────────────────── */

export function PayoutAccountCard({ bankAccount, payoutSchedule, pendingBalance }: PayoutAccountCardProps) {
    return (
        <div className="bg-base-200 border border-base-300 border-l-4 border-l-success p-6">
            <h4 className="text-sm font-black uppercase tracking-wider text-base-content/50 mb-4">
                Bank Account
            </h4>

            <div className="flex items-center gap-4 mb-4">
                <div className="w-10 h-10 bg-success/10 flex items-center justify-center">
                    <i className="fa-duotone fa-regular fa-building-columns text-success" />
                </div>
                <div className="flex-1">
                    <div className="font-black text-base-content">
                        {bankAccount.bank_name}
                    </div>
                    <div className="text-sm text-base-content/50">
                        &#x2022;&#x2022;&#x2022;&#x2022; {bankAccount.last4} &middot;{" "}
                        {bankAccount.account_type === "individual" ? "Individual" : bankAccount.account_type}
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div>
                    <div className="text-sm text-base-content/50 mb-1">Payout Schedule</div>
                    <div className="text-sm font-bold text-base-content">
                        {formatSchedule(payoutSchedule)}
                    </div>
                </div>
                <div>
                    <div className="text-sm text-base-content/50 mb-1">Pending Balance</div>
                    <div className="text-sm font-bold text-base-content">
                        {formatAmount(pendingBalance, "usd")}
                    </div>
                </div>
            </div>
        </div>
    );
}
