/**
 * Candidate Skills V3 Service — Business Logic
 *
 * Owner or admin can manage candidate skills.
 */

import { SupabaseClient } from '@supabase/supabase-js';
import { AccessContextResolver } from '@splits-network/shared-access-context';
import { ForbiddenError } from '@splits-network/shared-fastify';
import { CandidateSkillRepository } from './repository';
import { CreateCandidateSkillInput } from './types';

export class CandidateSkillService {
  private accessResolver: AccessContextResolver;

  constructor(
    private repository: CandidateSkillRepository,
    private supabase: SupabaseClient
  ) {
    this.accessResolver = new AccessContextResolver(supabase);
  }

  async listByCandidateId(candidateId: string, clerkUserId: string) {
    await this.assertAccess(clerkUserId);
    return this.repository.findByCandidateId(candidateId);
  }

  async create(input: CreateCandidateSkillInput, clerkUserId: string) {
    await this.assertAccess(clerkUserId);
    return this.repository.create({
      candidate_id: input.candidate_id,
      skill_id: input.skill_id,
      proficiency_level: input.proficiency_level || null,
    });
  }

  async delete(candidateId: string, skillId: string, clerkUserId: string) {
    await this.assertAccess(clerkUserId);
    await this.repository.delete(candidateId, skillId);
  }

  async bulkReplace(
    candidateId: string,
    skills: Array<{ skill_id: string; proficiency_level?: string }>,
    clerkUserId: string
  ) {
    await this.assertAccess(clerkUserId);
    return this.repository.bulkReplace(candidateId, skills);
  }

  private async assertAccess(clerkUserId: string) {
    const context = await this.accessResolver.resolve(clerkUserId);
    if (!context.isPlatformAdmin && !context.recruiterId && !context.candidateId) {
      throw new ForbiddenError('Insufficient permissions');
    }
  }
}
