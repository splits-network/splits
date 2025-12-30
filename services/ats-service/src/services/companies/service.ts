import { AtsRepository } from '../../repository';
import { Company } from '@splits-network/shared-types';

export class CompanyService {
    constructor(private repository: AtsRepository) {}

    async getCompanies(): Promise<Company[]> {
        return await this.repository.findAllCompanies();
    }

    /**
     * Get companies for a user with role-based scoping
     * NO userRole parameter - backend resolves role via database JOINs
     * 
     * @param clerkUserId - The Clerk user ID from x-clerk-user-id header
     * @param organizationId - The organization ID from x-organization-id header (nullable)
     * @param filters - Search, sort, and pagination filters
     * @returns { data: Company[], pagination: { total, page, limit, total_pages } }
     */
    async getCompaniesForUser(
        clerkUserId: string,
        organizationId: string | null,
        filters: {
            search?: string;
            sort_by?: string;
            sort_order?: 'asc' | 'desc';
            page?: number;
            limit?: number;
        }
    ): Promise<{
        data: any[];
        pagination: {
            total: number;
            page: number;
            limit: number;
            total_pages: number;
        };
    }> {
        const page = filters.page || 1;
        const limit = filters.limit || 25;

        // Call repository with uppercase sort_order
        const { data, total } = await this.repository.findCompaniesForUser(
            clerkUserId,
            organizationId,
            {
                search: filters.search,
                sort_by: filters.sort_by,
                sort_order: filters.sort_order?.toUpperCase() as 'ASC' | 'DESC' || 'ASC',
                page,
                limit,
            }
        );

        return {
            data,
            pagination: {
                total,
                page,
                limit,
                total_pages: Math.ceil(total / limit),
            },
        };
    }

    async getCompanyById(id: string): Promise<Company> {
        const company = await this.repository.findCompanyById(id);
        if (!company) {
            throw new Error(`Company ${id} not found`);
        }
        return company;
    }

    async getCompanyByOrgId(orgId: string): Promise<Company | null> {
        return await this.repository.findCompanyByOrgId(orgId);
    }

    async createCompany(
        name: string,
        identityOrgId?: string,
        profileFields?: {
            website?: string;
            industry?: string;
            company_size?: string;
            headquarters_location?: string;
            description?: string;
            logo_url?: string;
        }
    ): Promise<Company> {
        return await this.repository.createCompany({
            name,
            identity_organization_id: identityOrgId,
            ...profileFields,
        });
    }

    async updateCompany(id: string, updates: Partial<Omit<Company, 'id' | 'created_at' | 'updated_at'>>): Promise<Company> {
        // Verify company exists
        await this.getCompanyById(id);
        return await this.repository.updateCompany(id, updates);
    }
}
