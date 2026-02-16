import React from "react";

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

/**
 * SearchInput - Memphis-styled search input with icon using input.css
 *
 * Uses .input CSS class for the outer container (label-mode).
 * Thin bordered box with search icon, bold text, and clear button.
 */
export function SearchInput({
    value,
    onChange,
    placeholder = "Search...",
    className = "",
}: SearchInputProps) {
    return (
        <label
            className={[
                "input w-full",
                className,
            ]
                .filter(Boolean)
                .join(" ")}
        >
            <i className="fa-duotone fa-regular fa-magnifying-glass text-sm text-coral" />
            <input
                type="text"
                placeholder={placeholder}
                value={value}
                onChange={(e) => onChange(e.target.value)}
                className="grow font-semibold"
            />
            {value && (
                <button
                    onClick={() => onChange("")}
                    className="text-xs font-bold uppercase tracking-wider text-dark/60 hover:text-coral"
                >
                    Clear
                </button>
            )}
        </label>
    );
}
