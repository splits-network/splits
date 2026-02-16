import React from 'react';
import type { AccentColor } from '../utils/accent-cycle';

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

/** Map accent name to CSS var (supports 'dark') */
function accentVar(name: AccentColor | 'dark'): string {
    return `var(--color-${name})`;
}

function accentContentVar(name: AccentColor | 'dark'): string {
    return `var(--color-${name}-content)`;
}

/**
 * EmptyStateCard - Rich empty state card with illustration and actions
 *
 * Uses Memphis `.card` CSS classes for the container with color strip,
 * badge, illustration area, title, description, and action buttons.
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
    return (
        <div
            className={[`accent-${accent}`, 'card overflow-hidden rounded-none border-4 border-solid border-accent', className].filter(Boolean).join(' ')}
        >
            {/* Top color strip */}
            <div className="h-1.5 bg-accent" />

            {/* Badge */}
            <div className="pt-6 px-8">
                <span className={`badge badge-${accent} font-black text-[10px] uppercase tracking-[0.2em]`}>
                    {subtitle}
                </span>
            </div>

            <div className="card-body items-center text-center">
                {illustration}

                <h3 className="card-title justify-center mb-3">
                    {title}
                </h3>

                <p
                    className="text-sm leading-relaxed mb-8 max-w-sm text-dark opacity-60"
                >
                    {description}
                </p>

                {actions.length > 0 && (
                    <div className="card-actions justify-center flex-col sm:flex-row">
                        {actions.map((action, i) => (
                            <button
                                key={i}
                                onClick={action.onClick}
                                className={`btn font-black uppercase tracking-wider transition-transform hover:-translate-y-0.5 flex items-center gap-2 border-3 border-solid ${action.primary ? `btn-${action.accent}` : `btn-outline border-${action.accent} text-${action.accent}`}`}
                            >
                                <i className={`${action.icon} text-xs`} />
                                {action.label}
                            </button>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
