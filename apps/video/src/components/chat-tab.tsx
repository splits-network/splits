'use client';

import { useState, useEffect, useRef } from 'react';
import { useChat } from '@livekit/components-react';

/**
 * In-call chat tab using LiveKit's built-in data channel.
 * No separate WebSocket needed — piggybacks on the existing LiveKit room connection.
 * Message history is session-only (lost on refresh).
 */
export function ChatTab() {
    const { chatMessages, send, isSending } = useChat();
    const [input, setInput] = useState('');
    const messagesEndRef = useRef<HTMLDivElement>(null);

    // Auto-scroll on new messages
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [chatMessages.length]);

    const sendMessage = async () => {
        const trimmed = input.trim();
        if (!trimmed || isSending) return;
        setInput('');
        await send(trimmed);
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    };

    return (
        <div className="flex flex-col h-full -m-4">
            {/* Messages area */}
            <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
                {chatMessages.length === 0 && (
                    <div className="text-center py-12">
                        <i className="fa-duotone fa-regular fa-messages text-5xl text-base-content/15 mb-4" />
                        <p className="text-sm font-semibold text-base-content/40">
                            No messages yet
                        </p>
                        <p className="text-sm text-base-content/30 mt-1">
                            Start the conversation with your team.
                        </p>
                    </div>
                )}

                {chatMessages.map((msg) => {
                    const isOwn = msg.from?.isLocal ?? false;
                    const senderName = msg.from?.name || msg.from?.identity || 'Unknown';
                    return (
                        <div
                            key={msg.id ?? msg.timestamp}
                            className={`flex flex-col ${isOwn ? 'items-end' : 'items-start'}`}
                        >
                            {!isOwn && (
                                <span className="text-sm text-base-content/50 mb-0.5 ml-1">
                                    {senderName}
                                </span>
                            )}
                            <div
                                className={`max-w-[85%] px-3 py-2 text-sm rounded-none shadow-sm ${
                                    isOwn
                                        ? 'bg-primary text-primary-content'
                                        : 'bg-base-200 text-base-content'
                                }`}
                            >
                                {msg.message}
                            </div>
                            <span className="text-sm text-base-content/30 mt-0.5 mx-1">
                                {formatTime(msg.timestamp)}
                            </span>
                        </div>
                    );
                })}

                <div ref={messagesEndRef} />
            </div>

            {/* Input area */}
            <div className="border-t-2 border-base-300 p-3">
                <div className="flex gap-2">
                    <input
                        type="text"
                        className="input input-bordered rounded-none flex-1 text-sm"
                        placeholder="Type a message..."
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={handleKeyDown}
                    />
                    <button
                        type="button"
                        className="btn btn-primary btn-sm rounded-none"
                        onClick={sendMessage}
                        disabled={!input.trim() || isSending}
                    >
                        <i className="fa-duotone fa-regular fa-paper-plane-top" />
                    </button>
                </div>
            </div>
        </div>
    );
}

function formatTime(timestamp: number): string {
    const date = new Date(timestamp);
    return date.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });
}
