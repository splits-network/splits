/**
 * Integration Listing Model
 * Used for the integrations showcase page
 */

export type IntegrationCategory =
  | 'ats'
  | 'crm'
  | 'hris'
  | 'job_board'
  | 'background_check'
  | 'assessment'
  | 'communication'
  | 'analytics';

export type IntegrationStatus =
  | 'active'
  | 'inactive'
  | 'error'
  | 'pending_setup'
  | 'maintenance';

export type SyncFrequency =
  | 'real_time'
  | 'hourly'
  | 'daily'
  | 'weekly'
  | 'manual';

export interface IntegrationListing {
  id: string;
  name: string;
  provider: string;
  category: IntegrationCategory;
  status: IntegrationStatus;
  description: string;
  icon: string; // FontAwesome icon name
  lastSyncDate?: string; // ISO date string
  nextSyncDate?: string; // ISO date string
  syncFrequency: SyncFrequency;
  dataPointsSynced: number;
  errorCount: number;
  connectedDate: string; // ISO date string
  connectedBy: {
    name: string;
    avatar: string; // Unsplash URL
  };
  features: string[]; // What it syncs: "Candidates", "Jobs", etc.
  apiVersion?: string;
  webhooksEnabled: boolean;
  featured: boolean;
  uptime?: number; // Percentage, e.g., 99.9
}
