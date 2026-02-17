"use client";

import type { ViewMode } from "./accent";

interface ViewModeToggleProps {
    viewMode: ViewMode;
    onViewModeChange: (mode: ViewMode) => void;
}

export function ViewModeToggle({ viewMode, onViewModeChange }: ViewModeToggleProps) {
    const modes: { mode: ViewMode; icon: string; label: string }[] = [
        { mode: "table", icon: "fa-table-list", label: "Table" },
        { mode: "grid", icon: "fa-grid-2", label: "Grid" },
        { mode: "split", icon: "fa-table-columns", label: "Split" },
    ];

    return (
        <div className="join">
            {modes.map(({ mode, icon, label }) => (
                <button
                    key={mode}
                    onClick={() => onViewModeChange(mode)}
                    className={`join-item btn btn-sm gap-2 ${viewMode === mode ? "btn-primary" : "btn-ghost"}`}
                    title={label}
                >
                    <i className={`fa-duotone fa-regular ${icon}`} />
                    <span className="hidden sm:inline">{label}</span>
                </button>
            ))}
        </div>
    );
}
