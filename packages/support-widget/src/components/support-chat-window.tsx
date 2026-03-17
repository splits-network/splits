'use client';

import { useSupportChat } from '../context/support-provider';
import { SupportChatView } from './support-chat-view';
import { SupportOfflineForm } from './support-offline-form';

export function SupportChatWindow() {
    const { isOpen, close, adminOnline, activeConversation } = useSupportChat();

    if (!isOpen) return null;

    // Show chat view if there's an active conversation (regardless of admin status)
    // or if admin is online. Show offline form only when no conversation and admin is offline.
    const showChatView = activeConversation || adminOnline;

    return (
        <div
            className="fixed bottom-4 left-4 z-40 w-[380px] max-w-[calc(100vw-2rem)] h-[500px] max-h-[60vh]
                        flex flex-col bg-base-100 border border-base-300 shadow-xl rounded-lg overflow-hidden"
        >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 bg-base-200 border-b border-base-300 flex-shrink-0">
                <div className="flex items-center gap-2">
                    <i className="fa-duotone fa-regular fa-headset text-primary" />
                    <span className="font-semibold text-sm">Support</span>
                    <span
                        className={`badge badge-xs ${adminOnline ? 'badge-success' : 'badge-ghost'}`}
                    >
                        {adminOnline ? 'Online' : 'Offline'}
                    </span>
                </div>
                <button
                    type="button"
                    onClick={close}
                    className="btn btn-ghost btn-xs btn-square"
                    aria-label="Close support chat"
                >
                    <i className="fa-solid fa-xmark" />
                </button>
            </div>

            {/* Body */}
            {showChatView ? <SupportChatView /> : <SupportOfflineForm />}
        </div>
    );
}
