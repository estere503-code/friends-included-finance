import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/supabase";
import { demoRole } from "@/lib/demo-role";
import { syncExpense, syncSale } from "@/lib/sheets";

export async function POST(request: NextRequest) {
  if (await demoRole() !== "svetlana") return NextResponse.json({ error: "Only Svetlana can retry synchronization." }, { status: 403 });
  const { type, id } = await request.json(); const client = db();
  if (type === "sale") { const { data: sale } = await client.from("sales").select("*").eq("id", id).single(); if (!sale) return NextResponse.json({ error: "Sale not found." }, { status: 404 }); try { await syncSale(sale); await client.from("sales").update({ sync_status: "synced" }).eq("id", id); return NextResponse.json({ ok: true }); } catch { return NextResponse.json({ error: "Google Sheets still could not be updated." }, { status: 502 }); } }
  if (type === "expense") { const { data: expense } = await client.from("expenses").select("*").eq("id", id).single(); if (!expense) return NextResponse.json({ error: "Expense not found." }, { status: 404 }); try { await syncExpense(expense); await client.from("expenses").update({ sync_status: "synced" }).eq("id", id); return NextResponse.json({ ok: true }); } catch { return NextResponse.json({ error: "Google Sheets still could not be updated." }, { status: 502 }); } }
  return NextResponse.json({ error: "Unknown record type." }, { status: 400 });
}
