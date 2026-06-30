import { prisma } from "@/lib/prisma";

export const SupportTicketRepository = {
  ...prisma.supportTicket,
};
