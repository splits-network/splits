"use client";

import { useMemo } from "react";
import { BaselChartCard } from "@splits-network/basel-ui";
import { PieChart } from "@splits-network/shared-charts";
import { ChartLoadingState } from "@splits-network/shared-ui";
import type { RoleBreakdown } from "@/app/portal/dashboard/hooks/use-role-breakdown";

interface CompanyRoleStatusDonutProps {
    roles: RoleBreakdown[];
    loading: boolean;
}

/**
 * Donut chart showing role status distribution (active/paused/filled/closed).
 * Paired next to the role pipeline table for a GA-style chart+table combo.
 */
export function CompanyRoleStatusDonut({
    roles,
    loading,
}: CompanyRoleStatusDonutProps) {
    const statusData = useMemo(() => {
        const counts: Record<string, number> = {};
        for (const role of roles) {
            const status = role.status || "active";
            counts[status] = (counts[status] || 0) + 1;
        }
        return Object.entries(counts).map(([name, value]) => ({
            name: name.charAt(0).toUpperCase() + name.slice(1),
            value,
        }));
    }, [roles]);

    return (
        <BaselChartCard
            title="Role Status"
            subtitle={`${roles.length} total roles`}
            accentColor="success"
            compact
        >
            {loading ? (
                <ChartLoadingState height={200} />
            ) : statusData.length === 0 ? (
                <p className="text-sm text-base-content/40 py-6 text-center">
                    No role data.
                </p>
            ) : (
                <PieChart
                    data={statusData}
                    donut
                    height={200}
                    showLabels
                    showLegend
                />
            )}
        </BaselChartCard>
    );
}
