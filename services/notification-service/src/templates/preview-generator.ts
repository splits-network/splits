/**
 * Email Template Test/Preview Generator
 * Run this file to generate HTML files for all email templates for visual testing
 * 
 * Usage: node -r ts-node/register src/templates/preview-generator.ts
 */

import * as fs from 'fs';
import * as path from 'path';
import {
    applicationCreatedEmail,
    applicationStageChangedEmail,
    applicationAcceptedEmail,
} from './applications';
import {
    placementCreatedEmail,
    placementActivatedEmail,
    placementCompletedEmail,
    placementFailedEmail,
    guaranteeExpiringEmail,
} from './placements';
import {
    candidateSourcedEmail,
    ownershipConflictEmail,
    ownershipConflictRejectionEmail,
    candidateAddedToNetworkEmail,
    candidateInvitationEmail,
    consentGivenEmail,
    consentDeclinedEmail,
} from './candidates';

const OUTPUT_DIR = path.join(__dirname, '../../email-previews');

// Sample data for testing
const applicationCreatedData = {
    candidateName: 'Brandon Test2',
    jobTitle: 'Backend Engineer (Go)',
    companyName: 'TechCorp Inc',
    applicationUrl: 'https://splits.network/applications/abc123',
    recruiterName: 'Jane Smith',
};

const applicationStageChangedData = {
    candidateName: 'Brandon Test2',
    jobTitle: 'Backend Engineer (Go)',
    companyName: 'TechCorp Inc',
    oldStage: 'Initial Review',
    newStage: 'Technical Interview',
    applicationUrl: 'https://splits.network/applications/abc123',
};

const applicationAcceptedData = {
    candidateName: 'Brandon Test2',
    jobTitle: 'Backend Engineer (Go)',
    companyName: 'TechCorp Inc',
    applicationUrl: 'https://splits.network/applications/abc123',
};

const placementCreatedData = {
    candidateName: 'Brandon Test2',
    jobTitle: 'Backend Engineer (Go)',
    companyName: 'TechCorp Inc',
    salary: 150000,
    recruiterShare: 18750,
    placementUrl: 'https://splits.network/placements/xyz789',
};

const placementActivatedData = {
    candidateName: 'Brandon Test2',
    jobTitle: 'Backend Engineer (Go)',
    companyName: 'TechCorp Inc',
    startDate: 'January 15, 2025',
    guaranteePeriodDays: 90,
    placementUrl: 'https://splits.network/placements/xyz789',
};

const placementCompletedData = {
    candidateName: 'Brandon Test2',
    jobTitle: 'Backend Engineer (Go)',
    companyName: 'TechCorp Inc',
    recruiterShare: 18750,
    placementUrl: 'https://splits.network/placements/xyz789',
};

const placementFailedData = {
    candidateName: 'Brandon Test2',
    jobTitle: 'Backend Engineer (Go)',
    companyName: 'TechCorp Inc',
    reason: 'Candidate decided to accept another offer',
    placementUrl: 'https://splits.network/placements/xyz789',
};

const guaranteeExpiringData = {
    candidateName: 'Brandon Test2',
    jobTitle: 'Backend Engineer (Go)',
    companyName: 'TechCorp Inc',
    daysRemaining: 7,
    guaranteeEndDate: 'April 15, 2025',
    placementUrl: 'https://splits.network/placements/xyz789',
};

const candidateSourcedData = {
    candidateName: 'Sarah Johnson',
    sourceMethod: 'LinkedIn',
    protectionPeriod: '12 months',
    candidatesUrl: 'https://splits.network/portal/candidates',
};

const ownershipConflictData = {
    candidateName: 'Sarah Johnson',
    attemptingRecruiterName: 'Mike Chen',
    candidateUrl: 'https://splits.network/portal/candidates',
};

const ownershipConflictRejectionData = {
    candidateName: 'Sarah Johnson',
    originalSourcerName: 'Jane Smith',
    candidatesUrl: 'https://splits.network/portal/candidates',
};

const candidateAddedToNetworkData = {
    candidateName: 'Sarah Johnson',
    recruiterName: 'Jane Smith',
    portalUrl: 'https://applicant.network/portal/profile',
};

const candidateInvitationData = {
    candidateName: 'Sarah Johnson',
    recruiterName: 'Jane Smith',
    recruiterEmail: 'jane@splits.network',
    recruiterBio: 'Senior tech recruiter with 10+ years placing engineers at top-tier companies across the UK and US.',
    invitationUrl: 'https://applicant.network/portal/invitation/abc123',
    expiryDate: 'March 15, 2026',
};

const consentGivenData = {
    recruiterName: 'Jane Smith',
    candidateName: 'Sarah Johnson',
    candidateEmail: 'sarah@example.com',
    consentDate: 'February 19, 2026',
    candidatesUrl: 'https://splits.network/portal/candidates',
};

const consentDeclinedData = {
    recruiterName: 'Jane Smith',
    candidateName: 'Sarah Johnson',
    candidateEmail: 'sarah@example.com',
    declinedDate: 'February 19, 2026',
    declinedReason: 'I am not currently looking for new opportunities.',
    candidatesUrl: 'https://splits.network/portal/candidates',
};

