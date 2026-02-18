import React from 'react';

export interface BillingToggleProps {
    /** Whether annual billing is selected */
    annual: boolean;
    /** Change handler */
    onChange: (annual: boolean) => void;
    /** Savings badge text */
    savingsBadge?: string;
    /** Custom class name */
    className?: string;
}

/**
 * BillingToggle - Monthly/Annual segmented toggle
 *
 * Memphis-styled segmented button group that works on any background.
 * Active segment uses bg-dark text-cream, inactive uses bg-white text-dark.
 */
export function BillingToggle({
    annual,
    onChange,
    savingsBadge = 'Save 20%',
    className = '',
}: BillingToggleProps) {
    return (
        <div className={['inline-flex border-4 border-dark', className].filter(Boolean).join(' ')}>
            <button
                onClick={() => onChange(false)}
                className={[
                    'px-6 py-3 font-bold uppercase tracking-wider text-sm transition-colors',
                    !annual ? 'bg-dark text-cream' : 'bg-white text-dark',
                ].join(' ')}
            >
                Monthly
            </button>
            <button
                onClick={() => onChange(true)}
                className={[
                    'px-6 py-3 font-bold uppercase tracking-wider text-sm transition-colors flex items-center gap-2',
                    annual ? 'bg-dark text-cream' : 'bg-white text-dark',
                ].join(' ')}
            >
                Annual
                {savingsBadge && (
                    <span className="px-2 py-0.5 text-xs font-black bg-yellow text-dark">
                        {savingsBadge}
                    </span>
                )}
            </button>
        </div>
    );
}
