"use client";

import { useState } from "react";
import { useAuth } from "@clerk/nextjs";
import { createAuthenticatedClient } from "@/lib/api-client";
import { useToast } from "@/lib/toast-context";
import { ButtonLoading } from "@splits-network/shared-ui";

interface CreateInvitationModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: (invitation: any) => void;
}

export function CreateInvitationModal({
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
    const [createdInvitation, setCreatedInvitation] = useState<any>(null);

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
        // Reset form
        setInvitedEmail("");
        setCompanyNameHint("");
        setPersonalMessage("");
        setSendEmail(false);
        setCreatedInvitation(null);
        onClose();
    };

    const handleDone = () => {
        onSuccess(createdInvitation);
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
            } catch (e) {
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
            <div className="modal-box max-w-lg">
                <form method="dialog">
                    <button
                        type="button"
                        className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2"
                        onClick={handleClose}
                        disabled={isSubmitting}
                    >
                        <i className="fa-duotone fa-regular fa-xmark"></i>
                    </button>
                </form>

                {!createdInvitation ? (
                    <>
                        <h3 className="font-bold text-lg mb-4">
                            <i className="fa-duotone fa-regular fa-building-user mr-2"></i>
                            Invite a Company
                        </h3>

                        <p className="text-sm text-base-content/70 mb-6">
                            Create an invitation to bring a new company to
                            Splits Network. You can send via email, share a
                            link, or give them a code.
                        </p>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <fieldset className="fieldset">
                                <legend className="fieldset-legend">
                                    Company Name (optional)
                                </legend>
                                <input
                                    type="text"
                                    className="input w-full"
                                    placeholder="e.g., Acme Corp"
                                    value={companyNameHint}
                                    onChange={(e) =>
                                        setCompanyNameHint(e.target.value)
                                    }
                                    maxLength={255}
                                />
                                <p className="fieldset-label text-base-content/60">
                                    Pre-fills during their signup
                                </p>
                            </fieldset>

                            <fieldset className="fieldset">
                                <legend className="fieldset-legend">
                                    Email Address (optional)
                                </legend>
                                <input
                                    type="email"
                                    className="input w-full"
                                    placeholder="e.g., hr@acmecorp.com"
                                    value={invitedEmail}
                                    onChange={(e) =>
                                        setInvitedEmail(e.target.value)
                                    }
                                />
                                <p className="fieldset-label text-base-content/60">
                                    We'll send them an invitation email
                                </p>
                            </fieldset>

                            <fieldset className="fieldset">
                                <legend className="fieldset-legend">
                                    Personal Message (optional)
                                </legend>
                                <textarea
                                    className="textarea w-full h-24"
                                    placeholder="Add a personal note to your invitation..."
                                    value={personalMessage}
                                    onChange={(e) =>
                                        setPersonalMessage(e.target.value)
                                    }
                                    maxLength={1000}
                                />
                                <p className="fieldset-label text-base-content/60">
                                    {personalMessage.length}/1000 characters
                                </p>
                            </fieldset>

                            {invitedEmail && (
                                <label className="flex items-center gap-3 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        className="checkbox checkbox-primary checkbox-sm"
                                        checked={sendEmail}
                                        onChange={(e) =>
                                            setSendEmail(e.target.checked)
                                        }
                                    />
                                    <span className="text-sm">
                                        Send invitation email now
                                    </span>
                                </label>
                            )}

                            <div className="modal-action">
                                <button
                                    type="button"
                                    className="btn btn-ghost"
                                    onClick={handleClose}
                                    disabled={isSubmitting}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="btn btn-primary"
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
                        <h3 className="font-bold text-lg mb-4">
                            <i className="fa-duotone fa-regular fa-circle-check text-success mr-2"></i>
                            Invitation Created!
                        </h3>

                        <p className="text-sm text-base-content/70 mb-6">
                            Share this invitation with the company. They can
                            join using the link or code below.
                        </p>

                        {/* Invite Code */}
                        <div className="bg-base-200 rounded-lg p-4 mb-4">
                            <label className="text-xs uppercase tracking-wider text-base-content/60 font-semibold mb-2 block">
                                Invite Code
                            </label>
                            <div className="flex items-center gap-2">
                                <code className="text-2xl font-mono font-bold tracking-wider flex-1">
                                    {createdInvitation.invite_code}
                                </code>
                                <button
                                    className="btn btn-ghost btn-sm"
                                    onClick={handleCopyCode}
                                    title="Copy code"
                                >
                                    <i className="fa-duotone fa-regular fa-copy"></i>
                                </button>
                            </div>
                        </div>

                        {/* Invite Link */}
                        <div className="bg-base-200 rounded-lg p-4 mb-6">
                            <label className="text-xs uppercase tracking-wider text-base-content/60 font-semibold mb-2 block">
                                Invite Link
                            </label>
                            <div className="flex items-center gap-2">
                                <input
                                    type="text"
                                    className="input input-sm flex-1 font-mono text-xs"
                                    value={createdInvitation.invite_url}
                                    readOnly
                                />
                                <button
                                    className="btn btn-ghost btn-sm"
                                    onClick={handleCopyLink}
                                    title="Copy link"
                                >
                                    <i className="fa-duotone fa-regular fa-link"></i>
                                </button>
                            </div>
                        </div>

                        {/* Share Actions */}
                        <div className="flex gap-2 flex-wrap mb-6">
                            <button
                                className="btn btn-outline btn-sm flex-1"
                                onClick={handleCopyLink}
                            >
                                <i className="fa-duotone fa-regular fa-link mr-2"></i>
                                Copy Link
                            </button>
                            <button
                                className="btn btn-outline btn-sm flex-1"
                                onClick={handleCopyCode}
                            >
                                <i className="fa-duotone fa-regular fa-copy mr-2"></i>
                                Copy Code
                            </button>
                            <button
                                className="btn btn-primary btn-sm flex-1"
                                onClick={handleShare}
                            >
                                <i className="fa-duotone fa-regular fa-share mr-2"></i>
                                Share
                            </button>
                        </div>

                        {createdInvitation.email_sent_at && (
                            <div className="alert alert-success mb-4">
                                <i className="fa-duotone fa-regular fa-envelope-circle-check"></i>
                                <span>
                                    Email sent to{" "}
                                    {createdInvitation.invited_email}
                                </span>
                            </div>
                        )}

                        <div className="modal-action">
                            <button
                                className="btn btn-primary"
                                onClick={handleDone}
                            >
                                Done
                            </button>
                        </div>
                    </>
                )}
            </div>
            <form method="dialog" className="modal-backdrop">
                <button onClick={handleClose}>close</button>
            </form>
        </dialog>
    );
}
