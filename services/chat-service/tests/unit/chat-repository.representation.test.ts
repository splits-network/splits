import { describe, it, expect } from 'vitest';
import { ChatRepository } from '../../src/v2/chat/repository';

function createSupabaseMock(responses: Record<string, any[]>) {
    return {
        from: (table: string) => {
            const chain = {
                select: () => chain,
                eq: () => chain,
                maybeSingle: async () => {
                    const next = responses[table]?.shift();
                    return next ?? { data: null, error: null };
                },
            };
            return chain;
        },
    };
}

describe('ChatRepository.resolveRepresentation (unit)', () => {
    it('returns no route when candidate is missing', async () => {
        const repo = new ChatRepository('http://supabase', 'key');
        (repo as any).supabase = createSupabaseMock({
            candidates: [{ data: null, error: null }],
        });

        const result = await repo.resolveRepresentation('user-cand', 'user-sender');
        expect(result.routed).toBe(false);
    });

    it('returns no route when relationship is expired', async () => {
        const repo = new ChatRepository('http://supabase', 'key');
        const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
        (repo as any).supabase = createSupabaseMock({
            candidates: [{ data: { id: 'cand-1', full_name: 'Jane' }, error: null }],
            recruiter_candidates: [
                { data: { recruiter_id: 'rec-1', relationship_end_date: yesterday }, error: null },
            ],
        });

        const result = await repo.resolveRepresentation('user-cand', 'user-sender');
        expect(result.routed).toBe(false);
    });

    it('returns no route when recruiter is the sender', async () => {
        const repo = new ChatRepository('http://supabase', 'key');
        const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
        (repo as any).supabase = createSupabaseMock({
            candidates: [{ data: { id: 'cand-1', full_name: 'Jane' }, error: null }],
            recruiter_candidates: [
                { data: { recruiter_id: 'rec-1', relationship_end_date: tomorrow }, error: null },
            ],
            candidate_sourcers: [
                { data: { sourcer_recruiter_id: 'rec-1', protection_expires_at: tomorrow }, error: null },
            ],
            recruiters: [{ data: { id: 'rec-1', user_id: 'user-sender' }, error: null }],
        });

        const result = await repo.resolveRepresentation('user-cand', 'user-sender');
        expect(result.routed).toBe(false);
    });

    it('routes to recruiter when relationship and protection are active', async () => {
        const repo = new ChatRepository('http://supabase', 'key');
        const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
        (repo as any).supabase = createSupabaseMock({
            candidates: [{ data: { id: 'cand-1', full_name: 'Jane' }, error: null }],
            recruiter_candidates: [
                { data: { recruiter_id: 'rec-1', relationship_end_date: tomorrow }, error: null },
            ],
            candidate_sourcers: [
                { data: { sourcer_recruiter_id: 'rec-1', protection_expires_at: tomorrow }, error: null },
            ],
            recruiters: [{ data: { id: 'rec-1', user_id: 'user-rec' }, error: null }],
            users: [{ data: { name: 'Alex Recruiter' }, error: null }],
        });

        const result = await repo.resolveRepresentation('user-cand', 'user-sender');
        expect(result.routed).toBe(true);
        expect(result.recruiterUserId).toBe('user-rec');
        expect(result.candidateId).toBe('cand-1');
        expect(result.candidateName).toBe('Jane');
        expect(result.recruiterName).toBe('Alex Recruiter');
    });
});
