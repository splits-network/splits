import type { Metadata } from 'next';
import { ReactNode } from 'react';

export const metadata: Metadata = {
    title: 'Help Center',
    description: 'Find answers to common questions about Applicant Network, applications, recruiters, and profiles.',
};

export default function HelpLayout({ children }: { children: ReactNode }) {
    return children;
}
