import React from 'react';

export interface SearchInputProps {
    /** Current search value */
    value: string;
    /** Change handler */
    onChange: (value: string) => void;
    /** Placeholder text */
    placeholder?: string;
    /** Additional className */
    className?: string;
}

const COLORS = {
    dark: '#1A1A2E',
    teal: '#4ECDC4',
};

/**
 * SearchInput - Memphis-styled search input with icon
 *
 * Bordered box with search icon, bold text, and clear button.
 * Extracted from faqs-six showcase.
 */
export function SearchInput({
    value,
    onChange,
    placeholder = 'Search...',
    className = '',
}: SearchInputProps) {
    return (
        <div
            className={[
                'flex items-center gap-3 p-4 bg-white',
                className,
            ].filter(Boolean).join(' ')}
            style={{ border: `4px solid ${COLORS.dark}` }}
        >
            <i className="fa-duotone fa-solid fa-magnifying-glass text-lg" style={{ color: COLORS.teal }} />
            <input
                type="text"
                placeholder={placeholder}
                value={value}
                onChange={(e) => onChange(e.target.value)}
                className="flex-1 bg-transparent outline-none font-bold text-sm placeholder:font-bold"
                style={{ color: COLORS.dark }}
            />
            {value && (
                <button
                    onClick={() => onChange('')}
                    className="font-black text-lg hover:opacity-60"
                    style={{ color: COLORS.dark }}
                >
                    &times;
                </button>
            )}
        </div>
    );
}
