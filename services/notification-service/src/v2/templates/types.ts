/**
 * Template Domain Types
 */

export type TemplateStatus = 'active' | 'archived' | 'draft';

export interface EmailTemplate {
    id: string;
    name?: string | null;
    event_type: string;
    subject: string;
    template_html: string;
    status: TemplateStatus;
    variables: string[];
    created_at: string;
    updated_at: string;
}

export interface TemplateFilters {
    event_type?: string;
    status?: TemplateStatus;
    search?: string;
    page?: number;
    limit?: number;
}

export type TemplateCreateInput = Omit<EmailTemplate, 'id' | 'created_at' | 'updated_at'>;
export type TemplateUpdate = Partial<Omit<EmailTemplate, 'id' | 'created_at' | 'updated_at'>>;
