import React from 'react';
import type { AccentColor } from '../utils/accent-cycle';

export interface BillingToggleProps {
    /** Whether annual billing is selected */
    annual: boolean;
    /** Change handler */
    onChange: (annual: boolean) => void;
    /** Savings badge text */
    savingsBadge?: string;
    /** Accent color for the toggle */
    accent?: AccentColor;
    /** Custom class name */
    className?: string;
}

/**
 * BillingToggle - Monthly/Annual billing toggle
 *
 * Memphis compliant toggle switch with monthly/annual labels and savings badge.
 * Extracted from pricing-six showcase.
 */
export function BillingToggle({
    annual,
    onChange,
    savingsBadge = 'Save 20%',
    accent = 'coral',
    className = '',
}: BillingToggleProps) {
    return (
        <div
            className={[`accent-${accent}`, 'flex items-center justify-center gap-4', className]
                .filter(Boolean)
                .join(' ')}
        >
            <span
                className={[
                    'text-sm font-bold uppercase tracking-wider',
                    annual ? 'text-white/40' : 'text-white',
                ].join(' ')}
            >
                Monthly
            </span>
            <button
                onClick={() => onChange(!annual)}
                className={[
                    'w-14 h-8 relative border-3 border-accent',
                    annual ? 'bg-accent' : 'bg-transparent',
                ].join(' ')}
            >
                <div
                    className="absolute top-1 w-5 h-5 transition-all border-detail bg-white"
                    style={{
                        left: annual ? 'calc(100% - 24px)' : '3px',
                    }}
                />
            </button>
            <span
                className={[
                    'text-sm font-bold uppercase tracking-wider flex items-center gap-2',
                    annual ? 'text-white' : 'text-white/40',
                ].join(' ')}
            >
                Annual
                {savingsBadge && (
                    <span
                        className="accent-yellow px-2 py-0.5 text-[10px] font-black uppercase bg-accent text-on-accent"
                    >
                        {savingsBadge}
                    </span>
                )}
            </span>
        </div>
    );
}
