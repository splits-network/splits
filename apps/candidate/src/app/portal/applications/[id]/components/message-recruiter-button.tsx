"use client";

import { useState } from "react";
import { useAuth } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { startChatConversation } from "@/lib/chat-start";
import { useToast } from "@/lib/toast-context";
import { usePresence } from "@/hooks/use-presence";
import { Presence } from "@/components/presense";

interface MessageRecruiterButtonProps {
    recruiterUserId?: string | null;
    applicationId: string;
    jobId?: string | null;
    companyId?: string | null;
}

export function MessageRecruiterButton({
    recruiterUserId,
    applicationId,
    jobId,
    companyId,
}: MessageRecruiterButtonProps) {
    const { getToken } = useAuth();
    const router = useRouter();
    const toast = useToast();
    const [startingChat, setStartingChat] = useState(false);
    const presence = usePresence([recruiterUserId], {
        enabled: Boolean(recruiterUserId),
    });
    const presenceStatus = recruiterUserId
        ? presence[recruiterUserId]?.status
        : undefined;

    const disabledReason = recruiterUserId
        ? null
        : "Your recruiter isn't linked to a user yet.";

    return (
        <span title={disabledReason || undefined}>
            <button
                className="btn btn-outline btn-sm gap-2"
                disabled={!recruiterUserId || startingChat}
                onClick={async () => {
                    if (!recruiterUserId) {
                        return;
                    }
                    try {
                        setStartingChat(true);
                        const conversationId = await startChatConversation(
                            getToken,
                            recruiterUserId,
                            {
                                application_id: applicationId,
                                job_id: jobId || null,
                                company_id: companyId || null,
                            },
                        );
                        router.push(`/portal/messages?conversationId=${conversationId}`);
                    } catch (err: any) {
                        console.error("Failed to start chat:", err);
                        toast.error(err?.message || "Failed to start chat");
                    } finally {
                        setStartingChat(false);
                    }
                }}
            >
                {startingChat ? (
                    <span className="loading loading-spinner loading-xs"></span>
                ) : (
                    <span className="inline-flex items-center gap-2">
                        <Presence status={presenceStatus} />
                        <i className="fa-duotone fa-regular fa-messages"></i>
                    </span>
                )}
                Message Recruiter
            </button>
        </span>
    );
}


