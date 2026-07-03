import { prisma } from "@/lib/prisma";
import { ParticipantRole, MessageDeliveryState, ConversationStatus } from "@prisma/client";
import { RealtimeFactory } from "@/domains/Realtime/providers/RealtimeFactory";
import { ChannelRegistry } from "@/domains/Realtime/contracts/ChannelRegistry";
import { RealtimeEvents } from "@/domains/Realtime/contracts/EventRegistry";
import { FileData } from "../Attachments/AttachmentService";

export type CreateConversationDto = {
  title?: string;
  creatorId: string;
  creatorRole: ParticipantRole;
  initialMessage?: string;
};

export class ConversationService {
  /**
   * Creates a new conversation and adds the creator as the first participant.
   * If an initial message is provided, it's created as well.
   */
  static async createConversation(data: CreateConversationDto) {
    return await prisma.$transaction(async (tx) => {
      const conversation = await tx.conversation.create({
        data: {
          title: data.title,
          status: ConversationStatus.ACTIVE,
          participants: {
            create: {
              userId: data.creatorId,
              role: data.creatorRole,
            },
          },
        },
      });

      if (data.initialMessage) {
        await tx.conversationMessage.create({
          data: {
            conversationId: conversation.id,
            senderId: data.creatorId,
            content: data.initialMessage,
            deliveryState: MessageDeliveryState.SENT,
          },
        });
      }

      return await tx.conversation.findUnique({
        where: { id: conversation.id },
        include: {
          participants: true,
          messages: {
            orderBy: { createdAt: "asc" },
          },
        },
      });
    });
  }

  /**
   * Adds a participant to an existing conversation.
   */
  static async addParticipant(conversationId: string, userId: string, role: ParticipantRole) {
    return await prisma.conversationParticipant.create({
      data: {
        conversationId,
        userId,
        role,
      },
    });
  }

  /**
   * Sends a message in a conversation.
   */
  static async sendMessage(conversationId: string, senderId: string, content: string, attachments?: FileData[]) {
    // Ensure participant exists, unless it's the AI or System
    if (senderId !== "NOVA_AI" && senderId !== "SYSTEM") {
      const participant = await prisma.conversationParticipant.findFirst({
        where: { conversationId, userId: senderId },
      });

      if (!participant) {
        throw new Error(`User ${senderId} is not a participant in conversation ${conversationId}`);
      }
    }

    const message = await prisma.conversationMessage.create({
      data: {
        conversationId,
        senderId,
        content,
        deliveryState: MessageDeliveryState.SENT,
        attachments: attachments ? {
          create: attachments.map(a => ({
            fileUrl: a.fileUrl,
            fileType: a.fileType,
            fileName: a.fileName,
            fileSize: a.fileSize,
          }))
        } : undefined
      },
      include: {
        attachments: true
      }
    });

    // Dispatch realtime event
    const engine = RealtimeFactory.getInstance();
    
    // Broadcast to the specific conversation channel
    await engine.publish(
      ChannelRegistry.privateConversation(conversationId),
      RealtimeEvents.MESSAGE_SENT,
      {
        messageId: message.id,
        conversationId: conversationId,
        senderId: senderId,
        content: content,
        timestamp: message.createdAt.toISOString(),
        attachments: message.attachments
      }
    );

    // Also broadcast to the admin live support channel so admins see it immediately if they aren't directly subscribed to this conversation yet
    await engine.publish(
      ChannelRegistry.adminLiveSupport(),
      RealtimeEvents.MESSAGE_SENT,
      {
        messageId: message.id,
        conversationId: conversationId,
        senderId: senderId,
        content: content,
        timestamp: message.createdAt.toISOString(),
        attachments: message.attachments
      }
    );

    return message;
  }

  /**
   * Updates the delivery state of a message.
   */
  static async updateMessageDeliveryState(messageId: string, state: MessageDeliveryState) {
    const message = await prisma.conversationMessage.update({
      where: { id: messageId },
      data: { deliveryState: state },
    });

    const engine = RealtimeFactory.getInstance();
    
    if (state === MessageDeliveryState.DELIVERED) {
      await engine.publish(
        ChannelRegistry.privateConversation(message.conversationId),
        RealtimeEvents.MESSAGE_DELIVERED,
        {
          messageId: message.id,
          conversationId: message.conversationId,
          timestamp: new Date().toISOString(),
        }
      );
    }

    return message;
  }

  /**
   * Marks a conversation as read up to the current time for a specific participant.
   */
  static async markAsRead(conversationId: string, userId: string) {
    await prisma.conversationParticipant.updateMany({
      where: {
        conversationId,
        userId,
      },
      data: {
        lastReadAt: new Date(),
      },
    });

    const engine = RealtimeFactory.getInstance();
    
    // We emit MESSAGE_SEEN for the latest messages. Usually, the client handles the exact message ID.
    // We can emit a general MESSAGE_SEEN for the conversation.
    await engine.publish(
      ChannelRegistry.privateConversation(conversationId),
      RealtimeEvents.MESSAGE_SEEN,
      {
        messageId: "LATEST", // Can be refined to exact message ID later
        conversationId: conversationId,
        userId: userId,
        timestamp: new Date().toISOString(),
      }
    );
    
    return true;
  }

  /**
   * Retrieves a conversation with its messages and participants.
   */
  static async getConversation(conversationId: string) {
    return await prisma.conversation.findUnique({
      where: { id: conversationId },
      include: {
        participants: true,
        messages: {
          orderBy: { createdAt: "asc" },
        },
      },
    });
  }

  /**
   * Retrieves all active conversations for a specific user.
   */
  static async getUserConversations(userId: string) {
    return await prisma.conversation.findMany({
      where: {
        participants: {
          some: { userId },
        },
      },
      include: {
        participants: true,
        messages: {
          orderBy: { createdAt: "desc" },
          take: 1, // Get latest message for preview
        },
      },
      orderBy: {
        updatedAt: "desc",
      },
    });
  }
}
