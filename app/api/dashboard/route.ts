import { NextResponse } from "next/server";
import { db } from "@/lib/supabase";
export async function GET() {
  const client = db();
  const [{ data: sales, error: salesError }, { data: expenses, error: expensesError }, { data: employees, error: peopleError }] = await Promise.all([client.from("sales").select("* ").order("submitted_at", { ascending: false }), client.from("expenses").select("*").order("submitted_at", { ascending: false }), client.from("employees").select("role,name,telegram_chat_id,telegram_user_id")]);
  if (salesError || expensesError || peopleError) return NextResponse.json({ error: salesError?.message || expensesError?.message || peopleError?.message }, { status: 500 });
  return NextResponse.json({ sales, expenses, employees });
}
