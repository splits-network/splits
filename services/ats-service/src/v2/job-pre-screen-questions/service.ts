import { JobPreScreenQuestionRepository } from './repository';

export class JobPreScreenQuestionService {
    constructor(private repository: JobPreScreenQuestionRepository) {}

    async listQuestions(jobId?: string) {
        return this.repository.list(jobId);
    }

    async getQuestion(id: string) {
        return this.repository.getById(id);
    }

    async createQuestion(payload: any) {
        return this.repository.createQuestion(payload);
    }

    async updateQuestion(id: string, payload: any) {
        return this.repository.updateQuestion(id, payload);
    }

    async deleteQuestion(id: string) {
        await this.repository.deleteQuestion(id);
    }
}
