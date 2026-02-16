import React from 'react';
import type { AccentColor } from '../utils/accent-cycle';

export interface ToggleProps {
    /** Whether the toggle is on */
    enabled: boolean;
    /** Change handler */
    onChange: (value: boolean) => void;
    /** Accent color when enabled */
    accent?: AccentColor;
    /** Custom class name */
    className?: string;
}

/**
 * Toggle - Memphis toggle switch
 *
 * Uses .toggle CSS class from toggle.css with color variants.
 * The CSS handles the knob, transitions, and checked/unchecked states automatically.
 */
export function Toggle({
    enabled,
    onChange,
    accent = 'teal',
    className = '',
}: ToggleProps) {
    const colorClass = `toggle-${accent}`;

    return (
        <input
            type="checkbox"
            checked={enabled}
            onChange={(e) => onChange(e.target.checked)}
            className={['toggle', colorClass, className].filter(Boolean).join(' ')}
        />
    );
}
