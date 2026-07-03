import { RealtimeFactory } from "@/domains/Realtime/providers/RealtimeFactory";
import { ChannelRegistry } from "@/domains/Realtime/contracts/ChannelRegistry";
import { RealtimeEvents } from "@/domains/Realtime/contracts/EventRegistry";

export class PresenceService {
  /**
   * Dispatches a user typing event to a specific conversation.
   * Participants subscribed to this conversation's presence channel will receive it.
   */
  static async broadcastTyping(conversationId: string, userId: string, isTyping: boolean) {
    const engine = RealtimeFactory.getInstance();
    await engine.publish(
      ChannelRegistry.presenceConversation(conversationId),
      RealtimeEvents.USER_TYPING,
      {
        conversationId,
        userId,
        isTyping,
      }
    );
  }

  /**
   * Dispatches a general presence update (ONLINE/OFFLINE/AWAY/IDLE).
   * Could be broadcast to `presenceSupport` or another channel depending on context.
   */
  static async broadcastStatus(userId: string, status: "ONLINE" | "OFFLINE" | "AWAY" | "IDLE", lastSeenAt?: string) {
    const engine = RealtimeFactory.getInstance();
    
    // Broadcast to the global support presence channel, so admins can see who's online
    await engine.publish(
      ChannelRegistry.presenceSupport(),
      RealtimeEvents.PRESENCE_UPDATE,
      {
        userId,
        status,
        lastSeenAt: lastSeenAt || new Date().toISOString(),
      }
    );
  }
}
