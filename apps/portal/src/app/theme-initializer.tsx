'use client';

import { useEffect } from 'react';
import { initThemeListener } from '@/components/charts/chart-options';

export function ThemeInitializer() {
    useEffect(() => {
        initThemeListener();
    }, []);

    return null;
}
