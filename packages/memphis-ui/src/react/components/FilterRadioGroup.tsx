import React from 'react';
import type { AccentColor } from '../utils/accent-cycle';

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
    return (
        <div className={['mb-6', `accent-${accent}`, className].filter(Boolean).join(' ')}>
            <h4
                className="text-sm font-black uppercase tracking-[0.15em] mb-3 flex items-center gap-2 text-dark"
            >
                <div className="w-1.5 h-4 bg-accent" />
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
                                className={[
                                    'w-4 h-4 rounded-full border-2 flex items-center justify-center',
                                    isSelected ? 'border-accent' : 'border-dark/20',
                                ].filter(Boolean).join(' ')}
                            >
                                {isSelected && (
                                    <div
                                        className="w-2 h-2 rounded-full bg-accent"
                                    />
                                )}
                            </div>
                            <span
                                className={`text-sm font-semibold text-dark ${isSelected ? 'opacity-100' : 'opacity-60'}`}
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
