import { prisma } from '@/lib/prisma';
import { BusinessRule, RuleCondition, RuleAction } from '@prisma/client';

export type RuleContext = Record<string, any>;

export class BusinessRulesEngine {
  /**
   * Evaluates all active rules for a given scope and context
   * and returns the set of applicable actions.
   */
  static async evaluateScope(scope: string, context: RuleContext): Promise<RuleAction[]> {
    const rules = await prisma.businessRule.findMany({
      where: {
        scope,
        isActive: true,
        OR: [
          { effectiveFrom: null, effectiveTo: null },
          { effectiveFrom: { lte: new Date() }, effectiveTo: { gte: new Date() } },
        ]
      },
      include: {
        conditions: true,
        actions: true,
      },
      orderBy: {
        priority: 'desc'
      }
    });

    const applicableActions: RuleAction[] = [];
    let stopProcessing = false;

    for (const rule of rules) {
      if (stopProcessing) break;
      
      // Filter by Region
      if (rule.regions.length > 0 && context['user.region']) {
        if (!rule.regions.includes(context['user.region'])) continue;
      }

      // Filter by Customer Group
      if (rule.customerGroups.length > 0 && context['user.group']) {
        if (!rule.customerGroups.includes(context['user.group'])) continue;
      }

      // Evaluate Conditions
      const isMatch = this.evaluateConditions(rule.conditions, context);

      if (isMatch) {
        applicableActions.push(...rule.actions);
        if (!rule.isStackable) {
          stopProcessing = true;
        }
      }
    }

    return applicableActions;
  }

  private static evaluateConditions(conditions: RuleCondition[], context: RuleContext): boolean {
    if (conditions.length === 0) return true; // Rule applies to everything in scope

    for (const condition of conditions) {
      const contextValue = context[condition.field];
      if (contextValue === undefined) return false;

      let targetValue;
      try {
        targetValue = JSON.parse(condition.value);
      } catch {
        targetValue = condition.value;
      }

      switch (condition.operator) {
        case 'EQUALS':
          if (contextValue !== targetValue) return false;
          break;
        case 'GREATER_THAN':
          if (contextValue <= targetValue) return false;
          break;
        case 'LESS_THAN':
          if (contextValue >= targetValue) return false;
          break;
        case 'CONTAINS':
          if (Array.isArray(contextValue) && !contextValue.includes(targetValue)) return false;
          if (typeof contextValue === 'string' && !contextValue.includes(targetValue)) return false;
          break;
        default:
          return false;
      }
    }

    return true; // All conditions matched
  }
}
