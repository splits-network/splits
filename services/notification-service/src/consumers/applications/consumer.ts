import { Logger } from '@splits-network/shared-logging';
import { DomainEvent } from '@splits-network/shared-types';
import { ApplicationsEmailService } from '../../services/applications/service';
import { ServiceRegistry } from '../../clients';
import { EmailLookupHelper } from '../../helpers/email-lookup';
import { DataLookupHelper } from '../../helpers/data-lookup';

export class ApplicationsEventConsumer {
    constructor(
        private emailService: ApplicationsEmailService,
        private services: ServiceRegistry,
        private emailLookup: EmailLookupHelper,
        private logger: Logger,
        private dataLookup: DataLookupHelper
    ) {}

    async handleApplicationAccepted(event: DomainEvent): Promise<void> {
        try {
            const { application_id, job_id, candidate_id, recruiter_id } = event.payload;

            this.logger.info(
                { application_id, job_id, recruiter_id },
                'Processing application accepted notification'
            );

            const job = await this.dataLookup.getJob(job_id);
            const candidate = await this.dataLookup.getCandidate(candidate_id);

            if (!job || !candidate) {
                this.logger.error({ application_id, hasJob: !!job, hasCandidate: !!candidate }, 'Missing job or candidate');
                throw new Error('Job or candidate not found');
            }

            if (recruiter_id) {
                const recruiterEmail = await this.emailLookup.getRecruiterEmail(recruiter_id);

                if (!recruiterEmail) {
                    this.logger.warn(
                        { application_id, recruiter_id },
                        'Cannot send application accepted email - recruiter has no email address'
                    );
                    return;
                }

                const recruiter = await this.dataLookup.getRecruiter(recruiter_id);

                await this.emailService.sendApplicationAccepted(recruiterEmail, {
                    candidateName: candidate.full_name,
                    jobTitle: job.title,
                    companyName: job.company?.name || 'the company',
                    applicationId: application_id,
                    userId: recruiter?.user_id,
                });

                this.logger.info(
                    { application_id, recipient: recruiterEmail },
                    'Application accepted notification sent to recruiter'
                );
            }
        } catch (error) {
            this.logger.error(
                { error, event_payload: event.payload },
                'Failed to send application accepted notification'
            );
            throw error;
        }
    }

