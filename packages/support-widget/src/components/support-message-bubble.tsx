'use client';

import type { SupportMessage } from '../lib/support-api';

interface SupportMessageBubbleProps {
    message: SupportMessage;
}

export function SupportMessageBubble({ message }: SupportMessageBubbleProps) {
    const isVisitor = message.sender_type === 'visitor';
    const isSystem = message.sender_type === 'system';

    if (isSystem) {
        return (
            <div className="text-center py-1">
                <span className="text-sm text-base-content/40 italic">{message.body}</span>
            </div>
        );
    }

    return (
        <div className={`chat ${isVisitor ? 'chat-end' : 'chat-start'}`}>
            <div className="chat-header text-sm text-base-content/50">
                {isVisitor ? 'You' : 'Support'}
                <time className="text-sm text-base-content/30 ml-2">
                    {new Date(message.created_at).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                    })}
                </time>
            </div>
            <div
                className={`chat-bubble ${
                    isVisitor ? 'chat-bubble-primary' : 'chat-bubble-neutral'
                } text-sm`}
            >
                {message.body}
            </div>
        </div>
    );
}
