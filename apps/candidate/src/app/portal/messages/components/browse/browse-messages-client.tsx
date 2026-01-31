"use client";

import { useCallback } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import ListPanel from "./list-panel";
import DetailPanel from "./detail-panel";

export default function BrowseMessagesClient() {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();

    const selectedId = searchParams.get("conversationId");

    const handleSelect = useCallback(
        (id: string) => {
            const params = new URLSearchParams(searchParams);
            params.set("conversationId", id);
            router.push(`${pathname}?${params.toString()}`);
        },
        [pathname, router, searchParams],
    );

    const handleClose = useCallback(() => {
        const params = new URLSearchParams(searchParams);
        params.delete("conversationId");
        router.push(`${pathname}?${params.toString()}`);
    }, [pathname, router, searchParams]);

    return (
        <div className="h-[calc(100vh-8rem)] flex flex-col md:flex-row bg-base-200 rounded-xl overflow-hidden shadow-sm border border-base-300">
            <ListPanel selectedId={selectedId} onSelect={handleSelect} />

            <div
                className={`flex-1 flex-col bg-base-100 min-w-0 ${
                    selectedId
                        ? "fixed inset-0 z-50 flex md:static md:z-auto"
                        : "hidden md:flex"
                }`}
            >
                <DetailPanel id={selectedId} onClose={handleClose} />
            </div>
        </div>
    );
}
