import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/supabase";
import { commissionFor, money, validSplit } from "@/lib/calculations";
import { syncSale } from "@/lib/sheets";
import { telegram } from "@/lib/telegram";
import type { Split } from "@/lib/types";
import { demoRole } from "@/lib/demo-role";
export async function POST(request: NextRequest) {
  const { id, approved_split } = await request.json(); const split = approved_split as Split; const role = await demoRole();
  if (role !== "svetlana") return NextResponse.json({ error: "Only Svetlana can approve or correct sales." }, { status: 403 });
  if (!validSplit(split)) return NextResponse.json({ error: "The final commission split must total 100%." }, { status: 400 });
  const client = db(); const { data: sale } = await client.from("sales").select("*").eq("id", id).single();
  if (!sale) return NextResponse.json({ error: "Sale not found." }, { status: 404 });
  if (sale.status === "approved") return NextResponse.json({ error: "This sale is already approved; totals were not changed." }, { status: 409 });
  const commissions = commissionFor(sale.amount, split); const changed = JSON.stringify(split) !== JSON.stringify(sale.proposed_split);
  const { data: updated, error } = await client.from("sales").update({ approved_split: split, commissions, status: "approved" }).eq("id", id).select().single();
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  try { await syncSale(updated); await client.from("sales").update({ sync_status: "synced" }).eq("id", id); } catch { await client.from("sales").update({ sync_status: "sync_pending" }).eq("id", id); }
  const message = `Sale ${updated.reference} approved${changed ? " - commission split changed" : ""}. Sale ${money(updated.amount)}; total commission ${money(updated.amount * .1)}. Richard: ${split.richard}% (${money(commissions.richard)}). Anastasia: ${split.anastasia}% (${money(commissions.anastasia)}). Jean-Claude: ${split.jean_claude}% (${money(commissions.jean_claude)}).`;
  const sent = await telegram(updated.notification_chat_id, message); await client.from("sales").update({ notification_status: sent.ok ? "sent" : "failed" }).eq("id", id);
  return NextResponse.json({ ...updated, notification: sent });
}
