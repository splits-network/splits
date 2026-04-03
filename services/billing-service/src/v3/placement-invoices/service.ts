/**
 * Placement Invoices V3 Service — Business Logic
 *
 * Creates Stripe invoices for placement fees with 3% processing fee.
 */

import Stripe from 'stripe';
import { SupabaseClient } from '@supabase/supabase-js';
import { AccessContextResolver } from '@splits-network/shared-access-context';
import { BadRequestError, NotFoundError, ForbiddenError } from '@splits-network/shared-fastify';
import { IEventPublisher } from '../../v2/shared/events.js';
import { PlacementInvoiceRepository } from './repository.js';
import { CreatePlacementInvoiceInput, PlacementInvoiceListParams } from './types.js';

export class PlacementInvoiceService {
  private stripe: Stripe;
  private accessResolver: AccessContextResolver;

  constructor(
    private repository: PlacementInvoiceRepository,
    private supabase: SupabaseClient,
    private eventPublisher?: IEventPublisher
  ) {
    this.stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
      apiVersion: '2025-11-17.clover',
    });
    this.accessResolver = new AccessContextResolver(supabase);
  }

  async getAll(params: PlacementInvoiceListParams, clerkUserId: string) {
    const context = await this.accessResolver.resolve(clerkUserId);
    if (!context.isPlatformAdmin && !context.recruiterId && context.organizationIds.length === 0) {
      throw new ForbiddenError('Insufficient permissions');
    }

    const { data, total } = await this.repository.findAll(params);
    const page = params.page || 1;
    const limit = Math.min(params.limit || 25, 100);
    return { data, pagination: { total, page, limit, total_pages: Math.ceil(total / limit) } };
  }

  async getByPlacementId(placementId: string, clerkUserId: string) {
    await this.accessResolver.resolve(clerkUserId);
    const invoices = await this.repository.findByPlacementId(placementId);
    return invoices[0] ?? null;
  }

  async getByCompanyId(companyId: string, clerkUserId: string) {
    await this.accessResolver.resolve(clerkUserId);
    return this.repository.findByCompanyId(companyId);
  }

  async createInvoice(input: CreatePlacementInvoiceInput, clerkUserId: string) {
    const context = await this.accessResolver.resolve(clerkUserId);
    if (!context.isPlatformAdmin && !context.recruiterId) {
      throw new ForbiddenError('Insufficient permissions to create invoice');
    }

    if (!input.placement_id) throw new BadRequestError('placement_id is required');

    // Get placement details
    const { data: placement } = await this.supabase
      .from('placements')
      .select('id, placement_fee, job_id')
      .eq('id', input.placement_id)
      .single();

    if (!placement) throw new NotFoundError('Placement', input.placement_id);

    const amountDue = placement.placement_fee || 0;
    const processingFee = Math.round(amountDue * 0.03 * 100) / 100;
    const totalDue = amountDue + processingFee;

    const record = {
      placement_id: input.placement_id,
      company_id: input.company_id || null,
      firm_id: input.firm_id || null,
      amount_due: totalDue,
      amount_paid: 0,
      currency: 'usd',
      invoice_status: 'draft',
      collection_method: 'send_invoice',
      billing_terms: 'net_30',
      funds_available: false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const created = await this.repository.create(record);

    await this.eventPublisher?.publish('placement_invoice.created', {
      invoice_id: created.id,
      placement_id: input.placement_id,
      amount_due: totalDue,
      created_by: context.identityUserId,
    }, 'billing-service');

    return created;
  }
}
