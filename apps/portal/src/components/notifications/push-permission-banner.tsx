"use client";

/**
 * Push Permission Banner
 *
 * Soft prompt for enabling push notifications.
 * Shows in the notification bell dropdown when permission hasn't been requested yet.
 * Dismissible with localStorage persistence.
 */

import { useState, useEffect } from "react";
import { usePushNotifications } from "@/hooks/use-push-notifications";

const DISMISS_KEY = "push-banner-dismissed";

export function PushPermissionBanner() {
    const { isSupported, permission, isSubscribed, subscribe, isLoading } =
        usePushNotifications();
    const [dismissed, setDismissed] = useState(true);

    useEffect(() => {
        setDismissed(localStorage.getItem(DISMISS_KEY) === "true");
    }, []);

    // Don't show if: not supported, already subscribed, already denied, or dismissed
    if (
        !isSupported ||
        isSubscribed ||
        permission === "denied" ||
        permission === "granted" ||
        dismissed
    ) {
        return null;
    }

    const handleDismiss = () => {
        localStorage.setItem(DISMISS_KEY, "true");
        setDismissed(true);
    };

    return (
        <div className="flex items-center gap-3 px-4 py-3 bg-primary/5 border-b border-base-300">
            <i className="fa-duotone fa-regular fa-bell-on text-primary text-sm flex-shrink-0" />
            <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold">
                    Stay in the loop
                </p>
                <p className="text-sm text-base-content/50">
                    Get notified even when this tab is closed.
                </p>
            </div>
            <button
                className="btn btn-primary btn-xs"
                onClick={subscribe}
                disabled={isLoading}
            >
                {isLoading ? (
                    <span className="loading loading-spinner loading-xs" />
                ) : (
                    "Enable"
                )}
            </button>
            <button
                className="btn btn-ghost btn-xs"
                onClick={handleDismiss}
                aria-label="Dismiss"
            >
                <i className="fa-regular fa-xmark" />
            </button>
        </div>
    );
}
