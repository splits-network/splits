interface PaginationControlsProps {
    page: number;
    totalPages: number;
    total: number;
    limit: number;
    onPageChange: (page: number) => void;
    onLimitChange?: (limit: number) => void;
    loading?: boolean;
    showLimitSelector?: boolean;
    limitOptions?: number[];
}

export function PaginationControls({
    page,
    totalPages,
    total,
    limit,
    onPageChange,
    onLimitChange,
    loading = false,
    showLimitSelector = true,
    limitOptions = [10, 25, 50, 100],
}: PaginationControlsProps) {
    const startItem = (page - 1) * limit + 1;
    const endItem = Math.min(page * limit, total);

    if (total === 0) return null;

    return (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-6">
            {/* Results info */}
            <div className="text-sm text-base-content/70">
                Showing <span className="font-medium">{startItem}</span> to{' '}
                <span className="font-medium">{endItem}</span> of{' '}
                <span className="font-medium">{total}</span> results
            </div>

            <div className="flex items-center gap-4">
                {/* Limit selector */}
                {showLimitSelector && onLimitChange && (
                    <div className="flex items-center gap-2">
                        <span className="text-sm text-base-content/70">Per page:</span>
                        <select
                            className="select select-sm select-bordered"
                            value={limit}
                            onChange={(e) => onLimitChange(Number(e.target.value))}
                            disabled={loading}
                        >
                            {limitOptions.map((opt) => (
                                <option key={opt} value={opt}>
                                    {opt}
                                </option>
                            ))}
                        </select>
                    </div>
                )}

                {/* Page controls */}
                <div className="join">
                    <button
                        className="join-item btn btn-sm"
                        onClick={() => onPageChange(1)}
                        disabled={page === 1 || loading}
                    >
                        <i className="fa-solid fa-angles-left"></i>
                    </button>
                    <button
                        className="join-item btn btn-sm"
                        onClick={() => onPageChange(page - 1)}
                        disabled={page === 1 || loading}
                    >
                        <i className="fa-solid fa-angle-left"></i>
                    </button>
                    <button className="join-item btn btn-sm pointer-events-none">
                        Page {page} of {totalPages}
                    </button>
                    <button
                        className="join-item btn btn-sm"
                        onClick={() => onPageChange(page + 1)}
                        disabled={page === totalPages || loading}
                    >
                        <i className="fa-solid fa-angle-right"></i>
                    </button>
                    <button
                        className="join-item btn btn-sm"
                        onClick={() => onPageChange(totalPages)}
                        disabled={page === totalPages || loading}
                    >
                        <i className="fa-solid fa-angles-right"></i>
                    </button>
                </div>
            </div>
        </div>
    );
}