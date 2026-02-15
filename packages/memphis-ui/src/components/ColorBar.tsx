import React from 'react';
import { ACCENT_HEX } from '../utils/accent-cycle';

export interface ColorBarProps {
    /** Height of the color bar */
    height?: string;
    /** Custom class name */
    className?: string;
}

/**
 * ColorBar - Horizontal accent color stripe
 *
 * Memphis compliant component displaying all four accent colors in equal segments.
 * Commonly used at the top of pages for branding.
 * Extracted from details-six showcase.
 */
export function ColorBar({ height = 'h-1.5', className = '' }: ColorBarProps) {
    return (
        <div className={['flex', height, className].filter(Boolean).join(' ')}>
            <div className="flex-1" style={{ backgroundColor: ACCENT_HEX.coral }} />
            <div className="flex-1" style={{ backgroundColor: ACCENT_HEX.teal }} />
            <div className="flex-1" style={{ backgroundColor: ACCENT_HEX.yellow }} />
            <div className="flex-1" style={{ backgroundColor: ACCENT_HEX.purple }} />
        </div>
    );
}
