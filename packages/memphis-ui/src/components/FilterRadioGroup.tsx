import React from 'react';
import type { AccentColor } from '../utils/accent-cycle';
import { ACCENT_HEX } from '../utils/accent-cycle';

export interface FilterRadioOption {
    /** Option value */
    value: string;
    /** Display label */
    label: string;
}

export interface FilterRadioGroupProps {
    /** Group label */
    label: string;
    /** Available options */
    options: FilterRadioOption[];
    /** Currently selected value */
    selected: string;
    /** Change handler */
    onChange: (value: string) => void;
    /** Accent color for the radio indicator */
    accent?: AccentColor;
    /** Custom class name */
    className?: string;
}

/**
 * FilterRadioGroup - Radio button filter group
 *
 * Memphis compliant radio group with colored accent indicator and toggle behavior.
 * Extracted from search-six showcase.
 */
export function FilterRadioGroup({
    label,
    options,
    selected,
    onChange,
    accent = 'teal',
    className = '',
}: FilterRadioGroupProps) {
    const hex = ACCENT_HEX[accent];

    return (
        <div className={['mb-6', className].filter(Boolean).join(' ')}>
            <h4
                className="text-xs font-black uppercase tracking-[0.15em] mb-3 flex items-center gap-2"
                style={{ color: '#1A1A2E' }}
            >
                <div className="w-1.5 h-4" style={{ backgroundColor: hex }} />
                {label}
            </h4>
            <div className="space-y-2">
                {options.map((opt) => {
                    const isSelected = selected === opt.value;
                    return (
                        <button
                            key={opt.value}
                            type="button"
                            onClick={() => onChange(isSelected ? '' : opt.value)}
                            className="flex items-center gap-2.5 w-full text-left"
                        >
                            <div
                                className="w-4 h-4 rounded-full border-2 flex items-center justify-center"
                                style={{
                                    borderColor: isSelected ? hex : 'rgba(26,26,46,0.2)',
                                }}
                            >
                                {isSelected && (
                                    <div
                                        className="w-2 h-2 rounded-full"
                                        style={{ backgroundColor: hex }}
                                    />
                                )}
                            </div>
                            <span
                                className="text-sm font-semibold"
                                style={{ color: '#1A1A2E', opacity: isSelected ? 1 : 0.6 }}
                            >
                                {opt.label}
                            </span>
                        </button>
                    );
                })}
            </div>
        </div>
    );
}
