"use client";

import { useState } from "react";
import { BaselFormField } from "@splits-network/basel-ui";
import type { ContentButton } from "@splits-network/shared-types";
import { BgSelector } from "@/components/basel/admin/shared/bg-selector";
import { ButtonListEditor } from "@/components/basel/admin/shared/button-list-editor";

interface CtaBlock {
    type: "cta";
    heading: string;
    subtitle?: string;
    buttons: ContentButton[];
    contactEmail?: string;
    bg?: "primary" | "secondary" | "neutral" | "base-100";
}

interface Props {
    block: CtaBlock | null;
    onSave: (block: CtaBlock) => void;
}

const BG_OPTIONS = [
    { value: "primary", label: "Primary" },
    { value: "secondary", label: "Secondary" },
    { value: "neutral", label: "Neutral" },
    { value: "base-100", label: "Light" },
];

export function CtaBlockForm({ block, onSave }: Props) {
    const [heading, setHeading] = useState(block?.heading ?? "");
    const [subtitle, setSubtitle] = useState(block?.subtitle ?? "");
    const [buttons, setButtons] = useState<ContentButton[]>(block?.buttons ?? []);
    const [contactEmail, setContactEmail] = useState(block?.contactEmail ?? "");
    const [bg, setBg] = useState<CtaBlock["bg"]>(block?.bg ?? "primary");

    function handleSave() {
        onSave({
            type: "cta",
            heading,
            subtitle: subtitle || undefined,
            buttons,
            contactEmail: contactEmail || undefined,
            bg,
        });
    }

    return (
        <div className="space-y-5">
            <BaselFormField label="Heading" required>
                <input
                    type="text"
                    className="input input-bordered w-full"
                    value={heading}
                    onChange={(e) => setHeading(e.target.value)}
                    placeholder="Call to action headline"
                />
            </BaselFormField>

            <BaselFormField label="Subtitle">
                <textarea
                    className="textarea textarea-bordered w-full"
                    rows={3}
                    value={subtitle}
                    onChange={(e) => setSubtitle(e.target.value)}
                    placeholder="Supporting text below the heading…"
                />
            </BaselFormField>

            <BaselFormField label="Buttons">
                <ButtonListEditor buttons={buttons} onChange={setButtons} />
            </BaselFormField>

            <BaselFormField label="Contact Email" hint="Optional email address displayed as a secondary contact option">
                <input
                    type="text"
                    className="input input-bordered w-full"
                    value={contactEmail}
                    onChange={(e) => setContactEmail(e.target.value)}
                    placeholder="hello@example.com"
                />
            </BaselFormField>

            <BgSelector
                value={bg}
                onChange={(v) => setBg(v as CtaBlock["bg"])}
                options={BG_OPTIONS}
            />

            <div className="pt-2">
                <button
                    type="button"
                    onClick={handleSave}
                    disabled={!heading.trim()}
                    className="btn btn-primary"
                >
                    Save
                </button>
            </div>
        </div>
    );
}
