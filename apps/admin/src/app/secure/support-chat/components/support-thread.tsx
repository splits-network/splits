'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useAuth } from '@clerk/nextjs';
import { useAdminRealtime } from '@/hooks/use-admin-realtime';
import type { SupportConversation, SupportMessage } from '../page';

const GATEWAY_URL = process.env.NEXT_PUBLIC_ADMIN_GATEWAY_URL || 'http://localhost:3030';

type SupportThreadProps = {
    conversation: SupportConversation;
    onConversationUpdate: () => void;
};

export function SupportThread({ conversation, onConversationUpdate }: SupportThreadProps) {
    const { getToken } = useAuth();
    const [messages, setMessages] = useState<SupportMessage[]>([]);
    const [input, setInput] = useState('');
    const [sending, setSending] = useState(false);
    const [loading, setLoading] = useState(true);
    const scrollRef = useRef<HTMLDivElement>(null);

    const fetchMessages = useCallback(async () => {
        try {
            const token = await getToken().catch(() => null);
            const res = await fetch(
                `${GATEWAY_URL}/support/conversations/${conversation.id}/messages?limit=100`,
                { headers: { Authorization: `Bearer ${token}` } },
            );
            if (!res.ok) return;
            const payload = await res.json();
            setMessages(payload.data ?? []);
        } catch {
            // silent
        } finally {
            setLoading(false);
        }
    }, [getToken, conversation.id]);

    useEffect(() => {
        setLoading(true);
        setMessages([]);
        fetchMessages();
    }, [fetchMessages]);

    // Auto-scroll
    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages.length]);

    // Listen for new messages in this conversation
    useAdminRealtime(`support:conv:${conversation.id}`, (data: unknown) => {
        const event = data as { type?: string };
        if (event?.type === 'message.new') {
            fetchMessages();
        }
    });

    const handleSend = async () => {
        const text = input.trim();
        if (!text || sending) return;

        setSending(true);
        setInput('');
        try {
            const token = await getToken().catch(() => null);
            const res = await fetch(
                `${GATEWAY_URL}/support/conversations/${conversation.id}/messages`,
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${token}`,
                    },
                    body: JSON.stringify({ body: text }),
                },
            );
            if (res.ok) {
                await fetchMessages();
                onConversationUpdate();
            }
        } catch {
            setInput(text);
        } finally {
            setSending(false);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    const handleStatusChange = async (status: string) => {
        try {
            const token = await getToken().catch(() => null);
            await fetch(
                `${GATEWAY_URL}/support/conversations/${conversation.id}`,
                {
                    method: 'PATCH',
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${token}`,
                    },
                    body: JSON.stringify({ status }),
                },
            );
            onConversationUpdate();
        } catch {
            // silent
        }
    };

    const handleClaim = async () => {
        try {
            const token = await getToken().catch(() => null);
            await fetch(
                `${GATEWAY_URL}/support/conversations/${conversation.id}/claim`,
                {
                    method: 'POST',
                    headers: { Authorization: `Bearer ${token}` },
                },
            );
            onConversationUpdate();
        } catch {
            // silent
        }
    };

    return (
        <div className="flex flex-col h-full">
            {/* Header */}
            <div className="flex items-center justify-between gap-3 p-3 border-b border-base-300 bg-base-100">
                <div className="min-w-0">
                    <h3 className="text-sm font-semibold truncate">
                        {conversation.subject || conversation.visitor_name || conversation.visitor_email || `Session ${conversation.visitor_session_id.slice(0, 8)}`}
                    </h3>
                    <div className="flex items-center gap-2 text-sm text-base-content/50">
                        <span>{conversation.source_app}</span>
                        {conversation.category && (
                            <>
                                <span>&middot;</span>
                                <span>{conversation.category}</span>
                            </>
                        )}
                        {conversation.visitor_email && (
                            <>
                                <span>&middot;</span>
                                <span>{conversation.visitor_email}</span>
                            </>
                        )}
                    </div>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                    {!conversation.assigned_admin_id && (
                        <button
                            type="button"
                            onClick={handleClaim}
                            className="btn btn-sm btn-ghost"
                        >
                            <i className="fa-duotone fa-regular fa-hand text-sm" />
                            Claim
                        </button>
                    )}
                    <select
                        className="select select-sm"
                        value={conversation.status}
                        onChange={(e) => handleStatusChange(e.target.value)}
                    >
                        <option value="open">Open</option>
                        <option value="waiting_on_visitor">Waiting on Visitor</option>
                        <option value="waiting_on_admin">Waiting on Admin</option>
                        <option value="resolved">Resolved</option>
                        <option value="closed">Closed</option>
                    </select>
                </div>
            </div>

            {/* Messages */}
            <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-1">
                {loading ? (
                    <div className="flex items-center justify-center h-full">
                        <span className="loading loading-spinner loading-sm" />
                    </div>
                ) : messages.length === 0 ? (
                    <div className="text-center text-base-content/40 text-sm">
                        No messages yet
                    </div>
                ) : (
                    messages.map((msg) => {
                        if (msg.sender_type === 'system') {
                            return (
                                <div key={msg.id} className="text-center py-2">
                                    <span className="text-sm italic text-base-content/40">
                                        {msg.body}
                                    </span>
                                </div>
                            );
                        }

                        const isAdmin = msg.sender_type === 'admin';
                        return (
                            <div key={msg.id} className={`chat ${isAdmin ? 'chat-end' : 'chat-start'}`}>
                                <div className="chat-header text-sm text-base-content/40">
                                    {isAdmin ? 'Admin' : (conversation.visitor_name || 'Visitor')}
                                    <time className="text-sm text-base-content/30 ml-1">
                                        {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </time>
                                </div>
                                <div className={`chat-bubble ${isAdmin ? 'chat-bubble-primary' : ''}`}>
                                    {msg.body}
                                </div>
                            </div>
                        );
                    })
                )}
            </div>

            {/* Input */}
            <div className="border-t border-base-300 p-3 bg-base-100">
                <div className="flex gap-2">
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="Type a reply..."
                        className="input input-sm flex-1"
                        disabled={sending}
                    />
                    <button
                        type="button"
                        onClick={handleSend}
                        disabled={!input.trim() || sending}
                        className="btn btn-primary btn-sm btn-square"
                    >
                        <i className="fa-solid fa-paper-plane-top text-sm" />
                    </button>
                </div>
            </div>
        </div>
    );
}
