import React from 'react';
import type { AccentColor } from '../utils/accent-cycle';
import { ACCENT_HEX } from '../utils/accent-cycle';

export interface AccordionItemProps {
    /** Question/header text */
    title: string;
    /** Answer/body content */
    children: React.ReactNode;
    /** Whether the item is open */
    isOpen: boolean;
    /** Called when the item header is clicked */
    onToggle: () => void;
    /** FontAwesome icon class for the category indicator */
    icon?: string;
    /** Accent color for the category icon */
    color?: AccentColor;
    /** Additional className */
    className?: string;
}

const COLORS = {
    dark: '#1A1A2E',
    yellow: '#FFE66D',
};

/**
 * AccordionItem - Memphis-styled expandable FAQ item
 *
 * Dark header when open, white when closed. Category icon, chevron indicator,
 * and collapsible content panel. 4px dark border.
 * Extracted from faqs-six showcase.
 */
export function AccordionItem({
    title,
    children,
    isOpen,
    onToggle,
    icon,
    color = 'teal',
    className = '',
}: AccordionItemProps) {
    const hex = ACCENT_HEX[color];

    return (
        <div
            className={['bg-white', className].filter(Boolean).join(' ')}
            style={{ border: `4px solid ${COLORS.dark}` }}
        >
            <button
                onClick={onToggle}
                className="w-full flex items-center gap-4 p-5 text-left transition-colors"
                style={{ background: isOpen ? COLORS.dark : '#fff' }}
            >
                {icon && (
                    <span
                        className="w-8 h-8 flex items-center justify-center shrink-0"
                        style={{
                            background: hex,
                            border: `3px solid ${isOpen ? '#fff' : COLORS.dark}`,
                        }}
                    >
                        <i className={`fa-duotone fa-solid ${icon} text-xs`} style={{ color: COLORS.dark }} />
                    </span>
                )}
                <span
                    className="flex-1 font-black text-sm uppercase tracking-wide"
                    style={{ color: isOpen ? '#fff' : COLORS.dark }}
                >
                    {title}
                </span>
                <i
                    className="fa-duotone fa-solid fa-chevron-down text-sm transition-transform"
                    style={{
                        color: isOpen ? COLORS.yellow : COLORS.dark,
                        transform: isOpen ? 'rotate(180deg)' : 'rotate(0)',
                    }}
                />
            </button>
            <div
                style={{
                    height: isOpen ? 'auto' : 0,
                    opacity: isOpen ? 1 : 0,
                    overflow: 'hidden',
                    transition: 'all 0.3s ease',
                }}
            >
                <div className="p-5" style={{ borderTop: `3px solid ${COLORS.dark}` }}>
                    {children}
                </div>
            </div>
        </div>
    );
}
