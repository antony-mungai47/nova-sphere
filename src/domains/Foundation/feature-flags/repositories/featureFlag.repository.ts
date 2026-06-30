import { prisma } from "@/lib/prisma";
import { FeatureFlag } from "@prisma/client";

export class FeatureFlagRepository {
  static async findAll(): Promise<FeatureFlag[]> {
    return prisma.featureFlag.findMany({
      orderBy: { name: "asc" }
    });
  }

  static async findByKey(key: string): Promise<FeatureFlag | null> {
    return prisma.featureFlag.findUnique({
      where: { key }
    });
  }

  static async create(data: Omit<FeatureFlag, "id" | "createdAt" | "updatedAt">, adminId: string, ipAddress?: string): Promise<FeatureFlag> {
    return prisma.$transaction(async (tx) => {
      const flag = await tx.featureFlag.create({ data: data as any });
      
      await tx.featureFlagHistory.create({
        data: {
          featureFlagId: flag.id,
          oldValue: null as any,
          newValue: JSON.stringify(flag),
          changedBy: adminId,
          reason: "Initial Creation",
          ipAddress
        }
      });
      return flag;
    });
  }

  static async update(id: string, data: Partial<FeatureFlag>, adminId: string, reason: string, ipAddress?: string): Promise<FeatureFlag> {
    return prisma.$transaction(async (tx) => {
      const oldFlag = await tx.featureFlag.findUnique({ where: { id } });
      if (!oldFlag) throw new Error("Feature Flag not found");

      const newFlag = await tx.featureFlag.update({
        where: { id },
        data: data as any
      });

      await tx.featureFlagHistory.create({
        data: {
          featureFlagId: id,
          oldValue: JSON.stringify(oldFlag),
          newValue: JSON.stringify(newFlag),
          changedBy: adminId,
          reason,
          ipAddress
        }
      });

      return newFlag;
    });
  }

  static async delete(id: string, adminId: string, reason: string, ipAddress?: string): Promise<void> {
    return prisma.$transaction(async (tx) => {
      const oldFlag = await tx.featureFlag.findUnique({ where: { id } });
      if (oldFlag) {
        await tx.featureFlagHistory.create({
          data: {
            featureFlagId: id,
            oldValue: JSON.stringify(oldFlag),
            newValue: null as any,
            changedBy: adminId,
            reason: `Deleted: ${reason}`,
            ipAddress
          }
        });
        await tx.featureFlag.delete({ where: { id } });
      }
    });
  }
}
