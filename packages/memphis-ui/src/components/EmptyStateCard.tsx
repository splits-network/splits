import React from 'react';
import type { AccentColor } from '../utils/accent-cycle';
import { ACCENT_HEX, ACCENT_TEXT } from '../utils/accent-cycle';

export interface EmptyStateCardAction {
    /** Button label */
    label: string;
    /** FontAwesome icon class */
    icon: string;
    /** Whether this is the primary action */
    primary: boolean;
    /** Accent color for the button */
    accent: AccentColor | 'dark';
    /** Click handler */
    onClick?: () => void;
}

export interface EmptyStateCardProps {
    /** Main title */
    title: string;
    /** Category subtitle badge */
    subtitle: string;
    /** Description text */
    description: string;
    /** Custom illustration content (rendered above the title) */
    illustration?: React.ReactNode;
    /** Action buttons */
    actions?: EmptyStateCardAction[];
    /** Accent color for the card border and badge */
    accent?: AccentColor;
    /** Custom class name */
    className?: string;
}

/**
 * EmptyStateCard - Rich empty state card with illustration and actions
 *
 * Memphis compliant card with color strip, badge, illustration area,
 * title, description, and action buttons. More elaborate than the basic EmptyState.
 * Extracted from empty-six showcase.
 */
export function EmptyStateCard({
    title,
    subtitle,
    description,
    illustration,
    actions = [],
    accent = 'coral',
    className = '',
}: EmptyStateCardProps) {
    const hex = ACCENT_HEX[accent];
    const textHex = ACCENT_TEXT[accent];

    return (
        <div
            className={['border-4 overflow-hidden', className].filter(Boolean).join(' ')}
            style={{ borderColor: hex, backgroundColor: '#FFFFFF' }}
        >
            {/* Top strip */}
            <div className="h-1.5" style={{ backgroundColor: hex }} />

            {/* Badge */}
            <div className="pt-6 px-8">
                <span
                    className="inline-block px-3 py-1 text-[10px] font-black uppercase tracking-[0.2em]"
                    style={{ backgroundColor: hex, color: textHex }}
                >
                    {subtitle}
                </span>
            </div>

            <div className="p-8 text-center">
                {illustration}

                <h3
                    className="text-xl font-black uppercase tracking-wider mb-3"
                    style={{ color: '#1A1A2E' }}
                >
                    {title}
                </h3>

                <p
                    className="text-sm leading-relaxed mb-8 max-w-sm mx-auto"
                    style={{ color: '#1A1A2E', opacity: 0.6 }}
                >
                    {description}
                </p>

                {actions.length > 0 && (
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                        {actions.map((action, i) => {
                            const actionHex = action.accent === 'dark' ? '#1A1A2E' : ACCENT_HEX[action.accent];
                            const actionTextHex = action.accent === 'dark' ? '#FFFFFF' : ACCENT_TEXT[action.accent];

                            return (
                                <button
                                    key={i}
                                    onClick={action.onClick}
                                    className="px-6 py-3 text-xs font-black uppercase tracking-wider border-3 transition-transform hover:-translate-y-0.5 flex items-center gap-2"
                                    style={{
                                        borderColor: actionHex,
                                        backgroundColor: action.primary ? actionHex : 'transparent',
                                        color: action.primary ? actionTextHex : actionHex,
                                    }}
                                >
                                    <i className={`${action.icon} text-xs`} />
                                    {action.label}
                                </button>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}
