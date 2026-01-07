interface ViewModeToggleProps {
    viewMode: 'grid' | 'table';
    setViewMode?: (mode: 'grid' | 'table') => void;
    /** Alternative prop name for setViewMode */
    onViewModeChange?: (mode: 'grid' | 'table') => void;
}

export function ViewModeToggle({ viewMode, setViewMode, onViewModeChange }: ViewModeToggleProps) {
    const handleChange = setViewMode ?? onViewModeChange;

    if (!handleChange) return null;

    return (
        <div className="join">
            <button
                className={`join-item btn btn-sm ${viewMode === 'grid' ? 'btn-active' : ''}`}
                onClick={() => handleChange('grid')}
                title="Grid view"
            >
                <i className="fa-solid fa-grip"></i>
            </button>
            <button
                className={`join-item btn btn-sm ${viewMode === 'table' ? 'btn-active' : ''}`}
                onClick={() => handleChange('table')}
                title="Table view"
            >
                <i className="fa-solid fa-list"></i>
            </button>
        </div>
    );
}
