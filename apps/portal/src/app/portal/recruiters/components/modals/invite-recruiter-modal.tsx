"use client";

import React, { useState } from "react";
import { useAuth } from "@clerk/nextjs";
import { createAuthenticatedClient } from "@/lib/api-client";
import { useToast } from "@/lib/toast-context";
import { ButtonLoading } from "@splits-network/shared-ui";
import type { RecruiterWithUser, Company } from "../../types";
import { getDisplayName } from "../../types";

interface InviteRecruiterModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    recruiter: RecruiterWithUser;
    companies: Company[];
}

export default function InviteRecruiterModal({
    isOpen,
    onClose,
    onSuccess,
    recruiter,
    companies,
}: InviteRecruiterModalProps) {
    const { getToken } = useAuth();
    const toast = useToast();

    const displayName = getDisplayName(recruiter);
    const displayEmail = recruiter.users?.email || recruiter.email;

    const [selectedCompanyId, setSelectedCompanyId] = useState(
        companies.length === 1 ? companies[0].id : "",
    );
    const [canManageJobs, setCanManageJobs] = useState(false);
    const [message, setMessage] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!selectedCompanyId) {
            toast.error("Please select a company");
            return;
        }

        if (!displayEmail) {
            toast.error("Recruiter email is not available");
            return;
        }

        try {
            setIsSubmitting(true);

            const token = await getToken();
            if (!token) {
                toast.error("Not authenticated");
                return;
            }

            const client = createAuthenticatedClient(token);
            await client.post("/recruiter-companies/invite", {
                company_id: selectedCompanyId,
                recruiter_email: displayEmail,
                can_manage_company_jobs: canManageJobs,
                message: message.trim() || undefined,
            });

            onSuccess();
        } catch (err: any) {
            console.error("Failed to invite recruiter:", err);
            const errorMessage =
                err.response?.data?.error?.message ||
                err.response?.data?.error ||
                err.message ||
                "Failed to send invitation";
            toast.error(errorMessage);
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!isOpen) return null;

    return (
        <dialog className="modal modal-open">
            <div className="modal-box max-w-md border-4 border-dark bg-cream">
                <form method="dialog">
                    <button
                        type="button"
                        className="btn btn-sm btn-square btn-ghost absolute right-2 top-2"
                        onClick={onClose}
                        disabled={isSubmitting}
                    >
                        <i className="fa-duotone fa-regular fa-xmark" />
                    </button>
                </form>

                <h3 className="font-black text-xl uppercase tracking-tight mb-6 text-dark">
                    <i className="fa-duotone fa-regular fa-paper-plane mr-2 text-teal" />
                    Invite Recruiter
                </h3>

                <form onSubmit={handleSubmit}>
                    {/* Recruiter Info */}
                    <div className="p-4 border-4 border-dark/20 bg-white mb-4">
                        <div className="flex items-center gap-3">
                            <i className="fa-duotone fa-regular fa-user text-teal" />
                            <div>
                                <div className="font-bold text-dark">{displayName}</div>
                                <div className="text-sm text-dark/60">
                                    {displayEmail}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Company Selection */}
                    <fieldset className="fieldset mb-4">
                        <legend className="fieldset-legend font-black uppercase text-sm tracking-wider">Company</legend>
                        {companies.length === 1 ? (
                            <input
                                type="text"
                                className="input w-full"
                                value={companies[0].name}
                                disabled
                            />
                        ) : (
                            <select
                                className="select w-full"
                                value={selectedCompanyId}
                                onChange={(e) =>
                                    setSelectedCompanyId(e.target.value)
                                }
                                required
                            >
                                <option value="">Select a company...</option>
                                {companies.map((company) => (
                                    <option key={company.id} value={company.id}>
                                        {company.name}
                                    </option>
                                ))}
                            </select>
                        )}
                    </fieldset>

                    {/* Permissions */}
                    <fieldset className="fieldset mb-4">
                        <label className="label cursor-pointer justify-start gap-3">
                            <input
                                type="checkbox"
                                className="checkbox checkbox-primary"
                                checked={canManageJobs}
                                onChange={(e) =>
                                    setCanManageJobs(e.target.checked)
                                }
                            />
                            <span className="label-text font-bold text-dark">
                                Allow recruiter to manage company jobs
                            </span>
                        </label>
                        <p className="text-sm text-dark/50 ml-9">
                            If enabled, the recruiter can create and edit job
                            postings for your company.
                        </p>
                    </fieldset>

                    {/* Optional Message */}
                    <fieldset className="fieldset mb-6">
                        <legend className="fieldset-legend font-black uppercase text-sm tracking-wider">
                            Message (optional)
                        </legend>
                        <textarea
                            className="textarea w-full"
                            placeholder="Add a personal message to the invitation..."
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            rows={3}
                            maxLength={500}
                        />
                        <label className="label">
                            <span className="text-sm text-dark/40">
                                {message.length}/500 characters
                            </span>
                        </label>
                    </fieldset>

                    {/* Actions */}
                    <div className="flex justify-end gap-2">
                        <button
                            type="button"
                            className="btn btn-ghost font-bold"
                            onClick={onClose}
                            disabled={isSubmitting}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="btn btn-primary font-bold"
                            disabled={isSubmitting || !selectedCompanyId}
                        >
                            <ButtonLoading
                                loading={isSubmitting}
                                text="Send Invitation"
                                loadingText="Sending..."
                            />
                        </button>
                    </div>
                </form>
            </div>
            <form method="dialog" className="modal-backdrop">
                <button onClick={onClose} disabled={isSubmitting}>
                    close
                </button>
            </form>
        </dialog>
    );
}
