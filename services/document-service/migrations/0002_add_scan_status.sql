-- Create the enum for scan results
CREATE TYPE scan_status AS ENUM ('pending', 'clean', 'infected', 'error');

-- Add the column to the documents table
ALTER TABLE documents 
ADD COLUMN scan_status scan_status DEFAULT 'pending';

-- Add an index for quickly finding pending or infected files
CREATE INDEX idx_documents_scan_status ON documents(scan_status);
