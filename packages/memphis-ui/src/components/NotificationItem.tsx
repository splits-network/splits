import React from 'react';
import type { AccentColor } from '../utils/accent-cycle';
import { ACCENT_HEX } from '../utils/accent-cycle';

export interface NotificationItemProps {
    /** Notification title */
    title: string;
    /** Notification description */
    description: string;
    /** Time display string (e.g. "10 minutes ago") */
    time: string;
    /** FontAwesome icon class */
    icon: string;
    /** Accent color for the icon and border */
    color?: AccentColor;
    /** Category label (e.g. "Application", "Message") */
    categoryLabel?: string;
    /** Whether this notification has been read */
    read?: boolean;
    /** Called when the read/unread toggle is clicked */
    onToggleRead?: () => void;
    /** Called when the delete button is clicked */
    onDelete?: () => void;
    /** Additional className */
    className?: string;
}

const COLORS = {
    dark: '#1A1A2E',
    cream: '#F5F0EB',
    yellow: '#FFE66D',
    white: '#FFFFFF',
};

/**
 * NotificationItem - Memphis-styled notification list item
 *
 * Displays icon, title, description, time, and category badge.
 * Supports read/unread state and action buttons.
 * Extracted from notifications-six showcase.
 */
export function NotificationItem({
    title,
    description,
    time,
    icon,
    color = 'coral',
    categoryLabel,
    read = false,
    onToggleRead,
    onDelete,
    className = '',
}: NotificationItemProps) {
    const hex = ACCENT_HEX[color];

    return (
        <div
            className={[
                'border-3 p-4 flex items-start gap-4 transition-all',
                className,
            ].filter(Boolean).join(' ')}
            style={{
                borderColor: read ? 'rgba(26,26,46,0.08)' : hex,
                backgroundColor: read ? 'transparent' : 'rgba(255,255,255,0.8)',
                opacity: read ? 0.7 : 1,
            }}
        >
            {/* Icon */}
            <div
                className="w-10 h-10 flex-shrink-0 flex items-center justify-center"
                style={{ backgroundColor: read ? COLORS.cream : hex }}
            >
                <i
                    className={`${icon} text-sm`}
                    style={{ color: read ? 'rgba(26,26,46,0.4)' : (color === 'yellow' ? COLORS.dark : COLORS.white) }}
                />
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                    {!read && (
                        <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: hex }} />
                    )}
                    <h4 className="text-sm font-bold truncate" style={{ color: COLORS.dark }}>{title}</h4>
                </div>
                <p className="text-xs truncate" style={{ color: COLORS.dark, opacity: 0.5 }}>{description}</p>
                <div className="flex items-center gap-2 mt-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider" style={{ color: COLORS.dark, opacity: 0.3 }}>{time}</span>
                    {categoryLabel && (
                        <span
                            className="px-1.5 py-0.5 text-[9px] font-bold uppercase border"
                            style={{ borderColor: hex, color: hex }}
                        >
                            {categoryLabel}
                        </span>
                    )}
                </div>
            </div>

            {/* Actions */}
            {(onToggleRead || onDelete) && (
                <div className="flex items-center gap-1 flex-shrink-0">
                    {onToggleRead && (
                        <button
                            onClick={(e) => { e.stopPropagation(); onToggleRead(); }}
                            title={read ? 'Mark unread' : 'Mark read'}
                            className="w-7 h-7 flex items-center justify-center border-2 transition-colors"
                            style={{
                                borderColor: 'rgba(26,26,46,0.1)',
                                color: read ? 'rgba(26,26,46,0.3)' : hex,
                            }}
                        >
                            <i className={`fa-${read ? 'regular' : 'solid'} fa-circle text-[8px]`} />
                        </button>
                    )}
                    {onDelete && (
                        <button
                            onClick={(e) => { e.stopPropagation(); onDelete(); }}
                            title="Delete"
                            className="w-7 h-7 flex items-center justify-center border-2 transition-colors"
                            style={{ borderColor: 'rgba(26,26,46,0.1)', color: 'rgba(26,26,46,0.3)' }}
                        >
                            <i className="fa-duotone fa-regular fa-trash text-[10px]" />
                        </button>
                    )}
                </div>
            )}
        </div>
    );
}
