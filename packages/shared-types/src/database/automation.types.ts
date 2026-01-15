/**
 * Automation Domain Types
 * 
 * Generated from Supabase database schema.
 * Includes: automation_rules, automation_executions, decision_audit_log
 */

import type { Database, Tables, TablesInsert, TablesUpdate } from '../supabase/database.types';

// Helper types for cleaner usage
type DbTable<T extends keyof Database['public']['Tables']> = Tables<T>;
type DbTableInsert<T extends keyof Database['public']['Tables']> = TablesInsert<T>;
type DbTableUpdate<T extends keyof Database['public']['Tables']> = TablesUpdate<T>;

// ============================================================================
// AUTOMATION RULES
// ============================================================================

export type AutomationRule = DbTable<'automation_rules'>;
export type AutomationRuleInsert = DbTableInsert<'automation_rules'>;
export type AutomationRuleUpdate = DbTableUpdate<'automation_rules'>;

// ============================================================================
// AUTOMATION EXECUTIONS
// ============================================================================

export type AutomationExecution = DbTable<'decision_audit_log'>;
export type AutomationExecutionInsert = DbTableInsert<'decision_audit_log'>;
export type AutomationExecutionUpdate = DbTableUpdate<'decision_audit_log'>;

// ============================================================================
// DECISION AUDIT LOG
// ============================================================================

export type DecisionAuditLog = DbTable<'decision_audit_log'>;
export type DecisionAuditLogInsert = DbTableInsert<'decision_audit_log'>;
export type DecisionAuditLogUpdate = DbTableUpdate<'decision_audit_log'>;
