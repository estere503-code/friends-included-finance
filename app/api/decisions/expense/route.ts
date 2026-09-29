import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/supabase";
import { money } from "@/lib/calculations";
import { syncExpense } from "@/lib/sheets";
import { telegram } from "@/lib/telegram";
import { demoRole } from "@/lib/demo-role";
export async function POST(request: NextRequest) {
  const { id, final_allocation } = await request.json(); const role = await demoRole();
  if (role !== "svetlana") return NextResponse.json({ error: "Only Svetlana can allocate or correct expenses." }, { status: 403 });
  if (!["A", "B", "overhead"].includes(final_allocation)) return NextResponse.json({ error: "Choose a final allocation." }, { status: 400 });
  const client = db(); const { data: expense } = await client.from("expenses").select("*").eq("id", id).single();
  if (!expense) return NextResponse.json({ error: "Expense not found." }, { status: 404 });
  if (expense.status === "allocated") return NextResponse.json({ error: "This expense is already allocated; totals were not changed." }, { status: 409 });
  const { data: updated, error } = await client.from("expenses").update({ final_allocation, status: "allocated" }).eq("id", id).select().single();
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  try { await syncExpense(updated); await client.from("expenses").update({ sync_status: "synced" }).eq("id", id); } catch { await client.from("expenses").update({ sync_status: "sync_pending" }).eq("id", id); }
  const changed = expense.proposed_allocation !== final_allocation;
  const message = `Expense ${updated.reference}${changed ? " - allocation changed" : " allocated"}. ${money(updated.amount)}: ${updated.description}. Proposed: ${expense.proposed_allocation}. Approved: ${final_allocation}.`;
  const sent = await telegram(updated.notification_chat_id, message); await client.from("expenses").update({ notification_status: sent.ok ? "sent" : "failed" }).eq("id", id);
  return NextResponse.json({ ...updated, notification: sent });
}
