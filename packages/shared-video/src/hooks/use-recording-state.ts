'use client';

import { useState, useEffect, useCallback, useRef } from 'react';

type RecordingStatus = 'idle' | 'recording' | 'processing' | 'completed' | 'failed';

interface RecordingState {
    isRecording: boolean;
    isProcessing: boolean;
    recordingStatus: RecordingStatus;
    startRecording: () => Promise<void>;
    stopRecording: () => Promise<void>;
    submitConsent: (token?: string) => Promise<void>;
}

export function useRecordingState(
    interviewId: string,
    apiBase: string,
    getToken: () => Promise<string | null>,
    isInterviewer: boolean,
): RecordingState {
    const [recordingStatus, setRecordingStatus] = useState<RecordingStatus>('idle');
    const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

    const isRecording = recordingStatus === 'recording';
    const isProcessing = recordingStatus === 'processing';

    const apiCall = useCallback(
        async (path: string, method: 'GET' | 'POST' = 'POST') => {
            const token = await getToken();
            if (!token) throw new Error('Not authenticated');
            const res = await fetch(`${apiBase}/api/v2/interviews/${interviewId}${path}`, {
                method,
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
            });
            if (!res.ok) throw new Error(`Recording API error: ${res.status}`);
            return res.json();
        },
        [interviewId, apiBase], // eslint-disable-line react-hooks/exhaustive-deps
    );

    const startRecording = useCallback(async () => {
        await apiCall('/recording/start');
        setRecordingStatus('recording');
    }, [apiCall]);

    const stopRecording = useCallback(async () => {
        await apiCall('/recording/stop');
        setRecordingStatus('processing');
    }, [apiCall]);

    const submitConsent = useCallback(
        async (token?: string) => {
            const authToken = token || (await getToken());
            if (!authToken) return;
            await fetch(
                `${apiBase}/api/v2/interviews/${interviewId}/recording/consent`,
                {
                    method: 'POST',
                    headers: {
                        Authorization: `Bearer ${authToken}`,
                        'Content-Type': 'application/json',
                    },
                },
            );
        },
        [interviewId, apiBase], // eslint-disable-line react-hooks/exhaustive-deps
    );

    // Poll recording status every 5 seconds
    useEffect(() => {
        const poll = async () => {
            try {
                const data = await apiCall('/recording', 'GET');
                if (data?.data?.status) {
                    setRecordingStatus(data.data.status);
                }
            } catch {
                // Silently fail polling — status will update on next poll
            }
        };

        pollRef.current = setInterval(poll, 5000);
        poll(); // Initial check

        return () => {
            if (pollRef.current) clearInterval(pollRef.current);
        };
    }, [apiCall]);

    return { isRecording, isProcessing, recordingStatus, startRecording, stopRecording, submitConsent };
}
