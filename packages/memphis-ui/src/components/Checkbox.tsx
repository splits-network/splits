import React from 'react';
import type { AccentColor } from '../utils/accent-cycle';
import { ACCENT_HEX } from '../utils/accent-cycle';

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

const COLORS = {
    dark: '#1A1A2E',
    coral: '#FF6B6B',
};

/**
 * Checkbox - Memphis-styled checkbox with label
 *
 * Square (no border-radius), thick border, fills with accent color when checked.
 * Extracted from auth-six showcase.
 */
export function Checkbox({
    checked,
    onChange,
    children,
    color = 'teal',
    error = false,
    className = '',
}: CheckboxProps) {
    const hex = ACCENT_HEX[color];

    return (
        <button
            type="button"
            onClick={() => onChange(!checked)}
            className={['flex items-center gap-2 text-left', className].filter(Boolean).join(' ')}
        >
            <div
                className="w-5 h-5 flex-shrink-0 border-2 flex items-center justify-center"
                style={{
                    borderColor: error ? COLORS.coral : (checked ? hex : 'rgba(26,26,46,0.2)'),
                    backgroundColor: checked ? hex : 'transparent',
                }}
            >
                {checked && (
                    <i className="fa-solid fa-check text-[8px]" style={{ color: COLORS.dark }} />
                )}
            </div>
            {children && (
                <span className="text-xs font-semibold" style={{ color: COLORS.dark }}>
                    {children}
                </span>
            )}
        </button>
    );
}
