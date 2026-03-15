'use client';

import { createContext, ReactNode } from 'react';
import { BrandConfig } from '@/lib/brand';

export const BrandContext = createContext<BrandConfig | null>(null);

interface BrandProviderProps {
    brand: BrandConfig;
    children: ReactNode;
}

export function BrandProvider({ brand, children }: BrandProviderProps) {
    return (
        <BrandContext.Provider value={brand}>
            {children}
        </BrandContext.Provider>
    );
}
