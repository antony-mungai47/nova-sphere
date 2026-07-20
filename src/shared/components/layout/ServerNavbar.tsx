import { Navbar } from "./navbar";
import { V3Navbar } from "./v3-navbar";
import { getFeatureFlag } from "@/domains/Foundation/feature-flags/actions";
import { FeatureFlags } from "@/domains/Foundation/feature-flags/flags";
import { isAdmin as checkIsAdmin, hasRole } from "@/lib/auth";
import { UserRole } from "@prisma/client";

export async function ServerNavbar() {
  const liveNotificationsEnabled = await getFeatureFlag(FeatureFlags.LIVE_NOTIFICATIONS);
  const useV3Navigation = await getFeatureFlag(FeatureFlags.NAVIGATION_V3);
  
  const isAdmin = await checkIsAdmin();
  const isVendor = false; // VENDOR role doesn't exist in Prisma schema

  if (useV3Navigation) {
    return (
      <V3Navbar 
        liveNotificationsEnabled={liveNotificationsEnabled} 
        isAdmin={isAdmin}
        isVendor={isVendor}
      />
    );
  }

  return <Navbar liveNotificationsEnabled={liveNotificationsEnabled} />;
}
