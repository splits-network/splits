/**
 * Backfill Smart Resume tables from existing candidates.resume_metadata
 *
 * Run with: npx tsx scripts/backfill-smart-resume.ts
 *
 * Requires env vars: SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY
 * Idempotent — skips candidates who already have a smart_resume_profile.
 */

import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
const BATCH_SIZE = 50;

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

interface Stats {
  processed: number;
  skipped: number;
  created: number;
  errors: number;
}

async function backfillCandidate(candidate: any, stats: Stats): Promise<void> {
  const meta = candidate.resume_metadata;
  if (!meta) {
    stats.skipped++;
    return;
  }

  // Check if profile already exists
  const { data: existing } = await supabase
    .from('smart_resume_profiles')
    .select('id')
    .eq('candidate_id', candidate.id)
    .maybeSingle();

  if (existing) {
    stats.skipped++;
    return;
  }

  // Create profile
  const { data: profile, error: profileError } = await supabase
    .from('smart_resume_profiles')
    .insert({
      candidate_id: candidate.id,
      professional_summary: meta.professional_summary || null,
      total_years_experience: meta.total_years_experience || null,
      highest_degree: meta.highest_degree || null,
    })
    .select('id')
    .single();

  if (profileError || !profile) {
    console.error(`Failed to create profile for candidate ${candidate.id}:`, profileError?.message);
    stats.errors++;
    return;
  }

  const profileId = profile.id;

  // Backfill experiences
  if (meta.experience?.length) {
    const rows = meta.experience.map((exp: any, i: number) => ({
      profile_id: profileId,
      company: exp.company || 'Unknown',
      title: exp.title || 'Unknown',
      location: exp.location || null,
      start_date: exp.start_date || null,
      end_date: exp.end_date || null,
      is_current: exp.is_current || false,
      description: exp.description || null,
      achievements: exp.highlights || [],
      sort_order: i,
    }));

    const { error } = await supabase.from('smart_resume_experiences').insert(rows);
    if (error) console.error(`  experiences error for ${candidate.id}:`, error.message);
  }

  // Backfill education
  if (meta.education?.length) {
    const rows = meta.education.map((edu: any, i: number) => ({
      profile_id: profileId,
      institution: edu.institution || 'Unknown',
      degree: edu.degree || null,
      field_of_study: edu.field_of_study || null,
      start_date: edu.start_date || null,
      end_date: edu.end_date || null,
      gpa: edu.gpa || null,
      sort_order: i,
    }));

    const { error } = await supabase.from('smart_resume_education').insert(rows);
    if (error) console.error(`  education error for ${candidate.id}:`, error.message);
  }

  // Backfill skills
  if (meta.skills?.length) {
    const rows = meta.skills.map((skill: any, i: number) => ({
      profile_id: profileId,
      name: skill.name || 'Unknown',
      category: skill.category || null,
      proficiency: validateProficiency(skill.proficiency),
      years_used: typeof skill.years_used === 'number' ? skill.years_used : null,
      sort_order: i,
    }));

    const { error } = await supabase.from('smart_resume_skills').insert(rows);
    if (error) console.error(`  skills error for ${candidate.id}:`, error.message);
  }

  // Backfill certifications
  if (meta.certifications?.length) {
    const rows = meta.certifications.map((cert: any, i: number) => ({
      profile_id: profileId,
      name: cert.name || 'Unknown',
      issuer: cert.issuer || null,
      date_obtained: cert.date_obtained || null,
      expiry_date: cert.expiry_date || null,
      sort_order: i,
    }));

    const { error } = await supabase.from('smart_resume_certifications').insert(rows);
    if (error) console.error(`  certifications error for ${candidate.id}:`, error.message);
  }

  stats.created++;
}

function validateProficiency(value: string | undefined): string | null {
  const valid = ['expert', 'advanced', 'intermediate', 'beginner'];
  return value && valid.includes(value) ? value : null;
}

async function main() {
  console.log('Starting Smart Resume backfill...\n');

  const stats: Stats = { processed: 0, skipped: 0, created: 0, errors: 0 };
  let offset = 0;
  let hasMore = true;

  while (hasMore) {
    const { data: candidates, error } = await supabase
      .from('candidates')
      .select('id, resume_metadata')
      .not('resume_metadata', 'is', null)
      .range(offset, offset + BATCH_SIZE - 1);

    if (error) {
      console.error('Failed to fetch candidates:', error.message);
      break;
    }

    if (!candidates || candidates.length === 0) {
      hasMore = false;
      break;
    }

    for (const candidate of candidates) {
      try {
        await backfillCandidate(candidate, stats);
        stats.processed++;
      } catch (err: any) {
        console.error(`Error processing candidate ${candidate.id}:`, err.message);
        stats.errors++;
        stats.processed++;
      }
    }

    console.log(`  Processed ${stats.processed} candidates (${stats.created} created, ${stats.skipped} skipped, ${stats.errors} errors)`);

    if (candidates.length < BATCH_SIZE) {
      hasMore = false;
    } else {
      offset += BATCH_SIZE;
    }
  }

  console.log('\n=== Backfill Complete ===');
  console.log(`Total processed: ${stats.processed}`);
  console.log(`Profiles created: ${stats.created}`);
  console.log(`Skipped (no metadata or already exists): ${stats.skipped}`);
  console.log(`Errors: ${stats.errors}`);
}

main().catch(console.error);
