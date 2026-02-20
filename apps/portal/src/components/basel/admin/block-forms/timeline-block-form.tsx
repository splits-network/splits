"use client";

import { useCallback, useState } from "react";
import { BaselFormField } from "@splits-network/basel-ui";
import { BgSelector } from "@/components/basel/admin/shared/bg-selector";
import { KickerFields } from "@/components/basel/admin/shared/kicker-fields";
import { RepeatingListEditor } from "@/components/basel/admin/shared/repeating-list-editor";

interface TimelineStep {
    number?: number;
    title: string;
    description: string;
    icon?: string;
}

interface TimelineBlock {
    type: "timeline";
    heading?: string;
    kicker?: string;
    subtitle?: string;
    steps: TimelineStep[];
    bg?: "base-100" | "base-200";
}

interface Props {
    block: TimelineBlock | null;
    onSave: (block: TimelineBlock) => void;
}

const DEFAULT_STEP: TimelineStep = { number: undefined, title: "", description: "", icon: "" };

export function TimelineBlockForm({ block, onSave }: Props) {
    const [kicker, setKicker] = useState(block?.kicker ?? "");
    const [heading, setHeading] = useState(block?.heading ?? "");
    const [subtitle, setSubtitle] = useState(block?.subtitle ?? "");
    const [bg, setBg] = useState<TimelineBlock["bg"]>(block?.bg ?? "base-100");
    const [steps, setSteps] = useState<TimelineStep[]>(
        block?.steps?.length ? block.steps : [{ ...DEFAULT_STEP }],
    );

    const defaultStep = useCallback(() => ({ ...DEFAULT_STEP }), []);

    function handleSave() {
        onSave({
            type: "timeline",
            kicker: kicker || undefined,
            heading: heading || undefined,
            subtitle: subtitle || undefined,
            steps: steps.map((s) => ({
                number: s.number ?? undefined,
                title: s.title,
                description: s.description,
                icon: s.icon || undefined,
            })),
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
                    placeholder="How it works"
                />
            </BaselFormField>

            <BaselFormField label="Subtitle" hint="Supporting text displayed below the heading">
                <input
                    type="text"
                    className="input input-bordered w-full"
                    value={subtitle}
                    onChange={(e) => setSubtitle(e.target.value)}
                    placeholder="A step-by-step overview…"
                />
            </BaselFormField>

            <BaselFormField label="Background">
                <BgSelector
                    value={bg}
                    onChange={(v) => setBg(v as TimelineBlock["bg"])}
                />
            </BaselFormField>

            <BaselFormField label="Steps">
                <RepeatingListEditor<TimelineStep>
                    items={steps}
                    onChange={setSteps}
                    defaultItem={defaultStep}
                    addLabel="Add Step"
                    renderItem={(step, _index, update) => (
                        <div className="space-y-2">
                            <div className="grid grid-cols-[80px_1fr_1fr] gap-2">
                                <input
                                    type="number"
                                    className="input input-bordered input-sm w-full"
                                    value={step.number ?? ""}
                                    onChange={(e) =>
                                        update({
                                            number: e.target.value
                                                ? parseInt(e.target.value, 10)
                                                : undefined,
                                        })
                                    }
                                    placeholder="No."
                                    min={1}
                                />
                                <input
                                    type="text"
                                    className="input input-bordered input-sm w-full"
                                    value={step.title}
                                    onChange={(e) => update({ title: e.target.value })}
                                    placeholder="Step title"
                                />
                                <input
                                    type="text"
                                    className="input input-bordered input-sm w-full"
                                    value={step.icon ?? ""}
                                    onChange={(e) =>
                                        update({ icon: e.target.value || undefined })
                                    }
                                    placeholder="fa-icon (optional)"
                                />
                            </div>
                            <textarea
                                className="textarea textarea-bordered w-full"
                                rows={2}
                                value={step.description}
                                onChange={(e) => update({ description: e.target.value })}
                                placeholder="Step description"
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
