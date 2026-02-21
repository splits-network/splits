"use client";

import type { SearchPagination as PaginationData } from "@/types/search";

interface SearchPaginationProps {
    pagination: PaginationData;
    onPageChange: (page: number) => void;
}

export function SearchPagination({ pagination, onPageChange }: SearchPaginationProps) {
    const { page, total_pages, total, limit } = pagination;

    const start = (page - 1) * limit + 1;
    const end = Math.min(page * limit, total);

    // Build page number array with ellipsis
    const pages: (number | "...")[] = [];
    if (total_pages <= 7) {
        for (let i = 1; i <= total_pages; i++) pages.push(i);
    } else {
        pages.push(1);
        if (page > 3) pages.push("...");
        for (let i = Math.max(2, page - 1); i <= Math.min(total_pages - 1, page + 1); i++) {
            pages.push(i);
        }
        if (page < total_pages - 2) pages.push("...");
        pages.push(total_pages);
    }

    return (
        <div className="flex items-center justify-between mt-8 pt-6 border-t border-base-300">
            <span className="text-sm text-base-content/40">
                Showing {start}-{end} of {total} results
            </span>
            <div className="flex gap-1">
                <button
                    className="btn btn-sm btn-ghost"
                    disabled={page <= 1}
                    onClick={() => onPageChange(page - 1)}
                >
                    <i className="fa-solid fa-chevron-left text-xs" />
                </button>
                {pages.map((p, idx) =>
                    p === "..." ? (
                        <span key={`ellipsis-${idx}`} className="btn btn-sm btn-ghost btn-disabled">
                            ...
                        </span>
                    ) : (
                        <button
                            key={p}
                            className={`btn btn-sm ${p === page ? "btn-primary" : "btn-ghost"}`}
                            onClick={() => onPageChange(p)}
                        >
                            {p}
                        </button>
                    ),
                )}
                <button
                    className="btn btn-sm btn-ghost"
                    disabled={page >= total_pages}
                    onClick={() => onPageChange(page + 1)}
                >
                    <i className="fa-solid fa-chevron-right text-xs" />
                </button>
            </div>
        </div>
    );
}
