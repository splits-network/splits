-- Add 'enriching' to the processing_status enum
-- Used by document-processing-service to indicate AI-powered smart resume extraction is in progress
ALTER TYPE processing_status ADD VALUE 'enriching' AFTER 'processing';