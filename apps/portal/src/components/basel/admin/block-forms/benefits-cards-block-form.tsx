"use client";

import { useCallback, useState } from "react";
import { BaselFormField } from "@splits-network/basel-ui";
import { BgSelector } from "@/components/basel/admin/shared/bg-selector";
import { RepeatingListEditor } from "@/components/basel/admin/shared/repeating-list-editor";

interface BenefitsCard {
    icon?: string;
    title: string;
    description: string;
    metric?: string;
    metricLabel?: string;
}

interface BenefitsCardsBlock {
    type: "benefits-cards";
    heading?: string;
    kicker?: string;
    subtitle?: string;
    cards: BenefitsCard[];
    bg?: "base-100" | "base-200";
}

interface Props {
    block: BenefitsCardsBlock | null;
    onSave: (block: BenefitsCardsBlock) => void;
}

export function BenefitsCardsBlockForm({ block, onSave }: Props) {
    const [heading, setHeading] = useState(block?.heading ?? "");
    const [kicker, setKicker] = useState(block?.kicker ?? "");
    const [subtitle, setSubtitle] = useState(block?.subtitle ?? "");
    const [cards, setCards] = useState<BenefitsCard[]>(block?.cards ?? []);
    const [bg, setBg] = useState<BenefitsCardsBlock["bg"]>(block?.bg ?? "base-100");

    const defaultCard = useCallback(
        (): BenefitsCard => ({ icon: "", title: "", description: "", metric: "", metricLabel: "" }),
        [],
    );

    function handleSave() {
        onSave({
            type: "benefits-cards",
            heading: heading || undefined,
            kicker: kicker || undefined,
            subtitle: subtitle || undefined,
            cards,
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

            <BaselFormField label="Cards">
                <RepeatingListEditor<BenefitsCard>
                    items={cards}
                    onChange={setCards}
                    defaultItem={defaultCard}
                    addLabel="Add Card"
                    renderItem={(card, _index, update) => (
                        <div className="space-y-2">
                            <div className="grid grid-cols-2 gap-2">
                                <input
                                    type="text"
                                    className="input input-bordered input-sm"
                                    value={card.icon ?? ""}
                                    onChange={(e) => update({ icon: e.target.value || undefined })}
                                    placeholder="fa-icon (optional)"
                                />
                                <input
                                    type="text"
                                    className="input input-bordered input-sm"
                                    value={card.title}
                                    onChange={(e) => update({ title: e.target.value })}
                                    placeholder="Title"
                                />
                            </div>
                            <textarea
                                className="textarea textarea-bordered w-full"
                                rows={2}
                                value={card.description}
                                onChange={(e) => update({ description: e.target.value })}
                                placeholder="Description…"
                            />
                            <div className="grid grid-cols-2 gap-2">
                                <input
                                    type="text"
                                    className="input input-bordered input-sm"
                                    value={card.metric ?? ""}
                                    onChange={(e) => update({ metric: e.target.value || undefined })}
                                    placeholder="Metric (e.g. 98%)"
                                />
                                <input
                                    type="text"
                                    className="input input-bordered input-sm"
                                    value={card.metricLabel ?? ""}
                                    onChange={(e) => update({ metricLabel: e.target.value || undefined })}
                                    placeholder="Metric label"
                                />
                            </div>
                        </div>
                    )}
                />
            </BaselFormField>

            <BgSelector
                value={bg}
                onChange={(v) => setBg(v as BenefitsCardsBlock["bg"])}
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
