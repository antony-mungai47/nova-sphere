import { IncidentEngine } from './IncidentEngine';

export type AlertSeverity = 'DEBUG' | 'INFO' | 'NOTICE' | 'WARN' | 'ERROR' | 'CRITICAL' | 'FATAL';

export class AlertingEngine {
  /**
   * Evaluates if a log message should trigger an alert or a full incident.
   */
  static async processAlert(severity: AlertSeverity, message: string, context: any) {
    if (severity === 'CRITICAL' || severity === 'FATAL') {
      console.error(`[AlertingEngine] ${severity} Alert! Paging NOC on-call.`);
      
      // Automatically escalate to an Incident
      await IncidentEngine.declareIncident(
        `${severity} in ${context.service}`,
        message,
        context.service,
        context.engine || 'Unknown',
        severity
      );
    } else if (severity === 'ERROR') {
      console.warn(`[AlertingEngine] ERROR threshold check...`);
      // E.g. Check if we hit >5% error rate, then escalate to CRITICAL
    }
  }
}
