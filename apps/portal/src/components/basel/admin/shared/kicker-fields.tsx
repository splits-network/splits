"use client";

import { BaselFormField } from "@splits-network/basel-ui";

interface KickerFieldsProps {
    kicker: string;
    kickerColor?: string;
    onKickerChange: (value: string) => void;
    onKickerColorChange: (value: string) => void;
}

const KICKER_COLORS = [
    { value: "primary", label: "Primary" },
    { value: "secondary", label: "Secondary" },
    { value: "accent", label: "Accent" },
];

export function KickerFields({
    kicker,
    kickerColor,
    onKickerChange,
    onKickerColorChange,
}: KickerFieldsProps) {
    return (
        <div className="grid grid-cols-2 gap-4">
            <BaselFormField label="Kicker Text" hint="Small label above the heading">
                <input
                    type="text"
                    className="input input-bordered w-full"
                    value={kicker}
                    onChange={(e) => onKickerChange(e.target.value)}
                    placeholder="Section label"
                />
            </BaselFormField>
            <BaselFormField label="Kicker Color">
                <select
                    className="select select-bordered w-full"
                    value={kickerColor || "primary"}
                    onChange={(e) => onKickerColorChange(e.target.value)}
                >
                    {KICKER_COLORS.map((c) => (
                        <option key={c.value} value={c.value}>
                            {c.label}
                        </option>
                    ))}
                </select>
            </BaselFormField>
        </div>
    );
}
