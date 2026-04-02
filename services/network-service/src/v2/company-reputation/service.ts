/**
 * Company Reputation Service - Business logic for company reputation reads
 */

import { CompanyReputationRepository } from './repository.js';
import { buildPaginationResponse, PaginationResponse } from '../shared/pagination.js';
import { CompanyReputationFilters } from './types.js';

export class CompanyReputationServiceV2 {
    constructor(private repository: CompanyReputationRepository) {}

    async getReputations(
        clerkUserId: string,
        filters: CompanyReputationFilters
    ): Promise<PaginationResponse<any>> {
        const result = await this.repository.findReputations(clerkUserId, filters);

        return buildPaginationResponse(
            result.data,
            result.total,
            filters.page || 1,
            filters.limit || 25
        );
    }

    async getReputation(companyId: string): Promise<any> {
        const reputation = await this.repository.findReputationByCompanyId(companyId);
        if (!reputation) {
            throw { statusCode: 404, message: 'Company reputation record not found' };
        }
        return reputation;
    }
}
