-- Debug queries for recruiter board access issues

-- 1. Find user by Clerk ID and check their roles/memberships
SELECT 
  u.id,
  u.clerk_user_id,
  u.email,
  u.name,
  json_agg(DISTINCT ur.role_name) FILTER (WHERE ur.role_name IS NOT NULL) as user_roles,
  json_agg(DISTINCT m.role_name) FILTER (WHERE m.role_name IS NOT NULL) as membership_roles
FROM users u
LEFT JOIN user_roles ur ON ur.user_id = u.id AND ur.deleted_at IS NULL
LEFT JOIN memberships m ON m.user_id = u.id AND m.deleted_at IS NULL  
WHERE u.clerk_user_id = '<CLERK_USER_ID_HERE>'
GROUP BY u.id, u.clerk_user_id, u.email, u.name;

-- 2. Check if user has recruiter role and associated recruiter entity
SELECT 
  u.clerk_user_id,
  ur.role_name,
  ur.role_entity_id as recruiter_id,
  r.name as recruiter_name,
  r.status as recruiter_status
FROM users u
JOIN user_roles ur ON ur.user_id = u.id 
LEFT JOIN recruiters r ON r.id = ur.role_entity_id
WHERE u.clerk_user_id = '<CLERK_USER_ID_HERE>' 
  AND ur.role_name = 'recruiter'
  AND ur.deleted_at IS NULL;

-- 3. If user should be a recruiter but isn't, create the user_role
-- Replace <USER_ID> and <RECRUITER_ID> with actual values
INSERT INTO user_roles (user_id, role_name, role_entity_id, created_at)
VALUES ('<USER_ID>', 'recruiter', '<RECRUITER_ID>', NOW())
ON CONFLICT DO NOTHING;

-- 4. If user needs a recruiter entity created
INSERT INTO recruiters (
  id, 
  name, 
  email, 
  status, 
  user_id, 
  created_at, 
  updated_at
) VALUES (
  gen_random_uuid(),
  '<USER_NAME>',
  '<USER_EMAIL>', 
  'active',
  '<USER_ID>',
  NOW(),
  NOW()
) RETURNING id;

-- 5. Check all users with recruiter access
SELECT 
  u.email,
  u.name,
  ur.role_entity_id as recruiter_id,
  r.name as recruiter_name,
  r.status
FROM users u
JOIN user_roles ur ON ur.user_id = u.id AND ur.role_name = 'recruiter' AND ur.deleted_at IS NULL
LEFT JOIN recruiters r ON r.id = ur.role_entity_id
WHERE r.status = 'active' OR r.status IS NULL
ORDER BY u.email;