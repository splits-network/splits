"use client";

/**
 * Call Toast Notifications
 * Renders time-sensitive call toasts with action buttons.
 * Variants: instant call, starting soon, participant joined, decline.
 */

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { InAppNotification } from "@/lib/notifications";

type CallToastType =
    | "instant_call"
    | "starting_soon"
    | "scheduled_call"
    | "participant_joined"
    | "decline";

interface CallToastProps {
    notification: InAppNotification;
    onDismiss: (id: string) => void;
    onAction?: (notificationId: string, action: string) => void;
}

function getToastType(notification: InAppNotification): CallToastType | null {
    const toastType = notification.payload?.toastType;
    if (
        toastType === "instant_call" ||
        toastType === "starting_soon" ||
        toastType === "scheduled_call" ||
        toastType === "participant_joined" ||
        toastType === "decline"
    ) {
        return toastType;
    }
    return null;
}

/** Returns auto-hide duration in seconds, or null for persistent toasts */
function getAutoHideSeconds(type: CallToastType): number | null {
    switch (type) {
        case "instant_call":
            return null; // Persistent — user must dismiss
        case "starting_soon":
            return null; // Persistent — user must dismiss
        case "scheduled_call":
            return null; // Persistent — user must dismiss
        case "participant_joined":
            return 5;
        case "decline":
            return 10;
    }
}

function getAlertClass(type: CallToastType): string {
    switch (type) {
        case "instant_call":
            return "alert-error";
        case "starting_soon":
            return "alert-warning";
        case "scheduled_call":
            return "alert-info";
        case "participant_joined":
            return "alert-info";
        case "decline":
            return "alert-neutral";
    }
}

function getIcon(type: CallToastType): string {
    switch (type) {
        case "instant_call":
            return "fa-phone-arrow-down-left";
        case "starting_soon":
            return "fa-clock";
        case "scheduled_call":
            return "fa-calendar-check";
        case "participant_joined":
            return "fa-user-plus";
        case "decline":
            return "fa-phone-xmark";
    }
}

export default function CallToast({
    notification,
    onDismiss,
    onAction,
}: CallToastProps) {
    const router = useRouter();
    const [timeLeft, setTimeLeft] = useState<number | null>(null);
    const toastType = getToastType(notification);

    useEffect(() => {
        if (!toastType) return;

        const duration = getAutoHideSeconds(toastType);

        // Persistent toasts — no auto-dismiss
        if (duration === null) {
            setTimeLeft(null);
            return;
        }

        setTimeLeft(duration);

        const interval = setInterval(() => {
            setTimeLeft((prev) => {
                if (prev === null || prev <= 1) {
                    clearInterval(interval);
                    onDismiss(notification.id);
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(interval);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [notification.id, toastType]);

    if (!toastType) return null;

    const alertClass = getAlertClass(toastType);
    const icon = getIcon(toastType);
    const callId = notification.payload?.callId;

    const handleJoin = () => {
        if (notification.action_url) {
            router.push(notification.action_url);
        } else if (callId) {
            router.push(`/portal/calls/${callId}`);
        }
        onDismiss(notification.id);
    };

    const handleDecline = () => {
        onAction?.(notification.id, "decline");
        onDismiss(notification.id);
    };

    return (
        <div
            role="alert"
            className={`alert ${alertClass} shadow-lg w-full max-w-sm`}
        >
            <i className={`fa-duotone fa-regular ${icon} text-lg`} />
            <div className="flex-1">
                <p className="text-sm font-semibold">{notification.subject}</p>
                {timeLeft !== null && timeLeft > 0 && (
                    <p className="text-sm opacity-70">{timeLeft}s</p>
                )}
            </div>
            <div className="flex gap-1">
                <CallToastActions
                    type={toastType}
                    onJoin={handleJoin}
                    onDecline={handleDecline}
                    onDismiss={() => onDismiss(notification.id)}
                />
            </div>
        </div>
    );
}

function CallToastActions({
    type,
    onJoin,
    onDecline,
    onDismiss,
}: {
    type: CallToastType;
    onJoin: () => void;
    onDecline: () => void;
    onDismiss: () => void;
}) {
    switch (type) {
        case "instant_call":
            return (
                <>
                    <button
                        className="btn btn-sm btn-ghost"
                        onClick={onDecline}
                    >
                        Decline
                    </button>
                    <button
                        className="btn btn-sm btn-primary"
                        onClick={onJoin}
                    >
                        <i className="fa-duotone fa-regular fa-phone" />
                        Accept
                    </button>
                </>
            );
        case "starting_soon":
            return (
                <>
                    <button
                        className="btn btn-sm btn-ghost"
                        onClick={onDismiss}
                    >
                        Later
                    </button>
                    <button
                        className="btn btn-sm btn-primary"
                        onClick={onJoin}
                    >
                        <i className="fa-duotone fa-regular fa-video" />
                        Join
                    </button>
                </>
            );
        case "scheduled_call":
            return (
                <>
                    <button
                        className="btn btn-sm btn-ghost"
                        onClick={onDismiss}
                    >
                        Dismiss
                    </button>
                    <button
                        className="btn btn-sm btn-primary"
                        onClick={onJoin}
                    >
                        <i className="fa-duotone fa-regular fa-calendar-check" />
                        View
                    </button>
                </>
            );
        case "participant_joined":
            return (
                <button className="btn btn-sm btn-ghost" onClick={onDismiss}>
                    OK
                </button>
            );
        case "decline":
            return (
                <button className="btn btn-sm btn-ghost" onClick={onDismiss}>
                    OK
                </button>
            );
    }
}

/** Container for rendering multiple call toasts */
export function CallToastContainer({
    notifications,
    onDismiss,
    onAction,
}: {
    notifications: InAppNotification[];
    onDismiss: (id: string) => void;
    onAction?: (notificationId: string, action: string) => void;
}) {
    const callNotifications = notifications.filter(
        (n) => getToastType(n) !== null,
    );

    if (callNotifications.length === 0) return null;

    return (
        <div className="fixed top-4 right-4 z-50 flex flex-col gap-2">
            {callNotifications.map((n) => (
                <CallToast
                    key={n.id}
                    notification={n}
                    onDismiss={onDismiss}
                    onAction={onAction}
                />
            ))}
        </div>
    );
}
