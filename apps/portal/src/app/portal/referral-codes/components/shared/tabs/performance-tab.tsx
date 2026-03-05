"use client";

import { BaselEmptyState } from "@splits-network/basel-ui";

export function PerformanceTab() {
    return (
        <div className="p-6">
            <BaselEmptyState
                icon="fa-duotone fa-regular fa-chart-line"
                iconColor="text-primary"
                iconBg="bg-primary/10"
                title="Coming Soon"
                subtitle="Performance analytics"
                description="Detailed performance metrics for your referral codes are coming soon. You will be able to track conversions, signup types, and earnings over time."
            />
        </div>
    );
}
