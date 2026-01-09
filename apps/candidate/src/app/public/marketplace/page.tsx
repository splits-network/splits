import { Suspense } from 'react';
import MarketplaceList from './components/marketplace-list';

export default function MarketplacePage() {
    return (
        <div className="container mx-auto p-6">
            <Suspense fallback={
                <div className="flex items-center justify-center py-12">
                    <span className="loading loading-spinner loading-lg"></span>
                </div>
            }>
                <MarketplaceList />
            </Suspense>
        </div>
    );
}
