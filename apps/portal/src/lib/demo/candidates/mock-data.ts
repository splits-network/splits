import { Candidate } from "@splits-network/shared-types";

// Mock data generators for realistic candidate data
export function generateMockCandidates(count: number = 50): Candidate[] {
    const firstNames = [
        "Alex", "Jordan", "Taylor", "Morgan", "Casey", "Riley", "Avery", "Quinn",
        "Blake", "Cameron", "Drew", "Emery", "Finley", "Gray", "Harley", "Indigo",
        "Jamie", "Kai", "Lane", "Marlowe", "Nico", "Ocean", "Phoenix", "River",
        "Sage", "Teagan", "Val", "Wren", "Zion", "Ari", "Bailey", "Charlie",
        "Dakota", "Eden", "Frankie", "Haven", "Iris", "Jules", "Kendall", "Logan"
    ];

    const lastNames = [
        "Anderson", "Brooks", "Chen", "Davis", "Evans", "Foster", "Garcia", "Hughes",
        "Johnson", "Kim", "Lopez", "Martinez", "Nelson", "O'Connor", "Parker", "Quinn",
        "Rodriguez", "Smith", "Thompson", "Wilson", "Young", "Zhang", "Brown", "Clark",
        "Lee", "Miller", "Moore", "Taylor", "White", "Jackson", "Harris", "Martin",
        "Lewis", "Walker", "Hall", "Allen", "King", "Wright", "Scott", "Green"
    ];

    const locations = [
        "San Francisco, CA", "New York, NY", "Los Angeles, CA", "Chicago, IL",
        "Austin, TX", "Seattle, WA", "Boston, MA", "Denver, CO", "Portland, OR",
        "Miami, FL", "Atlanta, GA", "Remote", "Phoenix, AZ", "San Diego, CA",
        "Nashville, TN", "Dallas, TX", "Philadelphia, PA", "Minneapolis, MN",
        "Salt Lake City, UT", "Raleigh, NC"
    ];

    const skills = [
        "JavaScript", "TypeScript", "React", "Node.js", "Python", "AWS", "Docker",
        "Kubernetes", "GraphQL", "PostgreSQL", "MongoDB", "Redis", "Git", "CI/CD",
        "Machine Learning", "Data Analysis", "Product Management", "UI/UX Design",
        "Agile", "Scrum", "Leadership", "Communication", "Problem Solving",
        "Java", "C#", ".NET", "Spring Boot", "Angular", "Vue.js", "PHP", "Laravel",
        "Ruby", "Rails", "Go", "Rust", "DevOps", "Terraform", "Jenkins", "JIRA"
    ];

    const statuses: Array<Candidate['status']> = [
        'active', 'passive', 'not_interested', 'placed'
    ];

    const verificationStatuses: Array<Candidate['verification_status']> = [
        'pending', 'verified', 'rejected'
    ];

    const experienceLevels = [
        'Entry Level', 'Mid Level', 'Senior Level', 'Lead', 'Principal', 'Staff'
    ];

    const industries = [
        'Technology', 'Healthcare', 'Finance', 'Education', 'Manufacturing',
        'Retail', 'Consulting', 'Media', 'Non-Profit', 'Government'
    ];

    const candidates: Candidate[] = [];

    for (let i = 0; i < count; i++) {
        const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
        const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
        const name = `${firstName} ${lastName}`;
        const email = `${firstName.toLowerCase()}.${lastName.toLowerCase()}@example.com`;

        // Generate realistic creation dates (last 2 years)
        const createdAt = new Date(Date.now() - Math.random() * 2 * 365 * 24 * 60 * 60 * 1000);

        // Generate skills (3-8 skills per candidate)
        const candidateSkills = Array.from(
            new Set(Array(3 + Math.floor(Math.random() * 6))
                .fill(null)
                .map(() => skills[Math.floor(Math.random() * skills.length)]))
        );

        // Generate experience (1-20 years)
        const experience = 1 + Math.floor(Math.random() * 20);

        // Generate salary expectation ($50k - $300k)
        const salaryMin = 50000 + Math.floor(Math.random() * 150000);
        const salaryMax = salaryMin + 10000 + Math.floor(Math.random() * 100000);

        const candidate: Candidate = {
            id: `candidate-${i + 1}`,
            user_id: `user-${i + 1}`,
            company_id: Math.random() > 0.7 ? `company-${Math.floor(Math.random() * 10) + 1}` : null,
            name,
            email,
            phone: `+1${Math.floor(Math.random() * 9000000000) + 1000000000}`,
            location: locations[Math.floor(Math.random() * locations.length)],
            status: statuses[Math.floor(Math.random() * statuses.length)],
            verification_status: verificationStatuses[Math.floor(Math.random() * verificationStatuses.length)],

            // Professional info
            current_title: `${experienceLevels[Math.floor(Math.random() * experienceLevels.length)]} ${candidateSkills[0]} Engineer`,
            experience_years: experience,
            skills: candidateSkills,
            bio: `Passionate ${candidateSkills[0]} professional with ${experience} years of experience. Skilled in ${candidateSkills.slice(0, 3).join(', ')} and looking for new opportunities in ${industries[Math.floor(Math.random() * industries.length)]}.`,

            // Marketplace profile
            marketplace_profile: {
                is_public: Math.random() > 0.3,
                desired_salary_min: salaryMin,
                desired_salary_max: salaryMax,
                desired_roles: candidateSkills.slice(0, 2).map(skill => `${skill} Developer`),
                preferred_locations: [
                    locations[Math.floor(Math.random() * locations.length)],
                    ...(Math.random() > 0.5 ? [locations[Math.floor(Math.random() * locations.length)]] : [])
                ].filter((v, i, a) => a.indexOf(v) === i), // Remove duplicates
                availability_date: new Date(Date.now() + Math.random() * 6 * 30 * 24 * 60 * 60 * 1000).toISOString(),
                open_to_remote: Math.random() > 0.4,
                visa_sponsorship_required: Math.random() > 0.8,
                notice_period_weeks: Math.floor(Math.random() * 8) + 1,
            },

            // Relationship indicators (computed fields from real API)
            is_new: Math.random() > 0.7,
            has_active_relationship: Math.random() > 0.6,
            has_pending_invitation: Math.random() > 0.9,
            has_other_active_recruiters: Math.random() > 0.8,
            other_active_recruiters_count: Math.floor(Math.random() * 3),
            is_sourcer: Math.random() > 0.95,

            // Timestamps
            created_at: createdAt.toISOString(),
            updated_at: new Date(createdAt.getTime() + Math.random() * 90 * 24 * 60 * 60 * 1000).toISOString(),
        };

        candidates.push(candidate);
    }

    return candidates;
}

// Initialize demo data in localStorage if not exists
export function initializeDemoCandidates(): void {
    const storageKey = 'splits-demo-candidates';

    if (!localStorage.getItem(storageKey)) {
        const mockCandidates = generateMockCandidates(75); // Generate 75 candidates
        localStorage.setItem(storageKey, JSON.stringify(mockCandidates));
    }
}

// Get demo candidates from localStorage
export function getDemoCandidates(): Candidate[] {
    try {
        const stored = localStorage.getItem('splits-demo-candidates');
        return stored ? JSON.parse(stored) : [];
    } catch {
        return [];
    }
}

// Reset demo data
export function resetDemoData(): void {
    localStorage.removeItem('splits-demo-candidates');
    initializeDemoCandidates();
}