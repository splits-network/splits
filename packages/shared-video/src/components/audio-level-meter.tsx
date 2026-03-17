'use client';

import { useEffect, useState, useRef } from 'react';
import type { LocalAudioTrack } from 'livekit-client';

interface AudioLevelMeterProps {
    audioTrack?: LocalAudioTrack;
}

const BAND_COUNT = 5;

export function AudioLevelMeter({ audioTrack }: AudioLevelMeterProps) {
    const [levels, setLevels] = useState<number[]>(new Array(BAND_COUNT).fill(0));
    const animFrameRef = useRef<number>(0);

    useEffect(() => {
        if (!audioTrack) {
            setLevels(new Array(BAND_COUNT).fill(0));
            return;
        }

        const mediaStream = audioTrack.mediaStream;
        if (!mediaStream) return;

        const audioContext = new AudioContext();
        const analyser = audioContext.createAnalyser();
        analyser.fftSize = 32;
        const source = audioContext.createMediaStreamSource(mediaStream);
        source.connect(analyser);

        const dataArray = new Uint8Array(analyser.frequencyBinCount);

        const update = () => {
            analyser.getByteFrequencyData(dataArray);
            const bandSize = Math.floor(dataArray.length / BAND_COUNT);
            const newLevels: number[] = [];
            for (let i = 0; i < BAND_COUNT; i++) {
                let sum = 0;
                for (let j = 0; j < bandSize; j++) {
                    sum += dataArray[i * bandSize + j];
                }
                newLevels.push(sum / bandSize / 255);
            }
            setLevels(newLevels);
            animFrameRef.current = requestAnimationFrame(update);
        };

        update();

        return () => {
            if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
            source.disconnect();
            audioContext.close();
        };
    }, [audioTrack]);

    const isMuted = !audioTrack;

    return (
        <div className="flex items-end gap-1 h-8" aria-label="Audio level meter">
            {levels.map((level, i) => (
                <div
                    key={i}
                    className={`w-2 transition-all duration-75 ${
                        isMuted ? 'bg-base-content/20' : 'bg-success'
                    }`}
                    style={{ height: `${Math.max(4, level * 32)}px` }}
                />
            ))}
        </div>
    );
}
