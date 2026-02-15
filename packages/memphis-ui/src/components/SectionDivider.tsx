import React from 'react';
import type { AccentColor } from '../utils/accent-cycle';
import { ACCENT_HEX, ACCENT_TEXT } from '../utils/accent-cycle';

export interface SectionDividerProps {
    /** Section label */
    label: string;
    /** FontAwesome icon class */
    icon?: string;
    /** Accent color for the badge */
    accent?: AccentColor;
    /** Custom class name */
    className?: string;
}

/**
 * SectionDivider - Section heading with decorative line
 *
 * Memphis compliant section divider with colored badge label and horizontal rule.
 * Extracted from cards-six showcase.
 */
export function SectionDivider({
    label,
    icon,
    accent = 'purple',
    className = '',
}: SectionDividerProps) {
    const hex = ACCENT_HEX[accent];
    const textHex = ACCENT_TEXT[accent];

    return (
        <div
            className={['flex items-center gap-3', className].filter(Boolean).join(' ')}
        >
            <span
                className="px-4 py-1.5 text-xs font-black uppercase tracking-[0.2em]"
                style={{ backgroundColor: hex, color: textHex }}
            >
                {icon && <i className={`${icon} mr-2`} />}
                {label}
            </span>
            <div
                className="flex-1 h-1"
                style={{ backgroundColor: 'rgba(255,255,255,0.1)' }}
            />
        </div>
    );
}
