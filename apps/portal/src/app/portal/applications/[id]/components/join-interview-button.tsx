'use client';

import { useCallback } from 'react';

type InterviewStatus = 'scheduled' | 'in_progress' | 'completed' | 'cancelled' | 'no_show';

interface JoinInterviewButtonProps {
    interviewId: string;
    scheduledAt: string;
    status: InterviewStatus;
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
