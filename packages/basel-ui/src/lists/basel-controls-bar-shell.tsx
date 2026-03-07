import type { ReactNode } from 'react';

export interface BaselControlsBarShellProps {
    /** Top row: search, filters, action buttons */
    filters?: ReactNode;
    /** Bottom-left: results count */
    statusLeft?: ReactNode;
    /** Bottom-right: refresh button + view mode toggle */
    statusRight?: ReactNode;
    className?: string;
}

export function BaselControlsBarShell({ filters, statusLeft, statusRight, className }: BaselControlsBarShellProps) {
    return (
        <section className={`controls-bar scroll-reveal fade-in sticky top-0 bg-base-100 border-b-2 border-base-300 ${className ?? ''}`}>
            <div className="container mx-auto px-6 lg:px-12 py-4">
                <div className="flex flex-col gap-3">
                    {/* Row 1: Search + Filters + Actions */}
                    {filters && (
                        <div className="flex flex-wrap gap-3 items-center">
                            {filters}
                        </div>
                    )}
                    {/* Row 2: Results count (left) + Refresh & View toggle (right) */}
                    {(statusLeft || statusRight) && (
                        <div className="flex flex-wrap items-center justify-between gap-3">
                            <div>{statusLeft}</div>
                            <div className="flex items-center gap-2">
                                {statusRight}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </section>
    );
}
