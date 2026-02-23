"use client";

import { useState } from "react";
import { ConnectStatusCard } from "@/components/stripe/connect-status-card";
import { ConnectModal } from "@/components/basel/profile/connect-modal";

export function PayoutsSection() {
    const [connectModalOpen, setConnectModalOpen] = useState(false);
    const [connectOpenCount, setConnectOpenCount] = useState(0);

    return (
        <div>
            <h2 className="text-xl font-black tracking-tight mb-1">Payouts</h2>
            <p className="text-base text-base-content/50 mb-8">
                Manage your Stripe Connect account for receiving placement fees.
            </p>
            <ConnectStatusCard
                variant="full"
                onAction={() => {
                    setConnectOpenCount((c) => c + 1);
                    setConnectModalOpen(true);
                }}
            />
            <ConnectModal
                key={connectOpenCount}
                isOpen={connectModalOpen}
                onClose={() => setConnectModalOpen(false)}
            />
        </div>
    );
}
