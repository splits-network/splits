import React from 'react';
import type { AccentColor } from '../utils/accent-cycle';
import { ACCENT_HEX, ACCENT_TEXT } from '../utils/accent-cycle';

export interface SearchBarProps {
    /** Current search value */
    value: string;
    /** Change handler */
    onChange: (value: string) => void;
    /** Placeholder text */
    placeholder?: string;
    /** Accent color for the search icon area */
    iconAccent?: AccentColor;
    /** Accent color for the search button */
    buttonAccent?: AccentColor;
    /** Button label */
    buttonLabel?: string;
    /** Whether to show the submit button */
    showButton?: boolean;
    /** Custom class name */
    className?: string;
}

/**
 * SearchBar - Full-width search input with icon
 *
 * Memphis compliant search bar with colored icon panel, input field, and optional action button.
 * Extracted from search-six showcase.
 */
export function SearchBar({
    value,
    onChange,
    placeholder = 'Search...',
    iconAccent = 'yellow',
    buttonAccent = 'coral',
    buttonLabel = 'Search',
    showButton = true,
    className = '',
}: SearchBarProps) {
    const iconHex = ACCENT_HEX[iconAccent];
    const iconTextHex = ACCENT_TEXT[iconAccent];
    const btnHex = ACCENT_HEX[buttonAccent];
    const btnTextHex = ACCENT_TEXT[buttonAccent];

    return (
        <div
            className={['flex border-4', className].filter(Boolean).join(' ')}
            style={{ borderColor: '#FFFFFF' }}
        >
            <div
                className="flex items-center px-5"
                style={{ backgroundColor: iconHex }}
            >
                <i
                    className="fa-duotone fa-regular fa-magnifying-glass text-lg"
                    style={{ color: iconTextHex }}
                />
            </div>
            <input
                type="text"
                value={value}
                onChange={(e) => onChange(e.target.value)}
                placeholder={placeholder}
                className="flex-1 px-5 py-4 text-sm font-semibold outline-none"
                style={{ backgroundColor: '#FFFFFF', color: '#1A1A2E' }}
            />
            {showButton && (
                <button
                    className="px-6 text-sm font-black uppercase tracking-wider"
                    style={{ backgroundColor: btnHex, color: btnTextHex }}
                >
                    {buttonLabel}
                </button>
            )}
        </div>
    );
}
