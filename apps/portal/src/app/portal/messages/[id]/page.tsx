"use client";

import { useEffect, useMemo, useState, useCallback } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@clerk/nextjs";
import { PageTitle } from "@/components/page-title";
import { createAuthenticatedClient } from "@/lib/api-client";
import { useChatGateway } from "@/hooks/use-chat-gateway";
import { registerChatRefresh, requestChatRefresh } from "@/lib/chat-refresh-queue";
import { getCachedUserSummary } from "@/lib/user-cache";

type ResyncData = {
    conversation: {
        id: string;
        participant_a_id: string;
        participant_b_id: string;
        application_id: string | null;
        job_id: string | null;
        company_id: string | null;
        last_message_at: string | null;
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

type UserSummary = {
    id: string;
    name: string | null;
    email: string;
};

export default function MessageThreadPage() {
    const params = useParams();
    const router = useRouter();
    const { getToken } = useAuth();
    const conversationId = params.id as string;

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [data, setData] = useState<ResyncData | null>(null);
    const [otherUser, setOtherUser] = useState<UserSummary | null>(null);
    const [applicationTitle, setApplicationTitle] = useState<string | null>(
        null,
    );
    const [jobTitle, setJobTitle] = useState<string | null>(null);
    const [draft, setDraft] = useState("");
    const [sending, setSending] = useState(false);

    const fetchResync = useCallback(async () => {
        const token = await getToken();
        if (!token) return;
        const client = createAuthenticatedClient(token);
        const response: any = await client.get(
            `/chat/conversations/${conversationId}/resync`,
        );
        const payload = response?.data as ResyncData;
        setData(payload);
        const lastMessageId =
            payload?.messages?.length > 0
                ? payload.messages[payload.messages.length - 1].id
                : null;
        if (lastMessageId) {
            await markRead(lastMessageId);
        }
    }, [conversationId, getToken]);

    const fetchContextDetails = async (applicationId?: string | null, jobId?: string | null) => {
        const token = await getToken();
        if (!token) return;
        const client = createAuthenticatedClient(token);

        if (applicationId) {
            try {
                const response: any = await client.get(`/applications/${applicationId}`, {
                    params: { include: "job" },
                });
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

    const fetchOtherUser = async (otherId: string) => {
        const user = await getCachedUserSummary(getToken, otherId);
        if (user) {
            setOtherUser(user);
        }
    };

    const markRead = async (lastReadMessageId: string) => {
        const token = await getToken();
        if (!token) return;
        const client = createAuthenticatedClient(token);
        try {
            await client.post(`/chat/conversations/${conversationId}/read-receipt`, {
                lastReadMessageId,
            });
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
    }, [conversationId]);

    const otherUserId = useMemo(() => {
        if (!data) return null;
        return data.conversation.participant_a_id === data.participant.user_id
            ? data.conversation.participant_b_id
            : data.conversation.participant_a_id;
    }, [data]);

    useEffect(() => {
        if (otherUserId) {
            fetchOtherUser(otherUserId);
        }
    }, [otherUserId]);

    useEffect(() => {
        if (data?.conversation) {
            fetchContextDetails(data.conversation.application_id, data.conversation.job_id);
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
            await client.post(`/chat/conversations/${conversationId}/messages`, {
                body: draft.trim(),
                clientMessageId: crypto.randomUUID(),
            });
            setDraft("");
            await fetchResync();
        } catch (err: any) {
            setError(err?.message || "Failed to send message");
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
        router.push("/portal/messages?filter=archived");
    };

    const handleArchive = async () => {
        const token = await getToken();
        if (!token) return;
        const client = createAuthenticatedClient(token);
        if (data?.participant.archived_at) {
            await client.delete(`/chat/conversations/${conversationId}/archive`);
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
        await fetchResync();
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
    };

    if (loading) {
        return (
            <>
                <PageTitle title="Messages" subtitle="Loading conversation..." />
                <div className="p-6">
                    <span className="loading loading-spinner loading-md"></span>
                </div>
            </>
        );
    }

    if (error || !data) {
        return (
            <>
                <PageTitle title="Messages" subtitle="Unable to load conversation" />
                <div className="p-6 text-error">{error || "Not found"}</div>
            </>
        );
    }

    const requestPending = data.participant.request_state === "pending";
    const requestDeclined = data.participant.request_state === "declined";
    const disabled =
        requestPending ||
        requestDeclined ||
        data.participant.archived_at !== null;

    return (
        <>
            <PageTitle
                title={otherUser?.name || otherUser?.email || "Conversation"}
                subtitle="Chat thread"
            />

            <div className="flex flex-col gap-4">
                {(data.conversation.application_id || data.conversation.job_id || data.conversation.company_id) && (
                    <div className="rounded-lg border border-base-200 bg-base-100 p-4 text-sm">
                        <div className="font-semibold mb-2">Context</div>
                        <div className="flex flex-wrap gap-3 text-base-content/70">
                            {data.conversation.application_id && (
                                <Link
                                    className="link link-hover"
                                    href={`/portal/applications/${data.conversation.application_id}`}
                                >
                                    Application: {applicationTitle || data.conversation.application_id}
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
                                <span>Company: {data.conversation.company_id}</span>
                            )}
                        </div>
                    </div>
                )}
                <div className="flex flex-wrap gap-2">
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
                    <button className="btn btn-ghost btn-sm" onClick={handleMute}>
                        {data.participant.muted_at ? "Unmute" : "Mute"}
                    </button>
                    <button
                        className="btn btn-ghost btn-sm"
                        onClick={handleArchive}
                    >
                        {data.participant.archived_at ? "Unarchive" : "Archive"}
                    </button>
                    <button className="btn btn-ghost btn-sm" onClick={handleBlock}>
                        Block
                    </button>
                    <button className="btn btn-ghost btn-sm" onClick={handleReport}>
                        Report
                    </button>
                </div>

                <div className="rounded-lg border border-base-200 bg-base-100 p-4 space-y-3 max-h-[60vh] overflow-y-auto">
                    {data.messages.length === 0 ? (
                        <div className="text-center text-base-content/50">
                            No messages yet.
                        </div>
                    ) : (
                        data.messages.map((msg) => (
                            <div
                                key={msg.id}
                                className={`flex ${msg.sender_id === data.participant.user_id ? "justify-end" : "justify-start"}`}
                            >
                                <div className="max-w-[75%] rounded-xl bg-base-200 px-3 py-2 text-sm">
                                    <p className="whitespace-pre-wrap">
                                        {msg.body || "Message removed"}
                                    </p>
                                    <div className="text-[10px] text-base-content/50 mt-1">
                                        {new Date(msg.created_at).toLocaleString()}
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>

                <div className="flex gap-2">
                    <textarea
                        className="textarea textarea-bordered w-full"
                        rows={3}
                        value={draft}
                        onChange={(e) => setDraft(e.target.value)}
                        placeholder={
                            requestPending
                                ? "Accept this request to reply."
                                : requestDeclined
                                  ? "Conversation declined."
                                  : data.participant.archived_at
                                    ? "Unarchive to reply."
                                    : "Type your message..."
                        }
                        disabled={disabled}
                    />
                    <button
                        className="btn btn-primary"
                        onClick={handleSend}
                        disabled={disabled || sending}
                    >
                        Send
                    </button>
                </div>
            </div>
        </>
    );
}
