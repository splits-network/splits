/**
 * Content seed data barrel export.
 *
 * Each file exports a single page object matching the ContentPage shape.
 * Add new pages here as they are created.
 */

// Candidate app pages
import { candidateAbout } from './candidate/about';
import { candidateContact } from './candidate/contact';
import { candidateHelp } from './candidate/help';
import { candidateHowItWorks } from './candidate/how-it-works';
import { candidateCareerGuides } from './candidate/career-guides';
import { candidateResumeTips } from './candidate/resume-tips';

// Portal app pages
import { portalAbout } from './portal/about';
import { portalForCompanies } from './portal/for-companies';
import { portalForRecruiters } from './portal/for-recruiters';
import { portalBlog } from './portal/blog';

// Navigation config
import { portalHeaderNav } from './navigation/portal-header';
import { portalFooterNav } from './navigation/portal-footer';
import { candidateHeaderNav } from './navigation/candidate-header';
import { candidateFooterNav } from './navigation/candidate-footer';
import { corporateHeaderNav } from './navigation/corporate-header';

export const navigation = [
    portalHeaderNav,
    portalFooterNav,
    candidateHeaderNav,
    candidateFooterNav,
    corporateHeaderNav,
];

export const pages = [
    // Candidate — highest priority (currently placeholders)
    candidateAbout,
    candidateContact,
    candidateHelp,
    candidateHowItWorks,
    candidateCareerGuides,
    candidateResumeTips,
    // Portal
    portalAbout,
    portalForCompanies,
    portalForRecruiters,
    portalBlog,
];
