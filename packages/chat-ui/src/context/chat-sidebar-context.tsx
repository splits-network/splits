"use client";

import {
    createContext,
    useContext,
    useState,
    useCallback,
    useMemo,
    useEffect,
    useRef,
    type ReactNode,
} from "react";
import { useChatGateway } from "../hooks/use-chat-gateway";
import {
    registerChatRefresh,
    requestChatRefresh,
} from "../lib/chat-refresh-queue";
import type { ConversationRow, ChatGatewayEvent } from "../types/chat-types";
import { getOtherParticipant } from "../types/chat-types";

// ── Types ────────────────────────────────────────────────────────────────

export interface ChatSidebarState {
    isOpen: boolean;
    isMinimized: boolean;
    view: "list" | "thread";
    activeConversationId: string | null;
    activeConversationMeta: { otherUserName: string | null } | null;
    unreadTotalCount: number;
    conversations: ConversationRow[];
    conversationsLoading: boolean;
}

export interface ChatSidebarActions {
    openToList: () => void;
    openToThread: (conversationId: string, meta?: { otherUserName?: string }) => void;
    close: () => void;
    minimize: () => void;
    restore: () => void;
    goBackToList: () => void;
    refreshConversations: () => void;
}

type ChatSidebarContextValue = ChatSidebarState & ChatSidebarActions;

// ── Context ──────────────────────────────────────────────────────────────

const ChatSidebarContext = createContext<ChatSidebarContextValue | null>(null);

export function useChatSidebar(): ChatSidebarContextValue {
    const ctx = useContext(ChatSidebarContext);
    if (!ctx) {
        throw new Error("useChatSidebar must be used within ChatSidebarProvider");
    }
    return ctx;
}

/** Returns null when outside ChatSidebarProvider (safe for use in shared components like headers) */
export function useChatSidebarOptional(): ChatSidebarContextValue | null {
    return useContext(ChatSidebarContext);
}

// ── Provider Props ───────────────────────────────────────────────────────

export interface ChatSidebarProviderProps {
    children: ReactNode;
    /** Current user's Clerk userId */
    userId: string | null;
    /** Clerk getToken function for WebSocket auth */
    getToken: () => Promise<string | null>;
    /** Fetches conversations from the API. App-specific since each app has its own API client. */
    fetchConversations: (filter: string) => Promise<ConversationRow[]>;
    /** Called when a new message arrives and should trigger a toast */
    onIncomingMessage?: (data: {
        conversationId: string;
        senderName: string;
        preview: string;
    }) => void;
    /** Messages page path for "Open Full" link */
    messagesPagePath?: string;
}

// ── Provider ─────────────────────────────────────────────────────────────

const REALTIME_EVENTS = new Set([
    "message.created",
    "message.updated",
    "conversation.updated",
    "conversation.requested",
    "conversation.accepted",
    "conversation.declined",
]);

