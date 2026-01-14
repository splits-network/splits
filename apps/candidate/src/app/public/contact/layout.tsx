import type { Metadata } from 'next';
import { ReactNode } from 'react';

export const metadata: Metadata = {
    title: 'Contact Applicant Network',
    description: 'Get in touch with Applicant Network support, sales, or recruiting teams.',
};

export default function ContactLayout({ children }: { children: ReactNode }) {
    return children;
}
