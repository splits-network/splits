"use client";

import { useCallback, useMemo } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { BrowseLayout } from "@splits-network/shared-ui";
import { LoadingState } from "@splits-network/shared-ui";
import { EmptyState } from "@/hooks/use-standard-list";
import { useFilter } from "../../contexts/filter-context";
import ListItem from "./list-item";
import DetailPanel from "./detail-panel";

export default function BrowseView() {
    const { data, loading, pagination, page, goToPage } = useFilter();

    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();

    const selectedId = searchParams.get("placementId");
    const selectedItem = useMemo(
        () =>
            selectedId
                ? data.find((item) => item.id === selectedId) ?? null
                : null,
        [selectedId, data],
    );
    const totalPages = pagination?.total_pages || 1;

    const handleSelect = useCallback(
        (id: string) => {
            const params = new URLSearchParams(searchParams);
            params.set("placementId", id);
            router.push(`${pathname}?${params.toString()}`);
        },
        [pathname, router, searchParams],
    );

    const handleClose = useCallback(() => {
        const params = new URLSearchParams(searchParams);
        params.delete("placementId");
        router.push(`${pathname}?${params.toString()}`);
    }, [pathname, router, searchParams]);

    return (
        <BrowseLayout>
            {/* Left Panel - List */}
            <div
                className={`flex flex-col border-r-4 border-dark bg-cream w-full md:w-96 lg:w-[420px] ${
                    selectedId ? "hidden md:flex" : "flex"
                }`}
            >
                <div className="flex-1 overflow-y-auto min-h-0">
                    {loading && data.length === 0 ? (
                        <div className="p-8">
                            <LoadingState message="Loading placements..." />
                        </div>
                    ) : data.length === 0 ? (
                        <div className="p-4">
                            <EmptyState
                                title="No placements found"
                                description="Try adjusting your search or filters"
                            />
                        </div>
                    ) : (
                        data.map((item) => (
                            <ListItem
                                key={item.id}
                                item={item}
                                isSelected={selectedId === item.id}
                                onSelect={handleSelect}
                            />
                        ))
                    )}
                </div>

                {/* Pagination Footer */}
                {totalPages > 1 && (
                    <div className="border-t-4 border-dark p-3 flex items-center justify-between bg-white">
                        <span className="text-xs font-black uppercase tracking-wider text-dark opacity-60">
                            Page {page} of {totalPages}
                        </span>
                        <div className="flex gap-1">
                            <button
                                className="w-8 h-8 border-2 border-dark flex items-center justify-center disabled:opacity-30 font-bold hover:bg-coral hover:text-white transition-colors"
                                disabled={page <= 1}
                                onClick={() => goToPage(page - 1)}
                            >
                                <i className="fa-solid fa-chevron-left text-xs" />
                            </button>
                            <button
                                className="w-8 h-8 border-2 border-dark flex items-center justify-center disabled:opacity-30 font-bold hover:bg-coral hover:text-white transition-colors"
                                disabled={page >= totalPages}
                                onClick={() => goToPage(page + 1)}
                            >
                                <i className="fa-solid fa-chevron-right text-xs" />
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Right Panel - Detail */}
            <div
                className={`flex-1 flex-col bg-white min-w-0 ${
                    selectedId
                        ? "fixed inset-0 z-50 flex md:static md:z-auto"
                        : "hidden md:flex"
                }`}
            >
                {selectedId ? (
                    <DetailPanel
                        id={selectedId}
                        item={selectedItem}
                        onClose={handleClose}
                    />
                ) : (
                    <div className="flex-1 flex items-center justify-center">
                        <div className="text-center p-8">
                            {/* Memphis decoration */}
                            <div className="flex justify-center gap-3 mb-6">
                                <div className="w-8 h-8 rotate-12 bg-coral" />
                                <div className="w-8 h-8 rounded-full bg-teal" />
                                <div className="w-8 h-8 rotate-45 bg-yellow" />
                            </div>
                            <h3 className="font-black text-xl uppercase tracking-tight mb-2 text-dark">
                                Select a Placement
                            </h3>
                            <p className="text-sm text-dark opacity-50 font-bold">
                                Click a placement to view details
                            </p>
                        </div>
                    </div>
                )}
            </div>
        </BrowseLayout>
    );
}
