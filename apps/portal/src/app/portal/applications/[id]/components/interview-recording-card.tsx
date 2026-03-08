'use client';

import { useState, useCallback } from 'react';
import { useAuth } from '@clerk/nextjs';
import { createAuthenticatedClient } from '@/lib/api-client';
import { InterviewRecordingPlayer } from './interview-recording-player';

interface InterviewRecordingCardProps {
    interviewId: string;
    scheduledAt: string;
    recordingStartedAt: string;
    durationSeconds: number | null;
    participantNames: string[];
    recordingStatus: string;
}

function formatDuration(seconds: number): string {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}m ${s}s`;
}

function formatDate(iso: string): string {
    return new Date(iso).toLocaleString(undefined, {
        weekday: 'short', month: 'short', day: 'numeric',
        hour: 'numeric', minute: '2-digit',
    });
}

export function InterviewRecordingCard({
    interviewId, scheduledAt, recordingStartedAt,
    durationSeconds, participantNames, recordingStatus,
}: InterviewRecordingCardProps) {
    const [showPlayer, setShowPlayer] = useState(false);
    const [downloading, setDownloading] = useState(false);
    const { getToken } = useAuth();

    const daysRemaining = Math.ceil(
        (new Date(recordingStartedAt).getTime() + 90 * 24 * 60 * 60 * 1000 - Date.now())
        / (24 * 60 * 60 * 1000),
    );

    const handleDownload = useCallback(async () => {
        try {
            setDownloading(true);
            const token = await getToken();
            if (!token) return;
            const client = createAuthenticatedClient(token);
            const res = await client.get(`/interviews/${interviewId}/recording/download-url`);
            if (res.data?.url) {
                window.open(res.data.url, '_blank');
            }
        } catch {
            // silent fail -- user can retry
        } finally {
            setDownloading(false);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [interviewId]);

    const isProcessing = recordingStatus === 'processing';
    const isFailed = recordingStatus === 'failed';
    const isReady = recordingStatus === 'ready';

    return (
        <>
            <div className="flex items-center gap-4 border-l-4 border-error bg-base-200 p-4">
                <i className="fa-duotone fa-regular fa-video text-error text-lg" />
                <div className="flex-1 min-w-0">
                    <p className="text-sm font-black">Interview Recording</p>
                    <p className="text-sm text-base-content/60">{formatDate(scheduledAt)}</p>
                    {durationSeconds != null && (
                        <p className="text-sm text-base-content/60">{formatDuration(durationSeconds)}</p>
                    )}
                    {participantNames.length > 0 && (
                        <p className="text-sm text-base-content/50">{participantNames.join(', ')}</p>
                    )}
                    {isReady && daysRemaining <= 7 && daysRemaining > 0 && (
                        <span className="badge badge-warning badge-sm gap-1 mt-1">
                            <i className="fa-duotone fa-regular fa-triangle-exclamation" />
                            Expires in {daysRemaining} day{daysRemaining !== 1 ? 's' : ''}
                        </span>
                    )}
                    {isReady && daysRemaining <= 0 && (
                        <span className="badge badge-error badge-sm mt-1">Expired</span>
                    )}
                    {isFailed && (
                        <p className="text-sm text-error mt-1">Recording failed</p>
                    )}
                </div>
                <div className="flex items-center gap-2">
                    {isProcessing && (
                        <span className="flex items-center gap-2 text-sm text-base-content/60">
                            <span className="loading loading-spinner loading-sm" />
                            Processing...
                        </span>
                    )}
                    {isReady && (
                        <>
                            <button
                                type="button"
                                className="btn btn-primary btn-sm gap-2"
                                onClick={() => setShowPlayer(true)}
                            >
                                <i className="fa-duotone fa-regular fa-play" />
                                Play
                            </button>
                            <button
                                type="button"
                                className="btn btn-ghost btn-sm"
                                onClick={handleDownload}
                                disabled={downloading}
                            >
                                {downloading
                                    ? <span className="loading loading-spinner loading-xs" />
                                    : <i className="fa-duotone fa-regular fa-download" />}
                            </button>
                        </>
                    )}
                </div>
            </div>
            {showPlayer && (
                <InterviewRecordingPlayer
                    interviewId={interviewId}
                    onClose={() => setShowPlayer(false)}
                />
            )}
        </>
    );
}
