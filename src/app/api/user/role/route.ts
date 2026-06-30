import { NextResponse } from "next/server";
import { isSuperAdmin } from "@/lib/auth";

export async function GET() {
  const admin = await isSuperAdmin();
  return NextResponse.json({ isSuperAdmin: admin });
}
