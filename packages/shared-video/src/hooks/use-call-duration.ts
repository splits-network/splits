import { useState, useRef, useCallback } from 'react';

function formatDuration(seconds: number): string {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
}

export function useCallDuration() {
    const [duration, setDuration] = useState(0);
    const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
    const startTimeRef = useRef<number | null>(null);

    const start = useCallback(() => {
        if (intervalRef.current) return;
        startTimeRef.current = Date.now();
        intervalRef.current = setInterval(() => {
            if (startTimeRef.current) {
                const elapsed = Math.floor((Date.now() - startTimeRef.current) / 1000);
                setDuration(elapsed);
            }
        }, 1000);
    }, []);

    const stop = useCallback(() => {
        if (intervalRef.current) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
        }
    }, []);

    const reset = useCallback(() => {
        stop();
        setDuration(0);
        startTimeRef.current = null;
    }, [stop]);

    return {
        duration,
        formatted: formatDuration(duration),
        start,
        stop,
        reset,
    };
}
