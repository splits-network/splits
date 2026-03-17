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
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-base-300/70 backdrop-blur-md">
            <i className="fa-duotone fa-regular fa-wifi-exclamation text-4xl text-warning animate-pulse" />
            <h3 className="mt-4 text-xl font-black text-base-content">
                Connection Interrupted
            </h3>
            <p className="mt-1 text-sm text-base-content/60">
                Attempting to reconnect...
            </p>
            <span className="loading loading-spinner loading-sm text-base-content/40 mt-4" />
        </div>
    );
}
