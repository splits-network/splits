import React from 'react';
import type { AccentColor } from '../utils/accent-cycle';

export interface CheckboxProps {
    /** Whether the checkbox is checked */
    checked: boolean;
    /** Change handler */
    onChange: (checked: boolean) => void;
    /** Label content */
    children?: React.ReactNode;
    /** Accent color when checked */
    color?: AccentColor;
    /** Whether the checkbox is in an error state */
    error?: boolean;
    /** Additional className */
    className?: string;
}

/**
 * Checkbox - Memphis-styled checkbox with label
 *
 * Uses .checkbox CSS class from checkbox.css with color variants.
 * The CSS handles all visual states (checked, unchecked, disabled) automatically.
 */
export function Checkbox({
    checked,
    onChange,
    children,
    color = 'teal',
    error = false,
    className = '',
}: CheckboxProps) {
    const colorClass = `checkbox-${color}`;

    return (
        <label className={['flex items-center gap-2 cursor-pointer', className].filter(Boolean).join(' ')}>
            <input
                type="checkbox"
                checked={checked}
                onChange={(e) => onChange(e.target.checked)}
                className={['checkbox', colorClass, error ? 'checkbox-error' : ''].filter(Boolean).join(' ')}
            />
            {children && (
                <span className="text-sm font-semibold text-dark">{children}</span>
            )}
        </label>
    );
}
