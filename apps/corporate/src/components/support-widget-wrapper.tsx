"use client";

import {
    SupportProvider,
    SupportChatWindow,
} from "@splits-network/support-widget";

export function SupportWidgetWrapper({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <SupportProvider sourceApp="corporate">
            {children}
            <SupportChatWindow />
        </SupportProvider>
    );
}
