import { Suspense } from 'react';
import { ConsentClient } from './consent-client';

export default function AuthorizePage() {
    return (
        <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-base-200"><span className="loading loading-spinner loading-lg"></span></div>}>
            <ConsentClient />
        </Suspense>
    );
}
