import { Suspense } from 'react';
import { AdminLoadingState } from '@/components/shared';
import { UserTable } from './components/user-table';

export const metadata = { title: 'Users | Admin' };

export default function UsersPage() {
    return (
        <div className="p-6">
            <Suspense fallback={<AdminLoadingState />}>
                <UserTable />
            </Suspense>
        </div>
    );
}
