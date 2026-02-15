import React from 'react';
import type { AccentColor } from '../utils/accent-cycle';
import { ACCENT_HEX, ACCENT_TEXT } from '../utils/accent-cycle';

export interface SidebarCardProps {
    /** Card title */
    title: string;
    /** FontAwesome icon class */
    icon?: string;
    /** Accent color for border and icon */
    accent?: AccentColor | 'dark';
    /** Card content */
    children: React.ReactNode;
    /** Custom class name */
    className?: string;
}

/**
 * SidebarCard - Compact sidebar information card
 *
 * Memphis compliant card with 4px border, small icon badge in header.
 * Extracted from details-six showcase.
 */
export function SidebarCard({
    title,
    icon,
    accent = 'dark',
    children,
    className = '',
}: SidebarCardProps) {
    const hex = accent === 'dark' ? '#1A1A2E' : ACCENT_HEX[accent];
    const textHex = accent === 'dark' ? '#FFFFFF' : ACCENT_TEXT[accent];

    return (
        <div
            className={['border-4 p-6', className].filter(Boolean).join(' ')}
            style={{ borderColor: hex, backgroundColor: '#FFFFFF' }}
        >
            <h3
                className="text-sm font-black uppercase tracking-wider mb-4 flex items-center gap-2"
                style={{ color: '#1A1A2E' }}
            >
                {icon && (
                    <span
                        className="w-6 h-6 flex items-center justify-center"
                        style={{ backgroundColor: hex }}
                    >
                        <i className={`${icon} text-xs`} style={{ color: textHex }} />
                    </span>
                )}
                {title}
            </h3>
            {children}
        </div>
    );
}
