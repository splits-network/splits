"use client";

/**
 * Push Notifications Hook
 *
 * Manages the Web Push subscription lifecycle:
 * - Service worker registration
 * - Permission state tracking
 * - Subscribe/unsubscribe with backend
 */

import { useState, useEffect, useCallback, useRef } from "react";
import { useAuth } from "@clerk/nextjs";
import {
    createAuthenticatedClient,
    createUnauthenticatedClient,
} from "@/lib/api-client";

type PushPermission = "default" | "granted" | "denied";

interface UsePushNotificationsReturn {
    isSupported: boolean;
    permission: PushPermission;
    isSubscribed: boolean;
    isLoading: boolean;
    subscribe: () => Promise<void>;
    unsubscribe: () => Promise<void>;
}

export function usePushNotifications(): UsePushNotificationsReturn {
    const { getToken } = useAuth();
    const [permission, setPermission] = useState<PushPermission>("default");
    const [isSubscribed, setIsSubscribed] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const swRegistrationRef = useRef<ServiceWorkerRegistration | null>(null);

    const isSupported =
        typeof window !== "undefined" &&
        "serviceWorker" in navigator &&
        "PushManager" in window;

    // Register service worker and check existing subscription
    useEffect(() => {
        if (!isSupported) {
            setIsLoading(false);
            return;
        }

        setPermission(Notification.permission as PushPermission);

        navigator.serviceWorker
            .register("/sw.js")
            .then(async (registration) => {
                swRegistrationRef.current = registration;
                const existing =
                    await registration.pushManager.getSubscription();
                setIsSubscribed(!!existing);
            })
            .catch(() => {})
            .finally(() => setIsLoading(false));
    }, [isSupported]);

    const subscribe = useCallback(async () => {
        if (!isSupported || !swRegistrationRef.current) return;

        setIsLoading(true);
        try {
            // Get VAPID public key from backend
            const publicClient = createUnauthenticatedClient();
            const vapidResponse = await publicClient.get("/push/vapid-key");
            const vapidPublicKey = vapidResponse.data?.vapidPublicKey;
            if (!vapidPublicKey) throw new Error("Push not configured");

            // Request permission and subscribe
            const pushSubscription =
                await swRegistrationRef.current.pushManager.subscribe({
                    userVisibleOnly: true,
                    applicationServerKey: urlBase64ToUint8Array(vapidPublicKey),
                });

            setPermission(Notification.permission as PushPermission);

            // Send subscription to backend
            const token = await getToken();
            if (!token) return;
            const client = createAuthenticatedClient(token);
            const keys = pushSubscription.toJSON().keys;
            await client.post("/push/subscriptions", {
                endpoint: pushSubscription.endpoint,
                keys: {
                    p256dh: keys?.p256dh || "",
                    auth: keys?.auth || "",
                },
                userAgent: navigator.userAgent,
            });

            setIsSubscribed(true);
        } catch {
            // Permission denied or other error
            setPermission(Notification.permission as PushPermission);
        } finally {
            setIsLoading(false);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isSupported]);

    const unsubscribe = useCallback(async () => {
        if (!isSupported || !swRegistrationRef.current) return;

        setIsLoading(true);
        try {
            const subscription =
                await swRegistrationRef.current.pushManager.getSubscription();
            if (subscription) {
                // Remove from backend
                const token = await getToken();
                if (token) {
                    const client = createAuthenticatedClient(token);
                    await client.delete("/push/subscriptions", {
                        endpoint: subscription.endpoint,
                    });
                }

                // Unsubscribe from browser
                await subscription.unsubscribe();
            }
            setIsSubscribed(false);
        } catch {
            // Silently handle errors
        } finally {
            setIsLoading(false);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isSupported]);

    return {
        isSupported,
        permission,
        isSubscribed,
        isLoading,
        subscribe,
        unsubscribe,
    };
}

/**
 * Convert a URL-safe base64 VAPID key to a Uint8Array for the Push API.
 */
function urlBase64ToUint8Array(base64String: string): Uint8Array {
    const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
    const base64 = (base64String + padding)
        .replace(/-/g, "+")
        .replace(/_/g, "/");
    const rawData = atob(base64);
    const outputArray = new Uint8Array(rawData.length);
    for (let i = 0; i < rawData.length; ++i) {
        outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
}
