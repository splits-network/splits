"use client";

export type ViewMode = "grid" | "table" | "split";

interface ControlsBarProps {
    showing: number;
    total: number;
    searchInput: string;
    viewMode: ViewMode;
    onViewModeChange: (mode: ViewMode) => void;
    loading?: boolean;
}

const VIEW_ICONS: Record<ViewMode, string> = {
    table: "fa-duotone fa-regular fa-table-list",
    grid: "fa-duotone fa-regular fa-grid-2",
    split: "fa-duotone fa-regular fa-columns-3",
};

export default function ControlsBar({
    showing,
    total,
    searchInput,
    viewMode,
    onViewModeChange,
    loading,
}: ControlsBarProps) {
    return (
        <section className="controls-bar sticky top-0 z-30 bg-base-100 border-b-2 border-base-300 opacity-0">
            <div className="container mx-auto px-6 lg:px-12 py-4">
                <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
                    {/* Left: results info */}
                    <div className="flex items-center gap-3">
                        <span className="text-xs uppercase tracking-wider text-base-content/40 font-bold">
                            {loading ? (
                                <span className="loading loading-dots loading-xs" />
                            ) : (
                                `${showing} of ${total} recruiters`
                            )}
                        </span>
                        {searchInput && (
                            <span className="text-[10px] uppercase tracking-[0.15em] font-bold px-2 py-1 bg-primary/10 text-primary">
                                Filtered: &ldquo;{searchInput}&rdquo;
                            </span>
                        )}
                    </div>

                    {/* Right: view toggle */}
                    <div className="flex items-center gap-4">
                        <span className="text-xs uppercase tracking-wider text-base-content/40 font-bold hidden sm:block">
                            {total} results
                        </span>

                        <div className="flex bg-base-200 p-1">
                            {(Object.keys(VIEW_ICONS) as ViewMode[]).map(
                                (mode) => (
                                    <button
                                        key={mode}
                                        onClick={() => onViewModeChange(mode)}
                                        className={`px-3 py-1.5 text-xs font-bold uppercase tracking-wider transition-colors ${
                                            viewMode === mode
                                                ? "bg-primary text-primary-content"
                                                : "text-base-content/50 hover:text-base-content"
                                        }`}
                                    >
                                        <i
                                            className={`${VIEW_ICONS[mode]} mr-1.5`}
                                        />
                                        <span className="hidden sm:inline">
                                            {mode.charAt(0).toUpperCase() +
                                                mode.slice(1)}
                                        </span>
                                    </button>
                                ),
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
