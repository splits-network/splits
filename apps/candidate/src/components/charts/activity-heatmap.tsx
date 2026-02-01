'use client';

import { useMemo, useRef, useEffect, useState } from 'react';

interface Application {
    id: string;
    created_at: string;
}

interface ActivityHeatmapProps {
    applications: Application[];
    loading?: boolean;
}

interface DayData {
    date: Date;
    count: number;
    dayOfWeek: number;
    weekIndex: number;
}

// Generate last N days
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

// Check if two dates are the same day
function isSameDay(date1: Date, date2: Date): boolean {
    return (
        date1.getFullYear() === date2.getFullYear() &&
        date1.getMonth() === date2.getMonth() &&
        date1.getDate() === date2.getDate()
    );
}

// Get color intensity based on count
function getIntensityColor(count: number): string {
    if (count === 0) return 'bg-base-300';
    if (count === 1) return 'bg-primary/20';
    if (count === 2) return 'bg-primary/40';
    if (count === 3) return 'bg-primary/60';
    if (count === 4) return 'bg-primary/80';
    return 'bg-primary'; // 5+
}

export default function ActivityHeatmap({
    applications,
    loading,
}: ActivityHeatmapProps) {
    const containerRef = useRef<HTMLDivElement>(null);
    const [numDays, setNumDays] = useState(120); // Default to 120 days

    // Dynamically calculate number of days based on container width
    useEffect(() => {
        const updateDays = () => {
            if (!containerRef.current) return;

            const containerWidth = containerRef.current.offsetWidth;
            // Cell width: 12px (w-3), gap: 2px (gap-0.5), day labels: 16px, padding: 8px
            const availableWidth = containerWidth - 16 - 8; // Subtract day labels and padding
            const cellWidth = 12; // w-3
            const gap = 2; // gap-0.5
            const cellPlusGap = cellWidth + gap;

            // Calculate number of weeks that can fit
            const numWeeks = Math.floor(availableWidth / cellPlusGap);

            // Convert to days (weeks * 7), with min 30 and max 180
            const calculatedDays = Math.min(Math.max(numWeeks * 7, 30), 180);

            setNumDays(calculatedDays);
        };

        // Initial calculation
        updateDays();

        // Observe container size changes
        const resizeObserver = new ResizeObserver(updateDays);
        if (containerRef.current) {
            resizeObserver.observe(containerRef.current);
        }

        return () => {
            resizeObserver.disconnect();
        };
    }, []);

    // Calculate activity data
    const activityData = useMemo(() => {
        const days = getLastNDays(numDays);
        const dayDataMap: DayData[] = days.map((date, index) => {
            const count = applications.filter(app => {
                const appDate = new Date(app.created_at);
                return isSameDay(appDate, date);
            }).length;

            return {
                date,
                count,
                dayOfWeek: date.getDay(),
                weekIndex: Math.floor(index / 7),
            };
        });

        // Group by weeks for grid layout
        const weeks: DayData[][] = [];
        let currentWeek: DayData[] = [];

        // Pad the first week if it doesn't start on Sunday
        const firstDay = dayDataMap[0];
        for (let i = 0; i < firstDay.dayOfWeek; i++) {
            currentWeek.push({
                date: new Date(0),
                count: -1, // Indicator for empty cell
                dayOfWeek: i,
                weekIndex: 0,
            });
        }

        dayDataMap.forEach((day, index) => {
            currentWeek.push(day);
            if (currentWeek.length === 7 || index === dayDataMap.length - 1) {
                // Pad last week if needed
                while (currentWeek.length < 7) {
                    currentWeek.push({
                        date: new Date(0),
                        count: -1,
                        dayOfWeek: currentWeek.length,
                        weekIndex: Math.floor(index / 7),
                    });
                }
                weeks.push(currentWeek);
                currentWeek = [];
            }
        });

        const totalApplications = dayDataMap.reduce((sum, day) => sum + day.count, 0);
        const maxInDay = Math.max(...dayDataMap.map(d => d.count), 0);

        return { weeks, totalApplications, maxInDay };
    }, [applications, numDays]);

    // Get month labels for the weeks
    const monthLabels = useMemo(() => {
        const labels: string[] = [];
        activityData.weeks.forEach(week => {
            const firstValidDay = week.find(d => d.count !== -1);
            if (firstValidDay) {
                const month = firstValidDay.date.toLocaleDateString('en-US', { month: 'short' });
                labels.push(month);
            } else {
                labels.push('');
            }
        });
        // Only show month label on the first week of each month
        return labels.map((label, index) => {
            if (index === 0) return label;
            return labels[index] !== labels[index - 1] ? label : '';
        });
    }, [activityData.weeks]);

    // Loading state
    if (loading) {
        return (
            <div className="flex items-center justify-center h-32">
                <span className="loading loading-spinner loading-sm text-primary"></span>
            </div>
        );
    }

    return (
        <div ref={containerRef} className="space-y-2">
            {/* Header */}
            <div className="flex items-center justify-between">
                <h3 className="text-sm font-medium text-base-content/80">Activity ({numDays} days)</h3>
                <span className="text-xs text-base-content/50">
                    {activityData.totalApplications} apps
                </span>
            </div>

            {/* Month labels */}
            <div className="flex gap-0.5 w-full">
                <div className="flex-shrink-0" style={{ width: '16px' }}></div>
                <div className="flex gap-0.5 flex-1">
                    {monthLabels.map((label, index) => (
                        <div key={index} className="flex-1 text-[8px] text-base-content/50 text-center">
                            {label}
                        </div>
                    ))}
                </div>
            </div>

            {/* Heatmap grid - transposed (days vertical, weeks horizontal) */}
            <div className="flex gap-2 w-full">
                {/* Day labels */}
                <div className="flex flex-col gap-0.5 text-[9px] text-base-content/50 justify-between pt-0.5 flex-shrink-0">
                    <span>S</span>
                    <span>M</span>
                    <span>T</span>
                    <span>W</span>
                    <span>T</span>
                    <span>F</span>
                    <span>S</span>
                </div>

                {/* Grid - fills remaining space */}
                <div className="flex gap-0.5 flex-1">
                    {activityData.weeks.map((week, weekIndex) => (
                        <div key={weekIndex} className="flex flex-col gap-0.5 flex-1 min-w-0">
                            {week.map((day, dayIndex) => {
                                if (day.count === -1) {
                                    // Empty cell
                                    return <div key={dayIndex} className="w-full aspect-square"></div>;
                                }

                                const formattedDate = day.date.toLocaleDateString('en-US', {
                                    month: 'short',
                                    day: 'numeric',
                                });

                                return (
                                    <div
                                        key={dayIndex}
                                        className={`w-full aspect-square rounded-sm ${getIntensityColor(day.count)} transition-all hover:ring-1 hover:ring-primary cursor-pointer`}
                                        title={`${formattedDate}: ${day.count} application${day.count !== 1 ? 's' : ''}`}
                                    />
                                );
                            })}
                        </div>
                    ))}
                </div>
            </div>

            {/* Legend */}
            <div className="flex items-center justify-center gap-1.5 text-[9px] text-base-content/50 mt-2">
                <span>Less</span>
                <div className="flex gap-0.5">
                    <div className="w-2.5 h-2.5 rounded-sm bg-base-300"></div>
                    <div className="w-2.5 h-2.5 rounded-sm bg-primary/20"></div>
                    <div className="w-2.5 h-2.5 rounded-sm bg-primary/40"></div>
                    <div className="w-2.5 h-2.5 rounded-sm bg-primary/60"></div>
                    <div className="w-2.5 h-2.5 rounded-sm bg-primary/80"></div>
                    <div className="w-2.5 h-2.5 rounded-sm bg-primary"></div>
                </div>
                <span>More</span>
            </div>

            {/* Stats */}
            {activityData.maxInDay > 0 && (
                <div className="text-[10px] text-base-content/60 mt-1.5">
                    Most active: <span className="font-medium text-base-content">{activityData.maxInDay} apps/day</span>
                </div>
            )}
        </div>
    );
}
