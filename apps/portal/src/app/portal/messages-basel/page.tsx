"use client";

/**
 * Basel Messages Page — parallel page for Basel migration.
 * Route: /portal/messages-basel
 *
 * Follows Designer One showcase pattern (showcase/messages/one):
 * - Editorial header with diagonal clip-path
 * - DaisyUI semantic tokens only
 * - Sharp corners, border-l-4 accents
 * - GSAP power3.out animations
 * - No Memphis shapes, no named colors
 */

import { ErrorState } from "@/hooks/use-standard-list";
import { FilterProvider, useFilter } from "@/app/portal/messages/contexts/filter-context";
import { BaselAnimator } from "./basel-animator";
import { HeaderSection } from "@/components/basel/messages/header-section";
import { ControlsBar } from "@/components/basel/messages/controls-bar";
import SplitView from "@/components/basel/messages/split-view";

export default function MessagesBaselPage() {
    return (
        <FilterProvider>
            <MessagesBaselContent />
        </FilterProvider>
    );
}

function MessagesBaselContent() {
    const {
        data,
        error,
        searchInput,
        setSearchInput,
        clearSearch,
        filters,
        setFilter,
        loading,
        refresh,
        showStats,
        setShowStats,
        requestCount,
    } = useFilter();

    const stats = {
        totalConversations: data.length,
        unreadMessages: data.reduce(
            (sum, row) => sum + (row.participant?.unread_count || 0),
            0,
        ),
        pendingRequests: requestCount,
        archivedConversations: data.filter((row) => !!row.participant.archived_at)
            .length,
    };

    if (error) {
        return <ErrorState message={error} onRetry={refresh} />;
    }

    return (
        <BaselAnimator>
            <HeaderSection stats={stats} />

            <section className="min-h-screen bg-base-100">
                <div className="py-8 px-4 lg:px-8">
                    <ControlsBar
                        searchInput={searchInput}
                        onSearchChange={setSearchInput}
                        onClearSearch={clearSearch}
                        filters={filters}
                        onFilterChange={setFilter}
                        loading={loading}
                        onRefresh={refresh}
                        showStats={showStats}
                        onToggleStats={setShowStats}
                        requestCount={requestCount}
                    />

                    <p className="text-sm font-bold uppercase tracking-wider text-base-content/50 mb-6 mt-4">
                        Showing {data.length} conversations
                    </p>

                    <div className="listings-content opacity-0 mt-6">
                        <SplitView />
                    </div>
                </div>
            </section>
        </BaselAnimator>
    );
}
