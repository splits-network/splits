"use client";

import { useState } from "react";
import { DetailSection } from "@splits-network/memphis-ui";
import { ConnectStatusCard } from "@/components/stripe/connect-status-card";
import { ConnectDrawer } from "@/components/stripe/connect-drawer";

export default function PayoutSection() {
    const [connectDrawerOpen, setConnectDrawerOpen] = useState(false);

    return (
        <>
            <DetailSection
                title="Payout Settings"
                icon="fa-duotone fa-regular fa-money-bill-transfer"
                accent="purple"
            >
                <ConnectStatusCard
                    variant="full"
                    onAction={() => setConnectDrawerOpen(true)}
                />
            </DetailSection>

            <ConnectDrawer
                open={connectDrawerOpen}
                onClose={() => setConnectDrawerOpen(false)}
            />
        </>
    );
}
