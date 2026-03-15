import { SupabaseClient } from '@supabase/supabase-js';
import { CallListFilters } from './types';

/**
 * Pre-filter call IDs from related tables (entity links, tags, search).
 * Returns null if no pre-filters apply, or a string[] of matching call IDs.
 * Returns empty array if filters match nothing (caller should return empty).
 */
export async function resolveCallIdFilters(
    supabase: SupabaseClient,
    filters: CallListFilters,
): Promise<string[] | null> {
    let filteredCallIds: string[] | null = null;

    // Entity filter
    if (filters.entity_type && filters.entity_id) {
        const { data: links, error } = await supabase
            .from('call_entity_links')
            .select('call_id')
            .eq('entity_type', filters.entity_type)
            .eq('entity_id', filters.entity_id);

        if (error) throw error;
        filteredCallIds = (links || []).map((l: { call_id: string }) => l.call_id);
        if (filteredCallIds.length === 0) return [];
    }

    // Tag filter
    if (filters.tag) {
        const { data: tagLinks, error } = await supabase
            .from('call_tag_links')
            .select('call_id')
            .eq('tag_slug', filters.tag);

        if (error) throw error;
        const tagCallIds = (tagLinks || []).map((l: { call_id: string }) => l.call_id);
        if (tagCallIds.length === 0) return [];

        filteredCallIds = filteredCallIds
            ? filteredCallIds.filter((id) => tagCallIds.includes(id))
            : tagCallIds;
        if (filteredCallIds.length === 0) return [];
    }

    // Search filter
    if (filters.search) {
        const searchCallIds = await resolveSearchFilter(supabase, filters.search);
        if (searchCallIds.length === 0) return [];

        const searchSet = new Set(searchCallIds);
        filteredCallIds = filteredCallIds
            ? filteredCallIds.filter((id) => searchSet.has(id))
            : searchCallIds;
        if (filteredCallIds.length === 0) return [];
    }

    return filteredCallIds;
}

async function resolveSearchFilter(
    supabase: SupabaseClient,
    search: string,
): Promise<string[]> {
    const searchPattern = `%${search}%`;
    const matchedCallIds = new Set<string>();

    // Search participant names
    const { data: matchedUsers, error: userErr } = await supabase
        .from('users')
        .select('id')
        .ilike('name', searchPattern);

    if (userErr) throw userErr;

    if (matchedUsers && matchedUsers.length > 0) {
        const userIds = matchedUsers.map((u: { id: string }) => u.id);
        const { data: pLinks, error: pErr } = await supabase
            .from('call_participants')
            .select('call_id')
            .in('user_id', userIds);

        if (pErr) throw pErr;
        for (const p of pLinks || []) {
            matchedCallIds.add((p as { call_id: string }).call_id);
        }
    }

    // Search company names
    const { data: matchedCompanies, error: compErr } = await supabase
        .from('companies')
        .select('id')
        .ilike('name', searchPattern);

    if (compErr) throw compErr;

    if (matchedCompanies && matchedCompanies.length > 0) {
        const companyIds = matchedCompanies.map((c: { id: string }) => c.id);
        const { data: eLinks, error: elErr } = await supabase
            .from('call_entity_links')
            .select('call_id')
            .eq('entity_type', 'company')
            .in('entity_id', companyIds);

        if (elErr) throw elErr;
        for (const l of eLinks || []) {
            matchedCallIds.add((l as { call_id: string }).call_id);
        }
    }

    // Search job titles
    const { data: matchedJobs, error: jobErr } = await supabase
        .from('jobs')
        .select('id')
        .ilike('title', searchPattern);

    if (jobErr) throw jobErr;

    if (matchedJobs && matchedJobs.length > 0) {
        const jobIds = matchedJobs.map((j: { id: string }) => j.id);
        const { data: eLinks, error: elErr } = await supabase
            .from('call_entity_links')
            .select('call_id')
            .eq('entity_type', 'job')
            .in('entity_id', jobIds);

        if (elErr) throw elErr;
        for (const l of eLinks || []) {
            matchedCallIds.add((l as { call_id: string }).call_id);
        }
    }

    return Array.from(matchedCallIds);
}
