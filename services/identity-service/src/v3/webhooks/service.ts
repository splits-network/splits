/**
 * Webhooks V3 Service — Clerk webhook handling
 *
 * Handles user.created, user.updated, session.created events.
 */

import { v4 as uuidv4 } from 'uuid';
import { createLogger } from '@splits-network/shared-logging';
import type { Logger } from '@splits-network/shared-logging';
import { IEventPublisher } from '../../v2/shared/events.js';
import { WebhookRepository } from './repository.js';
import { ClerkWebhookEvent, WebhookSourceApp } from './types.js';

export class WebhookService {
  private logger: Logger;

  constructor(
    private repository: WebhookRepository,
    private events: IEventPublisher
  ) {
    this.logger = createLogger({ serviceName: 'identity-service', level: 'info' });
  }

  async handleClerkWebhook(event: ClerkWebhookEvent, sourceApp: WebhookSourceApp = 'unknown'): Promise<void> {
    this.logger.info({ type: event.type, id: event.data.id, sourceApp }, 'Processing Clerk webhook event');

    switch (event.type) {
      case 'user.created':
      case 'user.updated':
        await this.handleUserCreatedOrUpdated(event.data, sourceApp);
        break;
      case 'session.created':
        await this.handleSessionCreated(event.data);
        break;
      case 'user.deleted':
        this.logger.info({ clerkUserId: event.data.id }, 'Ignoring user.deleted webhook event');
        break;
      default:
        this.logger.warn({ type: event.type }, 'Unknown webhook event type');
    }
  }

  private async handleUserCreatedOrUpdated(userData: ClerkWebhookEvent['data'], sourceApp: WebhookSourceApp): Promise<void> {
    const email = userData.email_addresses?.[0]?.email_address;
    const name = userData.first_name && userData.last_name
      ? `${userData.first_name} ${userData.last_name}`.trim()
      : userData.first_name || null;

    if (!email) {
      this.logger.warn({ clerkUserId: userData.id }, 'User has no email, skipping sync');
      return;
    }

    await this.syncClerkUser(userData.id, email, name || undefined, sourceApp);
  }

  private async syncClerkUser(
    clerkUserId: string,
    email: string,
    name?: string,
    sourceApp: WebhookSourceApp = 'unknown'
  ): Promise<void> {
    const existingUser = await this.repository.findUserByClerkId(clerkUserId);

    if (existingUser) {
      const updates: any = { updated_at: new Date().toISOString() };
      let hasChanges = false;

      if (email && existingUser.email !== email) { updates.email = email; hasChanges = true; }
      if (name && existingUser.name !== name) { updates.name = name; hasChanges = true; }

      if (hasChanges) {
        await this.repository.updateUser(existingUser.id, updates);
        await this.events.publish('user.updated', {
          userId: existingUser.id, clerkUserId,
          changes: Object.keys(updates).filter(k => k !== 'updated_at'),
        });
      }

      if (sourceApp === 'candidate') {
        await this.ensureCandidateExists(existingUser.id, email, name || email);
      }
    } else {
      const userData = {
        id: uuidv4(),
        clerk_user_id: clerkUserId,
        email,
        name: name || email,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      } as any;

      const newUser = await this.repository.createUser(userData);
      await this.events.publish('user.created', {
        userId: newUser.id, clerkUserId: newUser.clerk_user_id,
        email: newUser.email, name: newUser.name,
      });

      if (sourceApp === 'candidate') {
        await this.ensureCandidateExists(newUser.id, email, name || email);
      }
    }
  }

  private async ensureCandidateExists(userId: string, email: string, fullName: string): Promise<void> {
    try {
      const existing = await this.repository.findCandidateByUserId(userId);
      if (existing) return;

      const byEmail = await this.repository.findCandidateByEmail(email);
      if (byEmail && !byEmail.user_id) {
        await this.repository.claimCandidateForUser(byEmail.id, userId);
        await this.repository.createCandidateUserRole(userId, byEmail.id);
        return;
      }
      if (byEmail && byEmail.user_id) return;

      const candidate = await this.repository.createCandidate(userId, email, fullName);
      await this.repository.createCandidateUserRole(userId, candidate.id);
    } catch (error) {
      this.logger.error({
        userId, error: error instanceof Error ? error.message : String(error),
      }, 'Failed to create candidate from webhook (non-fatal)');
    }
  }

  private async handleSessionCreated(data: any): Promise<void> {
    const clerkUserId = data.user_id || data.id;
    try {
      const user = await this.repository.findUserByClerkId(clerkUserId);
      if (user) {
        const threshold = new Date(Date.now() - 5 * 60 * 1000);
        const lastActive = user.last_active_at ? new Date(user.last_active_at) : null;
        if (!lastActive || lastActive < threshold) {
          await this.repository.updateUser(user.id, { last_active_at: new Date() } as any);
        }
      }
    } catch (error) {
      this.logger.error({
        clerkUserId, error: error instanceof Error ? error.message : String(error),
      }, 'Failed to update last_active_at on session.created');
    }
  }
}
