import { NextRequest, NextResponse } from "next/server";

const webhookUrl = "https://friends-included-finance-xi.vercel.app/api/telegram";

export async function POST(request: NextRequest) {
  const secret = process.env.TELEGRAM_WEBHOOK_SECRET;
  const token = process.env.TELEGRAM_BOT_TOKEN;
  if (!secret || !token || request.headers.get("x-telegram-bot-api-secret-token") !== secret) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const response = await fetch(`https://api.telegram.org/bot${token}/setWebhook`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ url: webhookUrl, secret_token: secret, allowed_updates: ["message"] }),
  });
  return NextResponse.json(await response.json(), { status: response.status });
}
