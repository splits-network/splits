"use client";

import { useState, useImperativeHandle, forwardRef } from "react";
import { useAuth } from "@clerk/nextjs";
import { usePathname } from "next/navigation";
import { startChatConversation } from "@/lib/chat-start";
import { createAuthenticatedClient } from "@/lib/api-client";
import { useToast } from "@/lib/toast-context";
import {
    BaselModal,
    BaselModalHeader,
    BaselModalBody,
    BaselModalFooter,
} from "@splits-network/basel-ui";

export interface FirmConnectModalHandle {
    open: () => void;
}

interface FirmConnectModalProps {
    firmName: string;
    firmOwnerUserId: string;
    onConnected: () => void;
}

function buildDefaultMessage(firmName: string): string {
    return `Hi, I came across ${firmName}'s profile on the marketplace and I'm interested in submitting candidates. I'd love to connect and discuss how we might work together.`;
}

const FirmConnectModal = forwardRef<FirmConnectModalHandle, FirmConnectModalProps>(
    function FirmConnectModal({ firmName, firmOwnerUserId, onConnected }, ref) {
        const { isSignedIn, getToken } = useAuth();
        const pathname = usePathname();
        const toast = useToast();

        const [isOpen, setIsOpen] = useState(false);
        const [message, setMessage] = useState(buildDefaultMessage(firmName));
        const [sending, setSending] = useState(false);

        function open() {
            if (!isSignedIn) {
                window.location.href = `/sign-in?redirect_url=${encodeURIComponent(pathname)}`;
                return;
            }
            setIsOpen(true);
        }

        function close() {
            if (!sending) setIsOpen(false);
        }

        useImperativeHandle(ref, () => ({ open }));

        async function handleSend() {
            if (!message.trim() || sending) return;

            setSending(true);
            try {
                const conversationId = await startChatConversation(
                    getToken,
                    firmOwnerUserId,
                );

                const token = await getToken();
                if (!token) throw new Error("Not authenticated");

                const client = createAuthenticatedClient(token);
                await client.post(
                    `/chat/conversations/${conversationId}/messages`,
                    { body: message.trim() },
                );

                toast.success("Message sent. The firm will review your request.");
                setIsOpen(false);
                onConnected();
            } catch (err: any) {
                if (err?.message?.includes("Request pending")) {
                    toast.info("You've already sent a connection request to this firm.");
                    setIsOpen(false);
                    onConnected();
                } else {
                    toast.error("Message couldn't be sent. Try again.");
                }
            } finally {
                setSending(false);
            }
        }

        return (
            <BaselModal
                isOpen={isOpen}
                onClose={close}
                maxWidth="max-w-md"
                closeOnBackdropClick={!sending}
            >
                <BaselModalHeader
                    title={`Connect with ${firmName}`}
                    subtitle="Partnership Request"
                    icon="fa-handshake"
                    iconColor="primary"
                    onClose={close}
                    closeDisabled={sending}
                />
                <BaselModalBody>
                    <p className="text-sm text-base-content/60 mb-4">
                        Send a message to introduce yourself. The firm can
                        accept, respond, or decline your request.
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
                </BaselModalBody>
                <BaselModalFooter>
                    <button
                        onClick={close}
                        className="btn btn-ghost flex-1"
                        disabled={sending}
                    >
                        Cancel
                    </button>
                    <button
                        className="btn btn-primary flex-1"
                        onClick={handleSend}
                        disabled={sending || !message.trim()}
                    >
                        {sending ? (
                            <>
                                <span className="loading loading-spinner loading-sm" />
                                Sending...
                            </>
                        ) : (
                            <>
                                <i className="fa-duotone fa-regular fa-paper-plane" />
                                Send Message
                            </>
                        )}
                    </button>
                </BaselModalFooter>
            </BaselModal>
        );
    },
);

export default FirmConnectModal;
