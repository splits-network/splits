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
import { LoadingState } from "@splits-network/shared-ui";
import type { ResyncData, Message } from "../../types";
import { getInitials } from "../../types";

interface ThreadPanelProps {
    conversationId: string;
}

export default function ThreadPanel({ conversationId }: ThreadPanelProps) {
    const { getToken } = useAuth();
    const toast = useToast();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [data, setData] = useState<ResyncData | null>(null);
    const [applicationTitle, setApplicationTitle] = useState<string | null>(
        null,
    );
    const [jobTitle, setJobTitle] = useState<string | null>(null);
    const [companyName, setCompanyName] = useState<string | null>(null);
    const [candidateName, setCandidateName] = useState<string | null>(null);
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
        const payload = response?.data;

        setData(payload as ResyncData);
        setHasMore((payload?.messages?.length || 0) >= pageSize);
        const lastMessageId =
            payload?.messages?.length > 0
                ? payload.messages[payload.messages.length - 1].id
                : null;
        if (lastMessageId) {
            await markRead(lastMessageId);
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [conversationId]);

    const fetchContextDetails = useCallback(
        async (
            applicationId?: string | null,
            jobId?: string | null,
            companyId?: string | null,
            candidateId?: string | null,
        ) => {
            const token = await getToken();
            if (!token) return;
            const client = createAuthenticatedClient(token);

            if (applicationId) {
                try {
                    const response: any = await client.get(
                        `/applications/${applicationId}`,
                        { params: { include: "job,company" } },
                    );
                    const application = response?.data;
                    if (application?.job?.title) {
                        setApplicationTitle(application.job.title);
                        setJobTitle(application.job.title);
                    }
                    if (application?.job?.company?.name) {
                        setCompanyName(application.job.company.name);
                    }
                } catch {
                    setApplicationTitle(applicationId);
                }
            }

            if (jobId) {
                try {
                    const response: any = await client.get(`/jobs/${jobId}`, {
                        params: { include: "company" },
                    });
                    const job = response?.data;
                    if (job?.title) setJobTitle(job.title);
                    if (job?.company?.name) setCompanyName(job.company.name);
                } catch {
                    // fallback handled in render
                }
            }

            if (companyId) {
                try {
                    const response: any = await client.get(
                        `/companies/${companyId}`,
                    );
                    const company = response?.data;
                    if (company?.name) setCompanyName(company.name);
                } catch {
                    // fallback handled in render
                }
            }

            if (candidateId) {
                try {
                    const response: any = await client.get(
                        `/candidates/${candidateId}`,
                    );
                    const candidate = response?.data;
                    if (candidate?.full_name) setCandidateName(candidate.full_name);
                } catch {
                    // fallback handled in render
                }
            }
        },
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [],
    );

    const markRead = async (lastReadMessageId: string) => {
        const token = await getToken();
        if (!token) return;
        const client = createAuthenticatedClient(token);
        try {
            await client.post(
                `/chat/conversations/${conversationId}/read-receipt`,
                { lastReadMessageId },
            );
        } catch {
            // Best-effort
        }
    };

    useEffect(() => {
        let mounted = true;
        const load = async () => {
            setLoading(true);
            setError(null);
            initialScrollDoneRef.current = false;
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
        const participant =
            otherUserId === data.conversation.participant_a_id
                ? data.conversation.participant_a
                : data.conversation.participant_b;
        if (participant) return participant;
        return { id: otherUserId, name: null, email: "Loading..." };
    }, [data, otherUserId]);

    useEffect(() => {
        if (data?.conversation) {
            fetchContextDetails(
                data.conversation.application_id,
                data.conversation.job_id,
                data.conversation.company_id,
                data.conversation.candidate_id,
            );
        }
    }, [
        data?.conversation?.application_id,
        data?.conversation?.job_id,
        data?.conversation?.company_id,
        data?.conversation?.candidate_id,
        fetchContextDetails,
    ]);

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
        presencePingEnabled: false, // Sidebar handles presence pings
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
            const errorMessage = err?.message || "Failed to send message";

            if (
                errorMessage.includes("Request pending") ||
                errorMessage.includes("cannot send additional messages")
            ) {
                toast.info(
                    "Your message is waiting for them to accept your conversation request.",
                    4000,
                );
                return;
            }

            setError(errorMessage);
            toast.error(errorMessage);
        } finally {
            setSending(false);
        }
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
            const incoming = (response?.data || []) as Message[];
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [conversationId, data?.messages, hasMore, isLoadingMore]);

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
                <LoadingState message="Loading conversation..." />
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
        <div className="flex h-full flex-col">
            <div className="flex-1 min-h-0 flex flex-col gap-4 p-4">
                {/* Context Links */}
                {(data.conversation.application_id ||
                    data.conversation.job_id ||
                    data.conversation.company_id ||
                    data.conversation.candidate_id) && (
                    <div className="rounded-lg border border-base-200 bg-base-100 p-4 text-sm">
                        <div className="font-semibold mb-2">Context</div>
                        <div className="flex flex-wrap gap-3 text-base-content/70">
                            {data.conversation.candidate_id && (
                                <Link
                                    className="link link-hover"
                                    href={`/portal/candidates?candidateId=${data.conversation.candidate_id}`}
                                >
                                    <i className="fa-duotone fa-regular fa-user-shield mr-1" />
                                    Regarding:{" "}
                                    {candidateName ||
                                        data.conversation.candidate_id}
                                </Link>
                            )}
                            {data.conversation.application_id && (
                                <Link
                                    className="link link-hover"
                                    href={`/portal/applications?applicationId=${data.conversation.application_id}`}
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
                                    Role:{" "}
                                    {jobTitle || data.conversation.job_id}
                                </Link>
                            )}
                            {data.conversation.company_id && (
                                <span>
                                    Company:{" "}
                                    {companyName ||
                                        data.conversation.company_id}
                                </span>
                            )}
                        </div>
                    </div>
                )}

                {/* Messages */}
                <div
                    ref={messagesRef}
                    onScroll={handleScroll}
                    className="relative flex-1 min-h-0 rounded-lg border border-base-200 bg-base-100 p-4 space-y-3 overflow-y-auto"
                >
                    {isLoadingMore && (
                        <div className="text-center text-xs text-base-content/50">
                            Loading more messages...
                        </div>
                    )}
                    {data.messages.length === 0 ? (
                        <div className="flex items-center justify-center h-full text-center text-base-content/50">
                            <div>
                                <i className="fa-duotone fa-regular fa-messages text-4xl mb-3 opacity-30" />
                                <p>No messages yet.</p>
                                <p className="text-sm mt-1 opacity-60">
                                    Start the conversation!
                                </p>
                            </div>
                        </div>
                    ) : (
                        data.messages.map((msg) => {
                            if (msg.kind === "system") {
                                return (
                                    <div
                                        key={msg.id}
                                        className="flex justify-center my-4"
                                    >
                                        <div className="bg-base-200 rounded-lg px-4 py-2 text-sm text-base-content/70 max-w-md text-center">
                                            <i className="fa-duotone fa-regular fa-route mr-2" />
                                            {msg.body || "System message"}
                                        </div>
                                    </div>
                                );
                            }

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
                                        isOwnMessage
                                            ? "chat-end"
                                            : "chat-start"
                                    }`}
                                >
                                    <div className="chat-image avatar avatar-placeholder">
                                        <div className="bg-base-200 text-base-content rounded-full w-10">
                                            <span className="text-sm text-primary font-semibold">
                                                {isOwnMessage ? (
                                                    <i className="fa-duotone fa-user text-2xl" />
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
                                <i className="fa-duotone fa-arrow-down" />
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {/* Compose */}
            <div className="border-t border-base-300 bg-base-100 p-4 mt-auto">
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
                                placeholder={placeholderText}
                            />
                        ) : (
                            <textarea
                                className="textarea w-full"
                                value={draft}
                                onChange={(e) => setDraft(e.target.value)}
                                rows={5}
                                disabled={disabled}
                                placeholder={placeholderText}
                            />
                        )}
                        <button
                            className="btn btn-primary btn-circle btn-soft absolute bottom-4 right-2"
                            onClick={handleSend}
                            disabled={disabled || sending}
                            title="Send message"
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
