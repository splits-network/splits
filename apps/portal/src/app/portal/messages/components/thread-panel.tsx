"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useAuth } from "@clerk/nextjs";
import { createAuthenticatedClient } from "@/lib/api-client";
import { useChatGateway } from "@/hooks/use-chat-gateway";
import {
    registerChatRefresh,
    requestChatRefresh,
} from "@/lib/chat-refresh-queue";
import { useToast } from "@/lib/toast-context";
import { MarkdownEditor } from "@splits-network/shared-ui";
import { MarkdownRenderer } from "@/components/markdown-renderer";

type ParticipantDetails = {
    id: string;
    name: string | null;
    email: string;
    profile_image_url?: string | null;
};

type ResyncData = {
    conversation: {
        id: string;
        participant_a_id: string;
        participant_b_id: string;
        application_id: string | null;
        job_id: string | null;
        company_id: string | null;
        last_message_at: string | null;
        participant_a: ParticipantDetails;
        participant_b: ParticipantDetails;
    };
    participant: {
        user_id: string;
        muted_at: string | null;
        archived_at: string | null;
        request_state: "none" | "pending" | "accepted" | "declined";
        unread_count: number;
    };
    messages: Array<{
        id: string;
        sender_id: string;
        body: string | null;
        created_at: string;
    }>;
};

type UserSummary = ParticipantDetails;

