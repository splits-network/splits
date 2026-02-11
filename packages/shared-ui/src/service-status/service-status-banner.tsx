"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
    useSiteNotifications,
    type SiteNotification,
} from "./use-site-notifications";

export interface ServiceStatusBannerProps {
    statusHref?: string;
}

const SEVERITY_STYLES: Record<
    string,
    { text: string; border: string; icon: string; btnClass: string }
> = {
    critical: {
        text: "text-error",
        border: "border-error/20",
        icon: "fa-duotone fa-regular fa-triangle-exclamation fa-beat",
        btnClass: "btn-error btn-ghost",
    },
    error: {
        text: "text-error",
        border: "border-error/20",
        icon: "fa-duotone fa-regular fa-bug fa-beat",
        btnClass: "btn-error btn-ghost",
    },
    warning: {
        text: "text-warning",
        border: "border-warning/20",
        icon: "fa-duotone fa-regular fa-wrench",
        btnClass: "btn-warning btn-ghost",
    },
    info: {
        text: "text-info",
        border: "border-info/20",
        icon: "fa-duotone fa-regular fa-megaphone",
        btnClass: "btn-info btn-ghost",
    },
};

function getStyle(severity: string) {
    return SEVERITY_STYLES[severity] || SEVERITY_STYLES.info;
}

function NotificationBannerItem({
    notification,
    statusHref,
    onDismiss,
}: {
    notification: SiteNotification;
    statusHref: string;
    onDismiss: (id: string) => void;
}) {
    const style = getStyle(notification.severity);
    const isHealthRelated = notification.type === "service_disruption";

    return (
        <div className={`w-full p-2 ${style.text} border-b-4 ${style.border}`}>
            <div className="container mx-auto">
                <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <i className={`${style.icon} text-xl`}></i>
                        <div>
                            <h3 className="font-bold">{notification.title}</h3>
                            {notification.message && (
                                <div className="text-sm opacity-90">
                                    {notification.message}
                                </div>
                            )}
                        </div>
                    </div>
                    <div className="flex items-center gap-1">
                        {isHealthRelated && (
                            <Link
                                href={statusHref}
                                className={`btn btn-sm ${style.btnClass}`}
                            >
                                View Status
                            </Link>
                        )}
                        {notification.dismissible && (
                            <button
                                onClick={() => onDismiss(notification.id)}
                                className="btn btn-sm btn-circle btn-ghost"
                                aria-label="Dismiss notification"
                            >
                                <i className="fa-duotone fa-regular fa-xmark"></i>
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

export function SiteNotificationBanner({
    statusHref = "/status",
}: ServiceStatusBannerProps) {
    const { notifications, isLoading, dismiss } = useSiteNotifications({
        autoRefresh: true,
        refreshInterval: 60000,
    });

    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted || isLoading) return null;
    if (notifications.length === 0) return null;

    return (
        <>
            {notifications.map((notification) => (
                <NotificationBannerItem
                    key={notification.id}
                    notification={notification}
                    statusHref={statusHref}
                    onDismiss={dismiss}
                />
            ))}
        </>
    );
}

// Backwards compatibility alias
export { SiteNotificationBanner as ServiceStatusBanner };
