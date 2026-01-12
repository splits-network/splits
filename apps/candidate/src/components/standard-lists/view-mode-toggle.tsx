interface ViewModeToggleProps {
    viewMode: 'grid' | 'table';
    setViewMode?: (mode: 'grid' | 'table') => void;
    /** Alternative prop name for setViewMode */
    onViewModeChange?: (mode: 'grid' | 'table') => void;
}

/**
 * ViewModeToggle - Uses DaisyUI swap component
 * 
 * Based on: https://daisyui.com/components/swap/
 * 
 * Toggles between grid and table view with a smooth rotate animation.
 * - swap-off (unchecked) = grid view
 * - swap-on (checked) = table view
 */
export function ViewModeToggle({ viewMode, setViewMode, onViewModeChange }: ViewModeToggleProps) {
    const handleChange = setViewMode ?? onViewModeChange;

    if (!handleChange) return null;

    const isTableView = viewMode === 'table';

    return (
        <label className="flex items-center justify-center gap-2 py-2" title={isTableView ? 'Switch to grid view' : 'Switch to table view'}>
            {/* Grid icon - shown when swap is off (unchecked) */}
            <i className={`fa-duotone fa-regular fa-grid-2 ${isTableView ? 'text-base' : 'text-accent'} `}></i>
            <input
                type="checkbox"
                checked={isTableView}
                onChange={() => handleChange(isTableView ? 'grid' : 'table')}
                className='toggle'
            />
            {/* Table icon - shown when swap is on (checked) */}
            <i className={`fa-duotone fa-regular fa-list text-base ${isTableView ? 'text-accent' : 'text-base'} `}></i>
        </label>
    );
}
