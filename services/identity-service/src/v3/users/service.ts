/**
 * Users V3 Service — Business Logic
 *
 * Handles authorization, validation, and event publishing.
 * No HTTP concepts.
 */

import { SupabaseClient } from '@supabase/supabase-js';
import { AccessContextResolver } from '@splits-network/shared-access-context';
import { BadRequestError, NotFoundError } from '@splits-network/shared-fastify';
import { IEventPublisher } from '../../v2/shared/events';
import { UserRepository } from './repository';
import { CreateUserInput, UpdateUserInput, RegisterUserInput, UserListParams } from './types';

export class UserService {
  private accessResolver: AccessContextResolver;

  constructor(
    private repository: UserRepository,
    private supabase: SupabaseClient,
    private eventPublisher?: IEventPublisher
  ) {
    this.accessResolver = new AccessContextResolver(supabase);
  }

  async getAll(params: UserListParams, clerkUserId: string) {
    const context = await this.accessResolver.resolve(clerkUserId);
    const scopeFilters: { user_id?: string } = {};

    if (!context.isPlatformAdmin) {
      scopeFilters.user_id = context.identityUserId as string;
    }

    const { data, total } = await this.repository.findAll(params, scopeFilters);
    const page = params.page || 1;
    const limit = Math.min(params.limit || 25, 100);
    return { data, pagination: { total, page, limit, total_pages: Math.ceil(total / limit) } };
  }

  async getById(id: string, clerkUserId: string) {
    const user = await this.repository.findById(id);
    if (!user) throw new NotFoundError('User', id);

    const context = await this.accessResolver.resolve(clerkUserId);
    if (!context.isPlatformAdmin && context.identityUserId !== id) {
      throw new NotFoundError('User', id);
    }
    return user;
  }

  async getMe(clerkUserId: string) {
    const user = await this.repository.findByClerkId(clerkUserId);
    if (!user) throw new NotFoundError('User', clerkUserId);

    const context = await this.accessResolver.resolve(clerkUserId);
    return {
      ...user,
      roles: context.roles,
      is_platform_admin: context.isPlatformAdmin,
      recruiter_id: context.recruiterId,
      candidate_id: context.candidateId,
      organization_ids: context.organizationIds,
      company_ids: context.companyIds,
    };
  }

  async create(input: CreateUserInput, clerkUserId: string) {
    if (!input.email?.trim()) throw new BadRequestError('Email is required');
    if (!input.clerk_user_id?.trim()) throw new BadRequestError('Clerk user ID is required');

    const now = new Date().toISOString();
    const record = {
      clerk_user_id: input.clerk_user_id,
      email: input.email,
      name: input.name || null,
      onboarding_status: 'pending',
      created_at: now,
      updated_at: now,
    };

    const created = await this.repository.create(record);

    await this.eventPublisher?.publish('user.created', {
      user_id: created.id,
      email: created.email,
      clerk_user_id: created.clerk_user_id,
    }, 'identity-service');

    return created;
  }

  async register(clerkUserId: string, input: RegisterUserInput) {
    if (!input.email?.trim()) throw new BadRequestError('Email is required for registration');

    // Idempotent: return existing user if found
    const existing = await this.repository.findByClerkId(clerkUserId);
    if (existing) {
      const mergeUpdates: Record<string, any> = {};
      if ((!existing.name || existing.name.trim() === '') && input.name) {
        mergeUpdates.name = input.name;
      }
      if (!existing.profile_image_url && input.profile_image_url) {
        mergeUpdates.profile_image_url = input.profile_image_url;
      }
      if (Object.keys(mergeUpdates).length > 0) {
        return await this.repository.update(existing.id, mergeUpdates);
      }
      return existing;
    }

    const now = new Date().toISOString();
    try {
      const created = await this.repository.create({
        clerk_user_id: clerkUserId,
        email: input.email,
        name: input.name || '',
        onboarding_status: 'pending',
        onboarding_step: 1,
        referred_by_recruiter_id: input.referred_by_recruiter_id || null,
        created_at: now,
        updated_at: now,
      });

      await this.eventPublisher?.publish('user.registered', {
        userId: created.id,
        clerkUserId,
        email: created.email,
      }, 'identity-service');

      return created;
    } catch (error: any) {
      if (error?.code === '23505' || error?.message?.includes('duplicate')) {
        const raceUser = await this.repository.findByClerkId(clerkUserId);
        if (raceUser) return raceUser;
      }
      throw error;
    }
  }

