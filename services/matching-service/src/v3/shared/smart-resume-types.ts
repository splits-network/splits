/**
 * Smart Resume Types for Matching
 *
 * Typed representations of smart_resume_* table data
 * filtered by visible_to_matching = true.
 */

export interface SmartResumeProfile {
  id: string;
  candidate_id: string;
  headline?: string;
  professional_summary?: string;
  total_years_experience?: number;
  highest_degree?: string;
  completion_score?: number;
}

export interface SmartResumeExperience {
  id: string;
  title?: string;
  company?: string;
  description?: string;
  achievements?: string[];
  start_date?: string;
  end_date?: string;
  is_current?: boolean;
}

export interface SmartResumeProject {
  id: string;
  name?: string;
  description?: string;
  outcomes?: string;
  skills_used?: string[];
}

export interface SmartResumeTask {
  id: string;
  description?: string;
  impact?: string;
  skills_used?: string[];
}

export interface SmartResumeSkill {
  id: string;
  name: string;
  category?: string;
  proficiency?: 'expert' | 'advanced' | 'intermediate' | 'beginner';
  years_used?: number;
}

export interface SmartResumeEducation {
  id: string;
  institution?: string;
  degree?: string;
  field_of_study?: string;
  gpa?: string;
  honors?: string;
}

export interface SmartResumeCertification {
  id: string;
  name?: string;
  issuer?: string;
  date_obtained?: string;
  expiry_date?: string;
}

export interface SmartResumePublication {
  id: string;
  title?: string;
  publication_type?: string;
}

export interface SmartResumeMatchingData {
  profile: SmartResumeProfile;
  experiences: SmartResumeExperience[];
  skills: SmartResumeSkill[];
  education: SmartResumeEducation[];
  certifications: SmartResumeCertification[];
  projects: SmartResumeProject[];
  tasks: SmartResumeTask[];
  publications: SmartResumePublication[];
}