    async handleApplicationStageChanged(event: DomainEvent): Promise<void> {
        try {
            const { application_id, old_stage, new_stage, job_id, candidate_id, recruiter_id } = event.payload;

            console.log('[APPLICATIONS-CONSUMER] 🔄 Stage changed:', { application_id, old_stage, new_stage });
            this.logger.info({ application_id, old_stage, new_stage }, 'Processing stage changed notification');

            const context = await this.dataLookup.getApplicationContext(application_id);
            if (!context) {
                this.logger.error({ application_id }, 'Could not load application context');
                throw new Error(`Application context not found for ${application_id}`);
            }

            const { application, job, candidate } = context;

            const candidateEmail = candidate.email;
            const candidateUserId = candidate.user_id;
            const effectiveRecruiterId = recruiter_id || application.recruiter_id;

            // Helper to get recruiter user_id
            const getRecruiterUserId = async (recId: string): Promise<string | undefined> => {
                const rec = await this.dataLookup.getRecruiter(recId);
                return rec?.user_id;
            };

            switch (new_stage) {
                case 'screen':
                    console.log('[APPLICATIONS-CONSUMER] 📞 Screen stage - notifying candidate and recruiter');
                    
                    if (candidateEmail) {
                        await this.emailService.sendCandidateApplicationSubmitted(candidateEmail, {
                            candidateName: candidate.full_name,
                            jobTitle: job.title,
                            companyName: job.company?.name || 'Unknown Company',
                            hasRecruiter: !!effectiveRecruiterId,
                            nextSteps: 'Your recruiter will contact you to schedule an initial screening call.',
                            applicationId: application_id,
                            userId: candidateUserId || undefined,
                        });
                    }
                    
                    if (effectiveRecruiterId) {
                        const recruiterEmail = await this.emailLookup.getRecruiterEmail(effectiveRecruiterId);
                        if (recruiterEmail) {
                            const recruiterUserId = await getRecruiterUserId(effectiveRecruiterId);
                            await this.emailService.sendApplicationStageChanged(recruiterEmail, {
                                candidateName: candidate.full_name,
                                jobTitle: job.title,
                                companyName: job.company?.name || 'Unknown Company',
                                oldStage: old_stage || 'Unknown',
                                newStage: 'screen',
                                applicationId: application_id,
                                userId: recruiterUserId,
                            });
                        }
                    }
                    break;

                case 'submitted':
                    console.log('[APPLICATIONS-CONSUMER] 📤 Submitted stage - notifying candidate, recruiter, and company');
                    
                    if (candidateEmail) {
                        await this.emailService.sendCandidateApplicationSubmitted(candidateEmail, {
                            candidateName: candidate.full_name,
                            jobTitle: job.title,
                            companyName: job.company?.name || 'Unknown Company',
                            hasRecruiter: !!effectiveRecruiterId,
                            nextSteps: 'Your application has been submitted to the company for review.',
                            applicationId: application_id,
                            userId: candidateUserId || undefined,
                        });
                    }
                    
                    const companyEmails = await this.emailLookup.getCompanyAdminEmails(job.company_id);
                    for (const email of companyEmails) {
                        await this.emailService.sendApplicationCreated(email, {
                            candidateName: candidate.full_name,
                            jobTitle: job.title,
                            companyName: job.company?.name || 'Unknown Company',
                            applicationId: application_id,
                        });
                    }
                    
                    if (effectiveRecruiterId) {
                        const recruiterEmail = await this.emailLookup.getRecruiterEmail(effectiveRecruiterId);
                        if (recruiterEmail) {
                            const recruiterUserId = await getRecruiterUserId(effectiveRecruiterId);
                            await this.emailService.sendApplicationStageChanged(recruiterEmail, {
                                candidateName: candidate.full_name,
                                jobTitle: job.title,
                                companyName: job.company?.name || 'Unknown Company',
                                oldStage: old_stage || 'Unknown',
                                newStage: 'submitted',
                                applicationId: application_id,
                                userId: recruiterUserId,
                            });
                        }
                    }
                    break;

                case 'interview':
                    console.log('[APPLICATIONS-CONSUMER] 🎤 Interview stage - notifying all parties');
                    
                    if (candidateEmail) {
                        await this.emailService.sendCandidateApplicationSubmitted(candidateEmail, {
                            candidateName: candidate.full_name,
                            jobTitle: job.title,
                            companyName: job.company?.name || 'Unknown Company',
                            hasRecruiter: !!effectiveRecruiterId,
                            nextSteps: 'The company would like to interview you! They will contact you to schedule.',
                            applicationId: application_id,
                            userId: candidateUserId || undefined,
                        });
                    }
                    
                    if (effectiveRecruiterId) {
                        const recruiterEmail = await this.emailLookup.getRecruiterEmail(effectiveRecruiterId);
                        if (recruiterEmail) {
                            const recruiterUserId = await getRecruiterUserId(effectiveRecruiterId);
                            await this.emailService.sendApplicationStageChanged(recruiterEmail, {
                                candidateName: candidate.full_name,
                                jobTitle: job.title,
                                companyName: job.company?.name || 'Unknown Company',
                                oldStage: old_stage || 'Unknown',
                                newStage: 'interview',
                                applicationId: application_id,
                                userId: recruiterUserId,
                            });
                        }
                    }
                    break;

                case 'offer':
                    console.log('[APPLICATIONS-CONSUMER] 🎉 Offer stage - notifying candidate and recruiter');
                    
                    if (candidateEmail) {
                        await this.emailService.sendCandidateApplicationSubmitted(candidateEmail, {
                            candidateName: candidate.full_name,
                            jobTitle: job.title,
                            companyName: job.company?.name || 'Unknown Company',
                            hasRecruiter: !!effectiveRecruiterId,
                            nextSteps: 'Congratulations! The company has extended an offer. Review the details and next steps.',
                            applicationId: application_id,
                            userId: candidateUserId || undefined,
                        });
                    }
                    
                    if (effectiveRecruiterId) {
                        const recruiterEmail = await this.emailLookup.getRecruiterEmail(effectiveRecruiterId);
                        if (recruiterEmail) {
                            const recruiterUserId = await getRecruiterUserId(effectiveRecruiterId);
                            await this.emailService.sendApplicationStageChanged(recruiterEmail, {
                                candidateName: candidate.full_name,
                                jobTitle: job.title,
                                companyName: job.company?.name || 'Unknown Company',
                                oldStage: old_stage || 'Unknown',
                                newStage: 'offer',
                                applicationId: application_id,
                                userId: recruiterUserId,
                            });
                        }
                    }
                    break;

                case 'hired':
                    console.log('[APPLICATIONS-CONSUMER] ✅ Hired stage - notifying everyone');
                    
                    if (candidateEmail) {
                        await this.emailService.sendCandidateApplicationSubmitted(candidateEmail, {
                            candidateName: candidate.full_name,
                            jobTitle: job.title,
                            companyName: job.company?.name || 'Unknown Company',
                            hasRecruiter: !!effectiveRecruiterId,
                            nextSteps: 'Congratulations on your new role! Welcome to the team.',
                            applicationId: application_id,
                            userId: candidateUserId || undefined,
                        });
                    }
                    
                    if (effectiveRecruiterId) {
                        const recruiterEmail = await this.emailLookup.getRecruiterEmail(effectiveRecruiterId);
                        if (recruiterEmail) {
                            const recruiterUserId = await getRecruiterUserId(effectiveRecruiterId);
                            await this.emailService.sendApplicationStageChanged(recruiterEmail, {
                                candidateName: candidate.full_name,
                                jobTitle: job.title,
                                companyName: job.company?.name || 'Unknown Company',
                                oldStage: old_stage || 'Unknown',
                                newStage: 'hired',
                                applicationId: application_id,
                                userId: recruiterUserId,
                            });
                        }
                    }
                    
                    const companyEmailsHired = await this.emailLookup.getCompanyAdminEmails(job.company_id);
                    for (const email of companyEmailsHired) {
                        await this.emailService.sendApplicationStageChanged(email, {
                            candidateName: candidate.full_name,
                            jobTitle: job.title,
                            companyName: job.company?.name || 'Unknown Company',
                            oldStage: old_stage || 'Unknown',
                            newStage: 'hired',
                            applicationId: application_id,
                        });
                    }
                    break;

                case 'rejected':
                    console.log('[APPLICATIONS-CONSUMER] ❌ Rejected stage - notifying candidate and recruiter');
                    
                    if (candidateEmail) {
                        await this.emailService.sendCandidateApplicationSubmitted(candidateEmail, {
                            candidateName: candidate.full_name,
                            jobTitle: job.title,
                            companyName: job.company?.name || 'Unknown Company',
                            hasRecruiter: !!effectiveRecruiterId,
                            nextSteps: 'Thank you for your interest. The company has decided to move forward with other candidates at this time.',
                            applicationId: application_id,
                            userId: candidateUserId || undefined,
                        });
                    }
                    
                    if (effectiveRecruiterId) {
                        const recruiterEmail = await this.emailLookup.getRecruiterEmail(effectiveRecruiterId);
                        if (recruiterEmail) {
                            const recruiterUserId = await getRecruiterUserId(effectiveRecruiterId);
                            await this.emailService.sendApplicationStageChanged(recruiterEmail, {
                                candidateName: candidate.full_name,
                                jobTitle: job.title,
                                companyName: job.company?.name || 'Unknown Company',
                                oldStage: old_stage || 'Unknown',
                                newStage: 'rejected',
                                applicationId: application_id,
                                userId: recruiterUserId,
                            });
                        }
                    }
                    break;

                case 'withdrawn':
                    console.log('[APPLICATIONS-CONSUMER] 🚫 Withdrawn stage - notifying recruiter and company');
                    
                    if (effectiveRecruiterId) {
                        const recruiterEmail = await this.emailLookup.getRecruiterEmail(effectiveRecruiterId);
                        if (recruiterEmail) {
                            const recruiterUserId = await getRecruiterUserId(effectiveRecruiterId);
                            await this.emailService.sendApplicationStageChanged(recruiterEmail, {
                                candidateName: candidate.full_name,
                                jobTitle: job.title,
                                companyName: job.company?.name || 'Unknown Company',
                                oldStage: old_stage || 'Unknown',
                                newStage: 'withdrawn',
                                applicationId: application_id,
                                userId: recruiterUserId,
                            });
                        }
                    }
                    
                    if (old_stage === 'submitted' || old_stage === 'interview' || old_stage === 'offer') {
                        const companyEmailsWithdrawn = await this.emailLookup.getCompanyAdminEmails(job.company_id);
                        for (const email of companyEmailsWithdrawn) {
                            await this.emailService.sendApplicationStageChanged(email, {
                                candidateName: candidate.full_name,
                                jobTitle: job.title,
                                companyName: job.company?.name || 'Unknown Company',
                                oldStage: old_stage || 'Unknown',
                                newStage: 'withdrawn',
                                applicationId: application_id,
                            });
                        }
                    }
                    break;

                default:
                    console.log('[APPLICATIONS-CONSUMER] ℹ️ Other stage change - notifying recruiter only');
                    if (effectiveRecruiterId) {
                        const recruiterEmail = await this.emailLookup.getRecruiterEmail(effectiveRecruiterId);
                        if (recruiterEmail) {
                            const recruiterUserId = await getRecruiterUserId(effectiveRecruiterId);
                            await this.emailService.sendApplicationStageChanged(recruiterEmail, {
                                candidateName: candidate.full_name,
                                jobTitle: job.title,
                                companyName: job.company?.name || 'Unknown Company',
                                oldStage: old_stage || 'Unknown',
                                newStage: new_stage,
                                applicationId: application_id,
                                userId: recruiterUserId,
                            });
                        }
                    }
            }

            this.logger.info({ application_id, new_stage }, 'Stage change notifications sent');
        } catch (error) {
            this.logger.error(
                { error, event_payload: event.payload },
                'Failed to send application stage changed notification'
            );
            throw error;
        }
    }

