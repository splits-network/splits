import { describe, it, expect, vi } from 'vitest';
import { ChatServiceV2 } from '../src/v2/chat/service';
import { AccessContextResolver } from '@splits-network/shared-access-context';
import { ChatRepository } from '../src/v2/chat/repository';
import { ChatConversation, ChatMessage, ChatParticipantState } from '../src/v2/chat/types';

function createSupabaseMock(otherParticipant: ChatParticipantState | null, message?: ChatMessage) {
    return {
        rpc: vi.fn().mockResolvedValue({ data: message ?? null, error: null }),
        from: vi.fn(() => ({
            select: vi.fn().mockReturnThis(),
            eq: vi.fn().mockReturnThis(),
            neq: vi.fn().mockReturnThis(),
            maybeSingle: vi.fn().mockResolvedValue({ data: otherParticipant, error: null }),
        })),
    };
}

function createRepositoryMock(options: {
    participant: ChatParticipantState;
    otherParticipant: ChatParticipantState | null;
    isBlocked?: boolean;
    existingMessages?: number;
    rpcMessage?: ChatMessage;
    conversation?: ChatConversation | null;
    createdConversation?: ChatConversation;
    messages?: ChatMessage[];
}) {
    const supabase = createSupabaseMock(options.otherParticipant, options.rpcMessage);

    return {
        getSupabase: () => supabase,
        getParticipantState: vi.fn().mockResolvedValue(options.participant),
        listMessages: vi.fn().mockResolvedValue(
            options.messages ??
                Array.from({ length: options.existingMessages ?? 0 }, (_, idx) => ({
                    id: `msg-${idx}`,
                }))
        ),
        isBlocked: vi.fn().mockResolvedValue(options.isBlocked ?? false),
        findConversation: vi.fn().mockResolvedValue(options.conversation ?? null),
        createConversation: vi.fn().mockResolvedValue(options.createdConversation ?? options.conversation),
        ensureParticipants: vi.fn(),
        listConversations: vi.fn(),
        getConversation: vi.fn().mockResolvedValue(options.conversation ?? null),
        updateParticipantState: vi.fn(),
        setReadReceipt: vi.fn(),
        findAttachment: vi.fn(),
    } as unknown as ChatRepository;
}

function mockAccessContext(identityUserId: string) {
    vi.spyOn(AccessContextResolver.prototype, 'resolve').mockResolvedValue({
        identityUserId,
        candidateId: null,
        recruiterId: null,
        organizationIds: [],
        roles: [],
        isPlatformAdmin: false,
        error: '',
    });
}

