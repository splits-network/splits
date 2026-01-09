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
        <label className="swap swap-rotate btn btn-ghost text-accent btn-sm" title={isTableView ? 'Switch to grid view' : 'Switch to table view'}>
            <input
                type="checkbox"
                checked={isTableView}
                onChange={() => handleChange(isTableView ? 'grid' : 'table')}
            />
            {/* Grid icon - shown when swap is off (unchecked) */}
            <i className="swap-off fa-duotone fa-regular fa-grip text-base"></i>
            {/* Table icon - shown when swap is on (checked) */}
            <i className="swap-on fa-duotone fa-regular fa-list text-base"></i>
        </label>
    );
}
