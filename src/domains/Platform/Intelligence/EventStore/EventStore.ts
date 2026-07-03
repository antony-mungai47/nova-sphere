export class EventStore {
  /**
   * Pushes a raw event to the data warehouse sink (e.g. Snowflake/ClickHouse)
   */
  static async pushEvent(eventName: string, payload: any): Promise<void> {
    console.log(`[EventStore] Pushing raw event ${eventName} to data lake`);
    // In production, this might publish to a Kafka topic or Kinesis stream
  }
}