    async handleCandidateApplicationSubmitted(event: DomainEvent): Promise<void> {
        try {
            const { application_id, job_id, candidate_id, candidate_user_id, recruiter_id, has_recruiter, stage } = event.payload;

            console.log('[APPLICATIONS-CONSUMER] 🎯 Starting to handle application.created event:', {
                application_id,
                has_recruiter,
                stage,
                candidate_user_id,
                recruiter_id,
            });
            this.logger.info({ application_id, has_recruiter, stage, candidate_user_id }, 'Handling candidate application submission');

            const job = await this.dataLookup.getJob(job_id);
            const candidate = await this.dataLookup.getCandidate(candidate_id);

            if (!job || !candidate) {
                this.logger.error({ application_id, hasJob: !!job, hasCandidate: !!candidate }, 'Missing job or candidate');
                throw new Error('Job or candidate not found');
            }

            const candidateEmail = await this.emailLookup.getCandidateEmail(candidate_id);
            const candidateUserId = candidate_user_id || null;

            // Scenario 1: Recruiter directly submits candidate
            if (has_recruiter && stage === 'submitted') {
                this.logger.info({ application_id }, 'Recruiter direct submission - notifying company');

                const recruiterEmail = await this.emailLookup.getRecruiterEmail(recruiter_id);
                if (!recruiterEmail) {
                    this.logger.warn({ recruiter_id }, 'Cannot send recruiter notification - no email address');
                    return;
                }

                const recruiter = await this.dataLookup.getRecruiter(recruiter_id);
                const recruiterName = recruiter ? await this.emailLookup.getUserName(recruiter.user_id) : null;
                const company = await this.dataLookup.getCompany(job.company_id);

                if (company?.identity_organization_id) {
                    const adminEmails = await this.emailLookup.getCompanyAdminEmails(company.identity_organization_id);
                    for (const adminEmail of adminEmails) {
                        await this.emailService.sendCompanyApplicationReceived(adminEmail, {
                            candidateName: candidate.full_name,
                            jobTitle: job.title,
                            applicationId: application_id,
                            hasRecruiter: true,
                            recruiterName: recruiterName || recruiterEmail,
                            userId: undefined,
                        });
                    }
                }

                await this.emailService.sendApplicationCreated(recruiterEmail, {
                    candidateName: candidate.full_name,
                    jobTitle: job.title,
                    companyName: job.company?.name || 'Unknown Company',
                    applicationId: application_id,
                    userId: recruiter?.user_id,
                });

                return;
            }

            // Scenario 2: Candidate submits with recruiter (stage === 'screen')
            if (has_recruiter && stage === 'screen') {
                console.log('[APPLICATIONS-CONSUMER] 📋 Scenario 2: Candidate with recruiter');

                const nextSteps = 'Your application has been sent to your recruiter for review. They will enhance and submit it to the company.';

                if (candidateEmail) {
                    console.log('[APPLICATIONS-CONSUMER] 📧 Sending email to candidate:', candidateEmail);
                    await this.emailService.sendCandidateApplicationSubmitted(candidateEmail, {
                        candidateName: candidate.full_name,
                        jobTitle: job.title,
                        companyName: job.company?.name || 'Unknown Company',
                        hasRecruiter: true,
                        nextSteps,
                        applicationId: application_id,
                        userId: candidateUserId || undefined,
                    });
                    console.log('[APPLICATIONS-CONSUMER] ✅ Candidate email sent successfully');
                }

                const recruiterEmail = await this.emailLookup.getRecruiterEmail(recruiter_id);
                if (!recruiterEmail) {
                    this.logger.warn({ recruiter_id }, 'Cannot send recruiter notification - no email address');
                    return;
                }

                const recruiter = await this.dataLookup.getRecruiter(recruiter_id);

                console.log('[APPLICATIONS-CONSUMER] 📧 Sending email to recruiter:', recruiterEmail);
                await this.emailService.sendRecruiterApplicationPending(recruiterEmail, {
                    candidateName: candidate.full_name,
                    jobTitle: job.title,
                    companyName: job.company?.name || 'Unknown Company',
                    applicationId: application_id,
                    userId: recruiter?.user_id,
                });
                console.log('[APPLICATIONS-CONSUMER] ✅ Recruiter email sent successfully');

                return;
            }

            // Scenario 3: Candidate submits directly to company (no recruiter)
            if (!has_recruiter && stage === 'submitted') {
                console.log('[APPLICATIONS-CONSUMER] 📋 Scenario 3: Direct to company (no recruiter)');

                const nextSteps = 'Your application has been submitted directly to the company. They will review and contact you if interested.';

                if (candidateEmail) {
                    await this.emailService.sendCandidateApplicationSubmitted(candidateEmail, {
                        candidateName: candidate.full_name,
                        jobTitle: job.title,
                        companyName: job.company?.name || 'Unknown Company',
                        hasRecruiter: false,
                        nextSteps,
                        applicationId: application_id,
                        userId: candidateUserId || undefined,
                    });
                }

                const company = await this.dataLookup.getCompany(job.company_id);
                if (company?.identity_organization_id) {
                    const adminEmails = await this.emailLookup.getCompanyAdminEmails(company.identity_organization_id);
                    for (const adminEmail of adminEmails) {
                        await this.emailService.sendCompanyApplicationReceived(adminEmail, {
                            candidateName: candidate.full_name,
                            jobTitle: job.title,
                            applicationId: application_id,
                            hasRecruiter: false,
                            userId: undefined,
                        });
                    }
                }

                return;
            }

            // Scenario 4: Recruiter proposes job to candidate
            if (has_recruiter && stage === 'recruiter_proposed') {
                console.log('[APPLICATIONS-CONSUMER] 📋 Scenario 4: Recruiter proposing job to candidate');

                if (candidateEmail) {
                    const recruiterEmail = await this.emailLookup.getRecruiterEmail(recruiter_id);
                    const recruiter = await this.dataLookup.getRecruiter(recruiter_id);
                    const recruiterName = recruiter 
                        ? await this.emailLookup.getUserName(recruiter.user_id) || recruiterEmail || 'Your recruiter'
                        : 'Your recruiter';

                    await this.emailService.sendJobProposalToCandidate(candidateEmail, {
                        candidateName: candidate.full_name,
                        recruiterName,
                        jobTitle: job.title,
                        companyName: job.company?.name || 'Unknown Company',
                        applicationId: application_id,
                        userId: candidateUserId || undefined,
                    });
                }

                return;
            }

            // Scenario 5: Application submitted for AI review
            if (stage === 'ai_review') {
                console.log('[APPLICATIONS-CONSUMER] 📋 Scenario 5: Application submitted for AI review');

                const nextSteps = has_recruiter
                    ? 'Your application is being reviewed by our AI system. Once complete, your recruiter will review and submit it to the company.'
                    : 'Your application is being reviewed by our AI system. Once complete, it will be submitted to the company for their review.';

                if (candidateEmail) {
                    await this.emailService.sendCandidateApplicationSubmitted(candidateEmail, {
                        candidateName: candidate.full_name,
                        jobTitle: job.title,
                        companyName: job.company?.name || 'Unknown Company',
                        hasRecruiter: !!recruiter_id,
                        nextSteps,
                        applicationId: application_id,
                        userId: candidateUserId || undefined,
                    });
                }

                if (recruiter_id) {
                    const recruiterEmail = await this.emailLookup.getRecruiterEmail(recruiter_id);
                    if (recruiterEmail) {
                        const recruiter = await this.dataLookup.getRecruiter(recruiter_id);
                        await this.emailService.sendRecruiterApplicationPending(recruiterEmail, {
                            candidateName: candidate.full_name,
                            jobTitle: job.title,
                            companyName: job.company?.name || 'Unknown Company',
                            applicationId: application_id,
                            userId: recruiter?.user_id,
                        });
                    }
                }

                return;
            }

            console.log('[APPLICATIONS-CONSUMER] ⚠️ No scenario matched - event details:', { has_recruiter, stage });
        } catch (error) {
            this.logger.error(
                { error, event_payload: event.payload },
                'Failed to send candidate application submission notifications'
            );
            throw error;
        }
    }

