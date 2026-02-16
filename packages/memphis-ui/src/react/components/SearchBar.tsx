import React from 'react';
import type { AccentColor } from '../utils/accent-cycle';

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
 * SearchBar - Full-width search input with icon using input.css
 *
 * Uses .input CSS class for the text input. Memphis compliant search bar
 * with colored icon panel, input field, and optional action button.
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
    return (
        <div
            className={[
                'flex items-stretch',
                className,
            ].filter(Boolean).join(' ')}
        >
            <div className={`flex items-center px-5 bg-${iconAccent} text-dark`}>
                <i className="fa-duotone fa-regular fa-magnifying-glass text-lg" />
            </div>
            <input
                type="text"
                value={value}
                onChange={(e) => onChange(e.target.value)}
                placeholder={placeholder}
                className="input flex-1 !rounded-none border-y-0 border-x-0"
            />
            {showButton && (
                <button
                    className={`btn bg-${buttonAccent} text-dark border-0 rounded-none uppercase tracking-wider`}
                >
                    {buttonLabel}
                </button>
            )}
        </div>
    );
}
