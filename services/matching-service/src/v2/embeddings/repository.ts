/**
 * Embedding Repository
 *
 * Reads/writes vector embeddings on search.search_index.
 * Uses Supabase RPC for pgvector operations.
 */

import { SupabaseClient } from '@supabase/supabase-js';
import { SimilarityResult } from './types.js';

export class EmbeddingRepository {
    constructor(private supabase: SupabaseClient) {}

    async upsertEmbedding(entityType: string, entityId: string, embedding: number[]): Promise<void> {
        // Convert embedding array to pgvector format string
        const vectorStr = `[${embedding.join(',')}]`;

        const { error } = await this.supabase.rpc('update_search_embedding', {
            p_entity_type: entityType,
            p_entity_id: entityId,
            p_embedding: vectorStr,
        });

        // If RPC doesn't exist yet (migration not applied), fall back to raw SQL
        if (error?.code === '42883') {
            // Function not found — use direct update
            const { error: updateError } = await this.supabase
                .from('search_index')
                .update({ embedding: vectorStr } as any)
                .eq('entity_type', entityType)
                .eq('entity_id', entityId);

            if (updateError) throw updateError;
            return;
        }

        if (error) throw error;
    }

    async findSimilarCandidates(jobEmbedding: number[], limit: number = 50): Promise<SimilarityResult[]> {
        const vectorStr = `[${jobEmbedding.join(',')}]`;

        const { data, error } = await this.supabase.rpc('find_similar_candidates', {
            p_job_embedding: vectorStr,
            p_limit: limit,
        });

        if (error) throw error;
        return (data || []).map((r: any) => ({
            entity_id: r.entity_id,
            similarity: Number(r.similarity),
        }));
    }

    async findSimilarJobs(candidateEmbedding: number[], limit: number = 50): Promise<SimilarityResult[]> {
        const vectorStr = `[${candidateEmbedding.join(',')}]`;

        const { data, error } = await this.supabase.rpc('find_similar_jobs', {
            p_candidate_embedding: vectorStr,
            p_limit: limit,
        });

        if (error) throw error;
        return (data || []).map((r: any) => ({
            entity_id: r.entity_id,
            similarity: Number(r.similarity),
        }));
    }

    async getCosineSimilarity(
        entityType1: string, entityId1: string,
        entityType2: string, entityId2: string,
    ): Promise<number | null> {
        // Fetch both embeddings and compute similarity
        const { data } = await this.supabase
            .schema('search')
            .from('search_index')
            .select('entity_type, entity_id, embedding')
            .or(
                `and(entity_type.eq.${entityType1},entity_id.eq.${entityId1}),and(entity_type.eq.${entityType2},entity_id.eq.${entityId2})`
            );

        if (!data || data.length < 2) return null;

        const e1 = data.find((r: any) => r.entity_type === entityType1 && r.entity_id === entityId1);
        const e2 = data.find((r: any) => r.entity_type === entityType2 && r.entity_id === entityId2);

        if (!e1?.embedding || !e2?.embedding) return null;

        // Cosine similarity computed in JS (fallback if we can't do it in SQL)
        return cosineSimilarity(e1.embedding, e2.embedding);
    }
}

function cosineSimilarity(a: number[], b: number[]): number {
    if (a.length !== b.length) return 0;
    let dotProduct = 0;
    let normA = 0;
    let normB = 0;
    for (let i = 0; i < a.length; i++) {
        dotProduct += a[i] * b[i];
        normA += a[i] * a[i];
        normB += b[i] * b[i];
    }
    const denominator = Math.sqrt(normA) * Math.sqrt(normB);
    return denominator === 0 ? 0 : dotProduct / denominator;
}
