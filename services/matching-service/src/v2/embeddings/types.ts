export interface EmbeddingRecord {
    entity_type: string;
    entity_id: string;
    embedding: number[];
}

export interface SimilarityResult {
    entity_id: string;
    similarity: number;
}
