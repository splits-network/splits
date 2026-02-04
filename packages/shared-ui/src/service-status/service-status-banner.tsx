"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useServiceHealth } from "./use-service-health";

const BANNER_DISMISSED_KEY = "service-status-banner-dismissed";
const BANNER_DISMISSED_TIMESTAMP_KEY =
    "service-status-banner-dismissed-timestamp";
const DISMISSAL_DURATION = 10 * 60 * 1000; // 10 minutes

export interface ServiceStatusBannerProps {
    statusHref?: string;
}

export function ServiceStatusBanner({
    statusHref = "/status",
}: ServiceStatusBannerProps) {
    const { someUnhealthy, unhealthyServices, isLoading } = useServiceHealth({
        autoRefresh: true,
        refreshInterval: 30000,
    });

    const [isDismissed, setIsDismissed] = useState(true);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);

        if (typeof window === "undefined") return;

        const dismissed = sessionStorage.getItem(BANNER_DISMISSED_KEY);
        const dismissedTimestamp = sessionStorage.getItem(
            BANNER_DISMISSED_TIMESTAMP_KEY,
        );

        if (dismissed === "true" && dismissedTimestamp) {
            const elapsed = Date.now() - parseInt(dismissedTimestamp, 10);
            if (elapsed < DISMISSAL_DURATION) {
                setIsDismissed(true);
                return;
            }
        }

        setIsDismissed(false);
    }, []);

    useEffect(() => {
        if (!someUnhealthy && typeof window !== "undefined") {
            sessionStorage.removeItem(BANNER_DISMISSED_KEY);
            sessionStorage.removeItem(BANNER_DISMISSED_TIMESTAMP_KEY);
            setIsDismissed(false);
        }
    }, [someUnhealthy]);

    const handleDismiss = () => {
        setIsDismissed(true);
        if (typeof window !== "undefined") {
            sessionStorage.setItem(BANNER_DISMISSED_KEY, "true");
            sessionStorage.setItem(
                BANNER_DISMISSED_TIMESTAMP_KEY,
                Date.now().toString(),
            );
        }
    };

    if (!mounted || isLoading) return null;

    if (isDismissed || !someUnhealthy) return null;

    const unhealthyCount = unhealthyServices.length;
    const unhealthyNames = unhealthyServices
        .slice(0, 3)
        .map((service) => service.name)
        .join(", ");
    const moreText =
        unhealthyCount > 3 ? ` and ${unhealthyCount - 3} more` : "";

    return (
        <div className="w-full p-4 bg-base-100 text-error border-b-4 border-error/20">
            <div className="container mx-auto">
                <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <i className="fa-duotone fa-regular fa-bug fa-beat text-xl"></i>
                        <span>
                            <h3 className="font-bold">
                                Service Degradation Detected
                            </h3>
                            <div className="text-sm opacity-90">
                                {unhealthyNames}
                                {moreText} {unhealthyCount === 1 ? "is" : "are"}{" "}
                                currently experiencing issues.
                            </div>
                        </span>
                    </div>
                    <div>
                        <Link
                            href={statusHref}
                            className="btn btn-sm btn-error btn-ghost"
                        >
                            View Status
                        </Link>
                        <button
                            onClick={handleDismiss}
                            className="btn btn-sm btn-circle btn-ghost"
                            aria-label="Dismiss notification"
                        >
                            <i className="fa-duotone fa-regular fa-xmark"></i>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
