import type { ViewMode } from "./accent";

interface ViewModeToggleProps {
    viewMode: ViewMode;
    onViewModeChange: (mode: ViewMode) => void;
}

const VIEW_MODES: { mode: ViewMode; icon: string; label: string }[] = [
    { mode: "grid", icon: "fa-duotone fa-regular fa-grid-2", label: "Grid" },
    { mode: "table", icon: "fa-duotone fa-regular fa-table-list", label: "Table" },
    { mode: "split", icon: "fa-duotone fa-regular fa-table-columns", label: "Split" },
];

export function ViewModeToggle({ viewMode, onViewModeChange }: ViewModeToggleProps) {
    return (
        <div className="flex items-center border-detail">
            {VIEW_MODES.map(({ mode, icon, label }) => (
                <button
                    key={mode}
                    onClick={() => onViewModeChange(mode)}
                    className={[
                        "flex items-center gap-2 px-4 py-2 text-xs font-bold uppercase tracking-wider transition-colors",
                        viewMode === mode
                            ? "bg-dark text-yellow"
                            : "bg-transparent text-dark hover:bg-cream",
                    ].join(" ")}
                    title={label}
                >
                    <i className={icon} />
                    <span className="hidden sm:inline">{label}</span>
                </button>
            ))}
        </div>
    );
}
