import { NextRequest, NextResponse } from "next/server";
import { isRole } from "@/lib/demo-role";
export async function POST(request: NextRequest) {
  const { role } = await request.json();
  if (!isRole(role)) return NextResponse.json({ error: "Choose a valid demonstration role." }, { status: 400 });
  const response = NextResponse.json({ ok: true });
  response.cookies.set("friends-included-demo-role", role, { httpOnly: true, sameSite: "lax", secure: process.env.NODE_ENV === "production", path: "/" });
  return response;
}
