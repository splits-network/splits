import type { Metadata } from 'next';
import { ReactNode } from 'react';

export const metadata: Metadata = {
    title: 'Status',
    description: 'Live system status for Applicant Network services and platform health.',
};

export default function StatusLayout({ children }: { children: ReactNode }) {
    return children;
}
