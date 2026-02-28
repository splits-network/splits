import DecisionAuditLogClient from './components/decision-log-client';

export const metadata = {
    title: 'Decision Audit Log - Admin - Splits Network',
    description: 'Review AI-powered decisions and human overrides'
};

export default function DecisionAuditLogPage() {
    return <DecisionAuditLogClient />;
}