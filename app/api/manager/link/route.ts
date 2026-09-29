import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/supabase";
import { demoRole } from "@/lib/demo-role";
export async function POST(request: NextRequest) {
  const { employee_role, telegram_user_id, telegram_chat_id } = await request.json(); const role = await demoRole();
  if (role !== "svetlana") return NextResponse.json({ error: "Only Svetlana can link Telegram identities." }, { status: 403 });
  if (!["richard", "anastasia", "jean_claude", "kevin", "svetlana"].includes(employee_role) || !telegram_user_id || !telegram_chat_id) return NextResponse.json({ error: "Choose an employee and enter both Telegram IDs." }, { status: 400 });
  const { error } = await db().from("employees").update({ telegram_user_id: String(telegram_user_id), telegram_chat_id: String(telegram_chat_id) }).eq("role", employee_role);
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ ok: true });
}
