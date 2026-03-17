"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@clerk/nextjs";
import { useChatSidebar } from "@splits-network/chat-ui";
import { MarkdownEditor } from "@splits-network/shared-ui";
import { createAuthenticatedClient } from "@/lib/api-client";
import { startChatConversation } from "@/lib/chat-start";
import { useToast } from "@/lib/toast-context";
import { WizardShell } from "../../../invitation/shared/wizard-shell";
import type { WizardStep } from "../../../invitation/shared/types";
import type { Application } from "../../types";
import { formatApplicationDate } from "../../types";
import PlacementConfirmed from "./placement-confirmed";

const STEPS: WizardStep[] = [
    { num: "01", label: "Review Placement", icon: "fa-duotone fa-regular fa-clipboard-check" },
    { num: "02", label: "Confirm Terms", icon: "fa-duotone fa-regular fa-calculator" },
    { num: "03", label: "Acknowledge & Confirm", icon: "fa-duotone fa-regular fa-handshake" },
];

const RECRUITER_ROLES = [
    { key: "candidate_recruiter", label: "Candidate Recruiter", icon: "fa-user-tie" },
    { key: "company_recruiter", label: "Company Recruiter", icon: "fa-building" },
    { key: "job_owner_recruiter", label: "Job Owner", icon: "fa-briefcase" },
    { key: "candidate_sourcer", label: "Candidate Sourcer", icon: "fa-magnifying-glass" },
    { key: "company_sourcer", label: "Company Sourcer", icon: "fa-bullseye" },
] as const;

interface JobFeeData {
    fee_percentage: number | null;
    guarantee_days: number | null;
}

interface PlacementResult {
    id?: string;
    placement_id?: string;
    [key: string]: any;
}

