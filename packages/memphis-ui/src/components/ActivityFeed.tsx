import React from 'react';
import type { AccentColor } from '../utils/accent-cycle';
import { ACCENT_HEX, ACCENT_TEXT } from '../utils/accent-cycle';

export interface ActivityItem {
    /** Action description */
    action: string;
    /** Detail text */
    detail: string;
    /** Time label (e.g., "2 hours ago") */
    time: string;
    /** FontAwesome icon class */
    icon: string;
    /** Accent color */
    accent: AccentColor;
}

export interface ActivityFeedProps {
    /** Activity items */
    items: ActivityItem[];
    /** Custom class name */
    className?: string;
}

/**
 * ActivityFeed - List of recent activity items
 *
 * Memphis compliant activity feed with icon badges, descriptions, and timestamps.
 * Extracted from profiles-six showcase.
 */
export function ActivityFeed({ items, className = '' }: ActivityFeedProps) {
    return (
        <div className={['space-y-4', className].filter(Boolean).join(' ')}>
            {items.map((item, i) => {
                const hex = ACCENT_HEX[item.accent];
                const textHex = ACCENT_TEXT[item.accent];

                return (
                    <div
                        key={i}
                        className="flex items-start gap-4 p-4 border-3 transition-transform hover:-translate-y-0.5"
                        style={{ borderColor: hex }}
                    >
                        <div
                            className="w-10 h-10 flex-shrink-0 flex items-center justify-center"
                            style={{ backgroundColor: hex }}
                        >
                            <i
                                className={`${item.icon} text-sm`}
                                style={{ color: textHex }}
                            />
                        </div>
                        <div className="flex-1">
                            <p className="text-sm font-bold" style={{ color: '#1A1A2E' }}>
                                {item.action}
                            </p>
                            <p className="text-xs" style={{ color: '#1A1A2E', opacity: 0.5 }}>
                                {item.detail}
                            </p>
                        </div>
                        <span
                            className="text-[10px] font-bold uppercase tracking-wider flex-shrink-0"
                            style={{ color: '#1A1A2E', opacity: 0.3 }}
                        >
                            {item.time}
                        </span>
                    </div>
                );
            })}
        </div>
    );
}
