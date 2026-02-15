import React from 'react';
import type { AccentColor } from '../utils/accent-cycle';
import { ACCENT_HEX } from '../utils/accent-cycle';

export interface NotificationGroupProps {
    /** Group label (e.g. "Today", "Yesterday") */
    label: string;
    /** Accent color for the group indicator */
    color?: AccentColor;
    /** Number of items in the group */
    count?: number;
    /** Group content (typically NotificationItem components) */
    children: React.ReactNode;
    /** Additional className */
    className?: string;
}

const COLORS = {
    dark: '#1A1A2E',
};

/**
 * NotificationGroup - Memphis-styled notification group header with children
 *
 * Displays a colored bar, label, and count badge.
 * Extracted from notifications-six showcase.
 */
export function NotificationGroup({
    label,
    color = 'coral',
    count,
    children,
    className = '',
}: NotificationGroupProps) {
    const hex = ACCENT_HEX[color];

    return (
        <div className={['mb-6', className].filter(Boolean).join(' ')}>
            <div className="flex items-center gap-2 mb-3">
                <div className="w-1.5 h-5" style={{ backgroundColor: hex }} />
                <span
                    className="text-xs font-black uppercase tracking-[0.15em]"
                    style={{ color: COLORS.dark }}
                >
                    {label}
                </span>
                {count !== undefined && (
                    <span
                        className="text-[10px] font-bold px-2 py-0.5 border-2"
                        style={{ borderColor: hex, color: hex }}
                    >
                        {count}
                    </span>
                )}
            </div>
            <div className="space-y-2">
                {children}
            </div>
        </div>
    );
}
