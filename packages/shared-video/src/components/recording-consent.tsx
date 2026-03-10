'use client';

interface RecordingConsentProps {
    onConsent: () => void;
    consentGiven: boolean;
}

export function RecordingConsent({ onConsent, consentGiven }: RecordingConsentProps) {
    return (
        <div className="bg-warning/5 border border-warning/20 rounded-none p-5 space-y-4">
            <div className="flex items-start gap-3">
                <i className="fa-duotone fa-regular fa-circle-dot text-error text-xl mt-0.5" />
                <div className="space-y-2">
                    <h3 className="text-lg font-black text-base-content">
                        This Call Will Be Recorded
                    </h3>
                    <p className="text-sm text-base-content/70">
                        This call will be recorded, transcribed, and summarized using AI.
                        By joining, you consent to the recording and processing of this session.
                    </p>
                    <p className="text-sm text-base-content/50">
                        The recording will be available to call participants and
                        administrators.
                    </p>
                </div>
            </div>

            <label className="flex items-center gap-3 cursor-pointer">
                <input
                    type="checkbox"
                    className="checkbox checkbox-warning rounded-none"
                    checked={consentGiven}
                    onChange={onConsent}
                />
                <span className="text-sm font-semibold text-base-content">
                    I understand and consent to recording
                </span>
            </label>
        </div>
    );
}
