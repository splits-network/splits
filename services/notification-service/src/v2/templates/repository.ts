import { createClient, SupabaseClient } from '@supabase/supabase-js';
import {
    EmailTemplate,
    TemplateCreateInput,
    TemplateFilters,
    TemplateStatus,
    TemplateUpdate,
} from './types';

export class NotificationTemplateRepository {
    private supabase: SupabaseClient;

    constructor(supabaseUrl: string, supabaseKey: string) {
        this.supabase = createClient(supabaseUrl, supabaseKey, {
            db: { schema: 'public' }
        });
    }

    private mapRow(row: any): EmailTemplate {
        return {
            id: row.id,
            name: row.name,
            event_type: row.event_type,
            subject: row.subject,
            template_html: row.template_html,
            status: row.status,
            variables: row.variables || [],
            created_at: row.created_at,
            updated_at: row.updated_at,
        };
    }

    async findTemplates(filters: TemplateFilters = {}): Promise<{
        data: EmailTemplate[];
        total: number;
    }> {
        const page = filters.page ?? 1;
        const limit = filters.limit ?? 25;
        const offset = (page - 1) * limit;

        let query = this.supabase
            
            .from('email_templates')
            .select('*', { count: 'exact' });

        if (filters.event_type) {
            query = query.eq('event_type', filters.event_type);
        }
        if (filters.status) {
            query = query.eq('status', filters.status);
        }
        if (filters.search) {
            query = query.ilike('subject', `%${filters.search}%`);
        }

        const { data, error, count } = await query
            .order('created_at', { ascending: false })
            .range(offset, offset + limit - 1);

        if (error) {
            throw error;
        }

        return {
            data: (data || []).map((row) => this.mapRow(row)),
            total: count || 0,
        };
    }

    async findTemplate(id: string): Promise<EmailTemplate | null> {
        const { data, error } = await this.supabase
            
            .from('email_templates')
            .select('*')
            .eq('id', id)
            .single();

        if (error) {
            if (error.code === 'PGRST116') {
                return null;
            }
            throw error;
        }

        return data ? this.mapRow(data) : null;
    }

    async createTemplate(input: TemplateCreateInput): Promise<EmailTemplate> {
        const { data, error } = await this.supabase
            
            .from('email_templates')
            .insert({
                name: input.name,
                event_type: input.event_type,
                subject: input.subject,
                template_html: input.template_html,
                variables: input.variables || [],
                status: input.status || 'draft',
            })
            .select()
            .single();

        if (error) {
            throw error;
        }

        return this.mapRow(data);
    }

    async updateTemplate(id: string, updates: TemplateUpdate): Promise<EmailTemplate> {
        const payload: Record<string, any> = {
            updated_at: new Date().toISOString(),
        };

        if (typeof updates.name !== 'undefined') {
            payload.name = updates.name;
        }
        if (typeof updates.subject !== 'undefined') {
            payload.subject = updates.subject;
        }
        if (typeof updates.template_html !== 'undefined') {
            payload.template_html = updates.template_html;
        }
        if (typeof updates.variables !== 'undefined') {
            payload.variables = updates.variables;
        }
        if (typeof updates.status !== 'undefined') {
            payload.status = updates.status;
        }

        const { data, error } = await this.supabase
            
            .from('email_templates')
            .update(payload)
            .eq('id', id)
            .select()
            .single();

        if (error) {
            throw error;
        }

        return this.mapRow(data);
    }

    async archiveTemplate(id: string): Promise<void> {
        const { error } = await this.supabase
            
            .from('email_templates')
            .update({
                status: 'archived',
                updated_at: new Date().toISOString(),
            })
            .eq('id', id);

        if (error) {
            throw error;
        }
    }
}
