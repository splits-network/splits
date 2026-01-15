/**
 * Database Types Index
 * 
 * Re-exports all domain-specific database types.
 * Generated from Supabase PostgreSQL schema.
 */

// Core database types and helpers from Supabase CLI generation
export * from '../supabase/database.types';

// Domain-specific types
export * from './ats.types';
export * from './identity.types';
export * from './network.types';
export * from './billing.types';
export * from './notification.types';
export * from './document.types';
export * from './team.types';
export * from './integration.types';
export * from './automation.types';
export * from './marketplace.types';
