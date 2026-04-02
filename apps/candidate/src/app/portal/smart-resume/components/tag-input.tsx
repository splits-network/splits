"use client";

import { useState, type KeyboardEvent } from "react";

interface TagInputProps {
    values: string[];
    onChange: (tags: string[]) => void;
    placeholder?: string;
}

export function TagInput({ values, onChange, placeholder }: TagInputProps) {
    const [input, setInput] = useState("");

    const addTag = () => {
        const tag = input.trim();
        if (tag && !values.includes(tag)) {
            onChange([...values, tag]);
        }
        setInput("");
    };

    const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Enter") {
            e.preventDefault();
            addTag();
        }
        if (e.key === "Backspace" && !input && values.length > 0) {
            onChange(values.slice(0, -1));
        }
    };

    const removeTag = (index: number) => {
        onChange(values.filter((_, i) => i !== index));
    };

    return (
        <div className="border border-base-300 bg-base-100 p-2 flex flex-wrap gap-1.5 min-h-[2.5rem]">
            {values.map((tag, i) => (
                <span
                    key={`${tag}-${i}`}
                    className="badge badge-primary gap-1 text-xs"
                >
                    {tag}
                    <button
                        type="button"
                        onClick={() => removeTag(i)}
                        className="hover:text-primary-content/70"
                    >
                        <i className="fa-duotone fa-regular fa-xmark text-[10px]" />
                    </button>
                </span>
            ))}
            <input
                type="text"
                className="flex-1 min-w-[120px] bg-transparent text-sm outline-none text-base-content placeholder:text-base-content/30"
                placeholder={values.length === 0 ? placeholder || "Type and press Enter" : ""}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                onBlur={addTag}
            />
        </div>
    );
}
