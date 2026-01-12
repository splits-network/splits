import ApplicationsList from './components/applications-list';
import ApplicationsHeader from './components/applications-header';

export default function ApplicationsPage() {
    return (
        <div className="space-y-6">
            <ApplicationsHeader />
            <ApplicationsList />
        </div>
    );
}
