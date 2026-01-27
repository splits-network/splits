'use client';

/**
 * Candidate Onboarding Wizard Modal
 * 4-step wizard for collecting candidate profile information
 */

import { useEffect, useRef } from 'react';
import { useOnboarding } from './onboarding-provider';
import { WelcomeStep } from './steps/welcome-step';
import { ContactStep } from './steps/contact-step';
import { ResumeStep } from './steps/resume-step';
import { PreferencesStep } from './steps/preferences-step';

const STEP_TITLES = [
    'Welcome',
    'Contact Info',
    'Resume',
    'Job Preferences',
] as const;

export function OnboardingWizardModal() {
    const { 
        state, 
        nextStep, 
        previousStep, 
        skipOnboarding, 
        completeOnboarding 
    } = useOnboarding();
    
    const dialogRef = useRef<HTMLDialogElement>(null);

    // Open/close modal based on state
    useEffect(() => {
        const dialog = dialogRef.current;
        if (!dialog) return;

        if (state.isModalOpen) {
            if (!dialog.open) {
                dialog.showModal();
            }
            // Block body scroll
            document.body.style.overflow = 'hidden';
        } else {
            if (dialog.open) {
                dialog.close();
            }
            document.body.style.overflow = '';
        }

        return () => {
            document.body.style.overflow = '';
        };
    }, [state.isModalOpen]);

    // Prevent closing on backdrop click
    const handleDialogClick = (e: React.MouseEvent<HTMLDialogElement>) => {
        // Only close if clicking the backdrop (dialog element itself, not children)
        // We prevent this by doing nothing - modal should not close on backdrop
    };

    // Prevent closing on Escape key
    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Escape') {
            e.preventDefault();
        }
    };

    const handleNext = () => {
        if (state.currentStep === 4) {
            completeOnboarding();
        } else {
            nextStep();
        }
    };

    const handleSkip = () => {
        skipOnboarding();
    };

    const progressPercentage = (state.currentStep / 4) * 100;

    if (!state.isModalOpen) {
        return null;
    }

    return (
        <dialog 
            ref={dialogRef}
            className="modal"
            onClick={handleDialogClick}
            onKeyDown={handleKeyDown}
        >
            <div className="modal-box max-w-2xl">
                {/* Progress Header */}
                <div className="mb-6">
                    {/* Step indicator pills */}
                    <div className="flex items-center justify-center gap-2 mb-4">
                        {STEP_TITLES.map((title, index) => {
                            const stepNum = index + 1;
                            const isActive = state.currentStep === stepNum;
                            const isCompleted = state.currentStep > stepNum;
                            
                            return (
                                <div 
                                    key={stepNum}
                                    className="flex items-center"
                                >
                                    <div 
                                        className={`
                                            w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium
                                            transition-all duration-200
                                            ${isActive 
                                                ? 'bg-primary text-primary-content' 
                                                : isCompleted 
                                                    ? 'bg-success text-success-content'
                                                    : 'bg-base-300 text-base-content/50'
                                            }
                                        `}
                                    >
                                        {isCompleted ? (
                                            <i className="fa-duotone fa-regular fa-check text-xs"></i>
                                        ) : (
                                            stepNum
                                        )}
                                    </div>
                                    {index < STEP_TITLES.length - 1 && (
                                        <div 
                                            className={`
                                                w-8 h-0.5 mx-1
                                                ${isCompleted ? 'bg-success' : 'bg-base-300'}
                                            `}
                                        />
                                    )}
                                </div>
                            );
                        })}
                    </div>

                    {/* Progress bar */}
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium">
                            Step {state.currentStep}: {STEP_TITLES[state.currentStep - 1]}
                        </span>
                        <span className="text-sm text-base-content/70">
                            {Math.round(progressPercentage)}% Complete
                        </span>
                    </div>
                    <div className="w-full bg-base-300 rounded-full h-2">
                        <div
                            className="bg-primary h-2 rounded-full transition-all duration-300"
                            style={{ width: `${progressPercentage}%` }}
                        />
                    </div>
                </div>

                {/* Step Content */}
                <div className="py-4 min-h-[300px]">
                    {state.currentStep === 1 && <WelcomeStep />}
                    {state.currentStep === 2 && <ContactStep />}
                    {state.currentStep === 3 && <ResumeStep />}
                    {state.currentStep === 4 && <PreferencesStep />}
                </div>

                {/* Error Display */}
                {state.error && (
                    <div className="alert alert-error mb-4">
                        <i className="fa-duotone fa-regular fa-circle-exclamation"></i>
                        <span>{state.error}</span>
                    </div>
                )}

                {/* Footer Actions */}
                <div className="modal-action flex justify-between items-center pt-4 border-t border-base-300">
                    <div>
                        {state.currentStep > 1 && (
                            <button 
                                className="btn btn-ghost"
                                onClick={previousStep}
                                disabled={state.submitting}
                            >
                                <i className="fa-duotone fa-regular fa-arrow-left mr-2"></i>
                                Previous
                            </button>
                        )}
                    </div>
                    
                    <div className="flex gap-2">
                        <button 
                            className="btn btn-ghost"
                            onClick={handleSkip}
                            disabled={state.submitting}
                        >
                            Skip for now
                        </button>
                        <button 
                            className="btn btn-primary"
                            onClick={handleNext}
                            disabled={state.submitting}
                        >
                            {state.submitting ? (
                                <>
                                    <span className="loading loading-spinner loading-sm"></span>
                                    {state.currentStep === 4 ? 'Completing...' : 'Saving...'}
                                </>
                            ) : state.currentStep === 4 ? (
                                <>
                                    Complete Setup
                                    <i className="fa-duotone fa-regular fa-check ml-2"></i>
                                </>
                            ) : (
                                <>
                                    Next
                                    <i className="fa-duotone fa-regular fa-arrow-right ml-2"></i>
                                </>
                            )}
                        </button>
                    </div>
                </div>

                {/* Help Text */}
                <div className="mt-4 pt-4 border-t border-base-300">
                    <p className="text-xs text-center text-base-content/60">
                        Need help? Contact support at{' '}
                        <a href="mailto:help@splits.network" className="link link-primary">
                            help@splits.network
                        </a>
                    </p>
                </div>
            </div>
        </dialog>
    );
}
