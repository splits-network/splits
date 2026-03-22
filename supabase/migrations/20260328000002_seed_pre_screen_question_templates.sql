-- Seed system pre-screen question templates
-- 24 templates across 4 categories: compliance, experience, logistics, role_info

INSERT INTO pre_screen_question_templates (category, label, question, question_type, is_required, options, disclaimer, is_system, sort_order) VALUES

-- ── COMPLIANCE / LEGAL ──────────────────────────────────────────────────────

('compliance', 'Work Authorization', 'Are you legally authorized to work in the United States?', 'yes_no', true, '[]',
 'This question is asked to verify employment eligibility as required by federal law (Immigration and Nationality Act). All candidates are asked this question regardless of national origin, citizenship, or immigration status. Your response will not be used to discriminate against you in any way.',
 true, 1),

('compliance', 'Visa Sponsorship', 'Will you now or in the future require visa sponsorship for employment?', 'yes_no', true, '[]',
 'This question is asked to determine sponsorship requirements for this position. Your answer will be considered only in relation to the employer''s ability to sponsor work visas and will not be used to discriminate based on national origin or citizenship status.',
 true, 2),

('compliance', 'Disability', 'Do you have a disability or have you ever had a disability?', 'select', false,
 '["Yes", "No", "I don''t wish to answer"]',
 'This information is requested voluntarily under Section 503 of the Rehabilitation Act. It will not be used against you in any way. Your response is confidential and will be kept separate from your application. You are not required to answer this question. Whether or not you choose to respond will not affect your candidacy.',
 true, 3),

('compliance', 'Veteran Status', 'Please select your veteran status, if applicable.', 'select', false,
 '["I am not a veteran", "I am a veteran", "I am a disabled veteran", "I am a recently separated veteran", "I am an active duty wartime or campaign badge veteran", "I am an Armed Forces service medal veteran", "I don''t wish to answer"]',
 'This information is requested voluntarily in accordance with the Vietnam Era Veterans'' Readjustment Assistance Act (VEVRAA). It will be kept confidential and will not affect your candidacy in any way. You are not required to answer this question.',
 true, 4),

('compliance', 'Non-Compete / Non-Solicitation', 'Are you currently bound by a non-compete, non-solicitation, or similar restrictive covenant agreement?', 'yes_no', true, '[]',
 'This question is asked to understand any potential restrictions that may affect your ability to perform in this role. If applicable, you may be asked to provide additional details during the hiring process. Your response will be handled confidentially.',
 true, 5),

('compliance', 'Security Clearance', 'What is your current security clearance level?', 'select', true,
 '["None", "Public Trust", "Confidential", "Secret", "Top Secret", "Top Secret / SCI"]',
 null, true, 6),

('compliance', 'Background / Drug Screening Consent', 'Are you willing to consent to a background check and/or drug screening if required for this position?', 'yes_no', true, '[]',
 'Some positions require a background check and/or drug screening as a condition of employment. These checks are conducted in compliance with all applicable federal, state, and local laws. A criminal record does not automatically disqualify a candidate from consideration.',
 true, 7),

-- ── EXPERIENCE / QUALIFICATIONS ─────────────────────────────────────────────

('experience', 'Years of Experience', 'How many years of relevant professional experience do you have?', 'select', true,
 '["Less than 1 year", "1-2 years", "3-4 years", "5-7 years", "8-10 years", "10+ years"]',
 null, true, 8),

('experience', 'Education Level', 'What is the highest level of education you have completed?', 'select', true,
 '["High School / GED", "Some College", "Associate''s Degree", "Bachelor''s Degree", "Master''s Degree", "Doctorate / Professional Degree"]',
 null, true, 9),

('experience', 'Certification / Licensing', 'Do you hold any certifications or professional licenses relevant to this role? If yes, please list them.', 'text', true, '[]',
 null, true, 10),

('experience', 'Language Proficiency', 'Please list any languages you speak fluently beyond English, if applicable.', 'text', false, '[]',
 null, true, 11),

('experience', 'Tools / Software Proficiency', 'Please list the tools, software, or platforms you are proficient in that are relevant to this role.', 'text', true, '[]',
 null, true, 12),

('experience', 'Portfolio / Work Samples', 'Please provide a link to your portfolio, work samples, or relevant online profile (e.g., GitHub, Dribbble, LinkedIn).', 'text', false, '[]',
 null, true, 13),

('experience', 'Management Experience', 'What is the largest team size you have directly managed?', 'select', false,
 '["Individual Contributor (no direct reports)", "1-5 people", "6-15 people", "16-50 people", "50+ people"]',
 null, true, 14),

-- ── LOGISTICS / AVAILABILITY ────────────────────────────────────────────────

('logistics', 'Start Date Availability', 'When are you available to start a new position?', 'select', true,
 '["Immediately", "Within 2 weeks", "Within 30 days", "Within 60 days", "Negotiable"]',
 null, true, 15),

('logistics', 'Notice Period', 'What is your current notice period with your employer?', 'select', true,
 '["Not currently employed", "No notice period required", "2 weeks", "30 days", "60 days", "90+ days"]',
 null, true, 16),

('logistics', 'Relocation Willingness', 'Are you willing to relocate for this position, if required?', 'yes_no', true, '[]',
 null, true, 17),

('logistics', 'Work Arrangement Preference', 'Which work arrangements are you open to? Select all that apply.', 'multi_select', true,
 '["Fully Remote", "Hybrid (1-2 days in office)", "Hybrid (3-4 days in office)", "Fully On-Site"]',
 null, true, 18),

('logistics', 'Travel Requirements', 'What percentage of travel are you willing to accommodate?', 'select', true,
 '["No travel", "Up to 25%", "25-50%", "50-75%", "75-100%"]',
 null, true, 19),

('logistics', 'Shift / Schedule Details', 'Are there any schedule constraints or shift preferences we should be aware of? Please describe.', 'text', false, '[]',
 null, true, 20),

-- ── ROLE / COMPANY INFO ─────────────────────────────────────────────────────

('role_info', 'Hiring Urgency / Timeline', 'What is the expected timeline for filling this position?', 'select', false,
 '["Immediate — actively interviewing", "1-2 weeks", "Within 1 month", "Flexible / no rush"]',
 null, true, 21),

('role_info', 'Benefits Overview', 'Please describe the benefits package offered for this position (health insurance, PTO, retirement, etc.).', 'text', false, '[]',
 null, true, 22),

('role_info', 'Salary / Compensation Expectations', 'What are your salary or total compensation expectations for this role?', 'text', true, '[]',
 null, true, 23),

('role_info', 'Referral Source', 'How did you hear about this opportunity?', 'select', false,
 '["Job Board (Indeed, LinkedIn, etc.)", "Recruiter", "Employee Referral", "Company Website", "Social Media", "Career Fair / Event", "Other"]',
 null, true, 24);
