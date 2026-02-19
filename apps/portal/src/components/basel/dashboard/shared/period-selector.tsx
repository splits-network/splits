"use client";

interface PeriodSelectorProps {
    value: number;
    onChange: (months: number) => void;
    className?: string;
}

const PERIODS = [
    { label: "3M", months: 3 },
    { label: "6M", months: 6 },
    { label: "1Y", months: 12 },
    { label: "2Y", months: 24 },
];

/**
 * Basel-styled period selector — compact pill toggle for dashboard trend periods.
 */
export function PeriodSelector({ value, onChange, className }: PeriodSelectorProps) {
    return (
        <div className={`inline-flex border border-base-300 ${className || ""}`}>
            {PERIODS.map((p) => (
                <button
                    key={p.months}
                    onClick={() => onChange(p.months)}
                    className={`px-3 py-1 text-[10px] font-semibold uppercase tracking-wider transition-colors cursor-pointer ${
                        value === p.months
                            ? "bg-neutral text-neutral-content"
                            : "bg-base-100 text-base-content/50 hover:bg-base-200"
                    }`}
                >
                    {p.label}
                </button>
            ))}
        </div>
    );
}
