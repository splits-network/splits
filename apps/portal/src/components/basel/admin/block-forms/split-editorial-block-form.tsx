"use client";

import { useCallback, useState } from "react";
import { BaselFormField } from "@splits-network/basel-ui";
import { BgSelector } from "@/components/basel/admin/shared/bg-selector";
import { KickerFields } from "@/components/basel/admin/shared/kicker-fields";
import { RepeatingListEditor } from "@/components/basel/admin/shared/repeating-list-editor";

interface EditorialItem {
    icon?: string;
    title: string;
    body: string;
}

interface ParagraphItem {
    text: string;
}

interface SplitEditorialBlock {
    type: "split-editorial";
    sectionNumber?: string;
    kicker?: string;
    kickerColor?: string;
    heading: string;
    paragraphs?: string[];
    items?: EditorialItem[];
    image: string;
    imageAlt: string;
    imageOverlayColor?: string;
    layout: "text-left" | "text-right";
    bg?: "base-100" | "base-200";
}

interface Props {
    block: SplitEditorialBlock | null;
    onSave: (block: SplitEditorialBlock) => void;
}

const LAYOUT_OPTIONS: { value: SplitEditorialBlock["layout"]; label: string; description: string }[] = [
    { value: "text-left", label: "Text Left", description: "Text on left, image on right" },
    { value: "text-right", label: "Text Right", description: "Image on left, text on right" },
];

export function SplitEditorialBlockForm({ block, onSave }: Props) {
    const [sectionNumber, setSectionNumber] = useState(block?.sectionNumber ?? "");
    const [kicker, setKicker] = useState(block?.kicker ?? "");
    const [kickerColor, setKickerColor] = useState(block?.kickerColor ?? "primary");
    const [heading, setHeading] = useState(block?.heading ?? "");
    const [layout, setLayout] = useState<SplitEditorialBlock["layout"]>(block?.layout ?? "text-left");
    const [image, setImage] = useState(block?.image ?? "");
    const [imageAlt, setImageAlt] = useState(block?.imageAlt ?? "");
    const [imageOverlayColor, setImageOverlayColor] = useState(block?.imageOverlayColor ?? "");
    const [paragraphs, setParagraphs] = useState<ParagraphItem[]>(
        (block?.paragraphs ?? []).map((text) => ({ text })),
    );
    const [items, setItems] = useState<EditorialItem[]>(block?.items ?? []);
    const [bg, setBg] = useState<SplitEditorialBlock["bg"]>(block?.bg ?? "base-100");

    const defaultParagraph = useCallback(() => ({ text: "" }), []);
    const defaultItem = useCallback(() => ({ icon: "", title: "", body: "" }), []);

    function handleSave() {
        onSave({
            type: "split-editorial",
            sectionNumber: sectionNumber || undefined,
            kicker: kicker || undefined,
            kickerColor: kickerColor || undefined,
            heading,
            paragraphs: paragraphs.length > 0 ? paragraphs.map((p) => p.text) : undefined,
            items: items.length > 0 ? items : undefined,
            image,
            imageAlt,
            imageOverlayColor: imageOverlayColor || undefined,
            layout,
            bg,
        });
    }

    return (
        <div className="space-y-5">
            <BaselFormField label="Section Number" hint="Optional section label e.g. 01, 02">
                <input
                    type="text"
                    className="input input-bordered w-full"
                    value={sectionNumber}
                    onChange={(e) => setSectionNumber(e.target.value)}
                    placeholder="01"
                />
            </BaselFormField>

            <KickerFields
                kicker={kicker}
                kickerColor={kickerColor}
                onKickerChange={setKicker}
                onKickerColorChange={setKickerColor}
            />

            <BaselFormField label="Heading" required>
                <input
                    type="text"
                    className="input input-bordered w-full"
                    value={heading}
                    onChange={(e) => setHeading(e.target.value)}
                    placeholder="Section heading"
                />
            </BaselFormField>

            <BaselFormField label="Layout">
                <div className="grid grid-cols-2 gap-3">
                    {LAYOUT_OPTIONS.map((opt) => (
                        <button
                            key={opt.value}
                            type="button"
                            onClick={() => setLayout(opt.value)}
                            className={`
                                flex flex-col gap-1 p-3 border text-left transition-all
                                ${
                                    layout === opt.value
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

            <div className="grid grid-cols-2 gap-4">
                <BaselFormField label="Image URL" required>
                    <input
                        type="text"
                        className="input input-bordered w-full"
                        value={image}
                        onChange={(e) => setImage(e.target.value)}
                        placeholder="https://…"
                    />
                </BaselFormField>

                <BaselFormField label="Image Alt Text" required>
                    <input
                        type="text"
                        className="input input-bordered w-full"
                        value={imageAlt}
                        onChange={(e) => setImageAlt(e.target.value)}
                        placeholder="Descriptive alt text"
                    />
                </BaselFormField>
            </div>

            <BaselFormField label="Image Overlay Color" hint="Optional CSS color or token for an overlay on the image">
                <input
                    type="text"
                    className="input input-bordered w-full"
                    value={imageOverlayColor}
                    onChange={(e) => setImageOverlayColor(e.target.value)}
                    placeholder="e.g. primary, #1a1a2e"
                />
            </BaselFormField>

            <BaselFormField label="Paragraphs" hint="Each entry renders as a separate paragraph in the text column">
                <RepeatingListEditor<ParagraphItem>
                    items={paragraphs}
                    onChange={setParagraphs}
                    defaultItem={defaultParagraph}
                    addLabel="Add Paragraph"
                    renderItem={(para, _index, update) => (
                        <textarea
                            className="textarea textarea-bordered w-full"
                            rows={3}
                            value={para.text}
                            onChange={(e) => update({ text: e.target.value })}
                            placeholder="Paragraph text…"
                        />
                    )}
                />
            </BaselFormField>

            <BaselFormField label="Feature Items" hint="Optional icon + title + body list rendered in the text column">
                <RepeatingListEditor<EditorialItem>
                    items={items}
                    onChange={setItems}
                    defaultItem={defaultItem}
                    addLabel="Add Item"
                    renderItem={(item, _index, update) => (
                        <div className="space-y-2">
                            <div className="grid grid-cols-2 gap-2">
                                <input
                                    type="text"
                                    className="input input-bordered input-sm"
                                    value={item.icon ?? ""}
                                    onChange={(e) => update({ icon: e.target.value || undefined })}
                                    placeholder="fa-icon (optional)"
                                />
                                <input
                                    type="text"
                                    className="input input-bordered input-sm"
                                    value={item.title}
                                    onChange={(e) => update({ title: e.target.value })}
                                    placeholder="Title"
                                />
                            </div>
                            <textarea
                                className="textarea textarea-bordered w-full"
                                rows={2}
                                value={item.body}
                                onChange={(e) => update({ body: e.target.value })}
                                placeholder="Body text…"
                            />
                        </div>
                    )}
                />
            </BaselFormField>

            <BgSelector
                value={bg}
                onChange={(v) => setBg(v as SplitEditorialBlock["bg"])}
            />

            <div className="pt-2">
                <button
                    type="button"
                    onClick={handleSave}
                    disabled={!heading.trim() || !image.trim() || !imageAlt.trim()}
                    className="btn btn-primary"
                >
                    Save
                </button>
            </div>
        </div>
    );
}
