"use client";

import { useCallback, useState } from "react";
import { BaselFormField } from "@splits-network/basel-ui";
import { BgSelector } from "@/components/basel/admin/shared/bg-selector";
import { KickerFields } from "@/components/basel/admin/shared/kicker-fields";
import { RepeatingListEditor } from "@/components/basel/admin/shared/repeating-list-editor";

interface FaqItem {
    question: string;
    answer: string;
}

interface FaqBlock {
    type: "faq";
    heading?: string;
    kicker?: string;
    subtitle?: string;
    items: FaqItem[];
    bg?: "neutral" | "base-100" | "base-200";
}

interface Props {
    block: FaqBlock | null;
    onSave: (block: FaqBlock) => void;
}

const BG_OPTIONS = [
    { value: "neutral", label: "Neutral" },
    { value: "base-100", label: "Light" },
    { value: "base-200", label: "Subtle" },
];

const DEFAULT_ITEM: FaqItem = { question: "", answer: "" };

export function FaqBlockForm({ block, onSave }: Props) {
    const [kicker, setKicker] = useState(block?.kicker ?? "");
    const [heading, setHeading] = useState(block?.heading ?? "");
    const [subtitle, setSubtitle] = useState(block?.subtitle ?? "");
    const [bg, setBg] = useState<FaqBlock["bg"]>(block?.bg ?? "base-100");
    const [items, setItems] = useState<FaqItem[]>(
        block?.items?.length ? block.items : [{ ...DEFAULT_ITEM }],
    );

    const defaultItem = useCallback(() => ({ ...DEFAULT_ITEM }), []);

    function handleSave() {
        onSave({
            type: "faq",
            kicker: kicker || undefined,
            heading: heading || undefined,
            subtitle: subtitle || undefined,
            items,
            bg,
        });
    }

    return (
        <div className="space-y-5">
            <KickerFields
                kicker={kicker}
                onKickerChange={setKicker}
                // kickerColor is not used on this block; provide a no-op handler
                onKickerColorChange={() => undefined}
            />

            <BaselFormField label="Heading">
                <input
                    type="text"
                    className="input input-bordered w-full"
                    value={heading}
                    onChange={(e) => setHeading(e.target.value)}
                    placeholder="Frequently Asked Questions"
                />
            </BaselFormField>

            <BaselFormField label="Subtitle" hint="Supporting text displayed below the heading">
                <input
                    type="text"
                    className="input input-bordered w-full"
                    value={subtitle}
                    onChange={(e) => setSubtitle(e.target.value)}
                    placeholder="Everything you need to know…"
                />
            </BaselFormField>

            <BaselFormField label="Background">
                <BgSelector
                    value={bg}
                    onChange={(v) => setBg(v as FaqBlock["bg"])}
                    options={BG_OPTIONS}
                />
            </BaselFormField>

            <BaselFormField label="FAQ Items">
                <RepeatingListEditor<FaqItem>
                    items={items}
                    onChange={setItems}
                    defaultItem={defaultItem}
                    addLabel="Add Question"
                    renderItem={(item, _index, update) => (
                        <div className="space-y-2">
                            <input
                                type="text"
                                className="input input-bordered w-full input-sm"
                                value={item.question}
                                onChange={(e) => update({ question: e.target.value })}
                                placeholder="Question"
                            />
                            <textarea
                                className="textarea textarea-bordered w-full"
                                rows={3}
                                value={item.answer}
                                onChange={(e) => update({ answer: e.target.value })}
                                placeholder="Answer"
                            />
                        </div>
                    )}
                />
            </BaselFormField>

            <div className="pt-2">
                <button
                    type="button"
                    onClick={handleSave}
                    className="btn btn-primary"
                >
                    Save
                </button>
            </div>
        </div>
    );
}
