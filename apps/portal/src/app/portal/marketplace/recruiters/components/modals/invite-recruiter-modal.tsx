"use client";

import React, { useState } from "react";
import { useAuth } from "@clerk/nextjs";
import { createAuthenticatedClient } from "@/lib/api-client";
import { useToast } from "@/lib/toast-context";
import { ButtonLoading } from "@splits-network/shared-ui";
import { RecruiterWithUser, Company, getDisplayName } from "../../types";

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
            <div className="modal-box max-w-md">
                <form method="dialog">
                    <button
                        type="button"
                        className="btn btn-sm btn-square btn-ghost absolute right-2 top-2"
                        onClick={onClose}
                        disabled={isSubmitting}
                    >
                        <i className="fa-duotone fa-regular fa-xmark"></i>
                    </button>
                </form>

                <h3 className="font-bold text-lg mb-4">
                    <i className="fa-duotone fa-regular fa-paper-plane mr-2"></i>
                    Invite Recruiter
                </h3>

                <form onSubmit={handleSubmit}>
                    {/* Recruiter Info */}
                    <div className="alert mb-4">
                        <i className="fa-duotone fa-regular fa-user"></i>
                        <div>
                            <div className="font-semibold">{displayName}</div>
                            <div className="text-sm opacity-70">
                                {displayEmail}
                            </div>
                        </div>
                    </div>

                    {/* Company Selection */}
                    <fieldset className="fieldset mb-4">
                        <legend className="fieldset-legend">Company</legend>
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
                            <span className="label-text">
                                Allow recruiter to manage company jobs
                            </span>
                        </label>
                        <p className="text-xs text-base-content/60 ml-9">
                            If enabled, the recruiter can create and edit job
                            postings for your company.
                        </p>
                    </fieldset>

                    {/* Optional Message */}
                    <fieldset className="fieldset mb-6">
                        <legend className="fieldset-legend">
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
                            <span className="label-text-alt text-base-content/50">
                                {message.length}/500 characters
                            </span>
                        </label>
                    </fieldset>

                    {/* Actions */}
                    <div className="modal-action">
                        <button
                            type="button"
                            className="btn btn-ghost"
                            onClick={onClose}
                            disabled={isSubmitting}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="btn btn-primary"
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
