import React from 'react';
import type { AccentColor } from '../utils/accent-cycle';

export interface DetailSectionProps {
    /** Section title */
    title: string;
    /** FontAwesome icon class for the section header */
    icon?: string;
    /** Accent color for the border and icon background */
    accent?: AccentColor;
    /** Section content */
    children: React.ReactNode;
    /** Custom class name */
    className?: string;
}

/**
 * DetailSection - Bordered content section with icon header
 *
 * Memphis compliant section with 4px border, icon badge in header, and bold title.
 * Extracted from details-six showcase.
 */
export function DetailSection({
    title,
    icon,
    accent = 'coral',
    children,
    className = '',
}: DetailSectionProps) {
    return (
        <div
            className={[
                'border-4 p-8 bg-white',
                `accent-${accent}`,
                'border-accent',
                className,
            ].filter(Boolean).join(' ')}
        >
            <h2
                className="text-lg font-black uppercase tracking-wider mb-5 flex items-center gap-2 text-dark"
            >
                {icon && (
                    <span
                        className="w-8 h-8 flex items-center justify-center bg-accent"
                    >
                        <i className={`${icon} text-sm text-on-accent`} />
                    </span>
                )}
                {title}
            </h2>
            {children}
        </div>
    );
}
