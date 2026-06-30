import { prisma } from "@/lib/prisma";

export const SystemLogRepository = {
  ...prisma.systemLog,
};
