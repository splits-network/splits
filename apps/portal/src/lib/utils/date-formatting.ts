/**
 * Date formatting utilities for consistent date display across the portal
 * 
 * These functions provide standardized date formatting throughout the application.
 */

/**
 * Format a date string into a short, human-readable format
 * Example: "Dec 14, 2024"
 */
export function formatDate(date: string | Date): string {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return dateObj.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
    });
}

/**
 * Format a date string into a full, human-readable format
 * Example: "December 14, 2024"
 */
export function formatDateLong(date: string | Date): string {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return dateObj.toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric',
    });
}

/**
 * Format a date string with time
 * Example: "Dec 14, 2024 at 3:45 PM"
 */
export function formatDateTime(date: string | Date): string {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return dateObj.toLocaleString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
    });
}

/**
 * Format a date string with just the time
 * Example: "3:45 PM"
 */
export function formatTime(date: string | Date): string {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return dateObj.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
    });
}

/**
 * Format a relative time (e.g., "2 minutes ago", "1 hour ago")
 */
export function formatRelativeTime(timestamp: string | Date): string {
    const now = new Date();
    const time = typeof timestamp === 'string' ? new Date(timestamp) : timestamp;
    const seconds = Math.floor((now.getTime() - time.getTime()) / 1000);

    if (seconds < 60) return 'Just now';
    
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes} minute${minutes !== 1 ? 's' : ''} ago`;
    
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours} hour${hours !== 1 ? 's' : ''} ago`;
    
    const days = Math.floor(hours / 24);
    if (days < 7) return `${days} day${days !== 1 ? 's' : ''} ago`;
    
    const weeks = Math.floor(days / 7);
    if (weeks < 4) return `${weeks} week${weeks !== 1 ? 's' : ''} ago`;
    
    const months = Math.floor(days / 30);
    if (months < 12) return `${months} month${months !== 1 ? 's' : ''} ago`;
    
    const years = Math.floor(days / 365);
    return `${years} year${years !== 1 ? 's' : ''} ago`;
}

/**
 * Calculate days between two dates
 */
export function daysBetween(startDate: string | Date, endDate: string | Date): number {
    const start = typeof startDate === 'string' ? new Date(startDate) : startDate;
    const end = typeof endDate === 'string' ? new Date(endDate) : endDate;
    return Math.floor((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
}

/**
 * Calculate days since a date
 */
export function daysSince(date: string | Date): number {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return Math.floor((Date.now() - dateObj.getTime()) / (1000 * 60 * 60 * 24));
}

/**
 * Check if a date is within a certain number of days from now
 */
export function isWithinDays(date: string | Date, days: number): boolean {
    return daysSince(date) <= days;
}
