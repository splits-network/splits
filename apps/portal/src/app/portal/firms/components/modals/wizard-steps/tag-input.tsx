"use client";

import { useState, useRef, useCallback, type KeyboardEvent } from "react";

/* ─── Types ──────────────────────────────────────────────────────────────── */

interface TagInputProps {
    /** Current tags */
    tags: string[];
    /** Called when tags change */
    onChange: (tags: string[]) => void;
    /** Input placeholder */
    placeholder?: string;
    /** Helper text shown below the input */
    hint?: string;
}

/* ─── Component ──────────────────────────────────────────────────────────── */

/**
 * Free-form tag input — user types a label and presses Enter or comma to add it
 * as a chip. Chips have an X to remove. No preset options; fully open-ended.
 *
 * Usage: geo_focus, custom skill tags, etc.
 */
export function TagInput({ tags, onChange, placeholder = "Type and press Enter", hint }: TagInputProps) {
    const [inputValue, setInputValue] = useState("");
    const inputRef = useRef<HTMLInputElement>(null);

    const addTag = useCallback(
        (raw: string) => {
            const value = raw.trim();
            if (!value || tags.includes(value)) return;
            onChange([...tags, value]);
            setInputValue("");
        },
        [tags, onChange],
    );

    const removeTag = useCallback(
        (tag: string) => {
            onChange(tags.filter((t) => t !== tag));
        },
        [tags, onChange],
    );

    const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Enter" || e.key === ",") {
            e.preventDefault();
            addTag(inputValue);
        }
        if (e.key === "Backspace" && !inputValue && tags.length > 0) {
            removeTag(tags[tags.length - 1]);
        }
    };

    return (
        <div>
            {/* Tag chips row */}
            {tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-3">
                    {tags.map((tag) => (
                        <span
                            key={tag}
                            className="flex items-center gap-1.5 px-3 py-1 bg-primary text-primary-content text-xs font-semibold"
                        >
                            {tag}
                            <button
                                type="button"
                                onClick={() => removeTag(tag)}
                                className="hover:opacity-70"
                                aria-label={`Remove ${tag}`}
                            >
                                <i className="fa-solid fa-xmark text-sm" />
                            </button>
                        </span>
                    ))}
                </div>
            )}

            {/* Text input */}
            <div className="flex gap-2">
                <input
                    ref={inputRef}
                    type="text"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyDown={handleKeyDown}
                    onBlur={() => {
                        if (inputValue.trim()) addTag(inputValue);
                    }}
                    placeholder={placeholder}
                    className="input w-full bg-base-200 border-base-300"
                />
                <button
                    type="button"
                    onClick={() => addTag(inputValue)}
                    className="btn btn-ghost border border-base-300 shrink-0"
                    disabled={!inputValue.trim()}
                    aria-label="Add tag"
                >
                    <i className="fa-duotone fa-regular fa-plus" />
                    Add
                </button>
            </div>

            {hint && (
                <p className="text-sm text-base-content/40 mt-1">{hint}</p>
            )}
        </div>
    );
}
