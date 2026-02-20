"use client";

import { useState } from "react";
import { ConnectStatusCard } from "@/components/stripe/connect-status-card";
import { ConnectDrawer } from "@/components/stripe/connect-drawer";

export function PayoutsSection() {
    const [connectDrawerOpen, setConnectDrawerOpen] = useState(false);

    return (
        <div>
            <h2 className="text-xl font-black tracking-tight mb-1">Payouts</h2>
            <p className="text-base text-base-content/50 mb-8">
                Manage your Stripe Connect account for receiving placement fees.
            </p>
            <ConnectStatusCard
                variant="full"
                onAction={() => setConnectDrawerOpen(true)}
            />
            <ConnectDrawer
                open={connectDrawerOpen}
                onClose={() => setConnectDrawerOpen(false)}
            />
        </div>
    );
}
