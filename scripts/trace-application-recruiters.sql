-- Trace all recruiter associations for a given application
-- Replace the application ID and run against Supabase

SELECT
  a.id AS application_id,
  j.title AS job_title,
  p.id AS placement_id,

  -- Source: application
  a.candidate_recruiter_id,
  u_cr.name AS candidate_recruiter_name,

  -- Source: job
  j.company_recruiter_id,
  u_jr.name AS company_recruiter_name,

  j.job_owner_recruiter_id,
  u_jo.name AS job_owner_name,

  -- Source: candidate_sourcers
  cs.sourcer_recruiter_id AS candidate_sourcer_recruiter_id,
  u_cs.name AS candidate_sourcer_name,

  -- Placement record (what was snapshotted at hire time)
  p.candidate_recruiter_id AS pl_candidate_recruiter_id,
  p.company_recruiter_id AS pl_company_recruiter_id,
  p.job_owner_recruiter_id AS pl_job_owner_recruiter_id,
  p.candidate_sourcer_recruiter_id AS pl_candidate_sourcer_id,
  p.company_sourcer_recruiter_id AS pl_company_sourcer_id

FROM applications a
JOIN jobs j ON j.id = a.job_id
LEFT JOIN placements p ON p.application_id = a.id
LEFT JOIN candidate_sourcers cs ON cs.candidate_id = a.candidate_id

-- Resolve recruiter names via recruiters → users
LEFT JOIN recruiters r_cr ON r_cr.id = a.candidate_recruiter_id
LEFT JOIN users u_cr ON u_cr.id = r_cr.user_id

LEFT JOIN recruiters r_jr ON r_jr.id = j.company_recruiter_id
LEFT JOIN users u_jr ON u_jr.id = r_jr.user_id

LEFT JOIN recruiters r_jo ON r_jo.id = j.job_owner_recruiter_id
LEFT JOIN users u_jo ON u_jo.id = r_jo.user_id

LEFT JOIN recruiters r_cs ON r_cs.id = cs.sourcer_recruiter_id
LEFT JOIN users u_cs ON u_cs.id = r_cs.user_id

WHERE a.id = '1a6ba518-feb5-4a06-a05b-a05e2b555073';