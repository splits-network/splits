'use client';

import { useState, useEffect } from 'react';

interface InterviewCountdownProps {
    scheduledAt: string;
    interviewId: string;
    actionUrl?: string;
}

function getCountdownInfo(scheduledAt: string): {
    text: string;
    urgent: boolean;
    past: boolean;
    showJoinButton: boolean;
} {
    const now = Date.now();
    const scheduled = new Date(scheduledAt).getTime();
    const diffMs = scheduled - now;
    const diffMinutes = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);

    if (diffMs < 0) {
        const minutesAgo = Math.abs(diffMinutes);
        if (minutesAgo < 60) {
            return {
                text: minutesAgo <= 1 ? 'Interview started' : `Interview was ${minutesAgo} minutes ago`,
                urgent: false,
                past: true,
                showJoinButton: minutesAgo < 30,
            };
        }
        return {
            text: 'Interview has passed',
            urgent: false,
            past: true,
            showJoinButton: false,
        };
    }

    if (diffMinutes < 10) {
        return {
            text: 'Interview starting now',
            urgent: true,
            past: false,
            showJoinButton: true,
        };
    }

    if (diffMinutes < 60) {
        return {
            text: `Interview in ${diffMinutes} minutes`,
            urgent: false,
            past: false,
            showJoinButton: diffMinutes <= 10,
        };
    }

    if (diffHours === 1) {
        return {
            text: 'Interview in 1 hour',
            urgent: false,
            past: false,
            showJoinButton: false,
        };
    }

    return {
        text: `Interview in ${diffHours} hours`,
        urgent: false,
        past: false,
        showJoinButton: false,
    };
}

export function InterviewCountdown({
    scheduledAt,
    interviewId,
    actionUrl,
}: InterviewCountdownProps) {
    const [info, setInfo] = useState(() => getCountdownInfo(scheduledAt));

    useEffect(() => {
        setInfo(getCountdownInfo(scheduledAt));

        const interval = setInterval(() => {
            setInfo(getCountdownInfo(scheduledAt));
        }, 60_000);

        return () => clearInterval(interval);
    }, [scheduledAt]);

    const joinUrl = actionUrl || `/portal/interview/${interviewId}`;

    return (
        <div className="flex items-center gap-2 flex-wrap">
            <span
                className={`text-sm ${
                    info.urgent
                        ? 'text-error font-bold'
                        : info.past
                          ? 'text-base-content/50'
                          : 'text-base-content/70'
                }`}
            >
                <i className="fa-duotone fa-regular fa-clock mr-1" />
                {info.text}
            </span>
            {info.showJoinButton && (
                <a
                    href={joinUrl}
                    className="btn btn-primary btn-sm"
                >
                    <i className="fa-duotone fa-regular fa-video mr-1" />
                    Join Now
                </a>
            )}
        </div>
    );
}
