"use client";

import {
    createContext,
    useContext,
    useState,
    useEffect,
    useCallback,
    type ReactNode,
} from "react";
import { useAuth } from "@clerk/nextjs";
import { createAuthenticatedClient } from "@/lib/api-client";
import type {
    OAuthConnectionPublic,
    EmailThread,
    EmailListResponse,
    EmailListItem,
} from "@splits-network/shared-types";

/* ─── Context shape ───────────────────────────────────────────────────── */

interface EmailContextValue {
    /* connections */
    connections: OAuthConnectionPublic[];
    selectedConnection: OAuthConnectionPublic | null;
    selectConnection: (conn: OAuthConnectionPublic) => void;

    /* inbox */
    messages: EmailListItem[];
    loading: boolean;
    error: string;
    clearError: () => void;
    searchQuery: string;
    setSearchQuery: (q: string) => void;
    refresh: () => void;
    nextPageToken?: string;

    /* thread */
    selectedThreadId: string | null;
    selectThread: (threadId: string) => void;
    closeThread: () => void;
    thread: EmailThread | null;
    loadingThread: boolean;

    /* compose */
    showCompose: boolean;
    openCompose: (opts?: ComposeOpts) => void;
    closeCompose: () => void;
    composeOpts: ComposeOpts;

    /* actions */
    trashMessage: (messageId: string) => Promise<void>;
    archiveMessage: (messageId: string) => Promise<void>;
    markAsRead: (messageId: string) => Promise<void>;
    markAsUnread: (messageId: string) => Promise<void>;

    /* stats */
    unreadCount: number;
}

export interface ComposeOpts {
    toEmail?: string;
    subject?: string;
    inReplyTo?: string;
    threadId?: string;
    connectionId?: string;
}

const EmailContext = createContext<EmailContextValue | null>(null);

export function useEmail() {
    const ctx = useContext(EmailContext);
    if (!ctx) throw new Error("useEmail must be used within EmailProvider");
    return ctx;
}

/* ─── Provider ────────────────────────────────────────────────────────── */

