"use client";

/**
 * Call Toast Notifications
 * Renders time-sensitive call toasts with action buttons.
 * Instant calls play a looping ringtone; starting_soon/scheduled play a chime.
 * All sound toasts include a mute toggle.
 */

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { InAppNotification } from "@/lib/notifications";
import { useCallRingtone } from "@/hooks/use-call-ringtone";

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
    isMuted: boolean;
    onMuteToggle: () => void;
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
            return null;
        case "starting_soon":
            return null;
        case "scheduled_call":
            return null;
        case "participant_joined":
            return 5;
        case "decline":
            return 10;
    }
}

/** Whether this toast type plays a sound */
function hasSound(type: CallToastType): boolean {
    return (
        type === "instant_call" ||
        type === "starting_soon" ||
        type === "scheduled_call"
    );
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

function CallToast({
    notification,
    onDismiss,
    onAction,
    isMuted,
    onMuteToggle,
}: CallToastProps) {
    const router = useRouter();
    const [timeLeft, setTimeLeft] = useState<number | null>(null);
    const toastType = getToastType(notification);

    useEffect(() => {
        if (!toastType) return;

        const duration = getAutoHideSeconds(toastType);
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
    const showMute = hasSound(toastType);

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
            <i
                className={`fa-duotone fa-regular ${icon} text-lg ${
                    toastType === "instant_call" ? "animate-pulse" : ""
                }`}
            />
            <div className="flex-1">
                <p className="text-sm font-semibold">{notification.subject}</p>
                {timeLeft !== null && timeLeft > 0 && (
                    <p className="text-sm opacity-70">{timeLeft}s</p>
                )}
            </div>
            <div className="flex gap-1 items-center">
                {showMute && (
                    <button
                        className="btn btn-sm btn-ghost btn-square"
                        onClick={onMuteToggle}
                        aria-label={isMuted ? "Unmute" : "Mute"}
                        title={isMuted ? "Unmute" : "Mute"}
                    >
                        <i
                            className={`fa-duotone fa-regular ${
                                isMuted
                                    ? "fa-volume-xmark"
                                    : "fa-volume-high"
                            } text-sm`}
                        />
                    </button>
                )}
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

/** Container for rendering multiple call toasts with shared sound management */
export function CallToastContainer({
    notifications,
    onDismiss,
    onAction,
}: {
    notifications: InAppNotification[];
    onDismiss: (id: string) => void;
    onAction?: (notificationId: string, action: string) => void;
}) {
    const { play, stop, mute, unmute, isMuted } = useCallRingtone();
    const prevSoundIdsRef = useRef<Set<string>>(new Set());

    const callNotifications = notifications.filter(
        (n) => getToastType(n) !== null,
    );

    // Determine what sound to play based on active toasts
    const hasInstantCall = callNotifications.some(
        (n) => n.payload?.toastType === "instant_call",
    );
    const hasChimeToast = callNotifications.some(
        (n) =>
            n.payload?.toastType === "starting_soon" ||
            n.payload?.toastType === "scheduled_call",
    );

    // Track which sound-worthy notifications we've already triggered chimes for
    const soundNotificationIds = new Set(
        callNotifications
            .filter((n) => hasSound(getToastType(n)!))
            .map((n) => n.id),
    );

    useEffect(() => {
        if (isMuted) return;

        if (hasInstantCall) {
            play("ringtone");
        } else if (hasChimeToast) {
            // Only chime for newly appeared notifications
            const newChimeIds = [...soundNotificationIds].filter(
                (id) => !prevSoundIdsRef.current.has(id),
            );
            if (newChimeIds.length > 0) {
                play("chime");
            }
            // Stop any lingering ringtone
            if (!hasInstantCall) {
                stop();
            }
        } else {
            stop();
        }

        prevSoundIdsRef.current = soundNotificationIds;
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [hasInstantCall, hasChimeToast, isMuted, soundNotificationIds.size]);

    // Stop sound when all toasts are dismissed
    useEffect(() => {
        if (callNotifications.length === 0) {
            stop();
        }
    }, [callNotifications.length, stop]);

    const handleDismiss = (id: string) => {
        onDismiss(id);
    };

    const handleMuteToggle = () => {
        if (isMuted) {
            unmute();
        } else {
            mute();
        }
    };

    if (callNotifications.length === 0) return null;

    return (
        <div className="fixed top-4 right-4 z-50 flex flex-col gap-2">
            {callNotifications.map((n) => (
                <CallToast
                    key={n.id}
                    notification={n}
                    onDismiss={handleDismiss}
                    onAction={onAction}
                    isMuted={isMuted}
                    onMuteToggle={handleMuteToggle}
                />
            ))}
        </div>
    );
}
