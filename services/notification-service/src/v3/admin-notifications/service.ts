/**
 * Admin Notifications V3 Service — Business Logic
 *
 * Admin-only operations on site notifications and notification log.
 * No HTTP concepts. Typed errors only.
 */

import { SupabaseClient } from '@supabase/supabase-js';
import { AccessContextResolver } from '@splits-network/shared-access-context';
import { NotFoundError, ForbiddenError } from '@splits-network/shared-fastify';
import { AdminNotificationRepository } from './repository';
import {
  AdminListParams,
  CreateSiteNotificationInput,
  UpdateSiteNotificationInput,
} from './types';
import { IEventPublisher } from '../../v2/shared/events';

export class AdminNotificationService {
  private accessResolver: AccessContextResolver;

  constructor(
    private repository: AdminNotificationRepository,
    private supabase: SupabaseClient,
    private eventPublisher?: IEventPublisher,
  ) {
    this.accessResolver = new AccessContextResolver(supabase);
  }

  private async requireAdmin(clerkUserId: string) {
    const context = await this.accessResolver.resolve(clerkUserId);
    if (!context.isPlatformAdmin) {
      throw new ForbiddenError('Only admins can manage site notifications');
    }
    return context;
  }

  async listSiteNotifications(params: AdminListParams, clerkUserId: string) {
    await this.requireAdmin(clerkUserId);
    const { data, total } = await this.repository.findAllSiteNotifications(params);
    const page = params.page || 1;
    const limit = Math.min(params.limit || 25, 100);
    return {
      data,
      pagination: { total, page, limit, total_pages: Math.ceil(total / limit) },
    };
  }

  async getSiteNotification(id: string, clerkUserId: string) {
    await this.requireAdmin(clerkUserId);
    const notification = await this.repository.findSiteNotificationById(id);
    if (!notification) throw new NotFoundError('SiteNotification', id);
    return notification;
  }

  async createSiteNotification(input: CreateSiteNotificationInput, clerkUserId: string) {
    const context = await this.requireAdmin(clerkUserId);
    const record = {
      type: input.type,
      severity: input.severity,
      source: 'admin',
      title: input.title,
      message: input.message || null,
      starts_at: input.starts_at || null,
      expires_at: input.expires_at || null,
      is_active: input.is_active !== undefined ? input.is_active : true,
      dismissible: input.dismissible !== undefined ? input.dismissible : true,
      created_by: context.identityUserId || null,
    };
    return this.repository.createSiteNotification(record);
  }

  async updateSiteNotification(
    id: string,
    input: UpdateSiteNotificationInput,
    clerkUserId: string,
  ) {
    await this.requireAdmin(clerkUserId);
    const existing = await this.repository.findSiteNotificationById(id);
    if (!existing) throw new NotFoundError('SiteNotification', id);
    return this.repository.updateSiteNotification(id, input);
  }

  async deleteSiteNotification(id: string, clerkUserId: string) {
    await this.requireAdmin(clerkUserId);
    const existing = await this.repository.findSiteNotificationById(id);
    if (!existing) throw new NotFoundError('SiteNotification', id);
    await this.repository.deleteSiteNotification(id);
  }

  async listNotificationLog(params: AdminListParams, clerkUserId: string) {
    await this.requireAdmin(clerkUserId);
    const { data, total } = await this.repository.findAllNotificationLog(params);
    const page = params.page || 1;
    const limit = Math.min(params.limit || 25, 100);
    return {
      data,
      pagination: { total, page, limit, total_pages: Math.ceil(total / limit) },
    };
  }

  async getAdminCounts(clerkUserId: string) {
    await this.requireAdmin(clerkUserId);
    return this.repository.getAdminCounts();
  }
}
