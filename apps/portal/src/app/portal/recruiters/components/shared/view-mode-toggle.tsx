import type { ViewMode } from "./accent";

interface ViewModeToggleProps {
    viewMode: ViewMode;
    onViewModeChange: (mode: ViewMode) => void;
}

const VIEW_MODES: { mode: ViewMode; icon: string; label: string }[] = [
    { mode: "table", icon: "fa-duotone fa-regular fa-table-list", label: "Table" },
    { mode: "grid", icon: "fa-duotone fa-regular fa-grid-2", label: "Grid" },
    { mode: "split", icon: "fa-duotone fa-regular fa-table-columns", label: "Split" },
];

export function ViewModeToggle({ viewMode, onViewModeChange }: ViewModeToggleProps) {
    return (
        <div className="flex items-center border-2 border-dark h-10">
            {VIEW_MODES.map(({ mode, icon, label }) => (
                <button
                    key={mode}
                    onClick={() => onViewModeChange(mode)}
                    className={`btn btn-sm gap-2 rounded-none border-0 h-full ${
                        viewMode === mode
                            ? "btn-dark text-yellow"
                            : "btn-ghost text-dark hover:bg-cream"
                    }`}
                    title={label}
                >
                    <i className={icon} />
                    <span className="hidden sm:inline">{label}</span>
                </button>
            ))}
        </div>
    );
}
