import { NextResponse } from "next/server";
import { IdentityService } from "@/modules/identity/services/IdentityService";

export async function GET() {
  const admin = await IdentityService.isSuperAdmin();
  return NextResponse.json({ isSuperAdmin: admin });
}
