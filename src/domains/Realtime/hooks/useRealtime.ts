import { useEffect, useState, useRef, useCallback } from 'react';
import { RealtimeFactory } from '../providers/RealtimeFactory';
import { RealtimeEventName, EventSchemas } from '../contracts/EventRegistry';
import { ConnectionState, IRealtimeEngine } from '../contracts/IRealtimeEngine';

interface UseRealtimeOptions {
  channel: string;
  event: RealtimeEventName;
  onEvent: (data: any) => void;
  bufferSize?: number; // Enable event buffering (e.g. for Auctions)
}

export function useRealtime({ channel, event, onEvent, bufferSize = 0 }: UseRealtimeOptions) {
  const [connectionState, setConnectionState] = useState<ConnectionState>('Connecting');
  const buffer = useRef<any[]>([]);
  const engineRef = useRef<IRealtimeEngine | null>(null);

  useEffect(() => {
    // 1. Get singleton instance
    const engine = RealtimeFactory.getInstance();
    engineRef.current = engine;
    
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setConnectionState(engine.getConnectionState());

    // 2. Track connection state
    const handleStateChange = (state: ConnectionState) => setConnectionState(state);
    engine.onConnectionStateChange(handleStateChange);

    // 3. Callback wrapper for buffering or direct execution
    const handleRawEvent = (data: any) => {
      // Validate schema on the client boundary
      const schema = EventSchemas[event as keyof typeof EventSchemas];
      if (schema) {
        const result = schema.safeParse(data);
        if (!result.success) {
          console.error(`[useRealtime] Invalid payload for ${event}`, result.error);
          return;
        }
      }

      if (bufferSize > 0) {
        buffer.current.push(data);
        if (buffer.current.length >= bufferSize) {
          onEvent(buffer.current);
          buffer.current = [];
        }
      } else {
        onEvent(data);
      }
    };

    // 4. Bind to channel and event
    engine.bind(channel, event, handleRawEvent);

    return () => {
      engine.unbind(channel, event, handleRawEvent);
    };
  }, [channel, event, onEvent, bufferSize]);

  // Method to manually flush the buffer if needed
  const flushBuffer = useCallback(() => {
    if (buffer.current.length > 0) {
      onEvent(buffer.current);
      buffer.current = [];
    }
  }, [onEvent]);

  // Provide a method to publish back through the same channel
  const publish = useCallback(async (data: any) => {
    if (engineRef.current) {
      await engineRef.current.publish(channel, event, data);
    }
  }, [channel, event]);

  return { connectionState, flushBuffer, publish };
}
