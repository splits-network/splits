import React from 'react';

export interface DividerProps {
    /** Text displayed in the center of the divider (e.g. "or") */
    text?: string;
    /** Additional className */
    className?: string;
}

const COLORS = {
    dark: '#1A1A2E',
    cream: '#F5F0EB',
};

/**
 * Divider - Memphis-styled horizontal divider with optional center text
 *
 * Uses cream-colored lines with bold uppercase text between them.
 * Extracted from auth-six showcase.
 */
export function Divider({ text, className = '' }: DividerProps) {
    if (!text) {
        return (
            <div
                className={['h-0.5', className].filter(Boolean).join(' ')}
                style={{ backgroundColor: COLORS.cream }}
            />
        );
    }

    return (
        <div className={['flex items-center gap-3', className].filter(Boolean).join(' ')}>
            <div className="flex-1 h-0.5" style={{ backgroundColor: COLORS.cream }} />
            <span
                className="text-[10px] font-bold uppercase tracking-wider"
                style={{ color: COLORS.dark, opacity: 0.3 }}
            >
                {text}
            </span>
            <div className="flex-1 h-0.5" style={{ backgroundColor: COLORS.cream }} />
        </div>
    );
}
