import type { BaselViewMode } from './types';

export interface BaselViewModeSelectorProps {
    viewMode: BaselViewMode;
    onViewModeChange: (mode: BaselViewMode) => void;
    modes?: Array<{ mode: BaselViewMode; icon: string; label: string }>;
}

const DEFAULT_MODES: Array<{ mode: BaselViewMode; icon: string; label: string }> = [
    { mode: 'table', icon: 'fa-table-list', label: 'Table' },
    { mode: 'grid', icon: 'fa-grid-2', label: 'Grid' },
    { mode: 'split', icon: 'fa-columns-3', label: 'Split' },
];

export function BaselViewModeSelector({
    viewMode,
    onViewModeChange,
    modes = DEFAULT_MODES,
}: BaselViewModeSelectorProps) {
    return (
        <div className="join">
            {modes.map(({ mode, icon, label }) => (
                <button
                    key={mode}
                    onClick={() => onViewModeChange(mode)}
                    className={`join-item btn btn-sm rounded-none ${
                        viewMode === mode ? 'btn-active' : ''
                    }`}
                >
                    <i className={`fa-duotone fa-regular ${icon}`} />
                    <span className="hidden sm:inline">{label}</span>
                </button>
            ))}
        </div>
    );
}
