export interface BaselExpandToggleProps {
    expanded: boolean;
    onToggle: () => void;
}

export function BaselExpandToggle({ expanded, onToggle }: BaselExpandToggleProps) {
    return (
        <button
            onClick={onToggle}
            className={`btn btn-sm rounded-none ${expanded ? 'btn-active' : ''}`}
            title={expanded ? 'Collapse filters' : 'Expand all filters'}
        >
            <i className={`fa-duotone fa-regular ${expanded ? 'fa-filter-circle-xmark' : 'fa-sliders'}`} />
        </button>
    );
}