    async handleRecruiterSubmittedToCompany(event: DomainEvent): Promise<void> {
        try {
            const { application_id, job_id, candidate_id, candidate_user_id, recruiter_id, company_id } = event.payload;

            console.log('[NOTIFICATION-SERVICE] 🎯 Handling recruiter submission to company:', { application_id });
            this.logger.info({ application_id }, 'Handling recruiter submission to company');

            const job = await this.dataLookup.getJob(job_id);
            const candidate = await this.dataLookup.getCandidate(candidate_id);

            if (!job || !candidate) {
                this.logger.error({ application_id }, 'Missing job or candidate');
                throw new Error('Job or candidate not found');
            }

            const recruiterEmail = await this.emailLookup.getRecruiterEmail(recruiter_id);
            if (!recruiterEmail) {
                this.logger.warn({ recruiter_id }, 'Cannot notify recruiter - no email address');
                return;
            }

            const recruiter = await this.dataLookup.getRecruiter(recruiter_id);
            const recruiterName = recruiter ? await this.emailLookup.getUserName(recruiter.user_id) : null;
            const company = await this.dataLookup.getCompany(company_id || job.company_id);

            if (company?.identity_organization_id) {
                const adminEmails = await this.emailLookup.getCompanyAdminEmails(company.identity_organization_id);
                for (const adminEmail of adminEmails) {
                    await this.emailService.sendCompanyApplicationReceived(adminEmail, {
                        candidateName: candidate.full_name,
                        jobTitle: job.title,
                        applicationId: application_id,
                        hasRecruiter: true,
                        recruiterName: recruiterName || recruiterEmail,
                        userId: undefined,
                    });
                }
            }

            const candidateEmail = await this.emailLookup.getCandidateEmail(candidate_id);
            if (candidateEmail) {
                await this.emailService.sendCandidateApplicationSubmitted(candidateEmail, {
                    candidateName: candidate.full_name,
                    jobTitle: job.title,
                    companyName: job.company?.name || 'Unknown Company',
                    hasRecruiter: true,
                    nextSteps: 'Your recruiter has reviewed and submitted your application to the company. They will be in touch if there is interest.',
                    applicationId: application_id,
                    userId: candidate_user_id || undefined,
                });
            }

            this.logger.info({ application_id }, 'Recruiter submission to company notifications sent');
        } catch (error) {
            this.logger.error(
                { error, event_payload: event.payload },
                'Failed to send recruiter submission notifications'
            );
            throw error;
        }
    }

