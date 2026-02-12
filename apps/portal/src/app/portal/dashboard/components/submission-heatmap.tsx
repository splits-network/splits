'use client';

import { useMemo } from 'react';
import { useSubmissionHeatmap, HeatmapDay } from '../hooks/use-submission-heatmap';
import { ChartLoadingState } from '@splits-network/shared-ui';

interface SubmissionHeatmapProps {
    trendPeriod?: number;
    refreshKey?: number;
    height?: number;
}

const DAY_LABELS = ['Mon', '', 'Wed', '', 'Fri', '', ''];

/** Map count to intensity level 0-4 */
function getLevel(count: number, max: number): number {
    if (count === 0) return 0;
    if (max <= 0) return 1;
    const ratio = count / max;
    if (ratio <= 0.25) return 1;
    if (ratio <= 0.5) return 2;
    if (ratio <= 0.75) return 3;
    return 4;
}

const LEVEL_CLASSES = [
    'bg-base-300/50',       // 0: empty
    'bg-info/20',           // 1: low
    'bg-info/40',           // 2: medium-low
    'bg-info/65',           // 3: medium-high
    'bg-info',              // 4: high
];

interface WeekColumn {
    days: (HeatmapDay & { level: number; dayOfWeek: number })[];
    monthLabel?: string;
}

export default function SubmissionHeatmap({ trendPeriod = 6, refreshKey, height = 140 }: SubmissionHeatmapProps) {
    const { days, loading, error } = useSubmissionHeatmap(trendPeriod);

    const { weeks, total } = useMemo(() => {
        if (!days.length) return { weeks: [] as WeekColumn[], total: 0 };

        const maxCount = Math.max(...days.map(d => d.count));
        const totalCount = days.reduce((sum, d) => sum + d.count, 0);

        // Group days into week columns (Mon=0 ... Sun=6)
        const weekCols: WeekColumn[] = [];
        let currentWeek: WeekColumn['days'] = [];

        for (const day of days) {
            const date = new Date(day.date + 'T00:00:00');
            const dow = (date.getDay() + 6) % 7; // Monday=0

            // Start a new week on Monday
            if (dow === 0 && currentWeek.length > 0) {
                weekCols.push({ days: currentWeek });
                currentWeek = [];
            }

            // Pad leading empty days for the first week
            if (currentWeek.length === 0 && weekCols.length === 0) {
                for (let i = 0; i < dow; i++) {
                    currentWeek.push({ date: '', count: 0, level: -1, dayOfWeek: i });
                }
            }

            currentWeek.push({
                ...day,
                level: getLevel(day.count, maxCount),
                dayOfWeek: dow,
            });
        }
        if (currentWeek.length > 0) {
            weekCols.push({ days: currentWeek });
        }

        // Assign month labels to the first week column of each month
        for (const week of weekCols) {
            for (const day of week.days) {
                if (day.date) {
                    const date = new Date(day.date + 'T00:00:00');
                    if (date.getDate() <= 7 && day.dayOfWeek <= 1) {
                        if (!week.monthLabel) {
                            week.monthLabel = date.toLocaleDateString('en-US', { month: 'short' });
                        }
                    }
                }
            }
        }

        return { weeks: weekCols, total: totalCount };
    }, [days]);

    if (loading) {
        return <ChartLoadingState height={height} />;
    }

    if (error || days.length === 0) {
        return (
            <div style={{ height }} className="flex items-center justify-center text-base-content/50">
                <div className="text-center">
                    <i className="fa-duotone fa-regular fa-fire-flame-curved fa-2x mb-1 opacity-20"></i>
                    <p className="text-xs">No submission data</p>
                </div>
            </div>
        );
    }

    return (
        <div style={{ minHeight: height }}>
            {/* Total count label */}
            <div className="flex justify-end mb-1">
                <span className="text-[10px] text-base-content/40 tabular-nums">{total} submissions</span>
            </div>

            <div className="overflow-x-auto">
                <div className="flex gap-[3px] min-w-0 pt-4">
                    {/* Day-of-week labels */}
                    <div className="flex flex-col gap-[3px] pr-1 shrink-0">
                        {DAY_LABELS.map((label, i) => (
                            <div
                                key={i}
                                className="h-[14px] w-6 text-[9px] text-base-content/40 flex items-center justify-end leading-none"
                            >
                                {label}
                            </div>
                        ))}
                    </div>

                    {/* Week columns */}
                    <div className="flex gap-[3px] overflow-hidden">
                        {weeks.map((week, wi) => (
                            <div key={wi} className="flex flex-col gap-[3px] relative">
                                {week.monthLabel && (
                                    <div className="absolute -top-4 left-0 text-[9px] text-base-content/40 whitespace-nowrap">
                                        {week.monthLabel}
                                    </div>
                                )}
                                {week.days.map((day, di) => (
                                    <div
                                        key={di}
                                        className={`h-[14px] w-[14px] rounded-sm transition-colors ${
                                            day.level < 0
                                                ? 'bg-transparent'
                                                : LEVEL_CLASSES[day.level]
                                        }`}
                                        title={day.date ? `${day.date}: ${day.count} submission${day.count !== 1 ? 's' : ''}` : ''}
                                    />
                                ))}
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Legend */}
            <div className="flex items-center justify-end gap-1.5 mt-2 text-[10px] text-base-content/40">
                <span>Less</span>
                {LEVEL_CLASSES.map((cls, i) => (
                    <div key={i} className={`h-[10px] w-[10px] rounded-sm ${cls}`} />
                ))}
                <span>More</span>
            </div>
        </div>
    );
}