export default function HireClient({
    applicationId,
}: {
    applicationId: string;
}) {
    const router = useRouter();
    const { getToken } = useAuth();
    const toast = useToast();

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [application, setApplication] = useState<Application | null>(null);
    const [jobFeeData, setJobFeeData] = useState<JobFeeData | null>(null);

    const [currentStep, setCurrentStep] = useState(0);
    const [salary, setSalary] = useState("");
    const [startDate, setStartDate] = useState("");
    const [notes, setNotes] = useState("");
    const [agreeTerms, setAgreeTerms] = useState(false);
    const [processing, setProcessing] = useState(false);
    const [completed, setCompleted] = useState(false);
    const [placementResult, setPlacementResult] = useState<PlacementResult | null>(null);

    /* Load application and job data */
    useEffect(() => {
        const load = async () => {
            try {
                setLoading(true);
                setError(null);
                const token = await getToken();
                if (!token) return;

                const client = createAuthenticatedClient(token);

                const appRes: any = await client.get(
                    `/applications/${applicationId}/view/detail?include=recruiter,documents,timeline`,
                );
                const app = appRes.data as Application;

                if (app.stage !== "offer") {
                    setError(
                        `This application is at the "${app.stage}" stage. Only applications at the "offer" stage can be hired.`,
                    );
                    setApplication(app);
                    setLoading(false);
                    return;
                }

                setApplication(app);

                if (app.salary) {
                    setSalary(String(app.salary));
                }
                if (app.start_date) {
                    const d = new Date(app.start_date);
                    setStartDate(d.toISOString().split("T")[0]);
                }

                if (app.job_id) {
                    try {
                        const jobRes: any = await client.get(`/jobs/${app.job_id}`);
                        const job = jobRes.data;
                        setJobFeeData({
                            fee_percentage: job?.fee_percentage ?? null,
                            guarantee_days: job?.guarantee_days ?? null,
                        });
                    } catch {
                        console.error("Failed to load job fee data");
                    }
                }
            } catch {
                setError("Failed to load application details.");
            } finally {
                setLoading(false);
            }
        };

        load();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [applicationId]);

    /* Computed values */
    const feePercentage = jobFeeData?.fee_percentage ?? 0;
    const guaranteeDays = jobFeeData?.guarantee_days ?? 90;
    const salaryNumber = parseFloat(salary) || 0;

    const placementFee = useMemo(() => {
        return Math.round((salaryNumber * feePercentage) / 100);
    }, [salaryNumber, feePercentage]);

    const guaranteeExpiresDate = useMemo(() => {
        const start = startDate ? new Date(startDate) : new Date();
        return new Date(start.getTime() + guaranteeDays * 24 * 60 * 60 * 1000);
    }, [startDate, guaranteeDays]);

    const guaranteeExpiresFormatted = useMemo(() => {
        return guaranteeExpiresDate.toLocaleDateString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
        });
    }, [guaranteeExpiresDate]);

    const hasFeePercentage =
        jobFeeData &&
        jobFeeData.fee_percentage !== null &&
        jobFeeData.fee_percentage > 0;

    /* Navigation */
    const handleNext = () => setCurrentStep((s) => Math.min(s + 1, 2));
    const handleBack = () => setCurrentStep((s) => Math.max(s - 1, 0));

    const canContinueStep2 = salary.trim() !== "" && startDate.trim() !== "";
    const canSubmit = agreeTerms && canContinueStep2;

    /* Submit hire */
    const handleSubmit = useCallback(async () => {
        if (!canSubmit) return;
        try {
            setProcessing(true);
            setError(null);
            const token = await getToken();
            if (!token) throw new Error("No auth token available");

            const client = createAuthenticatedClient(token);
            const response: any = await client.post(
                `/applications/${applicationId}/hire`,
                {
                    salary: salaryNumber,
                    start_date: startDate,
                    notes: notes.trim() || undefined,
                },
            );

            setPlacementResult(response.data);
            setCompleted(true);
        } catch (err: any) {
            setError(err.message || "Failed to hire candidate");
            setProcessing(false);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [canSubmit, applicationId, salaryNumber, startDate, notes]);

    /* Loading state */
    if (loading) {
        return (
            <main className="min-h-[70vh] flex items-center justify-center">
                <div className="text-center">
                    <span className="loading loading-spinner loading-lg text-primary" />
                    <p className="mt-4 text-base-content/70">Loading application...</p>
                </div>
            </main>
        );
    }

    /* Error state (application not at offer stage or failed to load) */
    if (error && (!application || application.stage !== "offer")) {
        return (
            <main className="min-h-[70vh] flex items-center justify-center p-6">
                <div className="bg-base-200 border-l-4 border-error p-8 max-w-md w-full">
                    <div className="flex items-start gap-4">
                        <i className="fa-duotone fa-regular fa-triangle-exclamation text-error text-2xl mt-1" />
                        <div>
                            <h1 className="text-xl font-black mb-2">Cannot Proceed with Hire</h1>
                            <p className="text-sm text-base-content/60 leading-relaxed">{error}</p>
                            <button
                                onClick={() => router.push(`/portal/applications`)}
                                className="btn btn-primary btn-sm mt-4"
                                style={{ borderRadius: 0 }}
                            >
                                Back to Applications
                            </button>
                        </div>
                    </div>
                </div>
            </main>
        );
    }

    if (!application) return null;

    const candidateName = application.candidate?.full_name || "Unknown Candidate";
    const jobTitle = application.job?.title || "Unknown Position";
    const companyName = application.job?.company?.name || "Unknown Company";
    const recruiterEmail =
        application.recruiter?.user?.email ||
        application.recruiter?.email ||
        "";
    const recruiterName =
        application.recruiter?.user?.name ||
        application.recruiter?.name ||
        recruiterEmail ||
        "Unknown Recruiter";

    /* Candidate sourcer — distinct from candidate recruiter */
    const candidateSourcerRaw = (application.candidate as any)?.candidate_sourcer;
    const candidateSourcer = Array.isArray(candidateSourcerRaw)
        ? candidateSourcerRaw[0]
        : candidateSourcerRaw;
    const sourcerName = candidateSourcer?.recruiter?.user?.name || null;
    const sourcerEmail = candidateSourcer?.recruiter?.user?.email || null;

    /* Completed state */
    if (completed) {
        return (
            <PlacementConfirmed
                candidateName={candidateName}
                jobTitle={jobTitle}
                companyName={companyName}
                salary={salaryNumber}
                placementFee={placementFee}
                startDate={startDate}
                guaranteeDays={guaranteeDays}
                guaranteeExpiresAt={guaranteeExpiresFormatted}
                applicationId={applicationId}
                placementId={placementResult?.placement_id || placementResult?.id}
            />
        );
    }

    return (
        <WizardShell
            kicker="Hire Candidate"
            title={
                <>
                    <span className="inline-block">Confirm</span>{" "}
                    <span className="inline-block text-primary">placement</span>{" "}
                    <span className="inline-block">details</span>
                </>
            }
            subtitle={`Review and confirm the hire of ${candidateName} for ${jobTitle} at ${companyName}. This will create a placement record and notify all parties.`}
            steps={STEPS}
            currentStep={currentStep}
            onStepClick={setCurrentStep}
            sidebar={
                <HireSidebar
                    candidateName={candidateName}
                    recruiterName={recruiterName}
                    recruiterEmail={recruiterEmail}
                    recruiterUserId={(application.recruiter as any)?.user_id || ""}
                    jobTitle={jobTitle}
                    companyName={companyName}
                    placementFee={placementFee}
                    salaryNumber={salaryNumber}
                    guaranteeDays={guaranteeDays}
                    guaranteeExpiresFormatted={guaranteeExpiresFormatted}
                    currentStep={currentStep}
                    applicationId={applicationId}
                />
            }
        >
            {/* Step 1: Review Placement */}
            {currentStep === 0 && (
                <StepReview
                    application={application}
                    candidateName={candidateName}
                    jobTitle={jobTitle}
                    companyName={companyName}
                    recruiterName={recruiterName}
                    recruiterEmail={recruiterEmail}
                    sourcerName={sourcerName}
                    sourcerEmail={sourcerEmail}
                    salary={salary}
                    startDate={startDate}
                />
            )}

            {/* Step 2: Confirm Terms */}
            {currentStep === 1 && (
                <StepTerms
                    application={application}
                    salary={salary}
                    setSalary={setSalary}
                    startDate={startDate}
                    setStartDate={setStartDate}
                    feePercentage={feePercentage}
                    placementFee={placementFee}
                    guaranteeDays={guaranteeDays}
                    guaranteeExpiresFormatted={guaranteeExpiresFormatted}
                    hasFeePercentage={!!hasFeePercentage}
                    salaryNumber={salaryNumber}
                    processing={processing}
                />
            )}

            {/* Step 3: Acknowledge & Confirm */}
            {currentStep === 2 && (
                <StepConfirm
                    candidateName={candidateName}
                    jobTitle={jobTitle}
                    companyName={companyName}
                    salaryNumber={salaryNumber}
                    placementFee={placementFee}
                    startDate={startDate}
                    guaranteeDays={guaranteeDays}
                    guaranteeExpiresFormatted={guaranteeExpiresFormatted}
                    notes={notes}
                    setNotes={setNotes}
                    agreeTerms={agreeTerms}
                    setAgreeTerms={setAgreeTerms}
                    processing={processing}
                    canSubmit={canSubmit}
                    error={error}
                    onSubmit={handleSubmit}
                />
            )}

            {/* Bottom Navigation */}
            <div className="flex items-center justify-between mt-10 pt-6 border-t border-base-300">
                <button
                    onClick={handleBack}
                    disabled={currentStep === 0}
                    className="btn btn-ghost btn-sm disabled:opacity-30"
                    style={{ borderRadius: 0 }}
                >
                    <i className="fa-duotone fa-regular fa-arrow-left" /> Back
                </button>
                {currentStep < 2 && (
                    <button
                        onClick={handleNext}
                        className="btn btn-primary btn-sm"
                        style={{ borderRadius: 0 }}
                        disabled={currentStep === 1 && !canContinueStep2}
                    >
                        Continue <i className="fa-duotone fa-regular fa-arrow-right" />
                    </button>
                )}
            </div>
        </WizardShell>
    );
}

/* ─── Step 1: Review Placement ─────────────────────────────────────────── */

function StepReview({
    application,
    candidateName,
    jobTitle,
    companyName,
    recruiterName,
    recruiterEmail,
    sourcerName,
    sourcerEmail,
    salary,
    startDate,
}: {
    application: Application;
    candidateName: string;
    jobTitle: string;
    companyName: string;
    recruiterName: string;
    recruiterEmail: string;
    sourcerName: string | null;
    sourcerEmail: string | null;
    salary: string;
    startDate: string;
}) {
    const candidateInitials = candidateName
        .split(" ")
        .map((w) => w[0])
        .join("")
        .slice(0, 2)
        .toUpperCase();

    return (
        <div>
            <h2 className="text-2xl font-black tracking-tight mb-1">
                Review Placement Details
            </h2>
            <p className="text-sm text-base-content/50 mb-8">
                Verify all details before proceeding to confirm the hire.
            </p>

            {/* Candidate Card */}
            <div className="flex items-start gap-5 bg-base-200 p-6 mb-6">
                <div className="w-14 h-14 bg-primary text-primary-content flex items-center justify-center flex-shrink-0">
                    <span className="text-lg font-black">{candidateInitials}</span>
                </div>
                <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-black">{candidateName}</h3>
                    {application.candidate?.email && (
                        <p className="text-sm text-base-content/60">
                            <i className="fa-duotone fa-regular fa-envelope w-4 text-center mr-1" />
                            {application.candidate.email}
                        </p>
                    )}
                    {application.candidate?.phone && (
                        <p className="text-sm text-base-content/60">
                            <i className="fa-duotone fa-regular fa-phone w-4 text-center mr-1" />
                            {application.candidate.phone}
                        </p>
                    )}
                    {(application.candidate?.current_title || application.candidate?.current_company) && (
                        <p className="text-sm text-base-content/50 mt-1">
                            {application.candidate.current_title}
                            {application.candidate.current_title && application.candidate.current_company && " at "}
                            {application.candidate.current_company}
                        </p>
                    )}
                </div>
            </div>

            {/* Job Details */}
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-base-content/50 mb-3">
                Position
            </p>
            <div className="bg-base-200 p-5 mb-6 space-y-2">
                <p className="font-bold text-base-content">{jobTitle}</p>
                <div className="text-sm text-base-content/60 space-y-1">
                    <p>
                        <i className="fa-duotone fa-regular fa-building w-4 text-center mr-2" />
                        {companyName}
                    </p>
                    {application.job?.location && (
                        <p>
                            <i className="fa-duotone fa-regular fa-location-dot w-4 text-center mr-2" />
                            {application.job.location}
                        </p>
                    )}
                    {application.job?.employment_type && (
                        <p>
                            <i className="fa-duotone fa-regular fa-clock w-4 text-center mr-2" />
                            {application.job.employment_type}
                        </p>
                    )}
                </div>
            </div>

            {/* Sourcer */}
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-base-content/50 mb-3">
                Sourced By
            </p>
            <div className="bg-base-200 p-5 mb-6">
                {sourcerName ? (
                    <>
                        <p className="font-bold text-base-content">{sourcerName}</p>
                        {sourcerEmail && (
                            <p className="text-sm text-base-content/60">
                                <i className="fa-duotone fa-regular fa-envelope w-4 text-center mr-1" />
                                {sourcerEmail}
                            </p>
                        )}
                    </>
                ) : (
                    <p className="font-bold text-base-content">
                        <i className="fa-duotone fa-regular fa-globe w-4 text-center mr-2" />
                        Splits Network
                    </p>
                )}
            </div>

            {/* Offer Details */}
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-base-content/50 mb-3">
                Offer Details
            </p>
            <div className="bg-base-200 p-5 mb-6">
                <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                        <p className="text-base-content/50">Salary</p>
                        <p className="font-bold">
                            {salary
                                ? `$${parseFloat(salary).toLocaleString()}`
                                : "Set in next step"}
                        </p>
                    </div>
                    <div>
                        <p className="text-base-content/50">Start Date</p>
                        <p className="font-bold">
                            {startDate
                                ? new Date(startDate).toLocaleDateString("en-US", {
                                      year: "numeric",
                                      month: "short",
                                      day: "numeric",
                                  })
                                : "Set in next step"}
                        </p>
                    </div>
                </div>
            </div>

            {/* Documents */}
            {application.documents && application.documents.length > 0 && (
                <>
                    <p className="text-sm font-semibold uppercase tracking-[0.2em] text-base-content/50 mb-3">
                        Attached Documents
                    </p>
                    <div className="bg-base-200 p-5 mb-6 space-y-2">
                        {application.documents.map((doc: any, i: number) => (
                            <div key={doc.id || i} className="flex items-center gap-2 text-sm">
                                <i className="fa-duotone fa-regular fa-file text-primary" />
                                <span className="text-base-content/70">
                                    {doc.file_name || doc.name || `Document ${i + 1}`}
                                </span>
                            </div>
                        ))}
                    </div>
                </>
            )}

            {/* Application Journey */}
            {(application.timeline || application.audit_log) && (application.timeline || application.audit_log)!.length > 0 && (
                <>
                    <p className="text-sm font-semibold uppercase tracking-[0.2em] text-base-content/50 mb-3">
                        Application Journey
                    </p>
                    <div className="bg-base-200 p-5 space-y-3">
                        {(application.timeline || application.audit_log || []).map((event: any, i: number) => (
                            <div key={event.id || i} className="flex items-start gap-3">
                                <div className="w-2 h-2 bg-primary mt-2 flex-shrink-0" />
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium text-base-content">
                                        {event.description || event.action || event.stage}
                                    </p>
                                    <p className="text-sm text-base-content/40">
                                        {formatApplicationDate(event.created_at || event.timestamp)}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                </>
            )}
        </div>
    );
}

/* ─── Step 2: Confirm Terms ────────────────────────────────────────────── */

function StepTerms({
    application,
    salary,
    setSalary,
    startDate,
    setStartDate,
    feePercentage,
    placementFee,
    guaranteeDays,
    guaranteeExpiresFormatted,
    hasFeePercentage,
    salaryNumber,
    processing,
}: {
    application: Application;
    salary: string;
    setSalary: (v: string) => void;
    startDate: string;
    setStartDate: (v: string) => void;
    feePercentage: number;
    placementFee: number;
    guaranteeDays: number;
    guaranteeExpiresFormatted: string;
    hasFeePercentage: boolean;
    salaryNumber: number;
    processing: boolean;
}) {
    return (
        <div>
            <h2 className="text-2xl font-black tracking-tight mb-1">
                Confirm Terms
            </h2>
            <p className="text-sm text-base-content/50 mb-8">
                Verify the salary and start date, and review the fee calculation.
            </p>

            {/* Salary Input */}
            <fieldset className="fieldset mb-6">
                <legend className="fieldset-legend">
                    Final Annual Salary (USD) *
                </legend>
                <input
                    type="number"
                    className="input w-full"
                    style={{ borderRadius: 0 }}
                    value={salary}
                    onChange={(e) => setSalary(e.target.value)}
                    placeholder="150000"
                    required
                    min="0"
                    step="any"
                    disabled={processing}
                />
                <p className="fieldset-label">
                    Confirm or update the agreed salary. This will be used to calculate the placement fee.
                </p>
            </fieldset>

            {/* Start Date Input */}
            <fieldset className="fieldset mb-8">
                <legend className="fieldset-legend">
                    Start Date *
                </legend>
                <input
                    type="date"
                    className="input w-full"
                    style={{ borderRadius: 0 }}
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    required
                    disabled={processing}
                />
                <p className="fieldset-label">
                    The candidate's first day of employment.
                </p>
            </fieldset>

            {/* Fee Calculation Breakdown */}
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-base-content/50 mb-3">
                <i className="fa-duotone fa-regular fa-calculator mr-2" />
                Fee Calculation
            </p>
            <div className="bg-base-200 p-5 mb-8">
                {!hasFeePercentage && (
                    <div className="bg-warning/10 border border-warning/30 p-3 text-sm text-warning mb-4">
                        <i className="fa-duotone fa-regular fa-triangle-exclamation mr-2" />
                        No fee percentage configured on this job. The placement fee will default to $0.
                    </div>
                )}
                <div className="grid grid-cols-2 gap-3 text-sm">
                    <span className="text-base-content/70">Fee Percentage:</span>
                    <span className="font-medium text-right">{feePercentage}%</span>

                    <span className="text-base-content/70">Placement Fee:</span>
                    <span className="font-bold text-right text-success">
                        {salaryNumber > 0
                            ? `$${placementFee.toLocaleString()}`
                            : "Enter salary"}
                    </span>

                    <span className="text-base-content/70">Guarantee Period:</span>
                    <span className="font-medium text-right">{guaranteeDays} days</span>

                    <span className="text-base-content/70">Guarantee Expires:</span>
                    <span className="font-medium text-right">{guaranteeExpiresFormatted}</span>
                </div>
            </div>

            {/* 5-Role Recruiter Breakdown */}
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-base-content/50 mb-3">
                <i className="fa-duotone fa-regular fa-users mr-2" />
                Recruiter Roles
            </p>
            <div className="bg-base-200 p-5 mb-8 space-y-3">
                {RECRUITER_ROLES.map((role) => {
                    const value = (application as any)[`${role.key}_id`];
                    const name = (application as any)[`${role.key}_name`];
                    return (
                        <div key={role.key} className="flex items-center justify-between text-sm">
                            <span className="flex items-center gap-2 text-base-content/70">
                                <i className={`fa-duotone fa-regular ${role.icon} w-4 text-center`} />
                                {role.label}
                            </span>
                            <span className={value ? "font-medium" : "text-base-content/30"}>
                                {name || (value ? "Assigned" : "Not assigned")}
                            </span>
                        </div>
                    );
                })}
                <p className="text-sm text-base-content/40 pt-2 border-t border-base-300">
                    These roles determine how the placement fee is distributed.
                </p>
            </div>

            {/* What Hiring Triggers */}
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-base-content/50 mb-3">
                <i className="fa-duotone fa-regular fa-bolt mr-2" />
                What Hiring Triggers
            </p>
            <div className="space-y-3">
                {[
                    { icon: "fa-file-circle-plus", text: "A placement record will be created automatically" },
                    { icon: "fa-bell", text: "The candidate, their recruiter, and company admins will be notified" },
                    { icon: "fa-shield-check", text: "The guarantee period starts on the start date" },
                    { icon: "fa-credit-card", text: "Placement fees will be processed per your billing agreement" },
                ].map((item) => (
                    <div key={item.icon} className="flex items-start gap-3 border-l-4 border-base-300 pl-4 py-1">
                        <i className={`fa-duotone fa-regular ${item.icon} text-secondary mt-0.5`} />
                        <span className="text-sm text-base-content/70">{item.text}</span>
                    </div>
                ))}
            </div>
        </div>
    );
}

/* ─── Step 3: Acknowledge & Confirm ────────────────────────────────────── */

function StepConfirm({
    candidateName,
    jobTitle,
    companyName,
    salaryNumber,
    placementFee,
    startDate,
    guaranteeDays,
    guaranteeExpiresFormatted,
    notes,
    setNotes,
    agreeTerms,
    setAgreeTerms,
    processing,
    canSubmit,
    error,
    onSubmit,
}: {
    candidateName: string;
    jobTitle: string;
    companyName: string;
    salaryNumber: number;
    placementFee: number;
    startDate: string;
    guaranteeDays: number;
    guaranteeExpiresFormatted: string;
    notes: string;
    setNotes: (v: string) => void;
    agreeTerms: boolean;
    setAgreeTerms: (v: boolean) => void;
    processing: boolean;
    canSubmit: boolean;
    error: string | null;
    onSubmit: () => void;
}) {
    const formattedStartDate = startDate
        ? new Date(startDate).toLocaleDateString("en-US", {
              year: "numeric",
              month: "short",
              day: "numeric",
          })
        : "Not set";

    return (
        <div>
            <h2 className="text-2xl font-black tracking-tight mb-1">
                Acknowledge & Confirm
            </h2>
            <p className="text-sm text-base-content/50 mb-8">
                Review the final summary and confirm the hire.
            </p>

            {/* Final Placement Summary */}
            <div className="bg-base-200 border-t-4 border-success p-6 mb-8">
                <p className="text-sm font-semibold uppercase tracking-[0.2em] text-base-content/50 mb-4">
                    Placement Summary
                </p>
                <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                            <p className="text-base-content/50">Candidate</p>
                            <p className="font-bold">{candidateName}</p>
                        </div>
                        <div>
                            <p className="text-base-content/50">Position</p>
                            <p className="font-bold">
                                {jobTitle} at {companyName}
                            </p>
                        </div>
                        <div>
                            <p className="text-base-content/50">Salary</p>
                            <p className="font-bold">${salaryNumber.toLocaleString()}</p>
                        </div>
                        <div>
                            <p className="text-base-content/50">Start Date</p>
                            <p className="font-bold">{formattedStartDate}</p>
                        </div>
                    </div>

                    {/* Hero Placement Fee */}
                    <div className="bg-success/10 border border-success/20 p-5 text-center">
                        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-base-content/50 mb-1">
                            Placement Fee
                        </p>
                        <p className="text-4xl font-black text-success">
                            ${placementFee.toLocaleString()}
                        </p>
                    </div>

                    <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                            <p className="text-base-content/50">Guarantee Period</p>
                            <p className="font-bold">{guaranteeDays} days</p>
                        </div>
                        <div>
                            <p className="text-base-content/50">Guarantee Expires</p>
                            <p className="font-bold">{guaranteeExpiresFormatted}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Notes */}
            <div className="mb-8">
                <MarkdownEditor
                    label="Additional Notes (Optional)"
                    value={notes}
                    onChange={setNotes}
                    placeholder="Add any notes about this hire..."
                    height={120}
                    preview="edit"
                    disabled={processing}
                />
            </div>

            {/* Acknowledge Checkbox */}
            <label
                className={`flex items-start gap-3 p-4 border cursor-pointer transition-all mb-6 ${
                    agreeTerms
                        ? "border-success bg-success/5"
                        : "border-base-300 bg-base-200"
                }`}
            >
                <input
                    type="checkbox"
                    className="checkbox checkbox-success mt-0.5"
                    checked={agreeTerms}
                    onChange={(e) => setAgreeTerms(e.target.checked)}
                    disabled={processing}
                />
                <span className="text-sm text-base-content/80">
                    I confirm this hire and understand that a placement record will be
                    created, fees will be calculated, and all parties will be notified.
                </span>
            </label>

            {error && (
                <div className="bg-error/10 border border-error/30 p-3 text-sm text-error mb-6">
                    <i className="fa-duotone fa-regular fa-triangle-exclamation mr-2" />
                    {error}
                </div>
            )}

            {/* Confirm Button */}
            <button
                onClick={onSubmit}
                className="btn btn-success w-full gap-2"
                style={{ borderRadius: 0 }}
                disabled={!canSubmit || processing}
            >
                {processing ? (
                    <>
                        <span className="loading loading-spinner loading-sm" />
                        Creating Placement...
                    </>
                ) : (
                    <>
                        <i className="fa-duotone fa-regular fa-check" />
                        Confirm Hire
                    </>
                )}
            </button>
        </div>
    );
}

/* ─── Sidebar ──────────────────────────────────────────────────────────── */

function HireSidebar({
    candidateName,
    recruiterName,
    recruiterEmail,
    recruiterUserId,
    jobTitle,
    companyName,
    placementFee,
    salaryNumber,
    guaranteeDays,
    guaranteeExpiresFormatted,
    currentStep,
    applicationId,
}: {
    candidateName: string;
    recruiterName: string;
    recruiterEmail: string;
    recruiterUserId: string;
    jobTitle: string;
    companyName: string;
    placementFee: number;
    salaryNumber: number;
    guaranteeDays: number;
    guaranteeExpiresFormatted: string;
    currentStep: number;
    applicationId: string;
}) {
    const { getToken } = useAuth();
    const chatSidebar = useChatSidebar();
    const toast = useToast();
    const [startingChat, setStartingChat] = useState(false);

    const handleMessage = async () => {
        try {
            setStartingChat(true);
            const conversationId = await startChatConversation(
                getToken,
                recruiterUserId,
                { application_id: applicationId },
            );
            chatSidebar.openToThread(conversationId, {
                otherUserName: recruiterName,
            });
        } catch (err: any) {
            console.error("Failed to start chat:", err);
            toast.error(err?.message || "Couldn't start conversation. Try again.");
        } finally {
            setStartingChat(false);
        }
    };

    return (
        <div className="space-y-6">
            {/* Placement Fee Hero */}
            <div className="bg-base-200 border-t-4 border-success p-6 text-center">
                <p className="text-sm font-semibold uppercase tracking-[0.2em] text-base-content/50 mb-2">
                    Placement Fee
                </p>
                <p className="text-4xl font-black text-success">
                    {salaryNumber > 0
                        ? `$${placementFee.toLocaleString()}`
                        : "$--"}
                </p>
                <div className="flex items-center justify-center gap-4 mt-3 text-sm text-base-content/50">
                    <span>
                        <i className="fa-duotone fa-regular fa-shield-check mr-1" />
                        {guaranteeDays} days
                    </span>
                    <span>
                        <i className="fa-duotone fa-regular fa-calendar mr-1" />
                        {guaranteeExpiresFormatted}
                    </span>
                </div>
            </div>

            {/* Recruiter Contact */}
            <div className="bg-base-200 border-t-4 border-secondary p-6">
                <h3 className="text-sm font-black uppercase tracking-wider mb-4">
                    Recruiter
                </h3>
                <div className="mb-3">
                    <p className="text-sm font-bold">{recruiterName}</p>
                    {recruiterEmail && (
                        <p className="text-sm text-base-content/50">{recruiterEmail}</p>
                    )}
                </div>
                {recruiterUserId && (
                    <button
                        onClick={handleMessage}
                        disabled={startingChat}
                        className="btn btn-secondary btn-sm w-full gap-2"
                        style={{ borderRadius: 0 }}
                    >
                        {startingChat ? (
                            <span className="loading loading-spinner loading-xs" />
                        ) : (
                            <i className="fa-duotone fa-regular fa-comment" />
                        )}
                        Message {recruiterName.split(" ")[0]}
                    </button>
                )}
            </div>

            {/* Job Summary */}
            <div className="bg-base-200 p-6">
                <h3 className="text-sm font-black uppercase tracking-wider mb-3">
                    Position
                </h3>
                <p className="text-sm font-bold">{jobTitle}</p>
                <p className="text-sm text-base-content/50">{companyName}</p>
                <p className="text-sm text-base-content/40 mt-1">
                    Candidate: {candidateName}
                </p>
            </div>

            {/* Progress */}
            <div className="bg-base-200 border-t-4 border-primary p-6">
                <h3 className="text-sm font-black uppercase tracking-wider mb-4">
                    Your Progress
                </h3>
                <div className="space-y-3">
                    {STEPS.map((step, i) => (
                        <div key={step.num} className="flex items-center gap-3">
                            <div
                                className={`w-6 h-6 flex items-center justify-center text-sm font-bold ${
                                    i < currentStep
                                        ? "bg-success text-success-content"
                                        : i === currentStep
                                          ? "bg-primary text-primary-content"
                                          : "bg-base-300 text-base-content/30"
                                }`}
                            >
                                {i < currentStep ? (
                                    <i className="fa-solid fa-check" />
                                ) : (
                                    step.num
                                )}
                            </div>
                            <span
                                className={`text-sm ${
                                    i <= currentStep
                                        ? "font-semibold text-base-content"
                                        : "text-base-content/40"
                                }`}
                            >
                                {step.label}
                            </span>
                        </div>
                    ))}
                </div>
                <div className="mt-4 pt-4 border-t border-base-300">
                    <div className="flex justify-between text-sm text-base-content/50 mb-1">
                        <span>Completion</span>
                        <span>{Math.round(((currentStep + 1) / STEPS.length) * 100)}%</span>
                    </div>
                    <div className="w-full h-1.5 bg-base-300">
                        <div
                            className="h-full bg-primary transition-all duration-500"
                            style={{ width: `${((currentStep + 1) / STEPS.length) * 100}%` }}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}
