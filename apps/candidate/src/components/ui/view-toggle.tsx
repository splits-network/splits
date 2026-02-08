"use client";

export type ViewMode = "grid" | "table" | "browse";

interface ViewToggleProps {
    viewMode: ViewMode;
    onViewChange: (view: ViewMode) => void;
}

export function ViewToggle({ viewMode, onViewChange }: ViewToggleProps) {
    return (
        <div className="join">
            <button
                className={`btn join-item btn-sm ${viewMode === "grid" ? "btn-primary" : ""}`}
                onClick={() => onViewChange("grid")}
                aria-label={viewMode === "grid" ? "Grid view active" : "Switch to grid view"}
                title="Grid view"
            >
                <i className="fa-duotone fa-regular fa-grid-2"></i>
            </button>
            <button
                className={`btn join-item btn-sm ${viewMode === "table" ? "btn-primary" : ""}`}
                onClick={() => onViewChange("table")}
                aria-label={viewMode === "table" ? "Table view active" : "Switch to table view"}
                title="Table view"
            >
                <i className="fa-duotone fa-regular fa-list"></i>
            </button>
            <button
                className={`btn join-item btn-sm ${viewMode === "browse" ? "btn-primary" : ""}`}
                onClick={() => onViewChange("browse")}
                aria-label={viewMode === "browse" ? "Browse view active" : "Switch to browse view"}
                title="Browse view"
            >
                <i className="fa-duotone fa-regular fa-browser"></i>
            </button>
        </div>
    );
}
