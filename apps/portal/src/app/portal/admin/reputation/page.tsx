import { Metadata } from 'next';
import ReputationManagementClient from './reputation-management-client';

export const metadata: Metadata = {
    title: 'Reputation Management | Splits Network',
    description: 'Monitor and manage recruiter reputation scores',
};

export default function ReputationManagementPage() {
    return <ReputationManagementClient />;
}
