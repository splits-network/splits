/**
 * Test the smart resume extractor against the actual PDF-extracted text from the database.
 * Saves the extracted text to a temp file, then runs the extractor on it.
 */
import { createClient } from '@supabase/supabase-js';
import { SmartResumeExtractor } from '../services/document-processing-service/src/processors/smart-resume-extractor.js';

const SUPABASE_URL = process.env.SUPABASE_URL || '';
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

async function main() {
  const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

  // Get the latest PDF resume's extracted text
  const { data: doc } = await supabase
    .from('documents')
    .select('metadata')
    .eq('id', '487d3ac2-ac21-42c7-bd90-b4cd78d4e0ff')
    .single();

  if (!doc?.metadata?.extracted_text) {
    console.error('No extracted text found');
    return;
  }

  const text = doc.metadata.extracted_text;
  console.log('PDF extracted text length:', text.length, 'chars\n');

  const extractor = new SmartResumeExtractor();
  const result = await extractor.extract(text, 'application/pdf');

  console.log('=== SUMMARY ===');
  console.log('Headline:', result.headline);
  console.log('Summary:', result.professional_summary?.substring(0, 200));
  console.log('');

  console.log('=== EXPERIENCES (' + result.experiences.length + ') ===');
  result.experiences.forEach((e, i) => {
    console.log((i+1) + '. ' + e.title + ' at ' + e.company);
    console.log('   ' + e.start_date + ' - ' + (e.is_current ? 'Present' : e.end_date));
    console.log('   Location: ' + e.location);
    console.log('   Achievements: ' + e.achievements.length);
    if (e.achievements.length > 0) {
      console.log('   First: ' + e.achievements[0].substring(0, 120));
      console.log('   Last:  ' + e.achievements[e.achievements.length - 1].substring(0, 120));
    }
    console.log('');
  });

  console.log('=== SKILLS (' + result.skills.length + ') ===');
  const byCategory: Record<string, string[]> = {};
  result.skills.forEach(s => {
    const cat = s.category || 'other';
    if (!byCategory[cat]) byCategory[cat] = [];
    byCategory[cat].push(s.name);
  });
  Object.entries(byCategory).forEach(([cat, skills]) => {
    console.log('  ' + cat + ' (' + skills.length + '): ' + skills.slice(0, 5).join(', ') + (skills.length > 5 ? '...' : ''));
  });
  console.log('');

  console.log('=== EDUCATION (' + result.education.length + ') ===');
  result.education.forEach(e => console.log('  ' + (e.degree || 'N/A') + ' in ' + (e.field_of_study || 'N/A') + ' at ' + e.institution));
  console.log('');

  console.log('=== PROJECTS (' + result.projects.length + ') ===');
  result.projects.forEach(p => console.log('  ' + p.name));

  console.log('=== CERTIFICATIONS (' + result.certifications.length + ') ===');
  result.certifications.forEach(c => console.log('  ' + c.name));
}

main().catch(e => console.error(e));
