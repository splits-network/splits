"use client";

import { useState } from "react";
import { useAuth } from "@clerk/nextjs";
import { createAuthenticatedClient } from "@/lib/api-client";
import { useToast } from "@/lib/toast-context";
import { ButtonLoading } from "@splits-network/shared-ui";
import type { CompanyInvitation } from "../../types";

interface CreateInvitationModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

export default function CreateInvitationModal({
    isOpen,
    onClose,
    onSuccess,
}: CreateInvitationModalProps) {
    const { getToken } = useAuth();
    const toast = useToast();

    const [invitedEmail, setInvitedEmail] = useState("");
    const [companyNameHint, setCompanyNameHint] = useState("");
    const [personalMessage, setPersonalMessage] = useState("");
    const [sendEmail, setSendEmail] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [createdInvitation, setCreatedInvitation] =
        useState<CompanyInvitation | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            const token = await getToken();
            if (!token) return;
            const client = createAuthenticatedClient(token);
            const { data } = await client.post("/company-invitations", {
                invited_email: invitedEmail || undefined,
                company_name_hint: companyNameHint || undefined,
                personal_message: personalMessage || undefined,
                send_email: sendEmail && !!invitedEmail,
            });

            setCreatedInvitation(data.data);
            toast.success("Invitation created successfully");
        } catch (e: any) {
            toast.error(
                e?.response?.data?.error?.message ||
                    "Failed to create invitation",
            );
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleClose = () => {
        setInvitedEmail("");
        setCompanyNameHint("");
        setPersonalMessage("");
        setSendEmail(false);
        setCreatedInvitation(null);
        onClose();
    };

    const handleDone = () => {
        if (createdInvitation) {
            onSuccess();
        }
        handleClose();
    };

    const handleCopyCode = async () => {
        if (createdInvitation?.invite_code) {
            await navigator.clipboard.writeText(createdInvitation.invite_code);
            toast.success("Code copied to clipboard");
        }
    };

    const handleCopyLink = async () => {
        if (createdInvitation?.invite_url) {
            await navigator.clipboard.writeText(createdInvitation.invite_url);
            toast.success("Link copied to clipboard");
        }
    };

    const handleShare = async () => {
        if (!createdInvitation) return;

        const shareData = {
            title: "Join Splits Network",
            text: `You've been invited to join Splits Network! Use code ${createdInvitation.invite_code} or click the link to get started.`,
            url: createdInvitation.invite_url,
        };

        if (navigator.share && navigator.canShare?.(shareData)) {
            try {
                await navigator.share(shareData);
            } catch {
                // User cancelled share
            }
        } else {
            const message = `${shareData.text}\n\n${createdInvitation.invite_url}`;
            await navigator.clipboard.writeText(message);
            toast.success("Invitation message copied to clipboard");
        }
    };

    if (!isOpen) return null;

    return (
        <dialog className="modal modal-open">
            <div className="modal-box max-w-lg border-2 border-base-300 p-0" style={{ borderRadius: 0 }}>
                {/* Basel header */}
                <div className="bg-neutral text-neutral-content px-6 py-5 relative">
                    <button
                        type="button"
                        className="btn btn-sm btn-square btn-ghost text-neutral-content absolute right-3 top-3 z-10"
                        onClick={handleClose}
                        disabled={isSubmitting}
                    >
                        <i className="fa-duotone fa-regular fa-xmark" />
                    </button>
                    <p className="text-[10px] uppercase tracking-[0.2em] font-bold text-secondary mb-1">
                        {createdInvitation ? "Success" : "New Invitation"}
                    </p>
                    <h3 className="text-xl font-black tracking-tight">
                        {createdInvitation ? (
                            <>
                                <i className="fa-duotone fa-regular fa-circle-check text-success mr-2" />
                                Invitation Created
                            </>
                        ) : (
                            <>
                                <i className="fa-duotone fa-regular fa-building-user text-primary mr-2" />
                                Invite a Company
                            </>
                        )}
                    </h3>
                </div>

                <div className="p-6">
                    {!createdInvitation ? (
                        <>
                            <p className="text-sm text-base-content/60 mb-6">
                                Create an invitation to bring a new company to
                                Splits Network. You can send via email, share a
                                link, or give them a code.
                            </p>

                            <form onSubmit={handleSubmit} className="space-y-4">
                                <fieldset className="fieldset">
                                    <legend className="fieldset-legend text-[10px] uppercase tracking-[0.2em] font-bold text-base-content/40">
                                        Company Name
                                    </legend>
                                    <input
                                        type="text"
                                        className="input w-full bg-base-200 border-base-300"
                                        style={{ borderRadius: 0 }}
                                        placeholder="e.g., Acme Corp"
                                        value={companyNameHint}
                                        onChange={(e) =>
                                            setCompanyNameHint(e.target.value)
                                        }
                                        maxLength={255}
                                    />
                                    <p className="fieldset-label text-base-content/40">
                                        Pre-fills during their signup (optional)
                                    </p>
                                </fieldset>

                                <fieldset className="fieldset">
                                    <legend className="fieldset-legend text-[10px] uppercase tracking-[0.2em] font-bold text-base-content/40">
                                        Email Address
                                    </legend>
                                    <input
                                        type="email"
                                        className="input w-full bg-base-200 border-base-300"
                                        style={{ borderRadius: 0 }}
                                        placeholder="e.g., hr@acmecorp.com"
                                        value={invitedEmail}
                                        onChange={(e) =>
                                            setInvitedEmail(e.target.value)
                                        }
                                    />
                                    <p className="fieldset-label text-base-content/40">
                                        We&apos;ll send them an invitation email (optional)
                                    </p>
                                </fieldset>

                                <fieldset className="fieldset">
                                    <legend className="fieldset-legend text-[10px] uppercase tracking-[0.2em] font-bold text-base-content/40">
                                        Personal Message
                                    </legend>
                                    <textarea
                                        className="textarea w-full h-24 bg-base-200 border-base-300"
                                        style={{ borderRadius: 0 }}
                                        placeholder="Add a personal note to your invitation..."
                                        value={personalMessage}
                                        onChange={(e) =>
                                            setPersonalMessage(e.target.value)
                                        }
                                        maxLength={1000}
                                    />
                                    <p className="fieldset-label text-base-content/40">
                                        {personalMessage.length}/1000 characters (optional)
                                    </p>
                                </fieldset>

                                {invitedEmail && (
                                    <label className="flex items-center gap-3 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            className="checkbox checkbox-sm checkbox-primary"
                                            checked={sendEmail}
                                            onChange={(e) =>
                                                setSendEmail(e.target.checked)
                                            }
                                        />
                                        <span className="text-sm font-bold text-base-content">
                                            Send invitation email now
                                        </span>
                                    </label>
                                )}

                                <div className="flex justify-end gap-2 pt-4 border-t border-base-200">
                                    <button
                                        type="button"
                                        className="btn btn-ghost"
                                        style={{ borderRadius: 0 }}
                                        onClick={handleClose}
                                        disabled={isSubmitting}
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        className="btn btn-primary"
                                        style={{ borderRadius: 0 }}
                                        disabled={isSubmitting}
                                    >
                                        <ButtonLoading
                                            loading={isSubmitting}
                                            text="Create Invitation"
                                            loadingText="Creating..."
                                        />
                                    </button>
                                </div>
                            </form>
                        </>
                    ) : (
                        <>
                            <p className="text-sm text-base-content/60 mb-6">
                                Share this invitation with the company. They can
                                join using the link or code below.
                            </p>

                            {/* Invite Code */}
                            <div className="bg-base-200 border-2 border-base-300 p-4 mb-4">
                                <label className="text-[10px] uppercase tracking-[0.2em] font-bold text-base-content/40 mb-2 block">
                                    Invite Code
                                </label>
                                <div className="flex items-center gap-2">
                                    <code className="text-2xl font-mono font-black tracking-wider flex-1 text-base-content">
                                        {createdInvitation.invite_code}
                                    </code>
                                    <button
                                        className="btn btn-ghost btn-sm"
                                        style={{ borderRadius: 0 }}
                                        onClick={handleCopyCode}
                                        title="Copy code"
                                    >
                                        <i className="fa-duotone fa-regular fa-copy" />
                                    </button>
                                </div>
                            </div>

                            {/* Invite Link */}
                            <div className="bg-base-200 border-2 border-base-300 p-4 mb-6">
                                <label className="text-[10px] uppercase tracking-[0.2em] font-bold text-base-content/40 mb-2 block">
                                    Invite Link
                                </label>
                                <div className="flex items-center gap-2">
                                    <input
                                        type="text"
                                        className="input input-sm flex-1 font-mono text-xs bg-base-100 border-base-300"
                                        style={{ borderRadius: 0 }}
                                        value={createdInvitation.invite_url || ""}
                                        readOnly
                                    />
                                    <button
                                        className="btn btn-ghost btn-sm"
                                        style={{ borderRadius: 0 }}
                                        onClick={handleCopyLink}
                                        title="Copy link"
                                    >
                                        <i className="fa-duotone fa-regular fa-link" />
                                    </button>
                                </div>
                            </div>

                            {/* Share Actions */}
                            <div className="flex gap-2 flex-wrap mb-6">
                                <button
                                    className="btn btn-outline border-base-300 btn-sm flex-1"
                                    style={{ borderRadius: 0 }}
                                    onClick={handleCopyLink}
                                >
                                    <i className="fa-duotone fa-regular fa-link mr-2" />
                                    Copy Link
                                </button>
                                <button
                                    className="btn btn-outline border-base-300 btn-sm flex-1"
                                    style={{ borderRadius: 0 }}
                                    onClick={handleCopyCode}
                                >
                                    <i className="fa-duotone fa-regular fa-copy mr-2" />
                                    Copy Code
                                </button>
                                <button
                                    className="btn btn-primary btn-sm flex-1"
                                    style={{ borderRadius: 0 }}
                                    onClick={handleShare}
                                >
                                    <i className="fa-duotone fa-regular fa-share mr-2" />
                                    Share
                                </button>
                            </div>

                            {createdInvitation.email_sent_at && (
                                <div className="bg-success/10 border-2 border-success/30 p-3 mb-4 flex items-center gap-2">
                                    <i className="fa-duotone fa-regular fa-envelope-circle-check text-success" />
                                    <span className="text-sm font-bold text-base-content">
                                        Email sent to{" "}
                                        {createdInvitation.invited_email}
                                    </span>
                                </div>
                            )}

                            <div className="flex justify-end pt-4 border-t border-base-200">
                                <button
                                    className="btn btn-primary"
                                    style={{ borderRadius: 0 }}
                                    onClick={handleDone}
                                >
                                    Done
                                </button>
                            </div>
                        </>
                    )}
                </div>
            </div>
            <form method="dialog" className="modal-backdrop">
                <button onClick={handleClose}>close</button>
            </form>
        </dialog>
    );
}
