import { inngest } from '@/lib/inngest/client';

export interface ScheduleOptions {
  cron?: string;
  delay?: string;
}

export class SchedulerEngine {
  /**
   * Dispatches an event to the scheduler to trigger at a specific time
   */
  static async scheduleEvent(eventName: string, payload: any, options: ScheduleOptions): Promise<void> {
    if (options.delay) {
      await inngest.send({
        name: eventName,
        data: {
          ...payload,
          _scheduledDelay: options.delay
        }
      });
      console.log(`[SchedulerEngine] Scheduled ${eventName} in ${options.delay}`);
    } else {
      console.warn(`[SchedulerEngine] Cron schedules should be defined in Inngest function configs, not dispatched at runtime.`);
    }
  }
}
