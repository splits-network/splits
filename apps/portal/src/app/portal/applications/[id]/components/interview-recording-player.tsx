'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@clerk/nextjs';
import { createAuthenticatedClient } from '@/lib/api-client';

interface InterviewRecordingPlayerProps {
    interviewId: string;
    onClose: () => void;
}

export function InterviewRecordingPlayer({ interviewId, onClose }: InterviewRecordingPlayerProps) {
    const [videoUrl, setVideoUrl] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const { getToken } = useAuth();

    useEffect(() => {
        let cancelled = false;
        (async () => {
            try {
                const token = await getToken();
                if (!token || cancelled) return;
                const client = createAuthenticatedClient(token);
                const res = await client.get(`/interviews/${interviewId}/recording/playback-url`);
                if (!cancelled) {
                    setVideoUrl(res.data?.url || null);
                    setLoading(false);
                }
            } catch {
                if (!cancelled) {
                    setError('Unable to load recording');
                    setLoading(false);
                }
            }
        })();
        return () => { cancelled = true; };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [interviewId]);

    return (
        <dialog className="modal modal-open">
            <div className="modal-box max-w-4xl p-0">
                <div className="flex items-center justify-between p-4 border-b border-base-200">
                    <h3 className="font-black text-sm">Interview Recording</h3>
                    <button type="button" className="btn btn-ghost btn-sm" onClick={onClose}>
                        <i className="fa-duotone fa-regular fa-xmark" />
                    </button>
                </div>

                <div className="bg-black">
                    {loading && (
                        <div className="flex items-center justify-center py-20">
                            <span className="loading loading-spinner loading-lg text-base-100" />
                        </div>
                    )}
                    {error && (
                        <div className="flex flex-col items-center justify-center gap-3 py-20">
                            <p className="text-sm text-base-100">{error}</p>
                            <button
                                type="button"
                                className="btn btn-primary btn-sm"
                                onClick={() => { setError(null); setLoading(true); }}
                            >
                                Retry
                            </button>
                        </div>
                    )}
                    {videoUrl && !loading && !error && (
                        <video
                            controls
                            className="w-full max-h-[70vh]"
                            src={videoUrl}
                        />
                    )}
                </div>
            </div>
            <form method="dialog" className="modal-backdrop">
                <button type="button" onClick={onClose}>close</button>
            </form>
        </dialog>
    );
}
