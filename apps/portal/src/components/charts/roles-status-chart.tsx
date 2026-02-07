"use client";

import { useMemo, useRef, useEffect } from "react";
import {
    Chart as ChartJS,
    ArcElement,
    Tooltip,
    Legend,
    type TooltipItem,
} from "chart.js";
import { Doughnut } from "react-chartjs-2";
import { registerChart } from "./chart-options";
import type { Job } from "../../app/portal/roles/components/card";
import { ChartLoadingState } from "@splits-network/shared-ui";

// Register Chart.js components
ChartJS.register(ArcElement, Tooltip, Legend);

interface RolesStatusChartProps {
    jobs: Job[];
    loading?: boolean;
}

export function RolesStatusChart({ jobs, loading }: RolesStatusChartProps) {
    const chartRef = useRef<any>(null);

    // Register chart when it's created
    useEffect(() => {
        if (chartRef.current) {
            const cleanup = registerChart(chartRef.current);
            return cleanup;
        }
    }, []);

    // Calculate status counts
    const statusCounts = useMemo(() => {
        const counts = {
            active: 0,
            paused: 0,
            filled: 0,
            closed: 0,
        };

        jobs.forEach((job) => {
            const status = job.status?.toLowerCase() || "active";
            if (status in counts) {
                counts[status as keyof typeof counts]++;
            }
        });

        return counts;
    }, [jobs]);

    // Chart data configuration
    const chartData = useMemo(
        () => ({
            labels: ["Active", "Paused", "Filled", "Closed"],
            datasets: [
                {
                    data: [
                        statusCounts.active,
                        statusCounts.paused,
                        statusCounts.filled,
                        statusCounts.closed,
                    ],
                    backgroundColor: [
                        "oklch(var(--su))", // success - green for active
                        "oklch(var(--wa))", // warning - yellow for paused
                        "oklch(var(--in))", // info - blue for filled
                        "oklch(var(--n))", // neutral - gray for closed
                    ],
                    borderColor: [
                        "oklch(var(--su) / 0.8)",
                        "oklch(var(--wa) / 0.8)",
                        "oklch(var(--in) / 0.8)",
                        "oklch(var(--n) / 0.8)",
                    ],
                    borderWidth: 2,
                    hoverOffset: 8,
                },
            ],
        }),
        [statusCounts],
    );

    // Chart options
    const chartOptions = useMemo(
        () => ({
            responsive: true,
            maintainAspectRatio: false,
            cutout: "65%",
            plugins: {
                legend: {
                    display: true,
                    position: "bottom" as const,
                    labels: {
                        padding: 16,
                        usePointStyle: true,
                        pointStyle: "circle",
                        font: {
                            size: 12,
                            family: "inherit",
                        },
                        color: "oklch(var(--bc))",
                    },
                },
                tooltip: {
                    backgroundColor: "oklch(var(--b2))",
                    titleColor: "oklch(var(--bc))",
                    bodyColor: "oklch(var(--bc))",
                    borderColor: "oklch(var(--b3))",
                    borderWidth: 1,
                    padding: 12,
                    cornerRadius: 8,
                    displayColors: true,
                    callbacks: {
                        label: function (tooltipItem: TooltipItem<"doughnut">) {
                            const total = jobs.length;
                            const raw = tooltipItem.raw as number | undefined;
                            const value = raw ?? 0;
                            const percentage =
                                total > 0
                                    ? ((value / total) * 100).toFixed(1)
                                    : "0.0";
                            const label = tooltipItem.label ?? "";
                            return `${label}: ${value} (${percentage}%)`;
                        },
                    },
                },
            },
            animation: {
                animateRotate: true,
                animateScale: true,
            },
        }),
        [jobs.length],
    );

    // Loading state
    if (loading) {
        return <ChartLoadingState height="12rem" />;
    }

    // Empty state
    if (jobs.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center h-48 text-base-content/60">
                <i className="fa-duotone fa-regular fa-chart-pie text-3xl mb-2"></i>
                <p className="text-sm">No data to display</p>
            </div>
        );
    }

    // Calculate the dominant status for center text
    const totalJobs = jobs.length;
    const activePercentage =
        totalJobs > 0 ? Math.round((statusCounts.active / totalJobs) * 100) : 0;

    return (
        <div className="relative">
            <div className="h-48">
                <Doughnut
                    ref={chartRef}
                    data={chartData}
                    options={chartOptions}
                />
            </div>
            {/* Center text overlay */}
            <div
                className="absolute inset-0 flex items-center justify-center pointer-events-none"
                style={{ marginBottom: "40px" }}
            >
                <div className="text-center">
                    <div className="text-2xl font-bold text-base-content">
                        {totalJobs}
                    </div>
                    <div className="text-xs text-base-content/60">
                        Total Roles
                    </div>
                </div>
            </div>
        </div>
    );
}
