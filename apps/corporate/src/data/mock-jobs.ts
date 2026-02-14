import type { JobListing } from '../types/job-listing';

/**
 * Mock Job Listings
 * Realistic sample data for all 10 lists page variants
 */

export const mockJobs: JobListing[] = [
  {
    id: 'job-001',
    title: 'Senior Product Designer',
    company: 'Stripe',
    location: 'San Francisco, CA',
    salary: { min: 150000, max: 200000, currency: 'USD' },
    type: 'full-time',
    status: 'open',
    postedDate: '2026-02-10T08:00:00Z',
    deadline: '2026-03-15T23:59:59Z',
    description: 'We\'re looking for a Senior Product Designer to join our Payments team and help shape the future of online commerce. You\'ll work on complex, high-impact projects that affect millions of businesses worldwide.',
    requirements: [
      '5+ years of product design experience',
      'Expert proficiency in Figma and design systems',
      'Strong portfolio demonstrating end-to-end product work',
      'Experience with payments or fintech products',
      'Excellent communication and collaboration skills'
    ],
    responsibilities: [
      'Lead design for critical payment flows and checkout experiences',
      'Collaborate with engineering, product, and research teams',
      'Contribute to and evolve our design system',
      'Conduct user research and usability testing',
      'Mentor junior designers on the team'
    ],
    benefits: ['Health insurance', 'Unlimited PTO', '401k match', 'Remote flexibility', 'Learning budget'],
    recruiter: {
      name: 'Sarah Chen',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400',
      agency: 'TechHire Partners'
    },
    applicants: 127,
    views: 1843,
    featured: true,
    tags: ['Figma', 'Design Systems', 'Payments', 'UX Research'],
    department: 'Design',
    experienceLevel: 'senior',
    equity: '0.05% - 0.15%'
  },
  {
    id: 'job-002',
    title: 'Staff Software Engineer (Backend)',
    company: 'Notion',
    location: 'Remote (US)',
    salary: { min: 180000, max: 240000, currency: 'USD' },
    type: 'remote',
    status: 'open',
    postedDate: '2026-02-12T09:30:00Z',
    deadline: '2026-03-20T23:59:59Z',
    description: 'Join Notion\'s backend team to build the infrastructure powering millions of collaborative workspaces. You\'ll work on distributed systems, real-time sync, and scaling challenges.',
    requirements: [
      '8+ years of backend engineering experience',
      'Deep expertise in distributed systems and databases',
      'Proficiency in Go, Python, or similar languages',
      'Experience with real-time collaboration systems',
      'Strong system design and architecture skills'
    ],
    responsibilities: [
      'Design and implement scalable backend services',
      'Optimize database performance and data models',
      'Lead technical architecture discussions',
      'Mentor engineers and set technical standards',
      'Collaborate with product teams on feature development'
    ],
    benefits: ['Competitive salary', 'Equity package', 'Remote work', 'Health/dental/vision', 'Home office stipend'],
    recruiter: {
      name: 'Michael Torres',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400',
      agency: 'Scale Recruiting'
    },
    applicants: 203,
    views: 2947,
    featured: true,
    tags: ['Go', 'Python', 'PostgreSQL', 'Distributed Systems', 'Redis'],
    department: 'Engineering',
    experienceLevel: 'senior',
    equity: '0.1% - 0.3%'
  },
  {
    id: 'job-003',
    title: 'Marketing Manager',
    company: 'Figma',
    location: 'New York, NY',
    salary: { min: 120000, max: 160000, currency: 'USD' },
    type: 'full-time',
    status: 'open',
    postedDate: '2026-02-08T10:00:00Z',
    deadline: '2026-03-10T23:59:59Z',
    description: 'Lead marketing initiatives for Figma\'s enterprise segment. Develop campaigns, manage events, and work cross-functionally to drive growth.',
    requirements: [
      '5+ years in B2B SaaS marketing',
      'Experience with enterprise marketing campaigns',
      'Strong analytical and data-driven mindset',
      'Excellent written and verbal communication',
      'Event planning and execution experience'
    ],
    responsibilities: [
      'Develop and execute marketing campaigns for enterprise customers',
      'Manage webinars, conferences, and field marketing events',
      'Collaborate with sales and product teams',
      'Analyze campaign performance and optimize strategies',
      'Build and manage relationships with partners'
    ],
    benefits: ['Comprehensive health coverage', 'Equity compensation', 'Flexible PTO', 'Professional development'],
    recruiter: {
      name: 'Jessica Park',
      avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400',
      agency: 'CreativeEdge Talent'
    },
    applicants: 89,
    views: 1254,
    featured: false,
    tags: ['B2B Marketing', 'SaaS', 'Events', 'Campaign Management'],
    department: 'Marketing',
    experienceLevel: 'mid'
  },
  {
    id: 'job-004',
    title: 'Data Scientist',
    company: 'Airbnb',
    location: 'Seattle, WA',
    salary: { min: 140000, max: 180000, currency: 'USD' },
    type: 'full-time',
    status: 'open',
    postedDate: '2026-02-11T11:15:00Z',
    deadline: '2026-03-18T23:59:59Z',
    description: 'Join Airbnb\'s Data Science team to leverage data and analytics to improve guest and host experiences. Work on pricing optimization, search ranking, and fraud detection.',
    requirements: [
      'MS or PhD in Computer Science, Statistics, or related field',
      '3+ years of data science experience',
      'Strong proficiency in Python, SQL, and ML frameworks',
      'Experience with A/B testing and experimentation',
      'Excellent problem-solving and communication skills'
    ],
    responsibilities: [
      'Build predictive models for pricing and demand forecasting',
      'Design and analyze A/B tests for product features',
      'Collaborate with product and engineering teams',
      'Develop fraud detection algorithms',
      'Present insights to leadership and stakeholders'
    ],
    benefits: ['Stock options', 'Annual travel credit', 'Health benefits', 'Learning stipend', 'Remote flexibility'],
    recruiter: {
      name: 'David Kim',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400',
      agency: 'DataTalent Group'
    },
    applicants: 156,
    views: 2103,
    featured: true,
    tags: ['Python', 'SQL', 'Machine Learning', 'A/B Testing', 'Statistics'],
    department: 'Data',
    experienceLevel: 'mid',
    equity: '0.03% - 0.08%'
  },
  {
    id: 'job-005',
    title: 'Frontend Engineer',
    company: 'Linear',
    location: 'Remote (Europe)',
    salary: { min: 90000, max: 130000, currency: 'EUR' },
    type: 'remote',
    status: 'open',
    postedDate: '2026-02-09T07:45:00Z',
    deadline: '2026-03-12T23:59:59Z',
    description: 'Build the fastest, most delightful project management tool. Work on performance, animations, and interactions that set Linear apart.',
    requirements: [
      '4+ years of frontend development experience',
      'Expert knowledge of React and TypeScript',
      'Strong understanding of performance optimization',
      'Eye for design and attention to detail',
      'Experience with animation libraries (Framer Motion, GSAP)'
    ],
    responsibilities: [
      'Implement new features with pixel-perfect UI',
      'Optimize rendering and animation performance',
      'Build reusable component libraries',
      'Collaborate with design on interactions and micro-animations',
      'Participate in code reviews and technical discussions'
    ],
    benefits: ['Competitive equity', 'Remote-first culture', 'Health insurance', 'Co-working stipend', '4-day work weeks'],
    recruiter: {
      name: 'Emma Schmidt',
      avatar: 'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=400',
      agency: 'European Tech Recruiters'
    },
    applicants: 241,
    views: 3412,
    featured: true,
    tags: ['React', 'TypeScript', 'Performance', 'GSAP', 'CSS'],
    department: 'Engineering',
    experienceLevel: 'mid'
  },
  {
    id: 'job-006',
    title: 'Head of Customer Success',
    company: 'Webflow',
    location: 'San Francisco, CA',
    salary: { min: 160000, max: 210000, currency: 'USD' },
    type: 'full-time',
    status: 'open',
    postedDate: '2026-02-07T13:20:00Z',
    deadline: '2026-03-08T23:59:59Z',
    description: 'Lead Webflow\'s Customer Success organization. Build and scale the team, drive retention, and ensure customer satisfaction.',
    requirements: [
      '10+ years in customer success or account management',
      '5+ years in leadership roles managing teams of 20+',
      'Experience in B2B SaaS and enterprise customers',
      'Proven track record of improving retention metrics',
      'Strong data-driven approach to CS operations'
    ],
    responsibilities: [
      'Build and lead the global Customer Success team',
      'Define CS strategy and success metrics',
      'Drive net revenue retention and expansion',
      'Collaborate with sales, product, and support teams',
      'Implement CS tools and processes'
    ],
    benefits: ['Executive compensation package', 'Equity grant', 'Unlimited PTO', 'Executive coaching', 'Relocation assistance'],
    recruiter: {
      name: 'Robert Johnson',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400',
      agency: 'Executive Search Partners'
    },
    applicants: 47,
    views: 892,
    featured: true,
    tags: ['Customer Success', 'Leadership', 'SaaS', 'Team Management'],
    department: 'Customer Success',
    experienceLevel: 'executive',
    equity: '0.2% - 0.5%'
  },
  {
    id: 'job-007',
    title: 'DevOps Engineer',
    company: 'GitLab',
    location: 'Remote (Global)',
    salary: { min: 110000, max: 150000, currency: 'USD' },
    type: 'remote',
    status: 'open',
    postedDate: '2026-02-13T06:00:00Z',
    deadline: '2026-03-22T23:59:59Z',
    description: 'Join GitLab\'s infrastructure team to build and maintain the platform that hosts millions of repositories. Work on Kubernetes, CI/CD, and cloud infrastructure.',
    requirements: [
      '3+ years of DevOps or SRE experience',
      'Strong knowledge of Kubernetes and Docker',
      'Experience with AWS, GCP, or Azure',
      'Proficiency in scripting (Python, Bash, Go)',
      'Understanding of CI/CD pipelines and automation'
    ],
    responsibilities: [
      'Manage and scale Kubernetes clusters',
      'Build CI/CD pipelines and automation tools',
      'Monitor system performance and reliability',
      'Respond to incidents and improve on-call processes',
      'Collaborate with engineering teams on infrastructure needs'
    ],
    benefits: ['All-remote company', 'Flexible hours', 'Health coverage', 'Home office budget', 'Learning & development'],
    recruiter: {
      name: 'Alex Martinez',
      avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400',
      agency: 'CloudOps Talent'
    },
    applicants: 178,
    views: 2456,
    featured: false,
    tags: ['Kubernetes', 'Docker', 'AWS', 'CI/CD', 'Python'],
    department: 'Infrastructure',
    experienceLevel: 'mid'
  },
  {
    id: 'job-008',
    title: 'Product Manager',
    company: 'Superhuman',
    location: 'San Francisco, CA',
    salary: { min: 140000, max: 180000, currency: 'USD' },
    type: 'full-time',
    status: 'open',
    postedDate: '2026-02-06T14:30:00Z',
    deadline: '2026-03-05T23:59:59Z',
    description: 'Own the product roadmap for Superhuman\'s core email experience. Drive product strategy, collaborate with engineering and design, and ship features that delight users.',
    requirements: [
      '4+ years of product management experience',
      'Experience building consumer or productivity software',
      'Strong technical background (engineering or design)',
      'Data-driven approach to product decisions',
      'Excellent communication and stakeholder management'
    ],
    responsibilities: [
      'Define product vision and roadmap',
      'Write product specs and user stories',
      'Prioritize features based on user feedback and data',
      'Work closely with engineering and design teams',
      'Track metrics and iterate on features'
    ],
    benefits: ['Competitive salary and equity', 'Health/dental/vision', 'Commuter benefits', 'Catered lunches', 'Wellness stipend'],
    recruiter: {
      name: 'Lisa Wang',
      avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400',
      agency: 'Product Leaders Collective'
    },
    applicants: 134,
    views: 1876,
    featured: false,
    tags: ['Product Management', 'SaaS', 'Email', 'Productivity'],
    department: 'Product',
    experienceLevel: 'mid'
  },
  {
    id: 'job-009',
    title: 'Security Engineer',
    company: '1Password',
    location: 'Toronto, Canada',
    salary: { min: 120000, max: 160000, currency: 'CAD' },
    type: 'full-time',
    status: 'open',
    postedDate: '2026-02-05T09:00:00Z',
    deadline: '2026-03-01T23:59:59Z',
    description: 'Protect the security and privacy of millions of 1Password users. Work on threat modeling, penetration testing, and security architecture.',
    requirements: [
      '5+ years in application security or security engineering',
      'Deep understanding of cryptography and secure coding',
      'Experience with penetration testing and security audits',
      'Knowledge of common vulnerabilities (OWASP Top 10)',
      'Strong programming skills (Go, Rust, or C++)'
    ],
    responsibilities: [
      'Conduct security reviews and threat modeling',
      'Perform penetration testing on applications and infrastructure',
      'Build security tools and automation',
      'Respond to security incidents and vulnerabilities',
      'Educate engineering teams on secure coding practices'
    ],
    benefits: ['Stock options', 'Health benefits', 'RRSP matching', 'Flexible work', 'Professional development'],
    recruiter: {
      name: 'Thomas Anderson',
      avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=400',
      agency: 'CyberSec Talent'
    },
    applicants: 92,
    views: 1543,
    featured: false,
    tags: ['Security', 'Cryptography', 'Penetration Testing', 'Go', 'Rust'],
    department: 'Security',
    experienceLevel: 'senior'
  },
  {
    id: 'job-010',
    title: 'UX Researcher',
    company: 'Miro',
    location: 'Amsterdam, Netherlands',
    salary: { min: 70000, max: 95000, currency: 'EUR' },
    type: 'full-time',
    status: 'open',
    postedDate: '2026-02-14T08:15:00Z',
    deadline: '2026-03-25T23:59:59Z',
    description: 'Conduct user research to inform product decisions and improve the collaborative whiteboarding experience for distributed teams.',
    requirements: [
      '3+ years of UX research experience',
      'Proficiency in qualitative and quantitative research methods',
      'Experience with remote research tools (UserTesting, Lookback)',
      'Strong analytical and synthesis skills',
      'Portfolio demonstrating research impact on product'
    ],
    responsibilities: [
      'Plan and conduct user interviews, surveys, and usability tests',
      'Synthesize research findings into actionable insights',
      'Collaborate with product and design teams',
      'Build and maintain user research repositories',
      'Present findings to stakeholders and leadership'
    ],
    benefits: ['Equity package', 'Flexible work hours', 'Health insurance', 'Workspace budget', 'Learning stipend'],
    recruiter: {
      name: 'Sophie Laurent',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400',
      agency: 'EU Design Talent'
    },
    applicants: 67,
    views: 943,
    featured: false,
    tags: ['User Research', 'UX', 'Usability Testing', 'Qualitative Research'],
    department: 'Research',
    experienceLevel: 'mid'
  },
  {
    id: 'job-011',
    title: 'iOS Engineer',
    company: 'Calm',
    location: 'Los Angeles, CA',
    salary: { min: 130000, max: 170000, currency: 'USD' },
    type: 'full-time',
    status: 'open',
    postedDate: '2026-02-04T12:00:00Z',
    deadline: '2026-02-28T23:59:59Z',
    description: 'Build the iOS app that helps millions of people meditate, sleep better, and reduce stress. Work on audio playback, offline sync, and delightful animations.',
    requirements: [
      '4+ years of iOS development experience',
      'Expert knowledge of Swift and SwiftUI',
      'Experience with audio playback and CoreAudio',
      'Understanding of offline-first architecture',
      'Strong attention to performance and battery life'
    ],
    responsibilities: [
      'Develop new features for the Calm iOS app',
      'Optimize audio playback and offline content sync',
      'Collaborate with design on animations and interactions',
      'Write unit and integration tests',
      'Participate in on-call rotation for critical issues'
    ],
    benefits: ['Calm Premium subscription', 'Mental health days', 'Health insurance', 'Stock options', 'Wellness programs'],
    recruiter: {
      name: 'Rachel Green',
      avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400',
      agency: 'Mobile First Recruiting'
    },
    applicants: 198,
    views: 2734,
    featured: true,
    tags: ['iOS', 'Swift', 'SwiftUI', 'CoreAudio', 'Mobile'],
    department: 'Engineering',
    experienceLevel: 'mid',
    equity: '0.02% - 0.06%'
  },
  {
    id: 'job-012',
    title: 'Sales Development Representative',
    company: 'HubSpot',
    location: 'Boston, MA',
    salary: { min: 55000, max: 75000, currency: 'USD' },
    type: 'full-time',
    status: 'open',
    postedDate: '2026-02-13T10:30:00Z',
    deadline: '2026-03-20T23:59:59Z',
    description: 'Generate qualified leads for HubSpot\'s sales team. Prospect into target accounts, conduct discovery calls, and book demos.',
    requirements: [
      '1-2 years of sales or SDR experience (entry-level welcome)',
      'Strong communication and phone skills',
      'Familiarity with Salesforce or similar CRM',
      'Self-motivated and goal-oriented',
      'Interest in SaaS and marketing technology'
    ],
    responsibilities: [
      'Conduct outbound prospecting via phone, email, and LinkedIn',
      'Qualify inbound leads from marketing campaigns',
      'Book demos for Account Executives',
      'Maintain accurate records in Salesforce',
      'Collaborate with marketing on campaigns'
    ],
    benefits: ['Uncapped commission', 'Career progression path to AE', 'Health benefits', 'INBOUND conference ticket', 'Training programs'],
    recruiter: {
      name: 'Chris Brown',
      avatar: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=400',
      agency: 'SalesForce Talent'
    },
    applicants: 312,
    views: 4521,
    featured: false,
    tags: ['Sales', 'SDR', 'SaaS', 'Salesforce', 'Prospecting'],
    department: 'Sales',
    experienceLevel: 'entry'
  },
  {
    id: 'job-013',
    title: 'Technical Writer',
    company: 'Vercel',
    location: 'Remote (Americas)',
    salary: { min: 90000, max: 120000, currency: 'USD' },
    type: 'remote',
    status: 'open',
    postedDate: '2026-02-12T07:00:00Z',
    deadline: '2026-03-15T23:59:59Z',
    description: 'Create documentation, tutorials, and guides for Next.js and Vercel platform. Help developers build faster with clear, comprehensive docs.',
    requirements: [
      '3+ years of technical writing experience',
      'Strong understanding of web development (React, Next.js)',
      'Excellent writing and editing skills',
      'Experience with documentation tools (MDX, GitHub)',
      'Ability to explain complex concepts simply'
    ],
    responsibilities: [
      'Write and maintain product documentation',
      'Create tutorials and getting started guides',
      'Collaborate with engineering on API documentation',
      'Improve documentation based on user feedback',
      'Maintain docs site and contribute to open source'
    ],
    benefits: ['Remote-first', 'Flexible hours', 'Health coverage', 'Home office setup', 'Conference budget'],
    recruiter: {
      name: 'Kevin Lee',
      avatar: 'https://images.unsplash.com/photo-1568602471122-7832951cc4c5?w=400',
      agency: 'DevRel Recruiters'
    },
    applicants: 145,
    views: 2087,
    featured: false,
    tags: ['Technical Writing', 'Documentation', 'Next.js', 'React', 'MDX'],
    department: 'Developer Relations',
    experienceLevel: 'mid'
  },
  {
    id: 'job-014',
    title: 'Machine Learning Engineer',
    company: 'OpenAI',
    location: 'San Francisco, CA',
    salary: { min: 200000, max: 300000, currency: 'USD' },
    type: 'full-time',
    status: 'open',
    postedDate: '2026-02-10T15:00:00Z',
    deadline: '2026-03-17T23:59:59Z',
    description: 'Push the boundaries of AI research and deployment. Work on large language models, training infrastructure, and cutting-edge ML systems.',
    requirements: [
      'PhD or MS in Computer Science, ML, or equivalent experience',
      '5+ years of ML engineering experience',
      'Deep understanding of transformers and large language models',
      'Experience with PyTorch and distributed training',
      'Strong systems and infrastructure background'
    ],
    responsibilities: [
      'Train and fine-tune large language models',
      'Optimize training infrastructure and efficiency',
      'Implement and experiment with new architectures',
      'Collaborate with research team on publications',
      'Deploy models to production at scale'
    ],
    benefits: ['Top-tier compensation', 'Significant equity', 'Health/dental/vision', 'Compute credits', 'Research time'],
    recruiter: {
      name: 'Dr. Priya Patel',
      avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=400',
      agency: 'AI Talent Partners'
    },
    applicants: 876,
    views: 12453,
    featured: true,
    tags: ['Machine Learning', 'PyTorch', 'LLMs', 'Distributed Systems', 'Python'],
    department: 'Research',
    experienceLevel: 'senior',
    equity: '0.1% - 0.4%'
  },
  {
    id: 'job-015',
    title: 'Graphic Designer',
    company: 'Canva',
    location: 'Sydney, Australia',
    salary: { min: 80000, max: 110000, currency: 'AUD' },
    type: 'full-time',
    status: 'pending',
    postedDate: '2026-02-11T05:30:00Z',
    deadline: '2026-03-13T23:59:59Z',
    description: 'Design marketing assets, brand materials, and in-product templates for Canva\'s global user base.',
    requirements: [
      '3+ years of graphic design experience',
      'Expert proficiency in design tools (Figma, Adobe Creative Suite)',
      'Strong portfolio demonstrating brand and marketing work',
      'Understanding of design systems and scalable design',
      'Excellent communication and collaboration skills'
    ],
    responsibilities: [
      'Design marketing campaigns and brand materials',
      'Create in-product templates and design assets',
      'Collaborate with marketing and product teams',
      'Maintain and evolve Canva\'s brand guidelines',
      'Present design work to stakeholders'
    ],
    benefits: ['Equity package', 'Flexible work', 'Health insurance', 'Parental leave', 'Learning budget'],
    recruiter: {
      name: 'Hannah Wilson',
      avatar: 'https://images.unsplash.com/photo-1531123897727-8f129e1688ce?w=400',
      agency: 'Creative APAC Talent'
    },
    applicants: 267,
    views: 3254,
    featured: false,
    tags: ['Graphic Design', 'Figma', 'Adobe Creative Suite', 'Branding'],
    department: 'Design',
    experienceLevel: 'mid'
  },
  {
    id: 'job-016',
    title: 'Engineering Manager',
    company: 'Shopify',
    location: 'Ottawa, Canada',
    salary: { min: 150000, max: 190000, currency: 'CAD' },
    type: 'full-time',
    status: 'open',
    postedDate: '2026-02-08T11:45:00Z',
    deadline: '2026-03-10T23:59:59Z',
    description: 'Lead a team of 6-8 engineers building merchant-facing features for Shopify\'s commerce platform. Drive technical excellence and team growth.',
    requirements: [
      '7+ years of software engineering experience',
      '2+ years managing engineering teams',
      'Strong technical background in web development',
      'Experience with Ruby on Rails or similar frameworks',
      'Proven track record of shipping products'
    ],
    responsibilities: [
      'Manage and grow a team of full-stack engineers',
      'Drive technical roadmap and architecture decisions',
      'Conduct 1:1s, performance reviews, and career development',
      'Collaborate with product and design on roadmap',
      'Foster inclusive and high-performing team culture'
    ],
    benefits: ['Stock options', 'Health/dental', 'Parental leave', 'Learning budget', 'Flexible work'],
    recruiter: {
      name: 'Mohammed Hassan',
      avatar: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=400',
      agency: 'Canadian Tech Leaders'
    },
    applicants: 103,
    views: 1632,
    featured: true,
    tags: ['Engineering Management', 'Ruby on Rails', 'Leadership', 'E-commerce'],
    department: 'Engineering',
    experienceLevel: 'senior'
  },
  {
    id: 'job-017',
    title: 'Content Strategist',
    company: 'Mailchimp',
    location: 'Atlanta, GA',
    salary: { min: 85000, max: 115000, currency: 'USD' },
    type: 'full-time',
    status: 'open',
    postedDate: '2026-02-09T13:00:00Z',
    deadline: '2026-03-12T23:59:59Z',
    description: 'Develop content strategies for product launches, in-app messaging, and email campaigns. Help small businesses grow through better communication.',
    requirements: [
      '4+ years in content strategy or UX writing',
      'Experience with SaaS product messaging',
      'Strong writing and editing skills',
      'Understanding of content design and information architecture',
      'Familiarity with email marketing best practices'
    ],
    responsibilities: [
      'Create content strategies for product features',
      'Write and edit in-app copy and email campaigns',
      'Collaborate with product, design, and marketing',
      'Conduct content audits and information architecture reviews',
      'Develop voice and tone guidelines'
    ],
    benefits: ['Competitive salary', 'Retirement matching', 'Health benefits', 'Hybrid work', 'Creative time off'],
    recruiter: {
      name: 'Olivia Martinez',
      avatar: 'https://images.unsplash.com/photo-1607746882042-944635dfe10e?w=400',
      agency: 'Content & Copy Pros'
    },
    applicants: 178,
    views: 2145,
    featured: false,
    tags: ['Content Strategy', 'UX Writing', 'Email Marketing', 'SaaS'],
    department: 'Content',
    experienceLevel: 'mid'
  },
  {
    id: 'job-018',
    title: 'QA Engineer',
    company: 'Atlassian',
    location: 'Austin, TX',
    salary: { min: 95000, max: 130000, currency: 'USD' },
    type: 'full-time',
    status: 'filled',
    postedDate: '2026-01-28T09:00:00Z',
    deadline: '2026-02-25T23:59:59Z',
    description: 'Ensure quality across Jira and Confluence products. Build test automation, perform manual testing, and improve QA processes.',
    requirements: [
      '3+ years of QA or test automation experience',
      'Proficiency in test automation frameworks (Selenium, Cypress)',
      'Experience with API testing and performance testing',
      'Strong understanding of CI/CD pipelines',
      'Familiarity with agile development processes'
    ],
    responsibilities: [
      'Develop and maintain automated test suites',
      'Perform manual exploratory testing',
      'Collaborate with engineering on test coverage',
      'Report and track bugs in Jira',
      'Improve QA processes and tooling'
    ],
    benefits: ['Stock options', 'Flexible work', 'Health coverage', 'Learning stipend', 'Team offsites'],
    recruiter: {
      name: 'Daniel Cooper',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400',
      agency: 'QA Talent Network'
    },
    applicants: 234,
    views: 3012,
    featured: false,
    tags: ['QA', 'Test Automation', 'Selenium', 'Cypress', 'CI/CD'],
    department: 'Quality',
    experienceLevel: 'mid'
  },
  {
    id: 'job-019',
    title: 'Solutions Architect',
    company: 'Snowflake',
    location: 'Remote (US)',
    salary: { min: 170000, max: 220000, currency: 'USD' },
    type: 'remote',
    status: 'open',
    postedDate: '2026-02-07T14:15:00Z',
    deadline: '2026-03-08T23:59:59Z',
    description: 'Partner with enterprise customers to design and implement data cloud solutions. Provide technical guidance and best practices for data architecture.',
    requirements: [
      '7+ years in solutions architecture or data engineering',
      'Deep knowledge of data warehousing and cloud platforms',
      'Experience with Snowflake or similar data platforms',
      'Strong SQL and data modeling skills',
      'Excellent presentation and customer-facing skills'
    ],
    responsibilities: [
      'Design data architectures for enterprise customers',
      'Conduct technical workshops and proof-of-concepts',
      'Provide guidance on migration and optimization',
      'Collaborate with sales and product teams',
      'Create reference architectures and best practices'
    ],
    benefits: ['Top-tier compensation', 'Stock options', 'Remote work', 'Travel opportunities', 'Professional development'],
    recruiter: {
      name: 'Victoria Zhang',
      avatar: 'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=400',
      agency: 'Data Cloud Talent'
    },
    applicants: 87,
    views: 1456,
    featured: true,
    tags: ['Solutions Architecture', 'Snowflake', 'SQL', 'Data Warehousing', 'Cloud'],
    department: 'Sales Engineering',
    experienceLevel: 'senior',
    equity: '0.05% - 0.12%'
  },
  {
    id: 'job-020',
    title: 'Accountant',
    company: 'Gusto',
    location: 'Denver, CO',
    salary: { min: 70000, max: 95000, currency: 'USD' },
    type: 'full-time',
    status: 'open',
    postedDate: '2026-02-06T10:00:00Z',
    deadline: '2026-03-05T23:59:59Z',
    description: 'Join Gusto\'s finance team to manage financial reporting, reconciliations, and month-end close processes.',
    requirements: [
      'Bachelor\'s degree in Accounting or Finance',
      'CPA certification preferred',
      '3+ years of accounting experience (SaaS preferred)',
      'Proficiency in NetSuite or similar ERP systems',
      'Strong Excel and analytical skills'
    ],
    responsibilities: [
      'Prepare monthly financial statements',
      'Perform account reconciliations and journal entries',
      'Support annual audit and SOX compliance',
      'Analyze financial data and trends',
      'Collaborate with FP&A and operations teams'
    ],
    benefits: ['Competitive salary', 'Health/dental/vision', '401k match', 'Stock options', 'Remote flexibility'],
    recruiter: {
      name: 'Amanda White',
      avatar: 'https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?w=400',
      agency: 'Finance Talent Group'
    },
    applicants: 156,
    views: 1987,
    featured: false,
    tags: ['Accounting', 'Finance', 'NetSuite', 'CPA', 'SaaS'],
    department: 'Finance',
    experienceLevel: 'mid'
  }
];
