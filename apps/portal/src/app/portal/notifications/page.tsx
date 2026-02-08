"use client";

import { Suspense } from "react";
import { PageTitle } from "@/components/page-title";
import { LoadingState } from "@splits-network/shared-ui";
import { FilterProvider, useFilter } from "./contexts/filter-context";
import HeaderFilters from "./components/browse/header-filters";
import NotificationsBrowseView from "./components/browse/view";

export default function NotificationsPage() {
    return (
        <FilterProvider>
            <Suspense
                fallback={
                    <LoadingState message="Loading notifications..." />
                }
            >
                <NotificationsPageContent />
            </Suspense>
        </FilterProvider>
    );
}

function NotificationsPageContent() {
    const {
        searchInput,
        setSearchInput,
        clearSearch,
        filters,
        setFilter,
        loading,
        refresh,
        unreadCount,
        markingAllRead,
        handleMarkAllRead,
    } = useFilter();

    return (
        <>
            <PageTitle
                title="Notifications"
                subtitle="View and manage your notifications"
            >
                <HeaderFilters
                    searchInput={searchInput}
                    setSearchInput={setSearchInput}
                    clearSearch={clearSearch}
                    filters={filters}
                    setFilter={setFilter}
                    loading={loading}
                    refresh={refresh}
                    unreadCount={unreadCount}
                    markingAllRead={markingAllRead}
                    onMarkAllRead={handleMarkAllRead}
                />
            </PageTitle>

            <NotificationsBrowseView />
        </>
    );
}
