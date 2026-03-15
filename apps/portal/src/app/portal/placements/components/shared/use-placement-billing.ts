"use client";

import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@clerk/nextjs";
import { createAuthenticatedClient } from "@/lib/api-client";
import type {
    PlacementInvoice,
    PayoutTransaction,
    PayoutSchedule,
    EscrowHold,
} from "../../billing-types";

export interface PlacementBillingData {
    invoice: PlacementInvoice | null;
    payoutTransactions: PayoutTransaction[];
    payoutSchedules: PayoutSchedule[];
    escrowHolds: EscrowHold[];
    loading: boolean;
}

export function usePlacementBilling(placementId: string): PlacementBillingData {
    const { getToken } = useAuth();
    const [invoice, setInvoice] = useState<PlacementInvoice | null>(null);
    const [payoutTransactions, setPayoutTransactions] = useState<PayoutTransaction[]>([]);
    const [payoutSchedules, setPayoutSchedules] = useState<PayoutSchedule[]>([]);
    const [escrowHolds, setEscrowHolds] = useState<EscrowHold[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchBilling = useCallback(
        async (id: string, signal: { cancelled: boolean }) => {
            try {
                const token = await getToken();
                if (!token || signal.cancelled) return;
                const client = createAuthenticatedClient(token);

                // SplitsApiClient auto-JSON.stringifies object params,
                // so pass filters as an object — it becomes ?filters={"placement_id":"..."}
                const [invoiceRes, txRes, schedulesRes, escrowRes] =
                    await Promise.all([
                        client
                            .get<{ data: PlacementInvoice | null }>(`/placements/${id}/invoices`)
                            .catch(() => null),
                        client
                            .get<{ data: PayoutTransaction[] }>(`/payout-transactions`, {
                                params: { placement_id: id, limit: 50 },
                            })
                            .catch(() => null),
                        client
                            .get<{ data: PayoutSchedule[] }>(`/payout-schedules`, {
                                params: { placement_id: id, limit: 50 },
                            })
                            .catch(() => null),
                        client
                            .get<{ data: EscrowHold[] }>(`/placements/${id}/escrow-holds`)
                            .catch(() => null),
                    ]);

                if (signal.cancelled) return;

                const rawInvoice = invoiceRes?.data;
                setInvoice(
                    Array.isArray(rawInvoice) ? rawInvoice[0] ?? null : rawInvoice ?? null,
                );
                setPayoutTransactions(txRes?.data ?? []);
                setPayoutSchedules(schedulesRes?.data ?? []);
                setEscrowHolds(escrowRes?.data ?? []);
            } catch (err) {
                console.error("Failed to fetch placement billing:", err);
            }
            // eslint-disable-next-line react-hooks/exhaustive-deps
        },
        [],
    );

    useEffect(() => {
        const signal = { cancelled: false };
        setLoading(true);

        fetchBilling(placementId, signal).finally(() => {
            if (!signal.cancelled) setLoading(false);
        });

        return () => {
            signal.cancelled = true;
        };
    }, [placementId, fetchBilling]);

    return { invoice, payoutTransactions, payoutSchedules, escrowHolds, loading };
}
