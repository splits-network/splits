'use client';

import Link from 'next/link';

export interface StatCardProps {
    /** Main stat value (number or formatted string) */
    value: string | number;
    /** Title/label describing the stat */
    title: string;
    /** Optional description/subtitle */
    description?: string;
    /** FontAwesome icon class (e.g., 'fa-briefcase') */
    icon?: string;
    /** Icon color variant */
    color?: 'primary' | 'secondary' | 'accent' | 'success' | 'warning' | 'error' | 'info';
    /** Trend percentage (positive = green, negative = red) */
    trend?: number;
    /** Trend comparison label (e.g., 'vs last month') */
    trendLabel?: string;
    /** Optional link href - makes the card a clickable link */
    href?: string;
    /** Optional click handler */
    onClick?: () => void;
    /** Additional CSS classes */
    className?: string;
    /** Loading state */
    loading?: boolean;
}

const statColorClasses = {
    primary: 'text-primary',
    secondary: 'text-secondary',
    accent: 'text-accent',
    success: 'text-success',
    warning: 'text-warning',
    error: 'text-error',
    info: 'text-info',
};

const iconColorClasses = {
    primary: 'text-primary',
    secondary: 'text-secondary',
    accent: 'text-accent',
    success: 'text-success',
    warning: 'text-warning',
    error: 'text-error',
    info: 'text-info',
};

/**
 * StatCard - Uses DaisyUI stat component
 * 
 * Based on: https://daisyui.com/components/stat/
 * 
 * Features:
 * - Large value display with title
 * - Optional icon with colored background
 * - Trend indicator (+X% / -X%) with color coding
 * - Hover effect when clickable
 * - Loading skeleton state
 */
export function StatCard({
    value,
    title,
    description,
    icon,
    color = 'primary',
    trend,
    trendLabel,
    href,
    onClick,
    className = '',
    loading = false,
}: StatCardProps) {
    if (loading) {
        return (
            <div className={`stat ${className}`}>
                <div className="animate-pulse">
                    <div className="stat-figure text-base-300">
                        <div className="w-8 h-8 bg-base-300 rounded-full"></div>
                    </div>
                    <div className="stat-title">
                        <div className="h-4 bg-base-300 rounded w-20"></div>
                    </div>
                    <div className="stat-value">
                        <div className="h-8 bg-base-300 rounded w-16 mt-1"></div>
                    </div>
                    <div className="stat-desc">
                        <div className="h-3 bg-base-300 rounded w-24 mt-1"></div>
                    </div>
                </div>
            </div>
        );
    }

    const trendIsPositive = trend !== undefined && trend >= 0;
    const trendColor = trendIsPositive ? 'text-success' : 'text-error';
    const trendArrow = trendIsPositive ? '↗︎' : '↘︎';

    const statContent = (
        <>
            {icon && (
                <div className={`stat-figure ${iconColorClasses[color]}`}>
                    <i className={`fa-solid ${icon} text-3xl`}></i>
                </div>
            )}
            <div className="stat-title">{title}</div>
            <div className={`stat-value ${statColorClasses[color]}`}>{value}</div>
            {(description || trend !== undefined) && (
                <div className="stat-desc">
                    {trend !== undefined && (
                        <span className={trendColor}>
                            {trendArrow} {Math.abs(trend)}%
                        </span>
                    )}
                    {(trendLabel || description) && (
                        <span className="ml-1">
                            {trendLabel || description}
                        </span>
                    )}
                </div>
            )}
        </>
    );

    const interactiveClasses = (href || onClick)
        ? 'hover:bg-base-200 transition-colors cursor-pointer'
        : '';

    // If href is provided, wrap in a Link
    if (href) {
        return (
            <Link href={href} className="block">
                <div
                    className={`stat ${interactiveClasses} ${className}`}
                >
                    {statContent}
                </div>
            </Link>
        );
    }

    return (
        <div
            className={`stat ${interactiveClasses} ${className}`}
            onClick={onClick}
            role={onClick ? 'button' : undefined}
            tabIndex={onClick ? 0 : undefined}
        >
            {statContent}
        </div>
    );
}
