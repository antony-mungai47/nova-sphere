import { V3Navbar } from "./v3-navbar";
import { getFeatureFlag } from "@/domains/Foundation/feature-flags/actions";
import { FeatureFlags } from "@/domains/Foundation/feature-flags/flags";
import { isAdmin as checkIsAdmin } from "@/lib/auth";

export async function ServerNavbar() {
  const liveNotificationsEnabled = await getFeatureFlag(FeatureFlags.LIVE_NOTIFICATIONS);
  
  const isAdmin = await checkIsAdmin();
  const isVendor = false; // VENDOR role doesn't exist in Prisma schema

  return (
    <V3Navbar 
      liveNotificationsEnabled={liveNotificationsEnabled} 
      isAdmin={isAdmin}
      isVendor={isVendor}
    />
  );
}
