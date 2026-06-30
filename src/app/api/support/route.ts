import { UserRepository } from "@/domains/Foundation/database/repositories/user.repository";
import { TicketMessageRepository } from "@/domains/Customer/support/repositories/ticketMessage.repository";
import { SupportTicketRepository } from "@/domains/Customer/support/repositories/supportTicket.repository";
import { NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs/server";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY || "re_mock_key_123");

export async function POST(req: Request) {
  try {
    const { message, email: providedEmail, subject, ticketId } = await req.json();
    const user = await currentUser();
    
    const email = user?.emailAddresses[0]?.emailAddress || providedEmail;
    
    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }
    
    // Find DB User if authenticated
    let dbUser = null;
    if (user) {
      dbUser = await UserRepository.findUnique({ where: { clerkId: user.id } });
    }

    let ticket;
    
    if (ticketId) {
      // Append message to existing ticket
      ticket = await SupportTicketRepository.findUnique({ where: { id: ticketId } });
      if (!ticket) return NextResponse.json({ error: "Ticket not found" }, { status: 404 });
      
      await TicketMessageRepository.create({
        data: {
          ticketId,
          sender: "CUSTOMER",
          content: message,
        }
      });
      
    } else {
      // Create new ticket
      ticket = await SupportTicketRepository.create({
        data: {
          email,
          subject: subject || "Live Support Query",
          userId: dbUser?.id || null,
          status: "OPEN",
          messages: {
            create: {
              sender: "CUSTOMER",
              content: message
            }
          }
        }
      });
      
      // Send Confirmation Email
      try {
        if (process.env.RESEND_API_KEY) {
          await resend.emails.send({
            from: 'Nova Sphere Support <support@novasphere.dev>',
            to: email,
            subject: `Support Ticket Received: ${ticket.subject}`,
            html: `
              <h2>We've received your request!</h2>
              <p>Hello,</p>
              <p>Thank you for reaching out to Nova Sphere Support. We have received your message and our team will get back to you shortly.</p>
              <p><strong>Your Message:</strong></p>
              <blockquote style="border-left: 4px solid #3B82F6; padding-left: 16px; color: #666;">
                ${message}
              </blockquote>
              <p>Ticket ID: ${ticket.id}</p>
            `
          });
        }
      } catch (emailErr) {
        console.error("Failed to send email:", emailErr);
      }
    }

    return NextResponse.json({ success: true, ticketId: ticket.id });
  } catch (error) {
    console.error("Support API Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
