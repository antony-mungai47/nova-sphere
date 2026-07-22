import { V3Navbar } from "./v3-navbar";
import { getFeatureFlag } from "@/domains/Foundation/feature-flags/actions";
import { FeatureFlags } from "@/domains/Foundation/feature-flags/flags";
import { IdentityService } from "@/modules/identity/services/IdentityService";

export async function ServerNavbar() {
  const liveNotificationsEnabled = await getFeatureFlag(FeatureFlags.LIVE_NOTIFICATIONS);
  
  const isAdmin = await IdentityService.isAdmin();
  const isVendor = false; // VENDOR role doesn't exist in Prisma schema

  return (
    <V3Navbar 
      liveNotificationsEnabled={liveNotificationsEnabled} 
      isAdmin={isAdmin}
      isVendor={isVendor}
    />
  );
}
