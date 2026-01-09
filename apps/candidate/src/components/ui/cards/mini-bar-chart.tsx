'use client';

export interface MiniBarChartProps {
    /** Data values */
    data: number[];
    /** Labels for each bar */
    labels?: string[];
    /** Highlight index */
    highlightIndex?: number;
    /** Bar color */
    color?: 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'info';
    /** Height in pixels */
    height?: number;
}

export function MiniBarChart({
    data,
    labels,
    highlightIndex,
    color = 'primary',
    height = 80
}: MiniBarChartProps) {
    const max = Math.max(...data);

    const colorClass = {
        primary: 'bg-primary',
        secondary: 'bg-secondary',
        success: 'bg-success',
        warning: 'bg-warning',
        error: 'bg-error',
        info: 'bg-info',
    }[color];

    return (
        <div className="py-3">
            <div className="flex items-end justify-between gap-1" style={{ height }}>
                {data.map((value, index) => {
                    const heightPercent = max > 0 ? (value / max) * 100 : 0;
                    const isHighlighted = index === highlightIndex;

                    return (
                        <div key={index} className="flex-1 flex flex-col items-center gap-1">
                            <div
                                className={`w-full rounded-t-md transition-all ${isHighlighted
                                    ? colorClass
                                    : 'bg-base-300'
                                    }`}
                                style={{ height: `${heightPercent}%`, minHeight: value > 0 ? 4 : 0 }}
                            />
                        </div>
                    );
                })}
            </div>
            {labels && (
                <div className="flex justify-between mt-2">
                    {labels.map((label, index) => (
                        <span
                            key={index}
                            className={`text-xs flex-1 text-center ${index === highlightIndex
                                ? 'font-medium text-base-content'
                                : 'text-base-content/50'
                                }`}
                        >
                            {label}
                        </span>
                    ))}
                </div>
            )}
        </div>
    );
}
