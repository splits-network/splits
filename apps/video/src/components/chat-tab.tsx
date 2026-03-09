'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import type { CallDetail, ChatMessage } from '@/lib/types';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
const CHAT_WS_URL = process.env.NEXT_PUBLIC_CHAT_GATEWAY_URL || 'ws://127.0.0.1:3020/ws/chat';

interface ChatTabProps {
    call: CallDetail;
}

/**
 * In-call chat tab. Connects to the chat gateway WebSocket for real-time messaging.
 * Uses the call's room name as the chat channel.
 * Auto-scrolls to latest message.
 */
export function ChatTab({ call }: ChatTabProps) {
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [input, setInput] = useState('');
    const [isConnected, setIsConnected] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const wsRef = useRef<WebSocket | null>(null);

    const channel = `call:${call.id}`;

    // Derive current user from first participant
    const currentUser = call.participants[0];
    const currentUserId = currentUser?.user_id || 'unknown';
    const currentUserName = currentUser
        ? `${currentUser.user.first_name} ${currentUser.user.last_name}`
        : 'You';

    // Auto-scroll on new messages
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages.length]);

    // WebSocket connection
    useEffect(() => {
        const ws = new WebSocket(CHAT_WS_URL);
        wsRef.current = ws;

        ws.onopen = () => {
            setIsConnected(true);
            ws.send(JSON.stringify({ type: 'subscribe', channels: [channel] }));
        };

        ws.onmessage = (event) => {
            try {
                const payload = JSON.parse(event.data);
                if (payload.type === 'hello') return;

                if (payload.type === 'chat.message' && payload.data) {
                    const msg: ChatMessage = {
                        id: payload.data.id || crypto.randomUUID(),
                        sender_name: payload.data.sender_name || 'Unknown',
                        sender_id: payload.data.sender_id || '',
                        body: payload.data.body || '',
                        created_at: payload.data.created_at || new Date().toISOString(),
                    };
                    setMessages((prev) => [...prev, msg]);
                }
            } catch {
                // Ignore malformed payloads
            }
        };

        ws.onclose = () => {
            setIsConnected(false);
        };

        ws.onerror = () => {
            // Error handling via onclose
        };

        return () => {
            ws.close();
            wsRef.current = null;
        };
    }, [channel]);

    const sendMessage = useCallback(() => {
        const trimmed = input.trim();
        if (!trimmed || !wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) return;

        const msg: ChatMessage = {
            id: crypto.randomUUID(),
            sender_name: currentUserName,
            sender_id: currentUserId,
            body: trimmed,
            created_at: new Date().toISOString(),
        };

        wsRef.current.send(JSON.stringify({
            type: 'chat.message',
            channel,
            data: msg,
        }));

        // Optimistic add
        setMessages((prev) => [...prev, msg]);
        setInput('');
    }, [input, currentUserName, currentUserId, channel]);

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    };

    return (
        <div className="flex flex-col h-full -m-4">
            {/* Connection status */}
            {!isConnected && (
                <div className="px-4 py-2 bg-warning/10 text-warning text-sm text-center">
                    <i className="fa-duotone fa-regular fa-wifi-slash mr-1" />
                    Connecting to chat...
                </div>
            )}

            {/* Messages area */}
            <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
                {messages.length === 0 && (
                    <div className="text-center py-8">
                        <i className="fa-duotone fa-regular fa-messages text-3xl text-base-content/20 mb-3" />
                        <p className="text-sm text-base-content/40">
                            No messages yet. Start the conversation.
                        </p>
                    </div>
                )}

                {messages.map((msg) => {
                    const isOwn = msg.sender_id === currentUserId;
                    return (
                        <div
                            key={msg.id}
                            className={`flex flex-col ${isOwn ? 'items-end' : 'items-start'}`}
                        >
                            {!isOwn && (
                                <span className="text-sm text-base-content/50 mb-0.5 ml-1">
                                    {msg.sender_name}
                                </span>
                            )}
                            <div
                                className={`max-w-[85%] px-3 py-2 text-sm ${
                                    isOwn
                                        ? 'bg-primary text-primary-content'
                                        : 'bg-base-200 text-base-content'
                                }`}
                            >
                                {msg.body}
                            </div>
                            <span className="text-sm text-base-content/30 mt-0.5 mx-1">
                                {formatTime(msg.created_at)}
                            </span>
                        </div>
                    );
                })}

                <div ref={messagesEndRef} />
            </div>

            {/* Input area */}
            <div className="border-t border-base-300 p-3">
                <div className="flex gap-2">
                    <input
                        type="text"
                        className="input input-bordered flex-1 text-sm"
                        placeholder="Type a message..."
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={handleKeyDown}
                        disabled={!isConnected}
                    />
                    <button
                        type="button"
                        className="btn btn-primary btn-sm"
                        onClick={sendMessage}
                        disabled={!input.trim() || !isConnected}
                    >
                        <i className="fa-duotone fa-regular fa-paper-plane-top" />
                    </button>
                </div>
            </div>
        </div>
    );
}

function formatTime(dateStr: string): string {
    const date = new Date(dateStr);
    return date.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });
}
