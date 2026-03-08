"use client";

import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@clerk/nextjs";
import { createAuthenticatedClient } from "@/lib/api-client";

/* ─── Types (mirrors InterviewWithFullContext from video-service) ──── */

interface InterviewParticipantWithUser {
    id: string;
    interview_id: string;
    user_id: string;
    role: "interviewer" | "candidate" | "observer";
    name: string;
    avatar_url: string | null;
    joined_at: string | null;
    left_at: string | null;
    created_at: string;
}

interface InterviewWithFullContext {
    id: string;
    application_id: string;
    status: string;
    interview_type: string;
    title: string | null;
    round_name: string | null;
    round_number: number;
    scheduled_at: string;
    scheduled_duration_minutes: number;
    actual_start_at: string | null;
    actual_end_at: string | null;
    recording_enabled: boolean;
    has_recording: boolean;
    has_transcript: boolean;
    has_summary: boolean;
    transcript_status: string | null;
    cancellation_reason: string | null;
    participants: InterviewParticipantWithUser[];
    job: {
        id: string;
        title: string;
        company_name: string;
    };
}

/* ─── Status badge mapping ─────────────────────────────────────────── */

const STATUS_CONFIG: Record<string, { color: string; label: string }> = {
    scheduled: { color: "info", label: "Scheduled" },
    in_progress: { color: "warning", label: "In Progress" },
    completed: { color: "success", label: "Completed" },
    cancelled: { color: "error", label: "Cancelled" },
    no_show: { color: "neutral", label: "No Show" },
    expired: { color: "neutral", label: "Expired" },
};

/* ─── Component ────────────────────────────────────────────────────── */

interface InterviewsTabProps {
    applicationId: string;
}

