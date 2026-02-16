import React from 'react';
import type { AccentColor } from '../utils/accent-cycle';

export interface SupportAction {
    /** Button label */
    label: string;
    /** FontAwesome icon class */
    icon?: string;
    /** Accent color for the button */
    color?: AccentColor;
    /** Click handler */
    onClick?: () => void;
    /** Optional href for link buttons */
    href?: string;
}

export interface SupportCTAProps {
    /** FontAwesome icon class for the main icon */
    icon?: string;
    /** Heading text */
    title: string;
    /** Highlighted word in the title (rendered in coral) */
    highlight?: string;
    /** Description text */
    description?: string;
    /** Action buttons */
    actions?: SupportAction[];
    /** Additional className */
    className?: string;
}

/**
 * SupportCTA - Memphis-styled support call-to-action section
 *
 * Dark background card with icon, heading, description, and action buttons.
 * Extracted from faqs-six showcase.
 */
export function SupportCTA({
    icon = 'fa-headset',
    title,
    highlight,
    description,
    actions = [],
    className = '',
}: SupportCTAProps) {
    const renderTitle = () => {
        if (!highlight) return title;
        const parts = title.split(highlight);
        return (
            <>
                {parts[0]}
                <span className="text-coral">{highlight}</span>
                {parts[1] || ''}
            </>
        );
    };

    return (
        <section
            className={['p-8 text-center bg-dark border-4 border-teal', className].filter(Boolean).join(' ')}
        >
            <i className={`fa-duotone fa-solid ${icon} text-5xl mb-4 text-teal`} />
            <h3 className="text-2xl font-black uppercase tracking-tight text-white">
                {renderTitle()}
            </h3>
            {description && (
                <p className="mt-2 text-sm font-medium max-w-md mx-auto text-[#ccc]">
                    {description}
                </p>
            )}
            {actions.length > 0 && (
                <div className="flex flex-wrap gap-4 justify-center mt-6">
                    {actions.map((action) => {
                        const accentClass = `accent-${action.color || 'teal'}`;
                        if (action.href) {
                            return (
                                <a
                                    key={action.label}
                                    href={action.href}
                                    className={`${accentClass} px-6 py-3 font-black text-sm uppercase tracking-wider transition-all hover:opacity-80 bg-accent border-4 border-solid border-accent text-dark`}
                                >
                                    {action.icon && <i className={`fa-duotone fa-solid ${action.icon} mr-2`} />}
                                    {action.label}
                                </a>
                            );
                        }
                        return (
                            <button
                                key={action.label}
                                onClick={action.onClick}
                                className={`${accentClass} px-6 py-3 font-black text-sm uppercase tracking-wider transition-all hover:opacity-80 bg-accent border-4 border-solid border-accent text-dark`}
                            >
                                {action.icon && <i className={`fa-duotone fa-solid ${action.icon} mr-2`} />}
                                {action.label}
                            </button>
                        );
                    })}
                </div>
            )}
        </section>
    );
}
