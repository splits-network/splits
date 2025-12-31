/**
 * Fixed invitations service tests to match actual implementation
 */
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { InvitationsService, InvitationInput } from '../../src/services/invitations/service';
import { IdentityRepository } from '../../src/repository';
import { EventPublisher } from '../../src/events';

describe('InvitationsService', () => {
    let service: InvitationsService;
    let mockRepository: any;
    let mockEventPublisher: any;

    beforeEach(() => {
        mockRepository = {
            createInvitation: vi.fn(),
            findInvitationById: vi.fn(),
            findInvitationByClerkId: vi.fn(),
            findInvitationsByOrganization: vi.fn(),
            findPendingInvitationsByEmail: vi.fn(),
            findPendingInvitationByEmailAndOrg: vi.fn(),
            updateInvitation: vi.fn(),
            deleteInvitation: vi.fn(),
            deleteExpiredInvitations: vi.fn(),
            createMembership: vi.fn(),
        };

        mockEventPublisher = {
            publish: vi.fn(),
        };

        service = new InvitationsService(mockRepository, mockEventPublisher);
    });

    describe('createInvitation', () => {
        it('should create invitation successfully', async () => {
            const invitationData: InvitationInput = {
                email: 'user@example.com',
                organization_id: 'org123',
                role: 'hiring_manager',
                invited_by: 'inviter123'
            };

            const mockInvitation = {
                id: 'invitation123',
                ...invitationData,
                clerk_invitation_id: null,
                status: 'pending',
                expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
                accepted_at: null,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
            };

            mockRepository.findPendingInvitationByEmailAndOrg.mockResolvedValue(null);
            mockRepository.createInvitation.mockResolvedValue(mockInvitation);

            const result = await service.createInvitation(invitationData);

            expect(result).toEqual(mockInvitation);
            expect(mockRepository.createInvitation).toHaveBeenCalledWith(invitationData);
            expect(mockEventPublisher.publish).toHaveBeenCalledWith(
                'invitation.created',
                expect.objectContaining({
                    invitation_id: mockInvitation.id,
                    email: invitationData.email,
                    organization_id: invitationData.organization_id
                }),
                'identity-service'
            );
        });

        it('should throw error when invitation already exists', async () => {
            const invitationData: InvitationInput = {
                email: 'user@example.com',
                organization_id: 'org123',
                role: 'hiring_manager',
                invited_by: 'inviter123'
            };

            const existingInvitation = {
                id: 'existing123',
                ...invitationData,
                status: 'pending'
            };

            mockRepository.findPendingInvitationByEmailAndOrg.mockResolvedValue(existingInvitation);

            await expect(
                service.createInvitation(invitationData)
            ).rejects.toThrow('An invitation for this email already exists for this organization');
        });
    });

    describe('getInvitation', () => {
        it('should return invitation when found', async () => {
            const mockInvitation = {
                id: 'invitation123',
                email: 'user@example.com',
                organization_id: 'org123'
            };

            mockRepository.findInvitationById.mockResolvedValue(mockInvitation);

            const result = await service.getInvitation('invitation123');

            expect(result).toEqual(mockInvitation);
            expect(mockRepository.findInvitationById).toHaveBeenCalledWith('invitation123');
        });

        it('should return null when invitation not found', async () => {
            mockRepository.findInvitationById.mockResolvedValue(null);

            const result = await service.getInvitation('nonexistent');

            expect(result).toBeNull();
        });
    });

    describe('getOrganizationInvitations', () => {
        it('should return organization invitations', async () => {
            const mockInvitations = [
                { id: 'invitation1', organization_id: 'org123' },
                { id: 'invitation2', organization_id: 'org123' }
            ];

            mockRepository.findInvitationsByOrganization.mockResolvedValue(mockInvitations);

            const result = await service.getOrganizationInvitations('org123');

            expect(result).toEqual(mockInvitations);
            expect(mockRepository.findInvitationsByOrganization).toHaveBeenCalledWith('org123');
        });
    });

    describe('getPendingInvitationsForEmail', () => {
        it('should return pending invitations for email', async () => {
            const mockInvitations = [
                { id: 'invitation1', email: 'user@example.com', status: 'pending' }
            ];

            mockRepository.findPendingInvitationsByEmail.mockResolvedValue(mockInvitations);

            const result = await service.getPendingInvitationsForEmail('user@example.com');

            expect(result).toEqual(mockInvitations);
            expect(mockRepository.findPendingInvitationsByEmail).toHaveBeenCalledWith('user@example.com');
        });
    });

    describe('acceptInvitation', () => {
        it('should accept invitation successfully', async () => {
            const mockInvitation = {
                id: 'invitation123',
                status: 'pending',
                expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // 1 day from now
                organization_id: 'org123',
                role: 'hiring_manager'
            };

            mockRepository.findInvitationById.mockResolvedValue(mockInvitation);
            mockRepository.createMembership.mockResolvedValue({});
            mockRepository.updateInvitation.mockResolvedValue({});

            await service.acceptInvitation('invitation123', 'user123');

            expect(mockRepository.createMembership).toHaveBeenCalledWith({
                user_id: 'user123',
                organization_id: 'org123',
                role: 'hiring_manager'
            });
            expect(mockRepository.updateInvitation).toHaveBeenCalledWith('invitation123', {
                status: 'accepted',
                accepted_at: expect.any(String)
            });
        });

        it('should throw error for non-existent invitation', async () => {
            mockRepository.findInvitationById.mockResolvedValue(null);

            await expect(
                service.acceptInvitation('nonexistent', 'user123')
            ).rejects.toThrow('Invitation not found');
        });

        it('should throw error for non-pending invitation', async () => {
            const mockInvitation = {
                id: 'invitation123',
                status: 'accepted'
            };

            mockRepository.findInvitationById.mockResolvedValue(mockInvitation);

            await expect(
                service.acceptInvitation('invitation123', 'user123')
            ).rejects.toThrow('Invitation is not pending');
        });

        it('should throw error for expired invitation', async () => {
            const mockInvitation = {
                id: 'invitation123',
                status: 'pending',
                expires_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString() // 1 day ago
            };

            mockRepository.findInvitationById.mockResolvedValue(mockInvitation);
            mockRepository.updateInvitation.mockResolvedValue({});

            await expect(
                service.acceptInvitation('invitation123', 'user123')
            ).rejects.toThrow('Invitation has expired');

            expect(mockRepository.updateInvitation).toHaveBeenCalledWith('invitation123', { status: 'expired' });
        });
    });

    describe('revokeInvitation', () => {
        it('should revoke invitation successfully', async () => {
            const mockInvitation = {
                id: 'invitation123',
                email: 'user@example.com',
                organization_id: 'org123'
            };

            mockRepository.findInvitationById.mockResolvedValue(mockInvitation);
            mockRepository.updateInvitation.mockResolvedValue({});

            await service.revokeInvitation('invitation123');

            expect(mockRepository.updateInvitation).toHaveBeenCalledWith('invitation123', { status: 'revoked' });
            expect(mockEventPublisher.publish).toHaveBeenCalledWith(
                'invitation.revoked',
                {
                    invitation_id: 'invitation123',
                    email: 'user@example.com',
                    organization_id: 'org123'
                },
                'identity-service'
            );
        });

        it('should throw error when invitation not found', async () => {
            mockRepository.findInvitationById.mockResolvedValue(null);

            await expect(
                service.revokeInvitation('nonexistent')
            ).rejects.toThrow('Invitation not found');
        });
    });

    describe('deleteInvitation', () => {
        it('should delete invitation successfully', async () => {
            mockRepository.deleteInvitation.mockResolvedValue({});

            await service.deleteInvitation('invitation123');

            expect(mockRepository.deleteInvitation).toHaveBeenCalledWith('invitation123');
        });
    });

    describe('cleanupExpiredInvitations', () => {
        it('should cleanup expired invitations', async () => {
            mockRepository.deleteExpiredInvitations.mockResolvedValue(5);

            const result = await service.cleanupExpiredInvitations();

            expect(result).toBe(5);
            expect(mockRepository.deleteExpiredInvitations).toHaveBeenCalled();
        });
    });
});