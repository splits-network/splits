-- Make PKCE columns nullable for GPT Builder compatibility
-- GPT Builder (ChatGPT) does not support PKCE, so code_challenge and code_challenge_method
-- must be optional. When PKCE params are present, the service still validates them.

ALTER TABLE public.gpt_authorization_codes
    ALTER COLUMN code_challenge DROP NOT NULL;

ALTER TABLE public.gpt_authorization_codes
    ALTER COLUMN code_challenge_method DROP NOT NULL;
