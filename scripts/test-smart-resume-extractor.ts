import { SmartResumeExtractor } from '../services/document-processing-service/src/processors/smart-resume-extractor.js';
import { readFileSync } from 'fs';

const file = process.argv[2] || 'g:/code/brandonkorous/resume/Brandon_Korous_Master.md';
const extractor = new SmartResumeExtractor();
const buffer = readFileSync(file);

console.log('Extracting from:', file);
console.log('Text length:', buffer.length, 'bytes\n');

extractor.extract(buffer, 'text/markdown').then(result => {
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
      console.log('   First: ' + e.achievements[0].substring(0, 100) + '...');
      console.log('   Last:  ' + e.achievements[e.achievements.length - 1].substring(0, 100) + '...');
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

  console.log('=== CERTIFICATIONS (' + result.certifications.length + ') ===');
  result.certifications.forEach(c => console.log('  ' + c.name));
  console.log('');

  console.log('=== PROJECTS (' + result.projects.length + ') ===');
  result.projects.forEach(p => console.log('  ' + p.name));
  console.log('');

  console.log('=== PUBLICATIONS (' + result.publications.length + ') ===');
  result.publications.forEach(p => console.log('  ' + p.title));
}).catch(err => {
  console.error('Error:', err.message);
  console.error(err.stack);
});
