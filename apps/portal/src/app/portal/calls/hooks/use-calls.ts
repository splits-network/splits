"use client";

import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@clerk/nextjs";
import { useStandardList } from "@/hooks/use-standard-list";
import { createAuthenticatedClient } from "@/lib/api-client";
import type { CallListItem, CallFilters, CallStats, CallTag } from "../types";
import type { BaselViewMode as ViewMode } from "@splits-network/basel-ui";

export function useCalls() {
    const { getToken } = useAuth();
    const [viewMode, setViewMode] = useState<ViewMode>("table");
    const [stats, setStats] = useState<CallStats | null>(null);
    const [tags, setTags] = useState<CallTag[]>([]);
    const [statsLoading, setStatsLoading] = useState(true);

    const {
        data: calls,
        loading,
        error,
        pagination,
        searchInput,
        setSearchInput,
        clearSearch,
        filters,
        setFilter,
        clearFilters,
        page,
        limit,
        goToPage,
        setLimit,
        total,
        totalPages,
        refresh,
    } = useStandardList<CallListItem, CallFilters>({
        endpoint: "/calls",
        defaultFilters: {},
        defaultSortBy: "scheduled_at",
        defaultSortOrder: "desc",
        defaultLimit: 24,
        syncToUrl: true,
    });

    // Fetch stats separately
    const fetchStats = useCallback(async () => {
        try {
            const token = await getToken();
            if (!token) return;
            const client = createAuthenticatedClient(token);
            const res = await client.get<{ data: CallStats }>("/calls/stats");
            if (res.data) setStats(res.data);
        } catch {
            // Stats are non-critical
        } finally {
            setStatsLoading(false);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // Fetch tags for filter dropdown
    const fetchTags = useCallback(async () => {
        try {
            const token = await getToken();
            if (!token) return;
            const client = createAuthenticatedClient(token);
            const res = await client.get<{ data: CallTag[] }>("/calls/tags");
            if (res.data) setTags(res.data);
        } catch {
            // Tags are non-critical
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        fetchStats();
        fetchTags();
    }, [fetchStats, fetchTags]);

    // Re-fetch stats when filters change
    useEffect(() => {
        fetchStats();
    }, [filters, fetchStats]);

    return {
        calls,
        loading,
        error,
        pagination,
        searchInput,
        setSearchInput,
        clearSearch,
        filters,
        setFilter,
        clearFilters,
        page,
        limit,
        goToPage,
        setLimit,
        total,
        totalPages,
        refresh,
        stats,
        statsLoading,
        tags,
        viewMode,
        setViewMode,
    };
}
