import CandidatesListClient from './components/candidates-list-client';
import CandidateHeader from './components/candidate-header';

export default function CandidatesPage() {
    return (
        <div className='space-y-6'>
            {/* <CandidateHeader /> */}
            <CandidatesListClient />
        </div>
    );
}
