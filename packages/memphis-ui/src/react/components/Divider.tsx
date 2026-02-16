import React from 'react';

export interface DividerProps {
    /** Text displayed in the center of the divider (e.g. "or") */
    text?: string;
    /** Additional className */
    className?: string;
}

/**
 * Divider - Memphis-styled horizontal divider with optional center text
 *
 * Uses .divider CSS class from divider.css.
 * The CSS handles lines via ::before/::after pseudo-elements.
 * When the divider has content (:not(:empty)), it adds gap-4.
 */
export function Divider({ text, className = '' }: DividerProps) {
    return (
        <div className={['divider', className].filter(Boolean).join(' ')}>
            {text && (
                <span className="text-[10px] font-bold uppercase tracking-wider opacity-30">
                    {text}
                </span>
            )}
        </div>
    );
}
