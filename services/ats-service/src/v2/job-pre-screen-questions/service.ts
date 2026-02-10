import { JobPreScreenQuestionRepository } from './repository';
import { JobPreScreenQuestionBulkItem } from '../types';

export class JobPreScreenQuestionService {
    constructor(private repository: JobPreScreenQuestionRepository) { }

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

    /**
     * Bulk replace all pre-screen questions for a job
     * Validates input and delegates to repository for atomic operation
     */
    async bulkReplaceByJob(jobId: string, questions: JobPreScreenQuestionBulkItem[]) {
        // Validate job_id
        if (!jobId) {
            throw new Error('job_id is required');
        }

        // Validate questions array
        if (!Array.isArray(questions)) {
            throw new Error('questions must be an array');
        }

        // Validate each question object
        for (let i = 0; i < questions.length; i++) {
            const question = questions[i];
            if (!question.question) {
                throw new Error(`Question ${i + 1}: question text is required`);
            }
            if (!question.question_type) {
                throw new Error(`Question ${i + 1}: question_type is required`);
            }
            if (question.sort_order === undefined || question.sort_order === null) {
                throw new Error(`Question ${i + 1}: sort_order is required`);
            }
            // Validate options for multiple choice questions
            if (question.question_type === 'multiple_choice' && (!question.options || !Array.isArray(question.options) || question.options.length === 0)) {
                throw new Error(`Question ${i + 1}: options are required for multiple_choice questions`);
            }
        }

        return this.repository.bulkReplaceByJob(jobId, questions);
    }
}