    async handleApplicationWithdrawn(event: DomainEvent): Promise<void> {
        try {
            const { application_id, job_id, candidate_id, recruiter_id, reason, candidate_user_id } = event.payload;

            console.log('[APPLICATIONS-CONSUMER] 🎯 Handling application.withdrawn event:', { application_id });
            this.logger.info({ application_id }, 'Handling application withdrawal by candidate');

            const job = await this.dataLookup.getJob(job_id);
            const candidate = await this.dataLookup.getCandidate(candidate_id);

            if (!job || !candidate) {
                this.logger.error({ application_id }, 'Missing job or candidate');
                throw new Error('Job or candidate not found');
            }

            const company = job.company || await this.dataLookup.getCompany(job.company_id);
            const candidateEmail = await this.emailLookup.getCandidateEmail(candidate_id);

            if (candidateEmail) {
                await this.emailService.sendApplicationWithdrawn(candidateEmail, {
                    candidateName: candidate.full_name,
                    jobTitle: job.title,
                    companyName: job.company?.name || company?.name || 'Unknown Company',
                    reason,
                    withdrawnBy: 'Candidate',
                    applicationId: application_id,
                    userId: candidate_user_id || undefined,
                });
            }

            if (recruiter_id) {
                const recruiterEmail = await this.emailLookup.getRecruiterEmail(recruiter_id);
                if (recruiterEmail) {
                    const recruiter = await this.dataLookup.getRecruiter(recruiter_id);
                    await this.emailService.sendApplicationWithdrawn(recruiterEmail, {
                        candidateName: candidate.full_name,
                        jobTitle: job.title,
                        companyName: job.company?.name || company?.name || 'Unknown Company',
                        reason,
                        withdrawnBy: 'Candidate',
                        applicationId: application_id,
                        userId: recruiter?.user_id,
                    });
                }
            }

            this.logger.info({ application_id }, 'Application withdrawal notifications sent');
        } catch (error) {
            this.logger.error(
                { error, event_payload: event.payload },
                'Failed to send application withdrawal notifications'
            );
            throw error;
        }
    }

