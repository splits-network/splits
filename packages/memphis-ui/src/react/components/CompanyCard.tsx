import React from 'react';
import type { AccentColor } from '../utils/accent-cycle';

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
    return (
        <div
            className={[
                'border-4 p-4 flex items-center gap-4 transition-transform hover:-translate-y-1 cursor-pointer bg-white',
                `accent-${accent}`,
                'border-accent',
                className,
            ]
                .filter(Boolean)
                .join(' ')}
            onClick={onClick}
        >
            <div
                className="w-14 h-14 flex-shrink-0 flex items-center justify-center border-3 border-accent bg-accent"
            >
                <span className="text-sm font-black text-on-accent">
                    {initials}
                </span>
            </div>
            <div className="flex-1 min-w-0">
                <h4
                    className="text-sm font-black uppercase tracking-wide truncate text-dark"
                >
                    {name}
                </h4>
                <p className="text-sm text-dark opacity-50">
                    {sector}
                </p>
            </div>
            <div className="text-right flex-shrink-0">
                <p className="text-lg font-black text-accent">
                    {statValue}
                </p>
                <p
                    className="text-[10px] font-bold uppercase text-dark opacity-40"
                >
                    {statLabel}
                </p>
            </div>
        </div>
    );
}
