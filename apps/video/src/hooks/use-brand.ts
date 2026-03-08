'use client';

import { useContext } from 'react';
import { BrandContext } from '@/components/brand-provider';
import { BrandConfig } from '@/lib/brand';

export function useBrand(): BrandConfig {
    const brand = useContext(BrandContext);
    if (!brand) {
        throw new Error('useBrand must be used within a BrandProvider');
    }
    return brand;
}
