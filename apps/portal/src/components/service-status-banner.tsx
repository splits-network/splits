'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useServiceHealth } from '@/hooks/use-service-health';

const BANNER_DISMISSED_KEY = 'service-status-banner-dismissed';
const BANNER_DISMISSED_TIMESTAMP_KEY = 'service-status-banner-dismissed-timestamp';
const DISMISSAL_DURATION = 10 * 60 * 1000; // 10 minutes

export function ServiceStatusBanner() {
    const { someUnhealthy, unhealthyServices, isLoading } = useServiceHealth({
        autoRefresh: true,
        refreshInterval: 30000, // Check every 30 seconds
    });

    const [isDismissed, setIsDismissed] = useState(true); // Start dismissed to avoid flash
    const [mounted, setMounted] = useState(false);

    // Check if banner was previously dismissed
    useEffect(() => {
        setMounted(true);

        if (typeof window === 'undefined') return;

        const dismissed = sessionStorage.getItem(BANNER_DISMISSED_KEY);
        const dismissedTimestamp = sessionStorage.getItem(BANNER_DISMISSED_TIMESTAMP_KEY);

        if (dismissed === 'true' && dismissedTimestamp) {
            const elapsed = Date.now() - parseInt(dismissedTimestamp, 10);
            if (elapsed < DISMISSAL_DURATION) {
                setIsDismissed(true);
                return;
            }
        }

        setIsDismissed(false);
    }, []);

    // Clear dismissal when all services become healthy
    useEffect(() => {
        if (!someUnhealthy && typeof window !== 'undefined') {
            sessionStorage.removeItem(BANNER_DISMISSED_KEY);
            sessionStorage.removeItem(BANNER_DISMISSED_TIMESTAMP_KEY);
            setIsDismissed(false);
        }
    }, [someUnhealthy]);

    const handleDismiss = () => {
        setIsDismissed(true);
        if (typeof window !== 'undefined') {
            sessionStorage.setItem(BANNER_DISMISSED_KEY, 'true');
            sessionStorage.setItem(BANNER_DISMISSED_TIMESTAMP_KEY, Date.now().toString());
        }
    };

    // Don't render until mounted (avoid hydration mismatch)
    if (!mounted || isLoading) return null;

    // Don't show if dismissed or all healthy
    if (isDismissed || !someUnhealthy) return null;

    const unhealthyCount = unhealthyServices.length;
    const unhealthyNames = unhealthyServices.slice(0, 3).map(s => s.name).join(', ');
    const moreText = unhealthyCount > 3 ? ` and ${unhealthyCount - 3} more` : '';

    return (
        <div className="fixed top-16 left-0 right-0 z-50 p-4">
            <div className="container mx-auto">
                <div role="alert" className="alert alert-vertical alert-error sm:alert-horizontal shadow-lg">
                    <i className="fa-duotone fa-regular fa-bug fa-beat text-xl"></i>
                    <span>
                        <h3 className="font-bold">Service Degradation Detected</h3>
                        <div className="text-sm opacity-90">
                            {unhealthyNames}{moreText} {unhealthyCount === 1 ? 'is' : 'are'} currently experiencing issues.
                        </div>
                    </span>
                    <div>
                        <Link href="/public/status" className="btn btn-sm btn-ghost">
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
