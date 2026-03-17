/**
 * Candidate Primary Resume View Repository
 *
 * Fetches the candidate's primary resume document and generates
 * a signed download URL.
 */

import { SupabaseClient } from '@supabase/supabase-js';

export class CandidatePrimaryResumeRepository {
  constructor(private supabase: SupabaseClient) {}

  async getPrimaryResume(candidateId: string): Promise<any | null> {
    const { data, error } = await this.supabase
      .from('documents')
      .select('*')
      .eq('entity_type', 'candidate')
      .eq('entity_id', candidateId)
      .eq('document_type', 'resume')
      .eq('metadata->>is_primary_for_candidate', 'true')
      .maybeSingle();

    if (error) throw error;
    if (!data) return null;

    const { data: signedUrlData } = await this.supabase.storage
      .from(data.bucket_name)
      .createSignedUrl(data.storage_path, 3600);

    return { ...data, download_url: signedUrlData?.signedUrl || null };
  }
}
