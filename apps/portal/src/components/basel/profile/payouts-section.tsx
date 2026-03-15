"use client";

import { ConnectStatusCard } from "@/components/stripe/connect-status-card";

export function PayoutsSection() {
    return (
        <div>
            <h2 className="text-xl font-black tracking-tight mb-1">Payouts</h2>
            <p className="text-base text-base-content/50 mb-8">
                Manage your Stripe Connect account for receiving placement fees.
            </p>
            <ConnectStatusCard variant="full" />
        </div>
    );
}
