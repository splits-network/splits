import { JobPreScreenAnswerRepository } from './repository';
import { ApplicationRepository } from '../applications/repository';

export class JobPreScreenAnswerService {
    constructor(
        private repository: JobPreScreenAnswerRepository,
        private applicationRepository: ApplicationRepository
    ) {}

    async listAnswers(applicationId?: string) {
        return this.repository.list(applicationId);
    }

    async getAnswer(id: string) {
        return this.repository.getById(id);
    }

    async upsertAnswers(
        clerkUserId: string,
        answers: Array<{ application_id: string; question_id: string; answer: any }>
    ) {
        if (!answers || answers.length === 0) {
            return [];
        }

        const applicationIds = Array.from(new Set(answers.map(a => a.application_id)));
        for (const applicationId of applicationIds) {
            await this.ensureCandidateAccess(clerkUserId, applicationId);
        }

        return this.repository.upsertAnswers(answers);
    }

    async updateAnswer(
        clerkUserId: string,
        id: string,
        payload: { application_id: string; answer: any }
    ) {
        await this.ensureCandidateAccess(clerkUserId, payload.application_id);
        return this.repository.updateAnswer(id, { answer: payload.answer });
    }

    async deleteAnswer(clerkUserId: string, applicationId: string, id: string) {
        await this.ensureCandidateAccess(clerkUserId, applicationId);
        await this.repository.deleteAnswer(id);
    }

    private async ensureCandidateAccess(clerkUserId: string, applicationId: string) {
        const application = await this.applicationRepository.findApplicationById(applicationId);
        if (!application) {
            throw new Error('Application not found');
        }

        const candidate = await this.applicationRepository.findCandidateByClerkUserId(clerkUserId);
        if (!candidate || candidate.id !== application.candidate_id) {
            throw new Error('Not authorized to update answers for this application');
        }
    }
}
