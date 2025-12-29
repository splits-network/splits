'use client';

import React from 'react';

interface ProposalAlertProps {
    recruiterName: string;
    recruiterPitch?: string;
    onAccept: () => void;
    onDecline: () => void;
    isDisabled?: boolean;
}

export function ProposalAlert({ recruiterName, recruiterPitch, onAccept, onDecline, isDisabled = false }: ProposalAlertProps) {
    return (
        <div className="alert alert-info alert-outline alert-vertical sm:alert-horizontal mb-6">
            <i className="fa-solid fa-handshake text-2xl"></i>
            <div className="w-full">
                <h3 className="font-bold text-lg mb-2">
                    {recruiterName} thinks you'd be a great fit for this role!
                </h3>
                {recruiterPitch && (
                    <div className="mb-4 p-4 bg-base-100 rounded-lg w-full">
                        <div className="text-sm text-base-content/60 mb-2">Recruiter's Message:</div>
                        <div className="whitespace-pre-wrap w-full">{recruiterPitch}</div>
                    </div>
                )}
            </div>
            <div className="flex flex-col gap-4">
                <button
                    onClick={onAccept}
                    className="btn btn-primary"
                    disabled={isDisabled}
                >
                    <i className="fa-solid fa-check"></i>
                    Accept & Apply
                </button>
                <button
                    onClick={onDecline}
                    className="btn btn-outline"
                    disabled={isDisabled}
                >
                    <i className="fa-solid fa-times"></i>
                    Not Interested
                </button>
            </div>
        </div>
    );
}
