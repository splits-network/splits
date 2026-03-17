'use client';

import { useAuth } from '@clerk/nextjs';
import { SupportProvider, SupportChatWindow } from '@splits-network/support-widget';

export function SupportWidgetWrapper({ children }: { children: React.ReactNode }) {
    const { getToken } = useAuth();

    return (
        <SupportProvider
            sourceApp="portal"
            getToken={getToken}
        >
            {children}
            <SupportChatWindow />
        </SupportProvider>
    );
}
