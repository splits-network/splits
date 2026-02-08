"use client";

import {
    createContext,
    useContext,
    useState,
    useEffect,
    useCallback,
    useMemo,
    type ReactNode,
} from "react";
import { useAuth } from "@clerk/nextjs";
import { createAuthenticatedClient } from "@/lib/api-client";
import { useChatGateway } from "@/hooks/use-chat-gateway";
import {
    registerChatRefresh,
    requestChatRefresh,
} from "@/lib/chat-refresh-queue";
import { getCachedCurrentUserId } from "@/lib/current-user-profile";
import { usePresence } from "@/hooks/use-presence";
import type {
    ConversationRow,
    ConversationFilters,
    ConversationContext,
    Mailbox,
} from "../types";
import { getOtherUserId } from "../types";

const STATS_VISIBLE_KEY = "messagesNewStatsVisible";

interface FilterContextValue {
    data: ConversationRow[];
    loading: boolean;
    error: string | null;
    filters: ConversationFilters;
    setFilter: <K extends keyof ConversationFilters>(
        key: K,
        value: ConversationFilters[K],
    ) => void;
    searchInput: string;
    setSearchInput: (value: string) => void;
    clearSearch: () => void;
    refresh: () => void;
    showStats: boolean;
    setShowStats: (show: boolean) => void;
    currentUserId: string | null;
    presenceMap: Record<string, { status: "online" | "offline" }>;
    requestCount: number;
    contextMap: Record<string, ConversationContext>;
}

const FilterContext = createContext<FilterContextValue | null>(null);

function normalizeRows(data: any[]): ConversationRow[] {
    return data.map((row: any) => {
        if (row.conversation && row.participant) {
            return row;
        }
        return {
            conversation: row.chat_conversations,
            participant: {
                conversation_id: row.conversation_id,
                user_id: row.user_id,
                muted_at: row.muted_at,
                archived_at: row.archived_at,
                request_state: row.request_state,
                last_read_at: row.last_read_at,
                last_read_message_id: row.last_read_message_id,
                unread_count: row.unread_count,
            },
        };
    });
}

