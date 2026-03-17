export type Brand = 'splits' | 'applicant';

export interface BrandConfig {
    brand: Brand;
    name: string;
    logoUrl: string;
    primaryColor: string;
    daisyTheme: string;
    portalUrl: string;
}

export const BRANDS: Record<Brand, BrandConfig> = {
    splits: {
        brand: 'splits',
        name: 'Splits Network',
        logoUrl: '/logos/splits-network.svg',
        primaryColor: '#233876',
        daisyTheme: 'splits-light',
        portalUrl: 'https://splits.network',
    },
    applicant: {
        brand: 'applicant',
        name: 'Applicant Network',
        logoUrl: '/logos/applicant-network.svg',
        primaryColor: '#7c3aed',
        daisyTheme: 'applicant-light',
        portalUrl: 'https://applicant.network',
    },
};

/**
 * Detect brand from hostname.
 * Checks if hostname includes 'applicant' — returns applicant config.
 * Otherwise defaults to Splits Network branding.
 */
export function detectBrand(hostname: string): BrandConfig {
    if (hostname.includes('applicant')) {
        return BRANDS.applicant;
    }
    return BRANDS.splits;
}
