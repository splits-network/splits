/**
 * Currency formatting utilities for consistent money display across the portal
 * 
 * These functions provide standardized currency formatting throughout the application.
 */

/**
 * Format a number as USD currency
 * Example: 150000 => "$150,000"
 */
export function formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(amount);
}

/**
 * Format a number as USD currency with cents
 * Example: 150000.50 => "$150,000.50"
 */
export function formatCurrencyWithCents(amount: number): string {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    }).format(amount);
}

/**
 * Format a salary range
 * Example: (100000, 150000) => "$100k - $150k"
 */
export function formatSalaryRange(min?: number, max?: number): string {
    if (!min && !max) return 'Not specified';
    if (min && !max) return `${formatCurrencyShort(min)}+`;
    if (!min && max) return `Up to ${formatCurrencyShort(max)}`;
    return `${formatCurrencyShort(min!)} - ${formatCurrencyShort(max!)}`;
}

/**
 * Format currency in short form (k, M)
 * Example: 150000 => "$150k"
 */
export function formatCurrencyShort(amount: number): string {
    if (amount >= 1000000) {
        return `$${(amount / 1000000).toFixed(1)}M`;
    }
    if (amount >= 1000) {
        return `$${(amount / 1000).toFixed(0)}k`;
    }
    return `$${amount}`;
}

/**
 * Format a percentage
 * Example: 0.15 => "15%"
 */
export function formatPercentage(value: number): string {
    return `${(value * 100).toFixed(0)}%`;
}
