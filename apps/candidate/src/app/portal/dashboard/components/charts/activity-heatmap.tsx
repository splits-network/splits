"use client";

import { useMemo, useState, useCallback } from "react";
import { ChartLoadingState } from "@splits-network/shared-ui";
import {
    useBaselChartColors,
    hexWithAlpha,
} from "@/components/basel/charts";

interface Application {
    id: string;
    created_at: string;
}

interface ActivityHeatmapProps {
    applications: Application[];
    loading?: boolean;
    compact?: boolean;
}

interface DayData {
    date: Date;
    count: number;
    dayOfWeek: number;
}

function getLastNDays(numDays: number): Date[] {
    const days: Date[] = [];
    const today = new Date();
    for (let i = numDays - 1; i >= 0; i--) {
        const date = new Date(today);
        date.setDate(date.getDate() - i);
        date.setHours(0, 0, 0, 0);
        days.push(date);
    }
    return days;
}

function isSameDay(date1: Date, date2: Date): boolean {
    return (
        date1.getFullYear() === date2.getFullYear() &&
        date1.getMonth() === date2.getMonth() &&
        date1.getDate() === date2.getDate()
    );
}

const DAY_LABELS = ["S", "M", "T", "W", "T", "F", "S"];
const NUM_DAYS = 120;
const CELL = 11;
const GAP = 2;
const LABEL_W = 16;
const HEADER_H = 14;

function getIntensityFill(
    count: number,
    maxCount: number,
    primary: string,
    base300: string,
): string {
    if (count === 0) return base300;
    const ratio = count / Math.max(maxCount, 1);
    if (ratio <= 0.2) return hexWithAlpha(primary, 0.2);
    if (ratio <= 0.4) return hexWithAlpha(primary, 0.4);
    if (ratio <= 0.6) return hexWithAlpha(primary, 0.6);
    if (ratio <= 0.8) return hexWithAlpha(primary, 0.8);
    return primary;
}

