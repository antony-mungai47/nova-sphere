import { Navbar } from "./navbar";
import { getFeatureFlag } from "@/domains/Foundation/feature-flags/actions";
import { FeatureFlags } from "@/domains/Foundation/feature-flags/flags";

export async function ServerNavbar() {
  const liveNotificationsEnabled = await getFeatureFlag(FeatureFlags.LIVE_NOTIFICATIONS);

  return <Navbar liveNotificationsEnabled={liveNotificationsEnabled} />;
}
