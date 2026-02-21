import { Metadata } from 'next';
import InvitationWizardClient from './invitation-client';

export const metadata: Metadata = {
    title: 'Review Invitation | Applicant Network',
    description: 'Review and respond to your recruiter invitation',
};

interface PageProps {
    params: Promise<{ token: string }>;
}

export default async function InvitationPage({ params }: PageProps) {
    const { token } = await params;
    return <InvitationWizardClient token={token} />;
}
