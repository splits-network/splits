import React from 'react';
import type { AccentColor } from '../utils/accent-cycle';

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
    return (
        <div
            className={[
                `accent-${color}`,
                'border-3 p-4 flex items-start gap-4 transition-all',
                read ? 'border-dark/[0.08] bg-transparent opacity-70' : 'border-accent bg-white/80',
                className,
            ].filter(Boolean).join(' ')}
        >
            {/* Icon */}
            <div
                className={`w-10 h-10 flex-shrink-0 flex items-center justify-center ${read ? 'bg-cream' : 'bg-accent'}`}
            >
                <i
                    className={`${icon} text-sm ${read ? 'text-dark/40' : 'text-on-accent'}`}
                />
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                    {!read && (
                        <div className="w-2 h-2 rounded-full flex-shrink-0 bg-accent" />
                    )}
                    <h4 className="text-sm font-bold truncate text-dark">{title}</h4>
                </div>
                <p className="text-sm truncate text-dark opacity-50">{description}</p>
                <div className="flex items-center gap-2 mt-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-dark opacity-30">{time}</span>
                    {categoryLabel && (
                        <span
                            className="px-1.5 py-0.5 text-[9px] font-bold uppercase border border-accent text-accent"
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
                            className={`w-7 h-7 flex items-center justify-center border-2 border-dark/10 transition-colors ${read ? 'text-dark/30' : 'text-accent'}`}
                        >
                            <i className={`fa-${read ? 'regular' : 'solid'} fa-circle text-[8px]`} />
                        </button>
                    )}
                    {onDelete && (
                        <button
                            onClick={(e) => { e.stopPropagation(); onDelete(); }}
                            title="Delete"
                            className="w-7 h-7 flex items-center justify-center border-2 border-dark/10 text-dark/30 transition-colors"
                        >
                            <i className="fa-duotone fa-regular fa-trash text-[10px]" />
                        </button>
                    )}
                </div>
            )}
        </div>
    );
}
