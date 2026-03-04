-- ============================================================
-- Seed curated perks & benefits and culture & values tags
-- Slugs are pre-computed: lowercase, non-alphanumeric stripped
-- ============================================================

-- ========================
-- PERKS & BENEFITS
-- ========================
INSERT INTO perks (name, slug) VALUES
-- Health & Wellness
('Health Insurance', 'healthinsurance'),
('Dental Insurance', 'dentalinsurance'),
('Vision Insurance', 'visioninsurance'),
('Mental Health Support', 'mentalhealthsupport'),
('Gym Membership', 'gymmembership'),
('Wellness Stipend', 'wellnessstipend'),
('On-Site Gym', 'onsitegym'),
('Health Savings Account', 'healthsavingsaccount'),
('Life Insurance', 'lifeinsurance'),
('Disability Insurance', 'disabilityinsurance'),
('Employee Assistance Program', 'employeeassistanceprogram'),
('Fertility Benefits', 'fertilitybenefits'),
('Meditation & Mindfulness', 'meditationmindfulness'),

-- Time Off
('Unlimited PTO', 'unlimitedpto'),
('Generous PTO', 'generouspto'),
('Paid Holidays', 'paidholidays'),
('Paid Sick Leave', 'paidsickleave'),
('Sabbatical', 'sabbatical'),
('Summer Fridays', 'summerfridays'),
('Company Shutdowns', 'companyshutdowns'),
('Volunteer Time Off', 'volunteertimeoff'),
('Birthday Off', 'birthdayoff'),
('Mental Health Days', 'mentalhealthdays'),

-- Work Flexibility
('Remote Work', 'remotework'),
('Hybrid Work', 'hybridwork'),
('Flexible Hours', 'flexiblehours'),
('4-Day Work Week', '4dayworkweek'),
('Async-First', 'asyncfirst'),
('No Meeting Days', 'nomeetingdays'),
('Work From Anywhere', 'workfromanywhere'),
('Compressed Work Week', 'compressedworkweek'),

-- Financial
('401(k) Match', '401kmatch'),
('Equity / Stock Options', 'equitystockoptions'),
('RSUs', 'rsus'),
('Performance Bonus', 'performancebonus'),
('Signing Bonus', 'signingbonus'),
('Profit Sharing', 'profitsharing'),
('Commission', 'commission'),
('Referral Bonus', 'referralbonus'),
('Relocation Assistance', 'relocationassistance'),
('Financial Planning', 'financialplanning'),
('Student Loan Assistance', 'studentloanassistance'),
('Tuition Reimbursement', 'tuitionreimbursement'),
('Crypto / Token Compensation', 'cryptotokencompensation'),

-- Family
('Parental Leave', 'parentalleave'),
('Maternity Leave', 'maternityleave'),
('Paternity Leave', 'paternityleave'),
('Childcare Assistance', 'childcareassistance'),
('Family Planning Benefits', 'familyplanningbenefits'),
('Adoption Assistance', 'adoptionassistance'),
('Pet-Friendly Office', 'petfriendlyoffice'),
('Pet Insurance', 'petinsurance'),
('Dependent Care FSA', 'dependentcarefsa'),

-- Learning & Development
('Learning & Development Budget', 'learningdevelopmentbudget'),
('Conference Attendance', 'conferenceattendance'),
('Internal Mentorship', 'internalmentorship'),
('Certification Reimbursement', 'certificationreimbursement'),
('Book Stipend', 'bookstipend'),
('Hack Days / Innovation Time', 'hackdaysinnovationtime'),
('Internal Tech Talks', 'internaltechtalks'),
('Career Coaching', 'careercoaching'),
('Online Learning Subscriptions', 'onlinelearningsubscriptions'),

-- Office & Equipment
('Home Office Stipend', 'homeofficestipend'),
('Equipment Budget', 'equipmentbudget'),
('Standing Desks', 'standingdesks'),
('Free Snacks & Drinks', 'freesnacksdrinks'),
('Catered Meals', 'cateredmeals'),
('Coffee Bar', 'coffeebar'),
('Game Room', 'gameroom'),
('Commuter Benefits', 'commuterbenefits'),
('Parking', 'parking'),
('Company Retreats', 'companyretreats'),
('Team Events', 'teamevents'),
('Coworking Stipend', 'coworkingstipend'),

