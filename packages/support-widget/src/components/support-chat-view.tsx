'use client';

import { useState, useRef, useEffect } from 'react';
import { useSupportChat } from '../context/support-provider';
import { SupportMessageBubble } from './support-message-bubble';

export function SupportChatView() {
    const { messages, sendMessage, startConversation, activeConversation, sendTyping } = useSupportChat();
    const [input, setInput] = useState('');
    const [sending, setSending] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);

    // Auto-scroll to bottom on new messages
    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages.length]);

    const handleSend = async () => {
        const text = input.trim();
        if (!text || sending) return;

        setSending(true);
        setInput('');
        try {
            if (activeConversation) {
                await sendMessage(text);
            } else {
                // First message — create the conversation
                await startConversation({ body: text });
            }
        } catch {
            setInput(text); // Restore on failure
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

    return (
        <div className="flex flex-col flex-1 min-h-0">
            {/* Messages */}
            <div ref={scrollRef} className="flex-1 overflow-y-auto p-3 space-y-1">
                {messages.length === 0 ? (
                    <div className="flex items-center justify-center h-full">
                        <p className="text-sm text-base-content/50 text-center">
                            Start a conversation by sending a message below.
                        </p>
                    </div>
                ) : (
                    messages.map((msg) => (
                        <SupportMessageBubble key={msg.id} message={msg} />
                    ))
                )}
            </div>

            {/* Input */}
            <div className="border-t border-base-300 p-3">
                <div className="flex gap-2">
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={handleKeyDown}
                        onFocus={() => activeConversation && sendTyping(activeConversation.id, true)}
                        onBlur={() => activeConversation && sendTyping(activeConversation.id, false)}
                        placeholder="Type a message..."
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