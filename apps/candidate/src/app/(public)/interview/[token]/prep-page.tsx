'use client';

import { useState, useEffect, useCallback } from 'react';
import type { InterviewContext } from '@splits-network/shared-video';
import { RescheduleRequestForm } from './components/reschedule-request-form';

interface PrepPageProps {
    interviewContext: InterviewContext;
    magicToken: string;
    onReady: () => void;
}

interface AvailableSlotsResponse {
    slots: Array<{ start: string; end: string }>;
    timezone: string;
    reschedule_count: number;
    has_pending_request: boolean;
}

const API_BASE =
    process.env.NEXT_PUBLIC_API_GATEWAY_URL || 'http://localhost:3000';

const MAX_RESCHEDULES = 2;

/** Minutes before scheduled time when lobby becomes available */
const EARLY_ACCESS_MINUTES = 10;

function formatScheduledDate(isoString: string): string {
    const date = new Date(isoString);
    return date.toLocaleDateString(undefined, {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    });
}

function formatScheduledTime(isoString: string): string {
    const date = new Date(isoString);
    return date.toLocaleTimeString(undefined, {
        hour: 'numeric',
        minute: '2-digit',
        timeZoneName: 'short',
    });
}

function formatInterviewType(type: string): string {
    return type
        .replace(/_/g, ' ')
        .replace(/\b\w/g, (c) => c.toUpperCase());
}

