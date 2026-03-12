'use client';

import { createContext, useContext, useState, useCallback, useRef, useEffect, type ReactNode } from 'react';
import { useSupportSession } from '../hooks/use-support-session';
import { useSupportGateway, type SupportGatewayEvent } from '../hooks/use-support-gateway';
import * as api from '../lib/support-api';

interface SupportContextValue {
    isOpen: boolean;
    toggle: () => void;
    open: () => void;
    close: () => void;
    adminOnline: boolean;
    connected: boolean;
    sessionId: string;
    activeConversation: api.SupportConversation | null;
    messages: api.SupportMessage[];
    unreadCount: number;
    sendMessage: (body: string) => Promise<void>;
    startConversation: (input: {
        body: string;
        category?: string;
        subject?: string;
        visitorName?: string;
        visitorEmail?: string;
    }) => Promise<void>;
    sourceApp: string;
    subscribe: (channels: string[]) => void;
    sendTyping: (conversationId: string, started: boolean) => void;
}

const SupportContext = createContext<SupportContextValue | null>(null);

export function useSupportChat() {
    const ctx = useContext(SupportContext);
    if (!ctx) throw new Error('useSupportChat must be used within SupportProvider');
    return ctx;
}

/** Optional hook — returns null if no provider (for conditional usage) */
export function useSupportChatOptional() {
    return useContext(SupportContext);
}

interface SupportProviderProps {
    children: ReactNode;
    sourceApp: 'portal' | 'candidate' | 'corporate';
    gatewayUrl?: string;
    apiBaseUrl?: string;
    getToken?: () => Promise<string | null>;
}

export function SupportProvider({
    children,
    sourceApp,
    gatewayUrl,
    apiBaseUrl,
    getToken,
}: SupportProviderProps) {
    const { sessionId } = useSupportSession();
    const [isOpen, setIsOpen] = useState(false);
    const [activeConversation, setActiveConversation] = useState<api.SupportConversation | null>(null);
    const [messages, setMessages] = useState<api.SupportMessage[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);

    const resolvedGatewayUrl = gatewayUrl || process.env.NEXT_PUBLIC_SUPPORT_GATEWAY_URL || '';
    const resolvedApiBaseUrl = apiBaseUrl || process.env.NEXT_PUBLIC_API_GATEWAY_URL || process.env.NEXT_PUBLIC_API_URL || '';

    const apiConfig = useRef<api.SupportApiConfig>({
        baseUrl: resolvedApiBaseUrl,
        sessionId: '',
        getToken,
    });
    apiConfig.current.sessionId = sessionId;
    apiConfig.current.baseUrl = resolvedApiBaseUrl;

    const handleEvent = useCallback((event: SupportGatewayEvent) => {
        if (event.type === 'message.new' && event.data?.message) {
            const msg = event.data.message as api.SupportMessage;
            setMessages((prev) => {
                if (prev.some((m) => m.id === msg.id)) return prev;
                return [...prev, msg];
            });

            // Increment unread if window is closed and message is from admin
            if (!isOpen && msg.sender_type === 'admin') {
                setUnreadCount((prev) => prev + 1);
            }
        }
    }, [isOpen]);

    const { connected, adminOnline, subscribe, sendTyping } = useSupportGateway({
        enabled: !!sessionId,
        gatewayUrl: resolvedGatewayUrl,
        sessionId,
        getToken,
        onEvent: handleEvent,
    });

    // Load existing conversations on mount
    useEffect(() => {
        if (!sessionId) return;
        api.getMyConversations(apiConfig.current).then((convos) => {
            if (convos.length > 0) {
                const active = convos[0];
                setActiveConversation(active);
                subscribe([`conv:${active.id}`]);
                api.getMessages(apiConfig.current, active.id).then(setMessages);
            }
        }).catch(() => {
            // Silently fail — no existing conversations
        });
    }, [sessionId, subscribe]);

    const toggle = useCallback(() => {
        setIsOpen((prev) => {
            if (!prev) setUnreadCount(0);
            return !prev;
        });
    }, []);

    const open = useCallback(() => {
        setIsOpen(true);
        setUnreadCount(0);
    }, []);

    const close = useCallback(() => setIsOpen(false), []);

    const sendMessage = useCallback(async (body: string) => {
        if (!activeConversation) return;
        const msg = await api.sendMessage(apiConfig.current, activeConversation.id, body);
        setMessages((prev) => {
            if (prev.some((m) => m.id === msg.id)) return prev;
            return [...prev, msg];
        });
    }, [activeConversation]);

    const startConversation = useCallback(async (input: {
        body: string;
        category?: string;
        subject?: string;
        visitorName?: string;
        visitorEmail?: string;
    }) => {
        const result = await api.createConversation(apiConfig.current, {
            ...input,
            sourceApp,
            pageUrl: typeof window !== 'undefined' ? window.location.href : undefined,
            userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : undefined,
        });
        setActiveConversation(result.conversation);
        setMessages([result.message]);
        subscribe([`conv:${result.conversation.id}`]);
    }, [sourceApp, subscribe]);

    const value: SupportContextValue = {
        isOpen,
        toggle,
        open,
        close,
        adminOnline,
        connected,
        sessionId,
        activeConversation,
        messages,
        unreadCount,
        sendMessage,
        startConversation,
        sourceApp,
        subscribe,
        sendTyping,
    };

    return (
        <SupportContext.Provider value={value}>
            {children}
        </SupportContext.Provider>
    );
}
