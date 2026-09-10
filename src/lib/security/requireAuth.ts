import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function requireAuth() {
  const { userId, sessionClaims } = await auth();
  if (!userId) {
    throw new Error('Unauthorized');
  }
  return { userId, sessionClaims };
}

export async function requireVendorAuth() {
  const { userId } = await requireAuth();
  
  const tenantUser = await prisma.tenantUser.findFirst({
    where: { userId },
    include: { tenant: true }
  });

  if (!tenantUser) {
    throw new Error('Forbidden: Vendor Access Required');
  }

  return { 
    userId, 
    tenantId: tenantUser.tenantId, 
    role: tenantUser.role 
  };
}

export function withVendorAuth(handler: (req: Request, vendorCtx: { userId: string, tenantId: string }) => Promise<NextResponse>) {
  return async (req: Request) => {
    try {
      const vendorCtx = await requireVendorAuth();
      return await handler(req, vendorCtx);
    } catch (err: any) {
      return NextResponse.json({ error: err.message || 'Unauthorized' }, { status: err.message?.includes('Forbidden') ? 403 : 401 });
    }
  };
}
