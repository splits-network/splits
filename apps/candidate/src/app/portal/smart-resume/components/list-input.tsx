"use client";

import { useRef } from "react";

interface ListInputProps {
    values: string[];
    onChange: (values: string[]) => void;
    placeholder?: string;
}

export function ListInput({ values, onChange, placeholder }: ListInputProps) {
    const bottomRef = useRef<HTMLDivElement>(null);

    const handleUpdate = (index: number, value: string) => {
        const updated = [...values];
        updated[index] = value;
        onChange(updated);
    };

    const handleDelete = (index: number) => {
        onChange(values.filter((_, i) => i !== index));
    };

    const handleAdd = () => {
        onChange([...values, ""]);
        // Scroll to bottom after React renders the new field
        setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" }), 50);
    };

    const handleKeyDown = (e: React.KeyboardEvent, index: number) => {
        // Backspace on empty field removes it
        if (e.key === "Backspace" && values[index] === "" && values.length > 1) {
            e.preventDefault();
            handleDelete(index);
        }
    };

    return (
        <div className="space-y-2">
            {values.map((item, i) => (
                <div key={i} className="flex gap-2 items-start">
                    <span className="text-xs text-base-content/30 mt-2.5 w-5 text-right shrink-0">
                        {i + 1}.
                    </span>
                    <textarea
                        className="textarea w-full text-sm"
                        rows={2}
                        value={item}
                        placeholder={placeholder}
                        onChange={(e) => handleUpdate(i, e.target.value)}
                        onKeyDown={(e) => handleKeyDown(e, i)}
                    />
                    <button
                        type="button"
                        className="btn btn-ghost btn-xs btn-square mt-1.5 shrink-0"
                        onClick={() => handleDelete(i)}
                        title="Remove"
                    >
                        <i className="fa-duotone fa-regular fa-trash text-base-content/30 hover:text-error" />
                    </button>
                </div>
            ))}
            <div ref={bottomRef} />
            <button
                type="button"
                className="btn btn-ghost btn-xs"
                onClick={handleAdd}
            >
                <i className="fa-duotone fa-regular fa-plus" />
                Add item
            </button>
        </div>
    );
}
