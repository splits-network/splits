'use client';

import { useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';
import { getGatewayBaseUrl } from '../service-status/gateway-url';

const HEARTBEAT_INTERVAL = 30_000; // 30 seconds
const SESSION_KEY = 'splits_activity_session';

function getOrCreateSessionId(): string {
    if (typeof window === 'undefined') return '';
    let id = sessionStorage.getItem(SESSION_KEY);
    if (!id) {
        id = crypto.randomUUID();
        sessionStorage.setItem(SESSION_KEY, id);
    }
    return id;
}

export interface ActivityTrackerProps {
    app: 'portal' | 'candidate' | 'corporate';
    userId?: string;
    userType?: string;
}

export function ActivityTracker({ app, userId, userType }: ActivityTrackerProps) {
    const pathname = usePathname();
    const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
    const userIdRef = useRef(userId);
    const userTypeRef = useRef(userType);
    const pathnameRef = useRef(pathname);

    useEffect(() => { userIdRef.current = userId; }, [userId]);
    useEffect(() => { userTypeRef.current = userType; }, [userType]);
    useEffect(() => { pathnameRef.current = pathname; }, [pathname]);

    useEffect(() => {
        const sessionId = getOrCreateSessionId();
        if (!sessionId) return;

        const sendHeartbeat = (status: 'active' | 'idle' = 'active') => {
            const payload = JSON.stringify({
                session_id: sessionId,
                user_id: userIdRef.current || undefined,
                user_type: userTypeRef.current || undefined,
                app,
                page: pathnameRef.current || '/',
                status,
            });

            const gatewayUrl = getGatewayBaseUrl() || 'http://127.0.0.1:3000';
            const url = `${gatewayUrl}/api/public/activity/heartbeat`;

            if (navigator.sendBeacon) {
                navigator.sendBeacon(url, new Blob([payload], { type: 'application/json' }));
            } else {
                fetch(url, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: payload,
                    keepalive: true,
                }).catch(() => {});
            }
        };

        // Initial heartbeat
        sendHeartbeat('active');

        // Periodic heartbeat
        intervalRef.current = setInterval(() => {
            sendHeartbeat(document.hidden ? 'idle' : 'active');
        }, HEARTBEAT_INTERVAL);

        // Page visibility change
        const handleVisibility = () => {
            sendHeartbeat(document.hidden ? 'idle' : 'active');
        };

        document.addEventListener('visibilitychange', handleVisibility);

        return () => {
            if (intervalRef.current) clearInterval(intervalRef.current);
            document.removeEventListener('visibilitychange', handleVisibility);
        };
    }, [app]);

    return null;
}
