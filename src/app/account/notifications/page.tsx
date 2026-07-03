import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { NotificationsClient } from "./notifications-client";
import { getUserNotificationPreferences } from "@/domains/Engagement/Notifications/actions";
import { ServerNavbar as Navbar } from "@/shared/components/layout/ServerNavbar";
import { Footer } from "@/shared/components/layout/footer";

export default async function NotificationsPage() {
  const { userId } = await auth();
  
  if (!userId) {
    redirect("/login");
  }

  const preferences = await getUserNotificationPreferences(userId);

  return (
    <div className="min-h-screen flex flex-col bg-slate-950">
      <Navbar />
      <main className="flex-1 container mx-auto px-6 py-24">
        <h1 className="text-3xl font-bold text-white mb-8">Notification Preferences</h1>
        <NotificationsClient initialPreferences={preferences} userId={userId} />
      </main>
      <Footer />
    </div>
  );
}
