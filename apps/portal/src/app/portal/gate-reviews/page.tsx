import { redirect } from 'next/navigation';
import GateReviewsPageClient from './components/gate-reviews-page-client';

export const metadata = {
    title: 'Gate Reviews - Splits Network',
    description: 'Review applications pending at your gate'
};

export default function GateReviewsPage() {

    return <GateReviewsPageClient />;
    // Redirect to applications page with gate filter
    // Gate reviews functionality is now integrated into applications page
    redirect('/portal/applications?gate_status=needs_my_review');
}
