"use client";

import { useCallback, useRef, useState } from "react";
import { useAuth } from "@clerk/nextjs";
import { createAuthenticatedClient } from "@/lib/api-client";
import {
    useStandardList,
    PaginationControls,
    LoadingState,
    ErrorState,
} from "@/hooks/use-standard-list";
import type { FetchParams, FetchResponse } from "@/hooks/use-standard-list";
import SavedJobCard from "./components/saved-job-card";
import SavedJobsEmptyState from "./components/saved-jobs-empty-state";
import SavedJobsAnimator from "./saved-jobs-animator";

export default function SavedJobsContent() {
    const { getToken } = useAuth();
    const containerRef = useRef<HTMLDivElement>(null);
    const [removingId, setRemovingId] = useState<string | null>(null);

    const fetchSavedJobs = useCallback(
        async (params: FetchParams<any>): Promise<FetchResponse<any>> => {
            const token = await getToken();
            if (!token) throw new Error("Not authenticated");
            const client = createAuthenticatedClient(token);

            const queryParams: Record<string, any> = {
                page: params.page,
                limit: params.limit,
                sort_by: params.sort_by,
                sort_order: params.sort_order,
            };

            return client.get("/saved-jobs", { params: queryParams });
        },
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [],
    );

    const {
        data: savedJobs,
        loading,
        error,
        page,
        totalPages,
        total,
        limit,
        goToPage,
        setLimit,
        refresh,
    } = useStandardList<any, any>({
        fetchFn: fetchSavedJobs,
        defaultFilters: {},
        defaultSortBy: "created_at",
        defaultSortOrder: "desc",
        defaultLimit: 12,
        syncToUrl: true,
    });

    const handleRemove = useCallback(
        async (id: string) => {
            try {
                setRemovingId(id);
                const token = await getToken();
                if (!token) return;
                const client = createAuthenticatedClient(token);
                await client.delete(`/saved-jobs/${id}`);
                await refresh();
            } catch (err) {
                console.error("[SavedJobs] Failed to remove:", err);
            } finally {
                setRemovingId(null);
            }
        },
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [],
    );

    return (
        <div ref={containerRef} className="space-y-0">
            <SavedJobsAnimator containerRef={containerRef} loading={loading} />

            {/* Hero section */}
            <section className="saved-jobs-hero bg-base-200 py-12 opacity-0">
                <div className="container mx-auto px-6 sm:px-8 lg:px-12">
                    <p className="text-sm font-semibold uppercase tracking-[0.2em] text-primary mb-3">
                        Saved Jobs
                    </p>
                    <h1 className="text-3xl md:text-4xl font-black tracking-tight text-base-content mb-2">
                        Roles you are tracking
                    </h1>
                    <p className="text-base-content/70 max-w-2xl text-lg font-medium leading-relaxed">
                        Keep track of roles you want to apply to later. Unsave
                        jobs you are no longer interested in.
                    </p>
                </div>
            </section>

            {/* Content section */}
            <section className="saved-jobs-content py-12 opacity-0">
                <div className="container mx-auto px-6 sm:px-8 lg:px-12">
                    {/* Error State */}
                    {error && <ErrorState message={error} onRetry={refresh} />}

                    {/* Loading or Data */}
                    {!error && (
                        <>
                            {loading && savedJobs.length === 0 ? (
                                <LoadingState message="Finding your saved jobs..." />
                            ) : savedJobs.length === 0 ? (
                                <SavedJobsEmptyState />
                            ) : (
                                <div className="space-y-8">
                                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b-2 border-base-200 pb-4">
                                        <div className="text-sm font-bold uppercase tracking-wider text-base-content/60">
                                            {total} Saved Job
                                            {total !== 1 ? "s" : ""}
                                        </div>
                                    </div>

                                    {/* Grid Layout */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                                        {savedJobs.map((item: any) => (
                                            <SavedJobCard
                                                key={item.id}
                                                savedJob={item}
                                                onRemove={handleRemove}
                                                removing={
                                                    removingId === item.id
                                                }
                                            />
                                        ))}
                                    </div>

                                    {/* Footer / Pagination */}
                                    <div className="border-t-2 border-base-200 pt-8 mt-8">
                                        <PaginationControls
                                            page={page}
                                            totalPages={totalPages}
                                            limit={limit}
                                            total={total}
                                            onPageChange={goToPage}
                                            onLimitChange={setLimit}
                                            loading={loading}
                                        />
                                    </div>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </section>
        </div>
    );
}