export function ChatSidebarProvider({
    children,
    userId,
    getToken,
    fetchConversations,
    onIncomingMessage,
    messagesPagePath = "/portal/messages",
}: ChatSidebarProviderProps) {
    // ── Sidebar state ────────────────────────────────────────────────────
    const [isOpen, setIsOpen] = useState(false);
    const [isMinimized, setIsMinimized] = useState(false);
    const [view, setView] = useState<"list" | "thread">("list");
    const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
    const [activeConversationMeta, setActiveConversationMeta] = useState<{ otherUserName: string | null } | null>(null);

    // ── Conversations state ──────────────────────────────────────────────
    const [conversations, setConversations] = useState<ConversationRow[]>([]);
    const [conversationsLoading, setConversationsLoading] = useState(false);

    const fetchConversationsRef = useRef(fetchConversations);
    useEffect(() => { fetchConversationsRef.current = fetchConversations; }, [fetchConversations]);

    const onIncomingMessageRef = useRef(onIncomingMessage);
    useEffect(() => { onIncomingMessageRef.current = onIncomingMessage; }, [onIncomingMessage]);

    // ── Derived state ────────────────────────────────────────────────────
    const unreadTotalCount = useMemo(
        () => conversations.reduce((sum, row) => sum + (row.participant?.unread_count || 0), 0),
        [conversations],
    );

    // ── Actions ──────────────────────────────────────────────────────────
    const openToList = useCallback(() => {
        setView("list");
        setActiveConversationId(null);
        setActiveConversationMeta(null);
        setIsMinimized(false);
        setIsOpen(true);
    }, []);

    const openToThread = useCallback((conversationId: string, meta?: { otherUserName?: string }) => {
        setActiveConversationId(conversationId);
        setActiveConversationMeta(meta ? { otherUserName: meta.otherUserName ?? null } : null);
        setView("thread");
        setIsMinimized(false);
        setIsOpen(true);
    }, []);

    const close = useCallback(() => {
        setIsOpen(false);
        setIsMinimized(false);
    }, []);

    const minimize = useCallback(() => {
        setIsMinimized(true);
    }, []);

    const restore = useCallback(() => {
        setIsMinimized(false);
    }, []);

    const goBackToList = useCallback(() => {
        setView("list");
        setActiveConversationId(null);
        setActiveConversationMeta(null);
    }, []);

    // ── Fetch conversations ──────────────────────────────────────────────
    const loadConversations = useCallback(async () => {
        if (!userId) return;
        setConversationsLoading(true);
        try {
            // Fetch inbox + requests in parallel so all sidebar tabs have data
            const [inbox, requests] = await Promise.all([
                fetchConversationsRef.current("inbox"),
                fetchConversationsRef.current("requests"),
            ]);
            setConversations([...inbox, ...requests]);
        } catch {
            // silently fail — conversation list will show empty
        } finally {
            setConversationsLoading(false);
        }
    }, [userId]);

    // Initial load
    useEffect(() => {
        if (userId) {
            loadConversations();
        }
    }, [userId, loadConversations]);

    // Register with chat-refresh-queue for debounced refreshes
    useEffect(() => {
        return registerChatRefresh(() => loadConversations());
    }, [loadConversations]);

    // ── WebSocket ────────────────────────────────────────────────────────
    const channels = useMemo(
        () => (userId ? [`user:${userId}`] : []),
        [userId],
    );

    const handleEvent = useCallback((event: ChatGatewayEvent) => {
        if (!REALTIME_EVENTS.has(event.type)) return;

        requestChatRefresh();

        // Show toast for new messages when sidebar is closed or viewing different conversation
        if (event.type === "message.created" && event.data) {
            const eventConvId = event.data.conversationId || event.data.conversation_id;
            const senderName = event.data.senderName || event.data.sender_name || "Someone";
            const preview = event.data.preview || event.data.body || "";

            // Don't toast if sidebar is open and viewing this conversation
            // We check via refs to avoid stale closure
            if (isOpenRef.current && activeConversationIdRef.current === eventConvId) {
                return;
            }

            onIncomingMessageRef.current?.({
                conversationId: eventConvId,
                senderName,
                preview: preview.length > 80 ? preview.slice(0, 80) + "..." : preview,
            });
        }
    }, []);

    // Refs for checking state inside event handler without stale closure
    const isOpenRef = useRef(isOpen);
    const activeConversationIdRef = useRef(activeConversationId);
    useEffect(() => { isOpenRef.current = isOpen; }, [isOpen]);
    useEffect(() => { activeConversationIdRef.current = activeConversationId; }, [activeConversationId]);

    useChatGateway({
        enabled: !!userId,
        channels,
        getToken,
        onEvent: handleEvent,
        onReconnect: loadConversations,
        presencePingEnabled: true,
        presencePingIntervalMs: 30000,
        presenceStatus: "online",
    });

    // ── Context value ────────────────────────────────────────────────────
    const value = useMemo<ChatSidebarContextValue>(() => ({
        isOpen,
        isMinimized,
        view,
        activeConversationId,
        activeConversationMeta,
        unreadTotalCount,
        conversations,
        conversationsLoading,
        openToList,
        openToThread,
        close,
        minimize,
        restore,
        goBackToList,
        refreshConversations: loadConversations,
    }), [
        isOpen, isMinimized, view, activeConversationId, activeConversationMeta,
        unreadTotalCount, conversations, conversationsLoading,
        openToList, openToThread, close, minimize, restore, goBackToList, loadConversations,
    ]);

    return (
        <ChatSidebarContext.Provider value={value}>
            {children}
        </ChatSidebarContext.Provider>
    );
}

// Re-export messagesPagePath as a separate context so thread wrapper can access it
const MessagesPagePathContext = createContext<string>("/portal/messages");

export function useMessagesPagePath() {
    return useContext(MessagesPagePathContext);
}
