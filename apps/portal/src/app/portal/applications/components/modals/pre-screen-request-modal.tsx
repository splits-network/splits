"use client";

import { useState, useEffect } from "react";
import { MarkdownEditor } from "@splits-network/shared-ui";
import {
    BaselModal,
    BaselModalHeader,
    BaselModalBody,
    BaselModalFooter,
    BaselAlertBox,
} from "@splits-network/basel-ui";
import { useAuth } from "@clerk/nextjs";
import { createAuthenticatedClient } from "@/lib/api-client";

interface PreScreenRequestModalProps {
    application: any;
    jobId: string;
    companyId: string;
    onClose: () => void;
    onSuccess: () => void;
}

export default function PreScreenRequestModal({
    application,
    jobId,
    companyId,
    onClose,
    onSuccess,
}: PreScreenRequestModalProps) {
    const { getToken } = useAuth();
    const [loading, setLoading] = useState(true);
    const [jobCompanyRecruiter, setJobCompanyRecruiter] = useState<any>(null);
    const [companyRecruiters, setCompanyRecruiters] = useState<any[]>([]);
    const [selectedRecruiterId, setSelectedRecruiterId] =
        useState<string>("auto");
    const [message, setMessage] = useState("");
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        loadData();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const loadData = async () => {
        try {
            const token = await getToken();
            if (!token) return;

            const client = createAuthenticatedClient(token);

            const jobResponse: any = await client.get(`/jobs/${jobId}`);
            const job = jobResponse.data;

            if (job?.company_recruiter_id && job?.company_recruiter) {
                setJobCompanyRecruiter(job.company_recruiter);
            } else {
                const rcResponse: any = await client.get(
                    `/recruiter-companies?company_id=${companyId}&status=active`,
                );
                const recruiterList = (rcResponse.data || []).map(
                    (rc: any) => rc.recruiter,
                );
                setCompanyRecruiters(recruiterList);
            }
        } catch (err) {
            console.error("Failed to load pre-screen data:", err);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setSubmitting(true);

        try {
            const token = await getToken();
            if (!token) {
                setError("Authentication required");
                setSubmitting(false);
                return;
            }

            const client = createAuthenticatedClient(token);
            await client.post(
                `/applications/${application.id}/request-prescreen`,
                {
                    company_id: companyId,
                    recruiter_id:
                        jobCompanyRecruiter || selectedRecruiterId === "auto"
                            ? undefined
                            : selectedRecruiterId,
                    message: message.trim() || undefined,
                },
            );

            onSuccess();
        } catch (error: any) {
            console.error("Failed to request pre-screen:", error);
            setError(error.message || "Failed to request pre-screen");
            setSubmitting(false);
        }
    };

    const recruiterName = jobCompanyRecruiter
        ? jobCompanyRecruiter.user?.name ||
          jobCompanyRecruiter.user?.email ||
          "Assigned Recruiter"
        : null;

    return (
        <BaselModal isOpen onClose={onClose} maxWidth="max-w-lg">
            <BaselModalHeader
                title="Request Pre-Screen"
                subtitle="Recruiter Assignment"
                icon="fa-user-check"
                iconColor="primary"
                onClose={onClose}
                closeDisabled={submitting}
            />

            <form onSubmit={handleSubmit}>
                <BaselModalBody>
                    <div className="space-y-5">
                        {error && (
                            <BaselAlertBox variant="error">{error}</BaselAlertBox>
                        )}

                        {/* Candidate Info */}
                        <div className="bg-base-200 p-4 border-l-4 border-primary">
                            <p className="text-sm text-base-content/50 mb-1">
                                Candidate
                            </p>
                            <p className="font-semibold text-base-content">
                                {application.candidate?.full_name || "Unknown"}
                            </p>
                            <p className="text-sm text-base-content/70">
                                {application.candidate?.email || "Unknown"}
                            </p>
                        </div>

                        {/* Recruiter Selection */}
                        {loading ? (
                            <div className="flex items-center gap-2 py-4">
                                <span className="loading loading-spinner loading-sm"></span>
                                <span className="text-sm text-base-content/70">
                                    Loading recruiter options...
                                </span>
                            </div>
                        ) : jobCompanyRecruiter ? (
                            <div className="bg-base-200 p-4">
                                <p className="text-sm font-semibold uppercase tracking-[0.15em] text-base-content/50 mb-1">
                                    Company Recruiter
                                </p>
                                <p className="text-sm text-base-content">
                                    <i className="fa-duotone fa-regular fa-user-tie mr-2"></i>
                                    {recruiterName} will screen this candidate.
                                </p>
                            </div>
                        ) : (
                            <fieldset>
                                <label className="text-sm font-semibold uppercase tracking-[0.2em] text-base-content/50 mb-2 block">
                                    Assign Company Recruiter
                                </label>
                                <select
                                    className="select w-full bg-base-100 border-base-300 font-medium focus:border-primary focus:outline-none"
                                    style={{ borderRadius: 0 }}
                                    value={selectedRecruiterId}
                                    onChange={(e) =>
                                        setSelectedRecruiterId(e.target.value)
                                    }
                                    disabled={submitting}
                                >
                                    <option value="auto">
                                        {companyRecruiters.length > 0
                                            ? "Auto-assign from company recruiters"
                                            : "Auto-assign from platform (will become your company recruiter)"}
                                    </option>
                                    {companyRecruiters.map((recruiter) => (
                                        <option
                                            key={recruiter.id}
                                            value={recruiter.id}
                                        >
                                            {recruiter.user?.name ||
                                                recruiter.user?.email ||
                                                `Recruiter ${recruiter.id}`}
                                        </option>
                                    ))}
                                </select>
                                <p className="text-sm text-base-content/40 mt-2">
                                    {selectedRecruiterId === "auto"
                                        ? companyRecruiters.length > 0
                                            ? "The system will pick from your company's recruiters"
                                            : "The system will assign a recruiter from the platform and add them to your company"
                                        : "This recruiter will become the company recruiter for this job"}
                                </p>
                            </fieldset>
                        )}

                        <MarkdownEditor
                            label="Message to Recruiter (Optional)"
                            value={message}
                            onChange={setMessage}
                            placeholder="Add any context or special requirements..."
                            height={140}
                            preview="edit"
                            disabled={submitting}
                        />

                        <BaselAlertBox variant="info" title="What happens next">
                            <ul className="list-disc list-inside space-y-1">
                                <li>
                                    Recruiter will review the candidate's profile
                                </li>
                                <li>Recruiter can add notes and insights</li>
                                <li>
                                    Recruiter will submit back to you for final
                                    review
                                </li>
                            </ul>
                        </BaselAlertBox>
                    </div>
                </BaselModalBody>

                <BaselModalFooter>
                    <button
                        type="button"
                        className="btn btn-ghost"
                        style={{ borderRadius: 0 }}
                        onClick={onClose}
                        disabled={submitting}
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        className="btn btn-primary"
                        style={{ borderRadius: 0 }}
                        disabled={submitting || loading}
                    >
                        {submitting ? (
                            <>
                                <span className="loading loading-spinner loading-sm"></span>
                                Requesting...
                            </>
                        ) : (
                            <>
                                <i className="fa-duotone fa-regular fa-paper-plane"></i>
                                Send Request
                            </>
                        )}
                    </button>
                </BaselModalFooter>
            </form>
        </BaselModal>
    );
}