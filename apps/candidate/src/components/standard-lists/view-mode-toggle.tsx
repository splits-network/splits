interface ViewModeToggleProps {
    viewMode: 'grid' | 'table';
    onViewModeChange: (mode: 'grid' | 'table') => void;
}

export function ViewModeToggle({ viewMode, onViewModeChange }: ViewModeToggleProps) {
    return (
        <div className="join">
            <button
                className={`join-item btn btn-sm ${viewMode === 'grid' ? 'btn-active' : ''}`}
                onClick={() => onViewModeChange('grid')}
                title="Grid view"
            >
                <i className="fa-solid fa-grip"></i>
            </button>
            <button
                className={`join-item btn btn-sm ${viewMode === 'table' ? 'btn-active' : ''}`}
                onClick={() => onViewModeChange('table')}
                title="Table view"
            >
                <i className="fa-solid fa-list"></i>
            </button>
        </div>
    );
}