-- Other
('Employee Discounts', 'employeediscounts'),
('Charity Matching', 'charitymatching'),
('Visa Sponsorship', 'visasponsorship'),
('Open Source Contribution Time', 'opensourcecontributiontime'),
('Sabbatical After X Years', 'sabbaticalafterxyears'),
('International Transfer Opportunities', 'internationaltransferopportunities'),
('Employee Resource Groups', 'employeeresourcegroups'),
('Swag & Merch', 'swagmerch')
ON CONFLICT (slug) DO NOTHING;

-- ========================
-- CULTURE & VALUES
-- ========================
INSERT INTO culture_tags (name, slug) VALUES
-- Work Style
('Remote-First', 'remotefirst'),
('Async-Friendly', 'asyncfriendly'),
('Distributed Team', 'distributedteam'),
('In-Office Culture', 'inofficeculture'),
('Hybrid Culture', 'hybridculture'),
('Results-Oriented', 'resultsoriented'),
('Autonomous', 'autonomous'),
('Self-Directed', 'selfdirected'),
('Collaborative', 'collaborative'),
('Cross-Functional Teams', 'crossfunctionalteams'),
('Flat Hierarchy', 'flathierarchy'),
('Minimal Bureaucracy', 'minimalbureaucracy'),
('Startup Mentality', 'startupmentality'),
('Move Fast', 'movefast'),
('Bias for Action', 'biasforaction'),

-- Engineering Culture
('Engineering-Driven', 'engineeringdriven'),
('Open Source', 'opensource'),
('Code Reviews', 'codereviews'),
('Pair Programming', 'pairprogramming'),
('Test-Driven Development', 'testdrivendevelopment'),
('Continuous Deployment', 'continuousdeployment'),
('Ship Daily', 'shipdaily'),
('Blameless Postmortems', 'blamelesspostmortems'),
('Tech Blog', 'techblog'),
('Internal Tools Investment', 'internaltoolsinvestment'),
('Developer Experience Focus', 'developerexperiencefocus'),
('Hackathons', 'hackathons'),
('Innovation Time', 'innovationtime'),
('Documentation Culture', 'documentationculture'),

-- People & Growth
('Growth Mindset', 'growthmindset'),
('Continuous Learning', 'continuouslearning'),
('Mentorship Culture', 'mentorshipculture'),
('Promote From Within', 'promotefromwithin'),
('Transparent Compensation', 'transparentcompensation'),
('Career Pathing', 'careerpathing'),
('Regular 1:1s', 'regular1on1s'),
('Feedback Culture', 'feedbackculture'),
('Psychological Safety', 'psychologicalsafety'),
('Work-Life Balance', 'worklifebalance'),
('No Crunch Culture', 'nocrunchculture'),
('Sustainable Pace', 'sustainablepace'),
('Employee Wellbeing', 'employeewellbeing'),

-- Mission & Values
('Mission-Driven', 'missiondriven'),
('Customer-Obsessed', 'customerobsessed'),
('Data-Driven Decisions', 'datadrivendecisions'),
('Design-Driven', 'designdriven'),
('Product-Led', 'productled'),
('Impact-Focused', 'impactfocused'),
('Sustainability-Focused', 'sustainabilityfocused'),
('Social Impact', 'socialimpact'),
('Ethical AI', 'ethicalai'),
('Privacy-First', 'privacyfirst'),
('Security-First', 'securityfirst'),

-- Diversity & Inclusion
('Diverse & Inclusive', 'diverseinclusive'),
('Equal Opportunity', 'equalopportunity'),
('Neurodiversity-Friendly', 'neurodiversityfriendly'),
('LGBTQ+ Inclusive', 'lgbtqinclusive'),
('Women in Tech Initiatives', 'womenintechinitiatives'),
('Global Team', 'globalteam'),
('Multilingual', 'multilingual'),

-- Communication
('Transparent Communication', 'transparentcommunication'),
('All-Hands Meetings', 'allhandsmeetings'),
('Open Door Policy', 'opendoorpolicy'),
('Written Communication', 'writtencommunication'),
('Slack-First', 'slackfirst'),
('Video-First', 'videofirst'),
('No Ego', 'noego'),
('Radical Candor', 'radicalcandor'),

-- Fun & Community
('Fun & Social', 'funsocial'),
('Team Building', 'teambuilding'),
('Volunteer Culture', 'volunteerculture'),
('Community Involvement', 'communityinvolvement'),
('Dog-Friendly Office', 'dogfriendlyoffice'),
('Music in the Office', 'musicintheoffice'),
('Creative Environment', 'creativeenvironment'),
('Casual Dress Code', 'casualdresscode')
ON CONFLICT (slug) DO NOTHING;
