'use client';

import { useState } from 'react';
import ApplicationTimeline from './application-timeline';

interface ApplicationTabsProps {
    applicationId: string;
}

export default function ApplicationTabs({ applicationId }: ApplicationTabsProps) {
    const [activeTab, setActiveTab] = useState('timeline');

    return (
        <div className="card bg-base-200 shadow">
            <div className="card-body">
                {/* Tabs */}
                <div role="tablist" className="tabs tabs-box mb-4">
                    <button
                        role="tab"
                        className={`tab ${activeTab === 'timeline' ? 'tab-active' : ''}`}
                        onClick={() => setActiveTab('timeline')}
                    >
                        <i className="fa-duotone fa-regular fa-clock-rotate-left mr-2"></i>
                        Timeline
                    </button>
                    <button
                        role="tab"
                        className={`tab ${activeTab === 'details' ? 'tab-active' : ''}`}
                        onClick={() => setActiveTab('details')}
                    >
                        <i className="fa-duotone fa-regular fa-info-circle mr-2"></i>
                        Details
                    </button>
                    <button
                        role="tab"
                        className={`tab ${activeTab === 'documents' ? 'tab-active' : ''}`}
                        onClick={() => setActiveTab('documents')}
                    >
                        <i className="fa-duotone fa-regular fa-file mr-2"></i>
                        Documents
                    </button>
                </div>

                {/* Tab Content */}
                {activeTab === 'timeline' && (
                    <div className="animate-fadeIn">
                        {/* <ApplicationTimeline auditLogs={applicationId} /> */}
                    </div>
                )}

                {activeTab === 'details' && (
                    <div className="animate-fadeIn">
                        <p className="text-base-content/70">Application details will be shown here.</p>
                    </div>
                )}

                {activeTab === 'documents' && (
                    <div className="animate-fadeIn">
                        <p className="text-base-content/70">Documents will be shown here.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
