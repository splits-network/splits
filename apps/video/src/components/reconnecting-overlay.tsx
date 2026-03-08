'use client';

import { useConnectionState } from '@livekit/components-react';
import { ConnectionState } from 'livekit-client';

/**
 * Full-screen overlay shown when the LiveKit connection is reconnecting.
 * Automatically shows/hides based on connection state.
 */
export function ReconnectingOverlay() {
    const connectionState = useConnectionState();

    if (connectionState !== ConnectionState.Reconnecting) {
        return null;
    }

    return (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-base-300/80 backdrop-blur-sm">
            <span className="loading loading-spinner loading-lg text-primary" />
            <p className="mt-4 text-lg font-semibold text-base-content">
                Reconnecting...
            </p>
        </div>
    );
}
