export async function telegram(chatId: string | null, text: string) {
  if (!chatId) return { ok: false, reason: "No Telegram recipient linked" };
  const response = await fetch(`https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/sendMessage`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ chat_id: chatId, text }) });
  if (!response.ok) return { ok: false, reason: await response.text() };
  return { ok: true };
}
