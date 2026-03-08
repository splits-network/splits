'use client';

import { useCallback } from 'react';
import { InterviewRecordingCard } from './interview-recording-card';

type InterviewStatus = 'scheduled' | 'in_progress' | 'completed' | 'cancelled' | 'no_show';

interface JoinInterviewButtonProps {
    interviewId: string;
    scheduledAt: string;
    status: InterviewStatus;
    recordingStatus?: string;
    recordingStartedAt?: string;
    recordingDurationSeconds?: number;
    participantNames?: string[];
}

function formatScheduledTime(isoString: string): string {
    const date = new Date(isoString);
    return date.toLocaleString(undefined, {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
    });
}

export function JoinInterviewButton({
    interviewId,
    scheduledAt,
    status,
    recordingStatus,
    recordingStartedAt,
    recordingDurationSeconds,
    participantNames,
}: JoinInterviewButtonProps) {
    const isJoinable = status === 'scheduled' || status === 'in_progress';

    const isPast = new Date(scheduledAt) < new Date();
    const buttonLabel = isPast && status === 'scheduled' ? 'Start Interview' : 'Join Interview';

    const handleClick = useCallback(() => {
        window.open(
            `/portal/interview/${interviewId}`,
            `interview-${interviewId}`,
            'noopener',
        );
    }, [interviewId]);

    // Show recording card for completed interviews with recording data
    if (
        status === 'completed' &&
        recordingStatus &&
        (recordingStatus === 'ready' || recordingStatus === 'processing') &&
        recordingStartedAt
    ) {
        return (
            <InterviewRecordingCard
                interviewId={interviewId}
                scheduledAt={scheduledAt}
                recordingStartedAt={recordingStartedAt}
                durationSeconds={recordingDurationSeconds ?? null}
                participantNames={participantNames ?? []}
                recordingStatus={recordingStatus}
            />
        );
    }

    if (!isJoinable) return null;

    return (
        <div className="flex items-center gap-3">
            <button
                type="button"
                className="btn btn-primary gap-2"
                onClick={handleClick}
            >
                <i className="fa-duotone fa-regular fa-video" />
                {buttonLabel}
            </button>
            <span className="text-sm text-base-content/60">
                <i className="fa-duotone fa-regular fa-calendar-clock mr-1" />
                {formatScheduledTime(scheduledAt)}
            </span>
        </div>
    );
}
