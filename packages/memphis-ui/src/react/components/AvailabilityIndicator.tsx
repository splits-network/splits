import React from 'react';

export interface AvailabilityIndicatorProps {
    /** Whether the person is available */
    available: boolean;
    /** Label text */
    label?: string;
    /** Description text */
    description?: string;
    /** Custom class name */
    className?: string;
}

/**
 * AvailabilityIndicator - Availability status dot with label
 *
 * Memphis compliant availability indicator with colored dot and text.
 * Extracted from profiles-six showcase.
 */
export function AvailabilityIndicator({
    available,
    label,
    description,
    className = '',
}: AvailabilityIndicatorProps) {
    const accentClass = available ? 'accent-teal' : 'accent-coral';
    const defaultLabel = available ? 'Currently Available' : 'Unavailable';

    return (
        <div className={[accentClass, className].filter(Boolean).join(' ')}>
            <div className="flex items-center gap-2 mb-2">
                <div
                    className="w-3 h-3 rounded-full bg-accent"
                />
                <span className="text-sm font-bold text-accent">
                    {label || defaultLabel}
                </span>
            </div>
            {description && (
                <p className="text-sm text-dark opacity-50">
                    {description}
                </p>
            )}
        </div>
    );
}
