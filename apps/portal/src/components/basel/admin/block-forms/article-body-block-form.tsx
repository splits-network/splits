"use client";

import { useCallback, useState } from "react";
import { BaselFormField } from "@splits-network/basel-ui";
import { BgSelector } from "@/components/basel/admin/shared/bg-selector";
import { KickerFields } from "@/components/basel/admin/shared/kicker-fields";
import { RepeatingListEditor } from "@/components/basel/admin/shared/repeating-list-editor";

interface ArticleBodyBlock {
    type: "article-body";
    sectionNumber?: string;
    kicker?: string;
    kickerColor?: string;
    heading: string;
    paragraphs: string[];
    bg?: "base-100" | "base-200";
}

interface Props {
    block: ArticleBodyBlock | null;
    onSave: (block: ArticleBodyBlock) => void;
}

interface ParagraphItem {
    text: string;
}

export function ArticleBodyBlockForm({ block, onSave }: Props) {
    const [sectionNumber, setSectionNumber] = useState(block?.sectionNumber ?? "");
    const [kicker, setKicker] = useState(block?.kicker ?? "");
    const [kickerColor, setKickerColor] = useState(block?.kickerColor ?? "primary");
    const [heading, setHeading] = useState(block?.heading ?? "");
    const [paragraphs, setParagraphs] = useState<ParagraphItem[]>(
        (block?.paragraphs ?? []).map((text) => ({ text })),
    );
    const [bg, setBg] = useState<ArticleBodyBlock["bg"]>(block?.bg ?? "base-100");

    const defaultParagraph = useCallback(() => ({ text: "" }), []);

    function handleSave() {
        onSave({
            type: "article-body",
            sectionNumber: sectionNumber || undefined,
            kicker: kicker || undefined,
            kickerColor: kickerColor || undefined,
            heading,
            paragraphs: paragraphs.map((p) => p.text),
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

            <BaselFormField label="Paragraphs" hint="Each entry renders as a separate paragraph">
                <RepeatingListEditor<ParagraphItem>
                    items={paragraphs}
                    onChange={setParagraphs}
                    defaultItem={defaultParagraph}
                    addLabel="Add Paragraph"
                    renderItem={(para, _index, update) => (
                        <textarea
                            className="textarea textarea-bordered w-full"
                            rows={4}
                            value={para.text}
                            onChange={(e) => update({ text: e.target.value })}
                            placeholder="Paragraph text…"
                        />
                    )}
                />
            </BaselFormField>

            <BgSelector
                value={bg}
                onChange={(v) => setBg(v as ArticleBodyBlock["bg"])}
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
