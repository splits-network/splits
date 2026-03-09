'use client';

import { useEffect, useState } from 'react';

interface PostCallSummaryProps {
    duration: number;
    isCandidate: boolean;
    onClose: () => void;
}

function formatDuration(seconds: number): string {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    const mm = String(minutes).padStart(2, '0');
    const ss = String(secs).padStart(2, '0');

    if (hours > 0) {
        return `${hours}:${mm}:${ss}`;
    }
    return `${mm}:${ss}`;
}

const REDIRECT_SECONDS = 10;

export function PostCallSummary({ duration, isCandidate, onClose }: PostCallSummaryProps) {
    const [countdown, setCountdown] = useState(REDIRECT_SECONDS);

    useEffect(() => {
        if (isCandidate) return;

        const interval = setInterval(() => {
            setCountdown((prev) => {
                if (prev <= 1) {
                    clearInterval(interval);
                    onClose();
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(interval);
    }, [isCandidate, onClose]);

    return (
        <div className="flex items-center justify-center h-screen bg-base-200">
            <div className="card bg-base-100 shadow-lg w-full max-w-md">
                <div className="card-body items-center text-center">
                    <div className="mb-4">
                        <i className="fa-duotone fa-regular fa-video text-4xl text-base-content/40" />
                    </div>

                    <h2 className="card-title text-2xl font-black">Call Ended</h2>

                    <div className="mt-4">
                        <p className="text-sm text-base-content/60">Call duration</p>
                        <p className="text-3xl font-mono font-bold mt-1">
                            {formatDuration(duration)}
                        </p>
                    </div>

                    {isCandidate ? (
                        <>
                            <p className="mt-4 text-base-content/70">
                                Thank you for your time. We appreciate your participation.
                            </p>
                            <div className="card-actions mt-6">
                                <button className="btn btn-primary" onClick={onClose}>
                                    Close
                                </button>
                            </div>
                        </>
                    ) : (
                        <>
                            <p className="mt-4 text-sm text-base-content/60">
                                Redirecting in {countdown} seconds...
                            </p>
                            <div className="card-actions mt-6">
                                <button className="btn btn-primary" onClick={onClose}>
                                    Close Now
                                </button>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}
