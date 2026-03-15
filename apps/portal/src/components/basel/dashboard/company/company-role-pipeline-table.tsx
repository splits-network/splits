"use client";

import Link from "next/link";
import { BaselChartCard } from "@splits-network/basel-ui";
import { ChartLoadingState } from "@splits-network/shared-ui";
import type { RoleBreakdown } from "@/app/portal/dashboard/hooks/use-role-breakdown";

interface CompanyRolePipelineTableProps {
    roles: RoleBreakdown[];
    loading: boolean;
}

/**
 * GA-style ranked data table — roles sorted by candidate volume.
 * Inspired by GA's "Views by Page title" widget: compact, scannable,
 * numbers right-aligned with tabular numerals.
 */
export function CompanyRolePipelineTable({
    roles,
    loading,
}: CompanyRolePipelineTableProps) {
    const sorted = [...roles].sort(
        (a, b) => b.applications_count - a.applications_count,
    );

    return (
        <BaselChartCard
            title="Candidates by Role"
            subtitle={`${roles.length} active roles`}
            accentColor="primary"
            compact
        >
            {loading ? (
                <ChartLoadingState height={200} />
            ) : sorted.length === 0 ? (
                <p className="text-sm text-base-content/40 py-6 text-center">
                    No roles to display.
                </p>
            ) : (
                <div className="overflow-x-auto">
                    <table className="table table-xs w-full">
                        <thead>
                            <tr>
                                <th className="text-xs font-black uppercase tracking-wider text-base-content/50">
                                    Role
                                </th>
                                <th className="text-xs font-black uppercase tracking-wider text-base-content/50 text-right">
                                    Apps
                                </th>
                                <th className="text-xs font-black uppercase tracking-wider text-base-content/50 text-right">
                                    Interview
                                </th>
                                <th className="text-xs font-black uppercase tracking-wider text-base-content/50 text-right">
                                    Offer
                                </th>
                                <th className="text-xs font-black uppercase tracking-wider text-base-content/50 text-right">
                                    Hired
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {sorted.slice(0, 8).map((role) => (
                                <tr key={role.id} className="hover">
                                    <td>
                                        <Link
                                            href={`/portal/roles?roleId=${role.id}`}
                                            className="text-sm font-semibold hover:text-primary transition-colors truncate max-w-[180px] block"
                                        >
                                            {role.title}
                                        </Link>
                                    </td>
                                    <td className="text-sm tabular-nums text-right font-semibold">
                                        {role.applications_count}
                                    </td>
                                    <td className="text-sm tabular-nums text-right text-base-content/60">
                                        {role.interview_count}
                                    </td>
                                    <td className="text-sm tabular-nums text-right text-base-content/60">
                                        {role.offer_count}
                                    </td>
                                    <td className="text-sm tabular-nums text-right font-semibold text-success">
                                        {role.hire_count}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </BaselChartCard>
    );
}