  async update(id: string, input: UpdateUserInput, clerkUserId: string) {
    const existing = await this.repository.findById(id);
    if (!existing) throw new NotFoundError('User', id);

    const context = await this.accessResolver.resolve(clerkUserId);
    if (!context.isPlatformAdmin && context.identityUserId !== id) {
      throw new NotFoundError('User', id);
    }

    const updated = await this.repository.update(id, input);
    if (!updated) throw new NotFoundError('User', id);

    // Sync name changes to Clerk (non-blocking, best-effort)
    if (input.name !== undefined) {
      this.syncUserNameToClerk(existing.clerk_user_id, input.name).catch(() => {});
    }

    await this.eventPublisher?.publish('user.updated', {
      user_id: id,
      changes: input,
    }, 'identity-service');

    return updated;
  }

  private async syncUserNameToClerk(clerkUserId: string, fullName: string): Promise<void> {
    const secretKey = process.env.APP_CLERK_SECRET_KEY;
    if (!secretKey) {
      console.warn('APP_CLERK_SECRET_KEY not configured, skipping user name sync to Clerk');
      return;
    }

    try {
      const { createClerkClient } = await import('@clerk/backend');
      const clerkClient = createClerkClient({ secretKey });

      const nameParts = (fullName || '').trim().split(' ');
      const firstName = nameParts[0] || '';
      const lastName = nameParts.slice(1).join(' ') || '';

      await clerkClient.users.updateUser(clerkUserId, { firstName, lastName });
      console.info(`User name synced to Clerk: ${clerkUserId} -> ${firstName} ${lastName}`);
    } catch (error) {
      console.error('Failed to sync user name to Clerk:', error);
    }
  }

  async updateMe(clerkUserId: string, input: UpdateUserInput) {
    const user = await this.repository.findByClerkId(clerkUserId);
    if (!user) throw new NotFoundError('User', clerkUserId);
    return this.update(user.id, input, clerkUserId);
  }

  async updateProfileImage(
    clerkUserId: string,
    profileImageData: { profile_image_url: string; profile_image_path: string }
  ) {
    const user = await this.repository.findByClerkId(clerkUserId);
    if (!user) throw new NotFoundError('User', clerkUserId);

    const updated = await this.repository.update(user.id, {
      profile_image_url: profileImageData.profile_image_url,
      profile_image_path: profileImageData.profile_image_path,
    });

    await this.eventPublisher?.publish('user.profile_image_updated', {
      user_id: user.id,
      clerk_user_id: clerkUserId,
      profile_image_url: profileImageData.profile_image_url,
      profile_image_path: profileImageData.profile_image_path,
    }, 'identity-service');

    return updated;
  }

  async deleteProfileImage(clerkUserId: string) {
    const user = await this.repository.findByClerkId(clerkUserId);
    if (!user) throw new NotFoundError('User', clerkUserId);

    const updated = await this.repository.update(user.id, {
      profile_image_url: null,
      profile_image_path: null,
    });

    await this.eventPublisher?.publish('user.profile_image_deleted', {
      user_id: user.id,
      clerk_user_id: clerkUserId,
    }, 'identity-service');

    return updated;
  }

  async touchLastActive(userId: string): Promise<void> {
    await this.repository.updateLastActive(userId);
  }

  async delete(id: string, clerkUserId: string) {
    const existing = await this.repository.findById(id);
    if (!existing) throw new NotFoundError('User', id);

    const context = await this.accessResolver.resolve(clerkUserId);
    if (!context.isPlatformAdmin && context.identityUserId !== id) {
      throw new NotFoundError('User', id);
    }

    await this.repository.delete(id);

    await this.eventPublisher?.publish('user.deleted', {
      user_id: id,
    }, 'identity-service');
  }
}
