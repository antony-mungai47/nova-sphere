import { prisma } from "@/lib/prisma";

export const StoreSettingsRepository = {
  ...prisma.storeSettings,
};
