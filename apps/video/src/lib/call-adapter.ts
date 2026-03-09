import type { CallContext } from '@splits-network/shared-video';
import type { CallDetail } from './types';

/**
 * Adapt call-service CallDetail to shared-video CallContext.
 * Bridges the call data model to the shared-video components.
 */
export function adaptCallToCallContext(call: CallDetail): CallContext {
    const jobLink = call.entity_links.find((l) => l.entity_type === 'job');

    return {
        id: call.id,
        call_type: call.call_type,
        title: call.title,
        scheduled_at: call.scheduled_at ?? new Date().toISOString(),
        status: call.status,
        scheduled_duration_minutes: 60,
        reschedule_count: 0,
        recording_enabled: false,
        participants: call.participants.map((p) => ({
            id: p.id,
            role: p.role,
            name: `${p.user.first_name} ${p.user.last_name}`,
            avatar_url: p.user.avatar_url,
        })),
        job: jobLink
            ? { id: jobLink.entity_id, title: call.title || 'Call', company_name: '' }
            : { id: '', title: call.title || 'Video Call', company_name: '' },
    };
}
