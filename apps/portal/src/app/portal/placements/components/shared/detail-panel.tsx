"use client";

import type { Placement } from "../../types";
import { statusColor } from "./status-color";
import {
    candidateName,
    jobTitle,
    companyName,
    formatDate,
    formatCurrency,
    formatStatus,
} from "./helpers";

export function DetailPanel({
    placement,
    onClose,
}: {
    placement: Placement;
    onClose?: () => void;
}) {
    const state = placement.state || "unknown";

    return (
        <div className="h-full overflow-y-auto">
            {/* Header */}
            <div className="sticky top-0 z-10 bg-base-100 border-b-2 border-base-300 px-6 py-4">
                <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                            <span
                                className={`text-[10px] uppercase tracking-[0.2em] font-bold px-2 py-1 ${statusColor(state)}`}
                            >
                                {formatStatus(state)}
                            </span>
                        </div>
                        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-primary mb-2">
                            {companyName(placement)}
                        </p>
                        <h2 className="text-2xl lg:text-3xl font-black leading-[0.95] tracking-tight mb-3">
                            {candidateName(placement)}
                        </h2>
                        <div className="flex flex-wrap gap-3 text-sm text-base-content/60">
                            <span>
                                <i className="fa-duotone fa-regular fa-briefcase mr-1" />
                                {jobTitle(placement)}
                            </span>
                            {placement.candidate?.email && (
                                <span>
                                    <i className="fa-duotone fa-regular fa-envelope mr-1" />
                                    {placement.candidate.email}
                                </span>
                            )}
                        </div>
                    </div>
                    {onClose && (
                        <button
                            onClick={onClose}
                            className="btn btn-sm btn-square btn-ghost"
                        >
                            <i className="fa-duotone fa-regular fa-xmark text-lg" />
                        </button>
                    )}
                </div>
            </div>

            {/* Content */}
            <div className="p-6 space-y-8">
                {/* Financial stats grid */}
                <div className="grid grid-cols-3 gap-[2px] bg-base-300">
                    <div className="bg-base-100 p-4">
                        <p className="text-[10px] uppercase tracking-[0.2em] text-base-content/40 mb-1">
                            Salary
                        </p>
                        <p className="text-lg font-black tracking-tight">
                            {formatCurrency(placement.salary || 0)}
                        </p>
                    </div>
                    <div className="bg-base-100 p-4">
                        <p className="text-[10px] uppercase tracking-[0.2em] text-base-content/40 mb-1">
                            Fee Rate
                        </p>
                        <p className="text-lg font-black tracking-tight">
                            {placement.fee_percentage || 0}%
                        </p>
                    </div>
                    <div className="bg-base-100 p-4">
                        <p className="text-[10px] uppercase tracking-[0.2em] text-base-content/40 mb-1">
                            Your Share
                        </p>
                        <p className="text-lg font-black tracking-tight text-primary">
                            {formatCurrency(placement.recruiter_share || 0)}
                        </p>
                    </div>
                </div>

                {/* Dates */}
                <div>
                    <h3 className="text-sm font-semibold uppercase tracking-[0.2em] text-base-content/40 mb-3">
                        Key Dates
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-[2px] bg-base-300">
                        <div className="bg-base-100 p-4">
                            <p className="text-[10px] uppercase tracking-[0.2em] text-base-content/40 mb-1">
                                Hired
                            </p>
                            <p className="font-bold text-sm">
                                {formatDate(placement.hired_at)}
                            </p>
                        </div>
                        {placement.start_date && (
                            <div className="bg-base-100 p-4">
                                <p className="text-[10px] uppercase tracking-[0.2em] text-base-content/40 mb-1">
                                    Start Date
                                </p>
                                <p className="font-bold text-sm">
                                    {formatDate(placement.start_date)}
                                </p>
                            </div>
                        )}
                        {placement.end_date && (
                            <div className="bg-base-100 p-4">
                                <p className="text-[10px] uppercase tracking-[0.2em] text-base-content/40 mb-1">
                                    End Date
                                </p>
                                <p className="font-bold text-sm">
                                    {formatDate(placement.end_date)}
                                </p>
                            </div>
                        )}
                        {placement.guarantee_expires_at && (
                            <div className="bg-base-100 p-4">
                                <p className="text-[10px] uppercase tracking-[0.2em] text-base-content/40 mb-1">
                                    Guarantee Expires
                                </p>
                                <p className="font-bold text-sm">
                                    {formatDate(placement.guarantee_expires_at)}
                                </p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Guarantee Period */}
                {placement.guarantee_days !== undefined &&
                    placement.guarantee_days !== null && (
                        <div>
                            <h3 className="text-sm font-semibold uppercase tracking-[0.2em] text-base-content/40 mb-3">
                                Guarantee Period
                            </h3>
                            <div className="bg-primary/5 p-4">
                                <p className="text-[10px] uppercase tracking-[0.2em] text-primary/60 mb-1">
                                    Duration
                                </p>
                                <p className="text-base font-bold text-primary">
                                    {placement.guarantee_days} days
                                </p>
                            </div>
                        </div>
                    )}

                {/* Collaborators / Splits */}
                {placement.your_splits && placement.your_splits.length > 0 && (
                    <div>
                        <h3 className="text-sm font-semibold uppercase tracking-[0.2em] text-base-content/40 mb-3">
                            Your Splits
                        </h3>
                        <ul className="space-y-2">
                            {placement.your_splits.map((split, i) => (
                                <li
                                    key={i}
                                    className="flex items-center justify-between text-base-content/70 border-b border-base-200 pb-2"
                                >
                                    <span className="flex items-center gap-2">
                                        <i className="fa-duotone fa-regular fa-circle-check text-primary text-xs" />
                                        <span className="text-sm font-semibold capitalize">
                                            {split.role}
                                        </span>
                                    </span>
                                    <span className="text-sm font-bold">
                                        {split.split_percentage}% &middot;{" "}
                                        {formatCurrency(split.split_amount)}
                                    </span>
                                </li>
                            ))}
                        </ul>
                    </div>
                )}

                {/* Collaborators */}
                {placement.collaborators &&
                    placement.collaborators.length > 0 && (
                        <div>
                            <h3 className="text-sm font-semibold uppercase tracking-[0.2em] text-base-content/40 mb-3">
                                Collaborators
                            </h3>
                            <ul className="space-y-2">
                                {placement.collaborators.map((collab) => (
                                    <li
                                        key={collab.id}
                                        className="flex items-center justify-between text-base-content/70 border-b border-base-200 pb-2"
                                    >
                                        <span className="flex items-center gap-2">
                                            <i className="fa-duotone fa-regular fa-user text-secondary text-xs" />
                                            <span className="text-sm font-semibold capitalize">
                                                {collab.role}
                                            </span>
                                        </span>
                                        <span className="text-sm font-bold">
                                            {collab.split_percentage}% &middot;{" "}
                                            {formatCurrency(
                                                collab.split_amount,
                                            )}
                                        </span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}

                {/* Failed info */}
                {state === "failed" && placement.failed_at && (
                    <div className="border-t-2 border-base-300 pt-6">
                        <h3 className="text-sm font-semibold uppercase tracking-[0.2em] text-error mb-3">
                            Placement Failed
                        </h3>
                        <p className="text-sm text-base-content/60">
                            Failed on {formatDate(placement.failed_at)}
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}
