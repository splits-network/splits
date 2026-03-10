'use client';

import { useState, useCallback } from 'react';
import { useAuth } from '@clerk/nextjs';
import { createAuthenticatedClient } from '@/lib/api-client';

/* ─── Types ────────────────────────────────────────────────────────── */

export interface CreateCallPayload {
    call_type: string;
    title?: string;
    scheduled_at?: string;
    agenda?: string;
    duration_minutes_planned?: number;
    pre_call_notes?: string;
    tags?: string[];
    entity_links: { entity_type: string; entity_id: string }[];
    participants: { user_id: string; role: 'host' | 'participant' | 'observer' }[];
}

export interface CreateCallResult {
    id: string;
    status: string;
    title: string | null;
    scheduled_at: string | null;
    created_at: string;
}

export interface CallTokenResult {
    access_token: string;
    livekit_token: string;
    call_id: string;
}

/* ─── Hook ─────────────────────────────────────────────────────────── */

export function useCreateCall() {
    const { getToken } = useAuth();
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const createCall = useCallback(async (payload: CreateCallPayload): Promise<CreateCallResult> => {
        setIsLoading(true);
        setError(null);

        try {
            const token = await getToken();
            if (!token) throw new Error('Not authenticated');

            const client = createAuthenticatedClient(token);
            const res = await client.post('/calls', payload) as { data: CreateCallResult };
            return res.data;
        } catch (err: any) {
            const message = err.message || 'Failed to create call';
            setError(message);
            throw err;
        } finally {
            setIsLoading(false);
        }
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

    const generateToken = useCallback(async (callId: string): Promise<CallTokenResult> => {
        const token = await getToken();
        if (!token) throw new Error('Not authenticated');

        const client = createAuthenticatedClient(token);
        const res = await client.post(`/calls/${callId}/token`, {}) as { data: CallTokenResult };
        return res.data;
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

    const createCalendarEvents = useCallback(async (params: {
        callId: string;
        title: string;
        scheduledAt: string;
        durationMinutes: number;
        agenda?: string;
        participants: { user_id: string; first_name: string; last_name: string; email: string }[];
    }) => {
        try {
            const token = await getToken();
            if (!token) return;

            const client = createAuthenticatedClient(token);

            // Filter out email-only participants — they won't have calendar connections
            const calendarParticipants = params.participants
                .filter(p => !p.user_id.startsWith('email:'))
                .map(p => ({
                    user_id: p.user_id,
                    clerk_user_id: p.user_id,
                    email: p.email,
                    name: `${p.first_name} ${p.last_name}`.trim(),
                }));

            if (calendarParticipants.length === 0) return;

            await client.post('/integrations/calendar/calls', {
                call_id: params.callId,
                title: params.title || 'Video Call',
                scheduled_at: params.scheduledAt,
                duration_minutes: params.durationMinutes,
                agenda: params.agenda || null,
                participants: calendarParticipants,
                join_url: `${process.env.NEXT_PUBLIC_APP_URL || 'https://portal.splits.network'}/portal/calls/${params.callId}/join`,
            });
        } catch (err) {
            // Calendar creation is best-effort — never block the call flow
            console.warn('[Calendar] Failed to create calendar events:', err);
        }
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

    return { createCall, generateToken, createCalendarEvents, isLoading, error };
}