    async handlePreScreenRequested(event: DomainEvent): Promise<void> {
        try {
            const {
                application_id,
                job_id,
                candidate_id,
                company_id,
                recruiter_id,
                requested_by_user_id,
                message,
                auto_assign,
            } = event.payload;

            this.logger.info({ application_id, recruiter_id, auto_assign }, 'Processing pre-screen request notification');

            const job = await this.dataLookup.getJob(job_id);
            const candidate = await this.dataLookup.getCandidate(candidate_id);
            const company = await this.dataLookup.getCompany(company_id);

            if (!job || !candidate || !company) {
                this.logger.error({ application_id }, 'Missing job, candidate, or company');
                throw new Error('Job, candidate, or company not found');
            }

            const requestingUserEmail = await this.emailLookup.getEmailByUserId(requested_by_user_id);
            const requestingUserName = await this.emailLookup.getUserName(requested_by_user_id);
            
            if (!requestingUserEmail) {
                this.logger.warn({ requested_by_user_id }, 'Cannot send confirmation - requesting user has no email');
                return;
            }

            if (recruiter_id && !auto_assign) {
                const recruiterEmail = await this.emailLookup.getRecruiterEmail(recruiter_id);
                if (recruiterEmail) {
                    const recruiter = await this.dataLookup.getRecruiter(recruiter_id);
                    await this.emailService.sendPreScreenRequested(recruiterEmail, {
                        candidateName: candidate.full_name,
                        candidateEmail: candidate.email || 'Not provided',
                        jobTitle: job.title,
                        companyName: company.name,
                        requestedBy: requestingUserName || requestingUserEmail,
                        message: message || '',
                        userId: recruiter?.user_id,
                    });
                    this.logger.info({ recruiter_id, recipient: recruiterEmail }, 'Pre-screen request notification sent to recruiter');
                }
            }

            if (auto_assign) {
                this.logger.info({ application_id }, 'Pre-screen request is auto-assign, skipping notification');
            }

            await this.emailService.sendPreScreenRequestConfirmation(requestingUserEmail, {
                candidateName: candidate.full_name,
                jobTitle: job.title,
                autoAssign: auto_assign,
                userId: requested_by_user_id,
            });

            this.logger.info({ application_id }, 'Pre-screen request notifications completed');
        } catch (error) {
            this.logger.error(
                { error, event_payload: event.payload },
                'Failed to send pre-screen request notifications'
            );
            throw error;
        }
    }

