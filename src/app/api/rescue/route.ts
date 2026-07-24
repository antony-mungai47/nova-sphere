import { NextResponse } from "next/server";
import { auth, currentUser } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const { userId } = await auth();
    const user = await currentUser();

    let message = "Rescue script executed.";

    // 1. Force Upgrade Current User to SUPER_ADMIN
    if (userId && user) {
      const email = user.emailAddresses[0]?.emailAddress || "unknown@example.com";
      const name = `${user.firstName || ''} ${user.lastName || ''}`.trim() || "Admin";

      await prisma.user.upsert({
        where: { clerkId: userId },
        update: { role: 'SUPER_ADMIN', email, name },
        create: { clerkId: userId, email, name, role: 'SUPER_ADMIN' },
      });
      message += ` Upgraded user ${email} to SUPER_ADMIN.`;
    } else {
      message += " You are not logged into Clerk, so your account was not upgraded. Please log in first.";
    }

    // 2. Force Enable All V3 Feature Flags
    const v3Flags = [
      { id: 'NAVIGATION_V3', name: 'V3 Navigation', description: 'Enable the unified V3 role-aware navigation system.' },
      { id: 'PDP_V3', name: 'V3 Product Detail Page', description: 'Enable the strict V3 PDP layout replacing legacy constraints.' },
      { id: 'THEME_V3', name: 'V3 Theme Enforcement', description: 'Enforce the strict V3 design system, stripping all legacy tokens.' },
      { id: 'MOTION_V3', name: 'V3 Motion Specifications', description: 'Enable the standardized V3 animation and transition system.' },
    ];

    for (const flag of v3Flags) {
      await prisma.featureFlag.upsert({
        where: { key: flag.id },
        update: { enabled: true },
        create: {
          id: flag.id,
          key: flag.id,
          name: flag.name,
          description: flag.description,
          enabled: true,
          category: 'V3_Launch',
          type: 'Release',
          rolloutPercentage: 100,
        },
      });
    }
    message += " V3 Feature Flags forcibly enabled.";

    // 3. Setup default StoreSettings so the UI doesn't crash
    const settings = await prisma.storeSettings.findFirst();
    if (!settings) {
      await prisma.storeSettings.create({
        data: {
          storeName: "Nova Sphere V3",
          theme: "dark",
          primaryColor: "#3B82F6",
        }
      });
      message += " StoreSettings initialized.";
    }

    return NextResponse.json({ success: true, message });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error?.message, stack: error?.stack }, { status: 500 });
  }
}
