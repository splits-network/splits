"use client";

import {
    ServiceStatusBanner,
    type ServiceStatusBannerProps,
} from "./service-status-banner";
import { useSiteNotifications } from "./use-site-notifications";

export interface ServiceStatusProviderProps {
    statusHref?: string;
}

/**
 * Basel Service Status Provider - combines the banner with the notifications hook
 * for easy integration across all apps.
 */
export function ServiceStatusProvider({
    statusHref = "/status",
}: ServiceStatusProviderProps) {
    const { notifications, isLoading, dismiss } = useSiteNotifications({
        autoRefresh: true,
        refreshInterval: 60000,
    });

    return (
        <ServiceStatusBanner
            statusHref={statusHref}
            notifications={notifications}
            isLoading={isLoading}
            onDismiss={dismiss}
        />
    );
}
