"use client";

import type { Application } from "../../types";

export default function StepReviewCandidate({ application }: { application: Application }) {
    const candidate = application.candidate;
    const recruiter = application.recruiter;
    const aiReview = application.ai_review;
    const timeline = application.timeline || [];

    const recruiterName = recruiter?.user?.name || recruiter?.name;
    const recruiterEmail = recruiter?.user?.email || recruiter?.email;

    return (
        <div>
            <h2 className="text-2xl font-black tracking-tight mb-1">
                Review Candidate
            </h2>
            <p className="text-sm text-base-content/50 mb-8">
                Review the candidate details before configuring the offer.
            </p>

            {/* Candidate Card */}
            {candidate && (
                <div className="flex items-start gap-5 bg-base-200 p-6 mb-6">
                    <div className="w-14 h-14 bg-primary text-primary-content flex items-center justify-center flex-shrink-0">
                        <span className="text-lg font-black">
                            {candidate.full_name
                                ?.split(" ")
                                .map((w) => w[0])
                                .join("")
                                .slice(0, 2)
                                .toUpperCase()}
                        </span>
                    </div>
                    <div className="flex-1 min-w-0">
                        <h3 className="text-lg font-black">{candidate.full_name}</h3>
                        <p className="text-sm text-base-content/60">{candidate.email}</p>
                        {candidate.phone && (
                            <p className="text-sm text-base-content/50">{candidate.phone}</p>
                        )}
                    </div>
                </div>
            )}

            {/* Submitted By */}
            {recruiterName && (
                <div className="bg-base-200 p-4 border-l-4 border-secondary mb-6">
                    <p className="text-sm font-semibold uppercase tracking-[0.2em] text-base-content/50 mb-2">
                        Submitted By
                    </p>
                    <p className="text-sm font-bold">{recruiterName}</p>
                    {recruiterEmail && (
                        <p className="text-sm text-base-content/50">{recruiterEmail}</p>
                    )}
                </div>
            )}

            {/* AI Fit Analysis */}
            {aiReview && (
                <div className="bg-base-200 p-4 border-l-4 border-info mb-6">
                    <p className="text-sm font-semibold uppercase tracking-[0.2em] text-base-content/50 mb-2">
                        AI Fit Analysis
                    </p>
                    <div className="flex items-center gap-3">
                        <span className="text-2xl font-black text-primary">
                            {aiReview.fit_score}/100
                        </span>
                        <span className="badge badge-info capitalize">
                            {aiReview.recommendation?.replace(/_/g, " ") || "Reviewed"}
                        </span>
                    </div>
                    {aiReview.overall_summary && (
                        <p className="text-sm text-base-content/60 mt-2 leading-relaxed">
                            {aiReview.overall_summary}
                        </p>
                    )}
                </div>
            )}

            {/* Timeline Summary */}
            {timeline.length > 0 && (
                <div>
                    <h3 className="text-sm font-semibold uppercase tracking-[0.2em] text-base-content/50 mb-4">
                        Application Timeline
                    </h3>
                    <div className="space-y-3">
                        {timeline.slice(0, 8).map((entry: any, i: number) => (
                            <div
                                key={entry.id || i}
                                className="flex items-start gap-3 border-l-4 border-base-300 pl-4 py-1"
                            >
                                <i className="fa-duotone fa-regular fa-circle-dot text-base-content/30 mt-0.5" />
                                <div>
                                    <p className="text-sm font-semibold">
                                        {entry.note_type === "stage_transition"
                                            ? `Stage: ${entry.new_value?.stage || "Updated"}`
                                            : entry.note_type?.replace(/_/g, " ") || "Update"}
                                    </p>
                                    {entry.message_text && (
                                        <p className="text-sm text-base-content/50 line-clamp-2">
                                            {entry.message_text}
                                        </p>
                                    )}
                                    <p className="text-sm text-base-content/30">
                                        {new Date(entry.created_at).toLocaleDateString("en-US", {
                                            month: "short",
                                            day: "numeric",
                                            year: "numeric",
                                        })}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
