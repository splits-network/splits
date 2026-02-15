import React from 'react';
import type { AccentColor } from '../utils/accent-cycle';
import { ACCENT_HEX, ACCENT_TEXT } from '../utils/accent-cycle';

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
    const hex = ACCENT_HEX[accent];

    return (
        <div
            className={['flex items-center justify-center gap-4', className]
                .filter(Boolean)
                .join(' ')}
        >
            <span
                className="text-sm font-bold uppercase tracking-wider"
                style={{ color: annual ? 'rgba(255,255,255,0.4)' : '#FFFFFF' }}
            >
                Monthly
            </span>
            <button
                onClick={() => onChange(!annual)}
                className="w-14 h-8 relative border-3"
                style={{
                    borderColor: hex,
                    backgroundColor: annual ? hex : 'transparent',
                }}
            >
                <div
                    className="absolute top-1 w-5 h-5 transition-all border-2"
                    style={{
                        left: annual ? 'calc(100% - 24px)' : '3px',
                        borderColor: '#1A1A2E',
                        backgroundColor: '#FFFFFF',
                    }}
                />
            </button>
            <span
                className="text-sm font-bold uppercase tracking-wider flex items-center gap-2"
                style={{ color: annual ? '#FFFFFF' : 'rgba(255,255,255,0.4)' }}
            >
                Annual
                {savingsBadge && (
                    <span
                        className="px-2 py-0.5 text-[10px] font-black uppercase"
                        style={{ backgroundColor: ACCENT_HEX.yellow, color: ACCENT_TEXT.yellow }}
                    >
                        {savingsBadge}
                    </span>
                )}
            </span>
        </div>
    );
}
