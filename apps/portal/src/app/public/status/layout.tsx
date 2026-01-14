import type { Metadata } from 'next';
import { ReactNode } from 'react';

export const metadata: Metadata = {
    title: 'Platform Status',
    description: 'Live service status for Splits Network platform health.',
};

export default function StatusLayout({ children }: { children: ReactNode }) {
    return children;
}
