import React from 'react';
import type { AccentColor } from '../utils/accent-cycle';
import { ACCENT_HEX, ACCENT_TEXT } from '../utils/accent-cycle';

export interface SelectionCardOption {
    /** Unique value */
    value: string;
    /** Display label */
    label: string;
    /** Description text */
    description: string;
    /** FontAwesome icon class */
    icon: string;
    /** Accent color */
    accent: AccentColor;
}

export interface SelectionCardProps {
    /** Available options */
    options: SelectionCardOption[];
    /** Currently selected value */
    selected: string;
    /** Change handler */
    onChange: (value: string) => void;
    /** Custom class name */
    className?: string;
}

/**
 * SelectionCard - Role/option selection cards
 *
 * Memphis compliant selection cards with icon, label, description.
 * Selected card fills with accent color.
 * Extracted from onboarding-six showcase.
 */
export function SelectionCard({
    options,
    selected,
    onChange,
    className = '',
}: SelectionCardProps) {
    return (
        <div className={['grid gap-4', className].filter(Boolean).join(' ')}>
            {options.map((option) => {
                const isSelected = selected === option.value;
                const hex = ACCENT_HEX[option.accent];
                const textHex = ACCENT_TEXT[option.accent];

                return (
                    <button
                        key={option.value}
                        onClick={() => onChange(option.value)}
                        className="flex items-center gap-4 p-5 border-3 text-left transition-all"
                        style={{
                            borderColor: isSelected ? hex : 'rgba(26,26,46,0.15)',
                            backgroundColor: isSelected ? hex : 'transparent',
                        }}
                    >
                        <div
                            className="w-12 h-12 flex-shrink-0 flex items-center justify-center border-2"
                            style={{
                                borderColor: isSelected ? textHex : hex,
                                backgroundColor: isSelected ? 'rgba(255,255,255,0.2)' : 'transparent',
                            }}
                        >
                            <i
                                className={`${option.icon} text-lg`}
                                style={{ color: isSelected ? textHex : hex }}
                            />
                        </div>
                        <div>
                            <p
                                className="text-sm font-black uppercase tracking-wide"
                                style={{ color: isSelected ? textHex : '#1A1A2E' }}
                            >
                                {option.label}
                            </p>
                            <p
                                className="text-xs"
                                style={{
                                    color: isSelected
                                        ? `${textHex}B3`
                                        : 'rgba(26,26,46,0.5)',
                                }}
                            >
                                {option.description}
                            </p>
                        </div>
                    </button>
                );
            })}
        </div>
    );
}
