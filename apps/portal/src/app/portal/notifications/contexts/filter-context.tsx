"use client";

import {
    createContext,
    useContext,
    useState,
    useCallback,
    useMemo,
    ReactNode,
} from "react";
import { useAuth } from "@clerk/nextjs";
import {
    useStandardList,
    UseStandardListReturn,
} from "@/hooks/use-standard-list";
import { createAuthenticatedClient } from "@/lib/api-client";
import { InAppNotification } from "@/lib/notifications";

export interface NotificationFilters {
    category?: string;
    unread_only?: boolean;
}

interface FilterContextValue
    extends UseStandardListReturn<InAppNotification, NotificationFilters> {
    markingAllRead: boolean;
    handleMarkAllRead: () => Promise<void>;
    unreadCount: number;
}

const FilterContext = createContext<FilterContextValue | null>(null);

export function FilterProvider({ children }: { children: ReactNode }) {
    const { getToken } = useAuth();
    const [markingAllRead, setMarkingAllRead] = useState(false);

    const defaultFilters = useMemo<NotificationFilters>(
        () => ({ category: undefined, unread_only: undefined }),
        [],
    );

    const fetchNotifications = useCallback(
        async (params: Record<string, any>) => {
            const token = await getToken();
            if (!token) throw new Error("Not authenticated");

            const client = createAuthenticatedClient(token);
            const queryParams = new URLSearchParams();

            if (params.page) queryParams.set("page", params.page.toString());
            if (params.limit)
                queryParams.set("limit", params.limit.toString());
            if (params.search) queryParams.set("search", params.search);
            if (params.filters?.category)
                queryParams.set("category", params.filters.category);
            if (params.filters?.unread_only)
                queryParams.set("unread_only", "true");

            const response = await client.get(
                `/notifications?${queryParams.toString()}`,
            );
            return response as {
                data: InAppNotification[];
                pagination: {
                    total: number;
                    page: number;
                    limit: number;
                    total_pages: number;
                };
            };
        },
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [],
    );

    const listState = useStandardList<InAppNotification, NotificationFilters>({
        fetchFn: fetchNotifications,
        defaultFilters,
        defaultSortBy: "created_at",
        defaultSortOrder: "desc",
        defaultLimit: 50,
        syncToUrl: true,
    });

    const unreadCount = listState.data.filter((n) => !n.read).length;

    const handleMarkAllRead = useCallback(async () => {
        const token = await getToken();
        if (!token) return;

        setMarkingAllRead(true);
        try {
            const client = createAuthenticatedClient(token);
            await client.post("/notifications/mark-all-read", {});
            listState.refresh();
        } catch (err) {
            console.error("Failed to mark all as read:", err);
        } finally {
            setMarkingAllRead(false);
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [listState]);

    const contextValue: FilterContextValue = {
        ...listState,
        markingAllRead,
        handleMarkAllRead,
        unreadCount,
    };

    return (
        <FilterContext.Provider value={contextValue}>
            {children}
        </FilterContext.Provider>
    );
}

export function useFilter() {
    const context = useContext(FilterContext);
    if (!context) {
        throw new Error("useFilter must be used within FilterProvider");
    }
    return context;
}
