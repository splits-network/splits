"use client";

import { useMemo } from "react";
import { GamificationProvider } from "@splits-network/shared-gamification";
import { ApiClient } from "@/lib/api-client";

export function GamificationWrapper({ children }: { children: React.ReactNode }) {
    const client = useMemo(() => new ApiClient(), []);
    return (
        <GamificationProvider client={client}>
            {children}
        </GamificationProvider>
    );
}
