import type { Metadata } from 'next';
import { ReactNode } from 'react';

export const metadata: Metadata = {
    title: 'Status',
    description: 'Employment Networks service status and uptime reporting.',
};

export default function StatusLayout({ children }: { children: ReactNode }) {
    return children;
}
