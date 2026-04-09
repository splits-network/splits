/**
 * Company Summary View Service
 *
 * Returns public display fields for a company. Available to any authenticated
 * user — candidates, recruiters, company users, admins — so that chat, marketplace,
 * and other cross-role surfaces can render a company's name and logo without
 * hitting the access-scoped CRUD route.
 */

import { NotFoundError } from '@splits-network/shared-fastify';
import { CompanySummaryRepository, CompanySummary } from './summary.repository.js';

export class CompanySummaryService {
  constructor(private repository: CompanySummaryRepository) {}

  async getById(companyId: string): Promise<CompanySummary> {
    const summary = await this.repository.findById(companyId);
    if (!summary) throw new NotFoundError('Company', companyId);
    return summary;
  }
}