interface ThreadPanelProps {
    conversationId: string;
    onClose?: () => void;
    showHeader?: boolean;
}

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
    const [useMarkdownEditor, setUseMarkdownEditor] = useState(false);
    const messagesRef = useRef<HTMLDivElement | null>(null);
    const [isAtBottom, setIsAtBottom] = useState(true);
    const initialScrollDoneRef = useRef(false);
    const [isLoadingMore, setIsLoadingMore] = useState(false);
    const [hasMore, setHasMore] = useState(true);
    const pageSize = 50;

    const fetchResync = useCallback(async () => {
        const token = await getToken();
        if (!token) return;
        const client = createAuthenticatedClient(token);
        const response: any = await client.get(
            `/chat/conversations/${conversationId}/resync`,
        );
        let payload = response?.data;

        // TEMPORARY: Handle old API format during migration
        // Old format: { conversation: {...}, participant: {...}, messages: [...] }
        // New format: same, but conversation includes participant_a and participant_b
        // If old format (no participant_a), we can still use it but won't have inline user data
        if (payload && !payload.conversation?.participant_a) {
            console.warn(
                "Received old API format without inline participant data",
            );
        }

        setData(payload as ResyncData);
        setHasMore((payload?.messages?.length || 0) >= pageSize);
        const lastMessageId =
            payload?.messages?.length > 0
                ? payload.messages[payload.messages.length - 1].id
                : null;
        if (lastMessageId) {
            await markRead(lastMessageId);
        }
    }, [conversationId, getToken]);

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
                const application = response?.data;
                if (application?.job?.title) {
                    setApplicationTitle(application.job.title);
                    setJobTitle(application.job.title);
                }
            } catch {
                setApplicationTitle(applicationId);
            }
        }

        if (jobId) {
            try {
                const response: any = await client.get(`/jobs/${jobId}`);
                const job = response?.data;
                if (job?.title) setJobTitle(job.title);
            } catch {
                if (!jobTitle) setJobTitle(jobId);
            }
        }
    };

    const markRead = async (lastReadMessageId: string) => {
        const token = await getToken();
        if (!token) return;
        const client = createAuthenticatedClient(token);
        try {
            await client.post(
                `/chat/conversations/${conversationId}/read-receipt`,
                {
                    lastReadMessageId,
                },
            );
        } catch {
            // Best-effort; avoid breaking the thread view.
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
                if (mounted) {
                    setError(err?.message || "Failed to load conversation");
                }
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

        // Try to get from inline participant data (new format)
        const participant =
            otherUserId === data.conversation.participant_a_id
                ? data.conversation.participant_a
                : data.conversation.participant_b;

        // If we have inline participant data, use it
        if (participant) {
            return participant;
        }

        // Fallback for old API format: create minimal user object
        return {
            id: otherUserId,
            name: null,
            email: "Loading...",
        };
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
        return () => {
            unregister();
        };
    }, [fetchResync]);

    useChatGateway({
        enabled: Boolean(data?.participant?.user_id),
        channels: data?.participant?.user_id
            ? [`user:${data.participant.user_id}`, `conv:${conversationId}`]
            : [`conv:${conversationId}`],
        getToken,
        onReconnect: () => {
            requestChatRefresh();
        },
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
                {
                    body: draft.trim(),
                    clientMessageId: crypto.randomUUID(),
                },
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
        await client.post(`/chat/conversations/${conversationId}/accept`);
        await fetchResync();
    };

    const handleDecline = async () => {
        const token = await getToken();
        if (!token) return;
        const client = createAuthenticatedClient(token);
        await client.post(`/chat/conversations/${conversationId}/decline`);
        toast.success("Conversation declined");
        await fetchResync();
        requestChatRefresh();
    };

    const handleArchive = async () => {
        const token = await getToken();
        if (!token) return;
        const client = createAuthenticatedClient(token);
        if (data?.participant.archived_at) {
            await client.delete(
                `/chat/conversations/${conversationId}/archive`,
            );
        } else {
            await client.post(`/chat/conversations/${conversationId}/archive`);
        }
        await fetchResync();
    };

    const handleMute = async () => {
        const token = await getToken();
        if (!token) return;
        const client = createAuthenticatedClient(token);
        if (data?.participant.muted_at) {
            await client.delete(`/chat/conversations/${conversationId}/mute`);
        } else {
            await client.post(`/chat/conversations/${conversationId}/mute`);
        }
        await fetchResync();
    };

    const handleBlock = async () => {
        if (!otherUserId) return;
        const token = await getToken();
        if (!token) return;
        const client = createAuthenticatedClient(token);
        await client.post(`/chat/blocks`, { blockedUserId: otherUserId });
        toast.success("User blocked");
        await fetchResync();
        requestChatRefresh();
    };

    const handleReport = async () => {
        if (!otherUserId) return;
        const category = window.prompt(
            "Report category (spam, harassment, fraud, other):",
            "spam",
        );
        if (!category) return;
        const description = window.prompt("Optional details:");
        const token = await getToken();
        if (!token) return;
        const client = createAuthenticatedClient(token);
        await client.post(`/chat/reports`, {
            conversationId,
            reportedUserId: otherUserId,
            category,
            description,
        });
        toast.success("Report submitted");
    };

    const getInitials = (value?: string | null) => {
        if (!value) return "??";
        const parts = value.trim().split(/\s+/);
        if (parts.length === 1) return parts[0]?.slice(0, 2).toUpperCase();
        return `${parts[0]?.[0] ?? ""}${parts[1]?.[0] ?? ""}`.toUpperCase();
    };

    const scrollToBottom = useCallback(() => {
        if (!messagesRef.current) return;
        messagesRef.current.scrollTop = messagesRef.current.scrollHeight;
    }, []);

    const loadOlderMessages = useCallback(async () => {
        if (isLoadingMore || !hasMore) return;
        const container = messagesRef.current;
        if (!container || !data?.messages?.length) return;
        const oldestMessageId = data.messages[0]?.id;
        if (!oldestMessageId) return;

        setIsLoadingMore(true);
        const prevScrollHeight = container.scrollHeight;
        const prevScrollTop = container.scrollTop;

        try {
            const token = await getToken();
            if (!token) return;
            const client = createAuthenticatedClient(token);
            const response: any = await client.get(
                `/chat/conversations/${conversationId}/messages`,
                { params: { before: oldestMessageId, limit: pageSize } },
            );
            const incoming = (response?.data || []) as ResyncData["messages"];
            setHasMore(incoming.length >= pageSize);

            if (incoming.length > 0) {
                setData((prev) => {
                    if (!prev) return prev;
                    if (prev.messages.length > 0) {
                        const oldestKnownId = prev.messages[0]?.id;
                        if (oldestKnownId !== oldestMessageId) {
                            return prev;
                        }
                    }
                    const existingIds = new Set(
                        prev.messages.map((msg) => msg.id),
                    );
                    const nextMessages = incoming.filter(
                        (msg) => !existingIds.has(msg.id),
                    );
                    return {
                        ...prev,
                        messages: [...nextMessages, ...prev.messages],
                    };
                });

                requestAnimationFrame(() => {
                    const updated = messagesRef.current;
                    if (!updated) return;
                    const newScrollHeight = updated.scrollHeight;
                    updated.scrollTop =
                        prevScrollTop + (newScrollHeight - prevScrollHeight);
                });
            }
        } finally {
            setIsLoadingMore(false);
        }
    }, [conversationId, data?.messages, getToken, hasMore, isLoadingMore]);

    const handleScroll = useCallback(() => {
        const container = messagesRef.current;
        if (!container) return;
        const threshold = 80;
        const distanceFromBottom =
            container.scrollHeight -
            container.scrollTop -
            container.clientHeight;
        setIsAtBottom(distanceFromBottom <= threshold);

        if (container.scrollTop <= 40) {
            loadOlderMessages();
        }
    }, [loadOlderMessages]);

    useEffect(() => {
        if (!data?.messages) return;
        if (!initialScrollDoneRef.current) {
            initialScrollDoneRef.current = true;
            requestAnimationFrame(scrollToBottom);
            return;
        }
        if (isAtBottom) {
            requestAnimationFrame(scrollToBottom);
        }
    }, [data?.messages?.length, isAtBottom, scrollToBottom]);

    if (loading) {
        return (
            <div className="p-6">
                <span className="loading loading-spinner loading-md"></span>
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

    const headerTitle = otherUser?.name || otherUser?.email || "Conversation";
    const headerSubtitle = requestPending
        ? "Request pending"
        : requestDeclined
          ? "Declined"
          : "Chat thread";

    return (
        <div className="flex h-full flex-col">
            {showHeader && (
                <div className="border-b border-base-300 bg-base-100/80 backdrop-blur-sm p-4 sticky top-0 z-10">
                    <div className="flex items-start justify-between gap-3">
                        <div>
                            <div className="text-lg font-semibold">
                                {headerTitle}
                            </div>
                            <div className="text-sm text-base-content/60">
                                {headerSubtitle}
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            {requestPending && (
                                <>
                                    <button
                                        className="btn btn-primary btn-sm"
                                        onClick={handleAccept}
                                    >
                                        Accept
                                    </button>
                                    <button
                                        className="btn btn-ghost btn-sm"
                                        onClick={handleDecline}
                                    >
                                        Decline
                                    </button>
                                </>
                            )}
                            <div className="dropdown dropdown-end">
                                <button
                                    type="button"
                                    className="btn btn-ghost btn-sm btn-circle"
                                    aria-label="Conversation actions"
                                >
                                    <i className="fa-duotone fa-ellipsis-vertical"></i>
                                </button>
                                <ul className="dropdown-content menu p-2 shadow bg-base-100 rounded-box w-52">
                                    <li>
                                        <button onClick={handleMute}>
                                            <i className="fa-duotone fa-volume"></i>
                                            {data.participant.muted_at
                                                ? "Unmute"
                                                : "Mute"}
                                        </button>
                                    </li>
                                    <li>
                                        <button onClick={handleArchive}>
                                            <i className="fa-duotone fa-box-archive"></i>
                                            {data.participant.archived_at
                                                ? "Unarchive"
                                                : "Archive"}
                                        </button>
                                    </li>
                                    <li>
                                        <button onClick={handleBlock}>
                                            <i className="fa-duotone fa-ban"></i>
                                            Block
                                        </button>
                                    </li>
                                    <li>
                                        <button onClick={handleReport}>
                                            <i className="fa-duotone fa-flag"></i>
                                            Report
                                        </button>
                                    </li>
                                </ul>
                            </div>
                            {onClose && (
                                <button
                                    className="btn btn-ghost btn-sm btn-circle"
                                    onClick={onClose}
                                    aria-label="Close thread"
                                >
                                    <i className="fa-duotone fa-xmark"></i>
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            )}

            <div className="flex-1 min-h-0 flex flex-col gap-4 p-4 bg-base-200">
                {(data.conversation.application_id ||
                    data.conversation.job_id ||
                    data.conversation.company_id) && (
                    <div className="rounded-lg border border-base-200 bg-base-100 p-4 text-sm">
                        <div className="font-semibold mb-2">Context</div>
                        <div className="flex flex-wrap gap-3 text-base-content/70">
                            {data.conversation.application_id && (
                                <Link
                                    className="link link-hover"
                                    href={`/portal/applications/${data.conversation.application_id}`}
                                >
                                    Application:{" "}
                                    {applicationTitle ||
                                        data.conversation.application_id}
                                </Link>
                            )}
                            {data.conversation.job_id && (
                                <Link
                                    className="link link-hover"
                                    href={`/portal/roles/${data.conversation.job_id}`}
                                >
                                    Role: {jobTitle || data.conversation.job_id}
                                </Link>
                            )}
                            {data.conversation.company_id && (
                                <span>
                                    Company: {data.conversation.company_id}
                                </span>
                            )}
                        </div>
                    </div>
                )}

                <div
                    ref={messagesRef}
                    onScroll={handleScroll}
                    className="relative flex-1 min-h-0 rounded-lg border border-base-200 bg-base-100 p-4 space-y-3 overflow-y-auto"
                >
                    {isLoadingMore && (
                        <div className="text-center text-xs text-base-content/50">
                            Loading more messages…
                        </div>
                    )}
                    {data.messages.length === 0 ? (
                        <div className="text-center text-base-content/50">
                            No messages yet.
                        </div>
                    ) : (
                        data.messages.map((msg) => {
                            const isOwnMessage =
                                msg.sender_id === data.participant.user_id;
                            const senderLabel = isOwnMessage
                                ? "You"
                                : otherUser?.name ||
                                  otherUser?.email ||
                                  "Unknown user";
                            const bubbleClass = isOwnMessage
                                ? "chat-bubble chat-bubble-primary"
                                : "chat-bubble";

                            return (
                                <div
                                    key={msg.id}
                                    className={`chat ${
                                        isOwnMessage ? "chat-end" : "chat-start"
                                    }`}
                                >
                                    <div className="chat-image avatar avatar-placeholder">
                                        <div className="bg-base-200 text-base-content rounded-full w-10">
                                            <span className="text-sm text-primary font-semibold">
                                                {isOwnMessage ? (
                                                    <i className="fa-duotone fa-user text-2xl"></i>
                                                ) : (
                                                    getInitials(senderLabel)
                                                )}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="chat-header">
                                        {senderLabel}
                                    </div>
                                    <div className={bubbleClass}>
                                        <MarkdownRenderer
                                            content={
                                                msg.body || "Message removed"
                                            }
                                            className={`text-sm ${isOwnMessage ? "text-primary-content" : "text-base-content/90"} [&_p]:m-0 [&_ul]:my-2 [&_ol]:my-2`}
                                        />
                                    </div>
                                    <div className="chat-footer opacity-60">
                                        {new Date(
                                            msg.created_at,
                                        ).toLocaleString()}
                                    </div>
                                </div>
                            );
                        })
                    )}
                    {!isAtBottom && (
                        <div className="sticky bottom-4 flex justify-end pr-2">
                            <button
                                type="button"
                                onClick={scrollToBottom}
                                className="btn btn-circle btn-primary shadow-md"
                                aria-label="Jump to latest"
                            >
                                <i className="fa-duotone fa-arrow-down"></i>
                            </button>
                        </div>
                    )}
                </div>
            </div>

            <div className="bg-base-200 border-t border-base-300 bg-base-100/80 backdrop-blur-sm p-4">
                <div className="flex gap-2 items-start">
                    <div className="flex-1 space-y-2 relative">
                        {useMarkdownEditor ? (
                            <MarkdownEditor
                                className="flex-1"
                                value={draft}
                                onChange={setDraft}
                                height={140}
                                preview="edit"
                                disabled={disabled}
                                placeholder={
                                    requestPending
                                        ? "Accept this request to reply."
                                        : requestDeclined
                                          ? "Conversation declined."
                                          : data.participant.archived_at
                                            ? "Unarchive to reply."
                                            : "Type your message..."
                                }
                            />
                        ) : (
                            <textarea
                                className="textarea textarea-bordered w-full"
                                value={draft}
                                onChange={(e) => setDraft(e.target.value)}
                                rows={5}
                                disabled={disabled}
                                placeholder={
                                    requestPending
                                        ? "Accept this request to reply."
                                        : requestDeclined
                                          ? "Conversation declined."
                                          : data.participant.archived_at
                                            ? "Unarchive to reply."
                                            : "Type your message..."
                                }
                            />
                        )}
                        <button
                            className="btn btn-primary btn-circle btn-soft absolute bottom-4 right-2"
                            onClick={handleSend}
                            disabled={disabled || sending}
                            title={"Send message"}
                        >
                            <i className="fa-duotone fa-paper-plane" />
                        </button>
                    </div>
                </div>
                <div className="flex items-center gap-2 pt-2">
                    <label className="label cursor-pointer gap-2">
                        <input
                            type="checkbox"
                            className="toggle toggle-sm"
                            checked={useMarkdownEditor}
                            onChange={(e) =>
                                setUseMarkdownEditor(e.target.checked)
                            }
                            disabled={disabled}
                        />
                        <span className="label-text text-sm">
                            Markdown editor
                        </span>
                    </label>
                </div>
            </div>
        </div>
    );
}
