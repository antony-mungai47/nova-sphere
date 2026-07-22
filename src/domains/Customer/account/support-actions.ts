"use server";

import { prisma } from "@/lib/prisma";
import { IdentityService } from "@/modules/identity/services/IdentityService";
import { revalidatePath } from "next/cache";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY || "re_mock_key_123");

export async function replyToTicket(ticketId: string, message: string) {
  const authorized = await IdentityService.isAdmin();
  if (!authorized) throw new Error("Unauthorized");

  const ticket = await prisma.supportTicket.findUnique({
    where: { id: ticketId },
  });

  if (!ticket) throw new Error("Ticket not found");

  await prisma.$transaction([
    prisma.ticketMessage.create({
      data: {
        ticketId,
        sender: "ADMIN",
        content: message
      }
    }),
    prisma.supportTicket.update({
      where: { id: ticketId },
      data: { status: "IN_PROGRESS" }
    })
  ]);

  // Send email to customer
  try {
    if (process.env.RESEND_API_KEY) {
      await resend.emails.send({
        from: 'Nova Sphere Support <support@novasphere.dev>',
        to: ticket.email,
        subject: `Re: ${ticket.subject}`,
        html: `
          <h2>Update on your ticket #${ticket.id.split('-')[0]}</h2>
          <p>Hello,</p>
          <p>An admin has replied to your ticket:</p>
          <blockquote style="border-left: 4px solid #3B82F6; padding-left: 16px; color: #666;">
            ${message}
          </blockquote>
          <p>Reply to this email or visit your account dashboard to respond.</p>
        `
      });
    }
  } catch (err) {
    console.error("Failed to send reply email:", err);
  }

  revalidatePath("/admin/support");
}

export async function resolveTicket(ticketId: string) {
  const authorized = await IdentityService.isAdmin();
  if (!authorized) throw new Error("Unauthorized");

  await prisma.supportTicket.update({
    where: { id: ticketId },
    data: { status: "RESOLVED" }
  });

  revalidatePath("/admin/support");
}
