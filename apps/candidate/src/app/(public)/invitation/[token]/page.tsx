import { Metadata } from 'next';
import InvitationLandingClient from './invitation-landing-client';

export const metadata: Metadata = {
    title: 'Recruiter Invitation | Applicant Network',
    description: 'You have been invited to join Applicant Network, where recruiters compete to find the right opportunities for you.',
};

interface PageProps {
    params: Promise<{ token: string }>;
}

export default async function InvitationLandingPage({ params }: PageProps) {
    const { token } = await params;
    return <InvitationLandingClient token={token} />;
}
