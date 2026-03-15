"use client";

import {
    EmailProvider,
    useEmail,
} from "@/components/basel/email/email-context";
import EmailHeaderSection from "@/components/basel/email/email-header-section";
import EmailSplitView from "@/components/basel/email/email-split-view";
import ComposeEmailModal from "@/components/basel/email/compose-email-modal";
import { ModalPortal } from "@splits-network/shared-ui";

function EmailPageInner() {
    const { showCompose, closeCompose, composeOpts, refresh } = useEmail();

    return (
        <>
            <EmailHeaderSection />

            <section className="bg-base-100">
                <div className="container mx-auto px-4 lg:px-8 py-8 lg:py-12">
                    <EmailSplitView />
                </div>
            </section>

            {/* Footer accent */}
            <section className="bg-base-300 text-base-content py-8">
                <div className="container mx-auto px-6 lg:px-12">
                    <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 bg-primary flex items-center justify-center">
                                <i className="fa-duotone fa-regular fa-envelope text-primary-content" />
                            </div>
                            <div>
                                <p className="text-sm font-bold">
                                    Splits Network Email
                                </p>
                                <p className="text-sm opacity-50">
                                    Send and receive emails directly from your
                                    connected accounts
                                </p>
                            </div>
                        </div>
                        <div className="flex gap-6 text-sm opacity-50">
                            <span className="flex items-center gap-1.5">
                                <i className="fa-duotone fa-regular fa-plug" />
                                Gmail &amp; Outlook
                            </span>
                            <span className="flex items-center gap-1.5">
                                <i className="fa-duotone fa-regular fa-lock" />
                                OAuth secured
                            </span>
                            <span className="flex items-center gap-1.5">
                                <i className="fa-duotone fa-regular fa-shield-check" />
                                Encrypted
                            </span>
                        </div>
                    </div>
                </div>
            </section>

            {showCompose && (
                <ModalPortal>
                    <ComposeEmailModal
                        toEmail={composeOpts.toEmail}
                        subject={composeOpts.subject}
                        inReplyTo={composeOpts.inReplyTo}
                        threadId={composeOpts.threadId}
                        connectionId={composeOpts.connectionId}
                        onClose={closeCompose}
                        onSent={() => {
                            closeCompose();
                            refresh();
                        }}
                    />
                </ModalPortal>
            )}
        </>
    );
}

export default function EmailPage() {
    return (
        <EmailProvider>
            <EmailPageInner />
        </EmailProvider>
    );
}
