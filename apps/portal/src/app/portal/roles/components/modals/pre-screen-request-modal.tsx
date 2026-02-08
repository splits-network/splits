"use client";

import { useState, useEffect } from "react";
import { MarkdownEditor } from "@splits-network/shared-ui";
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

            // Fetch job to check for existing company recruiter
            const jobResponse: any = await client.get(`/jobs/${jobId}`);
            const job = jobResponse.data;

            if (job?.company_recruiter_id && job?.company_recruiter) {
                // Job already has a company recruiter assigned
                setJobCompanyRecruiter(job.company_recruiter);
            } else {
                // No company recruiter on job — fetch company's recruiters
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
                    // Only send recruiter_id when manually picking (not auto, not job-level)
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
        <div className="modal modal-open">
            <div className="modal-box max-w-lg">
                <h3 className="font-bold text-lg mb-4">
                    <i className="fa-duotone fa-regular fa-user-check mr-2"></i>
                    Request Pre-Screen
                </h3>

                <form onSubmit={handleSubmit} className="space-y-4">
                    {error && (
                        <div className="alert alert-error">
                            <i className="fa-duotone fa-regular fa-circle-exclamation"></i>
                            <span>{error}</span>
                        </div>
                    )}

                    <div className="bg-base-200 p-4 rounded-lg">
                        <p className="text-sm">
                            <strong>Candidate:</strong>{" "}
                            {application.candidate?.full_name || "Unknown"}
                        </p>
                        <p className="text-sm mt-1">
                            <strong>Email:</strong>{" "}
                            {application.candidate?.email || "Unknown"}
                        </p>
                    </div>

                    {loading ? (
                        <div className="flex items-center gap-2 py-4">
                            <span className="loading loading-spinner loading-sm"></span>
                            <span className="text-sm opacity-70">
                                Loading recruiter options...
                            </span>
                        </div>
                    ) : jobCompanyRecruiter ? (
                        <div className="bg-base-200 p-4 rounded-lg">
                            <p className="text-sm font-semibold mb-1">
                                Company Recruiter
                            </p>
                            <p className="text-sm">
                                <i className="fa-duotone fa-regular fa-user-tie mr-2"></i>
                                {recruiterName} will screen this candidate.
                            </p>
                        </div>
                    ) : (
                        <fieldset className="fieldset">
                            <legend className="fieldset-legend">
                                Assign Company Recruiter
                            </legend>
                            <select
                                className="select w-full"
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
                            <p className="fieldset-label">
                                {selectedRecruiterId === "auto"
                                    ? companyRecruiters.length > 0
                                        ? "The system will pick from your company's recruiters"
                                        : "The system will assign a recruiter from the platform and add them to your company"
                                    : "This recruiter will become the company recruiter for this job"}
                            </p>
                        </fieldset>
                    )}

                    <MarkdownEditor
                        className="fieldset"
                        label="Message to Recruiter (Optional)"
                        value={message}
                        onChange={setMessage}
                        placeholder="Add any context or special requirements..."
                        height={140}
                        preview="edit"
                        disabled={submitting}
                    />

                    <div className="alert alert-info">
                        <i className="fa-duotone fa-regular fa-circle-info"></i>
                        <div className="text-sm">
                            <p className="font-semibold">What happens next?</p>
                            <ul className="list-disc list-inside mt-1">
                                <li>
                                    Recruiter will review the candidate's
                                    profile
                                </li>
                                <li>Recruiter can add notes and insights</li>
                                <li>
                                    Recruiter will submit back to you for final
                                    review
                                </li>
                            </ul>
                        </div>
                    </div>

                    <div className="modal-action">
                        <button
                            type="button"
                            className="btn"
                            onClick={onClose}
                            disabled={submitting}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="btn btn-primary"
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
                    </div>
                </form>
            </div>
            <div className="modal-backdrop" onClick={onClose}></div>
        </div>
    );
}