export function ApplicationInterviewsTab({ applicationId }: InterviewsTabProps) {
    const { getToken } = useAuth();
    const [interviews, setInterviews] = useState<InterviewWithFullContext[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const fetchInterviews = useCallback(async () => {
        try {
            const token = await getToken();
            if (!token) throw new Error("Not authenticated");
            const client = createAuthenticatedClient(token);
            const res = await client.get(
                `/interviews?application_id=${applicationId}&include_context=true`,
            );
            setInterviews(res.data || []);
        } catch (err: any) {
            setError(err.message || "Failed to load interviews");
        } finally {
            setLoading(false);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [applicationId]);

    useEffect(() => {
        fetchInterviews();
    }, [fetchInterviews]);

    if (loading) {
        return (
            <div className="flex items-center justify-center py-16">
                <span className="loading loading-spinner loading-md" />
            </div>
        );
    }

    if (error) {
        return (
            <div className="text-center p-8 text-error">
                <i className="fa-duotone fa-regular fa-triangle-exclamation text-4xl mb-2 block" />
                <p>{error}</p>
            </div>
        );
    }

    if (interviews.length === 0) {
        return (
            <div className="text-center p-8 text-base-content/50">
                <i className="fa-duotone fa-regular fa-video text-4xl mb-2 block" />
                <p>No interviews scheduled</p>
            </div>
        );
    }

    // Sort chronologically (earliest first)
    const sorted = [...interviews].sort(
        (a, b) => new Date(a.scheduled_at).getTime() - new Date(b.scheduled_at).getTime(),
    );

    // Find the most recent upcoming or in-progress interview
    const now = Date.now();
    const upcomingIndex = sorted.findIndex(
        (iv) =>
            iv.status === "scheduled" ||
            iv.status === "in_progress" ||
            new Date(iv.scheduled_at).getTime() > now,
    );

    return (
        <div className="relative pl-6">
            {/* Timeline line */}
            <div className="absolute left-4 top-0 bottom-0 border-l-2 border-base-300" />

            <div className="space-y-4">
                {sorted.map((interview, idx) => (
                    <InterviewCard
                        key={interview.id}
                        interview={interview}
                        isHighlighted={idx === upcomingIndex}
                    />
                ))}
            </div>
        </div>
    );
}

/* ─── Interview Card ───────────────────────────────────────────────── */

function InterviewCard({
    interview,
    isHighlighted,
}: {
    interview: InterviewWithFullContext;
    isHighlighted: boolean;
}) {
    const status = STATUS_CONFIG[interview.status] || STATUS_CONFIG.scheduled;
    const isCancelled = interview.status === "cancelled";
    const isCompleted = interview.status === "completed";

    const roundLabel = interview.round_name
        ? `Round ${interview.round_number}: ${interview.round_name}`
        : `Round ${interview.round_number}`;

    const scheduledDate = new Date(interview.scheduled_at);
    const formattedDate = scheduledDate.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
    });
    const formattedTime = scheduledDate.toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
    });

    return (
        <div
            className={`relative bg-base-100 border border-base-300 p-4 ${
                isHighlighted ? "border-l-4 border-l-primary" : ""
            } ${isCancelled ? "opacity-60" : ""}`}
        >
            {/* Timeline dot */}
            <div
                className={`absolute -left-[1.65rem] top-5 w-3 h-3 border-2 ${
                    isHighlighted
                        ? "bg-primary border-primary"
                        : "bg-base-100 border-base-300"
                }`}
                style={{ borderRadius: "50%" }}
            />

            {/* Header: round label + status badge */}
            <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-bold">{roundLabel}</h3>
                <span className={`badge badge-${status.color} badge-sm`}>
                    {status.label}
                </span>
            </div>

            {/* Date/time + duration */}
            <div className="flex items-center gap-3 text-sm text-base-content/60 mb-3">
                <span className="flex items-center gap-1.5">
                    <i className="fa-duotone fa-regular fa-calendar text-sm" />
                    {formattedDate} at {formattedTime}
                </span>
                <span className="flex items-center gap-1.5">
                    <i className="fa-duotone fa-regular fa-clock text-sm" />
                    {interview.scheduled_duration_minutes} min
                </span>
            </div>

            {/* Participants */}
            {interview.participants.length > 0 && (
                <div className="flex items-center gap-1 mb-3">
                    {interview.participants.map((p) => (
                        <div
                            key={p.id}
                            className={`tooltip tooltip-bottom`}
                            data-tip={`${p.name} (${p.role})`}
                        >
                            <div
                                className={`w-7 h-7 flex items-center justify-center text-sm font-bold bg-base-200 border ${
                                    p.role === "candidate"
                                        ? "border-accent"
                                        : "border-base-300"
                                }`}
                                style={{ borderRadius: "50%" }}
                            >
                                {p.avatar_url ? (
                                    <img
                                        src={p.avatar_url}
                                        alt={p.name}
                                        className="w-full h-full object-cover"
                                        style={{ borderRadius: "50%" }}
                                    />
                                ) : (
                                    <span className="text-sm">
                                        {p.name.charAt(0).toUpperCase()}
                                    </span>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Assets row (completed interviews only) */}
            {isCompleted && (
                <div className="flex items-center gap-4 text-sm">
                    <AssetIndicator
                        icon="fa-circle-play"
                        label="Recording"
                        available={interview.has_recording}
                    />
                    <AssetIndicator
                        icon="fa-file-lines"
                        label="Transcript"
                        available={interview.has_transcript}
                    />
                    <AssetIndicator
                        icon="fa-brain"
                        label="AI Summary"
                        available={interview.has_summary}
                    />
                </div>
            )}

            {/* Interview type badge */}
            <div className="mt-2">
                <span className="text-sm text-base-content/40 capitalize">
                    {interview.interview_type.replace("_", " ")}
                </span>
            </div>
        </div>
    );
}

/* ─── Asset Indicator ──────────────────────────────────────────────── */

function AssetIndicator({
    icon,
    label,
    available,
}: {
    icon: string;
    label: string;
    available: boolean;
}) {
    return (
        <span
            className={`flex items-center gap-1.5 ${
                available ? "text-primary" : "text-base-content/20"
            }`}
        >
            <i className={`fa-duotone fa-regular ${icon}`} />
            <span className="text-sm">{label}</span>
        </span>
    );
}
