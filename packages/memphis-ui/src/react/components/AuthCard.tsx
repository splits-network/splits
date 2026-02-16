import React from 'react';
import type { AccentColor } from '../utils/accent-cycle';
import { ColorBar } from './ColorBar';

export interface AuthCardProps {
    /** Content rendered inside the card */
    children: React.ReactNode;
    /** Optional logo element displayed at the top */
    logo?: React.ReactNode;
    /** Colors for the top accent bar. Defaults to all four Memphis accents. */
    barColors?: AccentColor[];
    /** Additional className for the outer wrapper */
    className?: string;
}

/**
 * AuthCard - Memphis-styled authentication card wrapper
 *
 * Uses Memphis `.card .card-border` CSS classes with a ColorBar accent
 * at the top and optional logo area.
 * Extracted from auth-six showcase.
 */
export function AuthCard({
    children,
    logo,
    className = '',
}: AuthCardProps) {
    return (
        <div className={['card card-border', className].filter(Boolean).join(' ')}>
            <ColorBar />

            {logo && (
                <div className="p-6 pb-0 text-center">{logo}</div>
            )}

            <div className="card-body">{children}</div>
        </div>
    );
}