export function FilterProvider({ children }: { children: ReactNode }) {
    const { getToken } = useAuth();

    const [showStats, setShowStatsState] = useState(true);
    const [statsLoaded, setStatsLoaded] = useState(false);

    useEffect(() => {
        if (typeof window !== "undefined") {
            const saved = localStorage.getItem(STATS_VISIBLE_KEY);
            if (saved !== null) setShowStatsState(saved === "true");
            setStatsLoaded(true);
        }
    }, []);

    const setShowStats = useCallback((show: boolean) => {
        setShowStatsState(show);
        if (typeof window !== "undefined") {
            localStorage.setItem(STATS_VISIBLE_KEY, String(show));
        }
    }, []);

    const [filters, setFilters] = useState<ConversationFilters>({
        mailbox: "inbox",
    });
    const [rows, setRows] = useState<ConversationRow[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [currentUserId, setCurrentUserId] = useState<string | null>(null);
    const [searchInput, setSearchInput] = useState("");
    const [requestCount, setRequestCount] = useState(0);

    const setFilter = useCallback(
        <K extends keyof ConversationFilters>(
            key: K,
            value: ConversationFilters[K],
        ) => {
            setFilters((prev) => ({ ...prev, [key]: value }));
        },
        [],
    );

    const clearSearch = useCallback(() => {
        setSearchInput("");
    }, []);

    const fetchConversations = useCallback(async () => {
        const token = await getToken();
        if (!token) return;
        const client = createAuthenticatedClient(token);
        const response: any = await client.get("/chat/conversations", {
            params: { filter: filters.mailbox, limit: 50 },
        });
        const data = response?.data || [];
        setRows(normalizeRows(data));
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [filters.mailbox]);

    const fetchRequestCount = useCallback(async () => {
        const token = await getToken();
        if (!token) return;
        const client = createAuthenticatedClient(token);
        try {
            const response: any = await client.get("/chat/conversations", {
                params: { filter: "requests", limit: 100 },
            });
            const data = response?.data || [];
            const normalized = normalizeRows(data);
            const count = normalized.filter(
                (row) => row.participant?.request_state === "pending",
            ).length;
            setRequestCount(count);
        } catch (err) {
            console.error("Failed to fetch request count:", err);
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const refresh = useCallback(() => {
        fetchConversations();
        fetchRequestCount();
    }, [fetchConversations, fetchRequestCount]);

    useEffect(() => {
        let mounted = true;
        const load = async () => {
            setLoading(true);
            setError(null);
            try {
                const userId = await getCachedCurrentUserId(getToken);
                if (!mounted) return;
                setCurrentUserId(userId);
                await fetchConversations();
                await fetchRequestCount();
            } catch (err: any) {
                if (mounted)
                    setError(err?.message || "Failed to load conversations");
            } finally {
                if (mounted) setLoading(false);
            }
        };
        load();
        return () => {
            mounted = false;
        };
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [filters.mailbox, fetchConversations, fetchRequestCount]);

    useEffect(() => {
        const unregister = registerChatRefresh(() => {
            fetchConversations();
            fetchRequestCount();
        });
        return unregister;
    }, [fetchConversations, fetchRequestCount]);

    useChatGateway({
        enabled: Boolean(currentUserId),
        channels: currentUserId ? [`user:${currentUserId}`] : [],
        getToken,
        onReconnect: () => {
            requestChatRefresh();
        },
        onEvent: (event) => {
            if (
                [
                    "message.created",
                    "message.updated",
                    "conversation.updated",
                    "conversation.requested",
                    "conversation.accepted",
                    "conversation.declined",
                ].includes(event.type)
            ) {
                requestChatRefresh();
            }
        },
    });

    const otherUserIds = useMemo(() => {
        if (!currentUserId) return [];
        const ids = new Set<string>();
        rows.forEach((row) => {
            const otherId = getOtherUserId(row.conversation, currentUserId);
            if (otherId) ids.add(otherId);
        });
        return Array.from(ids);
    }, [rows, currentUserId]);

    const presenceMap = usePresence(otherUserIds, {
        enabled: Boolean(currentUserId),
    });

    // Resolve job/company context for conversations
    const [contextMap, setContextMap] = useState<
        Record<string, ConversationContext>
    >({});

    useEffect(() => {
        let cancelled = false;

        const resolveContext = async () => {
            const token = await getToken();
            if (!token || rows.length === 0) return;
            const client = createAuthenticatedClient(token);

            const jobIds = new Set<string>();
            const companyIds = new Set<string>();
            const candidateIds = new Set<string>();

            for (const row of rows) {
                const c = row.conversation;
                if (c.job_id) jobIds.add(c.job_id);
                if (c.company_id) companyIds.add(c.company_id);
                if (c.candidate_id) candidateIds.add(c.candidate_id);
            }

            const jobMap: Record<string, { title: string; companyName?: string }> = {};
            const companyMap: Record<string, string> = {};

            // Fetch jobs (includes company)
            await Promise.all(
                Array.from(jobIds).map(async (jobId) => {
                    try {
                        const res: any = await client.get(`/jobs/${jobId}`, {
                            params: { include: "company" },
                        });
                        const job = res?.data;
                        if (job) {
                            jobMap[jobId] = {
                                title: job.title,
                                companyName: job.company?.name,
                            };
                            if (job.company?.id && job.company?.name) {
                                companyMap[job.company.id] = job.company.name;
                            }
                        }
                    } catch {
                        // skip failed lookups
                    }
                }),
            );

            // Fetch remaining companies not resolved via jobs
            const remainingCompanyIds = Array.from(companyIds).filter(
                (id) => !companyMap[id],
            );
            await Promise.all(
                remainingCompanyIds.map(async (companyId) => {
                    try {
                        const res: any = await client.get(
                            `/companies/${companyId}`,
                        );
                        if (res?.data?.name) {
                            companyMap[companyId] = res.data.name;
                        }
                    } catch {
                        // skip failed lookups
                    }
                }),
            );

            // Fetch candidate names for routed conversations
            const candidateMap: Record<string, string> = {};
            await Promise.all(
                Array.from(candidateIds).map(async (candidateId) => {
                    try {
                        const res: any = await client.get(
                            `/candidates/${candidateId}`,
                        );
                        if (res?.data?.full_name) {
                            candidateMap[candidateId] = res.data.full_name;
                        }
                    } catch {
                        // skip failed lookups
                    }
                }),
            );

            if (cancelled) return;

            const map: Record<string, ConversationContext> = {};
            for (const row of rows) {
                const c = row.conversation;
                const job = c.job_id ? jobMap[c.job_id] : null;
                const companyName =
                    job?.companyName ||
                    (c.company_id ? companyMap[c.company_id] : null) ||
                    null;
                map[c.id] = {
                    jobTitle: job?.title || null,
                    companyName,
                    candidateName: c.candidate_id
                        ? candidateMap[c.candidate_id] || null
                        : null,
                };
            }
            setContextMap(map);
        };

        resolveContext();
        return () => {
            cancelled = true;
        };
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [rows]);

    // Filter and sort: most recent conversation first
    const data = useMemo(() => {
        let filtered = rows;
        if (searchInput.trim()) {
            const query = searchInput.toLowerCase();
            filtered = rows.filter((row) => {
                const convo = row.conversation;
                const otherId = getOtherUserId(convo, currentUserId);
                const other =
                    otherId === convo.participant_a_id
                        ? convo.participant_a
                        : convo.participant_b;
                const name = other?.name || "";
                const email = other?.email || "";
                return (
                    name.toLowerCase().includes(query) ||
                    email.toLowerCase().includes(query)
                );
            });
        }
        return [...filtered].sort((a, b) => {
            const aTime = a.conversation.last_message_at
                ? new Date(a.conversation.last_message_at).getTime()
                : 0;
            const bTime = b.conversation.last_message_at
                ? new Date(b.conversation.last_message_at).getTime()
                : 0;
            return bTime - aTime;
        });
    }, [rows, searchInput, currentUserId]);

    const contextValue: FilterContextValue = {
        data,
        loading,
        error,
        filters,
        setFilter,
        searchInput,
        setSearchInput,
        clearSearch,
        refresh,
        showStats: statsLoaded ? showStats : true,
        setShowStats,
        currentUserId,
        presenceMap,
        requestCount,
        contextMap,
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
