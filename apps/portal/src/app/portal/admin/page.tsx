import { redirect } from 'next/navigation';

const ADMIN_APP_URL = process.env.NEXT_PUBLIC_ADMIN_APP_URL || 'http://localhost:3200';

export default function AdminPage() {
    redirect(ADMIN_APP_URL);
}
