"use client";

import { BaselStatusPill, BaselEmptyState } from "@splits-network/basel-ui";
import { usePayoutHistory, type Payout } from "@/hooks/use-payout-history";
import { formatAmount, formatDateShort } from "./billing-utils";
import type { BaselSemanticColor } from "@splits-network/basel-ui";

/* ─── Helpers ────────────────────────────────────────────────────────────── */

function payoutStatusColor(status: string): BaselSemanticColor {
    switch (status) {
        case "paid":
            return "success";
        case "pending":
            return "warning";
        case "in_transit":
            return "info";
        case "canceled":
            return "error";
        case "failed":
            return "error";
        default:
            return "neutral";
    }
}

function formatPayoutStatus(status: string): string {
    const labels: Record<string, string> = {
        paid: "Paid",
        pending: "Pending",
        in_transit: "In Transit",
        canceled: "Canceled",
        failed: "Failed",
    };
    return labels[status] || status.charAt(0).toUpperCase() + status.slice(1);
}

/* ─── Component ──────────────────────────────────────────────────────────── */

export function PayoutHistoryList() {
    const { payouts, hasMore, loading, error, loadMore } = usePayoutHistory();

    if (loading && payouts.length === 0) {
        return (
            <div className="flex items-center justify-center py-8">
                <span className="loading loading-spinner loading-sm" />
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-error/5 border border-error/20 p-4 text-sm text-error">
                {error}
            </div>
        );
    }

    if (payouts.length === 0) {
        return (
            <div className="bg-base-200 border border-base-300 p-6 text-center">
                <i className="fa-duotone fa-regular fa-money-bill-transfer text-2xl text-base-content/20 mb-2" />
                <p className="text-sm text-base-content/50">
                    Your payout history will appear here once Stripe processes your first payout.
                </p>
            </div>
        );
    }

    return (
        <div>
            <div className="overflow-x-auto">
                <table className="w-full text-left">
                    <thead>
                        <tr className="bg-neutral text-neutral-content">
                            <th className="px-4 py-3 text-sm font-black uppercase tracking-wider">Date</th>
                            <th className="px-4 py-3 text-sm font-black uppercase tracking-wider">Amount</th>
                            <th className="px-4 py-3 text-sm font-black uppercase tracking-wider">Status</th>
                            <th className="px-4 py-3 text-sm font-black uppercase tracking-wider">Arrival</th>
                        </tr>
                    </thead>
                    <tbody>
                        {payouts.map((payout, i) => (
                            <tr
                                key={payout.id}
                                className={`border-b border-base-300 ${
                                    i % 2 === 0 ? "bg-base-100" : "bg-base-200/50"
                                }`}
                            >
                                <td className="px-4 py-3 text-sm font-bold text-base-content whitespace-nowrap">
                                    {formatDateShort(payout.created)}
                                </td>
                                <td className="px-4 py-3 text-sm font-black text-base-content">
                                    {formatAmount(payout.amount, payout.currency)}
                                </td>
                                <td className="px-4 py-3">
                                    <BaselStatusPill color={payoutStatusColor(payout.status)}>
                                        {formatPayoutStatus(payout.status)}
                                    </BaselStatusPill>
                                </td>
                                <td className="px-4 py-3 text-sm text-base-content/60">
                                    {formatDateShort(payout.arrival_date)}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {hasMore && (
                <div className="text-center mt-4">
                    <button
                        className="btn btn-sm btn-outline"
                        onClick={loadMore}
                        disabled={loading}
                    >
                        {loading ? (
                            <>
                                <span className="loading loading-spinner loading-xs" />
                                Loading...
                            </>
                        ) : (
                            <>
                                <i className="fa-duotone fa-regular fa-chevron-down" />
                                Load More
                            </>
                        )}
                    </button>
                </div>
            )}
        </div>
    );
}
