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
            background: #f3f4f6;
            padding: 40px;
            margin: 0;
        }
        .container {
            max-width: 800px;
            margin: 0 auto;
            background: white;
            border-radius: 12px;
            padding: 40px;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }
        h1 {
            color: #233876;
            margin-bottom: 24px;
        }
        .links {
            display: grid;
            gap: 12px;
        }
        a {
            display: block;
            padding: 16px 20px;
            background: #f9fafb;
            border: 1px solid #e5e7eb;
            border-radius: 8px;
            text-decoration: none;
            color: #233876;
            font-weight: 600;
            transition: all 0.2s;
        }
        a:hover {
            background: #233876;
            color: white;
        }
        .badge {
            display: inline-block;
            padding: 4px 12px;
            background: #dbeafe;
            color: #233876;
            border-radius: 6px;
            font-size: 12px;
            font-weight: 600;
            margin-left: 8px;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>Email Template Previews</h1>
        <p style="color: #6b7280; margin-bottom: 32px;">
            Click any template below to preview how it looks in an email client.
        </p>
        <div class="links">
            <h3 style="color: #111827; margin: 24px 0 12px;">Application Emails</h3>
            <a href="application-created.html">Application Created <span class="badge">New Candidate</span></a>
            <a href="application-stage-changed.html">Stage Changed <span class="badge">Update</span></a>
            <a href="application-accepted.html">Application Accepted <span class="badge">Success</span></a>
            
            <h3 style="color: #111827; margin: 24px 0 12px;">Placement Emails</h3>
            <a href="placement-created.html">Placement Created <span class="badge">Celebration</span></a>
            <a href="placement-activated.html">Placement Activated <span class="badge">Started</span></a>
            <a href="placement-completed.html">Placement Completed <span class="badge">Success</span></a>
            <a href="placement-failed.html">Placement Failed <span class="badge">Issue</span></a>
            <a href="guarantee-expiring.html">Guarantee Expiring <span class="badge">Reminder</span></a>
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
