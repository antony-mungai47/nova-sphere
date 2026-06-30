import { prisma } from "@/lib/prisma";

export const ReviewRepository = {
  ...prisma.review,
};
