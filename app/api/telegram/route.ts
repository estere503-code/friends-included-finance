import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/supabase";
import { validSplit } from "@/lib/calculations";
import { syncExpense, syncSale } from "@/lib/sheets";
import { telegram } from "@/lib/telegram";


const help = "Friends Included commands:\n/sale REF|Customer|A or B|Description|Amount|Richard%|Anastasia%|Jean-Claude%\n/expense REF|Description|Materials, Travel, or Other|Amount|A, B, or overhead\nYour Telegram identity must first be linked by Svetlana on the website.";
export async function POST(request: NextRequest) {
  const webhookSecret = process.env.TELEGRAM_WEBHOOK_SECRET;
  if (webhookSecret && request.headers.get("x-telegram-bot-api-secret-token") !== webhookSecret) return NextResponse.json({ error: "Unauthorized webhook" }, { status: 401 });
  const update = await request.json(); const updateId = Number(update?.update_id); const message = update.message; const chatId = String(message?.chat?.id ?? ""); const userId = String(message?.from?.id ?? ""); const text = String(message?.text ?? "").trim();
  if (!chatId || !userId) return NextResponse.json({ ok: true });
  const client = db();
  if (Number.isSafeInteger(updateId) && updateId >= 0) {
    const { error: receiptError } = await client.from("telegram_updates").insert({ update_id: updateId });
    if (receiptError) {
      if (receiptError.code === "23505") return NextResponse.json({ ok: true, duplicate: true });
      return NextResponse.json({ error: "Could not record Telegram update." }, { status: 503 });
    }
  }
  if (text === "/start" || text === "/help") { await telegram(chatId, help); return NextResponse.json({ ok: true }); }
  if (text === "/whoami") { await telegram(chatId, `Telegram user ID: ${userId}; chat ID: ${chatId}`); return NextResponse.json({ ok: true }); }
  const { data: employee } = await client.from("employees").select("role").eq("telegram_user_id", userId).single();
  if (!employee) { await telegram(chatId, "Your Telegram account is not linked to a fictional employee. Ask Svetlana to link it in Manager controls."); return NextResponse.json({ ok: true }); }
  const [command, raw = ""] = text.split(/\s+/, 2); const p = raw.split("|").map((v: string) => v.trim());
  if (command === "/sale") {
    const [reference, customer, project, description, rawAmount, richard, anastasia, jeanClaude] = p; const amount = Number(rawAmount); const split = { richard: Number(richard), anastasia: Number(anastasia), jean_claude: Number(jeanClaude) };
    if (!["richard", "anastasia", "jean_claude"].includes(employee.role) || !reference || !customer || !["A", "B"].includes(project) || !description || !(amount > 0) || !validSplit(split)) { await telegram(chatId, "I could not save that sale. Use /help and check your role, positive amount, and 100% split."); return NextResponse.json({ ok: true }); }
    const { data: sale, error } = await client.from("sales").insert({ reference: reference.toUpperCase(), salesperson: employee.role, customer, project, description, amount, proposed_split: split, notification_chat_id: chatId }).select().single();
    if (error) { await telegram(chatId, error.code === "23505" ? "That reference already exists." : "I could not save the sale."); return NextResponse.json({ ok: true }); }
    try { await syncSale(sale); await client.from("sales").update({ sync_status: "synced" }).eq("id", sale.id); } catch { await client.from("sales").update({ sync_status: "sync_pending" }).eq("id", sale.id); }
    await telegram(chatId, `Sale ${sale.reference} recorded: €${amount.toFixed(2)}, Project ${project}, Pending approval.`); return NextResponse.json({ ok: true });
  }
  if (command === "/expense") {
    const [reference, description, category, rawAmount, allocation] = p; const amount = Number(rawAmount); const overhead = allocation === "overhead";
    if (!["kevin", "expenses"].includes(employee.role) || !reference || !description || !["Materials", "Travel", "Other"].includes(category) || !["A", "B", "overhead"].includes(allocation) || !(amount > 0)) { await telegram(chatId, "I could not save that expense. Use /help and check your role and all values."); return NextResponse.json({ ok: true }); }
    const { data: expense, error } = await client.from("expenses").insert({ reference: reference.toUpperCase(), reporter: "kevin", description, category, amount, proposed_allocation: allocation, final_allocation: overhead ? "overhead" : null, status: overhead ? "allocated" : "awaiting_allocation", notification_chat_id: chatId }).select().single();
    if (error) { await telegram(chatId, error.code === "23505" ? "That reference already exists." : "I could not save the expense."); return NextResponse.json({ ok: true }); }
    try { await syncExpense(expense); await client.from("expenses").update({ sync_status: "synced" }).eq("id", expense.id); } catch { await client.from("expenses").update({ sync_status: "sync_pending" }).eq("id", expense.id); }
    await telegram(chatId, `Expense ${expense.reference} recorded: €${amount.toFixed(2)}, proposed allocation ${allocation}, ${overhead ? "allocated" : "Awaiting allocation"}.`); return NextResponse.json({ ok: true });
  }
  await telegram(chatId, help); return NextResponse.json({ ok: true });
}

