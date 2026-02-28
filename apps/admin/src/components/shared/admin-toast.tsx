// Re-export for convenience — toast rendering is handled by ToastProvider.
// This file exists as a named export point for consumers who import from shared.
export { ToastProvider } from '@/providers/toast-provider';
export type { ToastContextValue, ToastVariant, Toast } from '@/providers/toast-provider';
