"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useAuth } from "@clerk/nextjs";
import { createAuthenticatedClient } from "@/lib/api-client";
import { useChatGateway } from "@/hooks/use-chat-gateway";
import {
    registerChatRefresh,
    requestChatRefresh,
} from "@/lib/chat-refresh-queue";
import { useToast } from "@/lib/toast-context";
import { BaselPromptModal } from "@splits-network/basel-ui";
import { ThreadHeader } from "./thread-header";
import { ThreadMessages } from "./thread-messages";
import { ThreadCompose } from "./thread-compose";
import { ResyncData } from "./types";

interface ThreadPanelProps {
    conversationId: string;
    onClose?: () => void;
    showHeader?: boolean;
}

const PAGE_SIZE = 50;

export default function ThreadPanel({
    conversationId,
    onClose,
    showHeader = true,
}: ThreadPanelProps) {
    const { getToken } = useAuth();
    const toast = useToast();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [data, setData] = useState<ResyncData | null>(null);
    const [applicationTitle, setApplicationTitle] = useState<string | null>(
        null,
    );
    const [jobTitle, setJobTitle] = useState<string | null>(null);
    const [draft, setDraft] = useState("");
    const [sending, setSending] = useState(false);
    const [isLoadingMore, setIsLoadingMore] = useState(false);
    const [hasMore, setHasMore] = useState(true);
    const [reportStep, setReportStep] = useState<null | "category" | "details">(null);
    const [reportCategory, setReportCategory] = useState("");
    const prevScrollRef = useRef<{
        height: number;
        top: number;
        container: HTMLDivElement | null;
    } | null>(null);

    const fetchResync = useCallback(async () => {
        const token = await getToken();
        if (!token) return;
        const client = createAuthenticatedClient(token);
        const response: any = await client.post(
            `/chat/conversations/${conversationId}/actions/resync`,
        );
        const payload = response?.data as ResyncData;
        setData(payload);
        setHasMore((payload?.messages?.length || 0) >= PAGE_SIZE);
        const lastMessageId =
            payload?.messages?.length > 0
                ? payload.messages[payload.messages.length - 1].id
                : null;
        if (lastMessageId) await markRead(lastMessageId);
    }, [conversationId, getToken]);

    const markRead = async (lastReadMessageId: string) => {
        const token = await getToken();
        if (!token) return;
        const client = createAuthenticatedClient(token);
        try {
            await client.post(
                `/chat/conversations/${conversationId}/actions/read-receipt`,
                { lastReadMessageId },
            );
        } catch {
            // Best-effort
        }
    };

    const fetchContextDetails = async (
        applicationId?: string | null,
        jobId?: string | null,
    ) => {
        const token = await getToken();
        if (!token) return;
        const client = createAuthenticatedClient(token);
        if (applicationId) {
            try {
                const response: any = await client.get(
                    `/applications/${applicationId}`,
                    { params: { include: "job" } },
                );
                const app = response?.data;
                if (app?.job?.title) {
                    setApplicationTitle(app.job.title);
                    setJobTitle(app.job.title);
                }
            } catch {
                setApplicationTitle(applicationId);
            }
        }
        if (jobId && !jobTitle) {
            try {
                const response: any = await client.get(`/jobs/${jobId}`);
                if (response?.data?.title) setJobTitle(response.data.title);
            } catch {
                if (!jobTitle) setJobTitle(jobId);
            }
        }
    };

    useEffect(() => {
        let mounted = true;
        const load = async () => {
            setLoading(true);
            setError(null);
            try {
                await fetchResync();
            } catch (err: any) {
                if (mounted) setError(err?.message || "Failed to load");
            } finally {
                if (mounted) setLoading(false);
            }
        };
        load();
        return () => {
            mounted = false;
        };
    }, [conversationId, fetchResync]);

    const otherUserId = useMemo(() => {
        if (!data) return null;
        return data.conversation.participant_a_id === data.participant.user_id
            ? data.conversation.participant_b_id
            : data.conversation.participant_a_id;
    }, [data]);

    const otherUser = useMemo(() => {
        if (!data || !otherUserId) return null;
        return otherUserId === data.conversation.participant_a_id
            ? data.conversation.participant_a
            : data.conversation.participant_b;
    }, [data, otherUserId]);

    useEffect(() => {
        if (data?.conversation) {
            fetchContextDetails(
                data.conversation.application_id,
                data.conversation.job_id,
            );
        }
    }, [data?.conversation?.application_id, data?.conversation?.job_id]);

    useEffect(() => {
        const unregister = registerChatRefresh(() => fetchResync());
        return () => unregister();
    }, [fetchResync]);

    useChatGateway({
        enabled: Boolean(data?.participant?.user_id),
        channels: data?.participant?.user_id
            ? [`user:${data.participant.user_id}`, `conv:${conversationId}`]
            : [`conv:${conversationId}`],
        getToken,
        presencePingEnabled: false,
        onReconnect: () => requestChatRefresh(),
        onEvent: (event) => {
            if (
                [
                    "message.created",
                    "message.updated",
                    "conversation.updated",
                    "conversation.requested",
                    "conversation.accepted",
                    "conversation.declined",
                    "read.receipt",
                ].includes(event.type)
            ) {
                requestChatRefresh();
            }
        },
    });

    const handleSend = async () => {
        if (!draft.trim()) return;
        setSending(true);
        try {
            const token = await getToken();
            if (!token) return;
            const client = createAuthenticatedClient(token);
            await client.post(
                `/chat/conversations/${conversationId}/messages`,
                { body: draft.trim(), clientMessageId: crypto.randomUUID() },
            );
            setDraft("");
            await fetchResync();
        } catch (err: any) {
            setError(err?.message || "Failed to send message");
            toast.error(err?.message || "Failed to send message");
        } finally {
            setSending(false);
        }
    };

    const handleAccept = async () => {
        const token = await getToken();
        if (!token) return;
        const client = createAuthenticatedClient(token);
        await client.post(`/chat/conversations/${conversationId}/actions/accept`);
        await fetchResync();
        requestChatRefresh();
    };

    const handleDecline = async () => {
        const token = await getToken();
        if (!token) return;
        const client = createAuthenticatedClient(token);
        await client.post(`/chat/conversations/${conversationId}/actions/decline`);
        toast.success("Conversation declined.");
        await fetchResync();
        requestChatRefresh();
    };

    const handleArchive = async () => {
        const token = await getToken();
        if (!token) return;
        const client = createAuthenticatedClient(token);
        if (data?.participant.archived_at) {
            await client.post(
                `/chat/conversations/${conversationId}/actions/archive`,
                { archived: false },
            );
        } else {
            await client.post(`/chat/conversations/${conversationId}/actions/archive`, { archived: true });
        }
        await fetchResync();
    };

    const handleMute = async () => {
        const token = await getToken();
        if (!token) return;
        const client = createAuthenticatedClient(token);
        if (data?.participant.muted_at) {
            await client.post(`/chat/conversations/${conversationId}/actions/mute`, { muted: false });
        } else {
            await client.post(`/chat/conversations/${conversationId}/actions/mute`, { muted: true });
        }
        await fetchResync();
    };

    const handleBlock = async () => {
        if (!otherUserId) return;
        const token = await getToken();
        if (!token) return;
        const client = createAuthenticatedClient(token);
        await client.post(`/chat/blocks`, { blockedUserId: otherUserId });
        toast.success("User blocked.");
        await fetchResync();
        requestChatRefresh();
    };

    const handleReport = () => {
        if (!otherUserId) return;
        setReportStep("category");
    };

    const handleReportCategory = (category: string) => {
        setReportCategory(category);
        setReportStep("details");
    };

    const handleReportDetails = async (description: string) => {
        setReportStep(null);
        const token = await getToken();
        if (!token) return;
        const client = createAuthenticatedClient(token);
        await client.post(`/chat/reports`, {
            conversationId,
            reportedUserId: otherUserId,
            category: reportCategory,
            description: description || undefined,
        });
        toast.success("Report submitted.");
        setReportCategory("");
    };

    const loadOlderMessages = useCallback(async () => {
        if (isLoadingMore || !hasMore || !data?.messages?.length) return;
        const oldestId = data.messages[0]?.id;
        if (!oldestId) return;
        setIsLoadingMore(true);
        try {
            const token = await getToken();
            if (!token) return;
            const client = createAuthenticatedClient(token);
            const response: any = await client.get(
                `/chat/conversations/${conversationId}/messages`,
                { params: { before: oldestId, limit: PAGE_SIZE } },
            );
            const incoming = (response?.data || []) as ResyncData["messages"];
            setHasMore(incoming.length >= PAGE_SIZE);
            if (incoming.length > 0) {
                setData((prev) => {
                    if (!prev) return prev;
                    const existingIds = new Set(
                        prev.messages.map((m) => m.id),
                    );
                    const next = incoming.filter(
                        (m) => !existingIds.has(m.id),
                    );
                    return {
                        ...prev,
                        messages: [...next, ...prev.messages],
                    };
                });
            }
        } finally {
            setIsLoadingMore(false);
        }
    }, [conversationId, data?.messages, getToken, hasMore, isLoadingMore]);

    if (loading) {
        return (
            <div className="p-6">
                <span className="loading loading-spinner loading-md" />
            </div>
        );
    }

    if (error || !data) {
        return (
            <div className="p-6 text-error">
                {error || "Unable to load conversation"}
            </div>
        );
    }

    const requestPending = data.participant.request_state === "pending";
    const requestDeclined = data.participant.request_state === "declined";
    const disabled =
        requestPending ||
        requestDeclined ||
        data.participant.archived_at !== null;

    const headerTitle =
        otherUser?.name || otherUser?.email || "Conversation";
    const headerSubtitle = requestPending
        ? "Request pending"
        : requestDeclined
          ? "Declined"
          : "Chat thread";

    const placeholderText = requestPending
        ? "Accept this request to reply."
        : requestDeclined
          ? "Conversation declined."
          : data.participant.archived_at
            ? "Unarchive to reply."
            : data.messages.length === 1 &&
                data.participant.request_state === "accepted"
              ? "They'll be notified of your first message. Additional messages will be held until they accept..."
              : "Type your message...";

    return (
        <div className="flex h-full flex-col max-h-[80vh]">
            {showHeader && (
                <ThreadHeader
                    data={data}
                    otherUser={otherUser}
                    headerTitle={headerTitle}
                    headerSubtitle={headerSubtitle}
                    requestPending={requestPending}
                    onAccept={handleAccept}
                    onDecline={handleDecline}
                    onArchive={handleArchive}
                    onMute={handleMute}
                    onBlock={handleBlock}
                    onReport={handleReport}
                    onClose={onClose}
                />
            )}

            <ThreadMessages
                data={data}
                otherUser={otherUser}
                applicationTitle={applicationTitle}
                jobTitle={jobTitle}
                isLoadingMore={isLoadingMore}
                hasMore={hasMore}
                onLoadMore={loadOlderMessages}
            />

            <ThreadCompose
                draft={draft}
                onDraftChange={setDraft}
                onSend={handleSend}
                sending={sending}
                disabled={disabled}
                placeholderText={placeholderText}
            />

            <BaselPromptModal
                isOpen={reportStep === "category"}
                onClose={() => setReportStep(null)}
                onSubmit={handleReportCategory}
                title="Report Conversation"
                subtitle="Step 1 of 2"
                icon="fa-flag"
                iconColor="error"
                label="Report category"
                placeholder="e.g. spam, harassment, fraud, other"
                defaultValue="spam"
                submitLabel="Next"
                submitColor="btn-error"
            />
            <BaselPromptModal
                isOpen={reportStep === "details"}
                onClose={() => setReportStep(null)}
                onSubmit={handleReportDetails}
                title="Report Details"
                subtitle="Step 2 of 2"
                icon="fa-flag"
                iconColor="error"
                label="Additional details (optional)"
                placeholder="Describe the issue..."
                required={false}
                multiline
                submitLabel="Submit Report"
                submitColor="btn-error"
            />
        </div>
    );
}
