import { AtsRepository } from '../../repository';
import { Company } from '@splits-network/shared-types';

export class CompanyService {
    constructor(private repository: AtsRepository) {}

    async getCompanies(): Promise<Company[]> {
        return await this.repository.findAllCompanies();
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
