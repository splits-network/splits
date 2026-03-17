import { SupabaseClient } from '@supabase/supabase-js';
import { Call, CallParticipantWithUser } from './types';

export interface CallWithParticipantsForReminder extends Call {
    participants: CallParticipantWithUser[];
}

export class SchedulerRepository {
    constructor(private supabase: SupabaseClient) {}

    // ── Reminder Queries ─────────────────────────────────────────────────

    async getCallsNeedingReminder(
        reminderType: '24h' | '1h' | '5min',
    ): Promise<CallWithParticipantsForReminder[]> {
        const now = new Date();
        let rangeStart: Date;
        let rangeEnd: Date;

        switch (reminderType) {
            case '24h':
                rangeStart = new Date(now.getTime() + 23 * 60 * 60 * 1000);
                rangeEnd = new Date(now.getTime() + 25 * 60 * 60 * 1000);
                break;
            case '1h':
                rangeStart = new Date(now.getTime() + 55 * 60 * 1000);
                rangeEnd = new Date(now.getTime() + 65 * 60 * 1000);
                break;
            case '5min':
                rangeStart = new Date(now.getTime() + 4 * 60 * 1000);
                rangeEnd = new Date(now.getTime() + 6 * 60 * 1000);
                break;
        }

        // Find scheduled calls in the reminder window that haven't had this reminder sent
        const { data: calls, error } = await this.supabase
            .from('calls')
            .select('*')
            .eq('status', 'scheduled')
            .not('scheduled_at', 'is', null)
            .gte('scheduled_at', rangeStart.toISOString())
            .lte('scheduled_at', rangeEnd.toISOString())
            .is('deleted_at', null);

        if (error) throw error;
        if (!calls || calls.length === 0) return [];

        // Filter out calls that already had this reminder sent
        const callIds = calls.map((c: Call) => c.id);
        const { data: sentReminders, error: sentError } = await this.supabase
            .from('call_reminders_sent')
            .select('call_id')
            .in('call_id', callIds)
            .eq('reminder_type', reminderType);

        if (sentError) throw sentError;

        const sentCallIds = new Set((sentReminders || []).map((r: { call_id: string }) => r.call_id));
        const unsentCalls = calls.filter((c: Call) => !sentCallIds.has(c.id));

        if (unsentCalls.length === 0) return [];

        // Enrich with participants
        return this.enrichWithParticipants(unsentCalls as Call[]);
    }

    async markReminderSent(callId: string, reminderType: string): Promise<void> {
        const { error } = await this.supabase
            .from('call_reminders_sent')
            .insert({ call_id: callId, reminder_type: reminderType });

        if (error) throw error;
    }

    // ── Timeout Queries ──────────────────────────────────────────────────

    async getTimedOutInstantCalls(): Promise<string[]> {
        const fiveMinAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString();

        const { data: calls, error } = await this.supabase
            .from('calls')
            .select('id')
            .eq('status', 'scheduled')
            .is('scheduled_at', null)
            .lt('created_at', fiveMinAgo)
            .is('deleted_at', null);

        if (error) throw error;
        if (!calls || calls.length === 0) return [];

        // Filter out calls where any participant has joined
        const callIds = calls.map((c: { id: string }) => c.id);
        const { data: joinedParticipants, error: pError } = await this.supabase
            .from('call_participants')
            .select('call_id')
            .in('call_id', callIds)
            .not('joined_at', 'is', null);

        if (pError) throw pError;

        const joinedCallIds = new Set(
            (joinedParticipants || []).map((p: { call_id: string }) => p.call_id),
        );

        return callIds.filter((id: string) => !joinedCallIds.has(id));
    }

    async getNoShowScheduledCalls(): Promise<string[]> {
        const fifteenMinAgo = new Date(Date.now() - 15 * 60 * 1000).toISOString();

        const { data: calls, error } = await this.supabase
            .from('calls')
            .select('id')
            .eq('status', 'scheduled')
            .not('scheduled_at', 'is', null)
            .lt('scheduled_at', fifteenMinAgo)
            .is('deleted_at', null);

        if (error) throw error;
        if (!calls || calls.length === 0) return [];

        // Filter out calls where any participant has joined
        const callIds = calls.map((c: { id: string }) => c.id);
        const { data: joinedParticipants, error: pError } = await this.supabase
            .from('call_participants')
            .select('call_id')
            .in('call_id', callIds)
            .not('joined_at', 'is', null);

        if (pError) throw pError;

        const joinedCallIds = new Set(
            (joinedParticipants || []).map((p: { call_id: string }) => p.call_id),
        );

        return callIds.filter((id: string) => !joinedCallIds.has(id));
    }

    // ── Status Updates ───────────────────────────────────────────────────

    async markCallMissed(callId: string): Promise<void> {
        const { error } = await this.supabase
            .from('calls')
            .update({ status: 'missed', updated_at: new Date().toISOString() })
            .eq('id', callId);

        if (error) throw error;
    }

    async markCallNoShow(callId: string): Promise<void> {
        const { error } = await this.supabase
            .from('calls')
            .update({ status: 'no_show', updated_at: new Date().toISOString() })
            .eq('id', callId);

        if (error) throw error;
    }

    // ── Private Helpers ──────────────────────────────────────────────────

    private async enrichWithParticipants(
        calls: Call[],
    ): Promise<CallWithParticipantsForReminder[]> {
        const callIds = calls.map((c) => c.id);

        const { data: participants, error: pError } = await this.supabase
            .from('call_participants')
            .select('*')
            .in('call_id', callIds);

        if (pError) throw pError;

        const userIds = [...new Set(
            (participants || []).map((p: { user_id: string }) => p.user_id),
        )];

        const userMap = new Map<string, {
            name: string; avatar_url: string | null; email: string;
        }>();

        if (userIds.length > 0) {
            const { data: users, error: uError } = await this.supabase
                .from('users')
                .select('id, name, profile_image_url, email')
                .in('id', userIds);

            if (uError) throw uError;
            for (const u of users || []) {
                userMap.set(u.id, {
                    name: u.name || '',
                    avatar_url: u.profile_image_url || null,
                    email: u.email || '',
                });
            }
        }

        const defaultUser = { name: '', avatar_url: null, email: '' };

        return calls.map((call) => ({
            ...call,
            participants: (participants || [])
                .filter((p: { call_id: string }) => p.call_id === call.id)
                .map((p: any) => ({
                    ...p,
                    user: userMap.get(p.user_id) || defaultUser,
                })),
        }));
    }
}
