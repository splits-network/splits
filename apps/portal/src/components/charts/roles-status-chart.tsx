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
import type { Job } from "../../app/portal/roles/types";
import { ChartLoadingState } from "@splits-network/shared-ui";

/** Resolve DaisyUI v5 CSS variable to computed color string. */
function resolveCssColor(varName: string, fallback: string): string {
    if (typeof window === "undefined") return fallback;
    const val = getComputedStyle(document.documentElement).getPropertyValue(varName).trim();
    return val || fallback;
}

/** Convert a color to rgba with alpha. Handles hex and oklch formats. */
function hexWithAlpha(color: string, alpha: number): string {
    if (color.startsWith("#")) {
        const hex = color.slice(1);
        const r = parseInt(hex.substring(0, 2), 16);
        const g = parseInt(hex.substring(2, 4), 16);
        const b = parseInt(hex.substring(4, 6), 16);
        return `rgba(${r}, ${g}, ${b}, ${alpha})`;
    }
    if (color.includes(")")) {
        return color.replace(")", ` / ${alpha})`);
    }
    return color;
}

function useBaselChartColors() {
    return {
        primary: resolveCssColor("--color-primary", "#233876"),
        success: resolveCssColor("--color-success", "#16a34a"),
        warning: resolveCssColor("--color-warning", "#d97706"),
        info: resolveCssColor("--color-info", "#0ea5e9"),
        neutral: resolveCssColor("--color-neutral", "#18181b"),
        baseContent: resolveCssColor("--color-base-content", "#18181b"),
        base200: resolveCssColor("--color-base-200", "#f4f4f5"),
        base300: resolveCssColor("--color-base-300", "#e4e4e7"),
    };
}

// Register Chart.js components
ChartJS.register(ArcElement, Tooltip, Legend);

interface RolesStatusChartProps {
    jobs: Job[];
    loading?: boolean;
}

export function RolesStatusChart({ jobs, loading }: RolesStatusChartProps) {
    const colors = useBaselChartColors();
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
                        colors.success,
                        colors.warning,
                        colors.info,
                        colors.neutral,
                    ],
                    borderColor: [
                        hexWithAlpha(colors.success, 0.8),
                        hexWithAlpha(colors.warning, 0.8),
                        hexWithAlpha(colors.info, 0.8),
                        hexWithAlpha(colors.neutral, 0.8),
                    ],
                    borderWidth: 2,
                    hoverOffset: 8,
                },
            ],
        }),
        [statusCounts, colors],
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
                        color: colors.baseContent,
                    },
                },
                tooltip: {
                    backgroundColor: colors.base200,
                    titleColor: colors.baseContent,
                    bodyColor: colors.baseContent,
                    borderColor: colors.base300,
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
        [jobs.length, colors],
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
