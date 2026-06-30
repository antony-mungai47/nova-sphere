import { prisma } from "@/lib/prisma";

export const TicketMessageRepository = {
  ...prisma.ticketMessage,
};
