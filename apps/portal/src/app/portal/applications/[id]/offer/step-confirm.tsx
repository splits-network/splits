"use client";

import type { Application } from "../../types";

interface StepConfirmProps {
    application: Application;
    salary: string;
    startDate: string;
    feePercentage: number | null;
    agreeTerms: boolean;
    setAgreeTerms: (v: boolean) => void;
    processing: boolean;
    error: string | null;
    onSubmit: () => void;
}

export default function StepConfirm({
    application,
    salary,
    startDate,
    feePercentage,
    agreeTerms,
    setAgreeTerms,
    processing,
    error,
    onSubmit,
}: StepConfirmProps) {
    const candidateName = application.candidate?.full_name || "Candidate";
    const jobTitle = application.job?.title || "Position";
    const companyName = application.job?.company?.name || "Company";
    const parsedSalary = parseFloat(salary) || 0;
    const placementFee =
        feePercentage != null ? Math.round((parsedSalary * feePercentage) / 100) : null;

    const formatCurrency = (amount: number) =>
        new Intl.NumberFormat("en-US", {
            style: "currency",
            currency: "USD",
            maximumFractionDigits: 0,
        }).format(amount);

    const formattedStartDate = startDate
        ? new Date(startDate).toLocaleDateString("en-US", {
              month: "long",
              day: "numeric",
              year: "numeric",
          })
        : "Not set";

    return (
        <div>
            <h2 className="text-2xl font-black tracking-tight mb-1">
                Confirm & Extend Offer
            </h2>
            <p className="text-sm text-base-content/50 mb-8">
                Review the offer summary and confirm to extend the formal offer.
            </p>

            {/* Summary Card */}
            <div className="bg-base-200 p-6 mb-6">
                <h3 className="text-sm font-semibold uppercase tracking-[0.2em] text-base-content/50 mb-4">
                    Offer Summary
                </h3>
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <p className="text-sm text-base-content/50">Candidate</p>
                        <p className="font-semibold">{candidateName}</p>
                    </div>
                    <div>
                        <p className="text-sm text-base-content/50">Position</p>
                        <p className="font-semibold">{jobTitle}</p>
                    </div>
                    <div>
                        <p className="text-sm text-base-content/50">Company</p>
                        <p className="font-semibold">{companyName}</p>
                    </div>
                    <div>
                        <p className="text-sm text-base-content/50">Annual Salary</p>
                        <p className="font-semibold text-primary">
                            {formatCurrency(parsedSalary)}
                        </p>
                    </div>
                    <div>
                        <p className="text-sm text-base-content/50">Start Date</p>
                        <p className="font-semibold">{formattedStartDate}</p>
                    </div>
                    {placementFee != null && (
                        <div>
                            <p className="text-sm text-base-content/50">Estimated Fee</p>
                            <p className="font-semibold">{formatCurrency(placementFee)}</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Acknowledge Checkbox */}
            <label
                className={`flex items-start gap-3 p-4 border cursor-pointer transition-all mb-6 ${
                    agreeTerms
                        ? "border-primary bg-primary/5"
                        : "border-base-300 bg-base-200"
                }`}
            >
                <input
                    type="checkbox"
                    className="checkbox checkbox-primary mt-0.5"
                    checked={agreeTerms}
                    onChange={(e) => setAgreeTerms(e.target.checked)}
                />
                <span className="text-sm text-base-content/80">
                    I understand that extending this offer will notify the candidate and
                    recruiter, and creates a formal commitment to this hiring process.
                </span>
            </label>

            {error && (
                <div className="bg-error/10 border border-error/30 p-3 text-sm text-error mb-6">
                    {error}
                </div>
            )}

            {/* Submit Button */}
            <button
                onClick={onSubmit}
                className="btn btn-success w-full gap-2"
                style={{ borderRadius: 0 }}
                disabled={!agreeTerms || processing}
            >
                {processing ? (
                    <>
                        <span className="loading loading-spinner loading-sm" />
                        Extending Offer...
                    </>
                ) : (
                    <>
                        <i className="fa-duotone fa-regular fa-check-circle" />
                        Extend Formal Offer
                    </>
                )}
            </button>
        </div>
    );
}
