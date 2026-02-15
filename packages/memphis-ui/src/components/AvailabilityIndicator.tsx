import React from 'react';
import { ACCENT_HEX } from '../utils/accent-cycle';

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
    const color = available ? ACCENT_HEX.teal : ACCENT_HEX.coral;
    const defaultLabel = available ? 'Currently Available' : 'Unavailable';

    return (
        <div className={className}>
            <div className="flex items-center gap-2 mb-2">
                <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: color }}
                />
                <span className="text-sm font-bold" style={{ color }}>
                    {label || defaultLabel}
                </span>
            </div>
            {description && (
                <p className="text-xs" style={{ color: '#1A1A2E', opacity: 0.5 }}>
                    {description}
                </p>
            )}
        </div>
    );
}
