"use client";

import { useState, useEffect, useMemo } from "react";
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

interface HireModalApplication {
    id: string;
    job_id?: string | null;
    [key: string]: any;
}

interface HireModalProps {
    application: HireModalApplication;
    onClose: () => void;
    onSuccess: () => void;
}

interface JobFeeData {
    fee_percentage: number | null;
    guarantee_days: number | null;
}

export default function HireModal({
    application,
    onClose,
    onSuccess,
}: HireModalProps) {
    const { getToken } = useAuth();
    const [salary, setSalary] = useState("");
    const [startDate, setStartDate] = useState("");
    const [notes, setNotes] = useState("");
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [loadingJob, setLoadingJob] = useState(true);
    const [jobFeeData, setJobFeeData] = useState<JobFeeData | null>(null);

    useEffect(() => {
        loadJobData();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const loadJobData = async () => {
        if (!application.job_id) {
            setLoadingJob(false);
            return;
        }
        try {
            const token = await getToken();
            if (!token) return;

            const client = createAuthenticatedClient(token);
            const response: any = await client.get(
                `/jobs/${application.job_id}`,
            );
            const job = response.data;
            setJobFeeData({
                fee_percentage: job?.fee_percentage ?? null,
                guarantee_days: job?.guarantee_days ?? null,
            });
        } catch (err) {
            console.error("Failed to load job data:", err);
        } finally {
            setLoadingJob(false);
        }
    };

    const feePercentage = jobFeeData?.fee_percentage ?? 0;
    const guaranteeDays = jobFeeData?.guarantee_days ?? 90;
    const salaryNumber = parseFloat(salary) || 0;

    const placementFee = useMemo(() => {
        return Math.round((salaryNumber * feePercentage) / 100);
    }, [salaryNumber, feePercentage]);

    const guaranteeExpires = useMemo(() => {
        const start = startDate ? new Date(startDate) : new Date();
        const expires = new Date(
            start.getTime() + guaranteeDays * 24 * 60 * 60 * 1000,
        );
        return expires.toLocaleDateString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
        });
    }, [startDate, guaranteeDays]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setSubmitting(true);

        try {
            const token = await getToken();
            if (!token) {
                throw new Error("No auth token available");
            }

            const client = createAuthenticatedClient(token);
            await client.post(`/applications/${application.id}/hire`, {
                salary: salaryNumber,
                start_date: startDate,
                notes: notes.trim() || undefined,
            });

            onSuccess();
        } catch (err: any) {
            setError(err.message || "Failed to hire candidate");
        } finally {
            setSubmitting(false);
        }
    };

    const hasFeePercentage =
        jobFeeData &&
        jobFeeData.fee_percentage !== null &&
        jobFeeData.fee_percentage > 0;

    return (
        <BaselModal isOpen onClose={onClose} maxWidth="max-w-lg">
            <BaselModalHeader
                title="Mark as Hired"
                subtitle="Placement Record"
                icon="fa-check-circle"
                iconColor="success"
                onClose={onClose}
                closeDisabled={submitting}
            />

            <form onSubmit={handleSubmit}>
                <BaselModalBody>
                    <div className="space-y-5 max-h-[calc(100vh-300px)] overflow-y-auto pr-2">
                        {/* Candidate/Job Summary */}
                        <div className="bg-base-200 p-4 border-l-4 border-success">
                            <p className="font-semibold text-base-content">
                                {application.candidate?.full_name ||
                                    "Unknown Candidate"}
                            </p>
                            <p className="text-sm text-base-content/70">
                                {application.job?.title || "Unknown Position"}
                                {application.job?.company?.name &&
                                    ` at ${application.job.company.name}`}
                            </p>
                        </div>

                        {error && (
                            <BaselAlertBox variant="error">
                                {error}
                            </BaselAlertBox>
                        )}

                        <fieldset>
                            <label className="text-sm font-semibold uppercase tracking-[0.2em] text-base-content/50 mb-2 block">
                                Annual Salary (USD) *
                            </label>
                            <input
                                type="number"
                                className="input w-full bg-base-100 border-base-300 font-medium focus:border-primary focus:outline-none"
                                style={{ borderRadius: 0 }}
                                value={salary}
                                onChange={(e) => setSalary(e.target.value)}
                                placeholder="150000"
                                required
                                min="0"
                                step="any"
                                disabled={submitting}
                            />
                            <p className="text-sm text-base-content/40 mt-2">
                                The candidate's agreed annual salary
                            </p>
                        </fieldset>

                        <fieldset>
                            <label className="text-sm font-semibold uppercase tracking-[0.2em] text-base-content/50 mb-2 block">
                                Start Date *
                            </label>
                            <input
                                type="date"
                                className="input w-full bg-base-100 border-base-300 font-medium focus:border-primary focus:outline-none"
                                style={{ borderRadius: 0 }}
                                value={startDate}
                                onChange={(e) => setStartDate(e.target.value)}
                                required
                                disabled={submitting}
                            />
                            <p className="text-sm text-base-content/40 mt-2">
                                The candidate's first day of employment
                            </p>
                        </fieldset>

                        {/* Fee Breakdown */}
                        {loadingJob ? (
                            <div className="flex items-center gap-2 py-2">
                                <span className="loading loading-spinner loading-sm"></span>
                                <span className="text-sm text-base-content/70">
                                    Loading fee details...
                                </span>
                            </div>
                        ) : (
                            <div className="bg-base-200 p-4 space-y-3">
                                <p className="text-sm font-semibold uppercase tracking-[0.15em] text-base-content/50">
                                    <i className="fa-duotone fa-regular fa-calculator mr-2"></i>
                                    Placement Fee Breakdown
                                </p>
                                {!hasFeePercentage && (
                                    <BaselAlertBox variant="warning">
                                        No fee percentage configured on this
                                        job. The placement fee will default to
                                        $0.
                                    </BaselAlertBox>
                                )}
                                <div className="grid grid-cols-2 gap-1 text-sm">
                                    <span className="text-base-content/70">
                                        Fee Percentage:
                                    </span>
                                    <span className="font-medium text-right">
                                        {feePercentage}%
                                    </span>

                                    <span className="text-base-content/70">
                                        Placement Fee:
                                    </span>
                                    <span className="font-medium text-right">
                                        {salaryNumber > 0
                                            ? `$${placementFee.toLocaleString()}`
                                            : "Enter salary"}
                                    </span>

                                    <span className="text-base-content/70">
                                        Guarantee Period:
                                    </span>
                                    <span className="font-medium text-right">
                                        {guaranteeDays} days
                                    </span>

                                    <span className="text-base-content/70">
                                        Guarantee Expires:
                                    </span>
                                    <span className="font-medium text-right">
                                        {guaranteeExpires}
                                    </span>
                                </div>
                            </div>
                        )}

                        <MarkdownEditor
                            label="Notes (Optional)"
                            value={notes}
                            onChange={setNotes}
                            placeholder="Add any notes about the hire..."
                            height={120}
                            preview="edit"
                            disabled={submitting}
                        />
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
                        className="btn btn-success"
                        style={{ borderRadius: 0 }}
                        disabled={submitting || loadingJob || !startDate}
                    >
                        {submitting ? (
                            <>
                                <span className="loading loading-spinner loading-sm"></span>
                                Creating Placement...
                            </>
                        ) : (
                            <>
                                <i className="fa-duotone fa-regular fa-check"></i>
                                Confirm Hire
                            </>
                        )}
                    </button>
                </BaselModalFooter>
            </form>
        </BaselModal>
    );
}
