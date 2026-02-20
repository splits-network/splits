"use client";

interface BgOption {
    value: string;
    label: string;
}

interface BgSelectorProps {
    value: string | undefined;
    onChange: (value: string) => void;
    options?: BgOption[];
    label?: string;
}

const DEFAULT_OPTIONS: BgOption[] = [
    { value: "base-100", label: "Light" },
    { value: "base-200", label: "Subtle" },
];

export function BgSelector({
    value,
    onChange,
    options = DEFAULT_OPTIONS,
    label = "Background",
}: BgSelectorProps) {
    return (
        <div>
            <label className="text-xs font-semibold uppercase tracking-widest text-base-content/50 mb-1.5 block">
                {label}
            </label>
            <div className="flex gap-2 flex-wrap">
                {options.map((opt) => (
                    <button
                        key={opt.value}
                        type="button"
                        onClick={() => onChange(opt.value)}
                        className={`
                            px-3 py-1.5 text-xs font-medium border transition-all
                            ${
                                value === opt.value
                                    ? "border-primary bg-primary/10 text-primary"
                                    : "border-base-300 bg-base-100 text-base-content/70 hover:border-base-content/30"
                            }
                        `}
                    >
                        {opt.label}
                    </button>
                ))}
            </div>
        </div>
    );
}
