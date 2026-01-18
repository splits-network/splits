import GateReviewsPageClient from './components/gate-reviews-page-client';

export const metadata = {
    title: 'Gate Reviews - Splits Network',
    description: 'Review applications pending at your gate'
};

export default function GateReviewsPage() {
    return <GateReviewsPageClient />;
}
