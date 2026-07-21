import { prisma } from "@/lib/prisma";
import { SupportClient } from "./support-client";
import { IdentityService } from "@/modules/identity/services/IdentityService";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function AdminSupportPage() {
  const authorized = await IdentityService.isAdmin();
  
  if (!authorized) {
    redirect("/");
  }

  const conversations = await prisma.conversation.findMany({
    orderBy: { updatedAt: "desc" },
    include: {
      participants: true,
      messages: {
        orderBy: { createdAt: "asc" }
      }
    }
  });

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Support Dashboard</h1>
        <p className="text-nova-silver">Manage customer support tickets and live chats.</p>
      </div>

      <SupportClient initialConversations={conversations} />
    </div>
  );
}
