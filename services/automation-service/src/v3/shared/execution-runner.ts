/**
 * V3 Execution Runner
 *
 * Handles creating and running automation executions triggered by
 * domain events. Extracted from the domain consumer for file size compliance.
 */

import { SupabaseClient } from '@supabase/supabase-js';
import { Logger } from '@splits-network/shared-logging';
import { DomainEvent } from '@splits-network/shared-types';
import { IEventPublisher } from '../../v2/shared/events';
import { RuleRepository } from '../rules/repository';
import { ExecutionRepository } from '../executions/repository';
import { evaluateConditions, executeAction, TriggerConditions } from '../executions/rule-engine';

export class ExecutionRunner {
  private ruleRepository: RuleRepository;
  private executionRepository: ExecutionRepository;

  constructor(
    private supabase: SupabaseClient,
    private eventPublisher: IEventPublisher | undefined,
    private logger: Logger,
  ) {
    this.ruleRepository = new RuleRepository(supabase);
    this.executionRepository = new ExecutionRepository(supabase);
  }

  async evaluateRulesForEvent(event: DomainEvent): Promise<void> {
    try {
      const { data: rules } = await this.ruleRepository.findAll({ status: 'active', limit: 100 });
      if (!rules || rules.length === 0) return;

      for (const rule of rules) {
        await this.evaluateSingleRule(rule, event);
      }
    } catch (err) {
      this.logger.error({ err, eventType: event.event_type }, 'Failed to evaluate rules');
    }
  }

  private async evaluateSingleRule(rule: any, event: DomainEvent): Promise<void> {
    try {
      const conditions = rule.trigger_conditions as TriggerConditions;
      if (!evaluateConditions(conditions, event.event_type, event.payload || {})) return;

      this.logger.info(
        { ruleId: rule.id, ruleName: rule.name, eventType: event.event_type },
        'Rule conditions matched, creating execution',
      );

      const { entityType, entityId } = extractEntity(event);
      const status = rule.requires_human_approval ? 'pending' : 'approved';

      const execution = await this.executionRepository.create({
        rule_id: rule.id,
        entity_type: entityType,
        entity_id: entityId,
        trigger_event_type: event.event_type,
        requires_approval: rule.requires_human_approval ?? false,
        status,
        trigger_data: {
          event_type: event.event_type,
          event_payload: event.payload,
          actions: rule.actions,
        },
      });

      await this.supabase.rpc('increment_rule_triggered', { rule_uuid: rule.id }).throwOnError();

      await this.eventPublisher?.publish(
        'automation.execution.created',
        { execution_id: execution.id, rule_id: rule.id, status, requires_approval: execution.requires_approval },
        'automation-service',
      );

      if (!rule.requires_human_approval) {
        await this.runExecution(execution);
      }
    } catch (err) {
      this.logger.error({ err, ruleId: rule.id, eventType: event.event_type }, 'Failed to evaluate rule');
    }
  }

  private async runExecution(execution: any): Promise<void> {
    try {
      const result = await executeAction(
        execution.trigger_data?.actions || {},
        execution.entity_type,
        execution.entity_id,
        this.logger,
      );

      if (result.success) {
        await this.executionRepository.update(execution.id, {
          status: 'executed',
          execution_result: result.output || null,
          executed_at: new Date().toISOString(),
        });
        await this.supabase.rpc('increment_rule_executed', { rule_uuid: execution.rule_id }).throwOnError();
        await this.eventPublisher?.publish(
          'automation.execution.completed',
          { execution_id: execution.id, rule_id: execution.rule_id },
          'automation-service',
        );
      } else {
        await this.executionRepository.update(execution.id, {
          status: 'failed',
          error_message: result.error || 'Unknown error',
          executed_at: new Date().toISOString(),
        });
      }
    } catch (error: any) {
      this.logger.error({ error, executionId: execution.id }, 'Execution failed');
      await this.executionRepository.update(execution.id, {
        status: 'failed',
        error_message: error.message || 'Execution error',
        executed_at: new Date().toISOString(),
      });
    }
  }
}

function extractEntity(event: DomainEvent): { entityType: string; entityId: string } {
  const payload = (event.payload as Record<string, any>) || {};

  if (payload.application_id) return { entityType: 'application', entityId: payload.application_id };
  if (payload.placement_id) return { entityType: 'placement', entityId: payload.placement_id };
  if (payload.candidate_id) return { entityType: 'candidate', entityId: payload.candidate_id };
  if (payload.recruiter_id) return { entityType: 'recruiter', entityId: payload.recruiter_id };

  return { entityType: event.event_type.split('.')[0], entityId: 'unknown' };
}
