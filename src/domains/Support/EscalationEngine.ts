import { prisma } from '@/lib/prisma';
import { NotificationType, NotificationPriority } from '@prisma/client';

export class EscalationEngine {
  /**
   * Escalates a conversation to a human support agent.
   */
  static async escalateToHuman(userId: string, conversationId: string, context: string, reason: string) {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new Error("User not found");

    // 1. Create the Ticket
    const ticket = await prisma.supportTicket.create({
      data: {
        userId,
        email: user.email,
        subject: `[Escalation] AI Triage Handoff - ${reason}`,
        status: 'OPEN',
        conversationId,
        messages: {
          create: {
            sender: 'CUSTOMER',
            content: context
          }
        }
      }
    });

    // 2. Notify the customer
    await prisma.notification.create({
      data: {
        userId,
        type: 'SYSTEM_ALERT',
        priority: 'HIGH',
        title: 'Support Ticket Created',
        message: `Your request has been escalated. Ticket #${ticket.id}.`,
      }
    });

    return ticket;
  }
}
