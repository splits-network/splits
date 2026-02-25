-- Add structured resume data to applications
-- Populated by MCP tool, Custom GPT, or backfilled from portal document upload
ALTER TABLE applications ADD COLUMN IF NOT EXISTS resume_data jsonb DEFAULT NULL;

COMMENT ON COLUMN applications.resume_data IS 'Structured resume data (ApplicationResumeData schema). Source: mcp_tool, custom_gpt, or portal_backfill.';
