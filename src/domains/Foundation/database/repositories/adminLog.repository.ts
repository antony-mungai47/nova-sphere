import { prisma } from "@/lib/prisma";

export const AdminLogRepository = {
  ...prisma.adminLog,
};
