"use client";

import { ErrorState } from "@/hooks/use-standard-list";
import { FilterProvider, useFilter } from "./contexts/filter-context";
import { ListsSixAnimator } from "./lists-six-animator";
import { HeaderSection } from "./components/shared/header-section";
import { ControlsBar } from "./components/shared/controls-bar";
import SplitView from "./components/split/split-view";

export default function MessagesPage() {
    return (
        <FilterProvider>
            <MessagesPageContent />
        </FilterProvider>
    );
}

function MessagesPageContent() {
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
        <ListsSixAnimator>
            <HeaderSection stats={stats} />

            <section className="min-h-screen bg-cream">
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

                    <p className="text-sm font-bold uppercase tracking-wider text-dark/50 mb-6 mt-4">
                        Showing {data.length} conversations
                    </p>

                    <div className="listings-content opacity-0 mt-6">
                        <SplitView />
                    </div>
                </div>
            </section>
        </ListsSixAnimator>
    );
}
