import React from 'react';
import type { AccentColor } from '../utils/accent-cycle';
import { ACCENT_HEX } from '../utils/accent-cycle';

export interface BreadcrumbItem {
    /** Display label */
    label: string;
    /** Click handler or URL */
    onClick?: () => void;
}

export interface BreadcrumbProps {
    /** Breadcrumb items from left to right */
    items: BreadcrumbItem[];
    /** Accent color for clickable items */
    accent?: AccentColor;
    /** Use light text (for dark backgrounds) */
    dark?: boolean;
    /** Custom class name */
    className?: string;
}

/**
 * Breadcrumb - Navigation breadcrumb trail
 *
 * Memphis compliant breadcrumb with bold uppercase text and chevron separators.
 * Extracted from details-six showcase.
 */
export function Breadcrumb({
    items,
    accent = 'teal',
    dark = false,
    className = '',
}: BreadcrumbProps) {
    const hex = ACCENT_HEX[accent];
    const separatorColor = dark ? 'rgba(255,255,255,0.4)' : 'rgba(26,26,46,0.3)';
    const inactiveColor = dark ? 'rgba(255,255,255,0.4)' : 'rgba(26,26,46,0.4)';
    const lastColor = dark ? 'rgba(255,255,255,0.7)' : '#1A1A2E';

    return (
        <div
            className={[
                'flex items-center gap-2 text-xs font-bold uppercase tracking-wider',
                className,
            ]
                .filter(Boolean)
                .join(' ')}
            style={{ color: inactiveColor }}
        >
            {items.map((item, i) => {
                const isLast = i === items.length - 1;
                const isClickable = !!item.onClick;

                return (
                    <React.Fragment key={i}>
                        {i > 0 && (
                            <i
                                className="fa-solid fa-chevron-right text-[8px]"
                                style={{ color: separatorColor }}
                            />
                        )}
                        {isClickable ? (
                            <button
                                onClick={item.onClick}
                                className="hover:opacity-80 transition-opacity"
                                style={{ color: hex }}
                            >
                                {item.label}
                            </button>
                        ) : (
                            <span style={{ color: isLast ? lastColor : undefined }}>
                                {item.label}
                            </span>
                        )}
                    </React.Fragment>
                );
            })}
        </div>
    );
}
