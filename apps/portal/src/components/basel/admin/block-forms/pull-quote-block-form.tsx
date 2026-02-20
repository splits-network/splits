"use client";

import { useState } from "react";
import { BaselFormField } from "@splits-network/basel-ui";
import { BgSelector } from "@/components/basel/admin/shared/bg-selector";

interface PullQuoteBlock {
    type: "pull-quote";
    quote: string;
    citation?: string;
    bg?: "neutral" | "primary" | "secondary" | "base-100" | "base-200";
    style?: "left-border" | "centered";
}

interface Props {
    block: PullQuoteBlock | null;
    onSave: (block: PullQuoteBlock) => void;
}

const BG_OPTIONS = [
    { value: "neutral", label: "Neutral" },
    { value: "primary", label: "Primary" },
    { value: "secondary", label: "Secondary" },
    { value: "base-100", label: "Light" },
    { value: "base-200", label: "Subtle" },
];

const STYLE_OPTIONS: { value: PullQuoteBlock["style"]; label: string; description: string }[] = [
    { value: "left-border", label: "Left Border", description: "Quote with a left accent line" },
    { value: "centered", label: "Centered", description: "Centered quote with decorative marks" },
];

export function PullQuoteBlockForm({ block, onSave }: Props) {
    const [quote, setQuote] = useState(block?.quote ?? "");
    const [citation, setCitation] = useState(block?.citation ?? "");
    const [bg, setBg] = useState<PullQuoteBlock["bg"]>(block?.bg ?? "base-100");
    const [style, setStyle] = useState<PullQuoteBlock["style"]>(block?.style ?? "left-border");

    function handleSave() {
        onSave({
            type: "pull-quote",
            quote,
            citation: citation || undefined,
            bg,
            style,
        });
    }

    return (
        <div className="space-y-5">
            <BaselFormField label="Quote" required hint="The pull quote text to display prominently">
                <textarea
                    className="textarea textarea-bordered w-full"
                    rows={4}
                    value={quote}
                    onChange={(e) => setQuote(e.target.value)}
                    placeholder="Enter the pull quote…"
                />
            </BaselFormField>

            <BaselFormField label="Citation" hint="Optional attribution (e.g. author, title, company)">
                <input
                    type="text"
                    className="input input-bordered w-full"
                    value={citation}
                    onChange={(e) => setCitation(e.target.value)}
                    placeholder="Jane Smith, CEO of Acme Corp"
                />
            </BaselFormField>

            <BaselFormField label="Background">
                <BgSelector value={bg} onChange={(v) => setBg(v as PullQuoteBlock["bg"])} options={BG_OPTIONS} />
            </BaselFormField>

            <BaselFormField label="Style">
                <div className="grid grid-cols-2 gap-3">
                    {STYLE_OPTIONS.map((opt) => (
                        <button
                            key={opt.value}
                            type="button"
                            onClick={() => setStyle(opt.value)}
                            className={`
                                flex flex-col gap-1 p-3 border text-left transition-all
                                ${
                                    style === opt.value
                                        ? "border-primary bg-primary/10 text-primary"
                                        : "border-base-300 bg-base-100 text-base-content/70 hover:border-base-content/30"
                                }
                            `}
                        >
                            <span className="text-sm font-semibold">{opt.label}</span>
                            <span className="text-xs opacity-70">{opt.description}</span>
                        </button>
                    ))}
                </div>
            </BaselFormField>

            <div className="pt-2">
                <button
                    type="button"
                    onClick={handleSave}
                    disabled={!quote.trim()}
                    className="btn btn-primary"
                >
                    Save
                </button>
            </div>
        </div>
    );
}
