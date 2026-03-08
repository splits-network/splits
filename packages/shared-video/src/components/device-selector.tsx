'use client';

import { useEffect, useState, useCallback } from 'react';

interface DeviceSelectorProps {
    kind: 'audioinput' | 'videoinput' | 'audiooutput';
    onDeviceChange: (deviceId: string) => void;
    activeDeviceId?: string;
}

const LABELS: Record<string, string> = {
    audioinput: 'Microphone',
    videoinput: 'Camera',
    audiooutput: 'Speaker',
};

export function DeviceSelector({ kind, onDeviceChange, activeDeviceId }: DeviceSelectorProps) {
    const [devices, setDevices] = useState<MediaDeviceInfo[]>([]);

    const enumerateDevices = useCallback(async () => {
        try {
            const allDevices = await navigator.mediaDevices.enumerateDevices();
            setDevices(allDevices.filter((d) => d.kind === kind));
        } catch {
            // Permission not yet granted or not supported
            setDevices([]);
        }
    }, [kind]);

    useEffect(() => {
        enumerateDevices();

        navigator.mediaDevices.addEventListener('devicechange', enumerateDevices);
        return () => {
            navigator.mediaDevices.removeEventListener('devicechange', enumerateDevices);
        };
    }, [enumerateDevices]);

    const label = LABELS[kind] ?? 'Device';

    if (devices.length === 0) return null;

    return (
        <label className="form-control w-full">
            <div className="label">
                <span className="label-text text-sm">{label}</span>
            </div>
            <select
                className="select select-bordered select-sm w-full"
                value={activeDeviceId ?? ''}
                onChange={(e) => onDeviceChange(e.target.value)}
            >
                {devices.map((device, idx) => (
                    <option key={device.deviceId} value={device.deviceId}>
                        {device.label || `${label} ${idx + 1}`}
                    </option>
                ))}
            </select>
        </label>
    );
}
