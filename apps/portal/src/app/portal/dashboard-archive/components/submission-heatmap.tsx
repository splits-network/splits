'use client';

import { useMemo } from 'react';
import { useSubmissionHeatmap, HeatmapDay } from '../hooks/use-submission-heatmap';
import { ACCENT, accentAt } from './accent';

interface SubmissionHeatmapProps {
    trendPeriod?: number;
    refreshKey?: number;
}

const DAY_LABELS = ['M', '', 'W', '', 'F', '', ''];

function getLevel(count: number, max: number): number {
    if (count === 0) return 0;
    if (max <= 0) return 1;
    const ratio = count / max;
    if (ratio <= 0.25) return 1;
    if (ratio <= 0.5) return 2;
    if (ratio <= 0.75) return 3;
    return 4;
}

// Memphis heatmap uses accent-based colors instead of opacity scales
const LEVEL_CLASSES = [
    'bg-dark/10',       // 0: empty
    'bg-teal/25',       // 1: low
    'bg-teal/50',       // 2: medium-low
    'bg-teal/75',       // 3: medium-high
    'bg-teal',          // 4: high
];

interface WeekColumn {
    days: (HeatmapDay & { level: number; dayOfWeek: number })[];
    monthLabel?: string;
}

export default function SubmissionHeatmap({ trendPeriod = 6 }: SubmissionHeatmapProps) {
    const { days, loading, error } = useSubmissionHeatmap(trendPeriod);

    const { weeks, total } = useMemo(() => {
        if (!days.length) return { weeks: [] as WeekColumn[], total: 0 };

        const maxCount = Math.max(...days.map(d => d.count));
        const totalCount = days.reduce((sum, d) => sum + d.count, 0);

        const weekCols: WeekColumn[] = [];
        let currentWeek: WeekColumn['days'] = [];

        for (const day of days) {
            const date = new Date(day.date + 'T00:00:00');
            const dow = (date.getDay() + 6) % 7;

            if (dow === 0 && currentWeek.length > 0) {
                weekCols.push({ days: currentWeek });
                currentWeek = [];
            }

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
        return (
            <div className="h-32 flex items-center justify-center">
                <div className="w-8 h-8 border-4 border-dark/20 border-t-teal animate-spin" />
            </div>
        );
    }

    if (error || days.length === 0) {
        return (
            <div className="h-32 flex items-center justify-center text-dark/30">
                <div className="text-center">
                    <i className="fa-duotone fa-regular fa-fire-flame-curved text-xl mb-1" />
                    <p className="text-[10px] font-black uppercase tracking-wider">No data</p>
                </div>
            </div>
        );
    }

    return (
        <div>
            <div className="flex justify-end mb-1">
                <span className="text-[10px] font-bold tabular-nums text-dark/40">
                    {total} submissions
                </span>
            </div>

            <div className="overflow-x-auto">
                <div className="flex gap-[3px] min-w-0 pt-4">
                    {/* Day labels */}
                    <div className="flex flex-col gap-[3px] pr-1 shrink-0">
                        {DAY_LABELS.map((label, i) => (
                            <div
                                key={i}
                                className="h-[14px] w-4 text-[8px] font-bold text-dark/30 flex items-center justify-end"
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
                                    <div className="absolute -top-4 left-0 text-[8px] font-bold text-dark/30 whitespace-nowrap uppercase">
                                        {week.monthLabel}
                                    </div>
                                )}
                                {week.days.map((day, di) => (
                                    <div
                                        key={di}
                                        className={`h-[14px] w-[14px] transition-colors ${
                                            day.level < 0 ? 'bg-transparent' : LEVEL_CLASSES[day.level]
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
            <div className="flex items-center justify-end gap-1.5 mt-2">
                <span className="text-[8px] font-bold uppercase text-dark/30">Less</span>
                {LEVEL_CLASSES.map((cls, i) => (
                    <div key={i} className={`h-[10px] w-[10px] ${cls}`} />
                ))}
                <span className="text-[8px] font-bold uppercase text-dark/30">More</span>
            </div>
        </div>
    );
}