describe('ChatServiceV2', () => {
    it('blocks send when request is pending for sender', async () => {
        mockAccessContext('user-1');
        const repository = createRepositoryMock({
            participant: {
                conversation_id: 'conv-1',
                user_id: 'user-1',
                request_state: 'pending',
                unread_count: 0,
                muted_at: null,
                archived_at: null,
                last_read_at: null,
                last_read_message_id: null,
            },
            otherParticipant: {
                conversation_id: 'conv-1',
                user_id: 'user-2',
                request_state: 'accepted',
                unread_count: 0,
                muted_at: null,
                archived_at: null,
                last_read_at: null,
                last_read_message_id: null,
            },
        });

        const service = new ChatServiceV2(repository);
        await expect(
            service.sendMessage('clerk-user-1', 'conv-1', { body: 'hello' })
        ).rejects.toThrow('Accept this request to reply');
    });

    it('blocks send when recipient is pending and already has a message', async () => {
        mockAccessContext('user-1');
        const repository = createRepositoryMock({
            participant: {
                conversation_id: 'conv-1',
                user_id: 'user-1',
                request_state: 'accepted',
                unread_count: 0,
                muted_at: null,
                archived_at: null,
                last_read_at: null,
                last_read_message_id: null,
            },
            otherParticipant: {
                conversation_id: 'conv-1',
                user_id: 'user-2',
                request_state: 'pending',
                unread_count: 0,
                muted_at: null,
                archived_at: null,
                last_read_at: null,
                last_read_message_id: null,
            },
            existingMessages: 1,
        });

        const service = new ChatServiceV2(repository);
        await expect(
            service.sendMessage('clerk-user-1', 'conv-1', { body: 'hello' })
        ).rejects.toThrow('Request pending; cannot send additional messages');
    });

    it('blocks send when user is blocked', async () => {
        mockAccessContext('user-1');
        const repository = createRepositoryMock({
            participant: {
                conversation_id: 'conv-1',
                user_id: 'user-1',
                request_state: 'accepted',
                unread_count: 0,
                muted_at: null,
                archived_at: null,
                last_read_at: null,
                last_read_message_id: null,
            },
            otherParticipant: {
                conversation_id: 'conv-1',
                user_id: 'user-2',
                request_state: 'accepted',
                unread_count: 0,
                muted_at: null,
                archived_at: null,
                last_read_at: null,
                last_read_message_id: null,
            },
            isBlocked: true,
        });

        const service = new ChatServiceV2(repository);
        await expect(
            service.sendMessage('clerk-user-1', 'conv-1', { body: 'hello' })
        ).rejects.toThrow('Message could not be delivered');
    });

    it('sends message via RPC when allowed', async () => {
        mockAccessContext('user-1');
        const repository = createRepositoryMock({
            participant: {
                conversation_id: 'conv-1',
                user_id: 'user-1',
                request_state: 'accepted',
                unread_count: 0,
                muted_at: null,
                archived_at: null,
                last_read_at: null,
                last_read_message_id: null,
            },
            otherParticipant: {
                conversation_id: 'conv-1',
                user_id: 'user-2',
                request_state: 'accepted',
                unread_count: 0,
                muted_at: null,
                archived_at: null,
                last_read_at: null,
                last_read_message_id: null,
            },
            rpcMessage: {
                id: 'msg-1',
                conversation_id: 'conv-1',
                sender_id: 'user-1',
                kind: 'user',
                body: 'hello',
                created_at: new Date().toISOString(),
            },
        });

        const service = new ChatServiceV2(repository);
        const message = await service.sendMessage('clerk-user-1', 'conv-1', { body: 'hello' });
        expect(message.id).toBe('msg-1');
    });

    it('updates read receipt via RPC', async () => {
        mockAccessContext('user-1');
        const repository = createRepositoryMock({
            participant: {
                conversation_id: 'conv-1',
                user_id: 'user-1',
                request_state: 'accepted',
                unread_count: 0,
                muted_at: null,
                archived_at: null,
                last_read_at: null,
                last_read_message_id: null,
            },
            otherParticipant: {
                conversation_id: 'conv-1',
                user_id: 'user-2',
                request_state: 'accepted',
                unread_count: 0,
                muted_at: null,
                archived_at: null,
                last_read_at: null,
                last_read_message_id: null,
            },
        });

        const service = new ChatServiceV2(repository);
        await service.updateReadReceipt('clerk-user-1', 'conv-1', 'msg-1');

        const supabase = repository.getSupabase() as any;
        expect(supabase.rpc).toHaveBeenCalledWith('chat_mark_read', {
            p_conversation_id: 'conv-1',
            p_user_id: 'user-1',
            p_last_read_message_id: 'msg-1',
        });
    });

    it('returns existing conversation when already created', async () => {
        mockAccessContext('user-1');
        const existingConversation: ChatConversation = {
            id: 'conv-1',
            participant_a_id: 'user-1',
            participant_b_id: 'user-2',
            job_id: null,
            application_id: null,
            company_id: null,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            last_message_at: null,
            last_message_id: null,
        };
        const repository = createRepositoryMock({
            participant: {
                conversation_id: 'conv-1',
                user_id: 'user-1',
                request_state: 'accepted',
                unread_count: 0,
                muted_at: null,
                archived_at: null,
                last_read_at: null,
                last_read_message_id: null,
            },
            otherParticipant: {
                conversation_id: 'conv-1',
                user_id: 'user-2',
                request_state: 'pending',
                unread_count: 0,
                muted_at: null,
                archived_at: null,
                last_read_at: null,
                last_read_message_id: null,
            },
            conversation: existingConversation,
        });

        const service = new ChatServiceV2(repository);
        const conversation = await service.createOrFindConversation('clerk-user-1', {
            participantUserId: 'user-2',
        });

        expect(conversation.id).toBe('conv-1');
        expect(repository.findConversation).toHaveBeenCalled();
        expect(repository.createConversation).not.toHaveBeenCalled();
    });

    it('creates conversation when none exists and ensures participants', async () => {
        mockAccessContext('user-1');
        const createdConversation: ChatConversation = {
            id: 'conv-2',
            participant_a_id: 'user-1',
            participant_b_id: 'user-2',
            job_id: null,
            application_id: null,
            company_id: null,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            last_message_at: null,
            last_message_id: null,
        };
        const repository = createRepositoryMock({
            participant: {
                conversation_id: 'conv-2',
                user_id: 'user-1',
                request_state: 'accepted',
                unread_count: 0,
                muted_at: null,
                archived_at: null,
                last_read_at: null,
                last_read_message_id: null,
            },
            otherParticipant: {
                conversation_id: 'conv-2',
                user_id: 'user-2',
                request_state: 'pending',
                unread_count: 0,
                muted_at: null,
                archived_at: null,
                last_read_at: null,
                last_read_message_id: null,
            },
            createdConversation,
        });

        const service = new ChatServiceV2(repository);
        const conversation = await service.createOrFindConversation('clerk-user-1', {
            participantUserId: 'user-2',
        });

        expect(conversation.id).toBe('conv-2');
        expect(repository.createConversation).toHaveBeenCalled();
        expect(repository.ensureParticipants).toHaveBeenCalledWith('conv-2', [
            { user_id: 'user-1', request_state: 'accepted' },
            { user_id: 'user-2', request_state: 'pending' },
        ]);
    });

    it('resyncs conversation with participant and messages', async () => {
        mockAccessContext('user-1');
        const conversation: ChatConversation = {
            id: 'conv-3',
            participant_a_id: 'user-1',
            participant_b_id: 'user-2',
            job_id: null,
            application_id: null,
            company_id: null,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            last_message_at: null,
            last_message_id: null,
        };
        const repository = createRepositoryMock({
            participant: {
                conversation_id: 'conv-3',
                user_id: 'user-1',
                request_state: 'accepted',
                unread_count: 0,
                muted_at: null,
                archived_at: null,
                last_read_at: null,
                last_read_message_id: null,
            },
            otherParticipant: {
                conversation_id: 'conv-3',
                user_id: 'user-2',
                request_state: 'accepted',
                unread_count: 0,
                muted_at: null,
                archived_at: null,
                last_read_at: null,
                last_read_message_id: null,
            },
            conversation,
            messages: [
                {
                    id: 'msg-1',
                    conversation_id: 'conv-3',
                    sender_id: 'user-1',
                    kind: 'user',
                    body: 'hello',
                    created_at: new Date().toISOString(),
                },
            ],
        });

        const service = new ChatServiceV2(repository);
        const result = await service.resyncConversation('clerk-user-1', 'conv-3');

        expect(result.conversation.id).toBe('conv-3');
        expect(result.participant.user_id).toBe('user-1');
        expect(result.messages).toHaveLength(1);
    });
});
