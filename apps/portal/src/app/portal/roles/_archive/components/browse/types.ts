// Re-export unified types from parent
export type { Job, UnifiedJobFilters } from "../../types";
export { formatCommuteTypes, formatJobLevel } from "../../types";

// Alias for backward compatibility
export type { UnifiedJobFilters as JobFilters } from "../../types";