// Generate all previews
function generatePreviews() {
    // Create output directory if it doesn't exist
    if (!fs.existsSync(OUTPUT_DIR)) {
        fs.mkdirSync(OUTPUT_DIR, { recursive: true });
    }

    const previews = [
        {
            name: 'application-created',
            html: applicationCreatedEmail(applicationCreatedData),
        },
        {
            name: 'application-stage-changed',
            html: applicationStageChangedEmail(applicationStageChangedData),
        },
        {
            name: 'application-accepted',
            html: applicationAcceptedEmail(applicationAcceptedData),
        },
        {
            name: 'placement-created',
            html: placementCreatedEmail(placementCreatedData),
        },
        {
            name: 'placement-activated',
            html: placementActivatedEmail(placementActivatedData),
        },
        {
            name: 'placement-completed',
            html: placementCompletedEmail(placementCompletedData),
        },
        {
            name: 'placement-failed',
            html: placementFailedEmail(placementFailedData),
        },
        {
            name: 'guarantee-expiring',
            html: guaranteeExpiringEmail(guaranteeExpiringData),
        },
        {
            name: 'candidate-sourced',
            html: candidateSourcedEmail(candidateSourcedData),
        },
        {
            name: 'ownership-conflict',
            html: ownershipConflictEmail(ownershipConflictData),
        },
        {
            name: 'ownership-conflict-rejection',
            html: ownershipConflictRejectionEmail(ownershipConflictRejectionData),
        },
        {
            name: 'candidate-added-to-network',
            html: candidateAddedToNetworkEmail(candidateAddedToNetworkData),
        },
        {
            name: 'candidate-invitation',
            html: candidateInvitationEmail(candidateInvitationData),
        },
        {
            name: 'consent-given',
            html: consentGivenEmail(consentGivenData),
        },
        {
            name: 'consent-declined',
            html: consentDeclinedEmail(consentDeclinedData),
        },
    ];

    previews.forEach(({ name, html }) => {
        const filePath = path.join(OUTPUT_DIR, `${name}.html`);
        fs.writeFileSync(filePath, html, 'utf-8');
        console.log(`✓ Generated: ${name}.html`);
    });

    // Generate index file
    const indexHtml = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Email Templates - Splits Network</title>
    <style>
        body {
            font-family: -apple-system, 'Segoe UI', sans-serif;
            background: #f4f4f5;
            padding: 40px;
            margin: 0;
        }
        .container {
            max-width: 800px;
            margin: 0 auto;
            background: white;
            border-radius: 4px;
            padding: 40px;
            border: 4px solid #18181b;
        }
        h1 {
            color: #18181b;
            margin-bottom: 24px;
        }
        .links {
            display: grid;
            gap: 12px;
        }
        a {
            display: block;
            padding: 16px 20px;
            background: #f4f4f5;
            border: 2px solid #e4e4e7;
            border-radius: 4px;
            text-decoration: none;
            color: #18181b;
            font-weight: 700;
            transition: all 0.2s;
        }
        a:hover {
            background: #233876;
            color: white;
        }
        .badge {
            display: inline-block;
            padding: 4px 12px;
            background: #FFE0E0;
            color: #18181b;
            border-radius: 4px;
            font-size: 12px;
            font-weight: 700;
            margin-left: 8px;
            border: 1px solid #18181b;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>Email Template Previews</h1>
        <p style="color: #18181b; margin-bottom: 32px;">
            Click any template below to preview how it looks in an email client.
        </p>
        <div class="links">
            <h3 style="color: #18181b; margin: 24px 0 12px;">Application Emails</h3>
            <a href="application-created.html">Application Created <span class="badge">New Candidate</span></a>
            <a href="application-stage-changed.html">Stage Changed <span class="badge">Update</span></a>
            <a href="application-accepted.html">Application Accepted <span class="badge">Success</span></a>

            <h3 style="color: #18181b; margin: 24px 0 12px;">Placement Emails</h3>
            <a href="placement-created.html">Placement Created <span class="badge">Celebration</span></a>
            <a href="placement-activated.html">Placement Activated <span class="badge">Started</span></a>
            <a href="placement-completed.html">Placement Completed <span class="badge">Success</span></a>
            <a href="placement-failed.html">Placement Failed <span class="badge">Issue</span></a>
            <a href="guarantee-expiring.html">Guarantee Expiring <span class="badge">Reminder</span></a>

            <h3 style="color: #18181b; margin: 24px 0 12px;">Candidate Emails</h3>
            <a href="candidate-sourced.html">Candidate Sourced <span class="badge">Recruiter</span></a>
            <a href="ownership-conflict.html">Ownership Conflict <span class="badge">Warning</span></a>
            <a href="ownership-conflict-rejection.html">Ownership Conflict Rejection <span class="badge">Info</span></a>
            <a href="candidate-added-to-network.html">Added to Network <span class="badge">Candidate</span></a>
            <a href="candidate-invitation.html">Candidate Invitation <span class="badge">Candidate</span></a>
            <a href="consent-given.html">Consent Given <span class="badge">Success</span></a>
            <a href="consent-declined.html">Consent Declined <span class="badge">Declined</span></a>
        </div>
    </div>
</body>
</html>
    `.trim();

    fs.writeFileSync(path.join(OUTPUT_DIR, 'index.html'), indexHtml, 'utf-8');
    console.log(`✓ Generated: index.html`);
    console.log(`\n✨ All previews generated in: ${OUTPUT_DIR}`);
    console.log(`\n📧 Open index.html to browse all email templates`);
}

// Run if executed directly
if (require.main === module) {
    generatePreviews();
}

export { generatePreviews };
