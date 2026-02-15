import React from 'react';
import type { AccentColor } from '../utils/accent-cycle';
import { ACCENT_HEX, ACCENT_TEXT } from '../utils/accent-cycle';

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
    const hex = ACCENT_HEX[accent];
    const textHex = ACCENT_TEXT[accent];

    const toggle = (opt: string) => {
        onChange(
            selected.includes(opt)
                ? selected.filter((s) => s !== opt)
                : [...selected, opt],
        );
    };

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
                    const isSelected = selected.includes(opt);
                    return (
                        <button
                            key={opt}
                            type="button"
                            onClick={() => toggle(opt)}
                            className="flex items-center gap-2.5 w-full text-left group"
                        >
                            <div
                                className="w-5 h-5 flex-shrink-0 border-2 flex items-center justify-center transition-all"
                                style={{
                                    borderColor: isSelected ? hex : 'rgba(26,26,46,0.2)',
                                    backgroundColor: isSelected ? hex : 'transparent',
                                }}
                            >
                                {isSelected && (
                                    <i
                                        className="fa-solid fa-check text-[9px]"
                                        style={{ color: textHex }}
                                    />
                                )}
                            </div>
                            <span
                                className="text-sm font-semibold"
                                style={{ color: '#1A1A2E', opacity: isSelected ? 1 : 0.6 }}
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