    async handleAIReviewStarted(event: DomainEvent): Promise<void> {
        try {
            const { application_id } = event.payload;
            this.logger.info({ application_id }, 'AI review started - no notification sent');
        } catch (error) {
            this.logger.error(
                { error, event_payload: event.payload },
                'Failed to handle AI review started event'
            );
            throw error;
        }
    }

    async handleAIReviewCompleted(event: DomainEvent): Promise<void> {
        try {
            const {
                application_id,
                fit_score,
                recommendation,
            } = event.payload;

            this.logger.info(
                { application_id, fit_score, recommendation },
                'Processing AI review completed notification'
            );

            const context = await this.dataLookup.getApplicationContext(application_id);
            if (!context) {
                this.logger.error({ application_id }, 'Could not load application context');
                throw new Error(`Application context not found for ${application_id}`);
            }

            const { application, job, candidate } = context;
            const aiReview = await this.dataLookup.getAIReview(application_id);

            const candidateEmail = await this.emailLookup.getCandidateEmail(application.candidate_id);
            
            if (candidateEmail) {
                await this.emailService.sendAIReviewCompletedToCandidate(candidateEmail, {
                    candidateName: candidate.full_name,
                    jobTitle: job.title,
                    fitScore: fit_score,
                    recommendation,
                    strengths: aiReview?.strengths || [],
                    concerns: aiReview?.concerns || [],
                    userId: candidate.user_id || undefined,
                    applicationId: application_id,
                });

                this.logger.info(
                    { application_id, recipient: candidateEmail },
                    'AI review completed notification sent to candidate'
                );
            }

            if (application.recruiter_id) {
                const recruiterEmail = await this.emailLookup.getRecruiterEmail(application.recruiter_id);
                
                if (recruiterEmail) {
                    const recruiter = await this.dataLookup.getRecruiter(application.recruiter_id);
                    const recruiterName = recruiter ? await this.emailLookup.getUserName(recruiter.user_id) : null;

                    await this.emailService.sendAIReviewCompletedToRecruiter(recruiterEmail, {
                        recruiterName: recruiterName || 'Recruiter',
                        candidateName: candidate.full_name,
                        jobTitle: job.title,
                        fitScore: fit_score,
                        recommendation,
                        overallSummary: aiReview?.overall_summary || '',
                        strengths: aiReview?.strengths || [],
                        concerns: aiReview?.concerns || [],
                        matchedSkills: aiReview?.matched_skills || [],
                        missingSkills: aiReview?.missing_skills || [],
                        userId: recruiter?.user_id,
                        applicationId: application_id,
                    });

                    this.logger.info(
                        { application_id, recipient: recruiterEmail },
                        'AI review completed notification sent to recruiter'
                    );
                }
            }

            this.logger.info({ application_id }, 'AI review completed notifications sent');
        } catch (error) {
            this.logger.error(
                { error, event_payload: event.payload },
                'Failed to send AI review completed notifications'
            );
            throw error;
        }
    }

    async handleAIReviewFailed(event: DomainEvent): Promise<void> {
        try {
            const { application_id, error: errorMsg } = event.payload;
            this.logger.warn({ application_id, error: errorMsg }, 'AI review failed - notifying admin team');
            this.logger.error({ application_id, error: errorMsg }, 'AI REVIEW FAILED - ADMIN ALERT');
        } catch (error) {
            this.logger.error(
                { error, event_payload: event.payload },
                'Failed to handle AI review failed event'
            );
            throw error;
        }
    }

    async handleDraftCompleted(event: DomainEvent): Promise<void> {
        try {
            const { application_id } = event.payload;
            this.logger.info({ application_id }, 'Application draft completed - AI review will be triggered automatically');
        } catch (error) {
            this.logger.error(
                { error, event_payload: event.payload },
                'Failed to handle draft completed event'
            );
            throw error;
        }
    }
}
