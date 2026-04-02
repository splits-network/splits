/**
 * Firm Members View Service
 * GET /api/v3/firms/:firmId/views/members
 */

import { FirmMemberListParams } from '../types.js';
import { FirmMembersViewRepository } from './members.repository.js';

export class FirmMembersViewService {
  constructor(private repository: FirmMembersViewRepository) {}

  async getMembers(firmId: string, params: FirmMemberListParams) {
    const { data, total } = await this.repository.findMembers(firmId, params);
    const page = params.page || 1;
    const limit = Math.min(params.limit || 50, 100);
    return { data, pagination: { total, page, limit, total_pages: Math.ceil(total / limit) } };
  }
}
