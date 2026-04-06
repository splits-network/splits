/**
 * Backfill Smart Resume via AI extraction for existing candidates
 *
 * Finds candidates with processed resume documents that don't yet have
 * a smart resume profile, then runs the AI extraction + population
 * pipeline directly (no RabbitMQ needed).
 *
 * Run with: npx tsx scripts/backfill-smart-resume-ai.ts
 *
 * Requires env vars:
 *   SUPABASE_URL (or NEXT_PUBLIC_SUPABASE_URL)
 *   SUPABASE_SERVICE_ROLE_KEY
 *   OPENAI_API_KEY
 *
 * Options:
 *   --dry-run    Show what would be processed without running extraction
 *   --limit N    Process at most N candidates (default: all)
 */

import { createClient } from '@supabase/supabase-js';
import { OpenAIProvider } from '../packages/shared-ai-client/src/openai-provider.js';
import { SmartResumeExtractor } from '../services/ai-service/src/v3/smart-resume/extractor.js';
import { SmartResumePopulator } from '../services/ai-service/src/v3/smart-resume/populator.js';
import type { IAiClient, ChatMessage, ChatCompletionOptions, EmbeddingOptions } from '../packages/shared-ai-client/src/types.js';

const SUPABASE_URL = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
const OPENAI_API_KEY = process.env.OPENAI_API_KEY || '';
const MODEL = 'gpt-4o-mini';

const args = process.argv.slice(2);
const DRY_RUN = args.includes('--dry-run');
const limitIdx = args.indexOf('--limit');
const LIMIT = limitIdx !== -1 ? parseInt(args[limitIdx + 1], 10) : 500;

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}
if (!OPENAI_API_KEY && !DRY_RUN) {
  console.error('Missing OPENAI_API_KEY (required unless --dry-run)');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

/** Lightweight IAiClient that calls OpenAI directly with a fixed model */
function createSimpleAiClient(): IAiClient {
  const provider = new OpenAIProvider(OPENAI_API_KEY);
  return {
    async chatCompletion(_operation: any, messages: ChatMessage[], options?: ChatCompletionOptions) {
      return provider.chatCompletion(MODEL, messages, {
        temperature: options?.temperature,
        maxTokens: options?.maxTokens,
        jsonMode: options?.jsonMode,
      });
    },
    async embedding(_operation: any, text: string, options?: EmbeddingOptions) {
      return provider.embedding('text-embedding-3-small', text, {
        dimensions: options?.dimensions,
      });
    },
  };
}

const logger = {
  info: (...args: any[]) => console.log('[INFO]', ...args),
  warn: (...args: any[]) => console.warn('[WARN]', ...args),
  error: (...args: any[]) => console.error('[ERROR]', ...args),
  debug: () => {},
  child: () => logger,
} as any;

async function findCandidatesNeedingSmartResume() {
  const { data, error } = await supabase
    .from('documents')
    .select('id, entity_id, metadata, structured_metadata')
    .eq('entity_type', 'candidate')
    .eq('document_type', 'resume')
    .eq('processing_status', 'processed')
    .is('deleted_at', null)
    .order('created_at', { ascending: false })
    .limit(LIMIT);

  if (error) {
    console.error('Failed to fetch documents:', error.message);
    return [];
  }

  if (!data?.length) {
    console.log('No processed resume documents found.');
    return [];
  }

  // Deduplicate by candidate — take the most recent resume per candidate
  const candidateDocMap = new Map<string, typeof data[0]>();
  for (const doc of data) {
    if (!candidateDocMap.has(doc.entity_id)) {
      candidateDocMap.set(doc.entity_id, doc);
    }
  }

  // Filter out candidates who already have a smart resume profile
  const candidateIds = [...candidateDocMap.keys()];
  const { data: existingProfiles } = await supabase
    .from('smart_resume_profiles')
    .select('candidate_id')
    .in('candidate_id', candidateIds)
    .is('deleted_at', null);

  const existingSet = new Set((existingProfiles || []).map(p => p.candidate_id));

  const results = [];
  for (const [candidateId, doc] of candidateDocMap) {
    if (existingSet.has(candidateId)) continue;

    const text = doc.structured_metadata?.extracted_text
      || doc.metadata?.extracted_text;

    if (!text || text.length < 50) continue;

    results.push({
      candidate_id: candidateId,
      document_id: doc.id,
      extracted_text: text,
    });
  }

  return results;
}

async function processCandidate(
  candidate: { candidate_id: string; document_id: string; extracted_text: string },
  extractor: SmartResumeExtractor,
  populator: SmartResumePopulator,
): Promise<boolean> {
  const startTime = Date.now();

  try {
    console.log(`  Extracting: ${candidate.candidate_id} (${candidate.extracted_text.length} chars)...`);
    const extraction = await extractor.extract(candidate.extracted_text, 'text/plain');

    console.log(`  Populating: ${candidate.candidate_id}...`);
    await populator.populate(candidate.candidate_id, candidate.document_id, extraction);

    const duration = ((Date.now() - startTime) / 1000).toFixed(1);
    console.log(`  Done: ${candidate.candidate_id} (${duration}s)`);
    return true;
  } catch (err: any) {
    const duration = ((Date.now() - startTime) / 1000).toFixed(1);
    console.error(`  Failed: ${candidate.candidate_id} (${duration}s) — ${err.message}`);
    return false;
  }
}

async function main() {
  console.log(DRY_RUN ? '=== DRY RUN ===' : '=== Smart Resume AI Backfill ===');
  console.log();

  const candidates = await findCandidatesNeedingSmartResume();

  if (!candidates.length) {
    console.log('No candidates need smart resume processing.');
    return;
  }

  console.log(`Found ${candidates.length} candidates with resumes but no smart resume profile:\n`);
  for (const c of candidates) {
    console.log(`  - ${c.candidate_id} (doc: ${c.document_id}, ${c.extracted_text.length} chars)`);
  }
  console.log();

  if (DRY_RUN) {
    console.log('Dry run complete. Run without --dry-run to process.');
    return;
  }

  const aiClient = createSimpleAiClient();
  const extractor = new SmartResumeExtractor(aiClient);
  const populator = new SmartResumePopulator(supabase, logger, undefined);

  let succeeded = 0;
  let failed = 0;

  for (const candidate of candidates) {
    const ok = await processCandidate(candidate, extractor, populator);
    if (ok) succeeded++;
    else failed++;
  }

  console.log(`\n=== Complete ===`);
  console.log(`Succeeded: ${succeeded}`);
  console.log(`Failed: ${failed}`);
  console.log(`Total: ${candidates.length}`);

  if (succeeded > 0) {
    console.log('\nNote: matching-service will rescore automatically when it');
    console.log('receives smart_resume.updated events. Since we bypassed RabbitMQ,');
    console.log('you may need to trigger a batch rescore manually.');
  }
}

main().catch(console.error);
