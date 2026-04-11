/**
 * Public Companies Service
 */

import { PublicCompanyRepository } from './repository.js';
import { PublicCompanyListParams, PublicCompanyJobsParams } from './types.js';

export class PublicCompanyService {
  constructor(private repository: PublicCompanyRepository) {}

  async getPublicCompanies(params: PublicCompanyListParams) {
    const { data, total } = await this.repository.findPublicCompanies(params);
    const page = params.page || 1;
    const limit = Math.min(params.limit || 24, 100);
    return { data, pagination: { total, page, limit, total_pages: Math.ceil(total / limit) } };
  }

  async getPublicCompanyBySlug(slug: string) {
    const company = await this.repository.findPublicCompanyBySlug(slug);
    if (!company) throw Object.assign(new Error('Company not found'), { statusCode: 404 });
    return company;
  }

  async getPublicCompanyProfile(slug: string) {
    const company = await this.repository.findPublicCompanyBySlug(slug);
    if (!company) return null;

    const [perksResult, cultureResult, skillsResult, reputationResult] = await Promise.allSettled([
      this.repository.findPublicCompanyPerks(company.id),
      this.repository.findPublicCompanyCultureTags(company.id),
      this.repository.findPublicCompanySkills(company.id),
      this.repository.findPublicCompanyReputation(company.id),
    ]);

    return {
      company,
      perks: perksResult.status === 'fulfilled' ? perksResult.value : [],
      culture_tags: cultureResult.status === 'fulfilled' ? cultureResult.value : [],
      skills: skillsResult.status === 'fulfilled' ? skillsResult.value : [],
      reputation: reputationResult.status === 'fulfilled' ? reputationResult.value : null,
    };
  }

  async getPublicCompanyJobs(slug: string, params: PublicCompanyJobsParams) {
    const company = await this.repository.findPublicCompanyBySlug(slug);
    if (!company) throw Object.assign(new Error('Company not found'), { statusCode: 404 });

    const { data, total } = await this.repository.findPublicCompanyJobs(company.id, params);
    const page = params.page || 1;
    const limit = Math.min(params.limit || 20, 100);
    return { data, pagination: { total, page, limit, total_pages: Math.ceil(total / limit) } };
  }
}
