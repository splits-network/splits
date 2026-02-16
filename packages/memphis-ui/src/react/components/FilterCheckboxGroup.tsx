import React from 'react';
import type { AccentColor } from '../utils/accent-cycle';

export interface FilterCheckboxGroupProps {
    /** Group label */
    label: string;
    /** Available options */
    options: string[];
    /** Currently selected options */
    selected: string[];
    /** Change handler */
    onChange: (selected: string[]) => void;
    /** Accent color for checkboxes */
    accent?: AccentColor;
    /** Custom class name */
    className?: string;
}

/**
 * FilterCheckboxGroup - Checkbox filter group with label
 *
 * Memphis compliant checkbox group with colored accent indicator and bold typography.
 * Extracted from search-six showcase.
 */
export function FilterCheckboxGroup({
    label,
    options,
    selected,
    onChange,
    accent = 'coral',
    className = '',
}: FilterCheckboxGroupProps) {
    const toggle = (opt: string) => {
        onChange(
            selected.includes(opt)
                ? selected.filter((s) => s !== opt)
                : [...selected, opt],
        );
    };

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
                    const isSelected = selected.includes(opt);
                    return (
                        <button
                            key={opt}
                            type="button"
                            onClick={() => toggle(opt)}
                            className="flex items-center gap-2.5 w-full text-left group"
                        >
                            <div
                                className={[
                                    'w-5 h-5 flex-shrink-0 border-2 flex items-center justify-center transition-all',
                                    isSelected ? 'border-accent bg-accent' : 'border-dark/20',
                                ].filter(Boolean).join(' ')}
                            >
                                {isSelected && (
                                    <i
                                        className="fa-solid fa-check text-[9px] text-on-accent"
                                    />
                                )}
                            </div>
                            <span
                                className={`text-sm font-semibold text-dark ${isSelected ? 'opacity-100' : 'opacity-60'}`}
                            >
                                {opt}
                            </span>
                        </button>
                    );
                })}
            </div>
        </div>
    );
}
