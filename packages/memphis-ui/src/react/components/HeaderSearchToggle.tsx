import React from "react";

export interface HeaderSearchToggleProps {
    isOpen: boolean;
    onToggle: () => void;
    placeholder?: string;
    value?: string;
    onChange?: (value: string) => void;
    onSubmit?: (value: string) => void;
    className?: string;
}

/**
 * HeaderSearchToggle - Memphis search toggle for the header
 *
 * Uses `.nav-action` + `.nav-action-active` CSS classes from navbar.css.
 */
export function HeaderSearchToggle({
    isOpen,
    onToggle,
    placeholder = "SEARCH...",
    value,
    onChange,
    onSubmit,
    className = "",
}: HeaderSearchToggleProps) {
    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Enter" && onSubmit) {
            onSubmit((e.target as HTMLInputElement).value);
        }
        if (e.key === "Escape") {
            onToggle();
        }
    };

    return (
        <div className={["relative", className].filter(Boolean).join(" ")}>
            <button
                onClick={onToggle}
                className={[
                    "nav-action",
                    isOpen && "nav-action-active",
                ]
                    .filter(Boolean)
                    .join(" ")}
            >
                <i
                    className={`fa-duotone fa-regular ${isOpen ? "fa-xmark" : "fa-magnifying-glass"} text-sm`}
                />
            </button>
            {isOpen && (
                <div className="absolute top-full right-0 mt-2 w-[300px] p-3 z-50 border-md border-teal bg-dark">
                    <input
                        type="text"
                        placeholder={placeholder}
                        autoFocus
                        value={value}
                        onChange={
                            onChange
                                ? (e) => onChange(e.target.value)
                                : undefined
                        }
                        onKeyDown={handleKeyDown}
                        className="w-full px-3 py-2 text-sm font-bold uppercase tracking-wider outline-none border-xs border-teal bg-white/[0.03] text-white"
                    />
                </div>
            )}
        </div>
    );
}
