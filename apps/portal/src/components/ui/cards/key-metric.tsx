'use client';

export interface KeyMetricProps {
    /** Metric label */
    label: string;
    /** Main value */
    value: string | number;
    /** Value color class */
    valueColor?: string;
    /** Change amount or percentage */
    change?: number;
    /** Whether change is a percentage */
    changeIsPercent?: boolean;
    /** Ring progress (0-100) */
    progress?: number;
    /** Progress color */
    progressColor?: 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'info';
}

export function KeyMetric({
    label,
    value,
    valueColor = 'primary',
    change,
    changeIsPercent = false,
    progress,
    progressColor = 'primary'
}: KeyMetricProps) {
    const changeColor = change !== undefined
        ? change >= 0 ? 'text-success' : 'text-error'
        : '';

    const progressColorClass = {
        primary: 'text-primary',
        secondary: 'text-secondary',
        success: 'text-success',
        warning: 'text-warning',
        error: 'text-error',
        info: 'text-info',
    }[progressColor];

    return (
        <div className="flex items-center justify-between py-3">
            <div>
                <div className="text-sm text-base-content/60 mb-1">{label}</div>
                <div className="flex items-baseline gap-2">
                    <span className={`text-3xl font-bold tabular-nums ${valueColor}`}>{value}</span>
                    {change !== undefined && (
                        <span className={`text-sm font-medium ${changeColor}`}>
                            {change >= 0 ? '+' : ''}{change}{changeIsPercent ? '%' : ''}
                        </span>
                    )}
                </div>
            </div>
            {progress !== undefined && (
                <div className={`radial-progress ${progressColorClass}`} style={{ '--value': progress, '--size': '3.5rem', '--thickness': '4px' } as React.CSSProperties} role="progressbar">
                    <span className="text-xs font-semibold">{progress}%</span>
                </div>
            )}
        </div>
    );
}
