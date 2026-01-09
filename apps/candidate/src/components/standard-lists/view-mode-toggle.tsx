interface ViewModeToggleProps {
    viewMode: 'grid' | 'table';
    onViewModeChange: (mode: 'grid' | 'table') => void;
}

export function ViewModeToggle({ viewMode, onViewModeChange }: ViewModeToggleProps) {
    return (
        <label className='flex cursor-pointer gap-2'>
            <input
                type="checkbox"
                className="toggle toggle-sm"
                checked={viewMode === 'table'}
                onChange={() => onViewModeChange(viewMode === 'table' ? 'grid' : 'table')}
            />
            <span>{viewMode === 'table' ? 'Table View' : 'Grid View'}</span>
        </label>
    );
}
