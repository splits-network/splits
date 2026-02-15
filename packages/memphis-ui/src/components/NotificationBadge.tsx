import React from 'react';
import type { AccentColor } from '../utils/accent-cycle';
import { ACCENT_HEX } from '../utils/accent-cycle';

export interface NotificationBadgeProps {
    /** Badge label */
    label: string;
    /** Optional numeric count displayed in a dark inset badge */
    count?: number;
    /** Accent color */
    color?: AccentColor;
    /** Additional className */
    className?: string;
}

const COLORS = {
    dark: '#1A1A2E',
};

/**
 * NotificationBadge - Memphis-styled label badge with optional count
 *
 * Thick border, uppercase text, with an optional dark count indicator.
 * Extracted from notifications-ui-six showcase.
 */
export function NotificationBadge({
    label,
    count,
    color = 'coral',
    className = '',
}: NotificationBadgeProps) {
    const hex = ACCENT_HEX[color];

    return (
        <span
            className={[
                'inline-flex items-center gap-2 px-3 py-1',
                'font-black text-xs uppercase tracking-wider',
                className,
            ].filter(Boolean).join(' ')}
            style={{
                background: hex,
                border: `3px solid ${COLORS.dark}`,
                color: COLORS.dark,
            }}
        >
            {label}
            {count !== undefined && (
                <span
                    className="inline-flex items-center justify-center w-5 h-5 text-[10px] font-black"
                    style={{ background: COLORS.dark, color: '#fff' }}
                >
                    {count}
                </span>
            )}
        </span>
    );
}
