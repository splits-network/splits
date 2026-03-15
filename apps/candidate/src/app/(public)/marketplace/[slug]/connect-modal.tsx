"use client";

import { useRef, useState, useImperativeHandle, forwardRef } from "react";
import { useAuth } from "@clerk/nextjs";
import { usePathname } from "next/navigation";
import { startChatConversation } from "@/lib/chat-start";
import { createAuthenticatedClient } from "@/lib/api-client";
import { useToast } from "@/lib/toast-context";

export interface ConnectModalHandle {
    open: () => void;
}

interface ConnectModalProps {
    recruiterName: string;
    recruiterUserId: string;
    specialization?: string;
    onConnected: () => void;
}

function buildDefaultMessage(name: string, specialization?: string): string {
    let msg = `Hi ${name}, I came across your profile on the marketplace and I'm interested in exploring representation. I'd love to connect and discuss how we might work together.`;
    if (specialization) {
        msg += `\n\nI noticed you specialize in ${specialization}, which aligns with what I'm looking for.`;
    }
    return msg;
}

const ConnectModal = forwardRef<ConnectModalHandle, ConnectModalProps>(
    function ConnectModal(
        { recruiterName, recruiterUserId, specialization, onConnected },
        ref,
    ) {
        const dialogRef = useRef<HTMLDialogElement>(null);
        const { isSignedIn, getToken } = useAuth();
        const pathname = usePathname();
        const toast = useToast();

        const [message, setMessage] = useState(
            buildDefaultMessage(recruiterName, specialization),
        );
        const [sending, setSending] = useState(false);

        function open() {
            if (!isSignedIn) {
                window.location.href = `/sign-in?redirect_url=${encodeURIComponent(pathname)}`;
                return;
            }
            dialogRef.current?.showModal();
        }

        useImperativeHandle(ref, () => ({ open }));

        async function handleSend() {
            if (!message.trim() || sending) return;

            setSending(true);
            try {
                const conversationId = await startChatConversation(
                    getToken,
                    recruiterUserId,
                );

                const token = await getToken();
                if (!token) throw new Error("Not authenticated");

                const client = createAuthenticatedClient(token);
                await client.post(
                    `/chat/conversations/${conversationId}/messages`,
                    { body: message.trim() },
                );

                toast.success(
                    "Message sent. The recruiter will review your request.",
                );
                dialogRef.current?.close();
                onConnected();
            } catch (err: any) {
                if (err?.message?.includes("Request pending")) {
                    toast.info(
                        "You've already sent a connection request to this recruiter.",
                    );
                    dialogRef.current?.close();
                    onConnected();
                } else {
                    toast.error("Message couldn't be sent. Try again.");
                }
            } finally {
                setSending(false);
            }
        }

        return (
            <dialog ref={dialogRef} className="modal">
                    <div className="modal-box" style={{ borderRadius: 0 }}>
                        <h3 className="text-lg font-black tracking-tight mb-1">
                            Connect with {recruiterName}
                        </h3>
                        <p className="text-sm text-base-content/60 mb-4">
                            Send a message to introduce yourself. The recruiter
                            can accept, respond, or decline your request.
                        </p>

                        <fieldset className="fieldset">
                            <label className="fieldset-label text-xs font-bold uppercase tracking-wider">
                                Your Message
                            </label>
                            <textarea
                                className="textarea w-full h-32 text-sm"
                                style={{ borderRadius: 0 }}
                                value={message}
                                onChange={(e) => setMessage(e.target.value)}
                                maxLength={1000}
                                disabled={sending}
                            />
                            <p className="text-xs text-base-content/40 mt-1">
                                {message.length}/1000
                            </p>
                        </fieldset>

                        <div className="modal-action">
                            <form method="dialog">
                                <button
                                    className="btn btn-ghost btn-sm"
                                    style={{ borderRadius: 0 }}
                                    disabled={sending}
                                >
                                    Cancel
                                </button>
                            </form>
                            <button
                                className="btn btn-primary btn-sm gap-2"
                                style={{ borderRadius: 0 }}
                                onClick={handleSend}
                                disabled={sending || !message.trim()}
                            >
                                {sending ? (
                                    <span className="loading loading-spinner loading-xs" />
                                ) : (
                                    <i className="fa-duotone fa-regular fa-paper-plane" />
                                )}
                                {sending ? "Sending..." : "Send Message"}
                            </button>
                        </div>
                    </div>
                    <form method="dialog" className="modal-backdrop">
                        <button>close</button>
                    </form>
                </dialog>
        );
    },
);

export default ConnectModal;