export function EmailProvider({ children }: { children: ReactNode }) {
    const { getToken } = useAuth();

    /* connections */
    const [connections, setConnections] = useState<OAuthConnectionPublic[]>([]);
    const [selectedConnection, setSelectedConnection] =
        useState<OAuthConnectionPublic | null>(null);

    /* inbox */
    const [messages, setMessages] = useState<EmailListItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [searchQuery, setSearchQuery] = useState("");
    const [nextPageToken, setNextPageToken] = useState<string | undefined>();

    /* thread */
    const [selectedThreadId, setSelectedThreadId] = useState<string | null>(
        null,
    );
    const [thread, setThread] = useState<EmailThread | null>(null);
    const [loadingThread, setLoadingThread] = useState(false);

    /* compose */
    const [showCompose, setShowCompose] = useState(false);
    const [composeOpts, setComposeOpts] = useState<ComposeOpts>({});

    /* ── Fetch connections ── */
    const fetchConnections = useCallback(async () => {
        try {
            const token = await getToken();
            if (!token) return;
            const client = createAuthenticatedClient(token);
            const res = (await client.get("/integrations/connections")) as {
                data: OAuthConnectionPublic[];
            };
            const emailConns = (res.data ?? []).filter(
                (c) =>
                    (c.provider_slug.includes("email") ||
                        c.provider_slug.includes("gmail") ||
                        c.provider_slug.includes("combo")) &&
                    c.status === "active",
            );
            setConnections(emailConns);
            if (emailConns.length === 1) {
                setSelectedConnection(emailConns[0]);
            } else {
                setLoading(false);
            }
        } catch {
            setError("Failed to load email connections");
            setLoading(false);
        }
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

    /* ── Fetch messages ── */
    const fetchMessages = useCallback(
        async (connectionId: string, query?: string) => {
            try {
                setLoading(true);
                const token = await getToken();
                if (!token) return;
                const client = createAuthenticatedClient(token);
                const res = (await client.get(
                    `/integrations/email/${connectionId}/messages`,
                    {
                        params: {
                            q: query || undefined,
                            max_results: "25",
                        },
                    },
                )) as { data: EmailListResponse };

                setMessages(res.data.messages ?? []);
                setNextPageToken(res.data.next_page_token);
            } catch {
                setError(
                    "Failed to load messages. Your connection may have expired.",
                );
            } finally {
                setLoading(false);
            }
        },
        [], // eslint-disable-line react-hooks/exhaustive-deps
    );

    /* ── Fetch thread ── */
    const fetchThread = useCallback(
        async (threadId: string) => {
            if (!selectedConnection) return;
            try {
                setLoadingThread(true);
                const token = await getToken();
                if (!token) return;
                const client = createAuthenticatedClient(token);
                const res = (await client.get(
                    `/integrations/email/${selectedConnection.id}/threads/${threadId}`,
                )) as { data: EmailThread };
                setThread(res.data);
            } catch {
                setError("Failed to load thread");
            } finally {
                setLoadingThread(false);
            }
        },
        [selectedConnection], // eslint-disable-line react-hooks/exhaustive-deps
    );

    /* ── Effects ── */
    useEffect(() => {
        fetchConnections();
    }, [fetchConnections]);

    useEffect(() => {
        if (selectedConnection) {
            fetchMessages(selectedConnection.id, searchQuery || undefined);
        }
    }, [selectedConnection]); // eslint-disable-line react-hooks/exhaustive-deps

    useEffect(() => {
        if (selectedThreadId) {
            setThread(null);
            fetchThread(selectedThreadId);
        }
    }, [selectedThreadId]); // eslint-disable-line react-hooks/exhaustive-deps

    /* ── Message actions ── */
    const performAction = useCallback(
        async (messageId: string, action: string) => {
            if (!selectedConnection) return;
            try {
                const token = await getToken();
                if (!token) return;
                const client = createAuthenticatedClient(token);
                await client.post(
                    `/integrations/email/${selectedConnection.id}/messages/${messageId}/${action}`,
                );
            } catch {
                setError(`Failed to ${action} message`);
            }
        },
        [selectedConnection], // eslint-disable-line react-hooks/exhaustive-deps
    );

    const trashMessage = useCallback(
        async (messageId: string) => {
            await performAction(messageId, "trash");
            setMessages((prev) => prev.filter((m) => m.id !== messageId));
            if (selectedThreadId) {
                closeThread();
            }
        },
        [performAction, selectedThreadId], // eslint-disable-line react-hooks/exhaustive-deps
    );

    const archiveMessage = useCallback(
        async (messageId: string) => {
            await performAction(messageId, "archive");
            setMessages((prev) => prev.filter((m) => m.id !== messageId));
            if (selectedThreadId) {
                closeThread();
            }
        },
        [performAction, selectedThreadId], // eslint-disable-line react-hooks/exhaustive-deps
    );

    const markAsRead = useCallback(
        async (messageId: string) => {
            await performAction(messageId, "read");
            setMessages((prev) =>
                prev.map((m) =>
                    m.id === messageId ? { ...m, isRead: true } : m,
                ),
            );
        },
        [performAction],
    );

    const markAsUnread = useCallback(
        async (messageId: string) => {
            await performAction(messageId, "unread");
            setMessages((prev) =>
                prev.map((m) =>
                    m.id === messageId ? { ...m, isRead: false } : m,
                ),
            );
        },
        [performAction],
    );

    /* ── Handlers ── */
    const selectConnection = useCallback(
        (conn: OAuthConnectionPublic) => {
            setSelectedConnection(conn);
            setMessages([]);
            setThread(null);
            setSelectedThreadId(null);
        },
        [],
    );

    const refresh = useCallback(() => {
        if (selectedConnection) {
            fetchMessages(selectedConnection.id, searchQuery || undefined);
        }
    }, [selectedConnection, searchQuery, fetchMessages]);

    const handleSearch = useCallback(
        (q: string) => {
            setSearchQuery(q);
            if (selectedConnection) {
                fetchMessages(selectedConnection.id, q || undefined);
            }
        },
        [selectedConnection, fetchMessages],
    );

    const selectThread = useCallback((threadId: string) => {
        setSelectedThreadId(threadId);
    }, []);

    const closeThread = useCallback(() => {
        setSelectedThreadId(null);
        setThread(null);
    }, []);

    const openCompose = useCallback((opts?: ComposeOpts) => {
        setComposeOpts(opts ?? {});
        setShowCompose(true);
    }, []);

    const closeCompose = useCallback(() => {
        setShowCompose(false);
        setComposeOpts({});
    }, []);

    const unreadCount = messages.filter((m) => m.isRead === false).length;

    return (
        <EmailContext.Provider
            value={{
                connections,
                selectedConnection,
                selectConnection,
                messages,
                loading,
                error,
                clearError: () => setError(""),
                searchQuery,
                setSearchQuery: handleSearch,
                refresh,
                nextPageToken,
                selectedThreadId,
                selectThread,
                closeThread,
                thread,
                loadingThread,
                showCompose,
                openCompose,
                closeCompose,
                composeOpts,
                trashMessage,
                archiveMessage,
                markAsRead,
                markAsUnread,
                unreadCount,
            }}
        >
            {children}
        </EmailContext.Provider>
    );
}
