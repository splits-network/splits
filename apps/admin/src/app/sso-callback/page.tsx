'use client';

import { AuthenticateWithRedirectCallback } from '@clerk/nextjs';

export default function SSOCallbackPage() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-base-100">
            <div className="text-center">
                <span className="loading loading-spinner loading-lg text-primary mb-4" />
                <p className="text-sm text-base-content/50">Completing sign in...</p>
            </div>
            <AuthenticateWithRedirectCallback />
        </div>
    );
}
