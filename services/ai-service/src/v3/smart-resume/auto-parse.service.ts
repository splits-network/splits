/**
 * Auto-Parse Smart Resume Service
 *
 * Admin one-click action: finds a candidate's primary resume document,
 * runs AI extraction, and populates the smart_resume_* tables.
 * Reuses the same SmartResumeExtractor + SmartResumePopulator pipeline
 * used by the domain consumer and backfill scripts.
 */

import { SupabaseClient } from '@supabase/supabase-js';
import { createLogger } from '@splits-network/shared-logging';
import type { IAiClient } from '@splits-network/shared-ai-client';
import { IEventPublisher } from '../../v2/shared/events.js';
import { SmartResumeExtractor } from './extractor.js';
import { SmartResumePopulator } from './populator.js';

const logger = createLogger({ serviceName: 'ai-service', level: 'info' });

export class AutoParseService {
  private extractor: SmartResumeExtractor;
  private populator: SmartResumePopulator;

  constructor(
    private supabase: SupabaseClient,
    aiClient: IAiClient,
    eventPublisher?: IEventPublisher,
  ) {
    this.extractor = new SmartResumeExtractor(aiClient);
    this.populator = new SmartResumePopulator(supabase, logger, eventPublisher);
  }

  async autoParse(candidateId: string): Promise<{ profile_id: string; document_id: string }> {
    // 1. Find the candidate's most recent processed resume document
    const { data: doc, error: docError } = await this.supabase
      .from('documents')
      .select('id, metadata, structured_metadata')
      .eq('entity_type', 'candidate')
      .eq('entity_id', candidateId)
      .eq('document_type', 'resume')
      .eq('processing_status', 'processed')
      .is('deleted_at', null)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (docError) throw docError;
    if (!doc) {
      throw Object.assign(
        new Error('No processed resume document found for this candidate. Upload a resume first.'),
        { statusCode: 400 },
      );
    }

    // 2. Extract text from document metadata
    const extractedText = doc.structured_metadata?.extracted_text
      || doc.metadata?.extracted_text;

    if (!extractedText || extractedText.length < 50) {
      throw Object.assign(
        new Error('Resume document has insufficient extracted text. The document may not have been processed correctly.'),
        { statusCode: 400 },
      );
    }

    // 3. Run AI extraction
    logger.info({ candidate_id: candidateId, document_id: doc.id, text_length: extractedText.length }, 'Starting auto-parse extraction');
    const extraction = await this.extractor.extract(extractedText, 'text/plain');

    // 4. Populate smart_resume_* tables (also publishes smart_resume.updated event)
    const profileId = await this.populator.populate(candidateId, doc.id, extraction);

    logger.info({ candidate_id: candidateId, profile_id: profileId }, 'Auto-parse complete');

    return { profile_id: profileId, document_id: doc.id };
  }
}
