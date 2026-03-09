'use client';

import { useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useCallToken } from '@/hooks/use-call-token';
import { SplashScreen } from '@/components/splash-screen';
import { ErrorPage } from '@/components/error-page';
import { IdentityConfirm } from '@/components/identity-confirm';

interface JoinFlowProps {
    token: string;
}

export function JoinFlow({ token }: JoinFlowProps) {
    const { state, result, error } = useCallToken(token);
    const router = useRouter();

    const handleJoin = useCallback(() => {
        if (!result) return;

        // Store call data in sessionStorage to avoid exposing JWT in URL
        sessionStorage.setItem(
            `call-${result.call.id}`,
            JSON.stringify({
                livekitToken: result.livekit_token,
                call: result.call,
            }),
        );

        router.push(`/call/${result.call.id}`);
    }, [result, router]);

    switch (state) {
        case 'loading':
            return <SplashScreen />;
        case 'error':
            return <ErrorPage error={error!} />;
        case 'confirming':
        case 'joining':
            return <IdentityConfirm result={result!} onConfirm={handleJoin} />;
    }
}
