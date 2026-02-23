import { buildPaginationResponse } from '../shared/helpers';
import { AutomationExecution, ExecutionFilters, CreateExecutionInput } from './types';
import { AutomationExecutionRepository } from './repository';
import { executeAction, ActionResult } from './rule-engine';
import { IEventPublisher } from '../shared/events';
import type { AccessContext } from '../shared/access';
import { Logger } from '@splits-network/shared-logging';

export class AutomationExecutionServiceV2 {
    constructor(
        private repository: AutomationExecutionRepository,
        private resolveAccessContext: (clerkUserId: string) => Promise<AccessContext>,
        private eventPublisher: IEventPublisher | undefined,
        private logger: Logger,
    ) {}

    private async requirePlatformAdmin(clerkUserId: string): Promise<AccessContext> {
        const access = await this.resolveAccessContext(clerkUserId);
        if (!access.isPlatformAdmin) {
            throw new Error('Platform admin permissions required');
        }
        return access;
    }

    async listExecutions(clerkUserId: string, filters: ExecutionFilters) {
        await this.requirePlatformAdmin(clerkUserId);
        const result = await this.repository.findExecutions(filters);
        return {
            data: result.data,
            pagination: buildPaginationResponse(
                filters.page ?? 1,
                filters.limit ?? 25,
                result.total,
            ),
        };
    }

    async getExecution(clerkUserId: string, id: string) {
        await this.requirePlatformAdmin(clerkUserId);
        const execution = await this.repository.findExecution(id);
        if (!execution) {
            throw new Error('Automation execution not found');
        }
        return execution;
    }

    /**
     * Create an execution record from a triggered rule.
     * If the rule doesn't require approval, execute immediately.
     */
    async createExecution(input: CreateExecutionInput): Promise<AutomationExecution> {
        const execution = await this.repository.createExecution(input);

        // Track that the rule was triggered
        await this.repository.incrementRuleCounters(input.rule_id, true, false);

        if (this.eventPublisher) {
            await this.eventPublisher.publish('automation.execution.created', {
                execution_id: execution.id,
                rule_id: execution.rule_id,
                status: execution.status,
                requires_approval: execution.requires_approval,
            });
        }

        // If no approval required, execute immediately
        if (!input.requires_approval) {
            return this.runExecution(execution);
        }

        return execution;
    }

    /**
     * Approve a pending execution and run it.
     */
    async approveExecution(clerkUserId: string, id: string): Promise<AutomationExecution> {
        await this.requirePlatformAdmin(clerkUserId);
        const execution = await this.repository.findExecution(id);
        if (!execution) throw new Error('Automation execution not found');
        if (execution.status !== 'pending') {
            throw new Error(`Cannot approve execution in '${execution.status}' status`);
        }

        const approved = await this.repository.updateExecution(id, {
            status: 'approved',
            approved_by: clerkUserId,
            approved_at: new Date().toISOString(),
        });

        if (this.eventPublisher) {
            await this.eventPublisher.publish('automation.execution.approved', {
                execution_id: id,
                approved_by: clerkUserId,
            });
        }

        return this.runExecution(approved);
    }

    /**
     * Reject a pending execution.
     */
    async rejectExecution(clerkUserId: string, id: string, reason?: string): Promise<AutomationExecution> {
        await this.requirePlatformAdmin(clerkUserId);
        const execution = await this.repository.findExecution(id);
        if (!execution) throw new Error('Automation execution not found');
        if (execution.status !== 'pending') {
            throw new Error(`Cannot reject execution in '${execution.status}' status`);
        }

        const rejected = await this.repository.updateExecution(id, {
            status: 'rejected',
            rejected_by: clerkUserId,
            rejected_at: new Date().toISOString(),
            rejection_reason: reason || null,
        });

        if (this.eventPublisher) {
            await this.eventPublisher.publish('automation.execution.rejected', {
                execution_id: id,
                rejected_by: clerkUserId,
                reason,
            });
        }

        return rejected;
    }

    /**
     * Run the actual execution logic for an approved execution.
     */
    private async runExecution(execution: AutomationExecution): Promise<AutomationExecution> {
        try {
            const result: ActionResult = await executeAction(
                execution.trigger_data?.actions || {},
                execution.entity_type,
                execution.entity_id,
                this.logger,
            );

            if (result.success) {
                const updated = await this.repository.updateExecution(execution.id, {
                    status: 'executed',
                    execution_result: result.output || null,
                    executed_at: new Date().toISOString(),
                });

                await this.repository.incrementRuleCounters(execution.rule_id, false, true);

                if (this.eventPublisher) {
                    await this.eventPublisher.publish('automation.execution.completed', {
                        execution_id: execution.id,
                        rule_id: execution.rule_id,
                    });
                }

                return updated;
            } else {
                return this.repository.updateExecution(execution.id, {
                    status: 'failed',
                    error_message: result.error || 'Unknown error',
                    executed_at: new Date().toISOString(),
                });
            }
        } catch (error: any) {
            this.logger.error({ error, executionId: execution.id }, 'Execution failed');
            return this.repository.updateExecution(execution.id, {
                status: 'failed',
                error_message: error.message || 'Execution error',
                executed_at: new Date().toISOString(),
            });
        }
    }
}
