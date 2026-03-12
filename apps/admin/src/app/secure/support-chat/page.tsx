'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@clerk/nextjs';
import { AdminPageHeader } from '@/components/shared';
import { useAdminRealtime } from '@/hooks/use-admin-realtime';
import { SupportQueue } from './components/support-queue';
import { SupportThread } from './components/support-thread';
import { useSupportPresence } from './components/use-support-presence';

const GATEWAY_URL = process.env.NEXT_PUBLIC_ADMIN_GATEWAY_URL || 'http://localhost:3030';

export type SupportConversation = {
    id: string;
    visitor_session_id: string;
    clerk_user_id: string | null;
    user_id: string | null;
    visitor_name: string | null;
    visitor_email: string | null;
    source_app: string;
    assigned_admin_id: string | null;
    status: string;
    category: string | null;
    subject: string | null;
    page_url: string | null;
    created_at: string;
    updated_at: string;
    last_message_at: string | null;
    last_message_preview: string | null;
};

export type SupportMessage = {
    id: string;
    conversation_id: string;
    sender_type: 'visitor' | 'admin' | 'system';
    sender_id: string | null;
    body: string;
    metadata: Record<string, unknown> | null;
    created_at: string;
};

export default function SupportChatPage() {
    const { getToken } = useAuth();
    const [conversations, setConversations] = useState<SupportConversation[]>([]);
    const [activeId, setActiveId] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [statusFilter, setStatusFilter] = useState<string>('');

    // Keep admin presence alive while on this page
    useSupportPresence();

    const fetchConversations = useCallback(async () => {
        try {
            const token = await getToken().catch(() => null);
            const params = new URLSearchParams();
            if (statusFilter) params.set('status', statusFilter);
            params.set('limit', '50');
            const res = await fetch(
                `${GATEWAY_URL}/api/v2/support/admin/support/conversations?${params}`,
                { headers: { Authorization: `Bearer ${token}` } },
            );
            if (!res.ok) return;
            const payload = await res.json();
            setConversations(payload.data ?? []);
        } catch {
            // silent
        } finally {
            setLoading(false);
        }
    }, [getToken, statusFilter]);

    useEffect(() => {
        fetchConversations();
    }, [fetchConversations]);

    // Listen for new support events via admin-gateway WebSocket
    useAdminRealtime('admin:support:queue', () => {
        fetchConversations();
    });

    const activeConversation = conversations.find((c) => c.id === activeId) ?? null;

    return (
        <div className="flex flex-col h-[calc(100vh-3.5rem)]">
            <AdminPageHeader
                title="Support Chat"
                subtitle="Live visitor support conversations"
            />

            <div className="flex flex-1 min-h-0">
                {/* Queue */}
                <SupportQueue
                    conversations={conversations}
                    activeId={activeId}
                    onSelect={setActiveId}
                    loading={loading}
                    statusFilter={statusFilter}
                    onStatusFilterChange={setStatusFilter}
                />

                {/* Thread */}
                <div className="flex-1 flex flex-col min-w-0">
                    {activeConversation ? (
                        <SupportThread
                            conversation={activeConversation}
                            onConversationUpdate={fetchConversations}
                        />
                    ) : (
                        <div className="flex-1 flex items-center justify-center">
                            <div className="text-center text-base-content/40">
                                <i className="fa-duotone fa-regular fa-headset text-4xl mb-3 block" />
                                <p className="text-sm">Select a conversation from the queue</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
