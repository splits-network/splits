import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import PlansContent from './components/plans-content';

export default async function PlansPage() {
    const { getToken } = await auth();

    const token = await getToken();
    if (!token) {
        redirect('/sign-in');
    }

    return <PlansContent />;
}