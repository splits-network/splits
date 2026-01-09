interface PaginationObject {
    page: number;
    total_pages: number;
    total: number;
    limit: number;
}

interface PaginationControlsProps {
    // Individual props (preferred)
    page?: number;
    totalPages?: number;
    total?: number;
    limit?: number;
    onPageChange?: (page: number) => void;
    onLimitChange?: (limit: number) => void;
    // Alternative: pagination object (for backward compatibility)
    pagination?: PaginationObject;
    /** @deprecated Use `onPageChange` instead */
    setPage?: (page: number) => void;
    // Common props
    loading?: boolean;
    showLimitSelector?: boolean;
    limitOptions?: number[];
}

export function PaginationControls(props: PaginationControlsProps) {
    const {
        pagination,
        onPageChange,
        setPage,
        onLimitChange,
        loading = false,
        showLimitSelector = true,
        limitOptions = [10, 25, 50, 100],
    } = props;

    // Support both individual props and pagination object
    const page = props.page ?? pagination?.page ?? 1;
    const totalPages = props.totalPages ?? pagination?.total_pages ?? 0;
    const total = props.total ?? pagination?.total ?? 0;
    const limit = props.limit ?? pagination?.limit ?? 25;

    // Support both onPageChange and setPage (deprecated alias)
    const handlePageChange = onPageChange ?? setPage;

    const startItem = (page - 1) * limit + 1;
    const endItem = Math.min(page * limit, total);

    if (total === 0) return null;

    return (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-4 mt-6 w-full">
            {/* Results info */}
            <div className="text-sm text-base-content/70 text-center sm:text-left">
                Showing <span className="font-medium">{startItem}</span> to{' '}
                <span className="font-medium">{endItem}</span> of{' '}
                <span className="font-medium">{total}</span> results
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-3 sm:gap-4">
                {/* Limit selector */}
                {showLimitSelector && onLimitChange && (
                    <div className="flex items-center gap-2">
                        <span className="text-sm text-base-content/70 whitespace-nowrap">Per page:</span>
                        <select
                            className="select select-sm"
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
                {handlePageChange && (
                    <div className="join">
                        <button
                            className="join-item btn btn-sm"
                            onClick={() => handlePageChange(1)}
                            disabled={page === 1 || loading}
                            title="First page"
                        >
                            <i className="fa-duotone fa-regular fa-angles-left"></i>
                        </button>
                        <button
                            className="join-item btn btn-sm"
                            onClick={() => handlePageChange(page - 1)}
                            disabled={page === 1 || loading}
                            title="Previous page"
                        >
                            <i className="fa-duotone fa-regular fa-angle-left"></i>
                        </button>
                        <button className="join-item btn btn-sm pointer-events-none min-w-[5rem] sm:min-w-[7rem]">
                            <span className="hidden sm:inline">Page </span>{page}<span className="hidden sm:inline"> of </span><span className="sm:hidden">/</span>{totalPages}
                        </button>
                        <button
                            className="join-item btn btn-sm"
                            onClick={() => handlePageChange(page + 1)}
                            disabled={page === totalPages || loading}
                            title="Next page"
                        >
                            <i className="fa-duotone fa-regular fa-angle-right"></i>
                        </button>
                        <button
                            className="join-item btn btn-sm"
                            onClick={() => handlePageChange(totalPages)}
                            disabled={page === totalPages || loading}
                            title="Last page"
                        >
                            <i className="fa-duotone fa-regular fa-angles-right"></i>
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}