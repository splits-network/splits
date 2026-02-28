'use client';

type SidebarSearchProps = {
    value: string;
    onChange: (value: string) => void;
    isCollapsed: boolean;
    onExpandSidebar: () => void;
};

export function SidebarSearch({ value, onChange, isCollapsed, onExpandSidebar }: SidebarSearchProps) {
    if (isCollapsed) {
        return (
            <div className="tooltip tooltip-right" data-tip="Search">
                <button
                    type="button"
                    onClick={onExpandSidebar}
                    className="flex items-center justify-center w-9 h-9 rounded-lg text-base-content/50 hover:bg-base-200 hover:text-base-content transition-colors"
                >
                    <i className="fa-duotone fa-regular fa-magnifying-glass text-sm" />
                </button>
            </div>
        );
    }

    return (
        <div className="relative mb-2 px-1">
            <div className="relative">
                <i className="fa-duotone fa-regular fa-magnifying-glass absolute left-3 top-1/2 -translate-y-1/2 text-base-content/40 text-sm pointer-events-none" />
                <input
                    type="text"
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    placeholder="Filter navigation..."
                    className="input input-sm w-full pl-8 pr-8 bg-base-200 border-base-300 focus:border-primary text-sm"
                />
                {value && (
                    <button
                        type="button"
                        onClick={() => onChange('')}
                        className="absolute right-2 top-1/2 -translate-y-1/2 text-base-content/40 hover:text-base-content transition-colors"
                    >
                        <i className="fa-duotone fa-regular fa-circle-xmark text-sm" />
                    </button>
                )}
            </div>
        </div>
    );
}
