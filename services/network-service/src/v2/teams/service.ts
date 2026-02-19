/**
 * Team Service - Business logic for teams, members, and invitations
 */

import { EventPublisherV2 } from '../shared/events';
import { TeamRepository } from './repository';
import { buildPaginationResponse, PaginationResponse } from '../shared/pagination';
import { TeamFilters, TeamUpdate, TeamMemberFilters, CreateTeamRequest, CreateTeamInvitationRequest } from './types';

export class TeamServiceV2 {
    constructor(
        private repository: TeamRepository,
        private eventPublisher: EventPublisherV2
    ) {}

    // ── Teams ──

    async getTeams(
        clerkUserId: string,
        filters: TeamFilters
    ): Promise<PaginationResponse<any>> {
        const result = await this.repository.findTeams(clerkUserId, filters);

        return buildPaginationResponse(
            result.data,
            result.total,
            filters.page || 1,
            filters.limit || 25
        );
    }

    async getTeam(id: string): Promise<any> {
        const team = await this.repository.findTeam(id);
        if (!team) {
            throw { statusCode: 404, message: 'Team not found' };
        }
        return team;
    }

    async createTeam(
        data: CreateTeamRequest,
        clerkUserId: string
    ): Promise<any> {
        if (!data.name || !data.name.trim()) {
            throw { statusCode: 400, message: 'Team name is required' };
        }

        const team = await this.repository.createTeam(
            { name: data.name.trim() },
            clerkUserId
        );

        await this.eventPublisher.publish('team.created', {
            teamId: team.id,
            name: team.name,
            ownerUserId: clerkUserId,
        });

        return team;
    }

    async updateTeam(
        id: string,
        updates: TeamUpdate,
        clerkUserId: string
    ): Promise<any> {
        const current = await this.repository.findTeam(id);
        if (!current) {
            throw { statusCode: 404, message: 'Team not found' };
        }

        if (updates.status) {
            this.validateStatusTransition(current.status, updates.status);
        }

        const team = await this.repository.updateTeam(id, updates);

        await this.eventPublisher.publish('team.updated', {
            teamId: id,
            updates: Object.keys(updates),
        });

        return team;
    }

    async deleteTeam(id: string, clerkUserId: string): Promise<void> {
        const team = await this.repository.findTeam(id);
        if (!team) {
            throw { statusCode: 404, message: 'Team not found' };
        }

        await this.repository.deleteTeam(id);

        await this.eventPublisher.publish('team.deleted', {
            teamId: id,
        });
    }

    // ── Members ──

    async getTeamMembers(
        teamId: string,
        filters: TeamMemberFilters
    ): Promise<PaginationResponse<any>> {
        const result = await this.repository.findTeamMembers(teamId, filters);

        return buildPaginationResponse(
            result.data,
            result.total,
            filters.page || 1,
            filters.limit || 50
        );
    }

    async removeTeamMember(
        teamId: string,
        memberId: string,
        clerkUserId: string
    ): Promise<void> {
        const member = await this.repository.findTeamMember(memberId);
        if (!member) {
            throw { statusCode: 404, message: 'Team member not found' };
        }
        if (member.role === 'owner') {
            throw { statusCode: 400, message: 'Cannot remove the team owner' };
        }

        await this.repository.removeTeamMember(teamId, memberId);

        await this.eventPublisher.publish('team.member.removed', {
            teamId,
            memberId,
            removedBy: clerkUserId,
        });
    }

    // ── Invitations ──

    async createTeamInvitation(
        teamId: string,
        data: CreateTeamInvitationRequest,
        clerkUserId: string
    ): Promise<any> {
        if (!data.email || !data.email.trim()) {
            throw { statusCode: 400, message: 'Email is required' };
        }
        if (!['admin', 'member', 'collaborator'].includes(data.role)) {
            throw { statusCode: 400, message: 'Role must be admin, member, or collaborator' };
        }

        const invitation = await this.repository.createTeamInvitation(
            teamId,
            { email: data.email.trim(), role: data.role },
            clerkUserId
        );

        await this.eventPublisher.publish('team.invitation.created', {
            teamId,
            invitationId: invitation.id,
            email: data.email,
            role: data.role,
            invitedBy: clerkUserId,
        });

        return invitation;
    }

    // ── Private helpers ──

    private validateStatusTransition(currentStatus: string, newStatus: string): void {
        const validTransitions: Record<string, string[]> = {
            active: ['suspended'],
            suspended: ['active'],
        };

        const allowed = validTransitions[currentStatus] || [];
        if (!allowed.includes(newStatus)) {
            throw {
                statusCode: 400,
                message: `Cannot transition team from ${currentStatus} to ${newStatus}`,
            };
        }
    }
}
