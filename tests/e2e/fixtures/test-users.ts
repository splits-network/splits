/**
 * Test user constants. No seed script needed — the E2E tests
 * sign up these users through the real UI and onboarding wizard.
 */

export const TEST_USERS = {
  recruiter: {
    email: 'e2e-recruiter@test.splits.network',
    password: 'E2eTest!Recruiter2024',
    firstName: 'Test',
    lastName: 'Recruiter',
  },
  company_admin: {
    email: 'e2e-company-admin@test.splits.network',
    password: 'E2eTest!CompanyAdmin2024',
    firstName: 'Test',
    lastName: 'CompanyAdmin',
  },
  hiring_manager: {
    email: 'e2e-hiring-manager@test.splits.network',
    password: 'E2eTest!HiringManager2024',
    firstName: 'Test',
    lastName: 'HiringManager',
  },
  candidate: {
    email: 'e2e-candidate@test.splits.network',
    password: 'E2eTest!Candidate2024',
    firstName: 'Test',
    lastName: 'Candidate',
  },
  platform_admin: {
    email: 'e2e-admin@test.splits.network',
    password: 'E2eTest!Admin2024',
    firstName: 'Test',
    lastName: 'Admin',
  },
  second_recruiter: {
    email: 'e2e-recruiter2@test.splits.network',
    password: 'E2eTest!Recruiter2B2024',
    firstName: 'Test',
    lastName: 'RecruiterTwo',
  },
} as const;

export type TestRole = keyof typeof TEST_USERS;

export const URLS = {
  portal: 'http://localhost:3100',
  candidate: 'http://localhost:3101',
  corporate: 'http://localhost:3102',
} as const;
