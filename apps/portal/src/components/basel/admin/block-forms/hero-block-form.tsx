"use client";

import { useCallback, useState } from "react";
import { BaselFormField } from "@splits-network/basel-ui";
import type { ContentButton } from "@splits-network/shared-types";
import { BgSelector } from "@/components/basel/admin/shared/bg-selector";
import { KickerFields } from "@/components/basel/admin/shared/kicker-fields";
import { ButtonListEditor } from "@/components/basel/admin/shared/button-list-editor";
import { RepeatingListEditor } from "@/components/basel/admin/shared/repeating-list-editor";

interface HeadlineWord {
    text: string;
    accent?: boolean;
}

interface MetaItem {
    icon?: string;
    label: string;
}

interface HeroBlock {
    type: "hero";
    kicker?: string;
    kickerIcon?: string;
    headlineWords: HeadlineWord[];
    subtitle?: string;
    image?: string;
    imageAlt?: string;
    meta?: MetaItem[];
    buttons?: ContentButton[];
}

interface Props {
    block: HeroBlock | null;
    onSave: (block: HeroBlock) => void;
}

export function HeroBlockForm({ block, onSave }: Props) {
    const [kicker, setKicker] = useState(block?.kicker ?? "");
    const [kickerColor, setKickerColor] = useState(block?.kicker ?? "primary");
    const [kickerIcon, setKickerIcon] = useState(block?.kickerIcon ?? "");
    const [headlineWords, setHeadlineWords] = useState<HeadlineWord[]>(
        block?.headlineWords ?? [],
    );
    const [subtitle, setSubtitle] = useState(block?.subtitle ?? "");
    const [image, setImage] = useState(block?.image ?? "");
    const [imageAlt, setImageAlt] = useState(block?.imageAlt ?? "");
    const [meta, setMeta] = useState<MetaItem[]>(block?.meta ?? []);
    const [buttons, setButtons] = useState<ContentButton[]>(block?.buttons ?? []);

    const defaultHeadlineWord = useCallback(() => ({ text: "", accent: false }), []);
    const defaultMetaItem = useCallback(() => ({ icon: "", label: "" }), []);

    function handleSave() {
        onSave({
            type: "hero",
            kicker: kicker || undefined,
            kickerIcon: kickerIcon || undefined,
            headlineWords,
            subtitle: subtitle || undefined,
            image: image || undefined,
            imageAlt: imageAlt || undefined,
            meta: meta.length > 0 ? meta : undefined,
            buttons: buttons.length > 0 ? buttons : undefined,
        });
    }

    return (
        <div className="space-y-5">
            <KickerFields
                kicker={kicker}
                kickerColor={kickerColor}
                onKickerChange={setKicker}
                onKickerColorChange={setKickerColor}
            />

            <BaselFormField label="Kicker Icon" hint="FontAwesome class e.g. fa-star">
                <input
                    type="text"
                    className="input input-bordered w-full"
                    value={kickerIcon}
                    onChange={(e) => setKickerIcon(e.target.value)}
                    placeholder="fa-duotone fa-regular fa-star"
                />
            </BaselFormField>

            <BaselFormField label="Headline Words" hint="Each word can optionally be highlighted as an accent">
                <RepeatingListEditor<HeadlineWord>
                    items={headlineWords}
                    onChange={setHeadlineWords}
                    defaultItem={defaultHeadlineWord}
                    addLabel="Add Word"
                    renderItem={(word, _index, update) => (
                        <div className="flex items-center gap-3">
                            <input
                                type="text"
                                className="input input-bordered input-sm flex-1"
                                value={word.text}
                                onChange={(e) => update({ text: e.target.value })}
                                placeholder="Word"
                            />
                            <label className="flex items-center gap-1.5 text-sm cursor-pointer select-none shrink-0">
                                <input
                                    type="checkbox"
                                    className="checkbox checkbox-sm checkbox-primary"
                                    checked={word.accent ?? false}
                                    onChange={(e) => update({ accent: e.target.checked })}
                                />
                                Accent
                            </label>
                        </div>
                    )}
                />
            </BaselFormField>

            <BaselFormField label="Subtitle">
                <textarea
                    className="textarea textarea-bordered w-full"
                    rows={3}
                    value={subtitle}
                    onChange={(e) => setSubtitle(e.target.value)}
                    placeholder="Supporting description below the headline…"
                />
            </BaselFormField>

            <div className="grid grid-cols-2 gap-4">
                <BaselFormField label="Image URL">
                    <input
                        type="text"
                        className="input input-bordered w-full"
                        value={image}
                        onChange={(e) => setImage(e.target.value)}
                        placeholder="https://…"
                    />
                </BaselFormField>

                <BaselFormField label="Image Alt Text">
                    <input
                        type="text"
                        className="input input-bordered w-full"
                        value={imageAlt}
                        onChange={(e) => setImageAlt(e.target.value)}
                        placeholder="Descriptive alt text"
                    />
                </BaselFormField>
            </div>

            <BaselFormField label="Meta Items" hint="Small icon + label pairs displayed near the hero (e.g. stats or tags)">
                <RepeatingListEditor<MetaItem>
                    items={meta}
                    onChange={setMeta}
                    defaultItem={defaultMetaItem}
                    addLabel="Add Meta Item"
                    renderItem={(item, _index, update) => (
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
                                value={item.label}
                                onChange={(e) => update({ label: e.target.value })}
                                placeholder="Label"
                            />
                        </div>
                    )}
                />
            </BaselFormField>

            <BaselFormField label="Buttons">
                <ButtonListEditor buttons={buttons} onChange={setButtons} />
            </BaselFormField>

            <div className="pt-2">
                <button
                    type="button"
                    onClick={handleSave}
                    disabled={headlineWords.length === 0}
                    className="btn btn-primary"
                >
                    Save
                </button>
            </div>
        </div>
    );
}
