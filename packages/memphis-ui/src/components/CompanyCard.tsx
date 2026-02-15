import React from 'react';
import type { AccentColor } from '../utils/accent-cycle';
import { ACCENT_HEX, ACCENT_TEXT } from '../utils/accent-cycle';

export interface CompanyCardProps {
    /** Company name */
    name: string;
    /** Company sector or description */
    sector: string;
    /** Initials to display in the avatar */
    initials: string;
    /** Stat value (e.g., number of open roles) */
    statValue: string | number;
    /** Stat label */
    statLabel: string;
    /** Accent color */
    accent?: AccentColor;
    /** Click handler */
    onClick?: () => void;
    /** Custom class name */
    className?: string;
}

/**
 * CompanyCard - Compact company list card
 *
 * Memphis compliant horizontal card with company avatar, name, sector, and a stat.
 * Extracted from cards-six showcase.
 */
export function CompanyCard({
    name,
    sector,
    initials,
    statValue,
    statLabel,
    accent = 'coral',
    onClick,
    className = '',
}: CompanyCardProps) {
    const hex = ACCENT_HEX[accent];
    const textHex = ACCENT_TEXT[accent];

    return (
        <div
            className={[
                'border-4 p-4 flex items-center gap-4 transition-transform hover:-translate-y-1 cursor-pointer',
                className,
            ]
                .filter(Boolean)
                .join(' ')}
            style={{ borderColor: hex, backgroundColor: '#FFFFFF' }}
            onClick={onClick}
        >
            <div
                className="w-14 h-14 flex-shrink-0 flex items-center justify-center border-3"
                style={{ borderColor: hex, backgroundColor: hex }}
            >
                <span className="text-sm font-black" style={{ color: textHex }}>
                    {initials}
                </span>
            </div>
            <div className="flex-1 min-w-0">
                <h4
                    className="text-sm font-black uppercase tracking-wide truncate"
                    style={{ color: '#1A1A2E' }}
                >
                    {name}
                </h4>
                <p className="text-xs" style={{ color: '#1A1A2E', opacity: 0.5 }}>
                    {sector}
                </p>
            </div>
            <div className="text-right flex-shrink-0">
                <p className="text-lg font-black" style={{ color: hex }}>
                    {statValue}
                </p>
                <p
                    className="text-[10px] font-bold uppercase"
                    style={{ color: '#1A1A2E', opacity: 0.4 }}
                >
                    {statLabel}
                </p>
            </div>
        </div>
    );
}
