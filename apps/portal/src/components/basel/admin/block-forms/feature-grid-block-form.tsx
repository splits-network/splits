"use client";

import { useCallback, useState } from "react";
import { BaselFormField } from "@splits-network/basel-ui";
import { BgSelector } from "@/components/basel/admin/shared/bg-selector";
import { KickerFields } from "@/components/basel/admin/shared/kicker-fields";
import { RepeatingListEditor } from "@/components/basel/admin/shared/repeating-list-editor";

interface FeatureGridItem {
    icon?: string;
    iconColor?: string;
    badge?: string;
    title: string;
    description: string;
    stats?: string;
}

interface FeatureGridBlock {
    type: "feature-grid";
    heading?: string;
    kicker?: string;
    subtitle?: string;
    columns?: 2 | 3 | 4;
    items: FeatureGridItem[];
    bg?: "base-100" | "base-200";
}

interface Props {
    block: FeatureGridBlock | null;
    onSave: (block: FeatureGridBlock) => void;
}

const COLUMN_OPTIONS: { value: 2 | 3 | 4; label: string }[] = [
    { value: 2, label: "2 Columns" },
    { value: 3, label: "3 Columns" },
    { value: 4, label: "4 Columns" },
];

export function FeatureGridBlockForm({ block, onSave }: Props) {
    const [heading, setHeading] = useState(block?.heading ?? "");
    const [kicker, setKicker] = useState(block?.kicker ?? "");
    const [subtitle, setSubtitle] = useState(block?.subtitle ?? "");
    const [columns, setColumns] = useState<2 | 3 | 4>(block?.columns ?? 3);
    const [items, setItems] = useState<FeatureGridItem[]>(block?.items ?? []);
    const [bg, setBg] = useState<FeatureGridBlock["bg"]>(block?.bg ?? "base-100");

    const defaultItem = useCallback(
        (): FeatureGridItem => ({ icon: "", title: "", description: "", iconColor: "", badge: "", stats: "" }),
        [],
    );

    function handleSave() {
        onSave({
            type: "feature-grid",
            heading: heading || undefined,
            kicker: kicker || undefined,
            subtitle: subtitle || undefined,
            columns,
            items,
            bg,
        });
    }

    return (
        <div className="space-y-5">
            <BaselFormField label="Kicker Text" hint="Small label above the heading">
                <input
                    type="text"
                    className="input input-bordered w-full"
                    value={kicker}
                    onChange={(e) => setKicker(e.target.value)}
                    placeholder="Section label"
                />
            </BaselFormField>

            <BaselFormField label="Heading">
                <input
                    type="text"
                    className="input input-bordered w-full"
                    value={heading}
                    onChange={(e) => setHeading(e.target.value)}
                    placeholder="Section heading"
                />
            </BaselFormField>

            <BaselFormField label="Subtitle">
                <input
                    type="text"
                    className="input input-bordered w-full"
                    value={subtitle}
                    onChange={(e) => setSubtitle(e.target.value)}
                    placeholder="Supporting subtitle"
                />
            </BaselFormField>

            <BaselFormField label="Columns">
                <div className="flex gap-2">
                    {COLUMN_OPTIONS.map((opt) => (
                        <button
                            key={opt.value}
                            type="button"
                            onClick={() => setColumns(opt.value)}
                            className={`
                                px-4 py-2 text-sm font-medium border transition-all
                                ${
                                    columns === opt.value
                                        ? "border-primary bg-primary/10 text-primary"
                                        : "border-base-300 bg-base-100 text-base-content/70 hover:border-base-content/30"
                                }
                            `}
                        >
                            {opt.label}
                        </button>
                    ))}
                </div>
            </BaselFormField>

            <BaselFormField label="Grid Items">
                <RepeatingListEditor<FeatureGridItem>
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
                                    value={item.iconColor ?? ""}
                                    onChange={(e) => update({ iconColor: e.target.value || undefined })}
                                    placeholder="Icon color (optional)"
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-2">
                                <input
                                    type="text"
                                    className="input input-bordered input-sm"
                                    value={item.title}
                                    onChange={(e) => update({ title: e.target.value })}
                                    placeholder="Title"
                                />
                                <input
                                    type="text"
                                    className="input input-bordered input-sm"
                                    value={item.badge ?? ""}
                                    onChange={(e) => update({ badge: e.target.value || undefined })}
                                    placeholder="Badge (optional)"
                                />
                            </div>
                            <textarea
                                className="textarea textarea-bordered w-full"
                                rows={2}
                                value={item.description}
                                onChange={(e) => update({ description: e.target.value })}
                                placeholder="Description…"
                            />
                            <input
                                type="text"
                                className="input input-bordered input-sm w-full"
                                value={item.stats ?? ""}
                                onChange={(e) => update({ stats: e.target.value || undefined })}
                                placeholder="Stats (optional, e.g. 98%)"
                            />
                        </div>
                    )}
                />
            </BaselFormField>

            <BgSelector
                value={bg}
                onChange={(v) => setBg(v as FeatureGridBlock["bg"])}
            />

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
