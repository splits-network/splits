"use client";

import { useCallback } from "react";
import type { ContentButton } from "@splits-network/shared-types";
import { RepeatingListEditor } from "./repeating-list-editor";

interface ButtonListEditorProps {
    buttons: ContentButton[];
    onChange: (buttons: ContentButton[]) => void;
}

const VARIANT_OPTIONS = [
    { value: "primary", label: "Primary" },
    { value: "secondary", label: "Secondary" },
    { value: "accent", label: "Accent" },
    { value: "outline", label: "Outline" },
    { value: "ghost", label: "Ghost" },
];

export function ButtonListEditor({ buttons, onChange }: ButtonListEditorProps) {
    const defaultButton = useCallback(
        () => ({ label: "", href: "", variant: "primary" as const }),
        [],
    );

    return (
        <div>
            <label className="text-xs font-semibold uppercase tracking-widest text-base-content/50 mb-1.5 block">
                Buttons
            </label>
            <RepeatingListEditor<ContentButton>
                items={buttons}
                onChange={onChange}
                defaultItem={defaultButton}
                addLabel="Add Button"
                renderItem={(btn, _index, update) => (
                    <div className="grid grid-cols-4 gap-2">
                        <input
                            type="text"
                            className="input input-bordered input-sm"
                            value={btn.label}
                            onChange={(e) => update({ label: e.target.value })}
                            placeholder="Label"
                        />
                        <input
                            type="text"
                            className="input input-bordered input-sm"
                            value={btn.href}
                            onChange={(e) => update({ href: e.target.value })}
                            placeholder="/path"
                        />
                        <input
                            type="text"
                            className="input input-bordered input-sm"
                            value={btn.icon || ""}
                            onChange={(e) => update({ icon: e.target.value || undefined })}
                            placeholder="fa-icon (optional)"
                        />
                        <select
                            className="select select-bordered select-sm"
                            value={btn.variant}
                            onChange={(e) =>
                                update({ variant: e.target.value as ContentButton["variant"] })
                            }
                        >
                            {VARIANT_OPTIONS.map((v) => (
                                <option key={v.value} value={v.value}>
                                    {v.label}
                                </option>
                            ))}
                        </select>
                    </div>
                )}
            />
        </div>
    );
}
