'use client';

import { useContext } from 'react';
import { ToastContext } from '@/providers/toast-provider';

export function useAdminToast() {
    const ctx = useContext(ToastContext);
    if (!ctx) {
        throw new Error('useAdminToast must be used within ToastProvider');
    }
    return ctx;
}
