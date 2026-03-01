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
        <div className="flex bg-base-200 p-1 rounded-none">
            {modes.map(({ mode, icon, label }) => (
                <button
                    key={mode}
                    onClick={() => onViewModeChange(mode)}
                    className={`px-3 py-1.5 text-sm font-bold uppercase tracking-wider transition-colors rounded-none ${
                        viewMode === mode
                            ? 'bg-primary text-primary-content'
                            : 'text-base-content/50 hover:text-base-content'
                    }`}
                >
                    <i className={`fa-duotone fa-regular ${icon} mr-1`} />
                    <span className="hidden sm:inline">{label}</span>
                </button>
            ))}
        </div>
    );
}
