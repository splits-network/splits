/**
 * Common page selectors used across test suites.
 * Centralized here to make tests resilient to UI changes.
 */

// --- Portal Navigation ---
export const sidebar = {
  root: '[data-testid="sidebar"], nav.sidebar, aside',
  navItem: (label: string) => `nav >> text="${label}"`,
  badge: (label: string) => `nav >> text="${label}" >> .badge`,
};

// --- Portal Common ---
export const portal = {
  pageTitle: 'h1, [data-testid="page-title"]',
  loadingSpinner: '.loading, [data-testid="loading"]',
  emptyState: '[data-testid="empty-state"], .empty-state',
  toast: '.toast, [data-testid="toast"]',
  modal: '.modal, dialog[open]',
  modalClose: '.modal .btn-close, dialog button[aria-label="Close"]',
};

// --- Data Views ---
export const views = {
  gridView: '[data-testid="grid-view"], button:has-text("Grid")',
  tableView: '[data-testid="table-view"], button:has-text("Table")',
  splitView: '[data-testid="split-view"], button:has-text("Split")',
  card: '.card, [data-testid="card"]',
  tableRow: 'tbody tr, [data-testid="table-row"]',
  detailPanel: '[data-testid="detail-panel"], .detail-panel',
};

// --- Forms ---
export const form = {
  input: (name: string) => `input[name="${name}"], [data-testid="input-${name}"]`,
  select: (name: string) => `select[name="${name}"], [data-testid="select-${name}"]`,
  textarea: (name: string) => `textarea[name="${name}"], [data-testid="textarea-${name}"]`,
  submitButton: 'button[type="submit"], [data-testid="submit"]',
  cancelButton: 'button:has-text("Cancel"), [data-testid="cancel"]',
};

// --- Filters ---
export const filters = {
  searchInput: 'input[type="search"], input[placeholder*="Search"], [data-testid="search"]',
  stageFilter: '[data-testid="stage-filter"], select[name="stage"]',
  scopeFilter: '[data-testid="scope-filter"]',
};

// --- Applications ---
export const applications = {
  stageLabel: '[data-testid="stage-label"], .stage-badge',
  advanceButton: 'button:has-text("Advance"), button:has-text("Move"), [data-testid="advance-stage"]',
  rejectButton: 'button:has-text("Reject"), [data-testid="reject"]',
  extendOfferButton: 'button:has-text("Extend Offer"), [data-testid="extend-offer"]',
  markHiredButton: 'button:has-text("Mark as Hired"), button:has-text("Hire"), [data-testid="mark-hired"]',
  withdrawButton: 'button:has-text("Withdraw"), [data-testid="withdraw"]',
  timeline: '[data-testid="timeline"], .timeline',
  noteInput: 'textarea[placeholder*="note"], [data-testid="note-input"]',
  addNoteButton: 'button:has-text("Add Note"), [data-testid="add-note"]',
};

// --- Roles/Jobs ---
export const roles = {
  createButton: 'button:has-text("Create Role"), button:has-text("Create Job"), [data-testid="create-role"]',
  roleCard: '[data-testid="role-card"], .role-card',
  statusLabel: '[data-testid="role-status"]',
};

// --- Placements ---
export const placements = {
  commissionBreakdown: '[data-testid="commission-breakdown"], .commission-breakdown',
  guaranteePeriod: '[data-testid="guarantee-period"]',
  payoutStatus: '[data-testid="payout-status"]',
  splitRow: '[data-testid="split-row"]',
};

// --- Clerk Auth ---
export const clerk = {
  signInEmail: 'input[name="identifier"], input[type="email"]',
  signInPassword: 'input[name="password"], input[type="password"]',
  signInButton: 'button:has-text("Sign in"), button:has-text("Continue")',
  signUpEmail: 'input[name="emailAddress"]',
  signUpPassword: 'input[name="password"]',
  signUpFirstName: 'input[name="firstName"]',
  signUpLastName: 'input[name="lastName"]',
  signUpButton: 'button:has-text("Sign up"), button:has-text("Continue")',
};

// --- Candidate App Specific ---
export const candidateApp = {
  jobCard: '[data-testid="job-card"], .job-card',
  saveJobButton: 'button[aria-label*="Save"], button:has-text("Save"), [data-testid="save-job"]',
  recruiterCard: '[data-testid="recruiter-card"], .recruiter-card',
  firmCard: '[data-testid="firm-card"], .firm-card',
};

// --- Corporate Site ---
export const corporate = {
  hero: '[data-testid="hero"], .hero, section:first-child',
  statsSection: '[data-testid="stats"], .stats',
  contactForm: 'form[data-testid="contact-form"], form',
};