function getCountdownText(ms: number): string {
    if (ms <= 0) return '';

    const totalSeconds = Math.floor(ms / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    if (hours > 0) {
        return `${hours} hour${hours !== 1 ? 's' : ''}, ${minutes} minute${minutes !== 1 ? 's' : ''}`;
    }
    if (minutes > 0) {
        return `${minutes} minute${minutes !== 1 ? 's' : ''}, ${seconds} second${seconds !== 1 ? 's' : ''}`;
    }
    return `${seconds} second${seconds !== 1 ? 's' : ''}`;
}

const TIPS = [
    'Test your microphone and camera',
    'Find a quiet, well-lit space',
    'Have your resume ready',
    'Close unnecessary browser tabs',
    'Use a wired internet connection if possible',
];

export function PrepPage({ interviewContext, magicToken, onReady }: PrepPageProps) {
    const [now, setNow] = useState(() => Date.now());
    const [rescheduleOpen, setRescheduleOpen] = useState(false);
    const [slotsData, setSlotsData] = useState<AvailableSlotsResponse | null>(null);
    const [slotsLoading, setSlotsLoading] = useState(false);
    const [rescheduleSubmitted, setRescheduleSubmitted] = useState(false);

    useEffect(() => {
        const interval = setInterval(() => setNow(Date.now()), 1000);
        return () => clearInterval(interval);
    }, []);

    const fetchAvailableSlots = useCallback(async () => {
        if (slotsData || slotsLoading) return;
        setSlotsLoading(true);
        try {
            const res = await fetch(
                `${API_BASE}/api/v2/interviews/${interviewContext.id}/available-slots?token=${encodeURIComponent(magicToken)}`,
            );
            if (res.ok) {
                const json = await res.json();
                setSlotsData(json.data);
            }
        } catch {
            // Silently fail — reschedule is optional
        } finally {
            setSlotsLoading(false);
        }
    }, [interviewContext.id, magicToken, slotsData, slotsLoading]);

    const handleRescheduleToggle = () => {
        if (!rescheduleOpen) {
            fetchAvailableSlots();
        }
        setRescheduleOpen(!rescheduleOpen);
    };

    const scheduledAt = new Date(interviewContext.scheduled_at).getTime();
    const msUntilStart = scheduledAt - now;
    const lobbyOpensAt = scheduledAt - EARLY_ACCESS_MINUTES * 60 * 1000;
    const canEnterLobby = now >= lobbyOpensAt;

    const interviewer = interviewContext.participants.find(
        (p) => p.role === 'interviewer',
    );

    const { job } = interviewContext;

    return (
        <div className="min-h-screen bg-base-100 flex items-center justify-center p-6">
            <div className="max-w-2xl mx-auto w-full space-y-8">
                {/* Header */}
                <div className="text-center space-y-2">
                    <p className="text-sm font-bold tracking-[0.2em]">
                        SPLITS NETWORK
                    </p>
                    <p className="text-sm font-semibold uppercase tracking-[0.2em] text-primary mt-4">
                        YOUR UPCOMING INTERVIEW
                    </p>
                </div>

                {/* Interview details card */}
                <div className="border-l-4 border-primary bg-base-200 p-6 space-y-3">
                    <h1 className="text-2xl font-black text-base-content">
                        {job.title}
                    </h1>
                    <p className="text-lg text-base-content/70">
                        {job.company_name}
                    </p>
                    <div className="flex flex-wrap items-center gap-3">
                        <span className="badge badge-primary">
                            {formatInterviewType(interviewContext.interview_type)}
                        </span>
                    </div>
                    <div className="flex items-center gap-2 text-base text-base-content/70">
                        <i className="fa-duotone fa-regular fa-calendar-clock" />
                        <span>
                            {formatScheduledDate(interviewContext.scheduled_at)} at{' '}
                            {formatScheduledTime(interviewContext.scheduled_at)}
                        </span>
                    </div>
                    <div className="flex items-center gap-2 text-base text-base-content/70">
                        <i className="fa-duotone fa-regular fa-clock" />
                        <span>
                            Estimated {interviewContext.scheduled_duration_minutes} minutes
                        </span>
                    </div>
                </div>

                {/* Interviewer info */}
                {interviewer && (
                    <div className="flex items-center gap-4">
                        <div className="avatar">
                            <div className="w-12 rounded-full">
                                {interviewer.avatar_url ? (
                                    <img
                                        src={interviewer.avatar_url}
                                        alt={interviewer.name}
                                    />
                                ) : (
                                    <div className="bg-secondary text-secondary-content flex items-center justify-center w-12 h-12 rounded-full font-bold">
                                        {interviewer.name.charAt(0).toUpperCase()}
                                    </div>
                                )}
                            </div>
                        </div>
                        <div>
                            <p className="text-base text-base-content/60">
                                You'll be meeting with
                            </p>
                            <p className="text-lg font-semibold text-base-content">
                                {interviewer.name}
                            </p>
                        </div>
                    </div>
                )}

                {/* Tips checklist */}
                <div className="space-y-3">
                    <h2 className="text-sm font-semibold uppercase tracking-[0.15em] text-base-content/60">
                        Preparation Tips
                    </h2>
                    <ul className="space-y-2">
                        {TIPS.map((tip) => (
                            <li key={tip} className="flex items-center gap-3 text-base text-base-content">
                                <i className="fa-duotone fa-regular fa-check-circle text-success" />
                                <span>{tip}</span>
                            </li>
                        ))}
                    </ul>
                </div>

                {/* Countdown timer */}
                {msUntilStart > 0 ? (
                    <div className="text-center py-4">
                        <p className="text-sm text-base-content/60">
                            Interview starts in
                        </p>
                        <p className="text-xl font-bold text-base-content mt-1">
                            {getCountdownText(msUntilStart)}
                        </p>
                    </div>
                ) : (
                    <div className="text-center py-4">
                        <p className="text-lg font-semibold text-success">
                            <i className="fa-duotone fa-regular fa-circle-check mr-2" />
                            Ready to join
                        </p>
                    </div>
                )}

                {/* Reschedule section */}
                {interviewContext.status === 'scheduled' &&
                    interviewContext.reschedule_count < MAX_RESCHEDULES &&
                    !rescheduleSubmitted && (
                        <div className="border border-base-300 bg-base-200">
                            <button
                                type="button"
                                className="w-full flex items-center justify-between p-4 text-left"
                                onClick={handleRescheduleToggle}
                            >
                                <span className="text-sm font-semibold text-base-content/70">
                                    <i className="fa-duotone fa-regular fa-calendar-xmark mr-2" />
                                    Need to reschedule?
                                </span>
                                <i
                                    className={`fa-duotone fa-regular fa-chevron-${rescheduleOpen ? 'up' : 'down'} text-base-content/40`}
                                />
                            </button>
                            {rescheduleOpen && (
                                <div className="px-4 pb-4">
                                    {slotsLoading ? (
                                        <div className="flex items-center justify-center py-6">
                                            <span className="loading loading-spinner loading-md text-primary" />
                                            <span className="ml-2 text-sm text-base-content/60">
                                                Loading available times...
                                            </span>
                                        </div>
                                    ) : slotsData ? (
                                        <RescheduleRequestForm
                                            interviewId={interviewContext.id}
                                            token={magicToken}
                                            availableSlots={slotsData.slots}
                                            candidateTimezone={
                                                Intl.DateTimeFormat().resolvedOptions().timeZone
                                            }
                                            rescheduleCount={slotsData.reschedule_count}
                                            maxReschedules={MAX_RESCHEDULES}
                                            hasPendingRequest={slotsData.has_pending_request}
                                            onSuccess={() => setRescheduleSubmitted(true)}
                                        />
                                    ) : (
                                        <p className="text-sm text-base-content/60 py-4">
                                            Unable to load available times. Please try again later.
                                        </p>
                                    )}
                                </div>
                            )}
                        </div>
                    )}

                {/* Show if reschedule just submitted */}
                {rescheduleSubmitted && (
                    <div className="alert alert-success">
                        <i className="fa-duotone fa-regular fa-circle-check" />
                        <span className="text-sm">
                            Reschedule request sent. The interviewer will review your proposed times.
                        </span>
                    </div>
                )}

                {/* Enter Lobby button */}
                <div className="text-center">
                    {canEnterLobby ? (
                        <button
                            type="button"
                            className="btn btn-primary btn-lg"
                            onClick={onReady}
                        >
                            <i className="fa-duotone fa-regular fa-video mr-2" />
                            Enter Lobby
                        </button>
                    ) : (
                        <div className="tooltip" data-tip="Lobby opens 10 minutes before scheduled time">
                            <button
                                type="button"
                                className="btn btn-primary btn-lg btn-disabled"
                                disabled
                            >
                                <i className="fa-duotone fa-regular fa-video mr-2" />
                                Enter Lobby
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
