import React from 'react';
import type { AccentColor } from '../utils/accent-cycle';

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

                return (
                    <button
                        key={option.value}
                        onClick={() => onChange(option.value)}
                        className={[
                            `accent-${option.accent}`,
                            'flex items-center gap-4 p-5 border-3 text-left transition-all',
                            isSelected ? 'border-accent bg-accent' : 'border-dark/15 bg-transparent',
                        ].filter(Boolean).join(' ')}
                    >
                        <div
                            className={[
                                'w-12 h-12 flex-shrink-0 flex items-center justify-center border-2',
                                isSelected ? 'border-on-accent bg-white/20' : 'border-accent bg-transparent',
                            ].filter(Boolean).join(' ')}
                        >
                            <i
                                className={[
                                    `${option.icon} text-lg`,
                                    isSelected ? 'text-on-accent' : 'text-accent',
                                ].filter(Boolean).join(' ')}
                            />
                        </div>
                        <div>
                            <p
                                className={[
                                    'text-sm font-black uppercase tracking-wide',
                                    isSelected ? 'text-on-accent' : 'text-dark',
                                ].filter(Boolean).join(' ')}
                            >
                                {option.label}
                            </p>
                            <p
                                className={[
                                    'text-sm',
                                    isSelected ? 'opacity-70' : 'text-dark/50',
                                ].filter(Boolean).join(' ')}
                                style={isSelected ? { color: 'var(--accent-content)' } : undefined}
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