export default function ActivityHeatmap({
    applications,
    loading,
}: ActivityHeatmapProps) {
    const colors = useBaselChartColors();
    const [tooltip, setTooltip] = useState<{
        x: number;
        y: number;
        text: string;
    } | null>(null);

    const activityData = useMemo(() => {
        const days = getLastNDays(NUM_DAYS);
        const dayDataMap: DayData[] = days.map((date) => ({
            date,
            count: applications.filter((app) =>
                isSameDay(new Date(app.created_at), date),
            ).length,
            dayOfWeek: date.getDay(),
        }));

        // Group by weeks
        const weeks: DayData[][] = [];
        let currentWeek: DayData[] = [];

        // Pad first week
        const firstDay = dayDataMap[0];
        for (let i = 0; i < firstDay.dayOfWeek; i++) {
            currentWeek.push({
                date: new Date(0),
                count: -1,
                dayOfWeek: i,
            });
        }

        dayDataMap.forEach((day, index) => {
            currentWeek.push(day);
            if (
                currentWeek.length === 7 ||
                index === dayDataMap.length - 1
            ) {
                while (currentWeek.length < 7) {
                    currentWeek.push({
                        date: new Date(0),
                        count: -1,
                        dayOfWeek: currentWeek.length,
                    });
                }
                weeks.push(currentWeek);
                currentWeek = [];
            }
        });

        const totalApplications = dayDataMap.reduce(
            (sum, d) => sum + d.count,
            0,
        );
        const maxInDay = Math.max(...dayDataMap.map((d) => d.count), 0);

        return { weeks, totalApplications, maxInDay };
    }, [applications]);

    // Month labels: first week where month changes
    const monthLabels = useMemo(() => {
        const result: { text: string; weekIndex: number }[] = [];
        let lastMonth = "";
        activityData.weeks.forEach((week, weekIndex) => {
            const firstValidDay = week.find((d) => d.count !== -1);
            if (firstValidDay) {
                const month = firstValidDay.date.toLocaleDateString(
                    "en-US",
                    { month: "short" },
                );
                if (month !== lastMonth) {
                    result.push({ text: month, weekIndex });
                    lastMonth = month;
                }
            }
        });
        return result;
    }, [activityData.weeks]);

    const handleMouseEnter = useCallback(
        (e: React.MouseEvent<SVGRectElement>, date: Date, count: number) => {
            const rect = e.currentTarget.getBoundingClientRect();
            const formattedDate = date.toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
            });
            setTooltip({
                x: rect.left + rect.width / 2,
                y: rect.top - 8,
                text: `${formattedDate}: ${count} app${count !== 1 ? "s" : ""}`,
            });
        },
        [],
    );

    const handleMouseLeave = useCallback(() => setTooltip(null), []);

    if (loading) {
        return <ChartLoadingState height={128} />;
    }

    const numWeeks = activityData.weeks.length;
    const svgWidth = LABEL_W + numWeeks * (CELL + GAP);
    const svgHeight = HEADER_H + 7 * (CELL + GAP);
    const labelColor = hexWithAlpha(colors.baseContent, 0.5);

    return (
        <div className="space-y-2">
            {/* SVG heatmap */}
            <div style={{ width: "100%", overflow: "hidden" }}>
                <svg
                    viewBox={`0 0 ${svgWidth} ${svgHeight}`}
                    preserveAspectRatio="xMinYMin meet"
                    width="100%"
                    style={{ display: "block" }}
                >
                    {/* Month labels */}
                    {monthLabels.map(({ text, weekIndex }) => (
                        <text
                            key={`month-${weekIndex}`}
                            x={
                                LABEL_W +
                                weekIndex * (CELL + GAP) +
                                CELL / 2
                            }
                            y={10}
                            textAnchor="middle"
                            style={{
                                fontSize: 7,
                                fontWeight: 500,
                                fill: labelColor,
                            }}
                        >
                            {text}
                        </text>
                    ))}

                    {/* Day labels */}
                    {DAY_LABELS.map((label, i) => (
                        <text
                            key={`day-${i}`}
                            x={8}
                            y={
                                HEADER_H +
                                i * (CELL + GAP) +
                                CELL / 2 +
                                3
                            }
                            textAnchor="middle"
                            style={{
                                fontSize: 7,
                                fontWeight: 500,
                                fill: labelColor,
                            }}
                        >
                            {label}
                        </text>
                    ))}

                    {/* Grid cells — sharp rectangles */}
                    {activityData.weeks.map((week, wi) =>
                        week.map((day, di) => {
                            if (day.count === -1) return null;
                            return (
                                <rect
                                    key={`${wi}-${di}`}
                                    x={LABEL_W + wi * (CELL + GAP)}
                                    y={HEADER_H + di * (CELL + GAP)}
                                    width={CELL}
                                    height={CELL}
                                    rx={0}
                                    fill={getIntensityFill(
                                        day.count,
                                        activityData.maxInDay,
                                        colors.primary,
                                        colors.base300,
                                    )}
                                    style={{ cursor: "pointer" }}
                                    onMouseEnter={(e) =>
                                        handleMouseEnter(
                                            e,
                                            day.date,
                                            day.count,
                                        )
                                    }
                                    onMouseLeave={handleMouseLeave}
                                />
                            );
                        }),
                    )}
                </svg>
            </div>

            {/* Basel tooltip — sharp corners, editorial */}
            {tooltip && (
                <div
                    className="fixed z-50 pointer-events-none"
                    style={{
                        left: tooltip.x,
                        top: tooltip.y,
                        transform: "translate(-50%, -100%)",
                    }}
                >
                    <div
                        className="bg-base-100 border border-base-content/15 text-base-content"
                        style={{
                            padding: "6px 10px",
                            borderRadius: 0,
                            fontSize: 11,
                            fontWeight: 600,
                            whiteSpace: "nowrap",
                        }}
                    >
                        {tooltip.text}
                    </div>
                </div>
            )}

            {/* Legend */}
            <div
                className="flex items-center justify-center gap-1.5 text-[9px] text-base-content/50"
                style={{ fontWeight: 500 }}
            >
                <span>Less</span>
                <svg width={66} height={10}>
                    <rect width={10} height={10} x={0} fill={colors.base300} />
                    <rect width={10} height={10} x={12} fill={hexWithAlpha(colors.primary, 0.2)} />
                    <rect width={10} height={10} x={24} fill={hexWithAlpha(colors.primary, 0.4)} />
                    <rect width={10} height={10} x={36} fill={hexWithAlpha(colors.primary, 0.6)} />
                    <rect width={10} height={10} x={48} fill={hexWithAlpha(colors.primary, 0.8)} />
                    <rect width={10} height={10} x={60} fill={colors.primary} />
                </svg>
                <span>More</span>
            </div>

            {/* Stats */}
            {activityData.maxInDay > 0 && (
                <div
                    className="text-[10px] text-base-content/60"
                    style={{ fontWeight: 500 }}
                >
                    Most active:{" "}
                    <span className="font-semibold text-base-content">
                        {activityData.maxInDay} apps/day
                    </span>
                </div>
            )}
        </div>
    );
}
