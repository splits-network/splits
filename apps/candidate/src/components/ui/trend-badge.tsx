'use client';

export interface TrendBadgeProps {
    /** Trend value (positive = up, negative = down, 0 = neutral) */
    value: number;
    /** Format as percentage (adds % suffix) */
    percentage?: boolean;
    /** Show arrow icon */
    showIcon?: boolean;
    /** Size variant */
    size?: 'xs' | 'sm' | 'md';
    /** Additional comparison text (e.g., 'vs last month') */
    label?: string;
    /** Override color - useful for cases where up is bad */
    invertColors?: boolean;
    /** Additional CSS classes */
    className?: string;
}

const sizeClasses = {
    xs: 'text-xs gap-0.5',
    sm: 'text-sm gap-1',
    md: 'text-base gap-1',
};

/**
 * TrendBadge - Displays trend indicator with color coding
 * 
 * Features:
 * - Positive values shown in green with up arrow
 * - Negative values shown in red with down arrow
 * - Zero/neutral shown in gray
 * - Optional percentage formatting
 * - Optional comparison label
 */
export function TrendBadge({
    value,
    percentage = true,
    showIcon = true,
    size = 'sm',
    label,
    invertColors = false,
    className = '',
}: TrendBadgeProps) {
    const isPositive = value > 0;
    const isNegative = value < 0;
    const isNeutral = value === 0;

    // Determine colors (can be inverted for metrics where down is good)
    let colorClass: string;
    if (isNeutral) {
        colorClass = 'text-base-content/50';
    } else if (invertColors) {
        colorClass = isPositive ? 'text-error' : 'text-success';
    } else {
        colorClass = isPositive ? 'text-success' : 'text-error';
    }

    // Determine icon
    let icon: string;
    if (isNeutral) {
        icon = 'fa-minus';
    } else {
        icon = isPositive ? 'fa-arrow-up' : 'fa-arrow-down';
    }

    const displayValue = Math.abs(value);
    const formattedValue = percentage ? `${displayValue}%` : displayValue.toLocaleString();

    return (
        <span className={`inline-flex items-center font-medium ${colorClass} ${sizeClasses[size]} ${className}`}>
            {showIcon && (
                <i className={`fa-solid ${icon} text-[0.75em]`}></i>
            )}
            <span>{isPositive ? '+' : isNegative ? '-' : ''}{formattedValue}</span>
            {label && (
                <span className="text-base-content/50 font-normal ml-1">{label}</span>
            )}
        </span>
    );
}
