/* ─── Mock Data: Application Detail Panel ──────────────────────────── */

export const data = {
    /* Core identity */
    id: "app-001",
    stage: "interview",
    submittedAt: "Feb 15, 2026",
    createdAt: "2026-02-15T10:30:00Z",

    /* Candidate */
    candidate: {
        fullName: "Alex Chen",
        initials: "AC",
        currentTitle: "Senior Software Engineer",
        currentCompany: "Acme Corp",
        email: "alex.chen@email.com",
        phone: "+1 (512) 555-0147",
        location: "Austin, TX",
        bio: "Senior software engineer with 7 years of experience building distributed systems. Passionate about clean architecture, developer tooling, and mentoring junior engineers. Led migration of monolithic Rails app to microservices architecture serving 2M+ daily requests.",
        verificationStatus: "verified",
        desiredSalary: "$180K - $220K",
        desiredJobType: "Full Time",
        availability: "Immediately",
        openToRemote: true,
        openToRelocation: true,
        linkedinUrl: "https://linkedin.com/in/alexchen",
        githubUrl: "https://github.com/alexchen",
        skills: ["TypeScript", "React", "Node.js", "PostgreSQL", "AWS", "Docker", "Kubernetes"],
    },

    /* Job / Role */
    job: {
        title: "Senior Full-Stack Engineer",
        location: "San Francisco, CA",
        employmentType: "Full Time",
        salaryMin: 180000,
        salaryMax: 220000,
        salaryDisplay: "$180K - $220K",
        feePercentage: 20,
        recruiterDescription:
            "We need a senior full-stack engineer who can own features end-to-end. The ideal candidate has shipped production React + Node.js applications at scale.",
        company: {
            name: "TechCorp Solutions",
            industry: "Enterprise Software",
        },
    },

    /* Recruiters */
    candidateRecruiter: {
        name: "Sarah Mitchell",
        email: "sarah.mitchell@apextalent.com",
        initials: "SM",
    },
    candidateSourcer: {
        name: "David Park",
        email: "david.park@apextalent.com",
        initials: "DP",
    },
    companyRecruiter: {
        name: "Jennifer Walsh",
        email: "j.walsh@techcorp.io",
        initials: "JW",
    },
    companySourcer: null as null,

    /* AI Review */
    aiReview: {
        fitScore: 92,
        summary:
            "Strong technical match. Candidate has direct experience with required stack (React, TypeScript, Node.js, PostgreSQL, AWS). 7 years of relevant experience exceeds the 5-year minimum. Previous leadership of a microservices migration aligns with the platform team's mission.",
        strengths: [
            "Direct experience with all 5 required technologies",
            "Proven track record of leading complex migrations",
            "Strong system design skills demonstrated at scale (2M+ daily requests)",
        ],
        concerns: [
            "No Terraform experience listed (preferred skill)",
            "Limited GraphQL exposure based on resume",
        ],
    },

    /* Documents */
    documents: [
        { id: "d1", fileName: "alex-chen-resume-2026.pdf", documentType: "resume", fileSize: 245760, isPrimary: true },
        { id: "d2", fileName: "cover-letter-techcorp.pdf", documentType: "cover_letter", fileSize: 102400, isPrimary: false },
    ],

    /* Timeline / Audit log */
    timeline: [
        { action: "Application submitted", actor: "Sarah Mitchell", date: "Feb 15, 2026", time: "10:30 AM", icon: "fa-paper-plane" },
        { action: "AI review completed", actor: "System", date: "Feb 15, 2026", time: "10:32 AM", icon: "fa-brain" },
        { action: "Stage changed to Screening", actor: "Jennifer Walsh", date: "Feb 16, 2026", time: "9:15 AM", icon: "fa-filter" },
        { action: "Note added", actor: "Jennifer Walsh", date: "Feb 17, 2026", time: "2:00 PM", icon: "fa-comment" },
        { action: "Stage changed to Interview", actor: "Jennifer Walsh", date: "Feb 18, 2026", time: "11:00 AM", icon: "fa-comments" },
    ],

    /* Notes */
    notes: [
        {
            id: "n1",
            author: "Jennifer Walsh",
            initials: "JW",
            creatorType: "company_admin",
            content: "Passed initial screen. Very strong technical background. Scheduling for technical round on Feb 20.",
            createdAt: "Feb 17, 2026 2:00 PM",
        },
        {
            id: "n2",
            author: "Sarah Mitchell",
            initials: "SM",
            creatorType: "candidate_recruiter",
            content: "Candidate is very excited about this opportunity. Confirmed availability for technical interview next week.",
            createdAt: "Feb 17, 2026 4:30 PM",
        },
    ],

    /* Stats for PanelHeader */
    stats: [
        { label: "AI Score", value: "92", icon: "fa-duotone fa-regular fa-brain" },
        { label: "Stage", value: "Interview", icon: "fa-duotone fa-regular fa-comments" },
        { label: "Docs", value: "2", icon: "fa-duotone fa-regular fa-file" },
    ],
};
