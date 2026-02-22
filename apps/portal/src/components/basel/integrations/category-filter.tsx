"use client";

import type { IntegrationCategory } from "@splits-network/shared-types";

interface CategoryItem {
    value: IntegrationCategory | "all";
    label: string;
    icon: string;
    count: number;
}

interface CategoryFilterProps {
    categories: CategoryItem[];
    active: IntegrationCategory | "all";
    onChange: (category: IntegrationCategory | "all") => void;
}

export function CategoryFilter({ categories, active, onChange }: CategoryFilterProps) {
    return (
        <div className="flex items-center gap-2 flex-wrap">
            {categories.map((cat) => (
                <button
                    key={cat.value}
                    onClick={() => onChange(cat.value)}
                    className={`flex items-center gap-2 px-4 py-2 text-xs font-bold uppercase tracking-wider transition-all border ${
                        active === cat.value
                            ? "bg-primary text-primary-content border-primary"
                            : "bg-base-100 text-base-content/50 border-base-300 hover:border-base-content/20 hover:text-base-content/70"
                    }`}
                >
                    <i className={`${cat.icon} text-[11px]`} />
                    {cat.label}
                    <span
                        className={`text-[10px] font-bold px-1.5 py-0.5 min-w-[18px] text-center ${
                            active === cat.value
                                ? "bg-primary-content/20 text-primary-content"
                                : "bg-base-200 text-base-content/40"
                        }`}
                    >
                        {cat.count}
                    </span>
                </button>
            ))}
        </div>
    );
}
