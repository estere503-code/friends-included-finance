import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/supabase";
import { validSplit } from "@/lib/calculations";
import type { Role, Split } from "@/lib/types";
import { syncSale } from "@/lib/sheets";
import { demoRole } from "@/lib/demo-role";

const salesRoles: Role[] = ["richard", "anastasia", "jean_claude"];
export async function POST(request: NextRequest) {
  const body = await request.json(); const split = body.proposed_split as Split; const role = await demoRole();
  if (!role || !salesRoles.includes(role) || !body.reference || !body.customer || !body.description || !["A", "B"].includes(body.project) || !(Number(body.amount) > 0) || !validSplit(split)) return NextResponse.json({ error: "Only a salesperson can submit a complete sale with a positive amount and 100% commission split." }, { status: 400 });
  const client = db(); const { data: employee } = await client.from("employees").select("telegram_chat_id").eq("role", role).single();
  const { data: sale, error } = await client.from("sales").insert({ reference: body.reference.trim().toUpperCase(), salesperson: role, customer: body.customer, project: body.project, description: body.description, amount: Number(body.amount), proposed_split: split, notification_chat_id: employee?.telegram_chat_id ?? null }).select().single();
  if (error) return NextResponse.json({ error: error.code === "23505" ? "This reference already exists." : error.message }, { status: 400 });
  try { await syncSale(sale); await client.from("sales").update({ sync_status: "synced" }).eq("id", sale.id); } catch { await client.from("sales").update({ sync_status: "sync_pending" }).eq("id", sale.id); }
  return NextResponse.json(sale, { status: 201 });
}
