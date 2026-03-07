/**
 * RecruiterPermissionChecker — queries recruiter_companies.permissions JSONB
 * directly from the ATS service. No cross-service HTTP calls needed since
 * both services share the same Postgres database.
 */

import { SupabaseClient } from '@supabase/supabase-js';

export interface RecruiterCompanyPermissions {
    can_view_jobs: boolean;
    can_create_jobs: boolean;
    can_edit_jobs: boolean;
    can_advance_candidates: boolean;
    can_view_applications: boolean;
    can_submit_candidates: boolean;
}

export class RecruiterPermissionChecker {
    constructor(private supabase: SupabaseClient) {}

    /**
     * Get permissions for a specific recruiter-company relationship
     */
    async getPermissions(
        recruiterId: string,
        companyId: string
    ): Promise<RecruiterCompanyPermissions | null> {
        const { data, error } = await this.supabase
            .from('recruiter_companies')
            .select('permissions')
            .eq('recruiter_id', recruiterId)
            .eq('company_id', companyId)
            .eq('status', 'active')
            .maybeSingle();

        if (error) throw error;
        return data?.permissions || null;
    }

    /**
     * Check if a recruiter has a specific permission for a company
     */
    async hasPermission(
        recruiterId: string,
        companyId: string,
        permission: keyof RecruiterCompanyPermissions
    ): Promise<boolean> {
        const permissions = await this.getPermissions(recruiterId, companyId);
        if (!permissions) return false;
        return permissions[permission] === true;
    }

    /**
     * Get all company IDs where a recruiter has a specific permission
     */
    async getCompanyIdsWithPermission(
        recruiterId: string,
        permission: keyof RecruiterCompanyPermissions
    ): Promise<string[]> {
        const { data, error } = await this.supabase
            .from('recruiter_companies')
            .select('company_id, permissions')
            .eq('recruiter_id', recruiterId)
            .eq('status', 'active');

        if (error) throw error;

        return (data || [])
            .filter(row => row.permissions?.[permission] === true)
            .map(row => row.company_id);
    }

    /**
     * Get all permissions for all active company relationships a recruiter has
     */
    async getAllPermissions(
        recruiterId: string
    ): Promise<Map<string, RecruiterCompanyPermissions>> {
        const { data, error } = await this.supabase
            .from('recruiter_companies')
            .select('company_id, permissions')
            .eq('recruiter_id', recruiterId)
            .eq('status', 'active');

        if (error) throw error;

        const map = new Map<string, RecruiterCompanyPermissions>();
        for (const row of data || []) {
            if (row.permissions) {
                map.set(row.company_id, row.permissions);
            }
        }
        return map;
    }
}
