"use client";

import { useCallback, useState } from "react";
import { BaselFormField } from "@splits-network/basel-ui";
import { BgSelector } from "@/components/basel/admin/shared/bg-selector";
import { RepeatingListEditor } from "@/components/basel/admin/shared/repeating-list-editor";

interface StatItem {
    value: string;
    label: string;
    borderColor?: string;
}

interface StatsBarBlock {
    type: "stats-bar";
    stats: StatItem[];
    bg?: "neutral" | "base-100" | "base-200";
}

interface Props {
    block: StatsBarBlock | null;
    onSave: (block: StatsBarBlock) => void;
}

const BG_OPTIONS = [
    { value: "neutral", label: "Neutral" },
    { value: "base-100", label: "Light" },
    { value: "base-200", label: "Subtle" },
];

const DEFAULT_STAT: StatItem = { value: "", label: "", borderColor: "" };

export function StatsBarBlockForm({ block, onSave }: Props) {
    const [bg, setBg] = useState<StatsBarBlock["bg"]>(block?.bg ?? "base-100");
    const [stats, setStats] = useState<StatItem[]>(
        block?.stats ?? [{ ...DEFAULT_STAT }],
    );

    const defaultStat = useCallback(() => ({ ...DEFAULT_STAT }), []);

    function handleSave() {
        onSave({
            type: "stats-bar",
            stats: stats.map((s) => ({
                value: s.value,
                label: s.label,
                borderColor: s.borderColor || undefined,
            })),
            bg,
        });
    }

    return (
        <div className="space-y-5">
            <BaselFormField label="Background">
                <BgSelector
                    value={bg}
                    onChange={(v) => setBg(v as StatsBarBlock["bg"])}
                    options={BG_OPTIONS}
                />
            </BaselFormField>

            <BaselFormField label="Stats" hint="Each stat displays a large value with a descriptive label">
                <RepeatingListEditor<StatItem>
                    items={stats}
                    onChange={setStats}
                    defaultItem={defaultStat}
                    addLabel="Add Stat"
                    renderItem={(stat, _index, update) => (
                        <div className="grid grid-cols-3 gap-2">
                            <input
                                type="text"
                                className="input input-bordered input-sm"
                                value={stat.value}
                                onChange={(e) => update({ value: e.target.value })}
                                placeholder="Value (e.g. 10,000+)"
                            />
                            <input
                                type="text"
                                className="input input-bordered input-sm"
                                value={stat.label}
                                onChange={(e) => update({ label: e.target.value })}
                                placeholder="Label (e.g. Placements)"
                            />
                            <input
                                type="text"
                                className="input input-bordered input-sm"
                                value={stat.borderColor ?? ""}
                                onChange={(e) =>
                                    update({ borderColor: e.target.value || undefined })
                                }
                                placeholder="Border color (optional)"
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
