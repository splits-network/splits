"use client";

/**
 * Call Ringtone Hook
 * Uses Web Audio API to generate call notification sounds.
 * - Instant call: looping ringtone pattern (ring-pause-ring)
 * - Starting soon / scheduled: single notification chime
 */

import { useCallback, useRef, useState } from "react";

type RingtoneMode = "ringtone" | "chime";

/** Play a two-tone ring burst (like a phone ring) */
function playRingBurst(ctx: AudioContext, startTime: number): void {
    const osc1 = ctx.createOscillator();
    const osc2 = ctx.createOscillator();
    const gain = ctx.createGain();

    // Dual-tone ring (440Hz + 480Hz — standard North American ring)
    osc1.type = "sine";
    osc1.frequency.value = 440;
    osc2.type = "sine";
    osc2.frequency.value = 480;

    gain.gain.setValueAtTime(0.15, startTime);
    gain.gain.exponentialRampToValueAtTime(0.01, startTime + 0.8);

    osc1.connect(gain);
    osc2.connect(gain);
    gain.connect(ctx.destination);

    osc1.start(startTime);
    osc2.start(startTime);
    osc1.stop(startTime + 0.8);
    osc2.stop(startTime + 0.8);
}

/** Play a pleasant notification chime */
function playChime(ctx: AudioContext): void {
    const now = ctx.currentTime;
    const notes = [523.25, 659.25, 783.99]; // C5, E5, G5 — major triad

    notes.forEach((freq, i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = "sine";
        osc.frequency.value = freq;

        const start = now + i * 0.12;
        gain.gain.setValueAtTime(0, start);
        gain.gain.linearRampToValueAtTime(0.12, start + 0.05);
        gain.gain.exponentialRampToValueAtTime(0.001, start + 0.4);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(start);
        osc.stop(start + 0.4);
    });
}

export function useCallRingtone() {
    const ctxRef = useRef<AudioContext | null>(null);
    const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
    const [isMuted, setIsMuted] = useState(false);
    const activeMode = useRef<RingtoneMode | null>(null);

    const getContext = useCallback(() => {
        if (!ctxRef.current || ctxRef.current.state === "closed") {
            ctxRef.current = new AudioContext();
        }
        // Resume if suspended (browser autoplay policy)
        if (ctxRef.current.state === "suspended") {
            ctxRef.current.resume();
        }
        return ctxRef.current;
    }, []);

    const stop = useCallback(() => {
        if (intervalRef.current) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
        }
        activeMode.current = null;
    }, []);

    const play = useCallback(
        (mode: RingtoneMode) => {
            // Don't restart if already playing the same mode
            if (activeMode.current === mode) return;

            stop();
            activeMode.current = mode;

            try {
                const ctx = getContext();

                if (mode === "chime") {
                    playChime(ctx);
                    activeMode.current = null;
                    return;
                }

                // Ringtone: ring burst every 3 seconds (0.8s ring + 2.2s pause)
                playRingBurst(ctx, ctx.currentTime);
                intervalRef.current = setInterval(() => {
                    if (activeMode.current !== "ringtone") return;
                    try {
                        const c = getContext();
                        playRingBurst(c, c.currentTime);
                    } catch {
                        // Audio context closed
                    }
                }, 3000);
            } catch {
                // Web Audio not available
            }
        },
        [getContext, stop],
    );

    const mute = useCallback(() => {
        stop();
        setIsMuted(true);
    }, [stop]);

    const unmute = useCallback(() => {
        setIsMuted(false);
    }, []);

    return { play, stop, mute, unmute, isMuted };
}
