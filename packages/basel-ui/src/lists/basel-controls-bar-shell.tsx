import type { ReactNode } from "react";

export interface BaselControlsBarShellProps {
    /** Row 1 left: action button (Add Role, Invite, etc.) */
    action?: ReactNode;
    /** Row 1: search input — fills remaining space */
    search?: ReactNode;
    /** Row 1 right: inline filter dropdowns */
    filters?: ReactNode;
    /** Row 2 left: scope toggle (Mine/All) + results count */
    statusLeft?: ReactNode;
    /** Row 2 right: sort, refresh, view mode, expand toggle */
    statusRight?: ReactNode;
    /** Row 3: expanded filters panel (hidden by default) */
    expandedFilters?: ReactNode;
    className?: string;
}

export function BaselControlsBarShell({
    action,
    search,
    filters,
    statusLeft,
    statusRight,
    expandedFilters,
    className,
}: BaselControlsBarShellProps) {
    return (
        <section
            className={`controls-bar scroll-reveal fade-in sticky z-30 bg-base-100 border-b-2 border-base-300 ${className ?? ""}`}
            style={{ top: "calc(var(--header-h, 0px) + var(--banner-h, 0px))" }}
        >
            <div className="px-6 lg:px-12 py-4">
                <div className="flex flex-col gap-3">
                    {/* Row 1: Action + Search + Inline Filters */}
                    <div className="flex flex-wrap gap-3 items-center">
                        {action}
                        {search && (
                            <div className="flex-1 min-w-[200px] [&>*]:w-full">
                                {search}
                            </div>
                        )}
                        {filters}
                    </div>

                    {/* Row 2: Scope/Count (left) + Sort/Refresh/View/Expand (right) */}
                    {(statusLeft || statusRight) && (
                        <div className="flex flex-wrap items-center justify-between gap-3">
                            <div className="flex items-center gap-3">
                                {statusLeft}
                            </div>
                            <div className="flex items-center gap-2">
                                {statusRight}
                            </div>
                        </div>
                    )}

                    {/* Row 3: Expanded filters panel */}
                    {expandedFilters && (
                        <div className="flex flex-wrap gap-3 items-center pt-2 border-t border-base-300">
                            {expandedFilters}
                        </div>
                    )}
                </div>
            </div>
        </section>
    );
}
