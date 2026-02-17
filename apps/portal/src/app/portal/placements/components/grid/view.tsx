"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { LoadingState } from "@splits-network/shared-ui";
import { PaginationControls, EmptyState } from "@/hooks/use-standard-list";
import { useFilter } from "../../contexts/filter-context";
import type { Placement } from "../../types";
import Item from "./item";
import Sidebar from "../shared/sidebar";

export default function GridView() {
    const { data, loading, pagination, page, goToPage } = useFilter();

    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();

    const selectedId = searchParams.get("placementId");
    const [sidebarItem, setSidebarItem] = useState<Placement | null>(null);

    // Sync sidebar item with URL parameter
    useEffect(() => {
        if (selectedId) {
            const item = data.find((placement) => placement.id === selectedId);
            if (item) {
                setSidebarItem(item);
            }
        } else {
            setSidebarItem(null);
        }
    }, [selectedId, data]);

    const handleViewDetails = useCallback(
        (placement: Placement) => {
            const params = new URLSearchParams(searchParams);
            params.set("placementId", placement.id);
            router.push(`${pathname}?${params.toString()}`);
        },
        [pathname, router, searchParams],
    );

    const handleCloseSidebar = useCallback(() => {
        const params = new URLSearchParams(searchParams);
        params.delete("placementId");
        router.push(`${pathname}?${params.toString()}`);
    }, [pathname, router, searchParams]);

    if (loading && data.length === 0) {
        return <LoadingState message="Loading placements..." />;
    }

    return (
        <>
            <div className="border-4 border-dark bg-cream p-6">
                {data.length === 0 ? (
                    <div className="text-center py-20 border-4 border-dark bg-white">
                        <div className="flex justify-center gap-3 mb-6">
                            <div className="w-8 h-8 rotate-12 bg-coral" />
                            <div className="w-8 h-8 rounded-full bg-teal" />
                            <div className="w-8 h-8 rotate-45 bg-yellow" />
                        </div>
                        <h3 className="font-black text-2xl uppercase tracking-tight mb-2 text-dark">
                            No Placements Found
                        </h3>
                        <p className="text-sm text-dark opacity-50 font-bold">
                            Try adjusting your search or filters
                        </p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-6">
                        {data.map((item) => (
                            <Item
                                key={item.id}
                                item={item}
                                onViewDetails={() => handleViewDetails(item)}
                            />
                        ))}
                    </div>
                )}

                {pagination && pagination.total_pages > 1 && (
                    <div className="mt-6">
                        <PaginationControls
                            page={page}
                            totalPages={pagination.total_pages}
                            onPageChange={goToPage}
                        />
                    </div>
                )}
            </div>

            <Sidebar item={sidebarItem} onClose={handleCloseSidebar} />
        </>
    );
}
