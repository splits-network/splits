/**
 * Standardized LoadingSpinner component
 *
 * Usage guidelines from docs/guidance/loading-states-patterns.md:
 * - xs: Inline actions, icon buttons
 * - sm: Form buttons, submissions
 * - md: Modal/card content, charts
 * - lg: Full page loads, major sections
 *
 * @example
 * // Basic usage
 * <LoadingSpinner size="md" />
 *
 * @example
 * // With message
 * <LoadingSpinner size="lg" message="Loading candidates..." />
 *
 * @example
 * // Success state
 * <LoadingSpinner size="sm" color="success" />
 */

import type { SpinnerSize, SpinnerType, LoadingColor } from './types';

export interface LoadingSpinnerProps {
    /** Spinner size - defaults to 'md' */
    size?: SpinnerSize;
    /** Spinner type - defaults to 'spinner' (recommended) */
    type?: SpinnerType;
    /** Color variant - defaults to 'default' */
    color?: LoadingColor;
    /** Optional loading message */
    message?: string;
    /** Additional CSS classes */
    className?: string;
}

const sizeClasses: Record<SpinnerSize, string> = {
    xs: 'loading-xs',
    sm: 'loading-sm',
    md: 'loading-md',
    lg: 'loading-lg',
};

const typeClasses: Record<SpinnerType, string> = {
    spinner: 'loading-spinner',
    dots: 'loading-dots',
    ring: 'loading-ring',
    ball: 'loading-ball',
};

const colorClasses: Record<LoadingColor, string> = {
    default: '',
    primary: 'text-primary',
    secondary: 'text-secondary',
    accent: 'text-accent',
    success: 'text-success',
    info: 'text-info',
    warning: 'text-warning',
    error: 'text-error',
    white: 'text-white',
};

export function LoadingSpinner({
    size = 'md',
    type = 'spinner',
    color = 'default',
    message,
    className = '',
}: LoadingSpinnerProps) {
    const spinnerClasses = [
        'loading',
        typeClasses[type],
        sizeClasses[size],
        colorClasses[color],
        className,
    ]
        .filter(Boolean)
        .join(' ');

    if (message) {
        return (
            <div className="flex flex-col items-center gap-2">
                <span className={spinnerClasses}></span>
                <span className="text-base-content/70">{message}</span>
            </div>
        );
    }

    return <span className={spinnerClasses}></span>;
}
