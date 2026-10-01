import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/supabase";
import { demoRole } from "@/lib/demo-role";

export async function POST(request: NextRequest) {
  const { employee_role, telegram_user_id, telegram_chat_id } = await request.json();
  const role = await demoRole();
  if (role !== "svetlana") return NextResponse.json({ error: "Only Svetlana can link Telegram identities." }, { status: 403 });
  if (!["richard", "anastasia", "jean_claude", "kevin", "svetlana"].includes(employee_role) || !telegram_user_id || !telegram_chat_id) return NextResponse.json({ error: "Choose an employee and enter both Telegram IDs." }, { status: 400 });

  const client = db();
  const telegramUserId = String(telegram_user_id);
  const telegramChatId = String(telegram_chat_id);
  const { error: releaseError } = await client.from("employees").update({ telegram_user_id: null, telegram_chat_id: null }).eq("telegram_user_id", telegramUserId).neq("role", employee_role);
  if (releaseError) return NextResponse.json({ error: releaseError.message }, { status: 400 });
  const { error } = await client.from("employees").update({ telegram_user_id: telegramUserId, telegram_chat_id: telegramChatId }).eq("role", employee_role);
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ ok: true });
}
