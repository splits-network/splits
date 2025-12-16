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

    async createCompany(name: string, identityOrgId?: string): Promise<Company> {
        return await this.repository.createCompany({
            name,
            identity_organization_id: identityOrgId,
        });
    }

    async updateCompany(id: string, updates: { name?: string; identity_organization_id?: string }): Promise<Company> {
        // Verify company exists
        await this.getCompanyById(id);
        return await this.repository.updateCompany(id, updates);
    }
}
