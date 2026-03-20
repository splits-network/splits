import path from 'path';
import fs from 'fs';

const AUTH_DIR = path.join(__dirname, '..', '.auth');

export interface SeedData {
  users: {
    recruiter: UserSeed;
    company_admin: UserSeed;
    hiring_manager: UserSeed;
    candidate: UserSeed;
    platform_admin: UserSeed;
    second_recruiter: UserSeed;
  };
  companies: CompanySeed[];
  jobs: JobSeed[];
  candidates: CandidateSeed[];
  firm: FirmSeed;
}

export interface UserSeed {
  clerkUserId: string;
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  profileId?: string;
  recruiterId?: string;
  candidateId?: string;
  companyId?: string;
}

export interface CompanySeed {
  id: string;
  name: string;
  slug: string;
}

export interface JobSeed {
  id: string;
  title: string;
  companyId: string;
  status: string;
}

export interface CandidateSeed {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
}

export interface FirmSeed {
  id: string;
  name: string;
  slug: string;
  adminTakeRate: number;
}

export function loadSeedData(): SeedData {
  const seedPath = path.join(AUTH_DIR, 'seed-data.json');
  if (!fs.existsSync(seedPath)) {
    throw new Error(
      'Seed data not found. Run: pnpm tsx scripts/e2e-seed.ts'
    );
  }
  return JSON.parse(fs.readFileSync(seedPath, 'utf-8'));
}
