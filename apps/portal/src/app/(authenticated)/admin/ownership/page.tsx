import { Metadata } from 'next';
import OwnershipAuditClient from './OwnershipAuditClient';

export const metadata: Metadata = {
    title: 'Ownership Audit | Splits Network',
    description: 'Review and manage candidate ownership and sourcing conflicts',
};

export default function OwnershipAuditPage() {
    return <OwnershipAuditClient />;
}
