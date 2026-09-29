import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/supabase";
import { syncExpense } from "@/lib/sheets";
import { demoRole } from "@/lib/demo-role";
export async function POST(request: NextRequest) {
  const body = await request.json(); const role = await demoRole();
  if (role !== "kevin" || !body.reference || !body.description || !["Materials", "Travel", "Other"].includes(body.category) || !["A", "B", "overhead"].includes(body.proposed_allocation) || !(Number(body.amount) > 0)) return NextResponse.json({ error: "Only Kevin can submit a complete expense with a positive amount." }, { status: 400 });
  const client = db(); const { data: employee } = await client.from("employees").select("telegram_chat_id").eq("role", "kevin").single();
  const overhead = body.proposed_allocation === "overhead";
  const { data: expense, error } = await client.from("expenses").insert({ reference: body.reference.trim().toUpperCase(), reporter: "kevin", description: body.description, category: body.category, amount: Number(body.amount), proposed_allocation: body.proposed_allocation, final_allocation: overhead ? "overhead" : null, status: overhead ? "allocated" : "awaiting_allocation", notification_chat_id: employee?.telegram_chat_id ?? null }).select().single();
  if (error) return NextResponse.json({ error: error.code === "23505" ? "This reference already exists." : error.message }, { status: 400 });
  try { await syncExpense(expense); await client.from("expenses").update({ sync_status: "synced" }).eq("id", expense.id); } catch { await client.from("expenses").update({ sync_status: "sync_pending" }).eq("id", expense.id); }
  return NextResponse.json(expense, { status: 201 });
}
